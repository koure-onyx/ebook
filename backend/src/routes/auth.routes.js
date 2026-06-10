import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Google OAuth only - no email/password auth
router.post('/google', authLimiter, authController.googleAuth);

// Protected routes
router.get('/me', requireAuth, authController.getMe);
router.post('/onboarding', requireAuth, authController.completeOnboarding);

// Logout (works with or without auth)
router.all('/logout', authController.logout);

export default router;
