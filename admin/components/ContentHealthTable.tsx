"use client";

import { motion } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Send } from "lucide-react";
import { useState } from "react";

interface ContentHealthTableProps {
  books: {
    _id: string;
    title: string;
    chaptersCount: number;
    topicsCount: number;
    liveTopicsCount: number;
    pendingTopicsCount: number;
    lastUpdated: string;
    status: "live" | "partial" | "error";
  }[];
}

export default function ContentHealthTable({ books }: ContentHealthTableProps) {
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublishAll = async () => {
    setIsPublishing(true);
    try {
      await fetch("/api/admin/publish-pending", { method: "POST" });
      window.location.reload();
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-emerald-50 text-emerald-700";
      case "partial":
        return "bg-amber-50 text-amber-700";
      case "error":
        return "bg-red-50 text-red-700";
      default:
        return "bg-slate-50 text-slate-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "live":
        return <CheckCircle2 className="w-4 h-4" />;
      case "partial":
        return <AlertTriangle className="w-4 h-4" />;
      case "error":
        return <XCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          📋 Content Health
        </h3>
        <button
          onClick={handlePublishAll}
          disabled={isPublishing}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Send className="w-4 h-4" />
          {isPublishing ? "Publishing..." : "Publish All Approved →"}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Book</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Chapters</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Topics</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Live%</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Pending</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-slate-600">Last Updated</th>
              <th className="text-center py-3 px-4 text-sm font-semibold text-slate-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => {
              const livePercent = Math.round((book.liveTopicsCount / book.topicsCount) * 100);
              return (
                <tr
                  key={book._id}
                  className={`border-b border-slate-100 hover:bg-slate-50 transition-colors ${getStatusColor(book.status)}`}
                >
                  <td className="py-3 px-4">
                    <span className="font-medium">{book.title}</span>
                  </td>
                  <td className="py-3 px-4 text-center">{book.chaptersCount}</td>
                  <td className="py-3 px-4 text-center">{book.topicsCount}</td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-bold">{livePercent}%</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    {book.pendingTopicsCount > 0 ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {book.pendingTopicsCount}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {new Date(book.lastUpdated).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {getStatusIcon(book.status)}
                      <span className="text-xs font-medium capitalize">{book.status}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
