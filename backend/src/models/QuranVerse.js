const mongoose = require('mongoose');

const QuranVerseSchema = new mongoose.Schema({
  surah: { 
    type: Number, 
    required: true, 
    min: 1, 
    max: 114,
    index: true 
  },
  ayah: { 
    type: Number, 
    required: true, 
    min: 1,
    index: true 
  },
  surah_name_arabic: { type: String },
  surah_name_english: { type: String },
  text_uthmani: { type: String },
  text_urdu_translation: { type: String },
  juz: { type: Number },
  manzil: { type: Number },
  ruku: { type: Number },
  page: { type: Number },
  words: [{
    position: { type: Number },
    text_uthmani: { type: String },
    text_urdu: { type: String },
    transliteration: { type: String }
  }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound unique index
QuranVerseSchema.index({ surah: 1, ayah: 1 }, { unique: true });

// Index for faster lookups
QuranVerseSchema.index({ surah: 1 });
QuranVerseSchema.index({ juz: 1 });
QuranVerseSchema.index({ page: 1 });

module.exports = mongoose.models.QuranVerse || mongoose.model('QuranVerse', QuranVerseSchema);
