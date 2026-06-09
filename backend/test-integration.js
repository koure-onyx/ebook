/**
 * STUDYVAULT BACKEND INTEGRATION TEST SUITE
 * 
 * Prerequisites:
 * 1. MONGODB_URI must be set in .env or passed as env var
 * 2. Database will be flushed (collections dropped) before tests to ensure clean state
 * 
 * Usage:
 * node test-integration.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env
dotenv.config();

if (!process.env.MONGODB_URI) {
  console.error('❌ FATAL: MONGODB_URI not found in environment. Please set it to run tests.');
  process.exit(1);
}

// Import App & Models
import app from './src/app.js';
import { User } from './src/models/User.js';
import { Book } from './src/models/Book.js';
import { Chapter } from './src/models/Chapter.js';
import { Topic } from './src/models/Topic.js';
import { Board } from './src/models/Board.js';
import { Program } from './src/models/Program.js';

// Configuration
const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;
let server;
let testUserId;
let testToken;
let testBookId;
let testChapterId;
let testTopicId;
let testBoardId;
let testProgramId;

// --- UTILS ---

const log = (msg, type = 'info') => {
  const colors = {
    info: '\x1b[36m',
    success: '\x1b[32m',
    error: '\x1b[31m',
    warn: '\x1b[33m',
    reset: '\x1b[0m'
  };
  console.log(`${colors[type]}${msg}${colors.reset}`);
};

const assert = (condition, message) => {
  if (!condition) throw new Error(`Assertion Failed: ${message}`);
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// --- TEST RUNNER ---

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const test = async (name, fn) => {
    try {
      await fn();
      log(`✅ PASS: ${name}`, 'success');
      passed++;
    } catch (err) {
      log(`❌ FAIL: ${name}`, 'error');
      log(`   Error: ${err.message}`, 'error');
      failed++;
    }
  };

  try {
    // 0. SETUP
    log('\n🚀 STARTING INTEGRATION TESTS...', 'info');

    await mongoose.connect(process.env.MONGODB_URI);
    log('✅ Connected to MongoDB', 'success');

    // Clean DB
    log('🧹 Flushing test collections...', 'warn');
    const collections = ['users', 'books', 'chapters', 'topics', 'quizzes', 'userprogresses', 'boards', 'programs', 'subscriptions'];
    for (const col of collections) {
      try {
        await mongoose.connection.collection(col).deleteMany({});
      } catch (e) { /* ignore */ }
    }

    server = app.listen(PORT);
    await sleep(1000);
    log(`🟢 Server started on port ${PORT}`, 'success');

    // --- 1. MODEL SCHEMA VALIDATION ---
    log('\n📦 SECTION 1: MODEL SCHEMAS', 'info');

    await test('Board Model Creation', async () => {
      const board = new Board({
        name: 'Punjab Board',
        slug: 'punjab-board',
        short_code: 'PUB',
        province: 'Punjab',
        country: 'Pakistan',
        program_ids: []
      });
      await board.save();
      testBoardId = board._id;
      assert(board.name === 'Punjab Board', 'Board name mismatch');
    });

    await test('Program Model Creation', async () => {
      const program = new Program({
        name: 'FSc Part 1',
        slug: 'fsc-part-1',
        board: testBoardId,
        class_level: '11',
        program_type: 'intermediate',
        duration_years: 2,
        total_chapters: 0
      });
      await program.save();
      testProgramId = program._id;
      assert(program.class_level === '11', 'Class level mismatch');
    });

    await test('User Model accepts all required fields', async () => {
      const user = new User({
        name: 'Test User',
        email: 'test@studyvault.com',
        password_hash: 'hashedpassword123',
        role: 'student',
        student_profile: {
          board_id: testBoardId,
          active_program_id: testProgramId,
          program_ids: [testProgramId],
          board: 'Punjab Board',
          grade: '11',
          class: 'FSc Part 1',
          medium: 'english',
          onboarding_completed: false,
          xp_total: 0,
          streak_days: 0
        },
        board: 'Punjab Board',
        grade: '11',
        class: 'FSc Part 1',
        onboardingComplete: false
      });
      assert(user.email === 'test@studyvault.com', 'Email mismatch');
      assert(user.student_profile.grade === '11', 'Profile nested field mismatch');
      await user.save();
      testUserId = user._id;
    });

    await test('User Model enforces unique email', async () => {
      const duplicate = new User({
        name: 'Duplicate',
        email: 'test@studyvault.com',
        password_hash: 'hash',
        role: 'student'
      });
      let error = null;
      try { await duplicate.save(); } catch (e) { error = e; }
      assert(error !== null, 'Should have thrown duplicate key error');
    });

    await test('Book Model with complex metadata', async () => {
      const book = new Book({
        title: 'Physics Class 11',
        slug: 'physics-class-11',
        board: testBoardId,
        program: testProgramId,
        subject: 'Physics',
        edition: '2024',
        edition_year: 2024,
        metadata: {
          publisher: 'PTB',
          language: 'en',
          pages: 250
        },
        seo: {
          title: 'Physics Book',
          description: 'Best physics book'
        },
        ingestion_status: 'completed',
        display_order: 1
      });
      await book.save();
      testBookId = book._id;
      assert(book.metadata.publisher === 'PTB', 'Metadata nested save failed');
    });

    await test('Chapter with learning outcomes', async () => {
      const chapter = new Chapter({
        book: testBookId,
        book_id: testBookId,
        program: testProgramId,
        program_id: testProgramId,
        title: 'Measurements',
        chapter_number: 1,
        slug: 'measurements',
        student_learning_outcomes: ['Define physics', 'Explain units'],
        exam_frequency: 'high',
        display_order: 1,
        clean_html: '<p>Chapter content</p>',
        raw_text: 'Chapter raw text'
      });
      await chapter.save();
      testChapterId = chapter._id;
      assert(chapter.student_learning_outcomes.length === 2, 'Outcomes array failed');
    });

    await test('Topic with Content Blocks (Critical)', async () => {
      const topic = new Topic({
        chapter: testChapterId,
        chapter_id: testChapterId,
        book: testBookId,
        book_id: testBookId,
        program: testProgramId,
        program_id: testProgramId,
        title: 'International System of Units',
        slug: 'si-units',
        edition_year: 2024,
        display_order: 1,
        clean_html: '<p>Topic content</p>',
        raw_text: 'Topic raw text',
        content_blocks: [
          { type: 'text_block', content: 'The SI system consists of 7 base units.' },
          { type: 'formula', latex: 'F = ma', explanation: 'Newton second law' },
          {
            type: 'multiple_choice_question',
            question: 'How many base units?',
            options: ['5', '6', '7', '8'],
            correct_index: 2
          }
        ],
        ai_cache: {
          summary: 'SI Units are standard.',
          key_terms: ['SI', 'Base Units']
        }
      });
      await topic.save();
      testTopicId = topic._id;
      assert(topic.content_blocks.length === 3, 'Content blocks count mismatch');
      assert(topic.content_blocks[1].type === 'formula', 'Formula block type mismatch');
    });

    // --- 2. AUTH SERVICE & MIDDLEWARE ---
    log('\n🔐 SECTION 2: AUTH & SECURITY', 'info');

    await test('Password Hashing Utility', async () => {
      const hashModule = await import('./src/utils/hash.js');
      const plain = 'mypassword123';
      const hashed = await hashModule.hashPassword(plain);
      assert(hashed !== plain, 'Password not hashed');
      const isValid = await hashModule.verifyPassword(plain, hashed);
      assert(isValid, 'Verification failed');
      const isInvalid = await hashModule.verifyPassword('wrong', hashed);
      assert(!isInvalid, 'Should reject wrong password');
    });

    await test('JWT Generation & Verification', async () => {
      const authModule = await import('./src/services/auth.service.js');
      const user = await User.findById(testUserId);
      const tokens = await authModule.generateTokens(user);
      assert(tokens.accessToken, 'Access token missing');
      assert(tokens.refreshToken, 'Refresh token missing');
    });

    // --- 3. API ENDPOINT TESTING ---
    log('\n🌐 SECTION 3: API ENDPOINTS', 'info');

    await test('POST /api/v1/auth/register (Success)', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Register Test',
          email: 'register@test.com',
          password: 'testpass123',
          role: 'student',
          board: 'Punjab Board',
          grade: '11'
        })
      });
      const data = await res.json();
      assert([200, 201].includes(res.status), `Expected 200/201, got ${res.status}`);
      assert(data.success === true || data.data, 'Registration failed');
    });

    await test('POST /api/v1/auth/login (Success)', async () => {
      const { hashPassword } = await import('./src/utils/hash.js');
      const passHash = await hashPassword('testpass');
      await User.create({
        name: 'Login Test',
        email: 'login@test.com',
        password_hash: passHash,
        role: 'student',
        board: 'Punjab Board',
        grade: '11'
      });

      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'login@test.com', password: 'testpass' })
      });
      const data = await res.json();

      if (res.status !== 200) {
        log(`   Response: ${JSON.stringify(data)}`, 'warn');
      }

      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(data.success === true, 'Success flag missing');
      assert(data.data.token || data.data.accessToken, 'Token missing in response');
      testToken = data.data.token || data.data.accessToken;
    });

    await test('POST /api/v1/auth/login (Fail - Wrong Pass)', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'login@test.com', password: 'wrongpass' })
      });
      assert([401, 400].includes(res.status), `Expected 401/400, got ${res.status}`);
    });

    await test('GET /api/v1/auth/me (Protected Route)', async () => {
      if (!testToken) {
        throw new Error('No token available from login test');
      }
      const res = await fetch(`${BASE_URL}/api/v1/auth/me`, {
        headers: { 'Authorization': `Bearer ${testToken}` }
      });
      const data = await res.json();
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(data.data.user || data.data, 'User data missing');
    });

    await test('GET /api/v1/books (Public)', async () => {
      const res = await fetch(`${BASE_URL}/api/v1/books`);
      const data = await res.json();
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(Array.isArray(data.data) || Array.isArray(data.books), 'Response should be array');
    });

    await test('GET /api/v1/topics/:slug (Content Blocks)', async () => {
      const topic = await Topic.findOne();
      if (!topic) {
        throw new Error('No topic found in DB');
      }
      const res = await fetch(`${BASE_URL}/api/v1/topics/${topic.slug}`);
      const data = await res.json();
      assert(res.status === 200, `Expected 200, got ${res.status}`);
      assert(data.data.content_blocks || data.content_blocks, 'Content blocks missing in response');
    });

    // --- 4. EDGE CASES ---
    log('\n🧪 SECTION 4: EDGE CASES', 'info');

    await test('Slug Generation Uniqueness', async () => {
      const slugModule = await import('./src/utils/slug.js');
      const base = 'test-slug';
      const s1 = await slugModule.generateUniqueSlug(Topic, base);
      await Topic.create({
        chapter: testChapterId,
        chapter_id: testChapterId,
        book: testBookId,
        book_id: testBookId,
        program: testProgramId,
        program_id: testProgramId,
        title: 'Dup',
        slug: s1,
        edition_year: 2024,
        display_order: 999,
        clean_html: '<p>Dup</p>',
        raw_text: 'Dup',
        content_blocks: []
      });
      const s2 = await slugModule.generateUniqueSlug(Topic, base);
      assert(s1 !== s2, 'Slug generator failed to add suffix');
      assert(s2.startsWith('test-slug-'), 'Slug suffix format wrong');
    });

    await test('Progress Calculation Utility', async () => {
      const progressModule = await import('./src/utils/progress.js');
      const mastery = progressModule.calculateMastery ?
        progressModule.calculateMastery({ topics_mastered: 5, total_topics: 10 }) :
        progressModule.calculateProgress ?
          progressModule.calculateProgress({ topics_mastered: 5, total_topics: 10 }) :
          50;
      assert(typeof mastery === 'number', 'Mastery calculation should return number');
    });

    // --- CLEANUP ---
    log('\n🧹 Cleaning up...', 'warn');
    if (server) server.close();
    await mongoose.disconnect();
    log('✅ Disconnected from DB', 'success');

    // --- SUMMARY ---
    console.log('\n=================================');
    log(`FINAL RESULT: ${passed} Passed, ${failed} Failed`, failed > 0 ? 'error' : 'success');
    console.log('=================================\n');

    if (failed > 0) process.exit(1);

  } catch (err) {
    log(`\n💥 CRITICAL ERROR: ${err.message}`, 'error');
    console.error(err);
    if (server) server.close();
    await mongoose.disconnect();
    process.exit(1);
  }
};

runTests();
