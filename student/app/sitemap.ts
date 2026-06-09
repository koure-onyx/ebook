import connectDB from '@studyvault/db/connect';
import type { MetadataRoute } from 'next';
import { ObjectId } from 'mongodb';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const mongooseInstance = await connectDB();
    const db = mongooseInstance.connection.db;
    
    // Base URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://studyvault.pk';
    
    const sitemapUrls: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
      {
        url: `${baseUrl}/dashboard`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/pricing`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
    ];

    // Fetch Programs
    const programsCollection = db.collection('programs');
    const programs = await programsCollection.find({ is_active: true }).toArray();
    const boardsCollection = db.collection('boards');

    for (const program of programs) {
      // Fetch Books/Subjects for this program
      const booksCollection = db.collection('books');
      const books = await booksCollection.find({ 
        program_id: program._id,
        is_live: true 
      }).toArray();

      const boardIds = [...new Set(books.map((book) => book.board_id).filter(Boolean).map((id) => String(id)))];
      const boards = boardIds.length > 0
        ? await boardsCollection.find({ _id: { $in: boardIds.map((id) => new ObjectId(id)) } }).toArray()
        : [];
      const boardMap = new Map(boards.map((board) => [String(board._id), board]));

      for (const book of books) {
        const board = boardMap.get(String(book.board_id));
        const boardSlug = board?.short_code || board?.slug;
        const bookPath = boardSlug
          ? `${baseUrl}/${boardSlug}/${program.slug}/${book.subject_slug}`
          : `${baseUrl}/${program.slug}/${book.subject_slug}`;
        sitemapUrls.push({
          url: bookPath,
          lastModified: new Date(book.updatedAt || book.createdAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        });

        // Fetch Chapters
        const chaptersCollection = db.collection('chapters');
        const chapters = await chaptersCollection.find({ 
          book_id: book._id,
          is_live: true 
        }).sort({ display_order: 1 }).toArray();

        for (const chapter of chapters) {
          const chapterPath = boardSlug
            ? `${baseUrl}/${boardSlug}/${program.slug}/${book.subject_slug}/${chapter.slug}`
            : `${baseUrl}/${program.slug}/${book.subject_slug}/${chapter.slug}`;
          sitemapUrls.push({
            url: chapterPath,
            lastModified: new Date(chapter.updatedAt || chapter.createdAt),
            changeFrequency: 'weekly',
            priority: 0.75,
          });

          // Fetch Topics
          const topicsCollection = db.collection('topics');
          const topics = await topicsCollection.find({ 
            chapter_id: chapter._id,
            is_live: true 
          }).sort({ display_order: 1 }).toArray();

          for (const topic of topics) {
            const topicPath = boardSlug
              ? `${baseUrl}/${boardSlug}/${program.slug}/${book.subject_slug}/${chapter.slug}/${topic.slug}`
              : `${baseUrl}/${program.slug}/${book.subject_slug}/${chapter.slug}/${topic.slug}`;
            sitemapUrls.push({
              url: topicPath,
              lastModified: new Date(topic.updatedAt || topic.createdAt),
              changeFrequency: 'daily',
              priority: 0.9,
            });
          }
        }
      }
    }

    return sitemapUrls;
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return base sitemap even if DB fails
    return [
      {
        url: process.env.NEXT_PUBLIC_APP_URL || 'https://studyvault.pk',
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
    ];
  }
}
