import React from 'react';
import { Info } from 'lucide-react';

/**
 * WordByWordGrid Component - DEEPSEEK V2 COMPLIANT
 *
 * Purpose: Interactive word-by-word Quranic analysis using Urdu translations ONLY
 * Mobile Behavior: Horizontal scrollable grid, tap to select
 * Accessibility: Word selection announcements, meaning display
 * 
 * CRITICAL: NO Arabic glyphs displayed. Uses position-mapped Urdu meanings
 * starting at index 1 as per DeepSeek V2 specification.
 *
 * @param {Object} props
 * @param {Array} props.words - Word data array with position-based Urdu meanings
 * @param {string} props.selectedWord - Currently selected word ID/position
 * @param {Function} props.onWordSelect - Selection handler
 * @param {boolean} props.showMeanings - Show meanings toggle
 */
interface WordByWordGridProps {
  words: Array<{
    position: number;
    textbook_urdu: string;
    color_highlight?: string | null;
    grammar_note?: string | null;
    id?: string;
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
  // Sort words by position to ensure 1-based sequential order
  const sortedWords = [...words].sort((a, b) => a.position - b.position);

  return (
    <div className="w-full">
      {/* Words Grid - Urdu Only, NO Arabic */}
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 p-2 max-h-48 overflow-y-auto"
        role="listbox"
        aria-label="Word by word Urdu analysis"
      >
        {sortedWords.map((word) => {
          const wordId = word.id || `pos-${word.position}`;
          const isSelected = selectedWord === wordId;

          return (
            <button
              key={wordId}
              onClick={() => onWordSelect?.(wordId)}
              className={`p-3 rounded-lg border text-right transition-all ${
                isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-bg-secondary'
              }`}
              style={{
                minHeight: '44px',
                direction: 'rtl',
              }}
              role="option"
              aria-selected={isSelected}
              aria-label={`Word ${word.position}: ${word.textbook_urdu}`}
            >
              {/* Position Number */}
              <div
                className="text-xs text-text-muted mb-1"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                #{word.position}
              </div>

              {/* Urdu Meaning - NO ARABIC GLYPHS */}
              <div
                className="text-base font-semibold mb-1"
                style={{
                  fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                  color: isSelected ? 'var(--color-primary)' : (word.color_highlight || 'var(--color-text-primary)'),
                  direction: 'rtl',
                }}
                lang="ur"
              >
                {word.textbook_urdu || '—'}
              </div>

              {/* Grammar Note (if available) */}
              {word.grammar_note && (
                <div
                  className="text-xs text-text-muted italic"
                  style={{
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-text-muted)',
                    fontStyle: 'italic',
                  }}
                >
                  {word.grammar_note}
                </div>
              )}
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
              Word {selectedWord.replace('pos-', '')}
            </span>
          </div>
          <p
            className="text-base text-text-primary"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {sortedWords.find(w => (w.id || `pos-${w.position}`) === selectedWord)?.textbook_urdu || ''}
          </p>
        </div>
      )}
    </div>
  );
};

export default WordByWordGrid;
