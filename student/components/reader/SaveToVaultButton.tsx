"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Archive, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SaveToVaultButtonProps {
  topicId: string;
  topicTitle: string;
  initialSaved?: boolean;
}

export default function SaveToVaultButton({ topicId, topicTitle, initialSaved = false }: SaveToVaultButtonProps) {
  const [isSaved, setIsSaved] = useState(initialSaved);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "bookmark",
          topicId,
          title: topicTitle,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");
      
      setIsSaved(!isSaved);
    } catch (err) {
      console.error(err);
      alert("Failed to save to vault. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isLoading}
      variant={isSaved ? "outline" : "default"}
      className={`w-full justify-start gap-2 ${
        isSaved ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""
      }`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <Check className="h-4 w-4" />
      ) : (
        <Archive className="h-4 w-4" />
      )}
      {isSaved ? "Saved" : "Save to Vault"}
    </Button>
  );
}
