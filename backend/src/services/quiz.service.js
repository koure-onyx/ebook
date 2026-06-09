import { Quiz } from '../models/Quiz.js';
import { Question } from '../models/Question.js';
import { Topic } from '../models/Topic.js';

/**
 * Get quiz by ID with full population
 */
export async function getQuizById(quizId) {
  const quiz = await Quiz.findById(quizId)
    .populate('topic_id', 'title slug')
    .populate('chapter_id', 'title slug')
    .populate('book_id', 'title slug');

  if (!quiz) {
    const error = new Error('Quiz not found');
    error.code = 'QUIZ_NOT_FOUND';
    throw error;
  }

  return quiz;
}

/**
 * Get quizzes by topic
 */
export async function getQuizzesByTopic(topicId) {
  const quizzes = await Quiz.find({ topic_id: topicId })
    .sort({ created_at: -1 });

  return quizzes;
}

/**
 * Get user's quiz history for a topic
 */
export async function getUserQuizHistory(userId, topicId, limit = 10) {
  const history = await Quiz.find({ 
    user_id: userId, 
    topic_id: topicId 
  })
    .sort({ created_at: -1 })
    .limit(limit)
    .populate('topic_id', 'title slug');

  return history;
}

/**
 * Create quiz attempt with answers
 */
export async function createQuizAttempt(quizData) {
  const { 
    user_id, 
    topic_id, 
    chapter_id, 
    book_id, 
    program_id,
    score, 
    answers, 
    time_spent,
    correct_count,
    total_questions,
    device_info 
  } = quizData;

  // Validate topic exists
  const topic = await Topic.findById(topic_id);
  if (!topic) {
    const error = new Error('Topic not found');
    error.code = 'TOPIC_NOT_FOUND';
    throw error;
  }

  // Calculate accuracy percentage
  const accuracy_percentage = total_questions > 0 
    ? Math.round((correct_count / total_questions) * 100) 
    : 0;

  // Create difficulty breakdown from answers
  const difficulty_breakdown = [];
  
  const quiz = await Quiz.create({
    user_id,
    topic_id,
    chapter_id,
    book_id,
    program_id,
    score,
    answers,
    time_spent: time_spent || 0,
    correct_count,
    total_questions,
    accuracy_percentage,
    difficulty_breakdown,
    device_info
  });

  return quiz;
}

/**
 * Submit quiz and calculate score
 */
export async function submitQuiz(quizId, userAnswers, timeSpent) {
  const quiz = await Quiz.findById(quizId).populate('questions');

  if (!quiz) {
    const error = new Error('Quiz not found');
    error.code = 'QUIZ_NOT_FOUND';
    throw error;
  }

  let correctCount = 0;
  const results = quiz.questions.map((question, index) => {
    const userAnswer = userAnswers[index];
    const isCorrect = question.correct_answer === userAnswer;

    if (isCorrect) correctCount++;

    return {
      questionId: question._id.toString(),
      selected: userAnswer,
      isCorrect,
      timeSpent: Math.floor(timeSpent / quiz.questions.length)
    };
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);

  const savedQuiz = await Quiz.findByIdAndUpdate(
    quizId,
    {
      score,
      answers: results,
      time_spent: timeSpent,
      correct_count: correctCount,
      total_questions: quiz.questions.length,
      accuracy_percentage: Math.round((correctCount / quiz.questions.length) * 100)
    },
    { new: true }
  );

  return {
    quiz: savedQuiz,
    score,
    correctCount,
    totalQuestions: quiz.questions.length,
    results
  };
}

/**
 * Get quiz statistics for a topic
 */
export async function getQuizStatsForTopic(topicId) {
  const quizzes = await Quiz.find({ topic_id: topicId });

  if (quizzes.length === 0) {
    return {
      totalAttempts: 0,
      averageScore: 0,
      highestScore: 0,
      lowestScore: 0,
      averageTimeSpent: 0
    };
  }

  const scores = quizzes.map(q => q.score);
  const times = quizzes.map(q => q.time_spent || 0);

  return {
    totalAttempts: quizzes.length,
    averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
    averageTimeSpent: Math.round(times.reduce((a, b) => a + b, 0) / times.length)
  };
}

/**
 * Get user's best score for a topic
 */
export async function getUserBestScore(userId, topicId) {
  const bestQuiz = await Quiz.findOne({ 
    user_id: userId, 
    topic_id: topicId 
  }).sort({ score: -1 });

  return bestQuiz ? {
    score: bestQuiz.score,
    correct_count: bestQuiz.correct_count,
    total_questions: bestQuiz.total_questions,
    date: bestQuiz.created_at
  } : null;
}
