import mongoose from 'mongoose';

const ChapterSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true },
  chapter_number: { type: Number, required: true },
  chapter_number_display: String,
  book_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true, index: true },
  book_slug: { type: String, index: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
  board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', index: true },
  subject_slug: { type: String, index: true },
  student_learning_outcomes: [String],
  summary: String,
  summary_urdu: String,
  page_start: Number,
  page_end: Number,
  topic_ids: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  total_topics: { type: Number, default: 0 },
  exam_frequency: [{
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    board_short_code: String,
    total_appearances: Number,
    last_appeared_year: Number,
    is_hot: { type: Boolean, default: false },
  }],
  seo: {
    meta_title: String,
    meta_description: String,
    keywords: [String],
  },
  is_live: { type: Boolean, default: false },
  display_order: { type: Number, default: 0 },
}, { timestamps: true });

ChapterSchema.index({ book_id: 1, chapter_number: 1 });
ChapterSchema.index({ book_id: 1, is_live: 1 });
ChapterSchema.index({ slug: 1, book_id: 1 }, { unique: true });
ChapterSchema.index({ subject_slug: 1, is_live: 1 });
ChapterSchema.index({ book_slug: 1, is_live: 1 });

export const Chapter = mongoose.models.Chapter || mongoose.model('Chapter', ChapterSchema);
