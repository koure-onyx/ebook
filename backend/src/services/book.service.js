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
  // Build a clean, flat query filter from scratch
  const finalQuery = {};

  // 1. Process clean, case-insensitive Subject match
  if (additionalFilters.subject_slug) {
    let subjectValue = additionalFilters.subject_slug;
    // Convert RegExp to $regex format for aggregation
    if (subjectValue instanceof RegExp) {
      subjectValue = { $regex: subjectValue.source, $options: 'i' };
    } else if (typeof subjectValue === 'string') {
      subjectValue = new RegExp(`^${subjectValue.trim()}$`, 'i');
    }
    finalQuery.subject_slug = subjectValue;
  }

  // 2. Handle grade with $in operator for type variations including metadata.grade_level
  if (additionalFilters.grade) {
    const gradeFilter = additionalFilters.grade;
    if (gradeFilter.$in) {
      // Use $or to match multiple grade fields
      const rawGrade = String(gradeFilter.$in[0]).trim();
      const numericGrade = parseInt(rawGrade.replace(/\D/g, ''), 10);
      const gradeValues = [rawGrade];
      if (!isNaN(numericGrade)) {
        gradeValues.push(numericGrade, String(numericGrade), `Class ${numericGrade}`, `Grade ${numericGrade}`);
      }
      finalQuery.$or = [
        { grade: { $in: gradeValues } },
        { 'metadata.grade_level': { $in: gradeValues } },
        { grade_level: { $in: gradeValues } }
      ];
    } else if (typeof gradeFilter === 'string' || typeof gradeFilter === 'number') {
      const rawGrade = String(gradeFilter).trim();
      const numericGrade = parseInt(rawGrade.replace(/\D/g, ''), 10);
      const gradeValues = [rawGrade];
      if (!isNaN(numericGrade)) {
        gradeValues.push(numericGrade, String(numericGrade), `Class ${numericGrade}`, `Grade ${numericGrade}`);
      }
      finalQuery.$or = [
        { grade: { $in: gradeValues } },
        { 'metadata.grade_level': { $in: gradeValues } },
        { grade_level: { $in: gradeValues } }
      ];
    }
  }

  // 3. Process board_id if provided
  if (additionalFilters.board_id) {
    finalQuery.board_id = additionalFilters.board_id;
  }

  // 4. Process program_id if provided
  if (additionalFilters.program_id) {
    finalQuery.program_id = additionalFilters.program_id;
  }

  // 5. Add base filters for current edition and live status
  finalQuery.is_current_edition = { $ne: false };
  finalQuery.is_live = { $ne: false };

  // For unauthenticated users, add public filter
  if (!user) {
    finalQuery.is_public = true;
  }

  // Merge any other filters
  const { subject_slug, grade, board_id, program_id, ...restFilters } = additionalFilters;
  Object.assign(finalQuery, restFilters);

  console.log('[BOOK SERVICE] Clean query filter:', JSON.stringify(finalQuery));

  // Execute query with population
  let books = await Book.find(finalQuery)
    .populate({ path: 'board_id', select: 'name short_code slug' })
    .populate({ path: 'program_id', select: 'name slug' })
    .lean();

  console.log(`[BOOK SERVICE] Found ${books.length} books via find()`);

  // If no books found with strict filters, try fallback by subject only
  if (books.length === 0 && finalQuery.subject_slug) {
    const subjectOnlyQuery = { 
      subject_slug: finalQuery.subject_slug,
      is_current_edition: { $ne: false },
      is_live: { $ne: false }
    };
    if (!user) subjectOnlyQuery.is_public = true;
    
    books = await Book.find(subjectOnlyQuery)
      .populate({ path: 'board_id', select: 'name short_code slug' })
      .populate({ path: 'program_id', select: 'name slug' })
      .lean();
    
    console.log(`[BOOK SERVICE] Fallback found ${books.length} books by subject only`);
  }

  // Enrich with chapter/topic counts via aggregation for each book
  const enrichedBooks = await Promise.all(books.map(async (book) => {
    const chapterCount = await Chapter.countDocuments({ book_id: book._id });
    book.chapter_count = chapterCount;
    return book;
  }));

  console.log('[BOOK SERVICE] Populated books sample board:', JSON.stringify(enrichedBooks[0]?.board_id));

  // Sanitize for unauthenticated users
  if (!user) {
    return enrichedBooks.map(sanitizeBookForPublic);
  }

  return enrichedBooks;
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
