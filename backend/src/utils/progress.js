import { Topic } from '../models/Topic.js';
import { UserProgress } from '../models/UserProgress.js';

/**
 * Calculate mastery percentage for a user on a specific topic
 * Based on: completed content blocks, quiz scores, and repetition count
 */
export const calculateMastery = (userProgress, topic) => {
  if (!userProgress || !topic) return 0;

  const totalBlocks = topic.content_blocks?.length || 0;
  if (totalBlocks === 0) return 0;

  const completedBlocks = userProgress.completed_content_blocks?.length || 0;
  const blockCompletionScore = (completedBlocks / totalBlocks) * 0.6; // 60% weight

  const quizScore = userProgress.best_quiz_score || 0;
  const quizComponent = (quizScore / 100) * 0.4; // 40% weight

  const rawMastery = (blockCompletionScore + quizComponent) * 100;
  return Math.min(100, Math.round(rawMastery));
};

/**
 * Determine next review date based on mastery and last reviewed date
 * Implements a simplified spaced repetition algorithm
 */
export const calculateNextReview = (mastery, lastReviewedAt) => {
  if (mastery >= 90) return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  if (mastery >= 75) return new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14 days
  if (mastery >= 50) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);  // 7 days
  if (mastery >= 25) return new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);  // 3 days
  return new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);                     // 1 day
};

/**
 * Update user progress mastery status based on calculated score
 */
export const updateMasteryStatus = async (userId, topicId) => {
  const userProgress = await UserProgress.findOne({ userId, topicId }).populate('topic');
  if (!userProgress) return null;

  const topic = userProgress.topic;
  const mastery = calculateMastery(userProgress, topic);
  
  let status = 'not_started';
  if (mastery > 0) status = 'in_progress';
  if (mastery >= 50) status = 'proficient';
  if (mastery >= 90) status = 'mastered';

  userProgress.mastery_status = status;
  userProgress.mastery_percentage = mastery;
  userProgress.next_review_at = calculateNextReview(mastery, userProgress.last_reviewed_at);
  
  await userProgress.save();
  return userProgress;
};

export default { calculateMastery, calculateNextReview, updateMasteryStatus };
