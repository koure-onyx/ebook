"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AIExplainPanelProps {
  isOpen: boolean;
  onClose: () => void;
  topicId: string;
  topicTitle: string;
}

export default function AIExplainPanel({ isOpen, onClose, topicId, topicTitle }: AIExplainPanelProps) {
  const [explanation, setExplanation] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExplain = async () => {
    setIsLoading(true);
    setError(null);
    setExplanation("");

    try {
      const response = await fetch("/api/ai/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, topicTitle }),
      });

      if (!response.ok) throw new Error("Failed to get explanation");
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        setExplanation((prev) => prev + chunk);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        />
      )}

      {/* Slide-out Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-2xl"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" aria-hidden="true" />
              AI Explain
            </h2>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {!explanation && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Sparkles className="mb-4 h-12 w-12 text-emerald-600" />
                <h3 className="mb-2 text-lg font-medium text-slate-900">
                  Get a simple explanation
                </h3>
                <p className="mb-6 text-sm text-slate-500">
                  Our AI will break down this topic into easy-to-understand concepts.
                </p>
                <Button onClick={handleExplain} disabled={isLoading}>
                  {isLoading ? "Generating..." : "Explain This Topic"}
                </Button>
              </div>
            )}

            {isLoading && (
              <div className="space-y-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-200" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-slate-200" />
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
                <Button onClick={handleExplain} variant="outline" className="mt-3">
                  Try Again
                </Button>
              </div>
            )}

            {explanation && (
              <div className="prose prose-slate max-w-none">
                <div className="whitespace-pre-wrap text-base leading-relaxed text-slate-700">
                  {explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}
