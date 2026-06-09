import { redirect, notFound } from 'next/navigation';
import { bookUrl, chapterUrl, parseReaderPath, topicUrl } from '@/lib/reader-urls';
import { loadBookReaderData } from '@/lib/load-book-reader';

export default async function LegacyBooksRoute({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const resolvedParams = await params;
  const slugs = resolvedParams.slug ?? [];

  if (slugs.length === 0) {
    notFound();
  }

  const [subjectSlug, ...readerPath] = slugs;
  const { chapterSlug, topicSlug, chapterNumber } = parseReaderPath(readerPath);

  const data = await loadBookReaderData(subjectSlug);
  const opts = {
    boardSlug: data.boardSlug,
    programSlug: data.programSlug,
    grade: data.grade,
  };

  if (chapterNumber != null && topicSlug) {
    redirect(topicUrl(subjectSlug, chapterSlug || `chapter-${chapterNumber}`, topicSlug, opts));
  }

  if (chapterSlug) {
    redirect(chapterUrl(subjectSlug, chapterSlug, opts));
  }

  redirect(bookUrl(subjectSlug, opts));
}
