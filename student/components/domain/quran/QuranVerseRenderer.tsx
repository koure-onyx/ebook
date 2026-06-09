import React from 'react';
import { Volume2, Bookmark } from 'lucide-react';
import Card from '../ui/Card';

/**
 * QuranVerseRenderer Component (Wrapper)
 * 
 * Purpose: Display Quranic verses with translations in new design system
 * Mobile Behavior: Responsive text sizing, scrollable, RTL support
 * Accessibility: Arabic text support, translation toggles, proper lang attributes
 * 
 * @param {Object} props
 * @param {Object} props.verse - Verse data object
 * @param {boolean} props.showTranslation - Show translation toggle
 * @param {boolean} props.showTransliteration - Show transliteration toggle
 * @param {string} props.highlightWord - Word to highlight
 */
interface QuranVerseRendererProps {
  verse: {
    number: number;
    arabicText: string;
    translation?: string;
    transliteration?: string;
    surahName?: string;
    audioUrl?: string;
  };
  showTranslation: boolean;
  showTransliteration: boolean;
  highlightWord?: string;
}

const QuranVerseRenderer: React.FC<QuranVerseRendererProps> = ({
  verse,
  showTranslation,
  showTransliteration,
  highlightWord
}) => {
  return (
    <Card
      variant="outlined"
      className="w-full mb-4"
      role="article"
      aria-label={`Verse ${verse.number}`}
      style={{
        padding: 'var(--space-4)',
      }}
    >
      {/* Verse Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-semibold text-primary"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            {verse.surahName || 'Surah'} : {verse.number}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {verse.audioUrl && (
            <button
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="Play audio"
            >
              <Volume2
                size={18}
                stroke="var(--color-text-secondary)"
                strokeWidth={1.5}
              />
            </button>
          )}
          <button
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            style={{ minHeight: '44px', minWidth: '44px' }}
            aria-label="Bookmark verse"
          >
            <Bookmark
              size={18}
              stroke="var(--color-text-secondary)"
              strokeWidth={1.5}
            />
          </button>
        </div>
      </div>

      {/* Arabic Text */}
      <div
        className="text-right mb-4 leading-loose"
        style={{
          fontFamily: "'Amiri', 'Traditional Arabic', serif",
          fontSize: 'var(--text-2xl)',
          lineHeight: '2.5',
          color: 'var(--color-text-primary)',
          direction: 'rtl',
        }}
        lang="ar"
        dir="rtl"
      >
        {verse.arabicText}
      </div>

      {/* Transliteration */}
      {showTransliteration && verse.transliteration && (
        <div
          className="text-base text-text-secondary mb-3 italic"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-secondary)',
            fontStyle: 'italic',
          }}
        >
          {verse.transliteration}
        </div>
      )}

      {/* Translation */}
      {showTranslation && verse.translation && (
        <div
          className="text-base text-text-primary leading-relaxed"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          {verse.translation}
        </div>
      )}
    </Card>
  );
};

export default QuranVerseRenderer;
