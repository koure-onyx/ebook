import app from './app.js';
import { connectDB } from './config/db.js';
import { env } from './config/env.js';
import { Chapter } from './models/Chapter.js';
import { Book } from './models/Book.js';
import { Topic } from './models/Topic.js';
import { generateSlug } from './utils/slug.js';

const PORT = env.PORT || 5000;

/**
 * Emergency backfill function to fix legacy chapters missing book_slug and subject_slug
 */
async function emergencyBackfill() {
  try {
    // Find chapters missing either book_slug or subject_slug
    const chaptersWithoutSlugs = await Chapter.find({
      $or: [
        { book_slug: { $exists: false } },
        { book_slug: null },
        { book_slug: '' },
        { subject_slug: { $exists: false } },
        { subject_slug: null },
        { subject_slug: '' }
      ]
    }).limit(1000);

    if (chaptersWithoutSlugs.length > 0) {
      console.log(`[BACKFILL] Found ${chaptersWithoutSlugs.length} legacy chapters missing slug fields. Backfilling...`);

      let updatedCount = 0;
      let failedCount = 0;

      for (const ch of chaptersWithoutSlugs) {
        try {
          // Locate the parent book entry to pull its slug and subject_slug
          const parentBook = await Book.findById(ch.book_id).select('slug subject_slug').lean();

          if (parentBook && parentBook.slug) {
            ch.book_slug = parentBook.slug;
            ch.subject_slug = parentBook.subject_slug || parentBook.slug;
            await ch.save();
            updatedCount++;
          } else {
            console.warn(`[BACKFILL] Could not find parent book for chapter ${ch._id}`);
            failedCount++;
            continue;
          }
        } catch (err) {
          console.error(`[BACKFILL] Error updating chapter ${ch._id}:`, err.message);
          failedCount++;
        }
      }

      console.log(`[BACKFILL] Successfully updated ${updatedCount} chapters. Failed: ${failedCount}`);
      console.log('[BACKFILL] Data sync successfully established.');
    } else {
      console.log('[BACKFILL] All chapters have proper slug fields. No action needed.');
    }
  } catch (err) {
    console.error('[BACKFILL] Fatal error during backfill:', err.message);
  }
}

/**
 * Emergency backfill function to fix legacy topics missing slug fields
 */
async function backfillTopicSlugs() {
  try {
    // Find topics with missing, null, or empty slug fields
    const topicsWithoutSlugs = await Topic.find({
      $or: [
        { slug: { $exists: false } },
        { slug: null },
        { slug: '' }
      ]
    }).limit(1000);

    if (topicsWithoutSlugs.length > 0) {
      console.log(`[TOPIC BACKFILL] Found ${topicsWithoutSlugs.length} legacy topics missing slug fields. Backfilling...`);

      let updatedCount = 0;
      let failedCount = 0;

      for (const topic of topicsWithoutSlugs) {
        try {
          // Generate slug from topic title
          const generatedSlug = generateSlug(topic.title);

          if (generatedSlug) {
            topic.slug = generatedSlug;
            await topic.save();
            updatedCount++;
            console.log(`[TOPIC BACKFILL] Updated topic "${topic.title}" -> slug: "${generatedSlug}"`);
          } else {
            console.warn(`[TOPIC BACKFILL] Could not generate slug for topic ${topic._id} (title: "${topic.title}")`);
            failedCount++;
          }
        } catch (err) {
          console.error(`[TOPIC BACKFILL] Error updating topic ${topic._id}:`, err.message);
          failedCount++;
        }
      }

      console.log(`[TOPIC BACKFILL] Successfully updated ${updatedCount} topics. Failed: ${failedCount}`);
      console.log('[TOPIC BACKFILL] Topic slug sync successfully established.');
    } else {
      console.log('[TOPIC BACKFILL] All topics have proper slug fields. No action needed.');
    }
  } catch (err) {
    console.error('[TOPIC BACKFILL] Fatal error during topic backfill:', err.message);
  }
}

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Run emergency backfill for legacy chapters
    await emergencyBackfill();

    // Run emergency backfill for legacy topics
    await backfillTopicSlugs();

    // Start server
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Environment: ${env.NODE_ENV}`);
      console.log(`   Student Origin: ${env.STUDENT_ORIGIN}`);
      console.log(`   Admin Origin: ${env.ADMIN_ORIGIN}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
      });
    });

  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
