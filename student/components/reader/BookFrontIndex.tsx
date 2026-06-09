'use client';

import { List, BookMarked } from 'lucide-react';

type Chapter = {
  _id: string;
  chapter_number: number;
  title: string;
  page_start?: number;
  page_end?: number;
};

type Topic = {
  _id: string;
  slug: string;
  title: string;
  topic_number?: string;
  display_order?: number;
  chapter_id: string;
  estimated_read_time?: number;
};

type BookFrontIndexProps = {
  book: {
    title: string;
    subject?: string;
    subject_slug?: string;
    edition_year?: number;
    board_id?: { name?: string } | null;
    metadata?: { grade_level?: string };
  };
  program: { name: string; slug?: string };
  chapters: Chapter[];
  topics: Topic[];
  subjectSlug: string;
  readerUrlOpts?: { programSlug?: string };
  onJumpToChapter: (chapterId: string, chapterNumber: number) => void;
  onJumpToTopic: (topicId: string, chapterId: string) => void;
};

export function BookFrontIndex({
  book,
  program,
  chapters,
  topics,
  subjectSlug,
  readerUrlOpts,
  onJumpToChapter,
  onJumpToTopic,
}: BookFrontIndexProps) {
  const totalReadMins = topics.reduce((sum, t) => sum + (t.estimated_read_time || 3), 0);

  return (
    <section
      id="book-index"
      className="scroll-mt-20 mb-24 rounded-2xl border border-slate-200 bg-gradient-to-b from-amber-50/80 via-white to-white p-8 shadow-sm md:p-12"
    >
      {/* Cover block */}
      <div className="border-b border-slate-200/80 pb-10 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">
          {program.name}
          {book.board_id?.name ? ` • ${book.board_id.name}` : ''}
          {book.metadata?.grade_level ? ` • ${book.metadata.grade_level}` : ''}
        </p>
        <h1 className="mt-4 font-display text-3xl font-black leading-tight text-slate-950 md:text-5xl">
          {book.title}
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-600">
          {book.subject || book.title} — {book.edition_year || new Date().getFullYear()} Edition
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-500">
          <span>{chapters.length} Chapters</span>
          <span className="text-slate-300">|</span>
          <span>{topics.length} Topics</span>
          <span className="text-slate-300">|</span>
          <span>~{totalReadMins} min total reading</span>
        </div>
      </div>

      {/* Table of contents */}
      <div className="pt-10">
        <div className="mb-8 flex items-center gap-3 border-b-2 border-slate-900 pb-3">
          <List className="h-6 w-6 text-slate-800" />
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-slate-900 md:text-3xl">
            Table of Contents
          </h2>
        </div>

        <p className="mb-8 text-sm leading-relaxed text-slate-600">
          Use this index to jump to any chapter or topic. The same outline stays in the sidebar while you read.
          Click a line below or pick from the left panel.
        </p>

        <nav aria-label="Table of contents" className="space-y-8">
          {chapters.map((chapter) => {
            const chapterTopics = topics.filter(
              (t) => String(t.chapter_id) === String(chapter._id)
            );

            return (
              <div key={chapter._id} className="break-inside-avoid">
                {/* Chapter row */}
                <button
                  type="button"
                  onClick={() => onJumpToChapter(chapter._id, chapter.chapter_number)}
                  className="group flex w-full items-baseline gap-3 text-left transition-colors hover:text-indigo-700"
                >
                  <span className="shrink-0 font-display text-lg font-bold text-indigo-700 md:text-xl">
                    Ch {chapter.chapter_number}
                  </span>
                  <span className="min-w-0 flex-1 font-display text-lg font-semibold text-slate-900 group-hover:text-indigo-800 md:text-xl">
                    {chapter.title}
                  </span>
                  <span
                    className="hidden shrink-0 flex-1 border-b border-dotted border-slate-300 mx-3 min-w-[2rem] sm:block"
                    aria-hidden
                  />
                  <span className="shrink-0 text-xs font-medium text-slate-400">
                    {chapterTopics.length} topics
                  </span>
                </button>

                {/* Topics */}
                {chapterTopics.length > 0 && (
                  <ul className="mt-3 space-y-1.5 border-l-2 border-slate-200 pl-5 md:pl-8">
                    {chapterTopics.map((topic) => {
                      const label =
                        topic.topic_number ||
                        `${chapter.chapter_number}.${topic.display_order ?? ''}`;

                      return (
                        <li key={topic._id}>
                          <button
                            type="button"
                            onClick={() => onJumpToTopic(topic._id, chapter._id)}
                            className="group flex w-full items-baseline gap-2 py-1 text-left text-sm transition-colors hover:text-emerald-700"
                          >
                            <span className="w-10 shrink-0 tabular-nums text-slate-500 group-hover:text-emerald-600">
                              {label}
                            </span>
                            <span className="min-w-0 flex-1 text-slate-800 group-hover:font-medium group-hover:text-emerald-800">
                              {topic.title}
                            </span>
                            <span
                              className="hidden shrink-0 flex-1 border-b border-dotted border-slate-200 mx-2 min-w-[1.5rem] md:block"
                              aria-hidden
                            />
                            {topic.estimated_read_time ? (
                              <span className="shrink-0 text-[11px] text-slate-400">
                                {topic.estimated_read_time}m
                              </span>
                            ) : null}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </nav>

        {chapters.length > 0 && (
          <div className="mt-12 flex flex-col items-center gap-4 border-t border-slate-200 pt-8 sm:flex-row sm:justify-between">
            <p className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <BookMarked className="h-4 w-4" />
              Scroll down to begin reading from Chapter {chapters[0].chapter_number}
            </p>
            <button
              type="button"
              onClick={() => onJumpToChapter(chapters[0]._id, chapters[0].chapter_number)}
              className="rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Start reading →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
