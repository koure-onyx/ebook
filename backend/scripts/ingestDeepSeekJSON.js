/**
 * Ingest DeepSeek JSON Output to MongoDB
 * Takes a DeepSeek-formatted JSON file and saves it to the database
 * Compatible with DeepSeek schema contract
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studyvault';

// Import models using CommonJS
const Board = require('../src/models/Board.js');
const Program = require('../src/models/Program.js');
const Book = require('../src/models/Book.js');
const Chapter = require('../src/models/Chapter.js');
const Topic = require('../src/models/Topic.js');

async function ingestDeepSeekJSON(jsonFilePath) {
  console.log('◇ Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('✓ MongoDB connected successfully');

  // Read DeepSeek JSON
  if (!jsonFilePath) {
    console.error('✗ Error: Please provide a JSON file path');
    console.log('Usage: node ingestDeepSeekJSON.js <path-to-deepseek-output.json>');
    await mongoose.disconnect();
    return;
  }

  let deepSeekData;
  try {
    const jsonContent = fs.readFileSync(jsonFilePath, 'utf8');
    deepSeekData = JSON.parse(jsonContent);
    console.log(`✓ Loaded DeepSeek JSON from: ${jsonFilePath}`);
  } catch (error) {
    console.error('✗ Error reading JSON file:', error.message);
    await mongoose.disconnect();
    return;
  }

  // Extract data
  const { book_metadata, chapter, topics } = deepSeekData;

  if (!book_metadata || !chapter || !topics) {
    console.error('✗ Invalid DeepSeek JSON structure. Missing required fields.');
    await mongoose.disconnect();
    return;
  }

  console.log('\n📖 Processing Book:', book_metadata.title);

  // Get or create board
  let board = await Board.findOne({ short_code: 'PUB' });
  if (!board) {
    board = await Board.create({
      name: book_metadata.board || 'Punjab Curriculum and Textbook Board',
      short_code: 'PUB',
      slug: 'pub'
    });
    console.log('✓ Created board:', board.name);
  }

  // Determine program based on subject
  let programSlug = 'general';
  if (book_metadata.subject?.toLowerCase().includes('quran') || 
      book_metadata.subject?.toLowerCase().includes('tarjuma') ||
      book_metadata.subject?.toLowerCase().includes('islam')) {
    programSlug = 'diniyat';
  } else if (book_metadata.subject?.toLowerCase().includes('urdu')) {
    programSlug = 'languages';
  } else if (['physics', 'chemistry', 'biology', 'mathematics'].includes(book_metadata.subject_slug)) {
    programSlug = 'science';
  }

  let program = await Program.findOne({ slug: programSlug });
  if (!program) {
    program = await Program.create({
      name: programSlug.charAt(0).toUpperCase() + programSlug.slice(1),
      slug: programSlug
    });
    console.log('✓ Created program:', program.name);
  }

  // Create/update book
  const book = await Book.findOneAndUpdate(
    { 
      title: book_metadata.title,
      grade: book_metadata.grade_level,
      subject_slug: book_metadata.subject_slug
    },
    {
      ...book_metadata,
      board: board._id,
      program: program._id,
      is_public: true,
      workflow_status: 'live'
    },
    { upsert: true, new: true }
  );
  console.log('✓ Book saved:', book.title);

  // Create chapter
  const chapterDoc = await Chapter.findOneAndUpdate(
    {
      book: book._id,
      chapter_number: chapter.chapter_number
    },
    {
      book: book._id,
      chapter_number: chapter.chapter_number,
      chapter_number_display: chapter.chapter_number_display || `Chapter ${chapter.chapter_number}`,
      title: chapter.title,
      slug: chapter.slug,
      page_start: chapter.page_start || 1,
      page_end: chapter.page_end || 100,
      student_learning_outcomes: chapter.student_learning_outcomes || [],
      chapter_summary: chapter.chapter_summary || '',
      seo: chapter.seo || {},
      workflow_status: 'live'
    },
    { upsert: true, new: true }
  );
  console.log('✓ Chapter saved:', chapterDoc.title);

  // Create topics
  let topicCount = 0;
  for (const topicData of topics) {
    const topic = await Topic.findOneAndUpdate(
      {
        chapter: chapterDoc._id,
        slug: topicData.slug
      },
      {
        ...topicData,
        chapter: chapterDoc._id,
        book: book._id,
        workflow_status: 'live'
      },
      { upsert: true, new: true }
    );
    topicCount++;
    console.log(`  ✓ Topic ${topicCount}/${topics.length}: ${topic.title}`);
  }

  console.log('\n🎉 INGESTION COMPLETE!');
  console.log(`Book: ${book.title}`);
  console.log(`Chapter: ${chapterDoc.title}`);
  console.log(`Topics: ${topicCount}`);
  console.log(`Status: live`);

  await mongoose.disconnect();
  console.log('\nDisconnected from MongoDB.');
}

// Run with CLI argument
const filePath = process.argv[2];
ingestDeepSeekJSON(filePath).catch(console.error);
