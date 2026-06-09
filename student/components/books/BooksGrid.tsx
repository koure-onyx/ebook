"use client";

import { motion } from "framer-motion";
import { BookOpen, Search } from "lucide-react";
import { useState } from "react";
import { BooksFilterBar } from "./BooksFilterBar";
import { BookCard } from "./BookCard";

interface Book {
  _id: string;
  title: string;
  subject: string;
  subject_slug?: string;
  slug?: string;
  board: string;
  board_short_code?: string;
  board_slug?: string;
  program_slug?: string;
  grade: number;
  edition: string;
  chapters: number;
  topics: number;
  isDraft?: boolean;
  progress?: {
    topicsRead: number;
    percentage: number;
  };
}

interface BooksGridProps {
  books: Book[];
}

interface FilterState {
  board: string;
  grade: string;
  subject: string;
  search: string;
}

export function BooksGrid({ books }: BooksGridProps) {
  const [filters, setFilters] = useState<FilterState>({
    board: "all",
    grade: "all",
    subject: "all",
    search: "",
  });

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  // Client-side filtering logic
  const filteredBooks = books.filter((book) => {
    const matchesBoard =
      filters.board === "all" || book.board === filters.board;
    const matchesGrade =
      filters.grade === "all" || book.grade.toString() === filters.grade;
    const matchesSubject =
      filters.subject === "all" ||
      book.subject.toLowerCase() === filters.subject.toLowerCase();
    const matchesSearch =
      filters.search === "" ||
      book.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      book.subject.toLowerCase().includes(filters.search.toLowerCase());

    return matchesBoard && matchesGrade && matchesSubject && matchesSearch;
  });

  return (
    <div>
      {/* Filter Bar */}
      <BooksFilterBar books={books} onFilterChange={handleFilterChange} />

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.05,
              },
            },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredBooks.map((book) => (
            <BookCard key={book._id} book={book} />
          ))}
        </motion.div>
      ) : (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center py-16"
        >
          {/* Illustration */}
          <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-slate-300" />
          </div>

          {/* Messages */}
          <h3 className="text-xl font-semibold text-slate-800 mb-2">
            No books match your filters.
          </h3>
          <p className="text-slate-500 mb-6 max-w-md mx-auto">
            Try a different board or grade, or clear filters to see all available
            books.
          </p>

          {/* Clear Filters Button */}
          <button
            onClick={() => {
              setFilters({ board: "all", grade: "all", subject: "all", search: "" });
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Clear Filters
          </button>
        </motion.div>
      )}
    </div>
  );
}
