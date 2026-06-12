import { success, error } from '../utils/apiResponse.js';
import * as bookService from '../services/book.service.js';

/**
 * Parse catch-all slug array from Next.js [...slug]
 * Expected formats:
 * - [boardCode, grade, subjectSlug] -> Book level
 * - [boardCode, grade, subjectSlug, chapterSlug] -> Chapter level
 * - [boardCode, grade, subjectSlug, chapterSlug, topicSlug] -> Topic level
 */
export function parseCatchAllSlug(slugArray) {
  if (!Array.isArray(slugArray) || slugArray.length < 3) {
    return null;
  }

  const [boardCode, grade, subjectSlug, chapterSlug, topicSlug] = slugArray;

  return {
    boardCode,
    grade,
    subjectSlug,
    chapterSlug: chapterSlug || null,
    topicSlug: topicSlug || null,
    level: topicSlug ? 'topic' : chapterSlug ? 'chapter' : 'book'
  };
}

/**
 * GET /books - Get all books with user-aware filtering
 */
export async function getBooks(req, res, next) {
  try {
    const { boardId, programId, classLevel, subject, grade, editionYear, board } = req.query;
    const user = req.user || null;

    // Clean up filters - map to correct DB fields
    const additionalFilters = {};
    if (boardId) additionalFilters.board_id = boardId;
    if (programId) additionalFilters.program_id = programId;
    if (classLevel) additionalFilters.classLevel = classLevel;
    // Use case-insensitive regex for subject matching
    if (subject) additionalFilters.subject_slug = new RegExp(`^${subject.trim()}$`, 'i');
    if (editionYear) additionalFilters.edition_year = Number(editionYear);
    
    // Step A: Dynamic board relational resolution
    if (board && !boardId) {
      const mongoose = (await import('mongoose')).default;
      const Board = mongoose.model('Board');
      
      // Try multiple lookup strategies for board
      const boardDoc = await Board.findOne({ 
        $or: [
          { short_code: board.toUpperCase() },
          { short_code: board.toLowerCase() },
          { slug: board.toLowerCase() },
          { name: new RegExp(`^${board}$`, 'i') }
        ] 
      });
      
      if (boardDoc) {
        additionalFilters.board_id = boardDoc._id.toString();
      }
      // If no board found, don't return early - let the query proceed without board filter
      // This allows fallback queries to work
    }

    // Step B: Flexible grade matching - build a grade value array for matching
    if (grade) {
      const gradeParam = String(grade).trim();
      const numericGrade = parseInt(gradeParam.replace(/\D/g, ''), 10);
      
      // Build array of possible grade representations
      const gradeValues = [gradeParam];
      if (!isNaN(numericGrade)) {
        gradeValues.push(numericGrade);
        gradeValues.push(String(numericGrade));
        gradeValues.push(`Class ${numericGrade}`);
        gradeValues.push(`Grade ${numericGrade}`);
        gradeValues.push(`class ${numericGrade}`);
        gradeValues.push(`grade ${numericGrade}`);
      }
      
      // Use $in for flexible matching - will be handled specially in service layer
      additionalFilters.grade = {
        $in: gradeValues
      };
    }

    let books = await bookService.getBooksForUser(user, additionalFilters);
    
    // Step C: Fallback query if strict lookup with grade fails
    if (books.length === 0 && additionalFilters.board_id && subject && grade) {
      const fallbackFilters = { ...additionalFilters };
      delete fallbackFilters.grade;
      const fallbackBooks = await bookService.getBooksForUser(user, fallbackFilters);
      if (fallbackBooks.length > 0) {
        books = fallbackBooks;
      }
    }
    
    // Step D: Final fallback - search by subject_slug only if everything else fails
    if (books.length === 0 && subject) {
      // Extract the regex pattern string for subject-only search
      const subjectValue = typeof subject === 'object' && subject.source ? subject.source.replace(/^\^|\$$/g, '') : subject;
      const subjectOnlyFilters = { subject_slug: new RegExp(`^${subjectValue}$`, 'i') };
      const subjectOnlyBooks = await bookService.getBooksForUser(user, subjectOnlyFilters);
      if (subjectOnlyBooks.length > 0) {
        books = subjectOnlyBooks;
      }
    }
    
    // Standardized response format matching DeepSeek schema
    res.json(success({
      books: books.map(book => ({
        _id: book._id,
        title: book.title,
        slug: book.slug,
        subject: book.subject,
        subject_slug: book.subject_slug,
        grade: book.grade,
        edition_year: book.edition_year,
        metadata: book.metadata || {},
        seo: book.seo || { meta_title: '', meta_description: '', keywords: [] },
        total_chapters: book.chapter_count || 0,
        is_live: book.is_live || false,
        is_public: book.is_public !== false,
        // Include board info for URL generation
        board_id: book.board_id ? {
          _id: book.board_id._id,
          name: book.board_id.name,
          slug: book.board_id.slug,
          short_code: book.board_id.short_code
        } : null,
        board_short_code: book.board_id?.short_code || null,
        board_slug: book.board_id?.slug || null
      })),
      isAuthenticated: !!user
    }));
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
    
    if (!book) {
      return res.status(404).json(error('Book not found', 'BOOK_NOT_FOUND'));
    }
    
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
 * GET /books/:bookId/chapters - Get chapters for a book
 * Response format matches DeepSeek schema exactly
 */
export async function getBookChapters(req, res, next) {
  try {
    const { bookId } = req.params;
    let chapters = await bookService.getBookChapters(bookId);
    
    // Resilient fallback: if no chapters found by bookId, try searching by subject_slug
    if (chapters.length === 0) {
      const mongoose = (await import('mongoose')).default;
      const Book = mongoose.model('Book');
      const Chapter = mongoose.model('Chapter');
      
      // Get the book to find its subject_slug
      const book = await Book.findById(bookId).select('subject_slug').lean();
      if (book?.subject_slug) {
        // Fallback: find chapters from any book with the same subject_slug
        const fallbackChapters = await Chapter.aggregate([
          { $lookup: { from: 'books', localField: 'book_id', foreignField: '_id', as: 'book' } },
          { $unwind: '$book' },
          { $match: { 'book.subject_slug': book.subject_slug } },
          { $sort: { chapter_number: 1 } }
        ]);
        
        if (fallbackChapters.length > 0) {
          chapters = fallbackChapters.map(c => ({
            ...c,
            _id: c._id,
            chapter_number: c.chapter_number,
            title: c.title,
            slug: c.slug
          }));
        }
      }
    }
    
    // Ensure response matches DeepSeek schema with student_learning_outcomes, chapter_summary
    const formattedChapters = chapters.map(chapter => ({
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
      seo: chapter.seo || { meta_title: '', meta_description: '', keywords: [] },
      total_topics: chapter.total_topics || 0,
      is_live: chapter.is_live || false
    }));
    
    res.json(success({
      book_id: bookId,
      chapters: formattedChapters,
      total_chapters: formattedChapters.length
    }));
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

    // Validate required fields per DeepSeek schema
    const requiredFields = ['title', 'subject_slug', 'grade', 'edition_year'];
    for (const field of requiredFields) {
      if (!bookData[field]) {
        return res.status(400).json(error(`${field} is required`, 'VALIDATION_ERROR'));
      }
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
