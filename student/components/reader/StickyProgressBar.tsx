"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";

interface StickyProgressBarProps {
  bookTitle: string;
  totalTopics: number;
  readTopics: number;
  lastReadTopicSlug?: string;
}

export function StickyProgressBar({
  bookTitle,
  totalTopics,
  readTopics,
  lastReadTopicSlug,
}: StickyProgressBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Transform opacity and y position based on scroll
  const opacity = useTransform(scrollY, [0, 100], [0, 1]);
  const y = useTransform(scrollY, [0, 100], [-20, 0]);
  
  const percentage = totalTopics > 0 ? Math.round((readTopics / totalTopics) * 100) : 0;

  useEffect(() => {
    const unsubscribe = scrollY.onChange((latest) => {
      setIsScrolled(latest > 200);
    });
    return () => unsubscribe();
  }, [scrollY]);

  return (
    <>
      {/* Thin Progress Bar - Always visible at top when scrolled */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
        <motion.div
          className="h-full bg-emerald-600"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>

      {/* Floating Pill - Appears after scrolling down */}
      <AnimatePresence>
        {isScrolled && (
          <motion.div
            style={{ opacity, y }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-white/90 backdrop-blur-md border border-slate-200 shadow-lg rounded-full px-4 py-2 flex items-center gap-3">
              <span className="text-xs font-medium text-slate-600 truncate max-w-[150px] sm:max-w-xs">
                {bookTitle} — {percentage}%
              </span>
              {lastReadTopicSlug && (
                <Link
                  href={lastReadTopicSlug}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  Resume
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
