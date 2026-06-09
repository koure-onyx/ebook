# GAP LIST - Target vs Source Frontend Audit

## Summary
- Source files: 173 TypeScript/TSX files
- Target files: 138 TypeScript/TSX files  
- Gap: 35 files missing or incomplete

---

## CRITICAL GAPS (Must Fix)

### 1. NextAuth Configuration - MISSING
**File**: `target/ebook/student/student/app/api/auth/[...nextauth]/route.ts`
**Status**: MISSING
**Source Reference**: `source/study_vault_onyx/apps/student/app/api/auth/[...nextauth]/route.ts`
**Impact**: Google OAuth will not work without this
**Fix Required**: 
- Create route.ts with NextAuth handler
- Configure Google provider only
- Implement JWT callback to store backend token
- Session callback must expose user.id, user.role, user.token

### 2. API Client Layer - INCOMPLETE
**File**: `target/ebook/student/student/lib/api/client.ts`
**Status**: EXISTS but incomplete
**Issues**:
- Base URL uses port 5000, should be 4000 per requirements
- No getSession integration for Bearer token
- No 401 handling with signOut()
- Missing named export functions for all endpoints
**Fix Required**: Complete rewrite per Step 2 requirements

### 3. ContentBlockRenderer - KaTeX Bug
**File**: `target/ebook/student/student/components/reader/ContentBlockRenderer.tsx`
**Status**: EXISTS but BROKEN
**Issue**: Math blocks render as plain text, not LaTeX
**Missing Block Types**:
- math_inline → should use `<InlineMath>`
- math_block → should use `<BlockMath>`
- code → syntax highlighting
- exercise → question/answer reveal
**Fix Required**: Add react-katex imports and math rendering logic

### 4. Package Dependencies - MISSING
**File**: `target/ebook/student/student/package.json`
**Status**: MISSING critical deps
**Missing**:
- `react-katex` (for math rendering)
- `next-auth` (for Google OAuth)
- `jsonwebtoken` (for JWT handling)
- `mongoose` (if using direct DB)
**Fix Required**: Add to package.json

---

## PAGE GAPS

### Dashboard Pages

| Page | Status | Issues |
|------|--------|--------|
| (dashboard)/dashboard/page.tsx | EXISTS | Uses direct DB instead of Express API |
| (dashboard)/books/page.tsx | EXISTS | Uses direct DB instead of Express API |
| (dashboard)/books/[...slug]/page.tsx | EXISTS | May need API updates |
| (dashboard)/[boardSlug]/[programSlug]/[subjectSlug]/[[...slug]]/page.tsx | EXISTS | Uses loadBookReaderData (direct DB) |
| (dashboard)/progress/page.tsx | EXISTS | Needs API client integration |
| (dashboard)/my-vault/page.tsx | EXISTS | Needs API client integration |
| (dashboard)/quiz/[topicId]/page.tsx | EXISTS | Needs API client integration |
| (dashboard)/billing/page.tsx | EXISTS | Stripe integration needed |
| (dashboard)/premium/page.tsx | EXISTS | Static content OK |
| (dashboard)/layout.tsx | EXISTS | Check SessionProvider wrapper |

### Public Pages

| Page | Status | Issues |
|------|--------|--------|
| (public)/page.tsx | EXISTS | Static OK |
| (public)/search/page.tsx | EXISTS | Needs API client |
| (public)/[...slug]/page.tsx | EXISTS | Uses direct DB |

### Auth Pages (Should Be Removed)

| Page | Status | Action |
|------|--------|--------|
| (auth)/login/page.tsx | EXISTS | REMOVE - Google OAuth only |
| (auth)/signup/page.tsx | EXISTS | REMOVE - Google OAuth only |
| (auth)/forgot-password/page.tsx | EXISTS | REMOVE - Google OAuth only |
| (auth)/onboarding/page.tsx | EXISTS | Keep if needed |

---

## COMPONENT GAPS

### Reader Components

| Component | Status | Issues |
|-----------|--------|--------|
| ContentBlockRenderer.tsx | EXISTS | KaTeX bug, missing block types |
| TopicArticle.tsx | EXISTS | Check API integration |
| TopicReaderClient.tsx | EXISTS | Check API integration |
| TopicLevelReader.tsx | EXISTS | Check API integration |
| ChapterReader.tsx | EXISTS | Check API integration |
| BookChapterIndex.tsx | EXISTS | Check API integration |
| AIExplainPanel.tsx | EXISTS | SSE streaming needs review |
| MarkAsReadButton.tsx | EXISTS | API endpoint update |
| SaveToVaultButton.tsx | EXISTS | API endpoint update |
| QuickQuizButton.tsx | EXISTS | Navigation OK |
| PreviewWall.tsx | EXISTS | Static OK |

### Layout Components

| Component | Status | Issues |
|-----------|--------|--------|
| AppShell.tsx | MISSING | Critical - main app wrapper |
| PageContainer.tsx | MISSING | Used in dashboard pages |

### Dashboard Components

| Component | Status | Issues |
|-----------|--------|--------|
| DashboardComponents.tsx | Check | Verify exports match API shape |
| BooksGrid.tsx | Check | Verify props match API |
| VaultItemCard.tsx | Check | Verify props match API |
| FlashcardDeck.tsx | Check | Verify exists |

### AI Components

| Component | Status | Issues |
|-----------|--------|--------|
| ExplainPanel.tsx | Check | SSE streaming |
| FlashcardCreator.tsx | Check | API integration |

---

## HOOK GAPS

| Hook | Status | Issues |
|------|--------|--------|
| useTopicBySlug.ts | Check | API endpoint update |
| useAICredits.ts | Check | API endpoint update |
| use-user.ts | Check | Session integration |

---

## LIB GAPS

| File | Status | Issues |
|------|--------|--------|
| lib/api/client.ts | EXISTS | Incomplete - needs rewrite |
| lib/api/auth.ts | EXISTS | Login/signup should be removed |
| lib/load-book-reader.ts | EXISTS | Direct DB - may need API version |
| lib/reader-urls.ts | EXISTS | Check URL patterns |
| lib/navigation-map.ts | EXISTS | Static OK |
| lib/subject-icons.ts | EXISTS | Static OK |

---

## ENVIRONMENT FILE GAPS

**File**: `target/ebook/student/student/.env.local.example`
**Current Content**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```
**Issues**:
- Wrong port (5000 → 4000)
- Missing NEXTAUTH_URL
- Missing NEXTAUTH_SECRET
- Missing GOOGLE_CLIENT_SECRET

**Required**:
```
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## PRIORITY ORDER FOR FIXES

1. **P0 - Blocking**:
   - Create NextAuth config with Google provider
   - Fix API client with auth integration
   - Add react-katex and next-auth to package.json
   - Fix .env.local.example

2. **P1 - High Priority**:
   - Fix KaTeX rendering in ContentBlockRenderer
   - Create/update AppShell with SessionProvider
   - Remove login/signup pages

3. **P2 - Medium Priority**:
   - Update all pages to use API client
   - Verify component props match API responses
   - Test end-to-end flows

4. **P3 - Low Priority**:
   - Code cleanup
   - Type improvements
   - Performance optimizations
