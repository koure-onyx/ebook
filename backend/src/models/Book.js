import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  subject: { type: String, required: true },
  subject_slug: { type: String, required: true },
  board: String,
  grade: String,
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
  board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true, index: true },
  edition_year: { type: Number, required: true },
  edition_label: String,
  is_current_edition: { type: Boolean, default: true },
  previous_edition_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', default: null },
  metadata: {
    authors: [String],
    publisher: String,
    publication_city: String,
    isbn: String,
    total_pages: Number,
    language: { type: String, enum: ['english', 'urdu', 'bilingual'], default: 'english' },
    script_direction: { type: String, enum: ['ltr', 'rtl', 'mixed'], default: 'ltr' },
    grade_level: String,
    curriculum_year: Number,
  },
  seo: {
    meta_title: String,
    meta_description: String,
    keywords: [String],
    og_image_url: String,
  },
  total_chapters: { type: Number, default: 0 },
  total_topics: { type: Number, default: 0 },
  ingestion_status: {
    type: String,
    enum: ['pending', 'processing', 'partial', 'complete', 'error'],
    default: 'pending',
  },
  ingestion_log: [String],
  is_live: { type: Boolean, default: false },
  original_pdf_url: String,
  cover_image_url: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_at: Date,
}, { timestamps: true });

BookSchema.index({ program_id: 1, board_id: 1, subject_slug: 1 });
BookSchema.index({ program_id: 1, is_live: 1 });
BookSchema.index({ is_current_edition: 1 });
BookSchema.index({ title: 'text', subject: 'text' });
BookSchema.index({ board: 1, grade: 1, is_live: 1 });
BookSchema.index({ board_id: 1, program_id: 1 });
BookSchema.index({ subject_slug: 1, is_live: 1 });

export const Book = mongoose.models.Book || mongoose.model('Book', BookSchema);
