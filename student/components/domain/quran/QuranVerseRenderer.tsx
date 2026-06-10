import React from 'react';
import { Volume2, Bookmark } from 'lucide-react';
import Card from '../ui/Card';

/**
 * QuranVerseRenderer Component (Wrapper) - DEEPSEEK V2 COMPLIANT
 *
 * Purpose: Display Quranic verses with Urdu translations ONLY (NO Arabic glyphs)
 * Mobile Behavior: Responsive text sizing, scrollable, RTL support for Urdu
 * Accessibility: Proper lang attributes, word-by-word highlighting
 *
 * CRITICAL: This component MUST NOT receive or display Arabic text.
 * It uses position-based word alignments from the textbook's Urdu translation.
 *
 * @param {Object} props
 * @param {string} props.topicId - Topic ID for API calls
 * @param {number} props.surah - Surah number (1-114)
 * @param {number} props.ayah - Ayah number
 * @param {Array} props.wordAlignments - Array of {position, textbook_urdu, color_highlight}
 * @param {boolean} props.showTranslation - Show translation toggle
 * @param {string} props.tafsirSnippet - Optional explanation from textbook
 */
interface QuranVerseRendererProps {
  topicId?: string;
  surah: number;
  ayah: number;
  wordAlignments: Array<{
    position: number;
    textbook_urdu: string;
    color_highlight?: string | null;
    grammar_note?: string | null;
  }>;
  showTranslation?: boolean;
  tafsirSnippet?: string;
}

const QuranVerseRenderer: React.FC<QuranVerseRendererProps> = ({
  topicId,
  surah,
  ayah,
  wordAlignments,
  showTranslation = true,
  tafsirSnippet
}) => {
  // Sort word alignments by position to ensure correct order
  const sortedWords = [...wordAlignments].sort((a, b) => a.position - b.position);

  return (
    <Card
      variant="outlined"
      className="w-full mb-4"
      role="article"
      aria-label={`Surah ${surah}, Ayah ${ayah}`}
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
            Surah {surah} : Ayah {ayah}
          </span>
        </div>

        <div className="flex items-center gap-2">
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

      {/* Word-by-Word Urdu Translation - DEEPSEEK V2 COMPLIANT */}
      {/* NO ARABIC GLYPHS - Only position-based Urdu meanings */}
      <div
        className="text-right mb-4 leading-loose"
        style={{
          fontSize: 'var(--text-lg)',
          lineHeight: '2.0',
          color: 'var(--color-text-primary)',
          direction: 'rtl',
        }}
        lang="ur"
        dir="rtl"
        role="region"
        aria-label="Word-by-word Urdu translation"
      >
        {sortedWords.map((word) => (
          <span
            key={word.position}
            className="quran-word inline-block mx-1 px-2 py-1 rounded hover:bg-primary/10 cursor-pointer transition-colors"
            data-pos={word.position}
            style={{
              color: word.color_highlight || 'var(--color-text-primary)',
              backgroundColor: word.color_highlight ? 'var(--color-primary)/10' : 'transparent',
            }}
            role="mark"
            aria-label={`Word ${word.position}: ${word.textbook_urdu}`}
          >
            <span
              className="urdu-meaning text-base"
              style={{
                fontSize: 'var(--text-base)',
                fontFamily: "'Noto Nastaliq Urdu', 'Jameel Noori Nastaleeq', serif",
              }}
            >
              {word.textbook_urdu}
            </span>
            {word.grammar_note && (
              <span
                className="grammar-note block text-xs text-text-muted italic"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {word.grammar_note}
              </span>
            )}
          </span>
        ))}
      </div>

      {/* Full Line Translation */}
      {showTranslation && sortedWords.length > 0 && (
        <div
          className="text-base text-text-primary leading-relaxed mt-4 pt-4 border-t"
          style={{
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-relaxed)',
            borderColor: 'var(--color-border)',
          }}
        >
          <span className="font-semibold mr-2">ترجمہ:</span>
          {sortedWords.map(w => w.textbook_urdu).join(' ')}
        </div>
      )}

      {/* Tafsir Snippet (if provided) */}
      {tafsirSnippet && (
        <div
          className="mt-3 p-3 rounded-lg bg-bg-secondary"
          style={{ backgroundColor: 'var(--color-bg-secondary)' }}
          role="complementary"
          aria-label="Tafsir explanation"
        >
          <div className="flex items-center gap-2 mb-2">
            <Volume2
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
              تفسیر:
            </span>
          </div>
          <p
            className="text-base text-text-primary"
            style={{
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-primary)',
            }}
          >
            {tafsirSnippet}
          </p>
        </div>
      )}
    </Card>
  );
};

export default QuranVerseRenderer;
