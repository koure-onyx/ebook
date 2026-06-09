import React from 'react';
import { BookOpen, Lock, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import ProgressBar from '../ui/ProgressBar';

/**
 * BookCard Component
 * 
 * Purpose: Display individual book information in collections
 * Mobile Behavior: Full-width with touch targets (44px min)
 * Accessibility: Link semantics, progress announcements
 * 
 * @param {Object} props
 * @param {Object} props.book - Book data object
 * @param {Function} props.onClick - Click handler
 * @param {boolean} props.showProgress - Whether to show progress bar
 */
interface BookCardProps {
  book: {
    id: string;
    title: string;
    subject?: string;
    coverImage?: string;
    totalChapters?: number;
    completedChapters?: number;
    isLocked?: boolean;
    badge?: string;
  };
  onClick: () => void;
  showProgress?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onClick, 
  showProgress = false 
}) => {
  const progress = book.totalChapters && book.completedChapters !== undefined
    ? (book.completedChapters / book.totalChapters) * 100
    : 0;

  return (
    <Card
      variant="interactive"
      onClick={onClick}
      className="w-full"
      role="article"
      aria-label={`Book: ${book.title}`}
      // Mobile: Full-width by default, adequate padding for touch
      style={{
        minHeight: 'var(--space-20)',
      }}
    >
      <div className="flex gap-4">
        {/* Book Cover Placeholder */}
        <div 
          className="flex-shrink-0 bg-bg-tertiary rounded-lg flex items-center justify-center"
          style={{
            width: '80px',
            height: '100px',
          }}
          aria-hidden="true"
        >
          {book.coverImage ? (
            <img 
              src={book.coverImage} 
              alt="" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <BookOpen 
              size={32} 
              stroke="var(--color-text-muted)"
              strokeWidth={1.5}
            />
          )}
        </div>

        {/* Book Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3 
                className="text-base font-semibold text-text-primary truncate"
                style={{ 
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {book.title}
              </h3>
              {book.subject && (
                <p 
                  className="text-sm text-text-secondary mt-1"
                  style={{ 
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  {book.subject}
                </p>
              )}
            </div>
            
            {book.badge && (
              <Badge variant="primary" size="sm">
                {book.badge}
              </Badge>
            )}
          </div>

          {/* Chapter Count */}
          {book.totalChapters !== undefined && (
            <p 
              className="text-xs text-text-muted mb-3"
              style={{ 
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {book.completedChapters || 0} of {book.totalChapters} chapters
            </p>
          )}

          {/* Progress Bar */}
          {showProgress && progress > 0 && (
            <div className="mt-2">
              <ProgressBar 
                value={progress} 
                max={100} 
                showPercentage={false}
                aria-label={`Progress: ${Math.round(progress)}%`}
              />
            </div>
          )}
        </div>

        {/* Lock Indicator */}
        {book.isLocked && (
          <div 
            className="flex-shrink-0 self-center"
            aria-label="Locked"
          >
            <Lock 
              size={20} 
              stroke="var(--color-text-muted)"
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Completed Indicator */}
        {!book.isLocked && progress === 100 && (
          <div 
            className="flex-shrink-0 self-center text-success"
            aria-label="Completed"
          >
            <CheckCircle 
              size={24} 
              stroke="var(--color-success)"
              strokeWidth={1.5}
            />
          </div>
        )}
      </div>
    </Card>
  );
};

export default BookCard;
