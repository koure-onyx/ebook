"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface MarkAsReadButtonProps {
  topicId: string;
  xpReward?: number;
}

export default function MarkAsReadButton({ topicId, xpReward = 10 }: MarkAsReadButtonProps) {
  const [isRead, setIsRead] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showXPPop, setShowXPPop] = useState(false);

  const handleMarkRead = async () => {
    if (isRead) return;
    
    setIsLoading(true);
    
    // Optimistic update
    setIsRead(true);
    setShowXPPop(true);
    setTimeout(() => setShowXPPop(false), 1500);

    try {
      const response = await fetch("/api/progress/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark as read");
      }
    } catch (err) {
      // Revert on error
      setIsRead(false);
      console.error(err);
      alert("Failed to mark as read. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <Button
        onClick={handleMarkRead}
        disabled={isLoading || isRead}
        className={`w-full gap-2 ${
          isRead
            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isRead ? (
          <>
            <Check className="h-4 w-4" />
            Read — +{xpReward} XP earned
          </>
        ) : (
          <>
            <Check className="h-4 w-4" />
            Mark as Read
          </>
        )}
      </Button>

      {/* XP Animation Pop */}
      <AnimatePresence>
        {showXPPop && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: [0.5, 1.2, 1, 0.8],
              y: [0, -20, -30, -40],
            }}
            transition={{ duration: 1.2, times: [0, 0.2, 0.6, 1] }}
            className="absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-amber-400 px-3 py-1 text-sm font-bold text-amber-900 shadow-lg"
          >
            +{xpReward} XP
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}
