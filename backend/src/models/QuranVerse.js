import mongoose from 'mongoose';

const QuranVerseSchema = new mongoose.Schema({
  surah: { type: Number, required: true, min: 1, max: 114 },
  ayah: { type: Number, required: true },
  text_uthmani: { type: String, required: true },
}, { timestamps: false });

QuranVerseSchema.index({ surah: 1, ayah: 1 }, { unique: true });

export const QuranVerse = mongoose.models.QuranVerse || mongoose.model('QuranVerse', QuranVerseSchema);
