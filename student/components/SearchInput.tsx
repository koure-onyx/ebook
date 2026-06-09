'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Loader2, BookOpen, ChevronRight, FileText } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { bookUrl, topicUrl } from '@/lib/reader-urls';

interface SearchResult {
  _id: string;
  title: string;
  slug?: string;
  subtitle?: string;
  subject?: string;
  subject_slug?: string;
  board?: string;
  grade?: string;
  program_id?: { slug?: string };
  board_id?: { short_code?: string; slug?: string };
  book_id?: { subject?: string; subject_slug?: string; title?: string; board_id?: { short_code?: string; slug?: string } };
  chapter_id?: { chapter_number?: number; slug?: string };
  surah?: number;
  ayah?: number;
  type?: string;
}

export function SearchInput({ programId }: { programId?: string }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ books: SearchResult[]; topics: SearchResult[]; quran: SearchResult[] }>({
    books: [],
    topics: [],
    quran: [],
  });
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const debouncedQuery = useDebounce(query, 400);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 1) {
      setResults({ books: [], topics: [], quran: [] });
      setIsOpen(false);
      return;
    }

    async function fetchResults() {
      setLoading(true);
      try {
        let url = `/api/search?q=${encodeURIComponent(debouncedQuery)}`;
        if (programId) url += `&programId=${programId}`;

        const res = await fetch(url);
        const data = await res.json();
        if (data.success) {
          setResults({
            books: data.data.books || [],
            topics: data.data.topics || [],
            quran: data.data.quran || [],
          });
          setIsOpen(true);
        }
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setLoading(false);
      }
    }

    fetchResults();
  }, [debouncedQuery, programId]);

  const totalResults = results.books.length + results.topics.length + results.quran.length;

  function topicHref(result: SearchResult) {
    const subject = result.book_id?.subject_slug || result.subject_slug || 'subject';
    const chapter = result.chapter_id?.slug || result.chapter_id?.chapter_number || 1;
    const opts = result.grade || result.program_id?.slug || result.board_id?.short_code ? {
      boardSlug: result.board_id?.short_code || result.book_id?.board_id?.short_code,
      grade: result.grade,
      programSlug: result.program_id?.slug
    } : undefined;
    return topicUrl(subject, chapter, result.slug || result._id, opts);
  }

  function bookHref(result: SearchResult) {
    const opts = result.grade || result.program_id?.slug || result.board_id?.short_code ? {
      boardSlug: result.board_id?.short_code || result.book_id?.board_id?.short_code,
      grade: result.grade,
      programSlug: result.program_id?.slug
    } : undefined;
    return bookUrl(result.subject_slug || result.slug || 'subject', opts);
  }

  function ResultGroup({
    title,
    items,
    type,
  }: {
    title: string;
    items: SearchResult[];
    type: 'book' | 'topic' | 'quran';
  }) {
    if (items.length === 0) return null;

    return (
      <div className="py-1">
        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</p>
        {items.map((result) => (
          <button
            key={`${type}-${result._id}`}
            onClick={() => {
              setIsOpen(false);
              if (type === 'book') router.push(bookHref(result));
              else if (type === 'topic') router.push(topicHref(result));
              else router.push('/quran');
            }}
            className="group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors hover:bg-emerald-50"
          >
            <div className="rounded-lg bg-slate-100 p-2 transition-colors group-hover:bg-emerald-100">
              {type === 'book' ? (
                <BookOpen className="h-4 w-4 text-slate-500 group-hover:text-emerald-600" />
              ) : (
                <FileText className="h-4 w-4 text-slate-500 group-hover:text-emerald-600" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-slate-900">{result.title}</p>
              <p className="truncate text-xs font-medium text-slate-500">
                {type === 'book'
                  ? [result.board, result.grade, result.subject].filter(Boolean).join(' • ')
                  : result.subtitle || result.book_id?.subject || result.subject}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-emerald-500" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="relative w-full" ref={containerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search topics, subjects, chapters..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 1 && setIsOpen(true)}
          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-emerald-500" />
        )}
      </div>

      {isOpen && debouncedQuery.length >= 1 && (
        <div className="fixed inset-x-4 top-20 z-50 max-h-[70vh] overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:top-full sm:mt-2 sm:max-h-80 sm:w-full">
          <div className="max-h-[calc(70vh-3rem)] overflow-y-auto p-2 sm:max-h-80">
            {totalResults > 0 ? (
              <>
                <ResultGroup title="Books" items={results.books} type="book" />
                <ResultGroup title="Topics" items={results.topics} type="topic" />
                <ResultGroup title="Quran" items={results.quran} type="quran" />
              </>
            ) : (
              <div className="px-4 py-8 text-center text-sm font-medium text-slate-500">
                No results for &apos;{debouncedQuery}&apos;
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
