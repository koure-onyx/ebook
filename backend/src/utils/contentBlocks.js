/**
 * Content Block Rendering Utilities
 * Handles rendering of different content block types from Topic model
 */

/**
 * Get display content for a content block based on its type
 */
export const renderContentBlock = (block) => {
  if (!block) return null;

  switch (block.type) {
    case 'text':
      return {
        type: 'text',
        content: block.content,
        title: block.title
      };
    
    case 'image':
      return {
        type: 'image',
        url: block.image_url,
        caption: block.caption,
        alt: block.alt_text
      };
    
    case 'video':
      return {
        type: 'video',
        url: block.video_url,
        thumbnail: block.thumbnail_url,
        duration: block.duration
      };
    
    case 'formula':
      return {
        type: 'formula',
        latex: block.latex,
        explanation: block.explanation
      };
    
    case 'definition':
      return {
        type: 'definition',
        term: block.term,
        definition: block.definition,
        example: block.example
      };
    
    case 'example':
      return {
        type: 'example',
        title: block.title,
        problem: block.problem,
        solution: block.solution,
        steps: block.steps
      };
    
    case 'mcq':
      return {
        type: 'mcq',
        question: block.question,
        options: block.options,
        correctAnswer: block.correct_answer,
        explanation: block.explanation
      };
    
    case 'quran_verse':
      return {
        type: 'quran_verse',
        verse_key: block.verse_key,
        arabic_text: block.arabic_text,
        translation: block.translation,
        tafsir: block.tafsir
      };
    
    case 'key_term':
      return {
        type: 'key_term',
        term: block.term,
        definition: block.definition,
        pronunciation: block.pronunciation
      };
    
    case 'summary':
      return {
        type: 'summary',
        points: block.points,
        conclusion: block.conclusion
      };
    
    case 'warning':
      return {
        type: 'warning',
        title: block.title,
        message: block.message,
        severity: block.severity || 'info'
      };
    
    case 'tip':
      return {
        type: 'tip',
        title: block.title,
        content: block.content
      };
    
    case 'exercise':
      return {
        type: 'exercise',
        instruction: block.instruction,
        expected_answer: block.expected_answer,
        hints: block.hints
      };
    
    case 'table':
      return {
        type: 'table',
        headers: block.headers,
        rows: block.rows
      };
    
    default:
      console.warn(`Unknown content block type: ${block.type}`);
      return { type: 'unknown', raw: block };
  }
};

/**
 * Validate a content block structure
 */
export const validateContentBlock = (block) => {
  const requiredFields = ['type'];
  const missingFields = requiredFields.filter(field => !block[field]);
  
  if (missingFields.length > 0) {
    return {
      valid: false,
      errors: [`Missing required fields: ${missingFields.join(', ')}`]
    };
  }

  // Type-specific validation
  const typeValidators = {
    text: ['content'],
    image: ['image_url'],
    video: ['video_url'],
    formula: ['latex'],
    definition: ['term', 'definition'],
    mcq: ['question', 'options', 'correct_answer'],
    quran_verse: ['verse_key', 'arabic_text']
  };

  const validator = typeValidators[block.type];
  if (validator) {
    const missingTypeFields = validator.filter(field => !block[field]);
    if (missingTypeFields.length > 0) {
      return {
        valid: false,
        errors: [`Missing fields for ${block.type}: ${missingTypeFields.join(', ')}`]
      };
    }
  }

  return { valid: true, errors: [] };
};

/**
 * Extract all Quran verses from content blocks
 */
export const extractQuranVerses = (contentBlocks) => {
  if (!Array.isArray(contentBlocks)) return [];
  
  return contentBlocks
    .filter(block => block.type === 'quran_verse')
    .map(block => ({
      verse_key: block.verse_key,
      arabic_text: block.arabic_text,
      translation: block.translation
    }));
};

/**
 * Extract all formulas from content blocks
 */
export const extractFormulas = (contentBlocks) => {
  if (!Array.isArray(contentBlocks)) return [];
  
  return contentBlocks
    .filter(block => block.type === 'formula')
    .map(block => ({
      latex: block.latex,
      explanation: block.explanation
    }));
};

export default { 
  renderContentBlock, 
  validateContentBlock, 
  extractQuranVerses, 
  extractFormulas 
};
