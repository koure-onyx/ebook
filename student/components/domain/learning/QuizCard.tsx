import React from 'react';
import { Clock, Award, ChevronRight } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * QuizCard Component
 * 
 * Purpose: Display quiz information for practice sessions
 * Mobile Behavior: Full-width with result previews
 * Accessibility: Result announcements, quiz details
 * 
 * @param {Object} props
 * @param {Object} props.quiz - Quiz data object
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.showResults - Whether to show results
 * @param {string} props.topicId - Parent topic ID
 */
interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    questionCount: number;
    duration?: string; // e.g., "30 min"
    difficulty?: 'easy' | 'medium' | 'hard';
    score?: number;
    totalScore?: number;
    isAttempted?: boolean;
    isPassed?: boolean;
  };
  onClick: () => void;
  showResults?: boolean;
  topicId: string;
}

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onClick,
  showResults = false,
  topicId
}) => {
  const difficultyColors = {
    easy: 'var(--color-success)',
    medium: 'var(--color-warning)',
    hard: 'var(--color-error)',
  };

  return (
    <Card
      variant="elevated"
      onClick={onClick}
      className="w-full mb-3"
      role="article"
      aria-label={`Quiz: ${quiz.title}`}
      // Mobile: Dashed border for quiz distinction
      style={{
        borderWidth: quiz.isAttempted ? '1px' : '2px',
        borderStyle: 'dashed',
        borderColor: quiz.isAttempted
          ? quiz.isPassed
            ? 'var(--color-success)'
            : 'var(--color-border)'
          : 'var(--color-primary)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Quiz Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <h3
              className="text-base font-semibold text-text-primary truncate"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {quiz.title}
            </h3>
            
            {quiz.difficulty && (
              <Badge
                variant={
                  quiz.difficulty === 'easy' ? 'success' :
                  quiz.difficulty === 'medium' ? 'warning' : 'error'
                }
                size="sm"
              >
                {quiz.difficulty}
              </Badge>
            )}
          </div>

          {/* Quiz Meta */}
          <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
            <div className="flex items-center gap-1">
              <Clock size={14} strokeWidth={1.5} />
              <span
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {quiz.questionCount} questions
              </span>
            </div>
            
            {quiz.duration && (
              <div className="flex items-center gap-1">
                <Clock size={14} strokeWidth={1.5} />
                <span
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                  }}
                >
                  {quiz.duration}
                </span>
              </div>
            )}
          </div>

          {/* Results */}
          {showResults && quiz.isAttempted && quiz.score !== undefined && (
            <div className="mt-3">
              <div className="flex items-center gap-2">
                <Award
                  size={16}
                  stroke={quiz.isPassed ? 'var(--color-success)' : 'var(--color-warning)'}
                  strokeWidth={1.5}
                />
                <span
                  className="text-sm font-semibold"
                  style={{
                    fontSize: 'var(--text-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: quiz.isPassed ? 'var(--color-success)' : 'var(--color-warning)',
                  }}
                >
                  Score: {quiz.score}{quiz.totalScore ? `/${quiz.totalScore}` : ''}
                </span>
              </div>
              <p
                className="text-xs mt-1"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: quiz.isPassed ? 'var(--color-success)' : 'var(--color-warning)',
                }}
              >
                {quiz.isPassed ? 'Passed ✓' : 'Needs improvement'}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Arrow */}
        <ChevronRight
          size={20}
          stroke="var(--color-text-secondary)"
          strokeWidth={1.5}
          className="flex-shrink-0 self-center"
          aria-hidden="true"
        />
      </div>
    </Card>
  );
};

export default QuizCard;
