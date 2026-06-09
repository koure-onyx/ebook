'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, XCircle, ArrowRight, RotateCcw, Award } from 'lucide-react';

interface Question {
  _id: string;
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

interface QuizEngineProps {
  topicId: string;
  initialQuestions: Question[];
  userId?: string;
}

export default function QuizEngine({ topicId, initialQuestions, userId }: QuizEngineProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const currentQuestion = initialQuestions[currentIdx];

  function handleOptionSelect(option: string) {
    if (isAnswered) return;
    setSelectedOption(option);
  }

  async function handleCheckAnswer() {
    if (!selectedOption || isAnswered) return;
    
    setIsAnswered(true);
    if (selectedOption === currentQuestion.correct_answer) {
      setScore(prev => prev + 1);
    }
  }

  async function handleNext() {
    if (currentIdx < initialQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowResult(true);
      await submitResults();
    }
  }

  async function submitResults() {
    if (!userId) return;
    
    setSubmitting(true);
    try {
      const finalScore = score + (selectedOption === currentQuestion.correct_answer ? 1 : 0);
      const percentage = Math.round((finalScore / initialQuestions.length) * 100);

      await fetch('/api/progress/quiz-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId,
          score: percentage,
        }),
      });
    } catch (err) {
      console.error('Failed to submit quiz results', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (showResult) {
    const percentage = Math.round((score / initialQuestions.length) * 100);
    return (
      <Card className="p-12 text-center space-y-6 bg-white shadow-xl rounded-3xl border-0">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-4">
          <Award className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 font-display">Quiz Complete!</h2>
        <div className="space-y-2">
          <p className="text-6xl font-black text-emerald-600">{percentage}%</p>
          <p className="text-slate-500 font-medium">You got {score} out of {initialQuestions.length} correct.</p>
        </div>
        
        <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={() => window.location.reload()} variant="outline" className="rounded-2xl py-6 px-8">
            <RotateCcw className="w-4 h-4 mr-2" /> Try Again
          </Button>
          <Button onClick={() => window.history.back()} className="rounded-2xl py-6 px-8 bg-emerald-600 hover:bg-emerald-700 text-white">
            Return to Study
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-bold text-slate-400 uppercase tracking-widest">
          <span>Question {currentIdx + 1} of {initialQuestions.length}</span>
          <span>{Math.round(((currentIdx + 1) / initialQuestions.length) * 100)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-emerald-500 transition-all duration-300" 
            style={{ width: `${((currentIdx + 1) / initialQuestions.length) * 100}%` }}
          />
        </div>
      </div>

      <Card className="p-8 bg-white shadow-lg rounded-3xl border-0 overflow-hidden relative">
        <div className="relative z-10 space-y-8">
          <h3 className="text-2xl font-bold text-slate-800 leading-tight">
            {currentQuestion.question}
          </h3>

          <div className="space-y-3">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === option;
              const isCorrect = isAnswered && option === currentQuestion.correct_answer;
              const isWrong = isAnswered && isSelected && option !== currentQuestion.correct_answer;

              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isAnswered}
                  className={`
                    w-full p-5 rounded-2xl text-left font-semibold transition-all flex items-center justify-between border-2
                    ${!isAnswered && isSelected ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : ''}
                    ${!isAnswered && !isSelected ? 'border-slate-100 hover:border-emerald-200 text-slate-600' : ''}
                    ${isAnswered && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white shadow-lg' : ''}
                    ${isAnswered && isWrong ? 'border-red-500 bg-red-500 text-white shadow-lg' : ''}
                    ${isAnswered && !isCorrect && !isWrong ? 'border-slate-100 opacity-50 text-slate-400' : ''}
                  `}
                >
                  <span>{option}</span>
                  {isAnswered && isCorrect && <CheckCircle2 className="w-6 h-6" />}
                  {isAnswered && isWrong && <XCircle className="w-6 h-6" />}
                </button>
              );
            })}
          </div>

          {isAnswered && (
            <div className="mt-8 p-6 bg-slate-50 rounded-2xl border-l-4 border-emerald-500 animate-in slide-in-from-left-4">
              <p className="text-sm font-bold text-emerald-700 uppercase mb-2">Explanation</p>
              <p className="text-slate-600 leading-relaxed">
                {currentQuestion.explanation || 'The correct answer is ' + currentQuestion.correct_answer + '.'}
              </p>
            </div>
          )}

          <div className="pt-4">
            {!isAnswered ? (
              <Button 
                onClick={handleCheckAnswer} 
                disabled={!selectedOption}
                className="w-full py-6 text-lg font-bold rounded-2xl bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Check Answer
              </Button>
            ) : (
              <Button 
                onClick={handleNext} 
                className="w-full py-6 text-lg font-bold rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {currentIdx < initialQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
