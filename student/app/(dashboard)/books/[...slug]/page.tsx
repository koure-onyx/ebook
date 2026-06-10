import { notFound } from 'next/navigation';
import { getBookBySubject } from '@/lib/api/client';
// TODO: Import your Reader UI components here

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const slugs = resolvedParams.slug ?? [];

  // Expected segments: [board, grade, subject, chapter?, topic?]
  if (slugs.length < 3) {
    notFound();
  }

  const [board, grade, subject, chapterSlug, topicSlug] = slugs;

  try {
    const book = await getBookBySubject(subject);
    
    // Validate that the book matches the board and grade in the URL
    // (Optional but recommended for strict routing)
    
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">Reader View</h1>
        <div className="mt-4 space-y-2">
          <p><strong>Board:</strong> {board}</p>
          <p><strong>Grade:</strong> {grade}</p>
          <p><strong>Subject:</strong> {subject}</p>
          {chapterSlug && <p><strong>Chapter:</strong> {chapterSlug}</p>}
          {topicSlug && <p><strong>Topic:</strong> {topicSlug}</p>}
        </div>
        <p className="mt-8 text-slate-500 italic">
          Reader UI implementation pending integration with backend data...
        </p>
      </div>
    );
  } catch (error) {
    console.error('Reader fetch error:', error);
    notFound();
  }
}
