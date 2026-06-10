# Quran Data Setup Scripts

This directory contains scripts to download and setup the complete Holy Quran data in your StudyVault database.

## Prerequisites

- Node.js 18+ installed
- MongoDB connection configured in `.env` or `.env.local`
- Internet connection (for downloading from Alquran.cloud API)

## Quick Start

Run these commands in order:

```bash
cd backend

# Step 1: Download all 6,236 verses with Urdu translation and word breakdown
node scripts/quranDownloaderSeed.js

# Step 2: Assemble the Quran book structure (114 Surahs as chapters/topics)
node scripts/assembleQuranBook.js
```

## What Each Script Does

### 1. quranDownloaderSeed.js
- Connects to Alquran.cloud API
- Downloads all 114 Surahs (6,236 verses total)
- For each verse, stores:
  - Uthmani Arabic text
  - Urdu translation (Jalandhry)
  - Word-by-word breakdown with Urdu meanings
  - Juz, Manzil, Ruku, Page numbers
- Saves to `quranverses` collection in MongoDB

### 2. assembleQuranBook.js
- Creates PUB board (if not exists)
- Creates Diniyat program (if not exists)
- Creates "The Holy Quran" book
- Creates 114 chapters (one per Surah)
- Creates 114 topics with full content_blocks array
- Each topic contains quran_verse blocks for every ayah
- Sets workflow_status: 'live' for immediate availability

### 3. ingestDeepSeekJSON.js
For ingesting any DeepSeek-generated JSON output:

```bash
node scripts/ingestDeepSeekJSON.js /path/to/deepseek-output.json
```

This script:
- Reads DeepSeek JSON file
- Creates/updates book, chapter, and topics
- Preserves all content_blocks exactly as DeepSeek outputs
- Sets workflow_status: 'live'

## Expected Output

After running both scripts:
- 1 Book: "The Holy Quran" (Grades: All)
- 115 Chapters: Introduction + 114 Surahs
- 114 Topics: One per Surah with all verses
- URL: `/books/PUB/All/the-holy-quran`

## Troubleshooting

### "Cannot find module" errors
Make sure you're in the `backend` directory and have installed dependencies:
```bash
cd backend
npm install
```

### MongoDB connection errors
Check your `.env` file has correct MONGODB_URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/studyvault
```

### API rate limiting
If Alquran.cloud API rate limits you, wait a few minutes and re-run. The scripts use upsert so they can resume.

## Database Cleanup

To remove Quran data and start fresh:
```javascript
// In MongoDB shell or Compass
db.quranverses.deleteMany({});
db.books.deleteOne({ subject_slug: 'the-holy-quran' });
db.chapters.deleteMany({ book: { $in: [/* Quran book _id */] } });
db.topics.deleteMany({ book: { $in: [/* Quran book _id */] } });
```

## File Structure

```
backend/
├── scripts/
│   ├── quranDownloaderSeed.js    # Download from API
│   ├── assembleQuranBook.js      # Create book structure
│   └── ingestDeepSeekJSON.js     # Ingest DeepSeek output
├── src/
│   └── models/
│       ├── QuranVerse.js         # Verse schema
│       └── QuranWord.js          # Word schema
└── .env                          # MongoDB connection
```

## Notes

- All scripts use CommonJS (`require()`) for compatibility
- No Arabic glyphs are stored in topic content (per DeepSeek contract)
- Word alignments use position-based mapping only
- All content is set to `workflow_status: 'live'` immediately
