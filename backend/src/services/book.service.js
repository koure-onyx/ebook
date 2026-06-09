import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { Topic } from '../models/Topic.js';
import { generateSlug } from '../utils/slug.js';

/**
 * Get all books with optional filters
 */
export async function getBooks({ boardId, programId, classLevel, subject } = {}) {
  const query = {};
  
  if (boardId) query.board = boardId;
  if (programId) query.program = programId;
  if (classLevel) query.classLevel = classLevel;
  if (subject) query.subject = subject;

  const books = await Book.find(query)
    .populate('board', 'name slug')
    .populate('program', 'name slug')
    .sort({ classLevel: 1, title: 1 });

  return books;
}

/**
 * Get book by ID
 */
export async function getBookById(bookId) {
  const book = await Book.findById(bookId)
    .populate('board', 'name slug')
    .populate('program', 'name slug');

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

/**
 * Get book by slug
 */
export async function getBookBySlug(slug) {
  const book = await Book.findOne({ slug })
    .populate('board', 'name slug')
    .populate('program', 'name slug');

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
}

/**
 * Create a new book
 */
export async function createBook(bookData) {
  const slug = bookData.slug || generateSlug(bookData.title);
  
  const existingBook = await Book.findOne({ slug });
  if (existingBook) {
    const error = new Error('Book with this slug already exists');
    error.code = 'BOOK_EXISTS';
    throw error;
  }

  const book = await Book.create({ ...bookData, slug });
  return book;
}

/**
 * Update book
 */
export async function updateBook(bookId, updateData) {
  const book = await Book.findByIdAndUpdate(
    bookId,
    updateData,
    { new: true, runValidators: true }
  );

  if (!book) {
    const error = new Error('Book not found');
    error.code = 'BOOK_NOT_FOUND';
    throw error;
  }

  return book;
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
  await Chapter.deleteMany({ book: bookId });
  await Topic.deleteMany({ book: bookId });

  return { success: true };
}

/**
 * Get book chapters
 */
export async function getBookChapters(bookId) {
  const chapters = await Chapter.find({ book: bookId })
    .sort({ chapterNumber: 1 });

  return chapters;
}
