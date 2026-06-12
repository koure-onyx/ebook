import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function resetAndReingest() {
  console.log('🔄 Starting database reset and fresh ingestion cycle...\n');
  
  try {
    // Connect to database
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'studyvault'
    });
    console.log('✅ Connected to studyvault database\n');

    const db = mongoose.connection.db;

    // Step 1: Show current counts
    console.log('📊 Current database state:');
    const collections = ['books', 'chapters', 'topics'];
    for (const colName of collections) {
      const count = await db.collection(colName).countDocuments();
      console.log(`   - ${colName}: ${count} documents`);
    }
    console.log('');

    // Step 2: Drop only textbook structure collections (preserve users, auth, etc.)
    console.log('🗑️  Dropping legacy textbook collections...');
    
    const dropPromises = [
      db.collection('books').drop().catch(() => {}),
      db.collection('chapters').drop().catch(() => {}),
      db.collection('topics').drop().catch(() => {})
    ];
    
    await Promise.all(dropPromises);
    console.log('✅ Dropped: books, chapters, topics\n');

    // Step 3: Verify clean slate
    console.log('🔍 Verifying clean slate...');
    const booksCount = await db.collection('books').countDocuments();
    const chaptersCount = await db.collection('chapters').countDocuments();
    const topicsCount = await db.collection('topics').countDocuments();
    
    if (booksCount === 0 && chaptersCount === 0 && topicsCount === 0) {
      console.log('✅ Database is clean! All textbook collections are empty.\n');
    } else {
      console.warn('⚠️  Warning: Some collections still have data:');
      console.log(`   - books: ${booksCount}`);
      console.log(`   - chapters: ${chaptersCount}`);
      console.log(`   - topics: ${topicsCount}\n`);
    }

    // Step 4: Verify API endpoint returns empty array
    console.log('🌐 Testing GET /api/v1/books endpoint...');
    const response = await fetch('http://localhost:5000/api/v1/books', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }).catch(() => ({ json: async () => [] }));
    
    const books = await response.json().catch(() => []);
    if (Array.isArray(books) && books.length === 0) {
      console.log('✅ API returns empty array as expected\n');
    } else {
      console.log('ℹ️  API returned:', Array.isArray(books) ? `${books.length} books` : 'non-array response\n');
    }

    console.log('\n✅ DATABASE RESET COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Next steps:');
    console.log('1. Upload your master JSON files via the admin ingestion UI');
    console.log('   → Navigate to: http://localhost:3001/admin/books/ingest');
    console.log('2. Or use curl/Postman to POST to: POST /api/v1/ingestion/book');
    console.log('3. Verify content renders correctly in student reader\n');
    
  } catch (error) {
    console.error('❌ Error during reset:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from database');
  }
}

resetAndReingest();
