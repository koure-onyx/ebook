import mongoose from 'mongoose';

const QuranWordSchema = new mongoose.Schema({
  surah: { type: Number, required: true, min: 1, max: 114 },
  ayah: { type: Number, required: true },
  word_position: { type: Number, required: true },
  arabic_word: { type: String, required: true },
  root_word: String,
  transliteration: String,
  global_urdu_meaning: String,
}, { timestamps: false });

QuranWordSchema.index({ surah: 1, ayah: 1, word_position: 1 }, { unique: true });

export const QuranWord = mongoose.models.QuranWord || mongoose.model('QuranWord', QuranWordSchema);
