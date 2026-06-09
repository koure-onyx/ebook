'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface TextHighlighterProps {
  topicId: string;
  userId: string;
  onSave?: (highlight: { text: string; color: string }) => void;
}

const HIGHLIGHT_COLORS = [
  { name: 'Yellow', value: '#FEF3C7' },
  { name: 'Green', value: '#D1FAE5' },
  { name: 'Blue', value: '#DBEAFE' },
  { name: 'Pink', value: '#FCE7F3' },
  { name: 'Purple', value: '#EDE9FE' },
];

export function TextHighlighter({ topicId, userId, onSave }: TextHighlighterProps) {
  const [selectedText, setSelectedText] = useState<string>('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(HIGHLIGHT_COLORS[0].value);
  const [isSaving, setIsSaving] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        setSelectedText('');
        setShowColorPicker(false);
        return;
      }

      const selected = selection.toString().trim();
      if (selected.length > 0 && selected.length < 500) {
        setSelectedText(selected);
        
        // Calculate position for color picker
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        setPickerPosition({
          top: rect.top - 50,
          left: rect.left + (rect.width / 2) - 100,
        });
      } else {
        setSelectedText('');
        setShowColorPicker(false);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, []);

  const handleSaveHighlight = async (color: string) => {
    setIsSaving(true);
    
    try {
      const res = await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          topicId,
          type: 'highlight',
          highlight: {
            text: selectedText,
            color,
          },
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save highlight');
      }

      onSave?.({ text: selectedText, color });
      setSelectedText('');
      setShowColorPicker(false);
      
      // Clear selection
      window.getSelection()?.removeAllRanges();
      
    } catch (err: any) {
      console.error('Failed to save highlight:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!selectedText) return null;

  return (
    <>
      {/* Color Picker Popup */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 10 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          top: Math.max(10, pickerPosition.top),
          left: Math.min(pickerPosition.left, window.innerWidth - 220),
        }}
        exit={{ opacity: 0, scale: 0.8, y: 10 }}
        className="fixed z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-3"
        style={{
          position: 'fixed',
          top: Math.max(10, pickerPosition.top),
          left: Math.min(pickerPosition.left, window.innerWidth - 220),
        }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Highlight color:
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {HIGHLIGHT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => handleSaveHighlight(color.value)}
              disabled={isSaving}
              className="w-8 h-8 rounded-lg border-2 border-gray-300 dark:border-gray-600 hover:scale-110 transition-transform duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              style={{ backgroundColor: color.value }}
              title={color.name}
              aria-label={`Highlight ${color.name}`}
            />
          ))}
        </div>

        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {selectedText.length} chars
          </span>
          <button
            onClick={() => {
              setSelectedText('');
              setShowColorPicker(false);
              window.getSelection()?.removeAllRanges();
            }}
            className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>

      {/* Selection Info Toast */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 px-4 py-2 rounded-full shadow-lg"
      >
        <p className="text-sm font-medium">
          Select a color to highlight "{selectedText.slice(0, 30)}{selectedText.length > 30 ? '...' : ''}"
        </p>
      </motion.div>
    </>
  );
}
