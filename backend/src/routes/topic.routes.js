import { Router } from 'express';
import * as topicController from '../controllers/topic.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

// IMPORTANT: Specific named routes MUST come before wildcard /:id routes
// or Express will match /:id for 'by-nested-slug', 'slug', 'search', 'hot'
router.get('/by-nested-slug/:boardSlug/:programSlug/:subjectSlug/:chapterSlug/:topicSlug', optionalAuth, topicController.getNestedTopic);
router.get('/slug/:slug', optionalAuth, topicController.getTopicBySlug);
router.get('/chapter/:chapterId', optionalAuth, topicController.getTopicsByChapter);
router.get('/search', optionalAuth, topicController.searchTopics);
router.get('/hot', optionalAuth, topicController.getHotTopics);
// Wildcard routes last
router.get('/:id/adjacent', optionalAuth, topicController.getAdjacentTopics);
router.get('/:id', optionalAuth, topicController.getTopic);

export default router;

