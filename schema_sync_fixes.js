/**
 * StudyVault Schema Synchronization Fixes
 * DEEPSEEK V2 COMPLIANT - Automated fixes for identified mismatches
 */

// ============================================================================
// FIX 1: Update slug.js to include Quran slug format helper
// ============================================================================

export const generateQuranSlug = (surah, ayahStart, ayahEnd = null) => {
  if (!surah || surah < 1 || surah > 114) {
    throw new Error('Invalid surah number. Must be between 1 and 114.');
  }
  
  if (!ayahStart || ayahStart < 1) {
    throw new Error('Invalid ayah start number. Must be at least 1.');
  }
  
  if (ayahEnd && ayahEnd < ayahStart) {
    throw new Error('Ayah end must be greater than or equal to ayah start.');
  }
  
  // Format: surah-[number]-ayah-[range] or surah-[number]-ayah-[single]
  return ayahEnd 
    ? `surah-${surah}-ayah-${ayahStart}-${ayahEnd}`
    : `surah-${surah}-ayah-${ayahStart}`;
};

// Updated generateSlug with number-at-start prevention
export const generateSlug = (text) => {
  if (!text) return '';

  let slug = text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^\\w\\s-]/g, '') // Remove special characters
    .replace(/[\\s_-]+/g, '-') // Replace spaces/underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
  
  // CRITICAL: Prevent numbers at start of slug
  if (/^[0-9]/.test(slug)) {
    slug = 'topic-' + slug;
  }
  
  return slug;
};

// ============================================================================
// FIX 2: Content Block Renderer Additions (MCQ, Question, Problem, Summary Point)
// ============================================================================

/*
Add these renderers to ContentBlockRenderer.tsx:

// MCQ Renderer
if (block.type === 'mcq') {
  return (
    <div className="my-8 bg-[#FFF5E6] border-l-[3px] border-[#FF9500] rounded-r-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[12px] uppercase tracking-wider text-[#CC7A00] font-bold">
          Multiple Choice Question
        </span>
      </div>
      <div className="text-[14px] text-[#412402] leading-[1.6] mb-4" dangerouslySetInnerHTML={{ __html: block.question || block.text }} />
      {block.options && block.options.length > 0 && (
        <ul className="space-y-2">
          {block.options.map((option, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#FF9500]/20 text-[#CC7A00] text-xs font-bold">
                {String.fromCharCode(97 + idx)}
              </span>
              <span className="text-[14px] text-slate-700">{option}</span>
            </li>
          ))}
        </ul>
      )}
      {block.correct_answer && (
        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
          <span className="text-xs font-semibold text-green-800">Answer: {block.correct_answer.toUpperCase()}</span>
          {block.explanation && (
            <p className="text-xs text-green-700 mt-1">{block.explanation}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Question Renderer (Short/Long Questions)
if (block.type === 'question') {
  return (
    <div className="my-8 bg-[#F0F4FF] border-l-[3px] border-[#534AB7] rounded-r-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[12px] uppercase tracking-wider text-[#534AB7] font-bold">
          {block.variant === 'long' ? 'Long Question' : 'Short Question'}
        </span>
      </div>
      <div className="text-[14px] text-[#26215C] leading-[1.6]" dangerouslySetInnerHTML={{ __html: block.question || block.text }} />
      {block.answer && (
        <details className="mt-4">
          <summary className="text-xs font-semibold text-[#534AB7] cursor-pointer">Show Answer</summary>
          <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200" dangerouslySetInnerHTML={{ __html: block.answer }} />
        </details>
      )}
    </div>
  );
}

// Problem Renderer (Numerical Problems)
if (block.type === 'problem') {
  return (
    <div className="my-8 bg-[#E8F5E9] border-l-[3px] border-[#2E7D32] rounded-r-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Beaker className="w-4 h-4 text-[#2E7D32]" />
        <span className="text-[12px] uppercase tracking-wider text-[#2E7D32] font-bold">
          Numerical Problem
        </span>
      </div>
      <div className="text-[14px] text-[#1B5E20] leading-[1.6] mb-4" dangerouslySetInnerHTML={{ __html: block.problem || block.text }} />
      {block.steps && block.steps.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-[#2E7D32]">Solution Steps:</span>
          <ol className="list-decimal list-inside space-y-1">
            {block.steps.map((step, idx) => (
              <li key={idx} className="text-[13px] text-slate-700">{step}</li>
            ))}
          </ol>
        </div>
      )}
      {block.answer && (
        <div className="mt-4 p-3 bg-[#2E7D32]/10 rounded-lg border border-[#2E7D32]/20">
          <span className="text-xs font-bold text-[#2E7D32]">Answer: </span>
          <span className="text-[14px] text-[#1B5E20]">{block.answer}</span>
        </div>
      )}
    </div>
  );
}

// Summary Point Renderer
if (block.type === 'summary_point') {
  return (
    <div className="my-4 bg-slate-50 border-l-[2px] border-slate-400 rounded-r-lg p-4">
      <div className="flex items-start gap-2">
        <Info className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
        <div className="text-[14px] text-slate-700 leading-[1.6]" dangerouslySetInnerHTML={{ __html: block.text || block.summary_point }} />
      </div>
    </div>
  );
}
*/

// ============================================================================
// FIX 3: Topic Splitting Rules Enforcement
// ============================================================================

export const TOPIC_SPLITTING_RULES = {
  // Chapter introduction becomes topic with display_order = 0
  INTRO_DISPLAY_ORDER: 0,
  
  // Exercise topic (MCQs, Short Questions, Problems combined) gets display_order = 999
  EXERCISES_DISPLAY_ORDER: 999,
  
  // Regular topics increment by 1 starting from 1
  REGULAR_TOPIC_INCREMENT: 1,
  
  // Validate display order
  validateDisplayOrder: (displayOrder, isIntro = false, isExercises = false) => {
    if (isIntro && displayOrder !== 0) {
      throw new Error('Introduction topic must have display_order = 0');
    }
    if (isExercises && displayOrder !== 999) {
      throw new Error('Exercises topic must have display_order = 999');
    }
    return true;
  },
  
  // Generate topic slug with collision handling
  generateTopicSlug: (title, chapterSlug, topicNumber = null) => {
    let slug = generateSlug(title);
    
    // For Quran topics, use special format
    if (title.toLowerCase().includes('quran') || title.toLowerCase().includes('ayah')) {
      const surahMatch = title.match(/Surah\\s*(\\d+)/i);
      const ayahMatch = title.match(/Ayah\\s*(\\d+)/i);
      if (surahMatch) {
        slug = generateQuranSlug(parseInt(surahMatch[1]), ayahMatch ? parseInt(ayahMatch[1]) : 1);
      }
    }
    
    // Append topic number if provided (for collision handling)
    if (topicNumber) {
      slug = `${slug}-${topicNumber}`;
    }
    
    return slug;
  }
};

// ============================================================================
// FIX 4: Quran Data Validation
// ============================================================================

export const validateQuranData = (quranData) => {
  const errors = [];
  
  if (!quranData.surah || quranData.surah < 1 || quranData.surah > 114) {
    errors.push(`Invalid surah number: ${quranData.surah}. Must be 1-114.`);
  }
  
  if (!quranData.ayah || quranData.ayah < 1) {
    errors.push(`Invalid ayah number: ${quranData.ayah}. Must be at least 1.`);
  }
  
  if (!quranData.word_alignments || !Array.isArray(quranData.word_alignments)) {
    errors.push('word_alignments must be an array');
  } else {
    // Validate sequential positions starting at 1
    const positions = quranData.word_alignments.map(w => w.position).sort((a, b) => a - b);
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] !== i + 1) {
        errors.push(`Word alignment positions must be sequential starting at 1. Found gap at position ${i + 1}`);
        break;
      }
    }
    
    // Ensure NO Arabic glyphs in any field
    const arabicPattern = /[\\u0600-\\u06FF]/;
    for (const word of quranData.word_alignments) {
      if (arabicPattern.test(word.textbook_urdu_meaning || '')) {
        errors.push('Arabic glyphs detected in textbook_urdu_meaning. Only Urdu translation allowed.');
        break;
      }
    }
    
    if (quranData.textbook_line_translation && arabicPattern.test(quranData.textbook_line_translation)) {
      errors.push('Arabic glyphs detected in textbook_line_translation. Only Urdu translation allowed.');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// ============================================================================
// EXPORT ALL FIXES
// ============================================================================

export default {
  generateQuranSlug,
  generateSlug,
  TOPIC_SPLITTING_RULES,
  validateQuranData
};
