'use client';

import Link from 'next/link';
import { ChevronRight, Home, BookOpen, Layers } from 'lucide-react';
import { bookUrl, chapterUrl } from '@/lib/reader-urls';

interface TopicBreadcrumbProps {
    programName: string;
    boardSlug?: string;
    programSlug?: string;
    bookTitle: string;
    subjectSlug: string;
    chapterSlug: string;
    chapterNumber?: number;
    chapterTitle: string;
    topicTitle: string;
    topicSlug?: string;
}

export function TopicBreadcrumb({
  programName,
  boardSlug,
  programSlug,
  bookTitle,
  subjectSlug,
  chapterSlug,
  chapterNumber,
  chapterTitle,
  topicTitle,
  topicSlug,
}: TopicBreadcrumbProps) {
  const opts = boardSlug || programSlug ? { boardSlug, programSlug } : undefined;

  return (
    <nav 
      className="flex items-center gap-1.5 text-xs md:text-sm text-slate-500 mb-6 px-4 py-2.5 bg-white/70 backdrop-blur-md border border-slate-100 rounded-xl shadow-sm overflow-x-auto whitespace-nowrap scrollbar-none" 
      aria-label="Breadcrumb"
    >
      {/* 1. Books / Library Home */}
      <Link
        href="/books"
        className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 font-medium transition-colors duration-200"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Library</span>
      </Link>
      
      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
      
      {/* 2. Program Name */}
      <Link
        href={programSlug ? `/books?program=${programSlug}` : '/books'}
        className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors duration-200"
      >
        <Layers className="h-3.5 w-3.5 text-slate-400 shrink-0 sm:hidden" />
        <span>{programName}</span>
      </Link>
      
      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
      
      {/* 3. Book Title */}
      <Link
        href={bookUrl(subjectSlug, opts)}
        className="flex items-center gap-1 text-slate-500 hover:text-indigo-600 font-medium transition-colors duration-200"
      >
        <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
        <span className="max-w-[100px] md:max-w-[150px] truncate">{bookTitle}</span>
      </Link>
      
      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
      
      {/* 4. Chapter Number & Title */}
      <Link
        href={chapterUrl(subjectSlug, chapterSlug, opts)}
        className="text-slate-500 hover:text-indigo-600 font-medium transition-colors duration-200 truncate max-w-[120px] md:max-w-[180px]"
      >
        {chapterNumber != null ? `Ch ${chapterNumber}: ` : ''}
        {chapterTitle}
      </Link>
      
      <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
      
      {/* 5. Topic Title */}
      <span className="font-semibold text-indigo-700 bg-indigo-50/70 px-2 py-0.5 rounded-md border border-indigo-100/40 truncate max-w-[150px] md:max-w-[200px]">
        {topicTitle}
      </span>
    </nav>
  );
}
