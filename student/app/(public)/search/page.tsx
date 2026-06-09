"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search as SearchIcon, Flame, BookOpen, Zap, Globe2, Calculator, Languages, Microscope } from "lucide-react";
import SearchInput from "@/components/search/SearchInput";
import SearchResultRow from "@/components/search/SearchResultRow";
import HotTopicsChips from "@/components/search/HotTopicsChips";

interface Topic {
  _id: string;
  title: string;
  slug: string;
  exam_frequency_count?: number;
  readingTime?: number;
  chapter: {
    _id: string;
    title: string;
    slug: string;
    book: {
      _id: string;
      title: string;
      subject: string;
      grade: number;
      board: string;
    };
  };
}

interface Chapter {
  _id: string;
  title: string;
  slug: string;
  book: {
    _id: string;
    title: string;
    subject: string;
    grade: number;
    board: string;
  };
}

interface Subject {
  _id: string;
  name: string;
  slug: string;
  topicCount: number;
  icon?: string;
}

type SearchResult = 
  | { type: "topic"; data: Topic }
  | { type: "chapter"; data: Chapter }
  | { type: "subject"; data: Subject };

type ResultTypeFilter = "all" | "topic" | "chapter" | "subject";

const SUBJECT_ICONS: Record<string, any> = {
  Physics: Zap,
  Chemistry: Microscope,
  Biology: Microscope,
  English: Languages,
  "Pakistan Studies": Globe2,
  Mathematics: Calculator,
};

const DEFAULT_SUBJECTS: Omit<Subject, "_id">[] = [
  { name: "Physics", slug: "physics", topicCount: 92 },
  { name: "Chemistry", slug: "chemistry", topicCount: 78 },
  { name: "Biology", slug: "biology", topicCount: 85 },
  { name: "English", slug: "english", topicCount: 64 },
  { name: "Pakistan Studies", slug: "pakistan-studies", topicCount: 45 },
  { name: "Mathematics", slug: "mathematics", topicCount: 102 },
];

// Mock hot topics - replace with API call
const MOCK_HOT_TOPICS: Topic[] = [
  { _id: "1", title: "Vernier Callipers", slug: "vernier-callipers", exam_frequency_count: 4, readingTime: 4, chapter: { _id: "c1", title: "Physical Quantities", slug: "physical-quantities", book: { _id: "b1", title: "Physics Grade 9", subject: "Physics", grade: 9, board: "Punjab" } } },
  { _id: "2", title: "Newton's Laws", slug: "newtons-laws", exam_frequency_count: 5, readingTime: 6, chapter: { _id: "c2", title: "Dynamics", slug: "dynamics", book: { _id: "b1", title: "Physics Grade 9", subject: "Physics", grade: 9, board: "Punjab" } } },
  { _id: "3", title: "Photosynthesis", slug: "photosynthesis", exam_frequency_count: 4, readingTime: 5, chapter: { _id: "c3", title: "Bioenergetics", slug: "bioenergetics", book: { _id: "b2", title: "Biology Grade 9", subject: "Biology", grade: 9, board: "Punjab" } } },
  { _id: "4", title: "Mughal Empire", slug: "mughal-empire", exam_frequency_count: 3, readingTime: 7, chapter: { _id: "c4", title: "The Mughals", slug: "the-mughals", book: { _id: "b3", title: "Pakistan Studies", subject: "Pakistan Studies", grade: 9, board: "Punjab" } } },
  { _id: "5", title: "Quadratic Equations", slug: "quadratic-equations", exam_frequency_count: 5, readingTime: 5, chapter: { _id: "c5", title: "Algebra", slug: "algebra", book: { _id: "b4", title: "Mathematics Grade 9", subject: "Mathematics", grade: 9, board: "Punjab" } } },
  { _id: "6", title: "Chemical Bonding", slug: "chemical-bonding", exam_frequency_count: 4, readingTime: 6, chapter: { _id: "c6", title: "Structure of Molecules", slug: "structure-of-molecules", book: { _id: "b5", title: "Chemistry Grade 9", subject: "Chemistry", grade: 9, board: "Punjab" } } },
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [typeFilter, setTypeFilter] = useState<ResultTypeFilter>("all");
  const [boardFilter, setBoardFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("studyvault_recent_searches");
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Save recent search
  const saveRecentSearch = useCallback((searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setRecentSearches(prev => {
      const updated = [searchTerm, ...prev.filter(s => s !== searchTerm)].slice(0, 5);
      localStorage.setItem("studyvault_recent_searches", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Fetch search results
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=${typeFilter}&board=${boardFilter}`);
      // const data = await response.json();
      
      // Mock search implementation
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const mockResults: SearchResult[] = MOCK_HOT_TOPICS
        .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(t => ({ type: "topic" as const, data: t }));
      
      setResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter, boardFilter]);

  const handleSelectRecent = useCallback((searchTerm: string) => {
    setQuery(searchTerm);
    saveRecentSearch(searchTerm);
    performSearch(searchTerm);
  }, [saveRecentSearch, performSearch]);

  const handleClear = useCallback(() => {
    setQuery("");
    setResults([]);
  }, []);

  const handleHotTopicSelect = useCallback((topicTitle: string) => {
    setQuery(topicTitle);
    saveRecentSearch(topicTitle);
    performSearch(topicTitle);
  }, [saveRecentSearch, performSearch]);

  // Filter results by type
  const filteredResults = useMemo(() => {
    if (typeFilter === "all") return results;
    return results.filter(r => r.type === typeFilter);
  }, [results, typeFilter]);

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: {
      topics: SearchResult[];
      chapters: SearchResult[];
      subjects: SearchResult[];
    } = { topics: [], chapters: [], subjects: [] };

    filteredResults.forEach(result => {
      if (result.type === "topic") groups.topics.push(result);
      else if (result.type === "chapter") groups.chapters.push(result);
      else if (result.type === "subject") groups.subjects.push(result);
    });

    return groups;
  }, [filteredResults]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide mb-2">
            BROWSE TOPICS
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
            Search StudyVault
          </h1>
          <p className="text-slate-600 text-lg">
            Find topics, chapters, and subjects across your board.
          </p>
        </motion.div>

        {/* Search Input */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <SearchInput
            value={query}
            onChange={setQuery}
            onClear={handleClear}
            onSubmit={performSearch}
            recentSearches={recentSearches}
            onSelectRecent={handleSelectRecent}
          />
        </motion.div>

        {/* Default State - No Query */}
        {!query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-12"
          >
            {/* Hot Topics */}
            <HotTopicsChips
              topics={MOCK_HOT_TOPICS}
              onSelect={handleHotTopicSelect}
            />

            {/* Browse by Subject */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">Browse by Subject</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {DEFAULT_SUBJECTS.map((subject, idx) => {
                  const IconComponent = SUBJECT_ICONS[subject.name] || BookOpen;
                  return (
                    <motion.button
                      key={subject.slug}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleHotTopicSelect(subject.name)}
                      className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-sm transition-all text-left group"
                    >
                      <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                        <IconComponent className="h-6 w-6 text-emerald-700" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {subject.name}
                        </h3>
                        <p className="text-sm text-slate-500">{subject.topicCount} topics</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Results State */}
        {query && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1">
                {(["all", "topic", "chapter", "subject"] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                      typeFilter === type
                        ? "bg-emerald-100 text-emerald-700"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {type === "all" ? "All" : type.charAt(0).toUpperCase() + type.slice(1)}s
                  </button>
                ))}
              </div>

              <select
                value={boardFilter}
                onChange={(e) => setBoardFilter(e.target.value)}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Boards</option>
                <option value="punjab">Punjab</option>
                <option value="fbiise">FBISE</option>
                <option value="karachi">Karachi</option>
                <option value="sindh">Sindh</option>
              </select>

              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="px-3 py-1.5 text-sm font-medium bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">All Grades</option>
                <option value="9">Grade 9</option>
                <option value="10">Grade 10</option>
              </select>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse flex items-start gap-4 p-4 bg-white border border-slate-100 rounded-xl">
                    <div className="w-16 h-6 bg-slate-200 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 bg-slate-200 rounded w-3/4" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!isLoading && filteredResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 rounded-full mb-6">
                  <SearchIcon className="h-10 w-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  No results for &quot;{query}&quot;
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Try searching for a chapter name, subject, or topic keyword.
                </p>
                
                {/* Fallback: Show Hot Topics */}
                <div className="max-w-2xl mx-auto">
                  <HotTopicsChips
                    topics={MOCK_HOT_TOPICS}
                    onSelect={handleHotTopicSelect}
                  />
                </div>
              </motion.div>
            )}

            {/* Results List */}
            {!isLoading && filteredResults.length > 0 && (
              <div className="space-y-6">
                <p className="text-sm font-medium text-slate-500">
                  {filteredResults.length} result{filteredResults.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                </p>

                {/* Topics Section */}
                {groupedResults.topics.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Topics ({groupedResults.topics.length})
                    </h3>
                    <AnimatePresence>
                      {groupedResults.topics.map((result, idx) => (
                        <motion.div
                          key={(result.data as Topic)._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <SearchResultRow result={result} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Chapters Section */}
                {groupedResults.chapters.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Chapters ({groupedResults.chapters.length})
                    </h3>
                    <AnimatePresence>
                      {groupedResults.chapters.map((result, idx) => (
                        <motion.div
                          key={(result.data as Chapter)._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <SearchResultRow result={result} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}

                {/* Subjects Section */}
                {groupedResults.subjects.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
                      Subjects ({groupedResults.subjects.length})
                    </h3>
                    <AnimatePresence>
                      {groupedResults.subjects.map((result, idx) => (
                        <motion.div
                          key={(result.data as Subject)._id}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                        >
                          <SearchResultRow result={result} />
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
