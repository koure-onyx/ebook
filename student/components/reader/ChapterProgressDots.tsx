"use client";

import { motion } from "framer-motion";

interface ChapterProgressDotsProps {
  topics: Array<{
    _id: string;
    isRead?: boolean;
    quizScore?: number;
  }>;
  maxDots?: number;
}

export function ChapterProgressDots({
  topics,
  maxDots = 8,
}: ChapterProgressDotsProps) {
  // Hide on mobile via CSS if needed, but render logic here
  const displayTopics = topics.slice(0, maxDots);
  const remainingCount = topics.length - maxDots;
  
  if (topics.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5" aria-label="Chapter progress">
      {displayTopics.map((topic, idx) => {
        const isMastered = topic.quizScore !== undefined && topic.quizScore >= 80;
        const isRead = topic.isRead || isMastered;
        
        return (
          <motion.div
            key={topic._id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: idx * 0.03, duration: 0.2 }}
            className={`w-2 h-2 rounded-full transition-colors ${
              isMastered
                ? "bg-emerald-600"
                : isRead
                ? "bg-emerald-400"
                : "bg-slate-200"
            }`}
            title={isMastered ? "Mastered" : isRead ? "Read" : "Not started"}
          />
        );
      })}
      
      {remainingCount > 0 && (
        <span className="text-xs text-slate-400 font-medium">
          +{remainingCount}
        </span>
      )}
    </div>
  );
}
