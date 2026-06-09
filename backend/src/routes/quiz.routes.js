import { Router } from 'express';
import * as quizController from '../controllers/quiz.controller.js';
import { requireAuth, requireAdmin, optionalAuth } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// Public routes - accessible without login
router.get('/:id', optionalAuth, quizController.getQuiz);
router.get('/topic/:topicId', optionalAuth, quizController.getQuizzesByTopic);
router.get('/topic/:topicId/random', optionalAuth, quizController.getRandomQuiz);

// Authenticated routes - require login to submit
router.post('/:id/submit', requireAuth, quizController.submitQuiz);

// Admin routes
router.post('/', requireAdmin, quizController.createQuiz);

export default router;
