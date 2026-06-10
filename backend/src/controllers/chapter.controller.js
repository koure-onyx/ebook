import { success, error } from '../utils/apiResponse.js';
import * as chapterService from '../services/chapter.service.js';

/**
 * GET /chapters/:id - Get chapter by ID
 */
export async function getChapter(req, res, next) {
  try {
    const { id } = req.params;
    const chapter = await chapterService.getChapterById(id);
    
    if (!chapter) {
      return res.status(404).json(error('Chapter not found', 'CHAPTER_NOT_FOUND'));
    }
    
    res.json(success(chapter));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /chapters/slug/:slug - Get chapter by slug
 */
export async function getChapterBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const { bookId } = req.query;
    
    if (!bookId) {
      return res.status(400).json(error('bookId query parameter is required', 'VALIDATION_ERROR'));
    }
    
    const chapter = await chapterService.getChapterBySlug(slug, bookId);
    
    if (!chapter) {
      return res.status(404).json(error('Chapter not found', 'CHAPTER_NOT_FOUND'));
    }
    
    res.json(success(chapter));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /books/:bookId/chapters - Get all chapters for a book
 * Response format matches DeepSeek schema exactly
 */
export async function getBookChapters(req, res, next) {
  try {
    const { bookId } = req.params;
    const chapters = await chapterService.getChaptersByBook(bookId);
    
    res.json(success({
      book_id: bookId,
      chapters,
      total_chapters: chapters.length
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /chapters/:chapterId/topics - Get all topics for a chapter
 * Sorted by display_order (0 for intro, 999 for exercises)
 */
export async function getChapterTopics(req, res, next) {
  try {
    const { chapterId } = req.params;
    const topics = await chapterService.getChapterTopics(chapterId);
    
    res.json(success({
      chapter_id: chapterId,
      topics,
      total_topics: topics.length
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * POST /chapters - Create new chapter (admin only)
 */
export async function createChapter(req, res, next) {
  try {
    const chapterData = req.body;

    // Validate required fields per DeepSeek schema
    const requiredFields = ['title', 'chapter_number', 'book_id'];
    for (const field of requiredFields) {
      if (!chapterData[field]) {
        return res.status(400).json(error(`${field} is required`, 'VALIDATION_ERROR'));
      }
    }

    const chapter = await chapterService.createChapter(chapterData);
    res.status(201).json(success(chapter, 'Chapter created successfully'));
  } catch (err) {
    if (err.code === 'CHAPTER_EXISTS') {
      return res.status(409).json(error(err.message, 'CHAPTER_EXISTS'));
    }
    next(err);
  }
}

/**
 * PUT /chapters/:id - Update chapter (admin only)
 */
export async function updateChapter(req, res, next) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const chapter = await chapterService.updateChapter(id, updateData);
    res.json(success(chapter, 'Chapter updated successfully'));
  } catch (err) {
    if (err.code === 'CHAPTER_NOT_FOUND') {
      return res.status(404).json(error('Chapter not found', 'CHAPTER_NOT_FOUND'));
    }
    next(err);
  }
}

/**
 * DELETE /chapters/:id - Delete chapter (admin only)
 * Cascades to delete all topics in the chapter
 */
export async function deleteChapter(req, res, next) {
  try {
    const { id } = req.params;
    await chapterService.deleteChapter(id);
    res.json(success(null, 'Chapter deleted successfully'));
  } catch (err) {
    if (err.code === 'CHAPTER_NOT_FOUND') {
      return res.status(404).json(error('Chapter not found', 'CHAPTER_NOT_FOUND'));
    }
    next(err);
  }
}
