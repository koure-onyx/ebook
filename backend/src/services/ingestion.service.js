import { Book } from '../models/Book.js';
import { Chapter } from '../models/Chapter.js';
import { Topic } from '../models/Topic.js';
import { generateSlug } from '../utils/slug.js';

/**
 * Ingest a complete book with chapters and topics
 */
export async function ingestBook(bookData) {
  const { title, subject, classLevel, board, program, chapters, ...rest } = bookData;

  // Find or create book
  const slug = generateSlug(title);
  let book = await Book.findOne({ slug });

  if (!book) {
    book = await Book.create({
      title,
      slug,
      subject,
      classLevel,
      board,
      program,
      ...rest
    });
  } else {
    // Update existing book
    await Book.findByIdAndUpdate(book._id, {
      subject,
      classLevel,
      board,
      program,
      ...rest
    });
  }

  // Process chapters
  if (chapters && Array.isArray(chapters)) {
    for (const chapterData of chapters) {
      await ingestChapter(book._id, chapterData);
    }
  }

  return book;
}

/**
 * Ingest a chapter with its topics
 */
export async function ingestChapter(bookId, chapterData) {
  const { title, chapterNumber, topics, ...rest } = chapterData;

  // Find or create chapter
  const chapter = await Chapter.findOneAndUpdate(
    { book: bookId, chapterNumber },
    {
      book: bookId,
      title,
      chapterNumber,
      slug: createSlug(title),
      ...rest
    },
    { upsert: true, new: true }
  );

  // Process topics
  if (topics && Array.isArray(topics)) {
    for (const topicData of topics) {
      await ingestTopic(bookId, chapter._id, topicData);
    }
  }

  return chapter;
}

/**
 * Ingest a single topic
 */
export async function ingestTopic(bookId, chapterId, topicData) {
  const { title, topicNumber, content, ...rest } = topicData;

  const slug = createSlug(title);

  const topic = await Topic.findOneAndUpdate(
    { book: bookId, chapter: chapterId, slug },
    {
      book: bookId,
      chapter: chapterId,
      title,
      slug,
      topicNumber: topicNumber || 0,
      content: content || '',
      ...rest
    },
    { upsert: true, new: true }
  );

  return topic;
}

/**
 * Bulk upsert topics
 */
export async function bulkUpsertTopics(topicsData) {
  const operations = topicsData.map(data => ({
    updateOne: {
      filter: { 
        book: data.book, 
        chapter: data.chapter, 
        slug: data.slug || createSlug(data.title) 
      },
      update: {
        $set: {
          title: data.title,
          content: data.content || '',
          topicNumber: data.topicNumber || 0,
          ...data
        }
      },
      upsert: true
    }
  }));

  const result = await Topic.bulkWrite(operations);
  return result;
}

/**
 * Validate ingestion data structure
 */
export function validateIngestionData(data) {
  const errors = [];

  if (!data.title) {
    errors.push('Book title is required');
  }

  if (!data.subject) {
    errors.push('Book subject is required');
  }

  if (!data.classLevel) {
    errors.push('Book classLevel is required');
  }

  if (data.chapters && !Array.isArray(data.chapters)) {
    errors.push('Chapters must be an array');
  }

  if (data.chapters) {
    data.chapters.forEach((chapter, index) => {
      if (!chapter.title) {
        errors.push(`Chapter ${index}: title is required`);
      }
      if (chapter.topics && !Array.isArray(chapter.topics)) {
        errors.push(`Chapter ${index}: topics must be an array`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Get ingestion status/progress
 */
export async function getIngestionStats() {
  const [bookCount, chapterCount, topicCount] = await Promise.all([
    Book.countDocuments(),
    Chapter.countDocuments(),
    Topic.countDocuments()
  ]);

  return {
    totalBooks: bookCount,
    totalChapters: chapterCount,
    totalTopics: topicCount
  };
}
