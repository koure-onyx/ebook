import { Router } from 'express';
import * as ingestionController from '../controllers/ingestion.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

const router = Router();

// requireAuth decodes JWT and sets req.user, then requireAdmin checks role
router.use(requireAuth, requireAdmin);

router.post('/book', ingestionController.ingestBook);
router.post('/topics/bulk', ingestionController.bulkIngestTopics);
router.get('/stats', ingestionController.getIngestionStats);

export default router;
