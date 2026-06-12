import mongoose from 'mongoose';

const ContentBlockSchema = new mongoose.Schema({
  type: {
    type: String, required: true,
    enum: ['heading','paragraph','formula','table','image','list','callout',
           'example','definition','mcq','question','problem','figure','summary_point','activity', 'quran_verse'],
  },
  text: String,
  html: String,
  level: Number,
  latex: String,
  formula_label: String,
  headers: [String],
  rows: [[String]],
  caption: String,
  src: String,
  alt: String,
  figure_number: String,
  page_coordinates: String,
  ordered: Boolean,
  items: [String],
  variant: {
    type: String,
    enum: ['note','activity','warning','info','quick-quiz','lab-safety','caution','do-you-know'],
  },
  title: String,
  problem: String,
  solution: String,
  steps: [String],
  answer: String,
  question: String,
  options: [String],
  correct_answer: String,
  explanation: String,
  term: String,
  definition: String,
  quran_data: {
    surah: Number,
    ayah: Number,
    textbook_line_translation: String,
    word_alignments: [{
      position: Number,
      textbook_urdu_meaning: String,
      color_highlight: String,
      grammar_note: String,
    }],
    tafsir_snippet: String,
  },
  block_order: Number,
}, { _id: false });

const TopicSchema = new mongoose.Schema({
  // Identity
  title: { type: String, required: true },
  title_urdu: String,
  slug: { type: String, required: true },
  topic_number: String,
  display_order: { type: Number, required: true },

  // Hierarchy (denormalized for zero-join queries)
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  chapter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
  board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', index: true },
  program_name: String,
  subject_name: String,
  chapter_number: Number,
  chapter_title: String,

  // Content — the 3 layers
  raw_text: { type: String, required: true },
  clean_html: { type: String, required: true },
  content_blocks: [ContentBlockSchema],

  // Quran Reference (Optional)
  quran_reference: {
    type: {
      surah: { type: Number, min: 1, max: 114 },
      ayah: { type: Number, min: 1 },
      surah_name_arabic: String,
      surah_name_english: String,
      juz: { type: Number, min: 1, max: 30 },
      manzil: { type: Number, min: 1, max: 7 },
      ruku: Number,
    },
    default: null,
  },
  quran_word_alignments: [{
    position: { type: Number, required: true },
    textbook_urdu_meaning: { type: String, required: true },
    color_highlight: String,
    grammar_note: String,
  }],
  quran_textbook_translation: { type: String, default: null },
  quran_textbook_tafsir: { type: String, default: null },

  // Extracted intelligence
  formulas: [{
    latex: String,
    label: String,
    plain_text: String,
  }],
  key_terms: [{
    term: String,
    definition: String,
  }],
  book_mcqs: [{
    question: String,
    options: [String],
    correct_answer: String,
    explanation: String,
    source: { type: String, default: 'book' },
  }],
  book_short_questions: [String],
  book_problems: [{
    problem: String,
    answer: String,
    steps: [String],
  }],
  keywords: { type: [String], index: true },
  difficulty: { type: String, enum: ['easy','medium','hard'], default: 'medium' },
  estimated_read_time: { type: Number, default: 3 },

  // Version control
  edition_year: { type: Number, required: true },
  version_status: {
    type: String,
    enum: ['new','unchanged','modified','removed'],
    default: 'new',
  },
  previous_version_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', default: null },
  content_hash: String,

  // Exam frequency
  exam_frequency: [{
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    board_short_code: String,
    board_name: String,
    total_appearances: { type: Number, default: 0 },
    appearance_by_year: [{
      year: Number,
      count: Number,
      question_types: [String],
    }],
    last_appeared_year: Number,
    is_hot_topic: { type: Boolean, default: false },
  }],

  // AI cache
  ai_cache: {
    explanation: {
      text: String,
      generated_at: Date,
      model_used: String,
      is_approved: Boolean,
    },
    explanation_urdu: {
      text: String,
      generated_at: Date,
      is_approved: Boolean,
    },
    tts_audio: {
      english_url: String,
      urdu_url: String,
      generated_at: Date,
    },
    flashcards: [{
      front: String,
      back: String,
    }],
    flashcards_approved: Boolean,
    flashcards_generated_at: Date,
  },

  // SEO
  seo: {
    meta_title: String,
    meta_description: String,
    keywords: [String],
    json_ld: mongoose.Schema.Types.Mixed,
    canonical_url: String,
    og_image_url: String,
    source_page: Number,
  },

  // Status
  is_live: { type: Boolean, default: false, index: true },
  guest_preview_percent: { type: Number, default: 50 },
  workflow_status: {
    type: String,
    enum: ['draft','pending_review','approved','rejected','live','published'],
    default: 'draft',
  },
  admin_notes: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_at: Date,
}, { timestamps: true });

// ALL INDEXES
TopicSchema.index({ slug: 1, chapter_id: 1 }, { unique: true });
TopicSchema.index({ chapter_id: 1, display_order: 1 });
TopicSchema.index({ book_id: 1, is_live: 1 });
TopicSchema.index({ workflow_status: 1 });
TopicSchema.index({ title: 'text', clean_html: 'text' });
TopicSchema.index({ 'content_blocks.text': 'text', 'content_blocks.question': 'text', 'content_blocks.definition': 'text' });
TopicSchema.index({ program_id: 1, is_live: 1 });
TopicSchema.index({ 'exam_frequency.board_id': 1, 'exam_frequency.is_hot_topic': 1 });
TopicSchema.index({ book_id: 1, version_status: 1 });
TopicSchema.index({ content_hash: 1 });
TopicSchema.index({ book_id: 1, chapter_id: 1 });
TopicSchema.index({ subject_slug: 1, is_live: 1 });

export const Topic = mongoose.models.Topic || mongoose.model('Topic', TopicSchema);
