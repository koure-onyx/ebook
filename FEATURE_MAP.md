# FRONTEND FEATURE MAP - Study Vault Onyx Migration Audit

## Source Repository: /mnt/oss/qwen-workspace/source/study_vault_onyx/apps/student/

---

## PAGE INVENTORY

### 1. PUBLIC PAGES (No Auth Required)

#### (public)/page.tsx - Landing Page
- **Auth**: Public
- **Data**: None (static hero page)
- **Dependencies**: Framer Motion for animations
- **Status**: Static content, no API calls

#### (public)/search/page.tsx - Search Page
- **Auth**: Public
- **API**: GET /api/search?q={query}
- **Response Shape**: { query, results: [], count }
- **Dependencies**: SearchInput component

#### (public)/[...slug]/page.tsx - Public Topic Preview
- **Auth**: Public (limited content)
- **API**: Uses loadTopicBySlug() → loads from MongoDB directly
- **Content**: Shows preview wall for locked content
- **Dependencies**: PreviewWall, TopicArticle

---

### 2. DASHBOARD PAGES (Auth Required)

#### (dashboard)/dashboard/page.tsx
- **Auth**: Required
- **API**: GET /api/dashboard
- **Response Shape**:
  ```typescript
  {
    stats: { examReadiness, topicsMastered, xpThisWeek, currentLevel, xpToNextLevel, streakDays, topicsStudied, studiedDays },
    recentChapters: [{ _id, bookTitle, chapterTitle, progress, href }],
    books: [{ _id, title, subject, subject_icon, program_name, board, ... }],
    hotTopics: [{ _id, title, exam_frequency_count, slug }],
    vaultItems: [{ _id, topicTitle, itemType, createdAt }],
    recentQuizzes: [{ _id, topicTitle, score, status, date }],
    firstName: string
  }
  ```
- **Components**: StatCard, ContinueStudyingCard, StreakCard, HotTopicsCard, VaultSnapshotCard
- **Special**: Server Component with Suspense boundaries

#### (dashboard)/books/page.tsx
- **Auth**: Required
- **Data Source**: Direct MongoDB via Book.find() with user profile filter
- **Response Shape**: Array of book objects with chapters/topics counts
- **Components**: BooksGrid
- **Filters**: Board, grade, subject filters via URL searchParams

#### (dashboard)/books/[...slug]/page.tsx - Book Detail
- **Auth**: Required (or public preview)
- **API**: Uses loadBookReaderData() → direct DB access
- **Content**: Book cover, chapter list, progress tracking
- **Dependencies**: BookChapterIndex, FullBookViewer

#### (dashboard)/[boardSlug]/[programSlug]/[subjectSlug]/[[...slug]]/page.tsx - Reader
- **Auth**: Required for full content, public for preview
- **API**: 
  - loadBookReaderData() for book/chapter data
  - loadTopicBySlug() for topic content
- **Response Shape for Topic**:
  ```typescript
  {
    topic: { _id, title, content_blocks[], chapter_id, book_id, topic_number, difficulty, estimated_read_time, exam_frequency, key_terms },
    previousTopic: { _id, title, slug, chapterSlug },
    nextTopic: { _id, title, slug, chapterSlug },
    chapters: [],
    isLoggedIn: boolean
  }
  ```
- **Components**: BookChapterIndex, ChapterReader, TopicLevelReader, ContentBlockRenderer
- **Special**: Dynamic route with complex slug parsing

#### (dashboard)/progress/page.tsx
- **Auth**: Required
- **API**: GET /api/progress/program/:programId or GET /api/progress/chapter/:chapterId
- **Response Shape**:
  ```typescript
  {
    user_id,
    total_books_read,
    books_in_progress,
    total_topics_studied,
    quiz_scores: [],
    weekly_activity: [],
    mastery_levels: {}
  }
  ```
- **Components**: ProgressWheel, ChapterProgressDots

#### (dashboard)/my-vault/page.tsx
- **Auth**: Required
- **API**: GET /api/vault
- **Response Shape**:
  ```typescript
  {
    user_id,
    items_count,
    items: [{ _id, type, topic_id, topic_title, content, created_at }]
  }
  ```
- **Components**: VaultItemCard, FlashcardDeck

#### (dashboard)/quiz/[topicId]/page.tsx
- **Auth**: Required
- **API**: 
  - POST /api/ai/generate-questions (for AI-generated quiz)
  - POST /api/quiz/submit (for score submission)
- **Components**: QuizEngine

#### (dashboard)/billing/page.tsx
- **Auth**: Required
- **API**: GET /api/checkout/plans
- **Response Shape**: Array of subscription plans
- **Integration**: Stripe checkout

#### (dashboard)/premium/page.tsx
- **Auth**: Required
- **Data**: Static premium features list
- **Purpose**: Upsell page for free users

---

### 3. AUTH PAGES

#### (auth)/login/page.tsx
- **Auth**: Public (redirects if logged in)
- **Method**: Email/password OR Google OAuth
- **API**: POST /api/auth/login
- **Note**: INTENTIONALLY REMOVED per requirements - Google OAuth only

#### (auth)/signup/page.tsx
- **Auth**: Public (redirects if logged in)
- **Note**: INTENTIONALLY REMOVED per requirements - Google OAuth only

#### (auth)/onboarding/page.tsx
- **Auth**: Required (first-time users)
- **API**: POST /api/onboarding
- **Payload**: { board, grade, program, learning_goals }

---

## COMPONENT INVENTORY

### Reader Components (/components/reader/)

#### ContentBlockRenderer.tsx - CRITICAL
- **Purpose**: Renders structured JSON content blocks
- **Block Types Handled**:
  - heading (levels 2, 3, 4)
  - formula (styled math formulas)
  - activity (experiment blocks)
  - example (lightbulb styled)
  - callout/definition (info styled)
  - table (HTML tables)
  - list (ul/ol)
  - image (with caption)
  - quran_verse (QuranVerseRenderer)
  - **MISSING**: math/math_inline/math_block (KaTeX rendering) ← BUG
  - **MISSING**: exercise, code blocks
- **Dependencies**: QuranVerseRenderer, lucide-react icons

#### TopicArticle.tsx
- **Purpose**: Main topic content wrapper
- **Props**: topic, chapterNumber, isLoggedIn
- **Features**: 
  - Hot topic badge
  - Difficulty badge
  - Read time estimate
  - PreviewWall for non-logged-in users
- **Dependencies**: ContentBlockRenderer, PreviewWall, TopicPracticeSection

#### TopicReaderClient.tsx
- **Purpose**: Full topic reader with all interactive features
- **Features**:
  - AIExplainPanel integration
  - SaveToVaultButton
  - MarkAsReadButton
  - QuickQuizButton
  - Prev/Next navigation
  - StickyProgressBar
- **API Calls**:
  - markTopicRead() → POST /api/progress/mark-read
  - generateAIExplanation() → POST /api/ai/explain
  - generateFlashcards() → POST /api/ai/flashcards
  - getAdjacentTopics() → GET /api/topics/:id/adjacent

#### TopicLevelReader.tsx
- **Purpose**: Wrapper for topic reading experience
- **Props**: topic, previousTopic, nextTopic, chapters, isLoggedIn
- **Uses**: TopicArticle internally

#### ChapterReader.tsx
- **Purpose**: Chapter overview with topic list
- **Props**: chapter, chapterTopics, prev/next chapter slugs

#### BookChapterIndex.tsx
- **Purpose**: Full book view with all chapters
- **Props**: book, program, chapters, userProgress

#### PreviewWall.tsx
- **Purpose**: Paywall/lock screen for non-premium content
- **Static**: No API calls

#### MarkAsReadButton.tsx
- **API**: POST /api/progress/mark-read
- **Payload**: { topicId }

#### SaveToVaultButton.tsx
- **API**: POST /api/vault
- **Payload**: { topicId, type, content }

#### QuickQuizButton.tsx
- **Navigation**: Routes to /quiz/[topicId]

#### AIExplainPanel.tsx
- **API**: POST /api/ai/explain
- **Streaming**: SSE response handling
- **Props**: topicId, selectedText

---

### Dashboard Components (/components/dashboard/)

#### DashboardComponents.tsx
- **Exports**: StatCard, ContinueStudyingCard, StreakCard, HotTopicsCard, VaultSnapshotCard
- **Data Props**: Match dashboard API response shape

---

### Book Components (/components/books/)

#### BooksGrid.tsx
- **Props**: books[] array
- **Features**: Filter by subject, board, grade
- **Navigation**: Links to book detail pages

---

### Quiz Components (/components/quiz/)

#### QuizEngine.tsx
- **Props**: questions[], topicId
- **Features**: Multiple choice, score calculation
- **API**: submitQuizScore() → POST /api/quiz/score

---

### AI Components (/components/ai/)

#### ExplainPanel.tsx / AIExplainPanel.tsx
- **API**: Streaming SSE from /api/ai/explain
- **Features**: Text selection, streaming response

#### FlashcardCreator.tsx
- **API**: POST /api/ai/flashcards
- **Then**: saveToVault() with flashcard data

---

### Layout Components (/components/layout/)

#### AppShell.tsx
- **Purpose**: Main app wrapper with navigation
- **Auth**: Should wrap with SessionProvider
- **Navigation**: Sidebar + top nav

#### PageContainer.tsx
- **Purpose**: Standard page layout wrapper

---

### Navigation Components (/components/navigation/)

#### AccountNav.tsx
- **User Menu**: Profile, settings, logout
- **Auth**: Uses session context

#### SearchInput.tsx
- **Navigation**: Routes to /search?q={query}

---

### Progress Components (/components/progress/)

#### ProgressWheel.tsx
- **Visual**: Circular progress indicator
- **Props**: percentage, label

#### ChapterProgressDots.tsx
- **Visual**: Dot grid showing chapter completion

---

### UI Components (/components/ui/)

Standard primitives: Button, Card, Skeleton, Badge, etc.

---

## HOOKS INVENTORY

#### useTopicBySlug.ts
- **API**: GET /api/topics/by-slug/:subject/:chapter/:topic
- **Returns**: topicData, previousTopic, nextTopic, loading, error

#### useAICredits.ts
- **API**: GET /api/user/credits
- **Returns**: credit balance, usage limits

#### use-debounce.ts
- **Utility**: Debounce hook for search input

#### use-user.ts
- **Auth**: Gets current user from session

---

## LIB UTILITIES

#### load-book-reader.ts
- **Functions**: loadBookReaderData(), loadTopicBySlug(), findChapterBySlug()
- **DB Access**: Direct MongoDB queries
- **Auth**: Checks user role for content visibility

#### reader-urls.ts
- **Functions**: bookUrl(), chapterUrl(), topicUrl()
- **Purpose**: URL generation for navigation

#### navigation-map.ts
- **Purpose**: Maps slugs to display names

#### subject-icons.ts
- **Purpose**: Subject-to-icon mapping

---

## API ENDPOINTS SUMMARY

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/health | GET | Public | Health check |
| /api/books | GET | Public | List all books |
| /api/search | GET | Public | Search content |
| /api/dashboard | GET | Required | Dashboard data |
| /api/progress | GET | Required | User progress |
| /api/progress/mark-read | POST | Required | Mark topic read |
| /api/vault | GET | Required | Get vault items |
| /api/vault | POST | Required | Save to vault |
| /api/vault/:id | DELETE | Required | Delete vault item |
| /api/user/credits | GET | Required | AI credits balance |
| /api/ai/explain | POST | Required | AI explanation (SSE) |
| /api/ai/flashcards | POST | Required | Generate flashcards |
| /api/ai/generate-questions | POST | Required | Generate quiz |
| /api/quiz/score | POST | Required | Submit quiz score |
| /api/topics/:id/adjacent | GET | Public | Prev/next topics |
| /api/topics/by-slug/:s/:c/:t | GET | Public | Get topic by slug |
| /api/auth/google | POST | Public | Google OAuth callback |
| /api/auth/me | GET | Required | Current user |
| /api/checkout/plans | GET | Required | Subscription plans |

---

## SPECIAL DEPENDENCIES

1. **KaTeX** (react-katex): Math rendering - BUG: Not implemented in ContentBlockRenderer
2. **Quran Fonts**: Special fonts for Quran verse rendering
3. **Framer Motion**: Animations on landing page
4. **Lucide React**: Icon library
5. **SWR**: Data fetching hooks
6. **NextAuth**: Google OAuth provider only

---

## KNOWN ISSUES FROM SOURCE

1. **Math Rendering Bug**: ContentBlockRenderer renders math blocks as plain text instead of using KaTeX
2. **Login/Signup Pages**: Exist in source but should be removed (Google OAuth only)
3. **API Route Mismatch**: Source uses Next.js API routes (/api/*), target needs Express backend calls
