import { success, error } from '../utils/apiResponse.js';
import * as bookService from '../services/book.service.js';

/**
 * GET /books - Get all books with user-aware filtering
 * - Authenticated users: personalized results based on board/grade
 * - Unauthenticated users: public, current edition books only (sanitized)
 */
export async function getBooks(req, res, next) {
  try {
    const { boardId, programId, classLevel, subject, grade, editionYear } = req.query;

    // optionalAuth middleware already set req.user if authenticated
    const user = req.user || null;

    const additionalFilters = { boardId, programId, classLevel, subject, grade, editionYear };
    const books = await bookService.getBooksForUser(user, additionalFilters);
    res.json(success({ books, isAuthenticated: !!user }));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /books/:id - Get single book by ID
 */
export async function getBook(req, res, next) {
  try {
    const { id } = req.params;
    const book = await bookService.getBookById(id);
    res.json(success(book));
  } catch (err) {
    if (err.code === 'BOOK_NOT_FOUND') {
      return res.status(404).json(error('Book not found', 'BOOK_NOT_FOUND'));
    }
    next(err);
  }
}

/**
 * GET /books/slug/:slug - Get book by slug
 */
export async function getBookBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { editionYear } = req.query;
    const book = await bookService.getBookBySlugWithEdition(slug, editionYear);
    res.json(success(book));
  } catch (err) {
    if (err.code === 'BOOK_NOT_FOUND') {
      return res.status(404).json(error('Book not found', 'BOOK_NOT_FOUND'));
    }
    next(err);
  }
}

/**
 * GET /books/:id/chapters - Get chapters for a book
 */
export async function getBookChapters(req, res, next) {
  try {
    const { id } = req.params;
    const chapters = await bookService.getBookChapters(id);
    res.json(success(chapters));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /books - Create new book (admin only)
 */
export async function createBook(req, res, next) {
  try {
    const bookData = req.body;

    // Validate required fields
    if (!bookData.title || !bookData.subject_slug) {
      return res.status(400).json(error('Title and subject_slug are required', 'VALIDATION_ERROR'));
    }

    const book = await bookService.createBook(bookData);
    res.status(201).json(success(book, 'Book created successfully'));
  } catch (err) {
    if (err.code === 'BOOK_EXISTS') {
      return res.status(409).json(error(err.message, 'BOOK_EXISTS'));
    }
    next(err);
  }
}

/**
 * PUT /books/:id - Update book (admin only)
 */
export async function updateBook(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const book = await bookService.updateBook(id, updateData);
    res.json(success(book, 'Book updated successfully'));
  } catch (err) {
    if (err.code === 'BOOK_NOT_FOUND') {
      return res.status(404).json(error('Book not found', 'BOOK_NOT_FOUND'));
    }
    next(err);
  }
}

/**
 * DELETE /books/:id - Delete book (admin only)
 */
export async function deleteBook(req, res, next) {
  try {
    const { id } = req.params;
    await bookService.deleteBook(id);
    res.json(success(null, 'Book deleted successfully'));
  } catch (err) {
    if (err.code === 'BOOK_NOT_FOUND') {
      return res.status(404).json(error('Book not found', 'BOOK_NOT_FOUND'));
    }
    next(err);
  }
}
