import { Chapter } from '../models/Chapter.js';
import { Topic } from '../models/Topic.js';
import { Book } from '../models/Book.js';
import { generateSlug, generateUniqueSlug } from '../utils/slug.js';

/**
 * Get chapter by ID with full population
 */
export const getChapterById = async (chapterId) => {
  const chapter = await Chapter.findById(chapterId)
    .populate('book_id', 'title slug edition metadata')
    .populate('program_id', 'name slug subject')
    .populate('board_id', 'name slug location');

  if (!chapter) return null;

  return chapter.toObject();
};

/**
 * Get chapter by slug and bookId
 */
export const getChapterBySlug = async (slug, bookId) => {
  const chapter = await Chapter.findOne({
    slug,
    book_id: bookId
  })
    .populate('book_id', 'title slug edition metadata')
    .populate('program_id', 'name slug subject')
    .populate('board_id', 'name slug location');

  if (!chapter) return null;

  return chapter.toObject();
};

/**
 * Get all chapters for a book, sorted by display_order and chapter_number
 * Response matches DeepSeek schema exactly with student_learning_outcomes, chapter_summary
 * Implements dual-lookup strategy: first by book_id, then falls back to subject_slug/book_slug
 */
export const getChaptersByBook = async (bookId) => {
  console.log(`[CHAPTER SERVICE] Fetching chapters for bookId: ${bookId}`);
  
  // Step A: Attempt standard lookup by Book Object ID
  let chapters = await Chapter.find({ book_id: bookId })
    .sort({ display_order: 1, chapter_number: 1 })
    .lean();

  console.log(`[CHAPTER SERVICE] Direct lookup found ${chapters.length} chapters`);

  // Step B: Fallback Lookup if the array comes back empty
  if (!chapters || chapters.length === 0) {
    try {
      // Locate the parent book entry first to pull its text subject_slug
      const parentBook = await Book.findById(bookId).select('subject_slug slug title subject').lean();
      
      if (parentBook && (parentBook.subject_slug || parentBook.slug)) {
        console.log(`[CHAPTER FALLBACK] Routing search for Book Slug: ${parentBook.slug}, Subject Slug: ${parentBook.subject_slug}`);
        
        // Cross-reference chapters using exact match OR case-insensitive regex
        const fallbackChapters = await Chapter.find({
          $or: [
            { book_slug: parentBook.slug },
            { book_slug: new RegExp(`^${parentBook.subject_slug}`, 'i') },
            { subject_slug: new RegExp(`^${parentBook.subject_slug}$`, 'i') },
            { subject_slug: new RegExp(`^${parentBook.subject}$`, 'i') }
          ]
        })
          .sort({ display_order: 1, chapter_number: 1 })
          .lean();
        
        if (fallbackChapters && fallbackChapters.length > 0) {
          console.log(`[CHAPTER FALLBACK] Found ${fallbackChapters.length} chapters via fallback query`);
          chapters = fallbackChapters;
        } else {
          console.log(`[CHAPTER FALLBACK] No chapters found via fallback query`);
        }
      }
    } catch (err) {
      console.error('[CHAPTER SERVICE] Fallback lookup failed:', err.message);
    }
  }
  
  console.log(`[CHAPTER SERVICE] Total chapters to return: ${chapters.length}`);

  // Ensure all DeepSeek schema fields are present
  return chapters.map(chapter => ({
    _id: chapter._id,
    chapter_number: chapter.chapter_number,
    chapter_number_display: chapter.chapter_number_display || `Chapter ${chapter.chapter_number}`,
    title: chapter.title,
    slug: chapter.slug,
    page_start: chapter.page_start,
    page_end: chapter.page_end,
    student_learning_outcomes: chapter.student_learning_outcomes || [],
    chapter_summary: chapter.summary || '',
    display_order: chapter.display_order || 0,
    seo: chapter.seo || {
      meta_title: '',
      meta_description: '',
      keywords: []
    },
    total_topics: chapter.total_topics || 0,
    is_live: chapter.is_live || false
  }));
};

/**
 * Get all topics for a chapter, sorted by display_order
 * display_order: 0 = intro, 1-N = regular topics, 999 = exercises
 */
export const getChapterTopics = async (chapterId) => {
  const topics = await Topic.find({ chapter_id: chapterId })
    .sort({ display_order: 1 })
    .select('-__v')
    .lean();

  // Ensure content_blocks are rendered properly
  return topics.map(topic => {
    const topicObj = topic.toObject ? topic.toObject() : { ...topic };
    
    // Ensure all DeepSeek schema fields exist
    return {
      _id: topicObj._id,
      title: topicObj.title,
      title_urdu: topicObj.title_urdu || '',
      slug: topicObj.slug,
      topic_number: topicObj.topic_number || '',
      display_order: topicObj.display_order,
      difficulty: topicObj.difficulty || 'medium',
      estimated_read_time: topicObj.estimated_read_time || 3,
      edition_year: topicObj.edition_year,
      raw_text: topicObj.raw_text || '',
      clean_html: topicObj.clean_html || '',
      content_blocks: topicObj.content_blocks || [],
      formulas: topicObj.formulas || [],
      key_terms: topicObj.key_terms || [],
      book_mcqs: topicObj.book_mcqs || [],
      book_short_questions: topicObj.book_short_questions || [],
      book_problems: topicObj.book_problems || [],
      keywords: topicObj.keywords || [],
      quran_reference: topicObj.quran_reference || null,
      quran_word_alignments: topicObj.quran_word_alignments || [],
      quran_textbook_translation: topicObj.quran_textbook_translation || '',
      quran_textbook_tafsir: topicObj.quran_textbook_tafsir || '',
      seo: topicObj.seo || {
        meta_title: '',
        meta_description: '',
        keywords: [],
        source_page: 0
      }
    };
  });
};

/**
 * Create a new chapter with unique slug generation
 */
export const createChapter = async (chapterData) => {
  // Generate slug from title if not provided
  let slug = chapterData.slug || generateSlug(chapterData.title);
  
  // Check for existing chapter with same slug in the same book
  const existingChapter = await Chapter.findOne({
    slug,
    book_id: chapterData.book_id
  });

  if (existingChapter) {
    const error = new Error('Chapter with this slug already exists in this book');
    error.code = 'CHAPTER_EXISTS';
    throw error;
  }

  // Set default values per DeepSeek schema
  const chapter = new Chapter({
    ...chapterData,
    slug,
    chapter_number_display: chapterData.chapter_number_display || `Chapter ${chapterData.chapter_number}`,
    student_learning_outcomes: chapterData.student_learning_outcomes || [],
    summary: chapterData.summary || '',
    display_order: chapterData.display_order || 0,
    is_live: chapterData.is_live ?? false,
    total_topics: 0
  });

  await chapter.save();
  return chapter;
};

/**
 * Update chapter with validation
 */
export const updateChapter = async (chapterId, updateData) => {
  // Validate slug uniqueness if being updated
  if (updateData.slug) {
    const existingChapter = await Chapter.findOne({
      slug: updateData.slug,
      book_id: updateData.book_id,
      _id: { $ne: chapterId }
    });

    if (existingChapter) {
      const error = new Error('Another chapter with this slug already exists');
      error.code = 'CHAPTER_EXISTS';
      throw error;
    }
  }

  const chapter = await Chapter.findByIdAndUpdate(
    chapterId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!chapter) {
    const error = new Error('Chapter not found');
    error.code = 'CHAPTER_NOT_FOUND';
    throw error;
  }

  return chapter;
};

/**
 * Delete chapter - cascades to delete all topics
 */
export const deleteChapter = async (chapterId) => {
  const chapter = await Chapter.findByIdAndDelete(chapterId);

  if (!chapter) {
    const error = new Error('Chapter not found');
    error.code = 'CHAPTER_NOT_FOUND';
    throw error;
  }

  // Cascade delete all topics in this chapter
  await Topic.deleteMany({ chapter_id: chapterId });

  // Update book's total_chapters count
  await Book.findByIdAndUpdate(chapter.book_id, {
    $inc: { total_chapters: -1 }
  });

  return { success: true };
};

export default {
  getChapterById,
  getChapterBySlug,
  getChaptersByBook,
  getChapterTopics,
  createChapter,
  updateChapter,
  deleteChapter
};
