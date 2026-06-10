import { User } from '../models/User.js';
import { Book } from '../models/Book.js';
import { Topic } from '../models/Topic.js';
import { UserProgress } from '../models/UserProgress.js';
import { Subscription } from '../models/Subscription.js';

/**
 * Get dashboard data for student — shape matches frontend DashboardData interface.
 */
export async function getStudentDashboard(userId) {
  const [user, progressList, books, hotTopics] = await Promise.all([
    User.findById(userId),
    UserProgress.find({ user_id: userId })
      .sort({ last_accessed: -1 })
      .populate({
        path: 'topic_id',
        select: 'title slug chapter_id exam_frequency_count',
        populate: { 
          path: 'chapter_id', 
          select: 'title chapter_number book_id', 
          populate: { path: 'book_id', select: 'title subject_slug' } 
        },
      }),
    Book.find()
      .sort({ createdAt: -1 })
      .limit(6)
      .populate('board_id', 'name short_code slug')
      .populate('program_id', 'name slug'),
    Topic.find({ exam_frequency_count: { $gt: 0 } })
      .sort({ exam_frequency_count: -1 })
      .limit(6)
      .select('title slug exam_frequency_count'),
  ]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const totalStudied = progressList.length;
  const mastered = progressList.filter(p => p.mastery_status === 'mastered').length;
  const examReadiness = totalStudied > 0 ? Math.round((mastered / totalStudied) * 100) : 0;

  // XP: treat each mastered topic as 10 XP, each viewed as 2 XP
  const totalXP = mastered * 10 + (totalStudied - mastered) * 2;
  const currentLevel = Math.max(1, Math.floor(totalXP / 100) + 1);
  const xpToNextLevel = 100 - (totalXP % 100);

  // Weekly activity — last 7 days
  const now = Date.now();
  const studiedDays = Array.from({ length: 7 }, (_, i) => {
    const dayStart = new Date(now - (6 - i) * 86400000);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 86400000);
    return progressList.some(p => {
      const d = new Date(p.last_accessed);
      return d >= dayStart && d < dayEnd;
    });
  });

  // Streak — count consecutive days ending today that have activity
  let streakDays = 0;
  for (let i = 6; i >= 0; i--) {
    if (studiedDays[i]) streakDays++;
    else break;
  }

  // XP this week — activity in last 7 days
  const weekAgo = new Date(now - 7 * 86400000);
  const weekProgress = progressList.filter(p => new Date(p.last_accessed) >= weekAgo);
  const xpThisWeek =
    weekProgress.filter(p => p.mastery_status === 'mastered').length * 10 +
    weekProgress.filter(p => p.mastery_status !== 'mastered').length * 2;

  // ── Recent chapters (last 5 in-progress topics) ──────────────────────────
  const recentChapters = progressList
    .filter(p => p.topic_id && p.topic_id.chapter_id && p.topic_id.chapter_id.book_id)
    .slice(0, 5)
    .map(p => ({
      _id: p.topic_id._id,
      bookTitle: p.topic_id.chapter_id.book_id.title,
      chapterTitle: `Ch ${p.topic_id.chapter_id.chapter_number}: ${p.topic_id.chapter_id.title}`,
      progress: p.mastery_status === 'mastered' ? 100 : 40,
      href: `/books/${p.topic_id.chapter_id.book_id.subject_slug}/${p.topic_id.chapter_id.chapter_number}/${p.topic_id.slug}`,
    }));

  // ── Books ─────────────────────────────────────────────────────────────────
  const mappedBooks = books.map(b => ({
    _id: b._id,
    title: b.title,
    subject: b.subject,
    subject_icon: b.subject_icon,
    subject_slug: b.subject_slug,
    program_name: b.program_id?.name || '',
    program_slug: b.program_id?.slug || '',
    board: b.board_id?.name || '',
    board_short_code: b.board_id?.short_code || b.board_id?.slug || '',
    board_slug: b.board_id?.slug || '',
    total_topics: b.total_topics || 0,
    topicsRead: progressList.filter(
      p => p.topic_id?.chapter_id?.book_id?._id?.toString() === b._id.toString() && p.mastery_status === 'mastered'
    ).length,
  }));

  // ── Hot topics ────────────────────────────────────────────────────────────
  const mappedHotTopics = hotTopics.map(t => ({
    _id: t._id,
    title: t.title,
    slug: t.slug,
    exam_frequency_count: t.exam_frequency_count,
  }));

  return {
    firstName: user?.name?.split(' ')[0] || 'Student',
    welcome_message: null, // computed on frontend from time of day
    stats: {
      examReadiness,
      topicsMastered: mastered,
      xpThisWeek,
      currentLevel,
      xpToNextLevel,
      streakDays,
      topicsStudied: totalStudied,
      studiedDays,
    },
    recentChapters,
    books: mappedBooks,
    hotTopics: mappedHotTopics,
    vaultItems: [],   // populated by vault service separately; keep empty for now
    recentQuizzes: [], // populated by quiz service separately; keep empty for now
  };
}

/**
 * Get admin dashboard metrics
 */
export async function getAdminMetrics() {
  const [totalUsers, totalBooks, totalTopics, activeSubscriptions] = await Promise.all([
    User.countDocuments(),
    Book.countDocuments(),
    Topic.countDocuments(),
    Subscription.countDocuments({ status: 'active' }),
  ]);

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .select('name email role createdAt');

  const booksBySubject = await Book.aggregate([
    { $group: { _id: '$subject', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const userGrowth = await User.aggregate([
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);

  return {
    total_users: totalUsers,
    total_books: totalBooks,
    total_topics: totalTopics,
    active_subscriptions: activeSubscriptions,
    total_chapters: 0, // Placeholder if not counted yet
    active_users_today: 0, // Placeholder
    ingestion_queue_length: 0, // Placeholder
    recentUsers,
    booksBySubject,
    userGrowth
  };
}

/**
 * Get content health metrics
 */
export async function getContentHealth() {
  const [booksWithoutChapters, topicsWithoutContent] = await Promise.all([
    Book.aggregate([
      { $lookup: { from: 'chapters', localField: '_id', foreignField: 'book_id', as: 'chapters' } },
      { $match: { chapters: { $size: 0 } } },
      { $count: 'count' },
    ]),
    Topic.aggregate([
      { $match: { $or: [
        { raw_text: null }, { raw_text: '' }, { raw_text: { $exists: false } },
        { clean_html: null }, { clean_html: '' }, { clean_html: { $exists: false } }
      ] } },
      { $count: 'count' },
    ]),
  ]);

  return {
    books_with_no_chapters: booksWithoutChapters[0]?.count || 0,
    chapters_with_no_topics: 0, // Placeholder
    topics_with_no_content: topicsWithoutContent[0]?.count || 0,
    orphaned_topics: 0 // Placeholder
  };
}
