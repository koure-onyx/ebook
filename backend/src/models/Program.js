import mongoose from 'mongoose';

const ProgramSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  short_name: String,
  program_type: {
    type: String,
    enum: ['academic', 'entrance_exam', 'professional', 'language', 'custom'],
    required: true,
  },
  is_linear: { type: Boolean, default: true },
  requires_textbook: { type: Boolean, default: true },
  description: String,
  icon_url: String,
  color_hex: String,
  display_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  is_featured: { type: Boolean, default: false },
  access_tier: { type: String, enum: ['free', 'basic', 'premium'], default: 'basic' },
  applicable_boards: [{
    board_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Board' },
    board_name: String,
  }],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

ProgramSchema.index({ program_type: 1, is_active: 1 });
ProgramSchema.index({ is_featured: 1 });

export const Program = mongoose.models.Program || mongoose.model('Program', ProgramSchema);
