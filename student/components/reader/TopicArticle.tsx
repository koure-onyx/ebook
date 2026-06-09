'use client';

import { Clock, Star } from 'lucide-react';
import { ContentBlockRenderer } from '@/components/reader/ContentBlockRenderer';
import { TopicPracticeSection } from '@/components/reader/TopicPracticeSection';
import { PreviewWall } from '@/components/reader/PreviewWall';

export function TopicArticle({ topic, chapterNumber, isLoggedIn }: any) {
  const isHotTopic = topic.exam_frequency?.some((ef: any) => ef.is_hot_topic);
  const blocks = topic.content_blocks || [];
  const visibleCount = isLoggedIn ? blocks.length : Math.ceil(blocks.length / 2);
  const visibleBlocks = blocks.slice(0, visibleCount);
  const hiddenBlocks = blocks.slice(visibleCount);

  return (
    <article className="border-b border-slate-100 pb-12 last:border-0">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-800">
          {topic.topic_number || `${chapterNumber}.${topic.display_order}`}
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
          {topic.estimated_read_time || 3} min
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
    </article>
  );
}
