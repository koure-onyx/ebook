import { Router } from 'express';
import * as chapterController from '../controllers/chapter.controller.js';
import { optionalAuth, requireAdmin } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public routes
router.get('/:id', optionalAuth, chapterController.getChapter);
router.get('/slug/:slug', optionalAuth, chapterController.getChapterBySlug);
router.get('/:chapterId/topics', optionalAuth, chapterController.getChapterTopics);

// Book-chapter relationship routes
router.get('/book/:bookId', optionalAuth, chapterController.getBookChapters);

// Admin routes
router.post('/', requireAdmin, chapterController.createChapter);
router.put('/:id', requireAdmin, chapterController.updateChapter);
router.delete('/:id', requireAdmin, chapterController.deleteChapter);

export default router;
