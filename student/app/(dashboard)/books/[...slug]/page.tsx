import { notFound } from 'next/navigation';
import { getBookBySubjectServer, getBooksServer } from '@/lib/api/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { BookChapterIndex } from '@/components/reader/BookChapterIndex';
import { TopicLevelReader } from '@/components/reader/TopicLevelReader';
import { ChapterReader } from '@/components/reader/ChapterReader';

function normalizeSegment(value: string | null | undefined) {
  return String(value ?? '').trim().toLowerCase();
}

function normalizeGradeValue(value: string | null | undefined) {
  const normalized = normalizeSegment(value);
  if (!normalized) return '';
  if (normalized.includes('all')) return 'all';
  return normalized;
}

function isAllGrade(value: string | null | undefined) {
  return ['all', 'all grades'].includes(normalizeSegment(value));
}

function gradesMatch(bookGrade: string | null | undefined, routeGrade: string | null | undefined) {
  const normalizedBookGrade = normalizeGradeValue(bookGrade);
  const normalizedRouteGrade = normalizeGradeValue(routeGrade);

  if (!normalizedBookGrade || !normalizedRouteGrade) return false;
  if (normalizedBookGrade === normalizedRouteGrade) return true;

  const bookNumeric = normalizedBookGrade.match(/\d{1,2}/)?.[0];
  const routeNumeric = normalizedRouteGrade.match(/\d{1,2}/)?.[0];
  if (bookNumeric && routeNumeric) {
    return bookNumeric === routeNumeric;
  }

  return false;
}

function bookScore(book: any) {
  const chapterCount = Number(book.total_chapters ?? book.chapter_count ?? 0);
  const currentEdition = book.is_current_edition === false ? 0 : 1;
  const live = book.is_live === false ? 0 : 1;
  const editionYear = Number(book.edition_year ?? 0);

  return [
    currentEdition,
    live,
    chapterCount > 0 ? 1 : 0,
    chapterCount,
    editionYear,
  ];
}

function compareBooks(a: any, b: any) {
  const sa = bookScore(a);
  const sb = bookScore(b);
  for (let i = 0; i < sa.length; i += 1) {
    if (sa[i] !== sb[i]) return sb[i] - sa[i];
  }
  return 0;
}

async function findBookByBoardGradeSubject(boardCode: string, grade: string, subjectSlug: string, token: string | null) {
  try {
    console.log('[STUDENT BOOK FETCH DEBUG] Looking for book with:', { boardCode, grade, subjectSlug, token: !!token });
    const books = await getBooksServer(token, { grade, subject: subjectSlug });
    console.log('[STUDENT BOOK FETCH DEBUG] Raw books response:', JSON.stringify(books));
    const bookArray = Array.isArray(books) ? books : (books?.books || []);
    console.log('[STUDENT BOOK FETCH DEBUG] Extracted bookArray:', bookArray.length, 'books');
    const normalizedBoardCode = normalizeSegment(boardCode);
    const normalizedGrade = normalizeSegment(grade);
    const allowAnyGrade = isAllGrade(grade);

    for (const book of bookArray) {
      const bookBoardCode = normalizeSegment(book.board_id?.short_code || book.board_id?.slug || book.board_short_code || '');
      const bookGrade = normalizeSegment(book.grade);
      console.log('[STUDENT BOOK FETCH DEBUG] Checking book:', { 
        title: book.title, 
        boardCode: bookBoardCode, 
        grade: book.grade,
        matches: bookBoardCode === normalizedBoardCode 
      });
      if (
        bookBoardCode === normalizedBoardCode &&
        (allowAnyGrade || gradesMatch(bookGrade, normalizedGrade) || gradesMatch(book.metadata?.grade_level, normalizedGrade))
      ) {
        console.log('[STUDENT BOOK FETCH DEBUG] Found matching book:', book.title);
        return book;
      }
    }

    if (bookArray.length > 0) {
      const sameBoardBooks = bookArray.filter((book: any) => {
        return normalizeSegment(book.board_id?.short_code || book.board_id?.slug || book.board_short_code || '') === normalizedBoardCode;
      });

      const pool = (sameBoardBooks.length > 0 ? sameBoardBooks : bookArray).filter((book: any) => {
        return allowAnyGrade || gradesMatch(book.grade, normalizedGrade) || gradesMatch(book.metadata?.grade_level, normalizedGrade);
      });

      if (pool.length > 0) {
        pool.sort(compareBooks);
        return pool[0];
      }

      const fallbackPool = sameBoardBooks.length > 0 ? sameBoardBooks : bookArray;
      fallbackPool.sort(compareBooks);
      return fallbackPool[0];
    }
  } catch (error) {
    console.error('[STUDENT BOOK FETCH DEBUG] Error finding book:', error);
  }
  console.log('[STUDENT BOOK FETCH DEBUG] No book found');
  return null;
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const slugArray = resolvedParams.slug || [];

  let boardCode = slugArray[0] || null;
  let grade = slugArray[1] || null;
  let subjectSlug = slugArray[2] || null;
  let chapterSlug = slugArray[3] || null;
  let topicSlug = slugArray[4] || null;

  // 1. DEFENSIVE LOOKUP: If we don't have enough slugs, try to resolve the book metadata
  if (slugArray.length < 3 && slugArray.length > 0) {
    const idOrSlug = slugArray[0];
    try {
      const meta = await getBookBySubjectServer(null, idOrSlug);
      if (meta && meta.boardSlug && meta.grade) {
        boardCode = meta.boardSlug;
        grade = String(meta.grade);
        subjectSlug = idOrSlug;
        // Shift other slugs if they exist
        chapterSlug = slugArray[1] || null;
        topicSlug = slugArray[2] || null;
      }
    } catch (e) {
      console.error('Defensive lookup failed:', e);
    }
  }

  // Final check for required parameters
  if (!boardCode || !grade || !subjectSlug) {
    notFound();
  }

  try {
    const session = await getServerSession(authOptions);
    const token = (session?.user as any)?.token || null;
    const isLoggedIn = !!session?.user;

    const book = await findBookByBoardGradeSubject(boardCode, grade, subjectSlug, token);

    if (!book) {
      notFound();
    }

    // 2. FETCH CHAPTERS AND TOPICS IN PARALLEL (Server-side)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    const chaptersResponse = await fetch(
      `${API_URL}/books/${book._id}/chapters`,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      }
    );

    if (!chaptersResponse.ok) {
      notFound();
    }

    const chaptersData = await chaptersResponse.json();
    const chapters = chaptersData?.data?.chapters || chaptersData?.chapters || [];

    // Fetch topics for all chapters in parallel
    const chaptersWithTopics = await Promise.all(
      chapters.map(async (ch: any) => {
        try {
          const res = await fetch(
            `${API_URL}/chapters/${ch._id}/topics`,
            {
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
              }
            }
          );
          if (res.ok) {
            const data = await res.json();
            return {
              ...ch,
              topics: data.data?.topics || data.data || []
            };
          }
        } catch (e) {
          console.error(`Error fetching topics for chapter ${ch._id}:`, e);
        }
        return { ...ch, topics: [] };
      })
    );

    // Flatten all topics to pass to the viewer
    const allTopics = chaptersWithTopics.flatMap((ch: any) => ch.topics);

    const program = book.program_id || { name: 'Matriculation' };

    // Determine which view to render based on URL structure
    // If topicSlug exists, render TopicLevelReader (dedicated topic page)
    // If chapterSlug exists (but no topic), render ChapterReader
    // Otherwise render BookChapterIndex (book landing page)
    
    if (topicSlug && chapterSlug) {
      // Find the active topic and its siblings for navigation
      const activeChapter = chaptersWithTopics.find((ch: any) => ch.slug === chapterSlug);
      const activeTopic = activeChapter?.topics?.find((t: any) => t.slug === topicSlug);
      
      if (!activeTopic || !activeChapter) {
        notFound();
      }
      
      // Build flat list of all topics in order for sibling navigation
      const allTopicsInOrder = chaptersWithTopics.flatMap((ch: any) => 
        ch.topics.map((t: any) => ({ ...t, chapterSlug: ch.slug }))
      );
      
      const currentIndex = allTopicsInOrder.findIndex((t: any) => t._id === activeTopic._id);
      const previousTopic = currentIndex > 0 ? allTopicsInOrder[currentIndex - 1] : null;
      const nextTopic = currentIndex < allTopicsInOrder.length - 1 ? allTopicsInOrder[currentIndex + 1] : null;
      
      // Fetch user progress for this topic if logged in
      let userProgress = null;
      if (isLoggedIn && token) {
        try {
          const progressRes = await fetch(
            `${API_URL}/progress/topic/${activeTopic._id}`,
            {
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              }
            }
          );
          if (progressRes.ok) {
            const progressData = await progressRes.json();
            userProgress = progressData.data || null;
          }
        } catch (e) {
          console.error('Failed to fetch user progress:', e);
        }
      }
      
      return (
        <TopicLevelReader
          topic={activeTopic}
          previousTopic={previousTopic ? { _id: previousTopic._id, title: previousTopic.title, slug: previousTopic.slug, chapterSlug: previousTopic.chapterSlug } : null}
          nextTopic={nextTopic ? { _id: nextTopic._id, title: nextTopic.title, slug: nextTopic.slug, chapterSlug: nextTopic.chapterSlug } : null}
          chapters={chaptersWithTopics}
          isLoggedIn={isLoggedIn}
          boardSlug={boardCode || undefined}
          subjectSlug={subjectSlug}
          programSlug={program.slug || undefined}
          grade={grade || undefined}
          userProgress={userProgress}
        />
      );
    }
    
    if (chapterSlug) {
      // Render chapter-level view with topic listing
      const activeChapter = chaptersWithTopics.find((ch: any) => ch.slug === chapterSlug);
      if (!activeChapter) {
        notFound();
      }
      
      const chapterIndex = chaptersWithTopics.findIndex((ch: any) => ch.slug === chapterSlug);
      const prevChapterSlug = chapterIndex > 0 ? chaptersWithTopics[chapterIndex - 1].slug : null;
      const nextChapterSlug = chapterIndex < chaptersWithTopics.length - 1 ? chaptersWithTopics[chapterIndex + 1].slug : null;
      
      return (
        <ChapterReader
          book={book}
          program={program}
          chapter={activeChapter}
          chapterTopics={activeChapter.topics || []}
          chapters={chaptersWithTopics}
          isLoggedIn={isLoggedIn}
          boardSlug={boardCode || ''}
          subjectSlug={subjectSlug}
          programSlug={program.slug || ''}
          grade={grade || ''}
          prevChapterSlug={prevChapterSlug}
          nextChapterSlug={nextChapterSlug}
        />
      );
    }
    
    // Default: Book landing page with chapter index
    // Calculate user progress for the book
    let userProgress = undefined;
    if (isLoggedIn && token) {
      try {
        const progressRes = await fetch(
          `${API_URL}/progress/book/${book._id}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        if (progressRes.ok) {
          const progressData = await progressRes.json();
          userProgress = progressData.data || undefined;
        }
      } catch (e) {
        console.error('Failed to fetch book progress:', e);
      }
    }
    
    return (
      <BookChapterIndex
        book={book}
        program={program}
        chapters={chaptersWithTopics}
        subjectSlug={subjectSlug}
        boardSlug={boardCode || undefined}
        programSlug={program.slug || undefined}
        grade={grade || undefined}
        userProgress={userProgress}
      />
    );
  } catch (error) {
    console.error('Reader render error:', error);
    notFound();
  }
}
