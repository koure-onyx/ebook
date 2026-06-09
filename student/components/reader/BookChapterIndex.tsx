'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown, ChevronRight, Loader2, List, BookOpen, Flame, CheckCircle, ArrowRight } from 'lucide-react';
import { topicUrl } from '@/lib/reader-urls';
import { StickyProgressBar } from './StickyProgressBar';
import { ChapterProgressDots } from './ChapterProgressDots';
import { TopicStatusBadge } from './TopicStatusBadge';
import { QuickQuizButton } from './QuickQuizButton';

type Chapter = {
  _id: string;
  chapter_number: number;
  title: string;
  slug: string;
  topics?: Array<{
    _id: string;
    slug: string;
    title: string;
    topic_number?: string;
    display_order?: number;
    estimated_read_time?: number;
    isRead?: boolean;
    quizScore?: number;
    exam_frequency_count?: number;
  }>;
};

type BookChapterIndexProps = {
  book: {
    _id?: string;
    title: string;
    subject?: string;
    subject_slug?: string;
    edition_year?: number;
    board_id?: { name?: string; short_code?: string; slug?: string } | null;
    metadata?: { grade_level?: string };
  };
  program: { name: string; slug?: string };
  chapters: Chapter[];
  subjectSlug: string;
  boardSlug?: string;
  programSlug?: string;
  grade?: string;
  userProgress?: {
    totalTopics: number;
    readTopics: number;
    lastReadTopicSlug?: string;
    chapterProgress?: Record<string, { readCount: number; totalCount: number; topics: any[] }>;
  };
};

type TopicSummary = {
  _id: string;
  slug: string;
  title: string;
  topic_number?: string;
  display_order?: number;
  estimated_read_time?: number;
};

export function BookChapterIndex({ book, program, chapters, subjectSlug, boardSlug, programSlug, grade, userProgress }: BookChapterIndexProps) {
  const opts = boardSlug || programSlug || grade ? { boardSlug, programSlug, grade } : undefined;
  const firstChapter = chapters[0];
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [topicsByChapter, setTopicsByChapter] = useState<Record<string, TopicSummary[]>>({});
  const [loadingChapters, setLoadingChapters] = useState<Record<string, boolean>>({});
  const [topicErrors, setTopicErrors] = useState<Record<string, string>>({});

  const searchParams = useSearchParams();

  const previewParam = searchParams.get('preview') === 'true' ? '?preview=true' : '';

  // Calculate total topics and progress
  const totalTopicsCount = chapters.reduce((acc, ch) => acc + (ch.topics?.length || 0), 0);
  const readTopicsCount = userProgress?.readTopics || 0;
  const percentage = totalTopicsCount > 0 ? Math.round((readTopicsCount / totalTopicsCount) * 100) : 0;

  async function toggleChapter(chapter: Chapter) {
    const willExpand = !expandedChapters[chapter._id];
    setExpandedChapters((prev) => ({ ...prev, [chapter._id]: willExpand }));

    if (!willExpand || topicsByChapter[chapter._id] || loadingChapters[chapter._id]) return;

    setLoadingChapters((prev) => ({ ...prev, [chapter._id]: true }));
    setTopicErrors((prev) => ({ ...prev, [chapter._id]: '' }));

    const previewParam = searchParams.get('preview') === 'true' ? '?preview=true' : '';

    try {
      const response = await fetch(`/api/chapters/${chapter._id}/topics${previewParam}`);
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to load topics');
      }

      setTopicsByChapter((prev) => ({ ...prev, [chapter._id]: data.data || [] }));
    } catch (error) {
      setTopicErrors((prev) => ({
        ...prev,
        [chapter._id]: error instanceof Error ? error.message : 'Failed to load topics',
      }));
    } finally {
      setLoadingChapters((prev) => ({ ...prev, [chapter._id]: false }));
    }
  }

  const boardName = book.board_id?.name || book.board_id?.short_code || 'Board';
  const boardDisplayName = boardName.toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Sticky Progress Bar */}
      <StickyProgressBar
        bookTitle={`${book.subject || book.title} ${grade || ''}`}
        totalTopics={totalTopicsCount}
        readTopics={readTopicsCount}
        lastReadTopicSlug={userProgress?.lastReadTopicSlug}
      />

      {/* Quick Quiz Button */}
      {book._id && <QuickQuizButton bookId={book._id} />}

      <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
        <section className="rounded-2xl border border-slate-200 bg-gradient-to-b from-amber-50/90 via-white to-white p-8 shadow-sm md:p-12">
          {/* Header with Board Badge and Progress Panel */}
          <div className="border-b border-slate-200 pb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left: Title Section */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 bg-slate-200/60 px-2 py-1 rounded-md">
                    {boardDisplayName}
                  </span>
                  {grade && (
                    <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 bg-slate-200/60 px-2 py-1 rounded-md">
                      {grade.toUpperCase()}
                    </span>
                  )}
                </div>
                <h1 className="font-display text-3xl font-black text-slate-950 md:text-5xl">
                  {book.title}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  {book.subject || book.title} — {book.edition_year || new Date().getFullYear()}
                </p>
              </div>

              {/* Right: Progress Panel */}
              {userProgress && totalTopicsCount > 0 && (
                <div className="bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-4 min-w-[200px]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                      Your Progress
                    </span>
                    <span className="text-lg font-bold text-emerald-600">{percentage}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-500 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mb-3">
                    {readTopicsCount} / {totalTopicsCount} topics read
                  </p>
                  {userProgress.lastReadTopicSlug && (
                    <Link
                      href={userProgress.lastReadTopicSlug}
                      className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      Continue Reading
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-8">
            <div className="mb-6 flex items-center gap-3 border-b-2 border-slate-900 pb-3">
              <List className="h-6 w-6 text-slate-800" />
              <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900">
                Contents
              </h2>
            </div>
            <p className="mb-8 text-sm text-slate-600">
              Select a chapter to expand its topics. Each topic opens as its own focused reading page.
            </p>

            <ul className="space-y-3">
              {chapters.map((chapter) => {
                const isExpanded = expandedChapters[chapter._id];
                const topics = topicsByChapter[chapter._id] || [];
                const isLoading = loadingChapters[chapter._id];
                const error = topicErrors[chapter._id];

                return (
                  <li key={chapter._id} className="rounded-xl border border-slate-200 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={() => toggleChapter(chapter)}
                      className="group flex w-full items-center gap-4 p-5 text-left transition-all hover:bg-slate-50"
                      aria-expanded={isExpanded}
                    >
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        {chapter.chapter_number}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-lg font-semibold text-slate-900 group-hover:text-indigo-800">
                          {chapter.title}
                        </span>
                        <div className="mt-1 flex items-center gap-3">
                          <span className="text-xs font-medium text-slate-500">
                            {isExpanded ? 'Hide topics' : 'Show topics'}
                          </span>
                          {/* Topic count badge */}
                          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                            {chapter.topics?.length || topics.length} topics
                          </span>
                          {/* Chapter progress dots - hidden on mobile */}
                          {(chapter.topics?.length || topics.length) > 0 && (
                            <div className="hidden sm:block">
                              <ChapterProgressDots
                                topics={chapter.topics || topics}
                                maxDots={8}
                              />
                            </div>
                          )}
                        </div>
                      </span>
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 shrink-0 animate-spin text-slate-400" />
                      ) : isExpanded ? (
                        <ChevronDown className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                      ) : (
                        <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-indigo-600" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="border-t border-slate-100 px-5 pb-5">
                        {error ? (
                          <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                            {error}
                          </p>
                        ) : isLoading ? (
                          <p className="flex items-center gap-2 py-4 text-sm text-slate-500">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading topics
                          </p>
                        ) : topics.length > 0 ? (
                          <ul className="mt-3 space-y-1.5 border-l-2 border-slate-100 pl-4">
                            {topics.map((topic) => {
                              const label =
                                topic.topic_number ||
                                `${chapter.chapter_number}.${topic.display_order ?? ''}`;

                              return (
                                <li key={topic._id}>
                                  <Link
                                    href={`${topicUrl(subjectSlug, chapter.slug, topic.slug, opts)}${previewParam}`}
                                    className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-800"
                                  >
                                    <span className="w-12 shrink-0 tabular-nums text-xs font-semibold text-slate-400 group-hover:text-emerald-600">
                                      {label}
                                    </span>
                                    <div className="min-w-0 flex-1 flex items-center gap-2">
                                      <span className="line-clamp-2">{topic.title}</span>
                                      {/* Topic Status Badges */}
                                      <TopicStatusBadge
                                        isRead={topic.isRead}
                                        quizScore={topic.quizScore}
                                        examFrequencyCount={topic.exam_frequency_count}
                                      />
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                      {topic.estimated_read_time ? (
                                        <span className="text-xs text-slate-400">
                                          {topic.estimated_read_time}m
                                        </span>
                                      ) : null}
                                      <span className="text-xs font-medium text-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Quiz →
                                      </span>
                                    </div>
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        ) : (
                          <p className="py-4 text-sm text-slate-500">No topics in this chapter yet.</p>
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>

            {chapters.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
                No chapters available for this book yet.
              </p>
            )}
          </div>
        </section>
      </div>


    </div>
  );
}
