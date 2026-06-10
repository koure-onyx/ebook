import { success, error } from '../utils/apiResponse.js';
import * as topicService from '../services/topic.service.js';

/**
 * GET /topics/:id - Get topic by ID with full content blocks
 */
export async function getTopic(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?._id || null;
    
    const topic = await topicService.getTopicById(id, userId);
    
    if (!topic) {
      return res.status(404).json(error('Topic not found', 'TOPIC_NOT_FOUND'));
    }
    
    // Ensure response matches DeepSeek schema exactly
    const formattedTopic = {
      _id: topic._id,
      title: topic.title,
      title_urdu: topic.title_urdu || '',
      slug: topic.slug,
      topic_number: topic.topic_number || '',
      display_order: topic.display_order,
      difficulty: topic.difficulty || 'medium',
      estimated_read_time: topic.estimated_read_time || 3,
      edition_year: topic.edition_year,
      raw_text: topic.raw_text || '',
      clean_html: topic.clean_html || '',
      content_blocks: topic.content_blocks || [],
      rendered_content_blocks: topic.rendered_content_blocks || [],
      formulas: topic.formulas || [],
      key_terms: topic.key_terms || [],
      book_mcqs: topic.book_mcqs || [],
      book_short_questions: topic.book_short_questions || [],
      book_problems: topic.book_problems || [],
      keywords: topic.keywords || [],
      quran_reference: topic.quran_reference || null,
      quran_word_alignments: topic.quran_word_alignments || [],
      quran_textbook_translation: topic.quran_textbook_translation || '',
      quran_textbook_tafsir: topic.quran_textbook_tafsir || '',
      seo: topic.seo || { meta_title: '', meta_description: '', keywords: [], source_page: 0 },
      user_progress: topic.user_progress || null
    };
    
    res.json(success(formattedTopic));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /topics/slug/:slug - Get topic by slug
 */
export async function getTopicBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const topic = await topicService.getTopicBySlug(slug);
    
    if (!topic) {
      return res.status(404).json(error('Topic not found', 'TOPIC_NOT_FOUND'));
    }
    
    res.json(success(topic));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /topics/chapter/:chapterId - Get all topics for a chapter
 * Sorted by display_order: 0=intro, 1-N=regular, 999=exercises
 */
export async function getTopicsByChapter(req, res, next) {
  try {
    const { chapterId } = req.params;
    const topics = await topicService.getTopicsByChapter(chapterId);
    
    res.json(success({
      chapter_id: chapterId,
      topics,
      total_topics: topics.length
    }));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /topics/:id/adjacent - Get previous and next topics for navigation
 */
export async function getAdjacentTopics(req, res, next) {
  try {
    const { id } = req.params;
    const result = await topicService.getAdjacentTopics(id);
    
    if (!result) {
      return res.status(404).json(error('Topic not found', 'TOPIC_NOT_FOUND'));
    }
    
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /topics/search - Search topics by query
 */
export async function searchTopics(req, res, next) {
  try {
    const { q, limit, boardId, programId, classLevel } = req.query;
    
    if (!q) {
      return res.status(400).json(error('Query parameter "q" is required', 'VALIDATION_ERROR'));
    }
    
    const topics = await topicService.searchTopics(q, {
      limit: parseInt(limit) || 20,
      boardId,
      programId,
      classLevel
    });
    
    res.json(success(topics));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /topics/hot - Get trending/hot topics
 */
export async function getHotTopics(req, res, next) {
  try {
    const { limit } = req.query;
    const topics = await topicService.getHotTopics({ limit: parseInt(limit) || 10 });
    
    res.json(success(topics));
  } catch (err) {
    next(err);
  }
}

/**
 * GET /topics/by-nested-slug/:boardSlug/:programSlug/:subjectSlug/:chapterSlug/:topicSlug
 * Matches frontend catch-all route pattern: /[board]/[program]/[subject]/[chapter]/[topic]
 */
export async function getNestedTopic(req, res, next) {
  try {
    const { boardSlug, programSlug, subjectSlug, chapterSlug, topicSlug } = req.params;

    // Validate all required parameters
    if (!boardSlug || !programSlug || !subjectSlug || !chapterSlug || !topicSlug) {
      return res.status(400).json(error('Missing required parameters: boardSlug, programSlug, subjectSlug, chapterSlug, topicSlug', 'VALIDATION_ERROR'));
    }

    // Call service with all 5 parameters as expected
    const topic = await topicService.getTopicBySlug(boardSlug, programSlug, subjectSlug, chapterSlug, topicSlug);

    if (!topic) {
      return res.status(404).json(error('Topic not found', 'TOPIC_NOT_FOUND'));
    }

    // Ensure response matches DeepSeek schema exactly
    const formattedTopic = {
      _id: topic._id,
      title: topic.title,
      title_urdu: topic.title_urdu || '',
      slug: topic.slug,
      topic_number: topic.topic_number || '',
      display_order: topic.display_order,
      difficulty: topic.difficulty || 'medium',
      estimated_read_time: topic.estimated_read_time || 3,
      edition_year: topic.edition_year,
      raw_text: topic.raw_text || '',
      clean_html: topic.clean_html || '',
      content_blocks: topic.content_blocks || [],
      rendered_content_blocks: topic.rendered_content_blocks || [],
      formulas: topic.formulas || [],
      key_terms: topic.key_terms || [],
      book_mcqs: topic.book_mcqs || [],
      book_short_questions: topic.book_short_questions || [],
      book_problems: topic.book_problems || [],
      keywords: topic.keywords || [],
      quran_reference: topic.quran_reference || null,
      quran_word_alignments: topic.quran_word_alignments || [],
      quran_textbook_translation: topic.quran_textbook_translation || '',
      quran_textbook_tafsir: topic.quran_textbook_tafsir || '',
      seo: topic.seo || { meta_title: '', meta_description: '', keywords: [], source_page: 0 },
      user_progress: topic.user_progress || null
    };

    // Return standardized JSON payload
    res.json(success(formattedTopic));
  } catch (err) {
    next(err);
  }
}
