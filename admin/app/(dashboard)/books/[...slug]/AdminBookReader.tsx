'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  Layers, 
  HelpCircle, 
  CheckCircle, 
  Clock, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  List, 
  ArrowLeft, 
  ArrowRight,
  Bookmark,
  Flame,
  Check,
  Award
} from 'lucide-react';
import { bookUrl, topicUrl } from '@/lib/reader-urls';

interface Topic {
  _id: string;
  title: string;
  title_urdu?: string;
  slug: string;
  topic_number?: string;
  display_order?: number;
  difficulty?: string;
  estimated_read_time?: number;
  clean_html?: string;
  content?: string;
  key_terms?: Array<{ term: string; definition: string }>;
  book_mcqs?: Array<{ question: string; options: string[]; correct_answer?: string; explanation?: string }>;
  book_problems?: Array<{ problem: string; answer?: string }>;
  book_short_questions?: string[];
}

interface Chapter {
  _id: string;
  chapter_number: number;
  title: string;
  slug: string;
  topics: Topic[];
}

interface AdminBookReaderProps {
  book: any;
  program: any;
  chapters: Chapter[];
  activeChapter: Chapter | null;
  activeTopic: Topic | null;
  subjectSlug: string;
  boardSlug: string;
  grade: string;
}

export default function AdminBookReader({
  book,
  program,
  chapters,
  activeChapter,
  activeTopic,
  subjectSlug,
  boardSlug,
  grade
}: AdminBookReaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>(() => {
    // Keep active chapter expanded on load
    if (activeChapter) {
      return { [activeChapter._id]: true };
    }
    return {};
  });
  const [activeTab, setActiveTab] = useState<'content' | 'mcqs' | 'key-terms' | 'exercises'>('content');

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterId]: !prev[chapterId] }));
  };

  const opts = { boardSlug, grade };

  // Find next/prev topics for footer navigation
  const flatTopics = chapters.flatMap((c) => c.topics.map(t => ({ ...t, chapterSlug: c.slug, chapterId: c._id })));
  const currentIdx = activeTopic ? flatTopics.findIndex((t) => t._id === activeTopic._id) : -1;
  const prevTopic = currentIdx > 0 ? flatTopics[currentIdx - 1] : null;
  const nextTopic = currentIdx >= 0 && currentIdx < flatTopics.length - 1 ? flatTopics[currentIdx + 1] : null;

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 shadow-md md:hidden">
        <Link href="/books" className="flex items-center gap-2 font-display text-sm font-bold text-emerald-400">
          ← Books
        </Link>
        <div className="max-w-[150px] truncate font-bold text-slate-200">{book.title}</div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="rounded-lg bg-slate-800 p-2 text-slate-300"
          aria-label="Toggle index sidebar"
        >
          {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Collapsible Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-[100dvh] w-80 flex-shrink-0 overflow-y-auto border-r border-slate-800 bg-slate-950 p-4 transition-transform duration-300 md:sticky md:top-0 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="border-b border-slate-800 pb-5 pt-12 md:pt-4">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
            {program.name}
          </div>
          <h1 className="font-display text-base font-bold leading-tight text-white">{book.title}</h1>
          <p className="mt-1 text-xs text-slate-400">
            {chapters.length} Chapters · {flatTopics.length} Topics
          </p>
        </div>

        <div className="my-4">
          <Link
            href={bookUrl(subjectSlug, opts)}
            onClick={() => setSidebarOpen(false)}
            className={`flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-all ${
              !activeTopic
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <List className="h-4 w-4" />
            Table of Contents
          </Link>
        </div>

        <nav className="space-y-1.5" aria-label="Book structure">
          {chapters.map((chapter) => {
            const isExpanded = expandedChapters[chapter._id];
            const isChActive = activeChapter?._id === chapter._id;

            return (
              <div key={chapter._id} className="rounded-xl bg-slate-900/50 p-1">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter._id)}
                    className={`flex flex-1 items-start gap-2.5 rounded-lg p-2 text-left text-xs font-semibold transition-colors ${
                      isChActive ? 'text-emerald-400' : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-800 text-[10px] font-bold text-slate-400">
                      {chapter.chapter_number}
                    </span>
                    <span className="line-clamp-2 leading-tight">{chapter.title}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleChapter(chapter._id)}
                    className="p-2 text-slate-500 hover:text-slate-300"
                  >
                    {isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="ml-5 mt-1 space-y-1 border-l border-slate-800 pl-2">
                    {chapter.topics.map((t) => {
                      const isTopicActive = activeTopic?._id === t._id;
                      const tUrl = topicUrl(subjectSlug, chapter.slug, t.slug, opts);

                      return (
                        <Link
                          key={t._id}
                          href={tUrl}
                          onClick={() => setSidebarOpen(false)}
                          className={`block rounded-lg px-2.5 py-1.5 text-left text-[11px] transition-all ${
                            isTopicActive
                              ? 'bg-emerald-500/10 font-bold text-emerald-400 border-l-2 border-emerald-500 pl-2'
                              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                          }`}
                        >
                          <span className="mr-1 opacity-50">{t.topic_number || t.display_order}.</span>
                          {t.title}
                        </Link>
                      );
                    })}
                    {chapter.topics.length === 0 && (
                      <div className="p-2 text-[10px] text-slate-500 italic">No topics ingested</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 px-4 pb-20 pt-16 md:px-8 md:pt-8">
        <div className="mx-auto max-w-4xl">
          {activeTopic ? (
            <div className="space-y-6">
              {/* Topic Header Card */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                  <span>Chapter {activeChapter?.chapter_number}</span>
                  <span>/</span>
                  <span className="truncate">{activeChapter?.title}</span>
                </div>

                <h2 className="mt-2 font-display text-2xl font-bold text-white md:text-3xl">
                  {activeTopic.title}
                </h2>
                {activeTopic.title_urdu && (
                  <p className="mt-1 text-right font-display text-xl text-emerald-400" dir="rtl">
                    {activeTopic.title_urdu}
                  </p>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                    <Clock className="h-3 w-3" /> {activeTopic.estimated_read_time || 3} min read
                  </span>
                  {activeTopic.difficulty && (
                    <span className={`inline-flex items-center rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      activeTopic.difficulty === 'easy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      activeTopic.difficulty === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {activeTopic.difficulty}
                    </span>
                  )}
                </div>
              </div>

              {/* Tab Selector */}
              <div className="flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('content')}
                  className={`border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'content' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Reading Text
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('mcqs')}
                  className={`border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'mcqs' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  MCQs ({activeTopic.book_mcqs?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('key-terms')}
                  className={`border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'key-terms' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Key Terms ({activeTopic.key_terms?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('exercises')}
                  className={`border-b-2 px-4 py-2.5 text-xs font-semibold tracking-wide transition-all ${
                    activeTab === 'exercises' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Exercises
                </button>
              </div>

              {/* Tab Contents */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-10">
                {activeTab === 'content' && (
                  <div className="prose prose-invert max-w-none text-slate-300">
                    {activeTopic.clean_html || activeTopic.content ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: activeTopic.clean_html || activeTopic.content || ''
                        }}
                        className="space-y-4 leading-relaxed"
                      />
                    ) : (
                      <p className="text-slate-500 italic">No reading text content ingested for this topic.</p>
                    )}
                  </div>
                )}

                {activeTab === 'mcqs' && (
                  <div className="space-y-4">
                    {activeTopic.book_mcqs && activeTopic.book_mcqs.length > 0 ? (
                      activeTopic.book_mcqs.map((mcq, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/50 p-5">
                          <p className="font-semibold text-white">Q{idx + 1}: {mcq.question}</p>
                          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {mcq.options.map((opt, oIdx) => {
                              const isCorrect = mcq.correct_answer && opt.toLowerCase().includes(`(${mcq.correct_answer.toLowerCase()})`);
                              return (
                                <div
                                  key={oIdx}
                                  className={`rounded-lg px-4 py-2.5 text-xs border ${
                                    isCorrect 
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                      : 'bg-slate-900/30 text-slate-300 border-slate-800'
                                  }`}
                                >
                                  {opt}
                                </div>
                              );
                            })}
                          </div>
                          {mcq.explanation && (
                            <p className="mt-3 border-t border-slate-800/80 pt-3 text-[11px] text-slate-400 italic">
                              <span className="font-semibold text-slate-300 not-italic">Explanation: </span>
                              {mcq.explanation}
                            </p>
                          )}
                        </div>
                      ))
                    ) : (
                      <p className="text-slate-500 italic">No multiple-choice questions ingested for this topic.</p>
                    )}
                  </div>
                )}

                {activeTab === 'key-terms' && (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {activeTopic.key_terms && activeTopic.key_terms.length > 0 ? (
                      activeTopic.key_terms.map((kt, idx) => (
                        <div key={idx} className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
                          <div className="font-semibold text-emerald-400 text-xs">{kt.term}</div>
                          <div className="mt-1 text-[11px] leading-relaxed text-slate-400">{kt.definition}</div>
                        </div>
                      ))
                    ) : (
                      <p className="col-span-2 text-slate-500 italic">No key terms ingested for this topic.</p>
                    )}
                  </div>
                )}

                {activeTab === 'exercises' && (
                  <div className="space-y-4">
                    {(!activeTopic.book_problems?.length && !activeTopic.book_short_questions?.length) && (
                      <p className="text-slate-500 italic">No exercise questions or problems ingested for this topic.</p>
                    )}

                    {activeTopic.book_short_questions && activeTopic.book_short_questions.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Short Questions</h4>
                        {activeTopic.book_short_questions.map((q, idx) => (
                          <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/30 p-3.5 text-xs text-slate-300">
                            <span className="font-semibold text-emerald-400 mr-2">Q{idx + 1}.</span> {q}
                          </div>
                        ))}
                      </div>
                    )}

                    {activeTopic.book_problems && activeTopic.book_problems.length > 0 && (
                      <div className="space-y-2 mt-6">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Problems</h4>
                        {activeTopic.book_problems.map((p, idx) => (
                          <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/30 p-4 text-xs text-slate-300">
                            <div className="flex gap-2">
                              <span className="font-semibold text-emerald-400">P{idx + 1}.</span>
                              <div>{p.problem}</div>
                            </div>
                            {p.answer && (
                              <div className="mt-2 border-t border-slate-800/80 pt-2 font-mono text-[11px] text-emerald-400">
                                <span className="font-semibold text-slate-400 font-sans mr-2">Answer:</span> {p.answer}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Navigation Footer */}
              <div className="flex justify-between items-center gap-4 pt-4">
                {prevTopic ? (
                  <Link href={topicUrl(subjectSlug, prevTopic.chapterSlug, prevTopic.slug, opts)}>
                    <button type="button" className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold hover:bg-slate-800">
                      <ArrowLeft className="h-4 w-4 text-slate-400" />
                      <div className="text-left hidden sm:block">
                        <div className="text-[10px] text-slate-500 uppercase">Previous</div>
                        <div className="truncate max-w-[120px]">{prevTopic.title}</div>
                      </div>
                    </button>
                  </Link>
                ) : (
                  <div />
                )}

                <Link href={bookUrl(subjectSlug, opts)}>
                  <button type="button" className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs font-semibold hover:bg-slate-800">
                    <List className="h-4 w-4" /> Book Overview
                  </button>
                </Link>

                {nextTopic ? (
                  <Link href={topicUrl(subjectSlug, nextTopic.chapterSlug, nextTopic.slug, opts)}>
                    <button type="button" className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold hover:bg-emerald-500">
                      <div className="text-right hidden sm:block">
                        <div className="text-[10px] text-emerald-200 uppercase">Next</div>
                        <div className="truncate max-w-[120px]">{nextTopic.title}</div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-white" />
                    </button>
                  </Link>
                ) : (
                  <div />
                )}
              </div>
            </div>
          ) : (
            /* Book Landing View */
            <div className="space-y-6">
              {/* Cover card */}
              <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/20 p-8 shadow-xl md:p-12 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-3xl rounded-full" />
                
                <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400">
                  {program.name} · {book.board_id?.name || 'Board'} · Grade {book.grade}
                </p>
                <h1 className="mt-4 font-display text-3xl font-black leading-tight text-white md:text-5xl">
                  {book.title}
                </h1>
                <p className="mt-3 text-sm font-medium text-slate-400">
                  {book.subject} — {book.edition_year} Edition
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 border-t border-slate-800/80 pt-6">
                  <div className="flex items-center gap-1.5">
                    <Layers className="h-4 w-4 text-emerald-400" />
                    <span>{chapters.length} Chapters</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-emerald-400" />
                    <span>{flatTopics.length} Topics</span>
                  </div>
                </div>
              </div>

              {/* Table of contents grid */}
              <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 md:p-8">
                <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-6 pb-2 border-b border-slate-800">
                  Table of Contents
                </h3>

                <div className="space-y-4">
                  {chapters.map((chapter) => (
                    <div key={chapter._id} className="rounded-xl border border-slate-800/80 bg-slate-900/30 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-400 uppercase">Chapter {chapter.chapter_number}</span>
                          <h4 className="text-sm font-bold text-white mt-0.5">{chapter.title}</h4>
                        </div>
                        <span className="shrink-0 text-[10px] font-medium text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                          {chapter.topics.length} topics
                        </span>
                      </div>

                      {chapter.topics.length > 0 ? (
                        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-800/50 pt-3">
                          {chapter.topics.map((t) => (
                            <Link
                              key={t._id}
                              href={topicUrl(subjectSlug, chapter.slug, t.slug, opts)}
                              className="flex items-center gap-2 rounded-lg bg-slate-900/40 hover:bg-slate-900 px-3 py-2 text-[11px] text-slate-300 hover:text-white transition-all border border-slate-850"
                            >
                              <span className="opacity-55 font-mono">{t.topic_number || t.display_order}.</span>
                              <span className="truncate">{t.title}</span>
                            </Link>
                          ))}
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-slate-500 italic">No topics ingested yet.</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
