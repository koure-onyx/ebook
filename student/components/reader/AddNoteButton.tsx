"use client";

import { useState } from "react";
import { Pencil, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface AddNoteButtonProps {
  topicId: string;
  topicTitle: string;
}

export default function AddNoteButton({ topicId, topicTitle }: AddNoteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch("/api/vault", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "note",
          topicId,
          title: topicTitle,
          content: note,
        }),
      });

      if (!response.ok) throw new Error("Failed to save note");

      setNote("");
      setIsOpen(false);
      alert("Note saved to vault!");
    } catch (err) {
      console.error(err);
      alert("Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        variant="outline"
        className="w-full justify-start gap-2"
      >
        <Pencil className="h-4 w-4" />
        Add Note
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-700">Add a note</span>
        <button
          onClick={() => setIsOpen(false)}
          className="rounded p-1 text-slate-400 hover:bg-slate-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <form onSubmit={handleSubmit}>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Write your notes here..."
          className="mb-2 w-full rounded-lg border border-slate-200 p-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          rows={3}
        />
        <Button type="submit" disabled={isLoading || !note.trim()} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Note"
          )}
        </Button>
      </form>
    </div>
  );
}
