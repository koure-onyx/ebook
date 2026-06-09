import React, { useState, useEffect, useRef } from 'react';

// Use a more robust global cache
if (typeof window !== 'undefined' && !window.__quranCache) {
  window.__quranCache = new Map();
}

const quranFontSizeClass = {
  sm: 'quran-arabic-sm',
  md: 'quran-arabic-md',
  lg: 'quran-arabic-lg',
};

/**
 * Convert Western numerals to Arabic-Indic numerals
 */
function toArabicNumerals(num) {
  return num.toString().replace(/\d/g, (d) =>
    String.fromCharCode(0x0660 + Number(d))
  );
}

/**
 * Decorative Ayah end marker (۝ + Arabic numeral)
 * alquran.cloud does NOT include these — we render them separately.
 */
function AyahMarker({ ayah }) {
  return (
    <span
      className="ayah-marker font-quran-core inline-block mx-1"
      dir="rtl"
      lang="ar"
      aria-hidden="true"
    >
      {'\u06DD'}{toArabicNumerals(ayah)}
    </span>
  );
}

/**
 * Strip BOM and other invisible corruption characters.
 * IMPORTANT: Do NOT use .normalize() — it destroys Quranic combining marks.
 */
function cleanVerseText(text) {
  if (!text) return '';
  // Remove BOM characters only — nothing else
  return text.replace(/\uFEFF/g, '');
}

const QuranVerseRenderer = ({ topicId, surah, ayah, wordAlignments, className = '', fontSize = 'md' }) => {
  const [mergedWords, setMergedWords] = useState([]);
  const [verseText, setVerseText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef(null);

  // Lazy-load check: only fetch/render when the verse is near the viewport
  useEffect(() => {
    if (!containerRef.current) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '400px' } // Load 400px before it comes into view
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !topicId || !surah || !ayah) return;

    const fetchMergedWords = async () => {
      // 1. Local prop check
      const hasArabicWords = wordAlignments?.some(wa => wa.arabic_word);
      if (hasArabicWords && !topicId) {
        setMergedWords(wordAlignments);
        setVerseText(cleanVerseText(
          wordAlignments.map((word) => word.arabic_word).filter(Boolean).join(' ')
        ));
        return;
      }

      // 2. Global Cache Check
      const cacheKey = `${topicId}-${surah}`;
      const cache = window.__quranCache;
      
      if (cache.has(cacheKey) && cache.get(cacheKey)[ayah]) {
        const cachedAyah = cache.get(cacheKey)[ayah];
        setMergedWords(cachedAyah.words || cachedAyah);
        setVerseText(cleanVerseText(cachedAyah.text || ''));
        return;
      }

      // 3. Optimized Fetch
      setLoading(true);
      try {
        const response = await fetch(`/api/topics/${topicId}/quran-words?surah=${surah}`);
        const data = await response.json();

        if (data.success && data.isGrouped) {
          // Merge into cache to handle concurrent fetches safely
          const currentCache = cache.get(cacheKey) || {};
          const normalizedData = Object.fromEntries(
            Object.entries(data.data || {}).map(([ayahNumber, words]) => [
              ayahNumber,
              {
                words,
                text: cleanVerseText(
                  data.verseTextByAyah?.[ayahNumber] || words.map((word) => word.arabic_word).filter(Boolean).join(' ')
                ),
              },
            ])
          );
          cache.set(cacheKey, { ...currentCache, ...normalizedData });
          setMergedWords(normalizedData[ayah]?.words || []);
          setVerseText(normalizedData[ayah]?.text || '');
        } else if (data.success) {
          setMergedWords(data.data || []);
          setVerseText(cleanVerseText(data.verseText || ''));
        } else {
          setError(data.error);
        }
      } catch (err) {
        setError('Failed to load verse block');
      } finally {
        setLoading(false);
      }
    };

    fetchMergedWords();
  }, [isVisible, topicId, surah, ayah, wordAlignments]);

  return (
    <div 
      ref={containerRef} 
      className={`quran-verse-container ${className} mb-12 min-h-[150px]`}
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 150px' }}
    >
      {!isVisible || loading ? (
        <div className="bg-white/40 animate-pulse h-[150px] rounded-2xl flex items-center justify-center text-slate-300">
          {loading ? 'Re-syncing verse block...' : ''}
        </div>
      ) : error ? (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-sm text-center">
          {error}
        </div>
      ) : mergedWords.length > 0 ? (
        <div className="quran-verse bg-white/95 backdrop-blur-sm rounded-2xl p-4 md:p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex flex-row-reverse justify-between items-center mb-6 opacity-60">
            <div className="h-px bg-slate-300 flex-1 mx-4"></div>
            <span className="text-xs font-bold tracking-widest uppercase text-slate-500 font-sans whitespace-nowrap">
              Ayah {ayah}
            </span>
            <div className="h-px bg-slate-300 flex-1 mx-4"></div>
          </div>

          {/* MAIN QURAN LINE — rendered as ONE text node, never split into spans */}
          <div
            className={`quran-line-shell quran-full-ayah quran-arabic ${quranFontSizeClass[fontSize] || quranFontSizeClass.md} text-right mb-8 p-6 bg-slate-50/50 rounded-2xl`}
            dir="rtl"
            lang="ar"
          >
            {verseText || mergedWords.map((word) => word.arabic_word).filter(Boolean).join(' ')}
            <AyahMarker ayah={ayah} />
          </div>

          {/* Word-by-word Urdu translations */}
          {mergedWords.some(w => w.textbook_urdu_meaning) && (
            <div className="word-by-word grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {mergedWords.map((word) => (
                <div
                  key={word.position}
                  className="word-pair bg-slate-50 p-4 rounded-lg border border-slate-200 text-center"
                  style={{ color: word.color_highlight || 'inherit' }}
                >
                  <div className="quran-word-card-arabic text-xl md:text-2xl font-bold mb-2 font-quran-core" lang="ar" dir="rtl">
                    {word.arabic_word}
                  </div>
                  <div className="urdu-meaning text-sm md:text-base text-slate-700">
                    {word.textbook_urdu_meaning}
                  </div>
                  {word.grammar_note && (
                    <div className="grammar-note mt-2 text-xs text-slate-500" title={word.grammar_note}>
                      ⓘ {word.grammar_note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Full translation line */}
          {mergedWords.some(w => w.textbook_urdu_meaning) && (
            <div className="full-translation bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">Full Translation:</h4>
              <p className="text-slate-700 text-sm md:text-base leading-relaxed">
                {mergedWords.map((word, index) => (
                  <span key={word.position} className="translation-word">
                    {word.textbook_urdu_meaning}
                    {index < mergedWords.length - 1 && ' '}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Tafsir */}
          {mergedWords[0]?.tafsir_snippet && (
            <div className="tafsir-section bg-emerald-50 p-4 rounded-lg border border-emerald-200">
              <h4 className="text-sm font-semibold text-emerald-800 mb-2">Tafsir:</h4>
              <p className="text-slate-700 text-sm leading-relaxed">
                {mergedWords[0]?.tafsir_snippet}
              </p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default QuranVerseRenderer;
