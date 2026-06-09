'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { IChapter } from '@studyvault/db/models';

interface ChapterReaderProps {
  book: any;
  program: any;
  chapter: IChapter;
  chapterTopics: any[];
  chapters: IChapter[];
  isLoggedIn: boolean;
  boardSlug: string;
  subjectSlug: string;
  programSlug: string;
  grade: string;
  prevChapterSlug?: string | null;
  nextChapterSlug?: string | null;
}

export function ChapterReader({
  book,
  program,
  chapter,
  chapterTopics: initialTopics,
  chapters,
  isLoggedIn,
  boardSlug,
  subjectSlug,
  programSlug,
  grade,
  prevChapterSlug,
  nextChapterSlug,
}: ChapterReaderProps) {
  const [topics, setTopics] = useState<any[]>(initialTopics || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadTopicsWithContent = async () => {
      if (!chapter?._id) return;
      setLoading(true);
      try {
        const previewParam = !isLoggedIn ? '?preview=true' : '';
        const url = `/api/chapters/${chapter._id}/topics${previewParam}${previewParam ? '&' : '?'}includeContent=true`;
        const response = await fetch(url);
        const result = await response.json();
        if (result.success && result.data) {
          setTopics(result.data);
        }
      } catch (error) {
        console.error('Failed to load topics:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTopicsWithContent();
  }, [chapter?._id, isLoggedIn]);

  const navigation = {
    prev: prevChapterSlug ? `/${boardSlug}/${programSlug}/${subjectSlug}/${prevChapterSlug}` : null,
    next: nextChapterSlug ? `/${boardSlug}/${programSlug}/${subjectSlug}/${nextChapterSlug}` : null,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Inline Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href={`/${boardSlug}/${programSlug}/${subjectSlug}`} className="text-gray-500 hover:text-gray-700 font-medium">
              ← Back
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 truncate max-w-[200px] sm:max-w-md">{book?.title}</h1>
              <p className="text-xs text-gray-500">{grade} • {subjectSlug}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{chapter.title}</h1>
          {chapter.description && <p className="text-gray-600">{chapter.description}</p>}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Topics</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : topics.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No topics yet.</div>
          ) : (
            <div className="space-y-3">
              {topics.map((topic: any) => {
                const hasContent = topic.content_blocks && topic.content_blocks.length > 0;
                return (
                  <Link
                    key={topic._id}
                    href={`/${boardSlug}/${programSlug}/${subjectSlug}/${chapter.slug}/${topic.slug}`}
                    className={`block p-4 border rounded-lg transition-colors ${hasContent ? 'border-gray-200 hover:border-blue-500 hover:bg-blue-50' : 'border-gray-100 bg-gray-50 opacity-75'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {topic.topic_number ? `${topic.topic_number}. ${topic.title}` : topic.title}
                        </h3>
                      </div>
                      {hasContent ? (
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">Ready</span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded">Soon</span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8 flex justify-between">
          {navigation.prev ? (
            <Link href={navigation.prev} className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50">← Prev</Link>
          ) : <div />}
          {navigation.next ? (
            <Link href={navigation.next} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Next →</Link>
          ) : <div />}
        </div>
      </main>
    </div>
  );
}
