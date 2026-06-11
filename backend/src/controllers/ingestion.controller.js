import { success } from '../utils/apiResponse.js';
import * as ingestionService from '../services/ingestion.service.js';

export async function ingestBook(req, res, next) {
  try {
    const validation = ingestionService.validateIngestionData(req.body);
    if (!validation.isValid) {
      console.error('[INGESTION] Validation failed:', validation.errors);
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid ingestion data',
          details: validation.errors
        }
      });
    }

    const book = await ingestionService.ingestBook(req.body, req.user?._id);
    if (!book?.success) {
      console.error('[INGESTION] Service failed:', book?.error, book?.log || []);
      return res.status(400).json({
        success: false,
        error: {
          code: 'INGESTION_FAILED',
          message: book?.error || 'Book ingestion failed',
          details: book?.log || []
        }
      });
    }

    res.status(201).json(success(book, 'Book ingested successfully'));
  } catch (err) {
    next(err);
  }
}

export async function bulkIngestTopics(req, res, next) {
  try {
    const result = await ingestionService.bulkUpsertTopics(req.body.topics);
    res.json(success(result, 'Topics ingested successfully'));
  } catch (err) {
    next(err);
  }
}

export async function getIngestionStats(req, res, next) {
  try {
    const stats = await ingestionService.getIngestionStats();
    res.json(success(stats));
  } catch (err) {
    next(err);
  }
}
