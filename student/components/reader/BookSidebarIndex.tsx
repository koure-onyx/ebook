'use client';

/**
 * Book TOC sidebar — not used on book reader pages; kept for other layouts (e.g. vault, study mode).
 */
import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronRight, List, Menu, X } from 'lucide-react';
import { bookUrl, chapterUrl } from '@/lib/reader-urls';

type BookSidebarIndexProps = {
  book: { title: string; _id?: string };
  program: { name: string };
  chapters: Array<{ _id: string; chapter_number: number; title: string; slug: string }>;
  topics: Array<{
    _id: string;
    chapter_id: string;
    title: string;
    slug?: string;
    topic_number?: string;
    display_order?: number;
  }>;
  subjectSlug: string;
  boardSlug?: string;
  programSlug?: string;
  activeChapterId?: string | null;
};

export function BookSidebarIndex({
  book,
  program,
  chapters,
  topics,
  subjectSlug,
  boardSlug,
  programSlug,
  activeChapterId,
}: BookSidebarIndexProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const opts = boardSlug || programSlug ? { boardSlug, programSlug } : undefined;

  function toggleChapter(chapterId: string) {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  }

  const sidebar = (
    <aside
      className={`fixed left-0 top-0 z-40 h-[100dvh] w-80 flex-shrink-0 overflow-y-auto border-r border-slate-200 bg-white shadow-xl transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 md:shadow-none ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}
      aria-label="Book index sidebar"
    >
      <div className="border-b border-slate-100 bg-slate-50/80 p-4 md:p-5">
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-800">
          {program.name}
        </div>
        <h1 className="font-display text-lg font-bold leading-snug text-slate-900">{book.title}</h1>
        <p className="mt-1 text-xs text-slate-500">
          {chapters.length} chapters • {topics.length} topics
        </p>
      </div>

      <div className="border-b border-slate-100 p-3">
        <Link
          href={bookUrl(subjectSlug, opts)}
          onClick={() => setSidebarOpen(false)}
          className="flex w-full items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          <List className="h-4 w-4 shrink-0" />
          Table of Contents
        </Link>
      </div>

      <nav className="space-y-1 p-3" aria-label="Chapter and topic index">
        {chapters.map((chapter) => {
          const chapterTopics = topics.filter((t) => String(t.chapter_id) === String(chapter._id));
          const isExpanded = expandedChapters[chapter._id];
          const isActiveChapter = activeChapterId === chapter._id;
          const chapterHref = chapterUrl(subjectSlug, chapter.slug, opts);

          return (
            <div key={chapter._id} className="mb-1">
              <div className="flex items-stretch gap-0.5">
                <Link
                  href={chapterHref}
                  onClick={() => setSidebarOpen(false)}
                  className={`min-w-0 flex-1 rounded-l-xl p-2.5 text-left text-sm transition-colors ${
                    isActiveChapter
                      ? 'bg-indigo-50 font-semibold text-indigo-900'
                      : 'font-medium text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-start gap-2">
                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                        isActiveChapter ? 'bg-indigo-200 text-indigo-800' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {chapter.chapter_number}
                    </span>
                    <span className="line-clamp-2 leading-snug">{chapter.title}</span>
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={() => toggleChapter(chapter._id)}
                  className="rounded-r-xl px-2 text-slate-400 hover:bg-slate-50"
                  aria-expanded={isExpanded}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} chapter ${chapter.chapter_number}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </button>
              </div>

              {isExpanded && (
                <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
                  {chapterTopics.map((topic) => (
                    <Link
                      key={topic._id}
                      href={chapterHref}
                      onClick={() => setSidebarOpen(false)}
                      className="block w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <span className="mr-1.5 tabular-nums opacity-60">
                        {topic.topic_number || topic.display_order}.
                      </span>
                      <span className="line-clamp-2">{topic.title}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );

  return (
    <>
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm md:hidden">
        <div className="truncate pr-4 font-display font-bold text-slate-800">{book.title}</div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg bg-slate-100 p-2 text-slate-600"
          aria-label="Toggle table of contents"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {sidebar}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
