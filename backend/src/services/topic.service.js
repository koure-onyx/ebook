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
    .populate('chapter_id', 'title slug display_order')
    .populate('book_id', 'title slug edition metadata')
    .populate('program_id', 'name slug subject')
    .populate('board_id', 'name slug location');
  
  if (!topic) return null;
  
  // Render all content blocks for display
  const renderedBlocks = topic.content_blocks?.map(block => renderContentBlock(block)) || [];
  
  let userProgress = null;
  if (userId) {
    userProgress = await UserProgress.findOne({ user_id: userId, topic_id: topicId });
  }
  
  return {
    ...topic.toObject(),
    rendered_content_blocks: renderedBlocks,
    user_progress: userProgress
  };
};

/**
 * Get topic by a single slug (for /slug/:slug route)
 */
export const getTopicBySingleSlug = async (topicSlug) => {
  const topic = await Topic.findOne({ slug: topicSlug })
    .populate('chapter_id', 'title slug display_order')
    .populate('board_id', 'name slug short_code')
    .populate('program_id', 'name slug');

  if (!topic) return null;

  const renderedBlocks = topic.content_blocks?.map(block => renderContentBlock(block)) || [];

  return {
    ...topic.toObject(),
    rendered_content_blocks: renderedBlocks
  };
};

/**
 * Get topic by full nested slug path (board/program/subject/chapter/topic)
 * Fixed: Program model has no 'subject' field — match books by subject_slug separately
 */
export const getTopicBySlug = async (boardSlug, programSlug, subjectSlug, chapterSlug, topicSlug) => {
  // Step 1: find boards matching boardSlug (try short_code first, then slug)
  const boardIds = await Board.find({
    $or: [
      { slug: boardSlug },
      { short_code: new RegExp(`^${boardSlug}$`, 'i') }
    ]
  }).distinct('_id');

  // Step 2: find programs matching programSlug (Program has no subject field)
  const programIds = await Program.find({ slug: programSlug }).distinct('_id');

  // Step 3: find books matching board + program + subject_slug
  const bookIds = await Book.find({
    board_id: { $in: boardIds },
    program_id: { $in: programIds },
    subject_slug: subjectSlug
  }).distinct('_id');

  // Fallback: if no books found with strict filters, try just subject_slug
  const effectiveBookIds = bookIds.length > 0
    ? bookIds
    : await Book.find({ subject_slug: subjectSlug }).distinct('_id');

  const chapter = await Chapter.findOne({
    slug: chapterSlug,
    book_id: { $in: effectiveBookIds }
  });

  if (!chapter) return null;

  const topic = await Topic.findOne({
    slug: topicSlug,
    chapter_id: chapter._id
  })
    .populate('chapter_id', 'title slug display_order')
    .populate('board_id', 'name slug short_code')
    .populate('program_id', 'name slug');

  if (!topic) return null;

  const renderedBlocks = topic.content_blocks?.map(block => renderContentBlock(block)) || [];

  return {
    ...topic.toObject(),
    rendered_content_blocks: renderedBlocks,
    chapter: chapter.toObject ? chapter.toObject() : chapter
  };
};

/**
 * Get adjacent topics for navigation
 */
export const getAdjacentTopics = async (topicId) => {
  const currentTopic = await Topic.findById(topicId).select('chapter_id display_order');
  if (!currentTopic) return null;
  
  const [previousTopic, nextTopic] = await Promise.all([
    Topic.findOne({
      chapter_id: currentTopic.chapter_id,
      display_order: { $lt: currentTopic.display_order }
    }).sort({ display_order: -1 }).select('slug title display_order'),
    
    Topic.findOne({
      chapter_id: currentTopic.chapter_id,
      display_order: { $gt: currentTopic.display_order }
    }).sort({ display_order: 1 }).select('slug title display_order')
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
  const query = { chapter_id: chapterId };
  
  if (options.hasQuranVerses) {
    query['content_blocks.type'] = 'quran_verse';
  }
  
  if (options.hasFormulas) {
    query['content_blocks.type'] = 'formula';
  }
  
  const topics = await Topic.find(query)
    .sort({ display_order: 1 })
    .select('slug title display_order content_blocks ai_cache');
  
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
      { 'content_blocks.text': searchRegex },
      { 'ai_cache.explanation.text': searchRegex }
    ]
  })
    .limit(limit)
    .populate('chapter_id', 'title slug')
    .select('slug title chapter_id ai_cache');
  
  return topics;
};

export default {
  getTopicById,
  getTopicBySlug,
  getTopicBySingleSlug,
  getAdjacentTopics,
  createTopic,
  updateTopic,
  getTopicsByChapter,
  searchTopics
};