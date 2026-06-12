import mongoose from 'mongoose';
import { generateSlug } from '../utils/slug.js';

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  slug: { type: String, required: false, unique: true, lowercase: true, sparse: true },
  subject: { type: String, required: true },
  subject_slug: { type: String, required: false },
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
  is_public: { type: Boolean, default: true },
  original_pdf_url: String,
  cover_image_url: String,
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  approved_at: Date,
  // Legacy fields for backward compatibility
  classLevel: String,
  description: String,
  coverImage: String,
  isPremium: { type: Boolean, default: false },
  viewCount: { type: Number, default: 0 },
}, { timestamps: true });

// Indexes for query performance
bookSchema.index({ program_id: 1, board_id: 1, subject_slug: 1 });
bookSchema.index({ program_id: 1, is_live: 1 });
bookSchema.index({ is_current_edition: 1 });
bookSchema.index({ title: 'text', subject: 'text' });
bookSchema.index({ board: 1, grade: 1, is_live: 1 });
bookSchema.index({ board_id: 1, program_id: 1 });
bookSchema.index({ subject_slug: 1, is_live: 1 });
bookSchema.index({ subject: 1, classLevel: 1 });

// Pre-save middleware to auto-generate slugs if not provided
bookSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (!this.slug && this.title) {
    this.slug = generateSlug(this.title);
  }
  // Generate subject_slug from subject if not provided
  if (!this.subject_slug && this.subject) {
    this.subject_slug = generateSlug(this.subject);
  }
  next();
});

export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
