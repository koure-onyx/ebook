import React from 'react';
import { AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';

/**
 * QuestionRenderer Component
 * 
 * Purpose: Display questions in various formats (MCQ, short answer)
 * Mobile Behavior: Optimized for touch interaction, readable text
 * Accessibility: Math expressions, image descriptions, clear labels
 * 
 * @param {Object} props
 * @param {Object} props.question - Question data object
 * @param {'view' | 'practice' | 'review'} props.mode - Display mode
 * @param {Function} props.onAnswer - Answer handler (practice mode)
 * @param {any} props.userAnswer - User's submitted answer
 */
interface QuestionRendererProps {
  question: {
    id: string;
    number: number;
    text: string;
    type: 'mcq' | 'short';
    difficulty?: 'easy' | 'medium' | 'hard';
    imageUrl?: string;
    options?: string[];
    correctAnswer?: string;
    explanation?: string;
  };
  mode: 'view' | 'practice' | 'review';
  onAnswer?: (answer: any) => void;
  userAnswer?: any;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  mode,
  onAnswer,
  userAnswer
}) => {
  const difficultyColors = {
    easy: 'var(--color-success)',
    medium: 'var(--color-warning)',
    hard: 'var(--color-error)',
  };

  return (
    <Card
      variant="elevated"
      className="w-full"
      role="article"
      aria-label={`Question ${question.number}`}
      style={{
        padding: 'var(--space-4)',
        marginBottom: 'var(--space-4)',
      }}
    >
      {/* Question Header */}
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold text-primary"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            Question {question.number}
          </span>
          
          {question.difficulty && (
            <span
              className="text-xs px-2 py-1 rounded-full"
              style={{
                fontSize: 'var(--text-xs)',
                backgroundColor: difficultyColors[question.difficulty],
                color: 'white',
              }}
            >
              {question.difficulty}
            </span>
          )}
        </div>
        
        <span
          className="text-xs text-text-muted"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          {question.type === 'mcq' ? 'Multiple Choice' : 'Short Answer'}
        </span>
      </div>

      {/* Question Image (if any) */}
      {question.imageUrl && (
        <div className="mb-4">
          <img
            src={question.imageUrl}
            alt="Question diagram"
            className="w-full max-h-64 object-contain rounded-lg"
            style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          />
        </div>
      )}

      {/* Question Text */}
      <div
        className="text-base text-text-primary leading-relaxed mb-4"
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-relaxed)',
        }}
      >
        {question.text}
      </div>

      {/* Multiple Choice Options */}
      {question.type === 'mcq' && question.options && (
        <div className="space-y-2" role="radiogroup" aria-label="Answer options">
          {question.options.map((option, index) => {
            const isSelected = userAnswer === index;
            const isCorrect = question.correctAnswer === option;
            const showResult = mode === 'review';

            let borderColor = 'var(--color-border)';
            let backgroundColor = 'transparent';

            if (showResult) {
              if (isCorrect) {
                borderColor = 'var(--color-success)';
                backgroundColor = 'rgba(22, 163, 74, 0.1)';
              } else if (isSelected && !isCorrect) {
                borderColor = 'var(--color-error)';
                backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }
            } else if (isSelected) {
              borderColor = 'var(--color-primary)';
              backgroundColor = 'rgba(59, 130, 246, 0.1)';
            }

            return (
              <button
                key={index}
                onClick={() => mode === 'practice' && onAnswer?.(index)}
                disabled={mode === 'review'}
                className="w-full text-left p-3 rounded-lg border transition-all"
                style={{
                  borderColor,
                  backgroundColor,
                  minHeight: '44px', // Touch target
                }}
                role="radio"
                aria-checked={isSelected}
                aria-disabled={mode === 'review'}
              >
                <span
                  className="text-sm text-text-primary"
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {String.fromCharCode(65 + index)}. {option}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Short Answer Input */}
      {question.type === 'short' && mode === 'practice' && (
        <textarea
          value={userAnswer || ''}
          onChange={(e) => onAnswer?.(e.target.value)}
          placeholder="Type your answer here..."
          className="w-full p-3 border rounded-lg resize-none"
          style={{
            minHeight: '100px',
            borderColor: 'var(--color-border)',
            backgroundColor: 'var(--color-bg-primary)',
            color: 'var(--color-text-primary)',
            fontSize: 'var(--text-base)',
          }}
          aria-label="Your answer"
        />
      )}

      {/* Review Mode: Show Correct Answer */}
      {mode === 'review' && question.correctAnswer && (
        <div
          className="mt-4 p-3 rounded-lg bg-success/10"
          style={{
            backgroundColor: 'rgba(22, 163, 74, 0.1)',
          }}
        >
          <p
            className="text-sm font-semibold text-success"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-success)',
            }}
          >
            Correct Answer:
          </p>
          <p
            className="text-sm text-text-primary mt-1"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
            }}
          >
            {question.correctAnswer}
          </p>
        </div>
      )}

      {/* Explanation (if available) */}
      {question.explanation && mode === 'review' && (
        <div
          className="mt-4 p-3 rounded-lg bg-info/10"
          style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle
              size={16}
              stroke="var(--color-info)"
              strokeWidth={1.5}
            />
            <p
              className="text-sm font-semibold text-info"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-info)',
              }}
            >
              Explanation
            </p>
          </div>
          <p
            className="text-sm text-text-primary"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-primary)',
            }}
          >
            {question.explanation}
          </p>
        </div>
      )}
    </Card>
  );
};

export default QuestionRenderer;
