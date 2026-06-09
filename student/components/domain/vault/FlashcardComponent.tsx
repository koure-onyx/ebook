import React, { useState } from 'react';
import { RotateCw, ThumbsUp, ThumbsDown } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

/**
 * FlashcardComponent Component
 * 
 * Purpose: Interactive spaced repetition flashcards
 * Mobile Behavior: Tap to flip, swipe gestures for rating (future)
 * Accessibility: Flip announcements, rating options, keyboard support
 * 
 * @param {Object} props
 * @param {Object} props.card - Flashcard data
 * @param {Function} props.onFlip - Flip handler
 * @param {Function} props.onRate - Rating handler (1-5 scale)
 * @param {boolean} props.isFlipped - Current flip state
 */
interface FlashcardComponentProps {
  card: {
    id: string;
    front: string;
    back: string;
    hint?: string;
  };
  onFlip?: () => void;
  onRate?: (rating: number) => void;
  isFlipped?: boolean;
}

const FlashcardComponent: React.FC<FlashcardComponentProps> = ({
  card,
  onFlip,
  onRate,
  isFlipped = false
}) => {
  const [localFlipped, setLocalFlipped] = useState(isFlipped);

  const handleFlip = () => {
    const newFlipped = !localFlipped;
    setLocalFlipped(newFlipped);
    onFlip?.();
  };

  const handleRate = (rating: number) => {
    onRate?.(rating);
    // Reset flip after rating
    setTimeout(() => setLocalFlipped(false), 300);
  };

  return (
    <div className="w-full">
      {/* Flashcard */}
      <Card
        variant="elevated"
        onClick={handleFlip}
        className="w-full cursor-pointer mb-4"
        role="button"
        aria-label={localFlipped ? 'Answer side - tap to show question' : 'Question side - tap to show answer'}
        aria-expanded={localFlipped}
        style={{
          padding: 'var(--space-6)',
          minHeight: '200px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          borderRadius: 'var(--radius-xl)',
        }}
      >
        {/* Flip Indicator */}
        <div
          className="absolute top-3 right-3 text-text-muted"
          style={{ color: 'var(--color-text-muted)' }}
          aria-hidden="true"
        >
          <RotateCw size={16} strokeWidth={1.5} />
        </div>

        {/* Card Content */}
        <div className="flex-1 flex items-center justify-center">
          <p
            className="text-lg text-text-primary leading-relaxed"
            style={{
              fontSize: 'var(--text-lg)',
              color: 'var(--color-text-primary)',
              lineHeight: 'var(--line-height-relaxed)',
            }}
          >
            {localFlipped ? card.back : card.front}
          </p>
        </div>

        {/* Hint (if available and not flipped) */}
        {!localFlipped && card.hint && (
          <p
            className="text-sm text-text-muted mt-4 italic"
            style={{
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic',
            }}
          >
            Hint: {card.hint}
          </p>
        )}

        {/* Tap Instruction */}
        <p
          className="text-xs text-text-muted mt-4"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
          Tap to {localFlipped ? 'show question' : 'reveal answer'}
        </p>
      </Card>

      {/* Rating Buttons (shown when flipped) */}
      {localFlipped && onRate && (
        <div
          className="flex items-center justify-center gap-2"
          role="group"
          aria-label="Rate your recall"
        >
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => handleRate(rating)}
              className="w-12 h-12 flex items-center justify-center rounded-full border-2 transition-all hover:scale-110"
              style={{
                borderColor: `var(--color-primary)`,
                backgroundColor: 'transparent',
                minHeight: '44px',
                minWidth: '44px',
              }}
              aria-label={`Rate ${rating} out of 5`}
            >
              <span
                className="text-base font-semibold text-primary"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: 'var(--color-primary)',
                }}
              >
                {rating}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Rating Labels */}
      {localFlipped && onRate && (
        <div className="flex items-center justify-between mt-2 px-4">
          <span
            className="text-xs text-text-muted"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Forgot
          </span>
          <span
            className="text-xs text-text-muted"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Perfect
          </span>
        </div>
      )}
    </div>
  );
};

export default FlashcardComponent;
