'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ThumbsUp, BookOpen, Check, X, Lightbulb } from 'lucide-react';

interface Question {
  _id: string;
  question: string;
  options?: string[];
  type: 'mcq' | 'short';
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizResult {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
  steps?: string[];
}

interface QuizEngineProps {
  topicId: string;
  quizType?: 'mcq' | 'short';
  onComplete?: (score: number, results: QuizResult[]) => void;
}

export default function QuizEngine({ 
  topicId, 
  quizType = 'mcq', 
  onComplete 
}: QuizEngineProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [results, setResults] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch questions on mount
  useEffect(() => {
    async function fetchQuestions() {
      try {
        const res = await fetch(`/api/quiz?topicId=${topicId}&type=${quizType}&count=5`);
        const data = await res.json();
        
        if (data.success) {
          setQuestions(data.data.questions);
          
          // If not enough questions, try to generate more
          if (data.data.needsGeneration) {
            await generateMoreQuestions();
          }
        } else {
          setError(data.error || 'Failed to load questions');
        }
      } catch (err) {
        setError('Failed to load quiz questions');
      } finally {
        setLoading(false);
      }
    }

    fetchQuestions();
  }, [topicId, quizType]);

  async function generateMoreQuestions() {
    try {
      const res = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, type: quizType, count: 5 }),
      });
      
      const data = await res.json();
      if (data.success && data.data.generated) {
        setQuestions(data.data.questions);
      }
    } catch (err) {
      console.error('Failed to generate questions:', err);
    }
  }

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setShowFeedback(true);
  };

  const handleNextQuestion = () => {
    setShowFeedback(false);
    setSelectedAnswer('');
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitQuiz(newAnswers);
    }
  };

  async function submitQuiz(finalAnswers: string[]) {
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          answers: finalAnswers,
          quizType,
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setScore(data.data.score);
        setResults(data.data.results);
        setQuizComplete(true);
        onComplete?.(data.data.score, data.data.results);
      } else {
        setError(data.error || 'Failed to submit quiz');
      }
    } catch (err) {
      setError('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  }

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer('');
    setShowFeedback(false);
    setQuizComplete(false);
    setScore(0);
    setResults([]);
    setLoading(true);
    
    // Refetch questions
    fetch(`/api/quiz?topicId=${topicId}&type=${quizType}&count=5`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setQuestions(data.data.questions);
        }
      })
      .finally(() => setLoading(false));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-gray-600">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-700 mb-4">{error}</p>
        <button
          onClick={restartQuiz}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (quizComplete) {
    const masteryStatus = score >= 80 ? 'mastered' : score >= 60 ? 'good' : 'needs_practice';
    const masteryColors = {
      mastered: 'bg-emerald-500',
      good: 'bg-blue-500',
      needs_practice: 'bg-amber-500',
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-lg p-8"
      >
        <div className={`text-center mb-8 ${masteryColors[masteryStatus]} p-6 rounded-xl text-white`}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="text-5xl mb-3"
          >
            {score >= 80 ? <Star className="w-16 h-16 mx-auto" /> : score >= 60 ? <ThumbsUp className="w-16 h-16 mx-auto" /> : <BookOpen className="w-16 h-16 mx-auto" />}
          </motion.div>
          <h3 className="text-2xl font-bold mb-2">
            {score >= 80 ? 'Mastered!' : score >= 60 ? 'Good Job!' : 'Keep Practicing!'}
          </h3>
          <p className="text-lg opacity-90">You scored {score}%</p>
        </div>

        <div className="space-y-4 mb-8">
          <h4 className="font-semibold text-gray-800">Review Answers:</h4>
          {results.map((result, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-lg border-l-4 ${
                result.isCorrect ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50'
              }`}
            >
              <div className="flex items-start gap-3">
                {result.isCorrect ? (
                  <Check className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-gray-800 mb-2">
                    Q{idx + 1}: {questions[idx]?.question}
                  </p>
                  <p className="text-sm text-gray-600 mb-1">
                    Your answer: <span className={result.isCorrect ? 'text-emerald-600' : 'text-red-600'}>
                      {result.userAnswer}
                    </span>
                  </p>
                  {!result.isCorrect && (
                    <p className="text-sm text-emerald-600">
                      Correct answer: {result.correctAnswer}
                    </p>
                  )}
                  {result.explanation && (
                    <p className="text-sm text-gray-600 mt-2 italic flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{result.explanation}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-4 justify-center">
          <button
            onClick={restartQuiz}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
          >
            Retry Quiz
          </button>
          {score >= 60 && (
            <button
              onClick={() => window.location.href = '/dashboard'}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-lg"
            >
              Continue Learning
            </button>
          )}
        </div>
      </motion.div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            className="bg-emerald-500 h-2 rounded-full"
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                currentQuestion.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
                currentQuestion.difficulty === 'medium' ? 'bg-amber-100 text-amber-700' :
                'bg-red-100 text-red-700'
              }`}>
                {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
              </span>
              <span className="text-xs text-gray-500 uppercase tracking-wide">{quizType === 'mcq' ? 'Multiple Choice' : 'Short Answer'}</span>
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-gray-800 leading-relaxed">
              {currentQuestion.question}
            </h3>
          </div>

          {/* Options for MCQ */}
          {quizType === 'mcq' && currentQuestion.options && (
            <div className="space-y-3 mb-6">
              {currentQuestion.options.map((option, idx) => {
                const optionLabel = String.fromCharCode(97 + idx);
                const isSelected = selectedAnswer === optionLabel;
                const isCorrect = showFeedback && optionLabel === currentQuestion.correct_answer;
                const isWrong = showFeedback && isSelected && !isCorrect;

                return (
                  <motion.button
                    key={idx}
                    whileHover={!showFeedback ? { scale: 1.02 } : {}}
                    whileTap={!showFeedback ? { scale: 0.98 } : {}}
                    onClick={() => !showFeedback && handleAnswerSelect(optionLabel)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                      isWrong ? 'border-red-500 bg-red-50 text-red-700' :
                      isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700' :
                      'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                    }`}
                    disabled={showFeedback}
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-current mr-3 text-sm font-bold">
                      {optionLabel.toUpperCase()}
                    </span>
                    <span className="text-gray-800">{option.replace(/^\([a-d]\)\s*/, '')}</span>
                  </motion.button>
                );
              })}
            </div>
          )}

          {/* Feedback & Navigation */}
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <div className={`p-4 rounded-xl ${
                  selectedAnswer === currentQuestion.correct_answer
                    ? 'bg-emerald-50 border border-emerald-200'
                    : 'bg-amber-50 border border-amber-200'
                }`}>
                  <p className="font-medium mb-2 flex items-center gap-2">
                    {selectedAnswer === currentQuestion.correct_answer ? (
                      <>
                        <Check className="w-5 h-5 text-emerald-600" />
                        <span>Correct!</span>
                      </>
                    ) : (
                      <>
                        <X className="w-5 h-5 text-red-600" />
                        <span>Not quite right</span>
                      </>
                    )}
                  </p>
                  {currentQuestion.explanation && (
                    <p className="text-sm text-gray-700 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{currentQuestion.explanation}</span>
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex justify-end">
            {!showFeedback ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={!selectedAnswer}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answer
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                disabled={isSubmitting}
                className="px-8 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-medium shadow-lg"
              >
                {isSubmitting ? 'Submitting...' : currentQuestionIndex < questions.length - 1 ? 'Next Question →' : 'Finish Quiz'}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
