import { notFound } from 'next/navigation';
import { getBookBySubject, getBooksServer, searchContentServer, getTopicByNestedSlugs } from '@/lib/api/client';
import { parseReaderPath, bookUrl, chapterUrl, topicUrl } from '@/lib/reader-urls';

interface BookParams {
  boardCode: string;
  grade: string;
  subjectSlug: string;
}

async function findBookByBoardGradeSubject(boardCode: string, grade: string, subjectSlug: string, token: string | null) {
  try {
    const books = await getBooksServer(token, { grade, subject: subjectSlug });
    const bookArray = Array.isArray(books) ? books : (books?.books || []);

    for (const book of bookArray) {
      const bookBoardCode = book.board_id?.short_code || book.board_id?.slug || '';
      if (bookBoardCode.toUpperCase() === boardCode.toUpperCase() && book.grade === grade) {
        return book;
      }
    }

    if (bookArray.length > 0) {
      return bookArray[0];
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
  const slugs = resolvedParams.slug ?? [];

  const parsed = parseReaderPath(slugs);

  if (!parsed.boardCode || !parsed.grade || !parsed.subjectSlug) {
    notFound();
  }

  const { boardCode, grade, subjectSlug, chapterSlug, topicSlug } = parsed;

  try {
    const token = null;
    const book = await findBookByBoardGradeSubject(boardCode, grade, subjectSlug, token);

    if (!book) {
      notFound();
    }

    let chapter = null;
    let topic = null;

    // If we have both chapter and topic slugs, use the new nested slug API
    if (chapterSlug && topicSlug) {
      try {
        const topicResponse = await getTopicByNestedSlugs(boardCode, grade, subjectSlug, chapterSlug, topicSlug);
        if (topicResponse && topicResponse.data && topicResponse.data.topic) {
          topic = topicResponse.data.topic;
          chapter = topicResponse.data.chapter || null;
        }
      } catch (error) {
        console.error('Error fetching topic by nested slugs:', error);
        // Fallback to old method if new API fails
      }
    }

    // Fallback: if topic not found via new API, try old method
    if (!topic && chapterSlug) {
      const chaptersResponse = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/books/${book._id}/chapters`,
        { headers: { 'Content-Type': 'application/json' } }
      );
      const chaptersData = await chaptersResponse.json();
      
      // Handle both old raw array and new {success, data} format
      const chapters = chaptersData?.data || chaptersData || [];
      chapter = Array.isArray(chapters) ? chapters.find((c: any) => c.slug === chapterSlug) : null;

      if (topicSlug && chapter && !topic) {
        const topicsResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}/chapters/${chapter._id}/topics`,
          { headers: { 'Content-Type': 'application/json' } }
        );
        const topicsData = await topicsResponse.json();
        
        // Handle both old raw array and new {success, data} format
        const topics = topicsData?.data || topicsData || [];
        topic = Array.isArray(topics) ? topics.find((t: any) => t.slug === topicSlug) : null;
      }
    }

    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">{book.title}</h1>
        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p><strong>Board:</strong> {boardCode} ({grade})</p>
          <p><strong>Subject:</strong> {subjectSlug}</p>
          {chapter && <p><strong>Chapter:</strong> {chapter.title} ({chapterSlug})</p>}
          {topic && <p><strong>Topic:</strong> {topic.title} ({topicSlug})</p>}
        </div>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg">
          <h2 className="font-semibold mb-2">URL Structure Verified</h2>
          <p className="text-sm font-mono">
            {topic
              ? topicUrl(boardCode, grade, subjectSlug, chapterSlug!, topicSlug)
              : chapter
                ? chapterUrl(boardCode, grade, subjectSlug, chapterSlug!)
                : bookUrl(boardCode, grade, subjectSlug)
            }
          </p>
        </div>

        {!chapter && !topic && (
          <p className="mt-8 text-slate-500 italic">
            Select a chapter to begin reading.
          </p>
        )}

        {topic && (
          <div className="mt-8 prose max-w-none">
            <h2 className="text-xl font-bold">{topic.title}</h2>
            <div dangerouslySetInnerHTML={{ __html: topic.clean_html || topic.content || '' }} />
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('Reader fetch error:', error);
    notFound();
  }
}
