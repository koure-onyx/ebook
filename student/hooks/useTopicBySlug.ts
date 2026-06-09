'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { bookUrl, topicUrl } from '@/lib/reader-urls';

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

interface TopicData {
  topic: Topic;
  previousTopic: { _id: string; title: string; slug: string; chapterSlug?: string } | null;
  nextTopic: { _id: string; title: string; slug: string; chapterSlug?: string } | null;
  book: any;
  program: any;
  chapter: any;
}

export function useTopicBySlug() {
  const params = useParams();
  const router = useRouter();
  
  const [topicData, setTopicData] = useState<TopicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const subjectSlug = params.subjectSlug as string;
  const boardSlug = params.boardSlug as string;
  const programSlug = params.programSlug as string;
  const chapterSlug = params.chapterSlug as string;
  const topicSlug = params.topicSlug as string;
  
  useEffect(() => {
    if (!subjectSlug || !chapterSlug || !topicSlug) return;
    
    const fetchTopic = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/topics/by-slug/${subjectSlug}/${chapterSlug}/${topicSlug}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch topic');
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || 'Failed to fetch topic');
        }
        
        setTopicData(data.data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch topic';
        setError(errorMessage);
        
        // If topic not found, redirect to book overview
        if (errorMessage.includes('not found')) {
          router.push(bookUrl(subjectSlug, { boardSlug, programSlug }));
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopic();
  }, [subjectSlug, chapterSlug, topicSlug, boardSlug, programSlug, router]);
  
  const goToNextTopic = () => {
    if (topicData?.nextTopic) {
      router.push(topicUrl(subjectSlug, topicData.nextTopic.chapterSlug || chapterSlug, topicData.nextTopic.slug, { boardSlug, programSlug }));
    }
  };
  
  const goToPreviousTopic = () => {
    if (topicData?.previousTopic) {
      router.push(topicUrl(subjectSlug, topicData.previousTopic.chapterSlug || chapterSlug, topicData.previousTopic.slug, { boardSlug, programSlug }));
    }
  };
  
  return {
    topicData,
    loading,
    error,
    goToNextTopic,
    goToPreviousTopic,
  };
}
