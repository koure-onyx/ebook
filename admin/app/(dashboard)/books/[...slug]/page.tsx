import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getBookBySubjectServer, getBooksServer } from '@/lib/api/client';
import AdminBookReader from './AdminBookReader';

function normalizeSegment(value: string | null | undefined) {
  return String(value ?? '').trim().toLowerCase();
}

function isAllGrade(value: string | null | undefined) {
  return ['all', 'all grades'].includes(normalizeSegment(value));
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
    const books = await getBooksServer(token, { grade, subject: subjectSlug });
    const bookArray = Array.isArray(books) ? books : (books?.books || []);
    const normalizedBoardCode = normalizeSegment(boardCode);
    const normalizedGrade = normalizeSegment(grade);
    const allowAnyGrade = isAllGrade(grade);

    for (const book of bookArray) {
      const bookBoardCode = normalizeSegment(book.board_id?.short_code || book.board_id?.slug || book.board_short_code || '');
      const bookGrade = normalizeSegment(book.grade);
      if (
        bookBoardCode === normalizedBoardCode &&
        (allowAnyGrade || bookGrade === normalizedGrade)
      ) {
        return book;
      }
    }

    if (bookArray.length > 0) {
      const sameBoardBooks = bookArray.filter((book: any) => {
        return normalizeSegment(book.board_id?.short_code || book.board_id?.slug || book.board_short_code || '') === normalizedBoardCode;
      });

      const pool = sameBoardBooks.length > 0 ? sameBoardBooks : bookArray;
      pool.sort(compareBooks);
      return pool[0];
    }
  } catch (error) {
    console.error('Error finding book:', error);
  }
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

    const book = await findBookByBoardGradeSubject(boardCode, grade, subjectSlug, token);

    if (!book) {
      notFound();
    }

    // 2. FETCH CHAPTERS AND TOPICS IN PARALLEL
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

    let activeTopic = null;
    let activeChapter = null;

    // Get current active topic if slug is provided
    if (chapterSlug && topicSlug) {
      const activeCh = chaptersWithTopics.find((ch) => ch.slug === chapterSlug);
      if (activeCh) {
        activeChapter = activeCh;
        activeTopic = activeCh.topics.find((t: any) => t.slug === topicSlug) || null;
      }
    }

    const program = book.program_id || { name: 'Matriculation' };

    return (
      <AdminBookReader
        book={book}
        program={program}
        chapters={chaptersWithTopics}
        activeChapter={activeChapter}
        activeTopic={activeTopic}
        subjectSlug={subjectSlug}
        boardSlug={boardCode}
        grade={grade}
      />
    );
  } catch (error) {
    console.error('Reader render error:', error);
    notFound();
  }
}
