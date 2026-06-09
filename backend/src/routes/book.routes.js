import { Router } from 'express';
import * as bookController from '../controllers/book.controller.js';
import { requireAdmin, optionalAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Public routes
router.get('/', apiLimiter, optionalAuth, bookController.getBooks);
router.get('/:id', apiLimiter, optionalAuth, bookController.getBook);
router.get('/slug/:slug', apiLimiter, optionalAuth, bookController.getBookBySlug);
router.get('/:id/chapters', apiLimiter, optionalAuth, bookController.getBookChapters);

// Admin routes
router.post('/', requireAdmin, bookController.createBook);
router.put('/:id', requireAdmin, bookController.updateBook);
router.delete('/:id', requireAdmin, bookController.deleteBook);

export default router;
