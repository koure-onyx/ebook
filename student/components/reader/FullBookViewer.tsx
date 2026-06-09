'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Star, Clock, ChevronDown, ChevronRight, Menu, X, List, Loader2 } from 'lucide-react';
import { ContentBlockRenderer } from '@/components/reader/ContentBlockRenderer';
import { TopicPracticeSection } from '@/components/reader/TopicPracticeSection';
import { PreviewWall } from '@/components/reader/PreviewWall';
import { BookFrontIndex } from '@/components/reader/BookFrontIndex';
import { Button } from '@/components/ui/Button';
import { bookUrl, topicUrl } from '@/lib/reader-urls';

function chapterIdForTopic(topic: any, chapters: any[]) {
  const cid = topic.chapter_id?._id?.toString?.() || topic.chapter_id?.toString?.() || topic.chapter_id;
  return chapters.find((c) => c._id === cid || c._id?.toString() === cid)?._id || cid;
}

export default function FullBookViewer({
  book,
  program,
  chapters,
  topics: initialTopics,
  isLoggedIn,
  initialChapterNumber,
  initialTopicSlug,
}: any) {
  const router = useRouter();
  const subjectSlug = book.subject_slug || book.slug;
  const programSlug = program?.slug || program?.name?.toLowerCase().replace(/\s+/g, '-');
  const readerUrlOpts = {
    boardSlug: book.board_id?.short_code || book.board_id?.slug,
    programSlug,
  };
  const urlUpdateRef = useRef<string>('');
  const didInitialScroll = useRef(false);

  const [activeChapter, setActiveChapter] = useState<string | null>(null);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [topicsByChapter, setTopicsByChapter] = useState<Record<string, any[]>>({});
  const [loadingChapters, setLoadingChapters] = useState<Set<string>>(new Set());

  const searchParams = useSearchParams();
  const previewParam = searchParams.get('preview') === 'true' ? '?preview=true' : '';

  const fetchChapterTopics = useCallback(async (chapterId: string) => {
    if (topicsByChapter[chapterId] || loadingChapters.has(chapterId)) return;

    setLoadingChapters((prev) => new Set(prev).add(chapterId));
    try {
      const response = await fetch(`/api/chapters/${chapterId}/topics${previewParam}`);
      const data = await response.json();
      if (data.success) {
        setTopicsByChapter((prev) => ({
          ...prev,
          [chapterId]: data.data,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch chapter topics:', error);
    } finally {
      setLoadingChapters((prev) => {
        const next = new Set(prev);
        next.delete(chapterId);
        return next;
      });
    }
  }, [topicsByChapter, loadingChapters, previewParam]);

  const setBookRootUrl = useCallback(
    (replace = true) => {
      const path = `${bookUrl(subjectSlug, readerUrlOpts)}${previewParam}`;
      if (urlUpdateRef.current === path) return;
      urlUpdateRef.current = path;
      if (replace) window.history.replaceState(null, '', path);
      else router.push(path, { scroll: false });
    },
    [subjectSlug, programSlug, previewParam, router]
  );

  const updateBrowserUrl = useCallback(
    (topicId: string, replace = true) => {
      const topic = Object.values(topicsByChapter).flat().find((t: any) => t._id === topicId);
      if (!topic) return;
      const chapter = chapters.find((c: any) => c._id === chapterIdForTopic(topic, chapters));
      if (!chapter) return;

      const path = `${topicUrl(subjectSlug, chapter.slug || chapter.chapter_number, topic.slug, readerUrlOpts)}${previewParam}`;
      if (urlUpdateRef.current === path) return;
      urlUpdateRef.current = path;

      if (replace) window.history.replaceState(null, '', path);
      else router.push(path, { scroll: false });
    },
    [topicsByChapter, chapters, subjectSlug, programSlug, previewParam, router]
  );

  const scrollToIndex = useCallback(
    (pushHistory = true) => {
      setHighlightIndex(true);
      setActiveTopic(null);
      setActiveChapter(null);
      const el = document.getElementById('book-index');
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top: y, behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (pushHistory) setBookRootUrl(false);
      setSidebarOpen(false);
    },
    [setBookRootUrl]
  );

  const scrollToChapter = useCallback(
    (chapterId: string, chapterNumber: number, pushHistory = true) => {
      setHighlightIndex(false);
      setActiveChapter(chapterId);
      const el = document.getElementById(`chapter-${chapterNumber}`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 56;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
      setSidebarOpen(false);
    },
    []
  );

  const scrollToTopic = useCallback(
    (topicId: string, chapterId: string, pushHistory = true) => {
      // Navigate to topic-level page instead of scrolling
      const topic = Object.values(topicsByChapter).flat().find((t: any) => t._id === topicId);
      if (topic) {
        const chapter = chapters.find((c: any) => c._id === chapterId);
        if (chapter) {
          const path = `${topicUrl(subjectSlug, chapter.slug || chapter.chapter_number, topic.slug, readerUrlOpts)}${previewParam}`;
          router.push(path);
          setSidebarOpen(false);
        }
      }
    },
    [topicsByChapter, chapters, subjectSlug, programSlug, router]
  );

  useEffect(() => {
    const indexEl = document.getElementById('book-index');
    if (!indexEl) return;

    const indexObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.2) {
          setHighlightIndex(true);
          setActiveTopic(null);
        }
      },
      { rootMargin: '-20% 0px -60% 0px', threshold: [0.2, 0.5] }
    );
    indexObserver.observe(indexEl);

    return () => indexObserver.disconnect();
  }, []);

  useEffect(() => {
    const allTopics = Object.values(topicsByChapter).flat();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.1) {
            const topicId = entry.target.id.replace('topic-', '');
            setHighlightIndex(false);
            setActiveTopic(topicId);
            const topic = allTopics.find((t: any) => t._id === topicId);
            if (topic) {
              const chapterId = chapterIdForTopic(topic, chapters);
              if (chapterId) {
                setActiveChapter(chapterId);
                setExpandedChapters((prev) => ({ ...prev, [chapterId]: true }));
              }
              updateBrowserUrl(topicId, true);
            }
          }
        });
      },
      { rootMargin: '-12% 0px -70% 0px', threshold: [0.1, 0.35] }
    );

    allTopics.forEach((topic: any) => {
      const el = document.getElementById(`topic-${topic._id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [topicsByChapter, chapters, updateBrowserUrl]);

  useEffect(() => {
    const allTopics = Object.values(topicsByChapter).flat();
    if (didInitialScroll.current || !allTopics.length) return;

    if (!initialTopicSlug && initialChapterNumber == null) {
      didInitialScroll.current = true;
      setBookRootUrl(true);
      setHighlightIndex(true);
      return;
    }

    let target: any = null;
    if (initialTopicSlug) {
      target = allTopics.find((t: any) => t.slug === initialTopicSlug);
    } else if (initialChapterNumber != null) {
      const chapter = chapters.find((c: any) => c.chapter_number === initialChapterNumber);
      if (chapter) {
        target = allTopics.find((t: any) => chapterIdForTopic(t, chapters) === chapter._id);
      }
    }

    if (target) {
      didInitialScroll.current = true;
      const chapterId = chapterIdForTopic(target, chapters);
      requestAnimationFrame(() => {
        setTimeout(() => scrollToTopic(target._id, chapterId, false), 100);
      });
    } else if (initialChapterNumber != null) {
      didInitialScroll.current = true;
      const chapter = chapters.find((c: any) => c.chapter_number === initialChapterNumber);
      if (chapter) {
        requestAnimationFrame(() => {
          setTimeout(() => scrollToChapter(chapter._id, chapter.chapter_number, false), 100);
        });
      }
    }
  }, [
    initialTopicSlug,
    initialChapterNumber,
    topicsByChapter,
    chapters,
    scrollToTopic,
    scrollToChapter,
    setBookRootUrl,
  ]);

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => {
      const newState = { ...prev, [chapterId]: !prev[chapterId] };
      if (newState[chapterId]) {
        fetchChapterTopics(chapterId);
      }
      return newState;
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 md:flex-row">
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

      {/* Sidebar index — kept as requested */}
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
            {chapters.length} chapters
          </p>
        </div>

        <div className="border-b border-slate-100 p-3">
          <button
            type="button"
            onClick={() => scrollToIndex(true)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors ${
              highlightIndex
                ? 'bg-amber-100 text-amber-900 ring-1 ring-amber-200'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <List className="h-4 w-4 shrink-0" />
            Table of Contents
          </button>
        </div>

        <nav className="space-y-1 p-3" aria-label="Chapter and topic index">
          {chapters.map((chapter: any) => {
            const chapterTopics = topicsByChapter[chapter._id] || [];
            const isExpanded = expandedChapters[chapter._id];
            const isActiveChapter = activeChapter === chapter._id && !highlightIndex;
            const isLoading = loadingChapters.has(chapter._id);

            return (
              <div key={chapter._id} className="mb-1">
                <div className="flex items-stretch gap-0.5">
                  <button
                    type="button"
                    onClick={() => scrollToChapter(chapter._id, chapter.chapter_number, true)}
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
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter._id)}
                    className="rounded-r-xl px-2 text-slate-400 hover:bg-slate-50"
                    aria-expanded={isExpanded}
                    aria-label={`${isExpanded ? 'Collapse' : 'Expand'} chapter ${chapter.chapter_number}`}
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-slate-100 pl-3">
                    {isLoading ? (
                      <div className="py-2 text-xs text-slate-500">Loading topics...</div>
                    ) : chapterTopics.length === 0 ? (
                      <div className="py-2 text-xs text-slate-500">No topics in this chapter</div>
                    ) : (
                      chapterTopics.map((topic: any) => {
                        const isActiveTopic = activeTopic === topic._id;
                        return (
                          <button
                            key={topic._id}
                            type="button"
                            onClick={() => scrollToTopic(topic._id, chapter._id, true)}
                            className={`w-full rounded-lg px-2.5 py-1.5 text-left text-xs transition-all ${
                              isActiveTopic
                                ? 'border-l-2 border-emerald-500 bg-emerald-50 font-bold text-emerald-800'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                          >
                            <span className="mr-1.5 tabular-nums opacity-60">
                              {topic.topic_number || topic.display_order}.
                            </span>
                            <span className="line-clamp-2">{topic.title}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
          <BookFrontIndex
            book={book}
            program={program}
            chapters={chapters}
            topics={topics}
            subjectSlug={subjectSlug}
            readerUrlOpts={readerUrlOpts}
            onJumpToChapter={(chapterId, chapterNumber) =>
              scrollToChapter(chapterId, chapterNumber, true)
            }
            onJumpToTopic={(topicId, chapterId) => scrollToTopic(topicId, chapterId, true)}
          />

          <div
            id="book-content-start"
            className="mb-16 flex items-center gap-4 border-y border-slate-200 py-6"
          >
            <div className="h-px flex-1 bg-slate-200" />
            <span className="shrink-0 text-xs font-bold uppercase tracking-[0.15em] text-slate-500">
              Text begins here
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {chapters.map((chapter: any) => {
            const chapterTopics = topicsByChapter[chapter._id] || [];

            return (
              <div key={chapter._id} className="mb-24">
                <header
                  className="mb-12 scroll-mt-20 pt-4"
                  id={`chapter-${chapter.chapter_number}`}
                >
                  <div className="mb-4 flex items-center gap-4">
                    <span className="flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-4 text-lg font-bold text-white shadow-sm">
                      Chapter {chapter.chapter_number}
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                  <h2 className="font-display text-3xl font-black text-slate-900 md:text-4xl">
                    {chapter.title}
                  </h2>
                </header>

                <div className="space-y-24">
                  {chapterTopics.map((topic: any) => {
                    const isHotTopic = topic.exam_frequency?.some((ef: any) => ef.is_hot_topic);
                    const blocks = topic.content_blocks || [];
                    const visibleCount = isLoggedIn ? blocks.length : Math.ceil(blocks.length / 2);
                    const visibleBlocks = blocks.slice(0, visibleCount);
                    const hiddenBlocks = blocks.slice(visibleCount);

                    return (
                      <article
                        key={topic._id}
                        id={`topic-${topic._id}`}
                        className="relative scroll-mt-20"
                      >
                        <div className="mb-8 flex flex-wrap items-center gap-3 border-b border-slate-100 pb-4">
                          <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-800">
                            {topic.topic_number || `${chapter.chapter_number}.${topic.display_order}`}
                          </span>
                          {topic.difficulty && (
                            <span
                              className={`rounded-full px-2 py-1 text-xs font-bold uppercase tracking-wider ${
                                topic.difficulty === 'easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : topic.difficulty === 'medium'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {topic.difficulty}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
                            <Clock className="h-4 w-4" />
                            {topic.estimated_read_time || 3} min read
                          </span>
                          {isHotTopic && (
                            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-orange-100 px-2 py-1 text-xs font-bold uppercase tracking-wider text-orange-700">
                              <Star className="h-3 w-3" />
                              Exam Favorite
                            </span>
                          )}
                        </div>

                        <div className="prose prose-slate max-w-none">
                          {(!blocks?.length || blocks[0]?.type !== 'heading') && (
                            <h2 className="mb-6 font-display text-2xl font-bold text-slate-900 md:text-3xl">
                              {topic.title}
                            </h2>
                          )}
                          <ContentBlockRenderer blocks={visibleBlocks} topicId={topic._id} />
                          {!isLoggedIn && hiddenBlocks.length > 0 && (
                            <div className="relative mt-8 max-h-64 overflow-hidden">
                              <div className="pointer-events-none select-none opacity-50 blur-sm">
                                <ContentBlockRenderer blocks={hiddenBlocks} topicId={topic._id} />
                              </div>
                              <PreviewWall />
                            </div>
                          )}
                        </div>

                        <TopicPracticeSection topic={topic} />

                        <div className="mt-16 flex items-center justify-center gap-4 opacity-30">
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                          <div className="h-2 w-2 rounded-full bg-slate-400" />
                        </div>
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <footer className="mt-20 border-t border-slate-200 py-20 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <BookOpen className="h-8 w-8" />
            </div>
            <h3 className="mb-2 font-display text-2xl font-bold text-slate-900">
              You&apos;ve reached the end!
            </h3>
            <p className="mb-8 text-slate-500">
              You have read through the entire {book.subject} book.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={() => scrollToIndex(true)}
                variant="outline"
              >
                Back to contents
              </Button>
              <Button
                type="button"
                onClick={() => scrollToIndex(true)}
                className="bg-slate-900 text-white hover:bg-slate-800"
              >
                Back to top
              </Button>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}
