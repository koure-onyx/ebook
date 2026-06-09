"use client";

import { Flame } from "lucide-react";
import { motion } from "framer-motion";

interface HotTopic {
  _id: string;
  title: string;
  slug: string;
  exam_frequency_count: number;
  subject: string;
  grade: number;
}

interface HotTopicsChipsProps {
  topics: HotTopic[];
  onSelect: (topicTitle: string) => void;
}

export default function HotTopicsChips({ topics, onSelect }: HotTopicsChipsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <Flame className="h-5 w-5 text-amber-500" />
        <h2 className="text-lg font-semibold text-slate-900">Hot Topics Right Now</h2>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {topics.map((topic, idx) => (
          <motion.button
            key={topic._id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelect(topic.title)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full text-sm font-medium transition-colors group"
          >
            <Flame className="h-4 w-4 text-amber-600 group-hover:text-amber-700" />
            <span>{topic.title}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
