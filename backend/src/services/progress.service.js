import { UserProgress } from '../models/UserProgress.js';
import { Topic } from '../models/Topic.js';

/**
 * Calculate mastery percentage based on quiz scores and reading progress
 * 70% weight on quiz score, 30% weight on reading progress
 */
export function calculateMasteryPercentage(quizScore, scrollDepthPercent) {
  const quizWeight = 0.7;
  const readingWeight = 0.3;
  
  const normalizedQuizScore = quizScore || 0;
  const normalizedReadingScore = scrollDepthPercent || 0;
  
  const mastery = (normalizedQuizScore * quizWeight) + (normalizedReadingScore * readingWeight);
  return Math.min(100, Math.round(mastery * 100) / 100);
}

/**
 * Determine mastery status based on percentage
 */
export function getMasteryStatus(percentage) {
  if (percentage >= 80) return 'mastered';
  if (percentage >= 30) return 'in_progress';
  return 'locked';
}

/**
 * Calculate next review date using spaced repetition algorithm
 */
export function calculateNextReviewDate(lastReviewDate, masteryLevel) {
  if (!lastReviewDate) return new Date();
  
  const intervals = {
    'not_reviewed': 0,
    'reviewing': 3,
    'mastered': 7
  };
  
  const daysToAdd = intervals[masteryLevel] || 1;
  const nextReview = new Date(lastReviewDate);
  nextReview.setDate(nextReview.getDate() + daysToAdd);
  
  return nextReview;
}

/**
 * Get user progress for a topic
 */
export async function getTopicProgress(userId, topicId) {
  const progress = await UserProgress.findOne({
    user_id: userId,
    topic_id: topicId
  }).populate('topic_id', 'title slug');

  return progress;
}

/**
 * Get user progress for multiple topics
 */
export async function getTopicsProgress(userId, topicIds) {
  const progressList = await UserProgress.find({
    user_id: userId,
    topic_id: { $in: topicIds }
  });

  return progressList;
}

/**
 * Update or create topic progress with mastery calculation
 */
export async function updateTopicProgress(userId, topicId, updateData) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    const error = new Error('Topic not found');
    error.code = 'TOPIC_NOT_FOUND';
    throw error;
  }

  // Calculate mastery percentage if we have the required data
  let progressPercent = updateData.progress_percent;
  let masteryStatus = updateData.mastery_status;
  
  if (updateData.highest_quiz_score !== undefined || updateData.scroll_depth_percent !== undefined) {
    const existingProgress = await UserProgress.findOne({ user_id: userId, topic_id: topicId });
    const quizScore = updateData.highest_quiz_score ?? existingProgress?.highest_quiz_score ?? 0;
    const scrollDepth = updateData.scroll_depth_percent ?? existingProgress?.scroll_depth_percent ?? 0;
    
    progressPercent = calculateMasteryPercentage(quizScore, scrollDepth);
    masteryStatus = getMasteryStatus(progressPercent);
  }

  const progress = await UserProgress.findOneAndUpdate(
    { user_id: userId, topic_id: topicId },
    {
      ...updateData,
      user_id: userId,
      topic_id: topicId,
      progress_percent: progressPercent,
      mastery_status: masteryStatus,
      last_accessed: new Date()
    },
    { upsert: true, new: true, runValidators: true }
  );

  return progress;
}

/**
 * Mark topic as completed
 */
export async function completeTopic(userId, topicId) {
  const topic = await Topic.findById(topicId);
  if (!topic) {
    const error = new Error('Topic not found');
    error.code = 'TOPIC_NOT_FOUND';
    throw error;
  }

  const progress = await UserProgress.findOneAndUpdate(
    { user_id: userId, topic_id: topicId },
    {
      user_id: userId,
      topic_id: topicId,
      is_read: true,
      scroll_depth_percent: 100,
      mastery_status: 'mastered',
      progress_percent: 100,
      last_accessed: new Date()
    },
    { upsert: true, new: true }
  );

  return progress;
}

/**
 * Get user's overall progress stats
 */
export async function getUserProgressStats(userId) {
  const progressList = await UserProgress.find({ user_id: userId });

  const totalTopics = progressList.length;
  const completedTopics = progressList.filter(p => p.mastery_status === 'mastered').length;
  const inProgressTopics = progressList.filter(p => p.mastery_status === 'in_progress').length;
  const lockedTopics = progressList.filter(p => p.mastery_status === 'locked' || !p.mastery_status).length;
  
  const totalXP = progressList.reduce((sum, p) => sum + (p.xp_earned || 0), 0);
  const totalTimeSpent = progressList.reduce((sum, p) => sum + (p.time_spent_seconds || 0), 0);

  return {
    totalTopics,
    completedTopics,
    inProgressTopics,
    lockedTopics,
    completionRate: totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0,
    totalXP,
    totalTimeSpentSeconds: totalTimeSpent,
    averageMastery: totalTopics > 0 
      ? Math.round(progressList.reduce((sum, p) => sum + (p.progress_percent || 0), 0) / totalTopics)
      : 0
  };
}

/**
 * Get user's recent activity
 */
export async function getRecentActivity(userId, limit = 10) {
  const activity = await UserProgress.find({ user_id: userId })
    .sort({ last_accessed: -1 })
    .limit(limit)
    .populate('topic_id', 'title slug')
    .populate('chapter_id', 'title slug')
    .populate('book_id', 'title slug');

  return activity;
}

/**
 * Get streak data (consecutive days of activity)
 */
export async function getStreakData(userId) {
  const progressList = await UserProgress.find({
    user_id: userId,
    last_accessed: { $exists: true }
  }).sort({ last_accessed: -1 });

  if (progressList.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = [...new Set(progressList.map(p => {
    const date = new Date(p.last_accessed);
    date.setHours(0, 0, 0, 0);
    return date.getTime();
  }))].sort((a, b) => b - a);

  for (let i = 0; i < dates.length; i++) {
    const currentDate = new Date(dates[i]);
    const diffDays = Math.floor((today - currentDate) / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      tempStreak++;
      if (i === 0 && diffDays <= 1) {
        currentStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }

    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    
    // Move today forward for next iteration
    const nextDay = new Date(currentDate);
    nextDay.setDate(nextDay.getDate() - 1);
    nextDay.setHours(0, 0, 0, 0);
  }

  return { currentStreak, longestStreak };
}

/**
 * Award XP for topic activity
 */
export async function awardXP(userId, topicId, xpAmount) {
  const progress = await UserProgress.findOneAndUpdate(
    { user_id: userId, topic_id: topicId },
    {
      $inc: { xp_earned: xpAmount },
      last_accessed: new Date()
    },
    { upsert: true, new: true }
  );

  return progress;
}
