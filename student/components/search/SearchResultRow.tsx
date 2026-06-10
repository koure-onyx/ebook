"use client";

import { motion } from "framer-motion";
import { Flame, Clock, BookOpen, FileText, GraduationCap } from "lucide-react";
import Link from "next/link";
import { chapterUrl, topicUrl } from "@/lib/reader-urls";

interface TopicResult {
  _id: string;
  title: string;
  slug: string;
  exam_frequency_count?: number;
  readingTime?: number;
  chapter: {
    title: string;
    book: {
      title: string;
      subject: string;
      grade: number;
      board: string;
    };
  };
}

interface ChapterResult {
  _id: string;
  title: string;
  slug: string;
  book: {
    title: string;
    subject: string;
    grade: number;
    board: string;
  };
}

interface SubjectResult {
  _id: string;
  name: string;
  slug: string;
  topicCount: number;
}

type SearchResult =
  | { type: "topic"; data: TopicResult }
  | { type: "chapter"; data: ChapterResult }
  | { type: "subject"; data: SubjectResult };

interface SearchResultRowProps {
  result: SearchResult;
}

export default function SearchResultRow({ result }: SearchResultRowProps) {
  const getTypeBadge = () => {
    switch (result.type) {
      case "topic":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
            TOPIC
          </span>
        );
      case "chapter":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            CHAPTER
          </span>
        );
      case "subject":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
            SUBJECT
          </span>
        );
    }
  };

  const getBreadcrumb = () => {
    if (result.type === "topic") {
      const topic = result.data as TopicResult;
      
      // Try to get book data from multiple possible locations
      const bookData = topic.book || topic.chapter?.book;
      const chapterData = topic.chapter;
      
      if (!bookData || !chapterData) {
        return (
          <p className="text-sm text-slate-500 mt-0.5">
            {topic.title}
          </p>
        );
      }
      
      const grade = typeof bookData.grade === 'number' ? bookData.grade : parseInt(String(bookData.grade)) || 9;
      
      return (
        <p className="text-sm text-slate-500 mt-0.5">
          {topic.chapter.book.subject} Grade {topic.chapter.book.grade} › {topic.chapter.title}
        </p>
      );
    }
    if (result.type === "chapter") {
      const chapter = result.data as ChapterResult;
      return (
        <p className="text-sm text-slate-500 mt-0.5">
          {chapter.book.subject} Grade {chapter.book.grade}
        </p>
      );
    }
    return null;
  };

  const getMetadata = () => {
    if (result.type === "topic") {
      const topic = result.data as TopicResult;
      return (
        <div className="flex items-center gap-3 mt-1">
          {topic.readingTime && (
            <span className="flex items-center text-xs text-slate-400 gap-1">
              <Clock className="h-3 w-3" />
              {topic.readingTime}m read
            </span>
          )}
          {topic.exam_frequency_count && topic.exam_frequency_count >= 3 && (
            <span className="flex items-center text-xs text-amber-600 gap-1 font-medium">
              <Flame className="h-3 w-3" />
              High frequency
            </span>
          )}
        </div>
      );
    }
    if (result.type === "subject") {
      const subject = result.data as SubjectResult;
      return (
        <p className="text-sm text-slate-500 mt-1">
          {subject.topicCount} topics
        </p>
      );
    }
    return null;
  };

  const getStudyLink = () => {
    if (result.type === "topic") {
      const topic = result.data as TopicResult;
      return topicUrl(
        topic.chapter.book.subject.toLowerCase(),
        topic.chapter.slug,
        topic.slug,
        { boardSlug: 'PB', programSlug: `grade-${topic.chapter.book.grade}` }
      );
    }
    if (result.type === "chapter") {
      const chapter = result.data as ChapterResult;
      return chapterUrl(
        chapter.book.subject.toLowerCase(),
        chapter.slug,
        { boardSlug: 'PB', programSlug: `grade-${chapter.book.grade}` }
      );
    }
    if (result.type === "subject") {
      const subject = result.data as SubjectResult;
      return `/books?subject=${subject.slug}`;
    }
    return "#";
  };

  return (
    <Link href={getHref()}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className=\"group p-4 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all duration-200\"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                {result.data.title}
              </h3>
              {getTypeBadge()}
            </div>
            
            {getBreadcrumb()}
            {getMetadata()}
          </div>
          
          <BookOpen className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 transition-colors mt-0.5" />
        </div>
      </motion.div>
    </Link>
  );
}
