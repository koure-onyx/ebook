import { UserVault } from '../models/UserVault.js';
import { Topic } from '../models/Topic.js';

/**
 * Get user's vault items by type
 */
export async function getUserVaultItems(userId, type = null) {
  const query = { user_id: userId };
  if (type) {
    query.type = type;
  }

  const items = await UserVault.find(query)
    .populate('topic_id', 'title slug')
    .populate('chapter_id', 'title slug')
    .sort({ createdAt: -1 });

  return items;
}

/**
 * Add item to user's vault
 */
export async function addToVault(userId, vaultData) {
  const { topic_id, type, flashcard, video, highlight, note } = vaultData;

  // Validate topic exists
  const topic = await Topic.findById(topic_id);
  if (!topic) {
    const error = new Error('Topic not found');
    error.code = 'TOPIC_NOT_FOUND';
    throw error;
  }

  // Create vault item
  const vaultItem = await UserVault.create({
    user_id: userId,
    topic_id,
    chapter_id: topic.chapter_id,
    program_id: topic.program_id,
    type,
    flashcard: type === 'flashcard' ? flashcard : undefined,
    video: type === 'video_link' ? video : undefined,
    highlight: type === 'highlight' ? highlight : undefined,
    note: type === 'note' ? note : undefined,
  });

  return vaultItem;
}

/**
 * Remove item from vault
 */
export async function removeFromVault(userId, itemId) {
  const result = await UserVault.findOneAndDelete({
    _id: itemId,
    user_id: userId
  });

  if (!result) {
    const error = new Error('Vault item not found');
    error.code = 'VAULT_ITEM_NOT_FOUND';
    throw error;
  }

  return result;
}

/**
 * Update vault item review status
 */
export async function updateReviewStatus(userId, itemId, reviewStatus) {
  const item = await UserVault.findOneAndUpdate(
    { _id: itemId, user_id: userId },
    {
      review_status: reviewStatus,
      last_reviewed: new Date()
    },
    { new: true }
  );

  if (!item) {
    const error = new Error('Vault item not found');
    error.code = 'VAULT_ITEM_NOT_FOUND';
    throw error;
  }

  return item;
}

/**
 * Check if topic item exists in vault
 */
export async function isItemInVault(userId, topicId, type = null) {
  const query = { user_id: userId, topic_id: topicId };
  if (type) {
    query.type = type;
  }

  const count = await UserVault.countDocuments(query);
  return count > 0;
}

/**
 * Get vault statistics
 */
export async function getVaultStats(userId) {
  const stats = await UserVault.aggregate([
    { $match: { user_id: userId } },
    {
      $group: {
        _id: '$type',
        count: { $sum: 1 }
      }
    }
  ]);

  const result = {
    total: 0,
    flashcards: 0,
    bookmarks: 0,
    notes: 0,
    highlights: 0,
    video_links: 0
  };

  stats.forEach(stat => {
    const type = stat._id;
    result.total += stat.count;
    if (type === 'flashcard') result.flashcards = stat.count;
    else if (type === 'bookmark') result.bookmarks = stat.count;
    else if (type === 'note') result.notes = stat.count;
    else if (type === 'highlight') result.highlights = stat.count;
    else if (type === 'video_link') result.video_links = stat.count;
  });

  return result;
}
