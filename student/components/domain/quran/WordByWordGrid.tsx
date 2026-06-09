import React from 'react';
import { Info } from 'lucide-react';

/**
 * WordByWordGrid Component
 * 
 * Purpose: Interactive word-by-word Quranic analysis
 * Mobile Behavior: Horizontal scrollable grid, tap to select
 * Accessibility: Word selection announcements, meaning display
 * 
 * @param {Object} props
 * @param {Array} props.words - Word data array
 * @param {string} props.selectedWord - Currently selected word ID
 * @param {Function} props.onWordSelect - Selection handler
 * @param {boolean} props.showMeanings - Show meanings toggle
 */
interface WordByWordGridProps {
  words: Array<{
    id: string;
    arabicWord: string;
    transliteration: string;
    meaning: string;
    position: number;
  }>;
  selectedWord?: string;
  onWordSelect?: (wordId: string) => void;
  showMeanings: boolean;
}

const WordByWordGrid: React.FC<WordByWordGridProps> = ({
  words,
  selectedWord,
  onWordSelect,
  showMeanings
}) => {
  return (
    <div className="w-full">
      {/* Words Grid */}
      <div
        className="grid grid-cols-2 gap-2 p-2 max-h-48 overflow-y-auto"
        role="listbox"
        aria-label="Word by word analysis"
      >
        {words.map((word) => {
          const isSelected = selectedWord === word.id;
          
          return (
            <button
              key={word.id}
              onClick={() => onWordSelect?.(word.id)}
              className={`p-3 rounded-lg border text-right transition-all ${
                isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-bg-secondary'
              }`}
              style={{
                minHeight: '44px', // Touch target
                direction: 'rtl',
              }}
              role="option"
              aria-selected={isSelected}
              aria-label={`${word.arabicWord}: ${word.meaning}`}
            >
              {/* Arabic Word */}
              <div
                className="text-lg font-semibold mb-1"
                style={{
                  fontFamily: "'Amiri', 'Traditional Arabic', serif",
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                  direction: 'rtl',
                }}
                lang="ar"
              >
                {word.arabicWord}
              </div>
              
              {/* Transliteration */}
              <div
                className="text-xs text-text-muted italic"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                }}
              >
                {word.transliteration}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Word Meaning */}
      {showMeanings && selectedWord && (
        <div
          className="mt-3 p-3 rounded-lg bg-bg-secondary"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-2 mb-2">
            <Info
              size={16}
              stroke="var(--color-primary)"
              strokeWidth={1.5}
              aria-hidden="true"
            />
            <span
              className="text-sm font-semibold text-primary"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-primary)',
              }}
            >
              Meaning
            </span>
          </div>
          <p
            className="text-base text-text-primary"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {words.find(w => w.id === selectedWord)?.meaning || ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default WordByWordGrid;
