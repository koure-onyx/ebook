/**
 * Quran Verse Downloader & Seeder
 * Downloads all 6,236 verses from Alquran.cloud API
 * Saves to MongoDB with Uthmani text, Urdu translation, and word breakdown
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const httpx = require('httpx');

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyvault';

// Quran models
const QuranVerseSchema = new mongoose.Schema({
  surah: { type: Number, required: true, index: true },
  ayah: { type: Number, required: true, index: true },
  surah_name_arabic: String,
  surah_name_english: String,
  text_uthmani: String,
  text_urdu_translation: String,
  juz: Number,
  manzil: Number,
  ruku: Number,
  page: Number,
  words: [{
    position: Number,
    text_uthmani: String,
    text_urdu: String,
    transliteration: String
  }]
}, { timestamps: true });

// Add unique index
QuranVerseSchema.index({ surah: 1, ayah: 1 }, { unique: true });

const QuranVerse = mongoose.models.QuranVerse || mongoose.model('QuranVerse', QuranVerseSchema);

async function downloadQuranData() {
  console.log('◇ Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ MongoDB connected successfully');

  console.log('\nFetching Quran Uthmani data from Alquran.cloud...');
  
  let totalVerses = 0;
  let totalWords = 0;

  // Fetch all 114 Surahs
  for (let surahNum = 1; surahNum <= 114; surahNum++) {
    try {
      // Get Surah metadata
      const surahRes = await httpx.get(`http://api.alquran.cloud/v1/surah/${surahNum}`);
      const surahData = surahRes.json();
      
      const surahNameArabic = surahData.data.name;
      const surahNameEnglish = surahData.data.englishName;
      const revelationType = surahData.data.revelationType;

      console.log(`Processing Surah ${surahNum}: ${surahNameEnglish} (${surahData.data.numberOfAyahs} verses)`);

      // Get Uthmani text
      const uthmaniRes = await httpx.get(`http://api.alquran.cloud/v1/surah/${surahNum}/ar.uthmani`);
      const uthmaniData = uthmaniRes.json();

      // Get Urdu translation
      const urduRes = await httpx.get(`http://api.alquran.cloud/v1/surah/${surahNum}/ur.jalandhry`);
      const urduData = urduRes.json();

      // Get word-by-word
      const wordsRes = await httpx.get(`http://api.alquran.cloud/v1/surah/${surahNum}/wordbyword`);
      const wordsData = wordsRes.json();

      // Process each verse
      for (let ayahIdx = 0; ayahIdx < uthmaniData.data.ayahs.length; ayahIdx++) {
        const uthmaniAyah = uthmaniData.data.ayahs[ayahIdx];
        const urduAyah = urduData.data.ayahs[ayahIdx];
        const wordsAyah = wordsData.data.ayahs[ayahIdx];

        const ayahNumber = uthmaniAyah.numberInSurah;
        
        // Extract words
        const words = wordsAyah.words.map((word, idx) => ({
          position: idx + 1,
          text_uthmani: word.text,
          text_urdu: word.translation?.text || '',
          transliteration: word.audio?.secondaryAudio?.[0] || ''
        }));

        // Create verse document
        const verseDoc = {
          surah: surahNum,
          ayah: ayahNumber,
          surah_name_arabic: surahNameArabic,
          surah_name_english: surahNameEnglish,
          text_uthmani: uthmaniAyah.text.replace('۝', '').trim(),
          text_urdu_translation: urduAyah.text,
          juz: uthmaniAyah.juz,
          manzil: uthmaniAyah.manzil,
          ruku: uthmaniAyah.ruku,
          page: uthmaniAyah.page,
          words: words
        };

        // Upsert verse
        await QuranVerse.updateOne(
          { surah: surahNum, ayah: ayahNumber },
          { $set: verseDoc },
          { upsert: true }
        );

        totalVerses++;
        totalWords += words.length;
      }

      console.log(`  ✓ Surah ${surahNum}: ${uthmaniData.data.ayahs.length} verses, ${totalWords} words processed`);

    } catch (error) {
      console.error(`  ✗ Error processing Surah ${surahNum}:`, error.message);
    }
  }

  console.log('\n🎉 SEEDING COMPLETE!');
  console.log(`Total Surahs: 114`);
  console.log(`Total Verses: ${totalVerses}`);
  console.log(`Total Words: ${totalWords}`);

  await mongoose.disconnect();
  console.log('Disconnected from MongoDB.');
}

// Run
downloadQuranData().catch(console.error);
