"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  BookOpen, 
  Clock, 
  Star, 
  ChevronDown, 
  ChevronRight, 
  Menu, 
  X, 
  List, 
  ArrowLeft, 
  ArrowRight, 
  BookMarked,
  Flame,
  CheckCircle,
  Circle,
  Zap,
  Target,
  Sparkles,
  Archive,
  Pencil
} from "lucide-react";
import { ContentBlockRenderer } from "@/components/reader/ContentBlockRenderer";
import { TopicPracticeSection } from "@/components/reader/TopicPracticeSection";
import { TopicBreadcrumb } from "@/components/reader/TopicBreadcrumb";
import { Button } from "@/components/ui/Button";
import { bookUrl, chapterUrl, topicUrl } from "@/lib/reader-urls";
import { PreviewWall } from "@/components/reader/PreviewWall";
import AIExplainPanel from "@/components/reader/AIExplainPanel";
import SaveToVaultButton from "@/components/reader/SaveToVaultButton";
import AddNoteButton from "@/components/reader/AddNoteButton";
import MarkAsReadButton from "@/components/reader/MarkAsReadButton";

interface Topic {
  _id: string;
  slug?: string;
  title: string;
  content_blocks: any[];
  chapter_id: {
    _id: string;
    title: string;
    chapter_number: number;
    slug: string;
  };
  book_id: {
    _id: string;
    title: string;
    subject: string;
    slug: string;
  };
  program_id?: {
    _id: string;
    name: string;
    slug: string;
  };
  board_id?: {
    _id: string;
    name: string;
    short_code: string;
  };
  topic_number?: string;
  display_order?: number;
  difficulty?: string;
  estimated_read_time?: number;
  exam_frequency?: any[];
  key_terms?: any[];
  book_mcqs?: any[];
  book_problems?: any[];
  book_short_questions?: any[];
  is_live: boolean;
}

interface Chapter {
  _id: string;
  chapter_number: number;
  title: string;
  slug: string;
}

interface TopicSummary {
  _id: string;
  slug: string;
  title: string;
  topic_number?: string;
  display_order?: number;
  chapter_id?: string;
  chapterSlug?: string;
  estimated_read_time?: number;
}

interface TopicLevelReaderProps {
  topic: Topic;
  previousTopic: { _id: string; title: string; slug: string; chapterSlug?: string } | null;
  nextTopic: { _id: string; title: string; slug: string; chapterSlug?: string } | null;
  chapters: Chapter[];
  isLoggedIn: boolean;
  boardSlug?: string;
  subjectSlug: string;
  programSlug?: string;
  grade?: string;
  userProgress?: { is_read: boolean; quiz_score?: number } | null;
}

export default function TopicLevelReader({
  topic,
  previousTopic,
  nextTopic,
  chapters,
  isLoggedIn,
  boardSlug,
  subjectSlug,
  programSlug,
  grade,
  userProgress,
}: TopicLevelReaderProps) {
  const router = useRouter();
  const [isAIExplainOpen, setIsAIExplainOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const opts = boardSlug || programSlug || grade ? { boardSlug, programSlug, grade } : undefined;
  const isHotTopic = topic.exam_frequency?.some((ef: any) => ef.is_hot_topic || (ef as any).exam_frequency_count > 2);
  const isMastered = userProgress?.quiz_score !== undefined && userProgress.quiz_score >= 80;
  const isRead = userProgress?.is_read || false;

  const searchParams = useSearchParams();
  const previewParam = searchParams.get('preview') === 'true' ? '?preview=true' : '';

  const handleNextTopic = () => {
    if (nextTopic) {
      const targetChapterSlug = nextTopic.chapterSlug ?? topic.chapter_id.slug;
      const path = `${topicUrl(subjectSlug, targetChapterSlug, nextTopic.slug, opts)}${previewParam}`;
      router.push(path);
    }
  };

  const handlePreviousTopic = () => {
    if (previousTopic) {
      const targetChapterSlug = previousTopic.chapterSlug ?? topic.chapter_id.slug;
      const path = `${topicUrl(subjectSlug, targetChapterSlug, previousTopic.slug, opts)}${previewParam}`;
      router.push(path);
    }
  };

  const blocks = topic.content_blocks || [];
  const visibleCount = isLoggedIn ? blocks.length : Math.ceil(blocks.length / 2);
  const visibleBlocks = blocks.slice(0, visibleCount);
  const hiddenBlocks = blocks.slice(visibleCount);

  // Find current topic index in chapter for progress panel
  const currentTopicIndex = chapters
    .find((ch) => ch.slug === topic.chapter_id.slug)?.topics?.findIndex((t: any) => t._id === topic._id) ?? -1;

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      {/* AI Explain Panel */}
      <AIExplainPanel
        isOpen={isAIExplainOpen}
        onClose={() => setIsAIExplainOpen(false)}
        topicId={topic._id}
        topicTitle={topic.title}
      />

      {/* Reader Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3 md:px-8">
          <Link
            href={bookUrl(subjectSlug, opts)}
            className="truncate font-display font-bold text-slate-800 hover:text-indigo-600"
          >
            ← {topic.book_id.title}
          </Link>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {topic.program_id?.name}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-w-0 flex-1">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-10">
          
          {/* Breadcrumb */}
          <TopicBreadcrumb
            programName={topic.program_id?.name || 'Program'}
            boardSlug={boardSlug}
            programSlug={programSlug}
            bookTitle={topic.book_id.title}
            subjectSlug={subjectSlug}
            chapterSlug={topic.chapter_id.slug}
            chapterNumber={topic.chapter_id.chapter_number}
            chapterTitle={topic.chapter_id.title}
            topicTitle={topic.title}
            topicSlug={topic.slug}
          />

          {/* Topic Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-800">
                {topic.topic_number || `${topic.chapter_id.chapter_number}.${topic.display_order}`}
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
                <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-2 py-1 text-xs font-bold text-amber-700">
                  <Flame className="h-3 w-3" />
                  High Frequency
                </span>
              )}
              {isMastered && (
                <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">
                  <CheckCircle className="h-3 w-3" />
                  Mastered
                </span>
              )}
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold text-slate-900 md:text-4xl">
              {topic.title}
            </h1>
          </div>

          {/* Content */}
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

          {/* Practice Section */}
          <TopicPracticeSection topic={topic} />

          {/* Key Terms */}
          {topic.key_terms && topic.key_terms.length > 0 && (
            <div className="mt-12">
              <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-800">
                <BookMarked className="h-5 w-5 text-rose-600" /> Key Terms
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {topic.key_terms.map((kt: any, idx: number) => (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#993556] bg-[#FBEAF0] p-4 shadow-sm transition-shadow hover:shadow-md"
                  >
                    <div className="mb-1 text-[13px] font-medium text-[#993556]">{kt.term}</div>
                    <div className="text-[12px] leading-relaxed text-[#4B1528]/80">{kt.definition}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bottom CTA Strip */}
          {isLoggedIn && (
            <div className="mt-16 grid grid-cols-1 gap-4 border-t border-slate-200 pt-8 md:grid-cols-3">
              <MarkAsReadButton topicId={topic._id} xpReward={10} />
              
              <Link href={`/quiz/${topic._id}`} className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  <Target className="h-4 w-4" />
                  Take Quiz
                </Button>
              </Link>
              
              <Button
                onClick={() => setIsAIExplainOpen(true)}
                variant="ghost"
                className="hidden gap-2 md:flex"
              >
                <Sparkles className="h-4 w-4" />
                AI Explain
              </Button>
            </div>
          )}

          {/* Topic Navigation */}
          <div className="mt-8 flex items-center justify-between gap-4 border-t border-slate-200 pt-8">
            <Button
              onClick={handlePreviousTopic}
              disabled={!previousTopic}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <div className="hidden text-left sm:block">
                <div className="text-xs text-slate-500">Previous</div>
                <div className="font-medium">{previousTopic?.title || "—"}</div>
              </div>
            </Button>

            <Link href={`${chapterUrl(subjectSlug, topic.chapter_id.slug, opts)}${previewParam}`}>
              <Button variant="outline" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Chapter Overview
              </Button>
            </Link>

            <Button
              onClick={handleNextTopic}
              disabled={!nextTopic}
              className="flex items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              <div className="hidden text-right sm:block">
                <div className="text-xs">Next</div>
                <div className="font-medium">{nextTopic?.title || "—"}</div>
              </div>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Desktop Sidebar (Sticky) */}
      {isLoggedIn && (
        <aside className="hidden lg:block">
          <div className="fixed right-8 top-24 z-30 w-72 space-y-3">
            {/* AI Explain */}
            <Button
              onClick={() => setIsAIExplainOpen(true)}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              🤖 AI Explain
            </Button>

            {/* Save to Vault */}
            <SaveToVaultButton topicId={topic._id} topicTitle={topic.title} />

            {/* Add Note */}
            <AddNoteButton topicId={topic._id} topicTitle={topic.title} />

            {/* Mini Progress Panel */}
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                Chapter {topic.chapter_id.chapter_number} Progress
              </h3>
              <div className="space-y-2">
                {chapters
                  .find((ch) => ch.slug === topic.chapter_id.slug)?.topics?.slice(0, 8)
                  .map((t: any, idx: number) => {
                    const isCurrent = t._id === topic._id;
                    const isThisRead = t.progress?.is_read || false;
                    const isThisMastered = t.progress?.quiz_score >= 80;
                    
                    return (
                      <div
                        key={t._id}
                        className={`flex items-center gap-2 text-sm ${
                          isCurrent ? "font-medium text-emerald-700" : "text-slate-600"
                        }`}
                      >
                        {isThisMastered ? (
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                        ) : isThisRead ? (
                          <Circle className="h-4 w-4 fill-emerald-200 text-emerald-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-300" />
                        )}
                        <span className="truncate">{t.title}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* Mobile FABs */}
      {isLoggedIn && (
        <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-2 lg:hidden">
          <button
            onClick={() => setIsAIExplainOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-lg ring-2 ring-emerald-600"
          >
            <Sparkles className="h-5 w-5 text-emerald-600" />
          </button>
          <SaveToVaultButton topicId={topic._id} topicTitle={topic.title} />
        </div>
      )}
    </div>
  );
}
