'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';
import { bookUrl, chapterUrl } from '@/lib/reader-urls';

type BookReaderNavProps = {
  boardSlug?: string;
  subjectSlug: string;
  programSlug?: string;
  bookTitle: string;
  chapterSlug?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
  totalChapters: number;
  grade?: string;
};

export function BookReaderNav({
  boardSlug,
  subjectSlug,
  programSlug,
  bookTitle,
  chapterSlug,
  chapterNumber,
  chapterTitle,
  prevChapterSlug,
  nextChapterSlug,
  totalChapters,
  grade,
}: BookReaderNavProps) {
  const opts = boardSlug || programSlug || grade ? { boardSlug, programSlug, grade } : undefined;
  const searchParams = useSearchParams();
  const previewParam = searchParams.get('preview') === 'true' ? '?preview=true' : '';
  const indexHref = `${bookUrl(subjectSlug, opts)}${previewParam}`;

  return (
    <nav
      className="sticky bottom-0 z-30 border-t border-slate-200 bg-white/95 px-4 py-4 backdrop-blur-md md:px-6"
      aria-label="Chapter navigation"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold uppercase tracking-wider text-slate-500">
            {bookTitle}
          </p>
          {chapterNumber != null && (
            <p className="truncate text-sm font-bold text-slate-900">
              Chapter {chapterNumber}
              {chapterTitle ? `: ${chapterTitle}` : ''}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={indexHref}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <List className="h-4 w-4" />
            Contents
          </Link>

          {prevChapterSlug ? (
            <Link
              href={`${chapterUrl(subjectSlug, prevChapterSlug, opts)}${previewParam}`}
              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Link>
          ) : chapterSlug ? (
            <span className="inline-flex items-center gap-1 rounded-xl border border-transparent px-4 py-2.5 text-sm text-slate-300">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </span>
          ) : null}

          {nextChapterSlug ? (
            <Link
              href={`${chapterUrl(subjectSlug, nextChapterSlug, opts)}${previewParam}`}
              className="inline-flex items-center gap-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : chapterSlug ? (
            <span className="inline-flex items-center gap-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-400">
              End of book
            </span>
          ) : null}
        </div>
      </div>

      {chapterNumber != null && totalChapters > 0 && (
        <p className="mx-auto mt-2 max-w-4xl text-center text-[11px] text-slate-400">
          Chapter {chapterNumber} of {totalChapters}
        </p>
      )}
    </nav>
  );
}
