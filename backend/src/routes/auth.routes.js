import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.js';
// import { validateLogin } from '../middleware/validation.middleware.js';

// POST /api/auth/login - Admin & Student Login
router.post('/login', authController.login);

// GET /api/auth/getMe - Get current user profile
router.get('/getMe', requireAuth, authController.getMe);

// POST /api/auth/logout - Logout (optional, mostly client-side token removal)
router.post('/logout', requireAuth, authController.logout);

router.post('/onboarding', requireAuth, authController.completeOnboarding);

router.post('/dev-login', authController.devLogin); // DEV ONLY - remove before production   

export default router;
