/**
 * Assemble Quran Book from Downloaded Verses
 * Creates complete book structure with 114 Surah chapters
 * Compatible with DeepSeek schema
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyvault';

// Import models using CommonJS
const Board = require('../src/models/Board.js');
const Program = require('../src/models/Program.js');
const Book = require('../src/models/Book.js');
const Chapter = require('../src/models/Chapter.js');
const Topic = require('../src/models/Topic.js');
const QuranVerse = require('../src/models/QuranVerse.js');

async function assembleQuranBook() {
  console.log('◇ Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ MongoDB connected successfully');

  // Get or create PUB board
  let board = await Board.findOne({ short_code: 'PUB' });
  if (!board) {
    board = await Board.create({
      name: 'Punjab Curriculum and Textbook Board',
      short_code: 'PUB',
      slug: 'pub'
    });
    console.log('✓ Created PUB board');
  }

  // Get or create Diniyat program
  let program = await Program.findOne({ slug: 'diniyat' });
  if (!program) {
    program = await Program.create({
      name: 'Diniyat (Islamic Studies)',
      slug: 'diniyat'
    });
    console.log('✓ Created Diniyat program');
  }

  // Create Quran book
  const quranBook = await Book.findOneAndUpdate(
    { 
      title: 'The Holy Quran',
      grade: 'All',
      subject_slug: 'the-holy-quran'
    },
    {
      title: 'The Holy Quran',
      subject: 'Tarjuma-tul-Quran',
      subject_slug: 'the-holy-quran',
      grade: 'All',
      edition_year: 2024,
      publisher: 'Punjab Curriculum and Textbook Board',
      authors: ['Allah (SWT)'],
      board: board._id,
      program: program._id,
      language: 'urdu',
      script_direction: 'rtl',
      is_public: true,
      workflow_status: 'live',
      seo: {
        meta_title: 'The Holy Quran - Tarjuma-tul-Quran | StudyVault',
        meta_description: 'Complete Holy Quran with Urdu translation and word-by-word breakdown.',
        keywords: ['quran', 'urdu translation', 'tarjuma', 'islam', 'holy book']
      }
    },
    { upsert: true, new: true }
  );
  console.log('✓ Created/Updated Quran book:', quranBook.title);

  // Create introduction chapter
  const introChapter = await Chapter.findOneAndUpdate(
    { 
      book: quranBook._id,
      chapter_number: 0
    },
    {
      book: quranBook._id,
      chapter_number: 0,
      chapter_number_display: 'Introduction',
      title: 'Introduction to the Holy Quran',
      slug: 'introduction',
      page_start: 1,
      page_end: 5,
      student_learning_outcomes: [
        'Understand the structure of the Holy Quran',
        'Learn about the 114 Surahs',
        'Know the revelation order'
      ],
      chapter_summary: 'The Holy Quran is the final revelation from Allah (SWT), consisting of 114 Surahs revealed over 23 years.',
      workflow_status: 'live'
    },
    { upsert: true, new: true }
  );
  console.log('✓ Created Introduction chapter');

  // Create topics for each Surah
  const allVerses = await QuranVerse.find().sort({ surah: 1, ayah: 1 });
  
  for (let surahNum = 1; surahNum <= 114; surahNum++) {
    const surahVerses = allVerses.filter(v => v.surah === surahNum);
    
    if (surahVerses.length === 0) {
      console.log(`  ⚠ No verses found for Surah ${surahNum}`);
      continue;
    }

    const firstVerse = surahVerses[0];
    const lastVerse = surahVerses[surahVerses.length - 1];

    // Create chapter for Surah
    const surahChapter = await Chapter.findOneAndUpdate(
      {
        book: quranBook._id,
        chapter_number: surahNum
      },
      {
        book: quranBook._id,
        chapter_number: surahNum,
        chapter_number_display: `Surah ${surahNum}`,
        title: `${firstVerse.surah_name_arabic} (${firstVerse.surah_name_english})`,
        slug: `surah-${surahNum}`,
        page_start: firstVerse.page || 1,
        page_end: lastVerse.page || 1,
        student_learning_outcomes: [],
        chapter_summary: '',
        workflow_status: 'live'
      },
      { upsert: true, new: true }
    );

    // Create topic with all verses as content blocks
    const contentBlocks = surahVerses.map((verse, idx) => ({
      type: 'quran_verse',
      quran_data: {
        surah: verse.surah,
        ayah: verse.ayah,
        textbook_line_translation: verse.text_urdu_translation,
        word_alignments: verse.words.map(w => ({
          position: w.position,
          textbook_urdu: w.text_urdu,
          color_highlight: null
        })),
        tafsir_snippet: ''
      },
      html: `<div class='quran-verse' data-surah='${verse.surah}' data-ayah='${verse.ayah}'><p class='urdu-translation'>${verse.text_urdu_translation}</p></div>`,
      block_order: idx + 1
    }));

    const rawText = surahVerses.map(v => v.text_urdu_translation).join('\n\n');

    const topic = await Topic.findOneAndUpdate(
      {
        chapter: surahChapter._id,
        slug: `surah-${surahNum}-ayah-1-${surahVerses.length}`
      },
      {
        title: `${firstVerse.surah_name_english} (آیات ۱-${surahVerses.length})`,
        title_urdu: `${firstVerse.surah_name_arabic} (آیات ۱-${surahVerses.length})`,
        slug: `surah-${surahNum}-ayah-1-${surahVerses.length}`,
        topic_number: `${surahNum}`,
        display_order: surahNum,
        difficulty: 'medium',
        estimated_read_time: Math.ceil(surahVerses.length / 10),
        edition_year: 2024,
        chapter: surahChapter._id,
        book: quranBook._id,
        raw_text: rawText,
        clean_html: contentBlocks.map(b => b.html).join('\n'),
        content_blocks: contentBlocks,
        formulas: [],
        key_terms: [],
        book_mcqs: [],
        book_short_questions: [],
        book_problems: [],
        keywords: [firstVerse.surah_name_english.toLowerCase(), 'quran', 'surah'],
        quran_reference: {
          surah: surahNum,
          ayah: surahVerses.length,
          surah_name_arabic: firstVerse.surah_name_arabic,
          surah_name_english: firstVerse.surah_name_english,
          juz: firstVerse.juz || 1,
          manzil: firstVerse.manzil || 1,
          ruku: firstVerse.ruku || 1
        },
        quran_word_alignments: surahVerses.flatMap(v => 
          v.words.map(w => ({
            position: w.position,
            textbook_urdu_meaning: w.text_urdu,
            color_highlight: null,
            grammar_note: null
          }))
        ),
        quran_textbook_translation: rawText,
        quran_textbook_tafsir: '',
        seo: {
          meta_title: `Surah ${firstVerse.surah_name_english} - The Holy Quran | StudyVault`,
          meta_description: `Read Surah ${firstVerse.surah_name_english} with Urdu translation and word-by-word breakdown.`,
          keywords: [firstVerse.surah_name_english.toLowerCase(), 'quran', 'urdu translation'],
          source_page: firstVerse.page || 1
        },
        workflow_status: 'live'
      },
      { upsert: true, new: true }
    );

    console.log(`  ✓ Surah ${surahNum}: ${surahVerses.length} verses, topic created`);
  }

  console.log('\n🎉 QURAN BOOK ASSEMBLY COMPLETE!');
  console.log(`Book: ${quranBook.title}`);
  console.log(`Chapters: 114 Surahs + Introduction`);
  console.log(`Topics: 114 (one per Surah)`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

// Run
assembleQuranBook().catch(console.error);
