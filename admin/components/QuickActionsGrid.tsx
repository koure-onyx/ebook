"use client";

import { motion } from "framer-motion";
import { BookPlus, Send, Users, Settings, Zap } from "lucide-react";
import Link from "next/link";

interface QuickActionsGridProps {
  counts?: {
    pendingTopics?: number;
    totalStudents?: number;
  };
}

export default function QuickActionsGrid({ counts }: QuickActionsGridProps) {
  const actions = [
    {
      title: "+ New Book Ingestion",
      subtitle: "Add curriculum content",
      icon: <BookPlus className="w-6 h-6 text-emerald-600" />,
      href: "/books/ingest",
      badge: null,
    },
    {
      title: "📤 Publish Pending Topics",
      subtitle: `${counts?.pendingTopics ?? 0} items waiting`,
      icon: <Send className="w-6 h-6 text-blue-600" />,
      href: "/admin/content",
      badge: counts?.pendingTopics ?? 0,
    },
    {
      title: "👥 View All Students",
      subtitle: `${counts?.totalStudents ?? 0} registered`,
      icon: <Users className="w-6 h-6 text-purple-600" />,
      href: "/admin/users",
      badge: null,
    },
    {
      title: "AI Provider Config",
      subtitle: "Manage API keys & models",
      icon: <Settings className="w-6 h-6 text-amber-600" />,
      href: "/admin/control",
      badge: null,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-amber-500" />
        Quick Actions
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {actions.map((action, idx) => (
          <Link key={action.title} href={action.href}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group p-4 border border-slate-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-all cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-12 h-12 flex items-center justify-center bg-slate-50 group-hover:bg-white rounded-lg shadow-sm">
                  {action.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-slate-800 group-hover:text-emerald-700">
                    {action.title}
                  </h4>
                  <p className="text-sm text-slate-500 mt-0.5">{action.subtitle}</p>
                </div>
                {action.badge !== null && action.badge !== undefined && (
                  <span className="shrink-0 inline-flex items-center justify-center w-6 h-6 bg-emerald-600 text-white text-xs font-bold rounded-full">
                    {action.badge}
                  </span>
                )}
              </div>
            </motion.div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}
