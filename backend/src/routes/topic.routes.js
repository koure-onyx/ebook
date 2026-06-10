import { Router } from 'express';
import * as topicController from '../controllers/topic.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/:id', optionalAuth, topicController.getTopic);
router.get('/slug/:slug', optionalAuth, topicController.getTopicBySlug);
router.get('/by-nested-slug/:boardSlug/:programSlug/:subjectSlug/:chapterSlug/:topicSlug', optionalAuth, topicController.getNestedTopic);
router.get('/chapter/:chapterId', optionalAuth, topicController.getTopicsByChapter);
router.get('/:id/adjacent', optionalAuth, topicController.getAdjacentTopics);
router.get('/search', optionalAuth, topicController.searchTopics);
router.get('/hot', optionalAuth, topicController.getHotTopics);

export default router;
