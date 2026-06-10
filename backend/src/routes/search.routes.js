import { Router } from 'express';
import * as searchController from '../controllers/search.controller.js';
import { optionalAuth } from '../middleware/auth.js';
import { apiLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/', apiLimiter, optionalAuth, searchController.globalSearch);
router.get('/filtered', apiLimiter, optionalAuth, searchController.searchWithFilters);
router.get('/suggestions', apiLimiter, optionalAuth, searchController.getSearchSuggestions);

export default router;
