'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ContentBlockRenderer } from '@/components/reader/ContentBlockRenderer';
import { ProgressWheel } from '@/components/progress/ProgressWheel';
import QuranVerseRenderer from '@/components/QuranVerseRenderer';
import { PreviewWall } from '@/components/reader/PreviewWall';
import { topicUrl } from '@/lib/reader-urls';
import { BookOpen, PenLine, Sparkles, Bookmark, Flame, BookMarked, Target, Check, PenTool, CheckCircle, Star } from 'lucide-react';

interface BoardRef {
  _id?: string;
  slug?: string;
  short_code?: string;
}

interface KeyTerm {
  term: string;
  definition: string;
}

interface MCQ {
  question: string;
  options: string[];
  correct_answer?: string;
  explanation?: string;
}

interface Topic {
  _id: string;
  slug?: string;
  title: string;
  title_urdu?: string;
  content_blocks: any[];
  chapter_id: {
    title: string;
    chapter_number: number;
    slug: string;
  };
  book_id: {
    title: string;
    subject: string;
  };
  board_id?: BoardRef;
  program_name?: string;
  subject_name?: string;
  estimated_read_time?: number;
  is_live: boolean;
  key_terms?: KeyTerm[];
  book_mcqs?: MCQ[];
  book_problems?: any[];
  book_short_questions?: any[];
  // Quran reference fields
  quran_reference?: {
    surah: number;
    ayah: number;
    surah_name_arabic?: string;
    surah_name_english?: string;
    juz?: number;
    manzil?: number;
    ruku?: number;
  };
  quran_word_alignments?: Array<{
    position: number;
    textbook_urdu_meaning: string;
    color_highlight?: string;
    grammar_note?: string;
  }>;
}

interface TopicReaderClientProps {
  topic: Topic;
  previousTopic: { _id: string; title: string; slug: string } | null;
  nextTopic: { _id: string; title: string; slug: string } | null;
  isHotTopic: boolean;
  examAppearances: number;
  isUrduTopic: boolean;
  isLoggedIn: boolean;
}

export default function TopicReaderClient({
  topic,
  previousTopic,
  nextTopic,
  isHotTopic,
  examAppearances,
  isUrduTopic,
  isLoggedIn,
}: TopicReaderClientProps) {
  const [activeTab, setActiveTab] = useState<'read' | 'practice' | 'ai' | 'vault'>('read');
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const searchParams = useSearchParams();

  // Scroll progress tracker
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update URL as user scrolls to aid indexing and navigation
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const normalizeSlug = (value?: string | number | null) =>
      value === undefined || value === null
        ? ''
        : String(value).trim().replace(/\s+/g, '-').toLowerCase();

    const programSlug = normalizeSlug(topic.program_name || 'program');
    const subjectSlug = normalizeSlug(topic.subject_name || topic.book_id?.subject || 'subject');
    const chapterSlug = normalizeSlug(topic.chapter_id?.slug || `chapter-${topic.chapter_id?.chapter_number || 1}`);
    const opts = {
      boardSlug: normalizeSlug(topic.board_id?.short_code || topic.board_id?.slug || ''),
      programSlug,
    };
    const previewParam = searchParams.get('preview') === 'true' ? '?preview=true' : '';

    const buildPath = (topicSlug?: string) => {
      return `${topicUrl(subjectSlug, chapterSlug, topicSlug || topic.slug || 'topic', opts)}${previewParam}`;
    };

    // Set initial URL to current topic (replace, not push)
    const currentSlug = topic.slug || (nextTopic && nextTopic.slug) || (previousTopic && previousTopic.slug);
    if (currentSlug) {
      const currentPath = buildPath(currentSlug);
      window.history.replaceState(null, '', currentPath);
    }

    // As user nears the end, update to next topic; as they return to top, revert
    const handleUrlOnProgress = () => {
      if (scrollProgress >= 95 && nextTopic?.slug) {
        const nextPath = buildPath(nextTopic.slug);
        window.history.replaceState(null, '', nextPath);
      } else if (scrollProgress <= 5) {
        // revert to current topic
        if (currentSlug) {
          const currentPath = buildPath(currentSlug);
          window.history.replaceState(null, '', currentPath);
        }
      }
    };

    handleUrlOnProgress();
    // run when scrollProgress or topic changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scrollProgress, topic._id, searchParams]);

  const handleMarkComplete = async () => {
    try {
      // POST to /api/progress/mark-read - server extracts userId from session/token
      const res = await fetch('/api/progress/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicId: topic._id,
          isRead: true,
          scrollDepthPercent: Math.round(scrollProgress),
          timeSpentSeconds: 0,
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        setIsCompleted(true);
      } else {
        console.error('Failed to mark complete:', data.error);
      }
    } catch (error) {
      console.error('Error marking complete:', error);
    }
  };

  const tabs = [
    { id: 'read' as const, label: 'Read', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'practice' as const, label: 'Practice', icon: <PenLine className="w-4 h-4" /> },
    { id: 'ai' as const, label: 'AI Explain', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'vault' as const, label: 'Vault', icon: <Bookmark className="w-4 h-4" /> },
  ];
  const blocks = topic.content_blocks || [];
  const visibleCount = isLoggedIn ? blocks.length : Math.ceil(blocks.length / 2);
  const visibleBlocks = blocks.slice(0, visibleCount);
  const hiddenBlocks = blocks.slice(visibleCount);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <div 
          className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="pt-8 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-600 mb-4 overflow-x-auto">
          <span className="whitespace-nowrap">{topic.program_name || 'Grade 9'}</span>
          <span className="text-slate-400">›</span>
          <span className="whitespace-nowrap">{topic.subject_name || topic.book_id?.subject}</span>
          <span className="text-slate-400">›</span>
          <span className="whitespace-nowrap">Ch {topic.chapter_id?.chapter_number}: {topic.chapter_id?.title}</span>
        </nav>

        {/* Hot Topic Badge */}
        {isHotTopic && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 border border-orange-300 rounded-full text-orange-800 text-sm font-medium mb-4">
            <Flame className="w-4 h-4" />
            <span>FBISE Favorite — appeared {examAppearances} times</span>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">
              {topic.title}
            </h1>
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <span>{topic.chapter_id?.title || `Chapter ${topic.chapter_id?.chapter_number}`}</span>
              <span>•</span>
              <span>{topic.estimated_read_time || 3} min read</span>
            </div>
          </div>
          
          {/* TTS Button */}
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 hidden sm:flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            Listen
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap
                transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                }
              `}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        {activeTab === 'read' && (
          <div className="space-y-8">
            <Card className="bg-white/90 backdrop-blur-sm shadow-sm overflow-hidden p-6 md:p-10 border border-slate-100">
              {/* Content Blocks */}
              <div
                className={`max-w-none ${isUrduTopic ? 'urdu-content' : ''}`}
                dir={isUrduTopic ? 'rtl' : undefined}
                lang={isUrduTopic ? 'ur' : undefined}
              >
                {visibleBlocks.map((block, index) => {
                  // Handle Quran verse blocks
                  if (block.type === 'quran_verse' && block.quran_data) {
                    return (
                      <div key={index} className="my-8">
                        <div className="text-center mb-4 text-slate-600">
                          Surah {block.quran_data.surah}:{block.quran_data.ayah} - 
                          {topic.quran_reference?.surah_name_english || 'Surah Name'}
                        </div>
                        <QuranVerseRenderer 
                          topicId={topic._id}
                          surah={block.quran_data.surah}
                          ayah={block.quran_data.ayah}
                          wordAlignments={block.quran_data.word_alignments || []}
                        />
                      </div>
                    );
                  }
                  
                  // Handle regular content blocks
                  return (
                    <div key={index} className="mb-6">
                      <ContentBlockRenderer blocks={[block]} />
                    </div>
                  );
                })}
              </div>

              {!isLoggedIn && hiddenBlocks.length > 0 && (
                <div className="relative mt-8 overflow-hidden">
                  <div className="max-h-48 overflow-hidden">
                    {hiddenBlocks.slice(0, 1).map((block, index) => (
                      <div key={`hidden-${index}`} className="mb-6 opacity-40 blur-[2px]">
                        <ContentBlockRenderer blocks={[block]} />
                      </div>
                    ))}
                  </div>
                  <PreviewWall />
                </div>
              )}
            </Card>

            {/* Key Terms Glossary */}
            {topic.key_terms && topic.key_terms.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-rose-600" /> Key Terms
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {topic.key_terms.map((kt: any, idx: number) => (
                    <div key={idx} className="bg-[#FBEAF0] border-[0.5px] border-[#993556] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-[13px] font-medium text-[#993556] mb-1">{kt.term}</div>
                      <div className="text-[12px] text-[#4B1528]/80 leading-relaxed">{kt.definition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Practice Tab Area */}
        {activeTab === 'practice' && (
          <div className="space-y-10 animate-fade-in">
            {(!topic.book_mcqs?.length && !topic.book_problems?.length && !topic.book_short_questions?.length) ? (
              <Card className="p-12 text-center border border-dashed border-slate-200 bg-slate-50">
                <PenLine className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-bold text-slate-700 mb-2">No Practice Material</h3>
                <p className="text-slate-500">There are no MCQs or problems associated with this specific topic yet.</p>
              </Card>
            ) : (
              <>
                {/* MCQs */}
                {topic.book_mcqs && topic.book_mcqs.length > 0 && (
                  <section>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <Target className="w-5 h-5 text-forest-600" /> Multiple Choice Questions
                    </h3>
                    <div className="space-y-4">
                      {topic.book_mcqs.map((mcq: any, idx: number) => (
                        <div key={idx} className="bg-[#EAF3DE] border-[0.5px] border-[#3B6D11] rounded-xl p-5 shadow-sm">
                          <div className="flex gap-3">
                            <div className="w-6 h-6 rounded-full bg-[#3B6D11] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                              {idx + 1}
                            </div>
                            <div className="space-y-4 w-full">
                              <div className="text-[14px] font-bold text-[#173404]">{mcq.question}</div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {mcq.options.map((opt: string, oIdx: number) => {
                                  const isCorrect = mcq.correct_answer && opt.toLowerCase().includes(`(${mcq.correct_answer.toLowerCase()})`);
                                  return (
                                    <div 
                                      key={oIdx} 
                                      className={`px-4 py-2.5 rounded-lg text-[13px] transition-colors border ${
                                        isCorrect 
                                          ? 'bg-[#3B6D11] text-white border-[#3B6D11] font-medium shadow-sm' 
                                          : 'bg-white/60 text-[#173404] border-[#3B6D11]/30 hover:bg-white'
                                      }`}
                                    >
                                      <div className="flex justify-between items-center gap-2">
                                        <span>{opt}</span>
                                        {isCorrect && <Check className="w-4 h-4" />}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                              {mcq.explanation && (
                                <div className="mt-4 pt-3 border-t border-[#3B6D11]/20 text-[12px] text-[#173404]/80 italic">
                                  <span className="font-semibold not-italic">Explanation:</span> {mcq.explanation}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Problems & Exercises */}
                {(topic.book_problems?.length > 0 || topic.book_short_questions?.length > 0) && (
                  <section>
                    <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                      <PenTool className="w-5 h-5 text-coral-600" /> Problems & Exercises
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {topic.book_short_questions?.map((q: string, idx: number) => (
                        <div key={`sq-${idx}`} className="bg-[#FAECE7] border-[0.5px] border-[#993C1D] rounded-xl p-5 shadow-sm">
                          <div className="text-[14px] font-bold text-[#4A1B0C] flex gap-3">
                            <span className="text-[#993C1D]">Q{idx + 1}.</span> {q}
                          </div>
                        </div>
                      ))}
                      
                      {topic.book_problems?.map((prob: any, idx: number) => (
                        <div key={`p-${idx}`} className="bg-[#FAECE7] border-[0.5px] border-[#993C1D] rounded-xl p-5 shadow-sm">
                          <div className="text-[14px] font-bold text-[#4A1B0C] flex gap-3 mb-3">
                            <span className="text-[#993C1D]">P{idx + 1}.</span> {prob.problem || prob.question}
                          </div>
                          {prob.answer && (
                            <div className="font-mono text-[12px] text-[#993C1D] bg-white/50 p-3 rounded-lg border border-[#993C1D]/20">
                              <span className="text-[#4A1B0C] font-sans font-semibold mr-2">Answer:</span>
                              {prob.answer}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleMarkComplete}
            disabled={isCompleted}
            className={`flex-1 py-4 text-lg font-semibold ${
              isCompleted
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700'
            }`}
          >
            {isCompleted ? 'Completed!' : 'Mark as Completed'}
          </Button>
          
          {nextTopic ? (
            <a href={buildPath(nextTopic.slug)}>
              <Button variant="outline" className="w-full sm:w-auto py-4 text-lg">
                Next Topic →
              </Button>
            </a>
          ) : (
            <Button disabled variant="outline" className="w-full sm:w-auto py-4 text-lg opacity-50">
              End of Chapter
            </Button>
          )}
        </div>

        {/* Progress Summary */}
        <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-4">
            <span className="font-semibold text-slate-700">Your Progress</span>
            <span className={`text-sm font-medium ${scrollProgress >= 100 ? 'text-emerald-600' : 'text-slate-600'}`}>
              {Math.round(scrollProgress)}% complete
            </span>
          </div>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-emerald-600 bg-emerald-100 flex items-center gap-1">
                {isCompleted && <Star className="w-3 h-3 fill-emerald-600" />}
                {isCompleted ? 'Mastered!' : 'In Progress'}
              </div>
            </div>
            <div className="overflow-hidden h-3 text-xs flex rounded-full bg-slate-100">
              <div
                style={{ width: `${scrollProgress}%` }}
                className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
