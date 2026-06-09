import { Book } from '../models/Book.js';
import { Topic } from '../models/Topic.js';
import { Chapter } from '../models/Chapter.js';
import { QuranVerse } from '../models/QuranVerse.js';
import { Program } from '../models/Program.js';

/**
 * Escape special regex characters
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Create case-insensitive regex
 */
function regex(value) {
  return new RegExp(escapeRegex(value), 'i');
}

/**
 * Filter for Quran books
 */
function quranBookFilter() {
  return {
    $or: [
      { slug: 'the-holy-quran' },
      { subject_slug: 'the-holy-quran' },
      { title: /quran/i },
      { subject: /quran/i },
    ],
  };
}

/**
 * Scoped book filter based on user's board and grade
 */
function scopedBookFilter(board, grade, isLoggedIn) {
  const base = { is_current_edition: { $ne: false } };
  
  if (!isLoggedIn || (!board && !grade)) {
    return base;
  }

  const scopeParts = [base];
  
  if (board) {
    scopeParts.push({ 
      $or: [{ board }, { 'metadata.board': board }] 
    });
  }
  
  if (grade) {
    scopeParts.push({
      $or: [
        { grade }, 
        { 'metadata.grade': grade }, 
        { 'metadata.grade_level': grade }
      ],
    });
  }

  return {
    $or: [quranBookFilter(), { $and: scopeParts }],
  };
}

/**
 * Grade number filter patterns
 */
function gradeNumberFilter(n) {
  const patterns = [
    new RegExp(`^Grade ${n}$`, 'i'),
    new RegExp(`^Class ${n}$`, 'i'),
    new RegExp(`Grade ${n}`, 'i'),
    new RegExp(`Class ${n}`, 'i'),
    new RegExp(`\\b${n}\\b`),
  ];
  
  return {
    $or: [
      { grade: { $in: patterns } },
      { 'metadata.grade': { $in: patterns } },
      { 'metadata.grade_level': { $in: patterns } },
      { title: new RegExp(`Grade ${n}|Class ${n}`, 'i') },
    ],
  };
}

/**
 * Surah names mapping
 */
const SURAH_NAMES = {
  1: 'Al-Fatihah',
  2: 'Al-Baqarah',
  3: 'Ali Imran',
  36: 'Ya-Sin',
  67: 'Al-Mulk',
};

/**
 * Global search with user scoping - matches source monorepo implementation
 */
export async function globalSearch(query, options = {}) {
  const { userId, board, grade, limit = 20 } = options;
  const isLoggedIn = Boolean(userId);

  const results = {
    books: [],
    topics: [],
    quran: []
  };

  if (!query || query.trim().length < 1) {
    return results;
  }

  const q = query.trim();
  const searchRegex = regex(q);

  // Check if query is a grade number (1-12)
  const isNumeric = /^\d{1,2}$/.test(q);
  const gradeNum = isNumeric ? parseInt(q, 10) : null;

  // Fetch books by grade number if applicable
  if (gradeNum && gradeNum >= 1 && gradeNum <= 12) {
    const gradeScope = scopedBookFilter(board, grade, isLoggedIn);
    let gradeBooks = await Book.find({
      $and: [
        { is_live: true },
        gradeScope,
        gradeNumberFilter(gradeNum)
      ]
    })
      .limit(10)
      .populate('program_id', 'name slug')
      .populate('board_id', 'name short_code slug')
      .select('title slug subject subject_slug program_id board_id board grade description seo')
      .lean();

    if (gradeBooks.length === 0) {
      gradeBooks = await Book.find({
        $and: [
          gradeScope,
          {
            $or: [
              { grade: new RegExp(`${gradeNum}`, 'i') },
              { 'metadata.grade': new RegExp(`${gradeNum}`, 'i') },
              { 'metadata.grade_level': new RegExp(`${gradeNum}`, 'i') },
              { title: new RegExp(`Grade ${gradeNum}|Class ${gradeNum}`, 'i') },
            ],
          },
        ],
      })
        .limit(10)
        .populate('program_id', 'name slug')
        .populate('board_id', 'name short_code slug')
        .select('title slug subject subject_slug program_id board_id board grade description seo')
        .lean();
    }

    results.books.push(...gradeBooks);
  }

  // Fetch books by text search
  const textBookFilter = {
    is_current_edition: { $ne: false },
    $or: [
      { title: searchRegex },
      { subject: searchRegex },
      { board: searchRegex },
      { grade: searchRegex },
      { slug: searchRegex },
      { 'seo.meta_description': searchRegex },
      { 'metadata.grade_level': searchRegex },
    ],
  };

  if (isLoggedIn && (board || grade)) {
    const scoped = scopedBookFilter(board, grade, isLoggedIn);
    textBookFilter.$and = [scoped];
  }

  const textBooks = await Book.find(textBookFilter)
    .limit(10)
    .populate('program_id', 'name slug')
    .populate('board_id', 'name short_code slug')
    .select('title slug subject subject_slug program_id board_id board grade description seo')
    .lean();

  // Deduplicate books
  const seenBookIds = new Set(results.books.map(b => b._id.toString()));
  for (const book of textBooks) {
    const id = book._id.toString();
    if (!seenBookIds.has(id) && results.books.length < 10) {
      seenBookIds.add(id);
      results.books.push(book);
    }
  }

  // Fetch topics by text search
  const topicFilter = {
    $or: [
      { title: searchRegex },
      { raw_text: searchRegex },
      { 'seo.meta_description': searchRegex },
      { 'content_blocks.text': searchRegex },
      { 'content_blocks.question': searchRegex },
      { 'content_blocks.definition': searchRegex },
    ],
  };

  if (isLoggedIn && (board || grade)) {
    const matchingBooks = await Book.find(scopedBookFilter(board, grade, isLoggedIn)).select('_id').lean();
    topicFilter.book_id = { $in: matchingBooks.map(book => book._id) };
  }

  const textTopics = await Topic.find(topicFilter)
    .limit(15)
    .populate({
      path: 'book_id',
      select: 'subject subject_slug board grade board_id program_id',
      populate: [
        { path: 'board_id', select: 'name short_code slug' },
        { path: 'program_id', select: 'name slug' },
      ],
    })
    .populate('program_id', 'name slug')
    .populate('chapter_id', 'chapter_number title slug')
    .select('title slug subject_name chapter_number quran_reference book_id program_id chapter_id')
    .lean();

  // Deduplicate topics
  const seenTopicIds = new Set(results.topics.map(t => t._id.toString()));
  for (const topic of textTopics) {
    const id = topic._id.toString();
    if (!seenTopicIds.has(id) && results.topics.length < 15) {
      seenTopicIds.add(id);
      results.topics.push(topic);
    }
  }

  // Fetch Quran-related content
  if (/quran/i.test(q)) {
    const quranTopicFilter = {
      is_live: true,
      $or: [
        { quran_reference: { $ne: null } },
        { 'content_blocks.type': 'quran_verse' },
        { title: searchRegex },
        { subject_name: searchRegex },
      ],
    };

    const quranTopics = await Topic.find(quranTopicFilter)
      .limit(5)
      .populate({
        path: 'book_id',
        select: 'title subject_slug board_id program_id',
        populate: [
          { path: 'board_id', select: 'name short_code slug' },
          { path: 'program_id', select: 'slug' },
        ],
      })
      .populate('program_id', 'slug')
      .populate('chapter_id', 'chapter_number slug')
      .select('title slug quran_reference book_id program_id chapter_id')
      .lean();

    for (const topic of quranTopics) {
      if (results.quran.length >= 5) break;
      results.quran.push({
        _id: topic._id,
        title: topic.title,
        subtitle: topic.quran_reference?.surah_name_english || `Surah ${topic.quran_reference?.surah || ''}`,
        slug: topic.slug,
        program_id: topic.program_id,
        book_id: topic.book_id,
        chapter_id: topic.chapter_id,
        type: 'topic',
      });
    }
  }

  // Fetch Quran verses if query is a surah number (1-114)
  if (gradeNum && gradeNum >= 1 && gradeNum <= 114) {
    const verses = await QuranVerse.find({ surah: gradeNum })
      .limit(5)
      .select('surah ayah text_uthmani')
      .lean();

    for (const verse of verses) {
      if (results.quran.length >= 5) break;
      results.quran.push({
        _id: `${verse.surah}-${verse.ayah}`,
        title: `Surah ${verse.surah}, Ayah ${verse.ayah}`,
        subtitle: SURAH_NAMES[verse.surah] || `Surah ${verse.surah}`,
        surah: verse.surah,
        ayah: verse.ayah,
        type: 'verse',
      });
    }
  }

  // Apply limits
  results.books = results.books.slice(0, 10);
  results.topics = results.topics.slice(0, 15);
  results.quran = results.quran.slice(0, 5);

  return results;
}

/**
 * Search with filters (legacy support)
 */
export async function searchWithFilters(filters) {
  const { query, boardId, programId, classLevel, type = 'all' } = filters;

  const bookQuery = {};
  const topicQuery = {};

  if (query) {
    const searchRegex = regex(query);
    bookQuery.$or = [
      { title: searchRegex },
      { subject: searchRegex }
    ];
    topicQuery.$or = [
      { title: searchRegex },
      { content: searchRegex }
    ];
  }

  if (boardId) {
    bookQuery.board = boardId;
    topicQuery.board = boardId;
  }

  if (programId) {
    bookQuery.program = programId;
    topicQuery.program = programId;
  }

  if (classLevel) {
    bookQuery.classLevel = classLevel;
    topicQuery.classLevel = classLevel;
  }

  const results = {
    books: [],
    topics: []
  };

  if (type === 'all' || type === 'books') {
    results.books = await Book.find(bookQuery)
      .limit(20)
      .populate('board', 'name slug')
      .populate('program', 'name slug');
  }

  if (type === 'all' || type === 'topics') {
    results.topics = await Topic.find(topicQuery)
      .limit(20)
      .populate('book', 'title slug subject')
      .populate('chapter', 'title');
  }

  return results;
}

/**
 * Get search suggestions (legacy support)
 */
export async function getSearchSuggestions(query, limit = 5) {
  const searchRegex = regex(query);

  const [bookSuggestions, topicSuggestions] = await Promise.all([
    Book.find({ title: searchRegex })
      .select('title slug subject')
      .limit(limit),

    Topic.find({ title: searchRegex })
      .select('title slug')
      .limit(limit)
  ]);

  return {
    books: bookSuggestions,
    topics: topicSuggestions
  };
}
