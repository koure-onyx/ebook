"use client";

import { Search, X, Clock } from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onSubmit: (query: string) => void;
  recentSearches: string[];
  onSelectRecent: (query: string) => void;
}

export default function SearchInput({
  value,
  onChange,
  onClear,
  onSubmit,
  recentSearches,
  onSelectRecent,
}: SearchInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [debouncedValue, setDebouncedValue] = useState(value);

  // Debounce logic
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
      if (value.trim()) {
        onSubmit(value);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [value, onSubmit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectRecent = (query: string) => {
    onSelectRecent(query);
    setIsFocused(false);
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
        </div>
        
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          placeholder="e.g. Kinematics, Photosynthesis, Mughal Empire..."
          className="w-full h-14 pl-14 pr-12 bg-white border border-slate-200 rounded-2xl shadow-sm text-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          autoFocus
        />

        <AnimatePresence>
          {value && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear search"
            >
              <X className="h-5 w-5" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Recent Searches Dropdown */}
      <AnimatePresence>
        {isFocused && !value && recentSearches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-20"
          >
            <div className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wide">
              Recent Searches
            </div>
            {recentSearches.map((search, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectRecent(search)}
                className="w-full text-left px-4 py-2.5 text-slate-700 hover:bg-slate-50 flex items-center gap-3 transition-colors"
              >
                <Clock className="h-4 w-4 text-slate-400" />
                <span>{search}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
