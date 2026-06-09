import mongoose from 'mongoose';

const BoardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  short_code: { type: String, required: true, uppercase: true },
  program_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Program', required: true, index: true },
  city: String,
  province: String,
  country: { type: String, default: 'Pakistan' },
  is_active: { type: Boolean, default: true },
}, { timestamps: true });

BoardSchema.index({ short_code: 1 });
BoardSchema.index({ program_id: 1, slug: 1 }, { unique: true });

export const Board = mongoose.models.Board || mongoose.model('Board', BoardSchema);
