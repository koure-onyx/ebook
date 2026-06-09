"use client";

import { motion } from "framer-motion";
import { Flame, Calendar, Zap, BookOpen, Archive, TrendingUp, FolderKanban, Save } from "lucide-react";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  delay?: number;
}

export function StatCard({ icon, label, value, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white border border-slate-100 rounded-xl p-4 flex items-start gap-3"
    >
      <div className="p-2 bg-emerald-50 rounded-lg">{icon}</div>
      <div>
        <div className="text-2xl font-bold text-slate-900">{value}</div>
        <div className="text-sm text-slate-500">{label}</div>
      </div>
    </motion.div>
  );
}

interface ContinueStudyingCardProps {
  chapters: Array<{
    _id: string;
    bookTitle: string;
    chapterTitle: string;
    progress: number;
    href: string;
  }>;
}

export function ContinueStudyingCard({ chapters }: ContinueStudyingCardProps) {
  if (!chapters || chapters.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-white border border-slate-100 rounded-2xl p-6"
      >
        <h3 className="text-lg font-semibold text-slate-800 mb-2">
          📖 Pick Up Where You Left Off
        </h3>
        <div className="text-center py-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-700 font-medium mb-1">Start your first chapter</p>
          <p className="text-sm text-slate-500 mb-4">Explore books to begin tracking progress</p>
          <a
            href="/books"
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Browse Books <BookOpen className="w-4 h-4" />
          </a>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-100 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        📖 Pick Up Where You Left Off
      </h3>
      <div className="space-y-4">
        {chapters.slice(0, 2).map((chapter, idx) => (
          <motion.div
            key={chapter._id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: idx * 0.1 }}
            className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-sm text-slate-500 mb-0.5">{chapter.bookTitle}</p>
                <h4 className="font-semibold text-slate-800">{chapter.chapterTitle}</h4>
              </div>
            </div>
            <div className="mb-3">
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{chapter.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all"
                  style={{ width: `${chapter.progress}%` }}
                />
              </div>
            </div>
            <a
              href={chapter.href}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors"
            >
              Continue <TrendingUp className="w-4 h-4" />
            </a>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

interface StreakCardProps {
  xpThisWeek: number;
  xpToNextLevel: number;
  streakDays: number;
  topicsStudied: number;
  studiedDays: boolean[];
}

export function StreakCard({ xpThisWeek, xpToNextLevel, streakDays, topicsStudied, studiedDays }: StreakCardProps) {
  const progressPercent = Math.min((xpThisWeek / xpToNextLevel) * 100, 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-slate-100 rounded-2xl p-6"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-4">This Week</h3>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-slate-600">XP Progress</span>
          <span className="font-medium text-slate-900">{xpThisWeek} / {xpToNextLevel}</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Flame className="w-5 h-5 text-amber-500" aria-hidden="true" />
        <span className="font-semibold text-slate-800">{streakDays}-day streak</span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-4 h-4 text-slate-400" aria-hidden="true" />
        <span className="text-sm text-slate-600">{topicsStudied} topics studied</span>
      </div>

      <div>
        <p className="text-xs text-slate-500 mb-2">Activity</p>
        <div className="flex gap-1">
          {studiedDays.map((studied, idx) => (
            <div
              key={idx}
              className={`w-6 h-6 rounded-full ${
                studied ? "bg-emerald-500" : "bg-slate-200"
              }`}
              aria-label={studied ? "Studied" : "No activity"}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

interface HotTopicsCardProps {
  topics: Array<{
    _id: string;
    title: string;
    exam_frequency_count: number;
    slug: string;
  }>;
}

export function HotTopicsCard({ topics }: HotTopicsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-100 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500" aria-hidden="true" />
          Hot Topics This Week
        </h3>
        <a href="/hot-topics" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          See all →
        </a>
      </div>

      {topics.length === 0 ? (
        <div className="text-center py-6">
          <Flame className="w-10 h-10 text-slate-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-slate-500">No hot topics available yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {topics.slice(0, 4).map((topic, idx) => (
            <motion.div
              key={topic._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Flame className="w-4 h-4 text-amber-500" aria-hidden="true" />
                <div>
                  <p className="font-medium text-slate-800 text-sm">{topic.title}</p>
                  <p className="text-xs text-slate-500">
                    {topic.exam_frequency_count}× in past 5 years
                  </p>
                </div>
              </div>
              <a
                href={`/topics/${topic.slug}`}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Study →
              </a>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

interface VaultSnapshotCardProps {
  items: Array<{
    _id: string;
    topicTitle: string;
    itemType: "flashcard" | "bookmark" | "note";
    createdAt: string;
  }>;
}

export function VaultSnapshotCard({ items }: VaultSnapshotCardProps) {
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "flashcard":
        return "bg-blue-100 text-blue-700";
      case "bookmark":
        return "bg-amber-100 text-amber-700";
      case "note":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white border border-slate-100 rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <Archive className="w-5 h-5 text-emerald-600" aria-hidden="true" />
          My Vault
        </h3>
        <a href="/vault" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
          Open Vault →
        </a>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-6">
          <Archive className="w-10 h-10 text-slate-300 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-slate-500 mb-1">Nothing saved yet</p>
          <p className="text-xs text-slate-400 flex items-center justify-center gap-1">
            <Save className="w-3 h-3" /> Tap Save on any topic to save it
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.slice(0, 3).map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
            >
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-800 text-sm truncate">{item.topicTitle}</p>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadge(item.itemType)}`}>
                  {item.itemType.charAt(0).toUpperCase() + item.itemType.slice(1)}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
