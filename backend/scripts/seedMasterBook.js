import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Sample Grade 9 Physics Book Data - Master Source Document
const grade9PhysicsBook = {
  book_metadata: {
    title: "Physics Grade 9",
    slug: "physics-grade-9",
    subject_slug: "science",
    program_slug: "science",
    grade_level: "9",
    board_name: "Punjab Curriculum and Textbook Board",
    board_short_code: "PUB",
    is_current_edition: true,
    is_live: true,
    is_public: true,
    description: "Complete Physics textbook for Grade 9 students following Punjab Board curriculum"
  },
  chapter: {
    chapter_number: 1,
    title: "Physical Quantities and Measurement",
    slug: "physical-quantities-and-measurement",
    description: "Introduction to physical quantities, SI units, and measurement techniques"
  },
  topics: [
    {
      topic_number: 1,
      title: "Introduction to Physics",
      slug: "introduction-to-physics",
      display_order: 1,
      content_blocks: [
        {
          type: "heading",
          level: 2,
          content: "<strong>Physics</strong> is the branch of science that deals with matter, energy, and their interactions."
        },
        {
          type: "paragraph",
          content: "<p>Physics is the study of matter and energy. It explains how things move, why they move, and what happens when they interact with each other. From the smallest particles to the largest galaxies, physics helps us understand the universe around us.</p>"
        },
        {
          type: "list",
          list_type: "unordered",
          items: [
            "<li>Mechanics - study of motion and forces</li>",
            "<li>Thermodynamics - study of heat and temperature</li>",
            "<li>Electromagnetism - study of electricity and magnetism</li>",
            "<li>Optics - study of light</li>",
            "<li>Modern Physics - study of atoms and subatomic particles</li>"
          ]
        }
      ]
    },
    {
      topic_number: 2,
      title: "Physical Quantities",
      slug: "physical-quantities",
      display_order: 2,
      content_blocks: [
        {
          type: "heading",
          level: 2,
          content: "<strong>Physical Quantities</strong> are properties that can be measured."
        },
        {
          type: "paragraph",
          content: "<p>All physical quantities consist of a <strong>magnitude</strong> and a <strong>unit</strong>. The magnitude tells us how much of the quantity there is, and the unit tells us what standard we are using for comparison.</p>"
        },
        {
          type: "callout",
          callout_type: "info",
          title: "Key Concept",
          content: "<p>Every measurement has two parts: a number and a unit. For example, 5 meters, where 5 is the magnitude and meter is the unit.</p>"
        }
      ]
    },
    {
      topic_number: 3,
      title: "SI Units",
      slug: "si-units",
      display_order: 3,
      content_blocks: [
        {
          type: "heading",
          level: 2,
          content: "<strong>International System of Units (SI)</strong>"
        },
        {
          type: "paragraph",
          content: "<p>The International System of Units (SI) is the modern form of the metric system. It provides a consistent framework for measurements worldwide.</p>"
        },
        {
          type: "table",
          headers: ["Quantity", "SI Unit", "Symbol"],
          rows: [
            ["Length", "meter", "m"],
            ["Mass", "kilogram", "kg"],
            ["Time", "second", "s"],
            ["Electric Current", "ampere", "A"],
            ["Temperature", "kelvin", "K"]
          ]
        }
      ]
    }
  ]
};

async function seedMasterBook() {
  console.log('📚 Starting master book seeding...\n');
  
  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'studyvault'
    });
    console.log('✅ Connected to studyvault database\n');

    const db = mongoose.connection.db;

    // Verify collections are empty
    const booksCount = await db.collection('books').countDocuments();
    const chaptersCount = await db.collection('chapters').countDocuments();
    const topicsCount = await db.collection('topics').countDocuments();

    if (booksCount > 0 || chaptersCount > 0 || topicsCount > 0) {
      console.warn('⚠️  Warning: Collections are not empty!');
      console.log(`   - books: ${booksCount}`);
      console.log(`   - chapters: ${chaptersCount}`);
      console.log(`   - topics: ${topicsCount}`);
      console.log('   Consider running reset script first.\n');
    }

    // Seed via API endpoint
    console.log('🌐 Sending ingestion request to backend API...\n');
    
    const response = await fetch('http://localhost:4000/api/v1/ingestion/book', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(grade9PhysicsBook)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      console.log('✅ INGESTION SUCCESSFUL!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Ingestion Results:');
      
      if (result.data) {
        const { book, chapters, topics } = result.data;
        console.log(`   📖 Book: "${book.title}" (ID: ${book._id})`);
        console.log(`   📑 Chapters created: ${Array.isArray(chapters) ? chapters.length : 1}`);
        console.log(`   📝 Topics created: ${Array.isArray(topics) ? topics.length : 'N/A'}`);
      }
      
      console.log('\n🔍 Verifying database counts...');
      const newBooksCount = await db.collection('books').countDocuments();
      const newChaptersCount = await db.collection('chapters').countDocuments();
      const newTopicsCount = await db.collection('topics').countDocuments();
      
      console.log(`   - books: ${newBooksCount}`);
      console.log(`   - chapters: ${newChaptersCount}`);
      console.log(`   - topics: ${newTopicsCount}`);
      
      console.log('\n✅ SEEDING COMPLETE!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Next steps:');
      console.log('1. Open student app: http://localhost:3000');
      console.log('2. Navigate to: /books/pub/grade-9/science/physics-grade-9');
      console.log('3. Verify content renders correctly without truncation\n');
      
    } else {
      console.error('❌ INGESTION FAILED!');
      console.error('Error:', result.error || result.message);
      console.error('Details:', result.details);
    }

  } catch (error) {
    console.error('❌ Error during seeding:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from database');
  }
}

seedMasterBook();
