import crypto from 'crypto';
import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { Topic } from '../models/Topic.js';
import { Program } from '../models/Program.js';
import { Board } from '../models/Board.js';
import { generateSlug } from '../utils/slug.js';

/**
 * Compute SHA256 hash for content version detection
 */
function computeHash(text) {
  return crypto.createHash('sha256').update(text || '').digest('hex');
}

/**
 * Normalize key terms array
 */
function normalizeKeyTerms(value) {
  if (!Array.isArray(value)) return [];
  return value
    .map((term) => {
      if (typeof term === 'string') {
        return { term, definition: '' };
      }
      if (term && typeof term === 'object') {
        return {
          term: String(term.term || term.name || term.label || '').trim(),
          definition: String(term.definition || term.explanation || '').trim(),
        };
      }
      return null;
    })
    .filter((item) => item && item.term);
}

function resolveBoardShortCode(boardName) {
  const normalized = String(boardName || '')
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, ' ');

  if (!normalized) return 'PUB';

  const punjabAliases = [
    'pub',
    'pctb',
    'pb',
    'punjab',
    'punjab board',
    'punjab curriculum and textbook board',
    'punjab curriculum and textbook board pctb',
    'punjab curriculum and textboard board pctb',
  ];

  if (punjabAliases.some((alias) => normalized === alias || normalized.includes(alias))) {
    return 'PUB';
  }

  return String(boardName)
    .trim()
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 5);
}

function resolveProgramSlug(bookMetadata) {
  const explicitSlug = generateSlug(bookMetadata?.program_slug || '');
  if (explicitSlug) return explicitSlug;

  const subject = String(bookMetadata?.subject || '').trim().toLowerCase();
  if (subject) {
    if (subject.includes('quran') || subject.includes('tarjuma') || subject.includes('islam')) {
      return 'diniyat';
    }
    if (subject.includes('urdu') || subject.includes('english') || subject.includes('language')) {
      return 'languages';
    }
    if (['physics', 'chemistry', 'biology', 'mathematics', 'math', 'science'].some((item) => subject.includes(item))) {
      return 'science';
    }
  }

  const gradeLevel = String(bookMetadata?.grade_level || '').trim();
  if (gradeLevel) {
    const gradeSlug = generateSlug(gradeLevel);
    if (gradeSlug) return gradeSlug;
  }

  const grade = String(bookMetadata?.grade || '').trim();
  if (grade) {
    const gradeSlug = generateSlug(grade);
    if (gradeSlug) return gradeSlug;
  }

  return '';
}

/**
 * Ingest a complete book with chapters and topics - full pipeline matching source monorepo
 * @param {Object} deepseekJson - The ingested JSON from AI processing
 * @param {string} adminUserId - ID of the admin performing ingestion
 */
export async function ingestBook(deepseekJson, adminUserId) {
  const log = [];
  const { book_metadata } = deepseekJson;
  
  // FIX: Handle both singular 'chapter' object and plural 'chapters' array formats
  let rawChaptersArray = [];
  if (deepseekJson.chapters && Array.isArray(deepseekJson.chapters)) {
    rawChaptersArray = deepseekJson.chapters;
    console.log(`[INGESTION DETECTOR] Identified ${rawChaptersArray.length} chapters from 'chapters' array.`);
  } else if (deepseekJson.chapter && typeof deepseekJson.chapter === 'object') {
    // Convert singular document layout block into an iterable array wrapper
    rawChaptersArray = [deepseekJson.chapter];
    console.log(`[INGESTION DETECTOR] Identified 1 chapter from singular 'chapter' object.`);
  } else {
    console.warn('[INGESTION WARNING] No chapter data found in ingestion payload.');
  }
  
  const topics = deepseekJson.topics || [];
  const programSlug = resolveProgramSlug(book_metadata);

  try {
    // STEP 1: Upsert Program
    if (!programSlug) {
      throw new Error('Unable to resolve program slug from book metadata');
    }

    let program = await Program.findOne({ slug: programSlug });
    if (!program) {
      program = await Program.create({
        name: String(book_metadata.grade_level || book_metadata.program_name || programSlug).trim(),
        slug: programSlug,
        program_type: 'academic',
        created_by: adminUserId,
      });
      log.push(`✓ Created Program: ${program.name}`);
    }

    // STEP 2: Upsert Board
    const boardShortCode = resolveBoardShortCode(book_metadata.board);
    let board = await Board.findOne({
      $or: [
        { name: book_metadata.board },
        { short_code: boardShortCode },
        { slug: generateSlug(book_metadata.board) },
      ],
    });
    if (!board) {
      board = await Board.create({
        name: book_metadata.board,
        slug: generateSlug(book_metadata.board),
        short_code: boardShortCode,
      });
      log.push(`✓ Created Board: ${board.name}`);
    } else if (board.short_code !== boardShortCode && boardShortCode === 'PUB') {
      board.short_code = boardShortCode;
      board.slug = generateSlug(book_metadata.board);
      await board.save();
      log.push(`✓ Normalized Board short code to: ${board.short_code}`);
    }

    // STEP 3: Upsert Book — handle version control
    // Auto-generate slugs if not provided in metadata
    const subjectSlug = String(book_metadata.subject_slug || book_metadata.subject || '').toLowerCase().trim();
    const bookSlug = String(
      book_metadata.slug ||
      `${book_metadata.subject}-${book_metadata.grade_level}-${board.short_code}-${book_metadata.edition_year}`
    ).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    // Find any existing current edition for this subject+program+board
    const existingCurrentBook = await Book.findOne({
      subject_slug: subjectSlug,
      program_id: program._id,
      board_id: board._id,
      is_current_edition: true,
    });

    const gradeVal = book_metadata.grade_level ? String(book_metadata.grade_level).replace(/grade\s*/i, '').trim() : undefined;
    const boardVal = board ? board.name : (book_metadata.board || undefined);

    let book;
    if (existingCurrentBook && existingCurrentBook.edition_year === book_metadata.edition_year) {
      // Same edition — just update
      book = existingCurrentBook;
      book.board = boardVal;
      book.grade = String(gradeVal || '').toLowerCase().trim();
      book.slug = book.slug || bookSlug;
      book.subject_slug = book.subject_slug || subjectSlug;
      book.subject = book.subject || book_metadata.subject;
      book.program_id = book.program_id || program._id;
      book.board_id = book.board_id || board._id;
      book.edition_year = book.edition_year || book_metadata.edition_year;
      book.metadata = {
        ...(book.metadata || {}),
        grade_level: book_metadata.grade_level,
      };
      book.is_live = true;
      await book.save();
      log.push(`✓ Updating existing book: ${book.title}`);
    } else if (existingCurrentBook) {
      // New edition — archive the old one
      await Book.findByIdAndUpdate(existingCurrentBook._id, { is_current_edition: false });
      book = await Book.create({
        title: book_metadata.title,
        slug: bookSlug,
        subject: book_metadata.subject,
        subject_slug: subjectSlug,
        board: boardVal,
        grade: String(gradeVal || '').toLowerCase().trim(),
        program_id: program._id,
        board_id: board._id,
        edition_year: book_metadata.edition_year,
        edition_label: `${book_metadata.edition_year} Edition`,
        is_current_edition: true,
        is_live: true,
        previous_edition_id: existingCurrentBook._id,
        metadata: {
          authors: book_metadata.authors,
          publisher: book_metadata.publisher,
          language: book_metadata.language,
          script_direction: book_metadata.script_direction,
          grade_level: book_metadata.grade_level,
        },
        ingestion_status: 'complete',
        created_by: adminUserId,
      });
      log.push(`✓ Created new edition: ${book.edition_year}. Previous edition archived.`);
    } else {
      // Brand new book
      book = await Book.create({
        title: book_metadata.title,
        slug: bookSlug,
        subject: book_metadata.subject,
        subject_slug: subjectSlug,
        board: boardVal,
        grade: String(gradeVal || '').toLowerCase().trim(),
        program_id: program._id,
        board_id: board._id,
        edition_year: book_metadata.edition_year,
        edition_label: `${book_metadata.edition_year} Edition`,
        is_current_edition: true,
        is_live: true,
        metadata: {
          authors: book_metadata.authors,
          publisher: book_metadata.publisher,
          language: book_metadata.language,
          script_direction: book_metadata.script_direction,
          grade_level: book_metadata.grade_level,
        },
        ingestion_status: 'complete',
        created_by: adminUserId,
      });
      log.push(`✓ Created new book: ${book.title}`);
    }

    // STEP 4: Upsert Chapters (handle both singular and plural formats)
    const createdChapters = [];
    let lastProcessedChapter = null; // Track the last chapter for topic assignment
    
    for (const chapter of rawChaptersArray) {
      let chapterDoc = await Chapter.findOne({
        book_id: book._id,
        chapter_number: chapter.chapter_number,
      });

      if (!chapterDoc) {
        chapterDoc = new Chapter({
          title: chapter.title,
          slug: chapter.slug,
          chapter_number: chapter.chapter_number,
          chapter_number_display: chapter.chapter_number_display || `Chapter ${chapter.chapter_number}`,
          book_id: book._id,
          book_slug: String(book.slug).toLowerCase().trim(),
          subject_slug: String(book.subject_slug).toLowerCase().trim(),
          program_id: program._id,
          board_id: board._id,
          student_learning_outcomes: chapter.student_learning_outcomes,
          summary: chapter.chapter_summary,
          page_start: chapter.page_start,
          page_end: chapter.page_end,
          seo: chapter.seo,
          display_order: chapter.chapter_number,
          is_live: true,
        });
      } else {
        // Update chapter metadata
        chapterDoc.title = chapter.title;
        chapterDoc.book_slug = String(book.slug).toLowerCase().trim();
        chapterDoc.subject_slug = String(book.subject_slug).toLowerCase().trim();
        chapterDoc.student_learning_outcomes = chapter.student_learning_outcomes;
        chapterDoc.summary = chapter.chapter_summary;
        chapterDoc.seo = chapter.seo;
        chapterDoc.is_live = true;
      }

      await chapterDoc.save();
      createdChapters.push(chapterDoc);
      lastProcessedChapter = chapterDoc; // Store reference for later use
      log.push(`✓ ${!chapterDoc.isNew ? 'Updated' : 'Created'} Chapter ${chapter.chapter_number}: ${chapter.title}`);
    }
    
    console.log(`[INGESTION SUCCESS] Successfully populated ${createdChapters.length} chapters inside MongoDB.`);

    // STEP 5: Upsert Topics with version diff detection
    const topicIds = [];
    let newCount = 0, modifiedCount = 0, unchangedCount = 0;

    for (const topicData of topics) {
      const contentHash = computeHash(topicData.raw_text);

      // Find previous version of this topic (by slug + chapter)
      let previousVersionId = null;
      let versionStatus = 'new';

      if (book.previous_edition_id && lastProcessedChapter) {
        const prevChapter = await Chapter.findOne({
          book_id: book.previous_edition_id,
          chapter_number: lastProcessedChapter.chapter_number,
        });
        if (prevChapter) {
          const prevTopic = await Topic.findOne({
            chapter_id: prevChapter._id,
            slug: topicData.slug,
          });
          if (prevTopic) {
            previousVersionId = prevTopic._id;
            versionStatus = prevTopic.content_hash === contentHash ? 'unchanged' : 'modified';
          }
        }
      }

      // Find existing topic in current chapter (for re-ingestion)
      // Use lastProcessedChapter if available, otherwise fallback lookup
      const currentChapterId = lastProcessedChapter?._id || (await Chapter.findOne({ book_id: book._id, chapter_number: lastProcessedChapter?.chapter_number }))?._id;
      
      let topicDoc = await Topic.findOne({
        chapter_id: currentChapterId,
        slug: topicData.slug,
      });

      const topicPayload = {
        title: topicData.title,
        title_urdu: topicData.title_urdu || '',
        slug: topicData.slug,
        topic_number: topicData.topic_number,
        display_order: topicData.display_order,
        program_id: program._id,
        board_id: board._id,
        program_name: program.name,
        subject_name: book_metadata.subject,
        chapter_id: currentChapterId,
        chapter_number: lastProcessedChapter?.chapter_number || 0,
        chapter_title: lastProcessedChapter?.title || '',
        raw_text: topicData.raw_text,
        clean_html: topicData.clean_html,
        content_blocks: topicData.content_blocks,
        formulas: topicData.formulas || [],
        key_terms: normalizeKeyTerms(topicData.key_terms || []),
        book_mcqs: topicData.book_mcqs || [],
        book_short_questions: topicData.book_short_questions || [],
        book_problems: topicData.book_problems || [],
        keywords: topicData.keywords || [],
        difficulty: topicData.difficulty || 'medium',
        estimated_read_time: topicData.estimated_read_time || 3,
        edition_year: book_metadata.edition_year,
        version_status: versionStatus,
        previous_version_id: previousVersionId,
        content_hash: contentHash,
        seo: topicData.seo || {},
        is_live: true,
        workflow_status: 'published',
        created_by: adminUserId,
      };

      // Handle Quran Reference if present
      if (topicData.quran_reference) {
        const { surah, ayah } = topicData.quran_reference;
        if (surah < 1 || surah > 114) {
          log.push(`⚠ Warning: Invalid Surah ${surah} in topic ${topicData.slug}. Setting to null.`);
          topicPayload.quran_reference = null;
        } else if (ayah < 1) {
          log.push(`⚠ Warning: Invalid Ayah ${ayah} in topic ${topicData.slug}. Setting to null.`);
          topicPayload.quran_reference = null;
        } else {
          topicPayload.quran_reference = topicData.quran_reference;
          topicPayload.quran_textbook_translation = topicData.quran_textbook_translation || null;
          topicPayload.quran_textbook_tafsir = topicData.quran_textbook_tafsir || null;

          // Validate word alignments
          if (Array.isArray(topicData.quran_word_alignments)) {
            topicPayload.quran_word_alignments = topicData.quran_word_alignments.filter(wa => {
              if (!Number.isInteger(wa.position) || wa.position < 1) {
                log.push(`⚠ Warning: Invalid word position ${wa.position} in topic ${topicData.slug}. Skipping alignment.`);
                return false;
              }
              return true;
            });
          }
        }
      }

      if (topicDoc) {
        Object.assign(topicDoc, topicPayload);
        await topicDoc.save();
        if (versionStatus === 'modified') modifiedCount++;
        else unchangedCount++;
      } else {
        topicDoc = await Topic.create({ ...topicPayload, book_id: book._id });
        newCount++;
      }

      topicIds.push(topicDoc._id);
    }

    // STEP 6: Update chapter with topic IDs and save
    if (lastProcessedChapter) {
      lastProcessedChapter.topic_ids = topicIds;
      lastProcessedChapter.total_topics = topicIds.length;
      await lastProcessedChapter.save();
    }

    // Update book counters
    const totalTopics = await Topic.countDocuments({ book_id: book._id });
    const totalChapters = await Chapter.countDocuments({ book_id: book._id });
    await Book.findByIdAndUpdate(book._id, {
      total_topics: totalTopics,
      total_chapters: totalChapters,
      ingestion_status: 'complete',
      ingestion_log: log,
    });

    log.push(`✓ Chapter ingested: ${newCount} new, ${modifiedCount} modified, ${unchangedCount} unchanged topics.`);
    return {
      success: true,
      log,
      bookId: book._id,
      chapterId: lastProcessedChapter?._id,
      boardShortCode: board.short_code,
      grade: gradeVal,
      programSlug: program.slug,
      subjectSlug: book.subject_slug,
      chapterNumber: lastProcessedChapter?.chapter_number || 0,
      firstTopicSlug: topics[0]?.slug
    };

  } catch (err) {
    log.push(`✗ FATAL ERROR: ${err.message}`);
    return { success: false, log, error: err.message };
  }
}

/**
 * Simple ingestion wrapper for basic book data
 */
export async function ingestBookSimple(bookData) {
  const { title, subject, classLevel, board, program, chapters, ...rest } = bookData;

  // Find or create book
  const slug = generateSlug(title);
  let book = await Book.findOne({ slug });

  if (!book) {
    book = await Book.create({
      title,
      slug,
      subject,
      classLevel,
      board,
      program,
      ...rest
    });
  } else {
    // Update existing book
    await Book.findByIdAndUpdate(book._id, {
      subject,
      classLevel,
      board,
      program,
      ...rest
    });
  }

  // Process chapters
  if (chapters && Array.isArray(chapters)) {
    for (const chapterData of chapters) {
      await ingestChapterSimple(book._id, chapterData);
    }
  }

  return book;
}

/**
 * Simple chapter ingestion
 */
export async function ingestChapterSimple(bookId, chapterData) {
  const { title, chapterNumber, topics, ...rest } = chapterData;

  const chapter = await Chapter.findOneAndUpdate(
    { book: bookId, chapterNumber },
    {
      book: bookId,
      title,
      chapterNumber,
      slug: generateSlug(title),
      ...rest
    },
    { upsert: true, new: true }
  );

  // Process topics
  if (topics && Array.isArray(topics)) {
    for (const topicData of topics) {
      await ingestTopicSimple(bookId, chapter._id, topicData);
    }
  }

  return chapter;
}

/**
 * Simple topic ingestion
 */
export async function ingestTopicSimple(bookId, chapterId, topicData) {
  const { title, topicNumber, content, ...rest } = topicData;

  const slug = generateSlug(title);

  const topic = await Topic.findOneAndUpdate(
    { book: bookId, chapter: chapterId, slug },
    {
      book: bookId,
      chapter: chapterId,
      title,
      slug,
      topicNumber: topicNumber || 0,
      content: content || '',
      ...rest
    },
    { upsert: true, new: true }
  );

  return topic;
}

/**
 * Validate book ingestion data
 */
export function validateIngestionData(data) {
  if (!data) return { isValid: false, errors: ['Request body is empty'] };
  const errors = [];
  if (!data.book_metadata) errors.push('Missing book_metadata');
  else {
    const { title, subject, grade_level, board, edition_year } = data.book_metadata;
    if (!String(title || '').trim()) errors.push('Missing book_metadata.title');
    if (!String(subject || '').trim()) errors.push('Missing book_metadata.subject');
    if (!String(grade_level || '').trim()) errors.push('Missing book_metadata.grade_level');
    if (!String(board || '').trim()) errors.push('Missing book_metadata.board');
    if (!String(edition_year || '').trim()) errors.push('Missing book_metadata.edition_year');
    // Note: slug and subject_slug are auto-generated from title/subject, so they don't need to be provided
  }
  if (!data.chapter) errors.push('Missing chapter');
  else {
    const { title, slug, chapter_number } = data.chapter;
    if (!String(title || '').trim()) errors.push('Missing chapter.title');
    // chapter.slug is optional - will be auto-generated if not provided
    if (!chapter_number && chapter_number !== 0) errors.push('Missing chapter.chapter_number');
  }
  if (!Array.isArray(data.topics) || data.topics.length === 0) {
    errors.push('Missing or empty topics array');
  }
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get ingestion stats
 */
export async function getIngestionStats() {
  const [bookCount, chapterCount, topicCount] = await Promise.all([
    Book.countDocuments(),
    Chapter.countDocuments(),
    Topic.countDocuments()
  ]);

  return {
    totalBooks: bookCount,
    totalChapters: chapterCount,
    totalTopics: topicCount
  };
}
