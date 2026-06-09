import { Topic } from '../models/Topic.js';
import { Chapter } from '../models/Chapter.js';
import { Book } from '../models/Book.js';
import { Board } from '../models/Board.js';
import { Program } from '../models/Program.js';
import { UserProgress } from '../models/UserProgress.js';
import { generateUniqueSlug } from '../utils/slug.js';
import { renderContentBlock, validateContentBlock } from '../utils/contentBlocks.js';

/**
 * Get topic by ID with full population
 */
export const getTopicById = async (topicId, userId = null) => {
  const query = { _id: topicId };
  
  const topic = await Topic.findOne(query)
    .populate('chapter', 'title slug order learning_outcomes')
    .populate('book', 'title slug edition metadata')
    .populate('program', 'name slug subject')
    .populate('board', 'name slug location');
  
  if (!topic) return null;
  
  // Render all content blocks for display
  const renderedBlocks = topic.content_blocks?.map(block => renderContentBlock(block)) || [];
  
  let userProgress = null;
  if (userId) {
    userProgress = await UserProgress.findOne({ userId, topicId });
  }
  
  return {
    ...topic.toObject(),
    rendered_content_blocks: renderedBlocks,
    user_progress: userProgress
  };
};

/**
 * Get topic by slug path (board/program/subject/chapter/topic)
 */
export const getTopicBySlug = async (boardSlug, programSlug, subjectSlug, chapterSlug, topicSlug) => {
  const chapter = await Chapter.findOne({ 
    slug: chapterSlug,
    book: { $in: await Book.find({ 
      board: { $in: await Board.find({ slug: boardSlug }).distinct('_id') },
      program: { $in: await Program.find({ slug: programSlug, subject: subjectSlug }).distinct('_id') }
    }).distinct('_id') }
  });
  
  if (!chapter) return null;
  
  const topic = await Topic.findOne({ 
    slug: topicSlug,
    chapter: chapter._id 
  })
    .populate('chapter', 'title slug order')
    .populate({
      path: 'chapter',
      populate: { path: 'book', select: 'title slug edition' }
    });
  
  if (!topic) return null;
  
  const renderedBlocks = topic.content_blocks?.map(block => renderContentBlock(block)) || [];
  
  return {
    ...topic.toObject(),
    rendered_content_blocks: renderedBlocks
  };
};

/**
 * Get adjacent topics for navigation
 */
export const getAdjacentTopics = async (topicId) => {
  const currentTopic = await Topic.findById(topicId).select('chapter order');
  if (!currentTopic) return null;
  
  const [previousTopic, nextTopic] = await Promise.all([
    Topic.findOne({
      chapter: currentTopic.chapter,
      order: { $lt: currentTopic.order }
    }).sort({ order: -1 }).select('slug title order'),
    
    Topic.findOne({
      chapter: currentTopic.chapter,
      order: { $gt: currentTopic.order }
    }).sort({ order: 1 }).select('slug title order')
  ]);
  
  return {
    previous: previousTopic ? { slug: previousTopic.slug, title: previousTopic.title } : null,
    next: nextTopic ? { slug: nextTopic.slug, title: nextTopic.title } : null
  };
};

/**
 * Create a new topic with validation
 */
export const createTopic = async (topicData) => {
  // Validate content blocks if provided
  if (topicData.content_blocks && Array.isArray(topicData.content_blocks)) {
    for (const block of topicData.content_blocks) {
      const validation = validateContentBlock(block);
      if (!validation.valid) {
        throw new Error(`Invalid content block: ${validation.errors.join(', ')}`);
      }
    }
  }
  
  // Generate unique slug
  const slug = await generateUniqueSlug(topicData.title, 'Topic', {
    chapter: topicData.chapter
  });
  
  const topic = new Topic({
    ...topicData,
    slug
  });
  
  await topic.save();
  return topic;
};

/**
 * Update topic with validation
 */
export const updateTopic = async (topicId, updateData) => {
  // Validate content blocks if being updated
  if (updateData.content_blocks && Array.isArray(updateData.content_blocks)) {
    for (const block of updateData.content_blocks) {
      const validation = validateContentBlock(block);
      if (!validation.valid) {
        throw new Error(`Invalid content block: ${validation.errors.join(', ')}`);
      }
    }
  }
  
  const topic = await Topic.findByIdAndUpdate(
    topicId,
    updateData,
    { new: true, runValidators: true }
  );
  
  return topic;
};

/**
 * Get topics by chapter with optional filtering
 */
export const getTopicsByChapter = async (chapterId, options = {}) => {
  const query = { chapter: chapterId };
  
  if (options.hasQuranVerses) {
    query['content_blocks.type'] = 'quran_verse';
  }
  
  if (options.hasFormulas) {
    query['content_blocks.type'] = 'formula';
  }
  
  const topics = await Topic.find(query)
    .sort({ order: 1 })
    .select('slug title order content_blocks ai_summary');
  
  return topics.map(topic => ({
    ...topic.toObject(),
    rendered_content_blocks: topic.content_blocks?.map(block => renderContentBlock(block))
  }));
};

/**
 * Search topics by keyword in title or content
 */
export const searchTopics = async (query, limit = 20) => {
  const searchRegex = new RegExp(query, 'i');
  
  const topics = await Topic.find({
    $or: [
      { title: searchRegex },
      { 'content_blocks.content': searchRegex },
      { ai_summary: searchRegex }
    ]
  })
    .limit(limit)
    .populate('chapter', 'title slug')
    .select('slug title chapter ai_summary');
  
  return topics;
};

export default {
  getTopicById,
  getTopicBySlug,
  getAdjacentTopics,
  createTopic,
  updateTopic,
  getTopicsByChapter,
  searchTopics
};