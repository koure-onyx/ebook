import { unstable_noStore as noStore } from 'next/cache';
import type { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { BookChapterIndex } from '@/components/reader/BookChapterIndex';
import { ChapterReader } from '@/components/reader/ChapterReader';
import TopicLevelReader from '@/components/reader/TopicLevelReader';
import { canonicalBoardSlug } from '@/lib/reader-urls';
import { parseReaderPath } from '@/lib/reader-urls';
import {
  findChapterBySlug,
  loadBookReaderData,
  loadTopicBySlug,
} from '@/lib/load-book-reader';
import { getReaderSeoData } from '@studyvault/lib/content/getSeoData';

function absoluteUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_APP_URL || 'https://studyvault.pk';
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function buildReaderPath({
  boardSlug,
  programSlug,
  subjectSlug,
  chapterSlug,
  topicSlug,
}: {
  boardSlug: string;
  programSlug: string;
  subjectSlug: string;
  chapterSlug?: string | null;
  topicSlug?: string | null;
}) {
  const parts = [boardSlug, programSlug, subjectSlug];
  if (chapterSlug) parts.push(chapterSlug);
  if (topicSlug) parts.push(topicSlug);
  return `/${parts.map((part) => String(part).trim()).filter(Boolean).join('/')}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ boardSlug: string; programSlug: string; subjectSlug: string; slug?: string[] }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const { chapterSlug, topicSlug } = parseReaderPath(resolvedParams.slug);
  const seoData = await getReaderSeoData({
    boardSlug: resolvedParams.boardSlug,
    programSlug: resolvedParams.programSlug,
    subjectSlug: resolvedParams.subjectSlug,
    chapterSlug: chapterSlug || undefined,
    topicSlug: topicSlug || undefined,
  });

  if (!seoData) return {};

  const canonicalPath = buildReaderPath({
    boardSlug: resolvedParams.boardSlug,
    programSlug: resolvedParams.programSlug,
    subjectSlug: resolvedParams.subjectSlug,
    chapterSlug,
    topicSlug,
  });
  const canonicalUrl = absoluteUrl(canonicalPath);
  const boardName = seoData.board?.name || seoData.board?.short_code || seoData.board?.slug;
  const pageTitle = boardName ? `${seoData.title} | ${boardName}` : seoData.title;

  return {
    title: pageTitle,
    description: seoData.description || undefined,
    keywords: seoData.keywords?.length ? seoData.keywords : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: pageTitle,
      description: seoData.description || undefined,
      url: canonicalUrl,
      images: seoData.ogImageUrl ? [seoData.ogImageUrl] : undefined,
      type: topicSlug ? 'article' : 'website',
    },
    twitter: {
      card: seoData.ogImageUrl ? 'summary_large_image' : 'summary',
      title: pageTitle,
      description: seoData.description || undefined,
      images: seoData.ogImageUrl ? [seoData.ogImageUrl] : undefined,
    },
  };
}

export default async function ReaderPage({
  params,
}: {
  params: Promise<{ boardSlug: string; programSlug: string; subjectSlug: string; slug?: string[] }>;
}) {
  noStore();

  const resolvedParams = await params;
  const { chapterSlug, topicSlug } = parseReaderPath(resolvedParams.slug);

  const data = await loadBookReaderData(resolvedParams.subjectSlug, {
    boardSlug: resolvedParams.boardSlug,
    programSlug: resolvedParams.programSlug,
  });

  const activeBoardSlug = canonicalBoardSlug(data.boardSlug || data.book.board_id?.short_code || data.book.board_id?.slug || 'PB');
  const activeProgramSlug = data.programSlug || resolvedParams.programSlug;
  const activeSubjectSlug = data.book.subject_slug || data.book.slug || resolvedParams.subjectSlug;
  const activeGrade = data.grade;

  // Enforce canonical URL structure: /[short_board_code]/[programSlug]/[subjectSlug]
  if (
    resolvedParams.boardSlug !== activeBoardSlug || 
    resolvedParams.programSlug !== activeProgramSlug ||
    resolvedParams.subjectSlug !== activeSubjectSlug
  ) {
      const canonical = [activeBoardSlug, activeProgramSlug, activeSubjectSlug];
      if (chapterSlug) canonical.push(chapterSlug);
      if (topicSlug) canonical.push(topicSlug);
      permanentRedirect(`/${canonical.join('/')}`);
  }

  if (!chapterSlug) {
    return (
      <BookChapterIndex
        book={data.book}
        program={data.program}
        chapters={data.chapters}
        subjectSlug={activeSubjectSlug}
        boardSlug={activeBoardSlug}
        programSlug={activeProgramSlug}
        grade={activeGrade}
        userProgress={data.userProgress}
      />
    );
  }

  const chapter = findChapterBySlug(data.chapters, chapterSlug);
  if (!chapter) {
    notFound();
  }

  const sortedChapters = [...data.chapters].sort(
    (a, b) => (a.display_order ?? a.chapter_number) - (b.display_order ?? b.chapter_number)
  );
  const chapterIndex = sortedChapters.findIndex((item) => item.slug === chapterSlug || String(item.chapter_number) === chapterSlug);
  const prevChapterSlug = chapterIndex > 0 ? sortedChapters[chapterIndex - 1].slug : null;
  const nextChapterSlug =
    chapterIndex >= 0 && chapterIndex < sortedChapters.length - 1
      ? sortedChapters[chapterIndex + 1].slug
      : null;

  if (!topicSlug) {
    return (
      <ChapterReader
        book={data.book}
        program={data.program}
        chapter={chapter}
        chapterTopics={[]}
        chapters={data.chapters}
        isLoggedIn={data.isLoggedIn}
        boardSlug={activeBoardSlug}
        subjectSlug={activeSubjectSlug}
        programSlug={activeProgramSlug}
        grade={activeGrade}
        prevChapterSlug={prevChapterSlug}
        nextChapterSlug={nextChapterSlug}
      />
    );
  }

  const topicData = await loadTopicBySlug(topicSlug, activeSubjectSlug, chapterSlug, {
    boardSlug: activeBoardSlug,
    programSlug: activeProgramSlug,
  });

  return (
    <TopicLevelReader
      topic={topicData.topic}
      previousTopic={topicData.previousTopic}
      nextTopic={topicData.nextTopic}
      chapters={topicData.chapters}
      isLoggedIn={topicData.isLoggedIn}
      boardSlug={activeBoardSlug}
      subjectSlug={activeSubjectSlug}
      programSlug={topicData.programSlug}
      grade={topicData.grade || activeGrade}
    />
  );
}
