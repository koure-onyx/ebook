"use client";

import { Search, Filter } from "lucide-react";
import { useState, useMemo } from "react";

interface Book {
  _id: string;
  title: string;
  subject: string;
  board: string;
  grade: number;
  edition: string;
  chapters: number;
  topics: number;
  isDraft?: boolean;
}

interface BooksFilterBarProps {
  books: Book[];
  onFilterChange: (filters: FilterState) => void;
}

interface FilterState {
  board: string;
  grade: string;
  subject: string;
  search: string;
}

export function BooksFilterBar({ books, onFilterChange }: BooksFilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    board: "all",
    grade: "all",
    subject: "all",
    search: "",
  });

  // Derive unique filter options from books list
  const boards = useMemo(() => {
    const unique = Array.from(new Set(books.map((b) => b.board)));
    return ["all", ...unique];
  }, [books]);

  const grades = useMemo(() => {
    const unique = Array.from(new Set(books.map((b) => String(b.grade))));
    return ["all", ...unique];
  }, [books]);

  const subjects = useMemo(() => {
    const unique = Array.from(new Set(books.map((b) => b.subject)));
    return ["all", ...unique];
  }, [books]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="flex flex-col gap-4 mb-8">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-center">
        {/* Board Filter */}
        <div className="relative">
          <select
            value={filters.board}
            onChange={(e) => handleFilterChange("board", e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors"
          >
            {boards.map((board) => (
              <option key={String(board)} value={board}>
                {board === "all" ? "All Boards" : board}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Grade Filter */}
        <div className="relative">
          <select
            value={filters.grade}
            onChange={(e) => handleFilterChange("grade", e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors"
          >
            {grades.map((grade) => (
              <option key={String(grade)} value={grade}>
                {grade === "all" ? "All Grades" : `Grade ${grade}`}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Subject Filter */}
        <div className="relative">
          <select
            value={filters.subject}
            onChange={(e) => handleFilterChange("subject", e.target.value)}
            className="appearance-none bg-white border border-slate-200 rounded-lg pl-4 pr-10 py-2.5 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors"
          >
            {subjects.map((subject) => (
              <option key={String(subject)} value={subject}>
                {subject === "all" ? "All Subjects" : subject}
              </option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        </div>

        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search books..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-colors"
          />
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.board !== "all" ||
        filters.grade !== "all" ||
        filters.subject !== "all" ||
        filters.search) && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span>Active filters:</span>
          {filters.board !== "all" && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {filters.board}
            </span>
          )}
          {filters.grade !== "all" && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
              Grade {filters.grade}
            </span>
          )}
          {filters.subject !== "all" && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
              {filters.subject}
            </span>
          )}
          {filters.search && (
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-medium">
              "{filters.search}"
            </span>
          )}
          <button
            onClick={() => {
              const reset = { board: "all", grade: "all", subject: "all", search: "" };
              setFilters(reset);
              onFilterChange(reset);
            }}
            className="text-emerald-600 hover:text-emerald-700 font-medium text-xs underline"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
