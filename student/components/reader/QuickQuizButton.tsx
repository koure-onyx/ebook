"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap } from "lucide-react";
import Link from "next/link";

interface QuickQuizButtonProps {
  bookId: string;
}

export function QuickQuizButton({ bookId }: QuickQuizButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <Link
            href={`/quiz/${bookId}`}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-3 rounded-full shadow-lg font-semibold transition-colors"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span className="hidden sm:inline">Quick Quiz</span>
            <span className="sm:hidden">Quiz</span>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
