import mongoose from 'mongoose';
import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { Topic } from '../models/Topic.js';
import { Program } from '../models/Program.js';
import { Board } from '../models/Board.js';
import { generateSlug } from '../utils/slug.js';

/**
 * Quran book filter - always include Quran in results
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
 * Escape special regex characters
 */
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Resolve user's board and program IDs from their profile
 * Matches source: packages/lib/content/bookFilter.js::resolveUserContentProfile
 */
export async function resolveUserContentProfile(user) {
  const boardName = user?.board || user?.student_profile?.board;
  const gradeName = user?.grade || user?.student_profile?.grade;
  let boardId = user?.student_profile?.board_id || null;
  let programId = user?.student_profile?.active_program_id || null;

  if (!boardId && boardName) {
    const boardDoc = await Board.findOne({
      $or: [
        { name: boardName },
        { name: new RegExp(`^${escapeRegex(boardName)}$`, 'i') },
        { short_code: boardName },
        { name: new RegExp(escapeRegex(boardName.split(' ').slice(-1)[0] || boardName), 'i') },
      ],
    })
      .select('_id name')
      .lean();
    boardId = boardDoc?._id || null;
  }

  if (!programId && gradeName) {
    const gradeCore = gradeName.split('(')[0].trim();
    const programDoc = await Program.findOne({
      $or: [
        { name: gradeName },
        { name: gradeCore },
        { slug: generateSlug(gradeName) },
        { slug: generateSlug(gradeCore) },
        { name: new RegExp(`^${escapeRegex(gradeCore)}$`, 'i') },
      ],
    })
      .select('_id name slug')
      .lean();
    programId = programDoc?._id || null;
  }

  return { boardId, programId, boardName, gradeName };
}

/**
 * Build book filter based on user's board and grade
 * Matches source: packages/lib/content/bookFilter.js::buildBookFilter
 */
export function buildBookFilter({ boardId, programId, boardName, gradeName }) {
  const scopeParts = [{ is_current_edition: { $ne: false } }];

  if (boardId) {
    scopeParts.push({ board_id: boardId });
  }

  if (programId) {
    scopeParts.push({ program_id: programId });
  } else if (gradeName) {
    const gradeCore = gradeName.split('(')[0].trim();
    scopeParts.push({
      $or: [
        { grade: gradeName },
        { 'metadata.grade': gradeName },
        { 'metadata.grade_level': gradeName },
        { 'metadata.grade_level': new RegExp(`^${escapeRegex(gradeCore)}$`, 'i') },
        { title: new RegExp(escapeRegex(gradeCore), 'i') },
      ],
    });
  }

  if (scopeParts.length === 1) {
    return { is_current_edition: { $ne: false } };
  }

  return {
    $or: [quranBookFilter(), { $and: scopeParts }],
  };
}

/**
 * Sanitize book data for unauthenticated users
 * - Hide sensitive metadata (solutions, answers, teacher_notes)
 * - Limit content preview to first 2 blocks
 * - Truncate SEO descriptions
 */
function sanitizeBookForPublic(book) {
  const sanitized = book.toObject ? book.toObject() : { ...book };
  
  if (sanitized.metadata) {
    const { solutions, answers, teacher_notes, ...restMetadata } = sanitized.metadata;
    sanitized.metadata = restMetadata;
  }
  
  if (sanitized.content_blocks && Array.isArray(sanitized.content_blocks)) {
    sanitized.content_blocks = sanitized.content_blocks.slice(0, 2);
  }
  
  if (sanitized.seo?.meta_description) {
    sanitized.seo = {
      ...sanitized.seo,
      meta_description: sanitized.seo.meta_description.substring(0, 150) + '...'
    };
  }
  
  return sanitized;
}

/**
 * Get books with user-aware filtering
 * - Authenticated users: personalized results based on board/grade
 * - Unauthenticated users: public, current edition books only (sanitized)
 * Matches source: apps/student/app/api/books/route.ts
 */
export async function getBooksForUser(user = null, additionalFilters = {}) {
  let filter = {};

  if (user && user.role !== 'admin') {
    // Authenticated user - apply personalized filtering
    const profile = await resolveUserContentProfile(user);
    filter = buildBookFilter(profile);
  } else if (!user) {
    // Unauthenticated - show only public, current edition books
    filter = {
      is_current_edition: { $ne: false },
      is_live: true,
      is_public: true
    };
  }

  // Merge additional filters
  filter = { ...filter, ...additionalFilters };

  const books = await Book.aggregate([
    { $match: filter },
    { $lookup: { from: 'chapters', localField: '_id', foreignField: 'book_id', as: 'chapters' } },
    { $lookup: { from: 'topics', localField: '_id', foreignField: 'book_id', as: 'topics' } },
    {
      $addFields: {
        chapter_count: { $size: '$chapters' },
        total_topics: { $size: '$topics' }
      }
    },
    {
      $project: {
        topics: 0,
        // Keep chapters but maybe exclude some fields if they are too heavy
        'chapters.content': 0, 
        'chapters.raw_text': 0
      }
    },
    { $sort: { is_current_edition: -1, is_live: -1, edition_year: -1, title: 1 } }
  ]);

  // Manually populate board_id and program_id since aggregate doesn't do it automatically like populate()
  const populatedBooks = await Promise.all(books.map(async (book) => {
    if (book.board_id && mongoose.Types.ObjectId.isValid(book.board_id)) {
      book.board_id = await Board.findById(book.board_id).select('name short_code').lean();
    }
    if (book.program_id && mongoose.Types.ObjectId.isValid(book.program_id)) {
      book.program_id = await Program.findById(book.program_id).select('name slug').lean();
    }
    return book;
  }));

  // Sanitize for unauthenticated users
  if (!user) {
    return populatedBooks.map(sanitizeBookForPublic);
  }

  return populatedBooks;
}

/**
 * Get all books with optional filters (legacy method)
 */
export async function getBooks({ boardId, programId, classLevel, subject, grade, editionYear } = {}) {
  const query = {};

  if (boardId) query.board_id = boardId;
  if (programId) query.program_id = programId;
  if (classLevel) query.classLevel = classLevel;
  if (subject) query.subject_slug = subject;
  if (grade) query.grade = grade;
  if (editionYear) query.edition_year = editionYear;
  else query.is_current_edition = true; // Default to current edition

  const books = await Book.find(query)
    .populate('board_id', 'name slug')
    .populate('program_id', 'name slug')
    .sort({ classLevel: 1, title: 1 });

  return books;
}

/**
 * Get books filtered by program, board, and grade
 */
export async function getBooksByProgramBoardGrade(programId, boardId, grade) {
  const query = {
    program_id: programId,
    board_id: boardId,
    grade: grade,
    is_current_edition: true
  };

  const books = await Book.find(query)
    .populate('board_id', 'name slug')
    .populate('program_id', 'name slug')
    .sort({ chapterOrder: 1, title: 1 });

  return books;
}

/**
 * Get current edition books only
 */
export async function getCurrentEditionBooks(filters = {}) {
  const query = { ...filters, is_current_edition: true };

  const books = await Book.find(query)
    .populate('board_id', 'name slug')
    .populate('program_id', 'name slug')
    .sort({ classLevel: 1, title: 1 });

  return books;
}

/**
 * Get book by slug with edition awareness
 */
export async function getBookBySlugWithEdition(slug, editionYear) {
  const query = { slug };

  if (editionYear) {
    query.edition_year = editionYear;
  } else {
    query.is_current_edition = true;
  }

  const book = await Book.findOne(query)
    .populate('board_id', 'name slug')
    .populate('program_id', 'name slug');

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

/**
 * Get book by ID
 */
export async function getBookById(bookId) {
  const book = await Book.findById(bookId)
    .populate('board_id', 'name slug')
    .populate('program_id', 'name slug');

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

/**
 * Get book by slug (legacy, returns current edition)
 */
export async function getBookBySlug(slug) {
  return getBookBySlugWithEdition(slug, null);
}

/**
 * Create a new book with edition handling
 */
export async function createBook(bookData) {
  const slug = bookData.slug || generateSlug(bookData.title);

  // Check if book with this slug exists
  const existingBook = await Book.findOne({ slug });

  if (existingBook) {
    // If creating a new edition, archive the previous current edition
    if (bookData.edition_year) {
      await Book.findByIdAndUpdate(existingBook._id, {
        is_current_edition: false,
        next_edition_id: undefined
      });
    } else {
      const error = new Error('Book with this slug already exists');
      error.code = 'BOOK_EXISTS';
      throw error;
    }
  }

  const book = await Book.create({
    ...bookData,
    slug,
    is_current_edition: bookData.is_current_edition ?? true
  });

  // Link previous edition if archiving
  if (existingBook && bookData.edition_year) {
    await Book.findByIdAndUpdate(existingBook._id, {
      next_edition_id: book._id
    });
  }

  return book;
}

/**
 * Update book with edition transition support
 */
export async function updateBook(bookId, updateData) {
  const book = await Book.findById(bookId);

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  // Handle edition transition
  if (updateData.is_current_edition === true && !book.is_current_edition) {
    // Archive the current current edition
    await Book.findOneAndUpdate(
      { slug: book.slug, is_current_edition: true },
      { is_current_edition: false, next_edition_id: bookId }
    );
  }

  const updatedBook = await Book.findByIdAndUpdate(
    bookId,
    updateData,
    { new: true, runValidators: true }
  );

  return updatedBook;
}

/**
 * Delete book
 */
export async function deleteBook(bookId) {
  const book = await Book.findByIdAndDelete(bookId);

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  // Cascade delete chapters and topics
  await Chapter.deleteMany({ book_id: bookId });
  await Topic.deleteMany({ book_id: bookId });

  return { success: true };
}

/**
 * Get book chapters
 */
export async function getBookChapters(bookId) {
  const chapters = await Chapter.find({ book_id: bookId })
    .sort({ chapter_number: 1 });

  return chapters;
}
