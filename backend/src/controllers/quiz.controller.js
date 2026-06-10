import { success } from '../utils/apiResponse.js';
import * as quizService from '../services/quiz.service.js';

export async function getQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const quiz = await quizService.getQuizById(id);
    res.json(success(quiz));
  } catch (err) {
    next(err);
  }
}

export async function getQuizzesByTopic(req, res, next) {
  try {
    const { topicId } = req.params;
    const quizzes = await quizService.getQuizzesByTopic(topicId);
    res.json(success(quizzes));
  } catch (err) {
    next(err);
  }
}

export async function createQuiz(req, res, next) {
  try {
    const quiz = await quizService.createQuiz(req.body);
    res.status(201).json(success(quiz, 'Quiz created'));
  } catch (err) {
    next(err);
  }
}

export async function submitQuiz(req, res, next) {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    const result = await quizService.submitQuiz(id, answers);
    
    // Save attempt to user progress (optional)
    res.json(success(result));
  } catch (err) {
    next(err);
  }
}

export async function getRandomQuiz(req, res, next) {
  try {
    const { topicId } = req.params;
    const { limit } = req.query;
    // Use AI service to generate quiz questions for the topic
    const { Topic } = await import('../models/Topic.js');
    const topic = await Topic.findById(topicId);
    if (!topic) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Topic not found' }
      });
    }
    const { generateMCQs } = await import('../services/ai.service.js');
    const questions = await generateMCQs(topic, parseInt(limit) || 5);
    res.json(success({ questions }));
  } catch (err) {
    next(err);
  }
}
