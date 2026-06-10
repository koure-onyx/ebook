import { Router } from 'express';
import authRoutes from './auth.routes.js';
import bookRoutes from './book.routes.js';
import chapterRoutes from './chapter.routes.js';
import topicRoutes from './topic.routes.js';
import vaultRoutes from './vault.routes.js';
import progressRoutes from './progress.routes.js';
import quizRoutes from './quiz.routes.js';
import searchRoutes from './search.routes.js';
import aiRoutes from './ai.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import ingestionRoutes from './ingestion.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/books', bookRoutes);
router.use('/chapters', chapterRoutes);
router.use('/topics', topicRoutes);
router.use('/vault', vaultRoutes);
router.use('/progress', progressRoutes);
router.use('/quizzes', quizRoutes);
router.use('/search', searchRoutes);
router.use('/ai', aiRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ingestion', ingestionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
