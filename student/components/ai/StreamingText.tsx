'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  isStreaming?: boolean;
  cursorColor?: string;
  speed?: number; // Characters per second
}

export default function StreamingText({
  text,
  isStreaming = false,
  cursorColor = '#8b5cf6',
  speed = 30,
}: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as text streams
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText]);

  // Stream text character by character
  useEffect(() => {
    if (!isStreaming || currentIndex >= text.length) {
      setDisplayedText(text);
      return;
    }

    const intervalMs = 1000 / speed;
    const timer = setTimeout(() => {
      setDisplayedText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, intervalMs);

    return () => clearTimeout(timer);
  }, [text, currentIndex, isStreaming, speed]);

  // Reset when text changes
  useEffect(() => {
    if (text !== displayedText && !isStreaming) {
      setDisplayedText(text);
      setCurrentIndex(text.length);
    }
  }, [text, isStreaming]);

  // Simple markdown-like formatting
  const formatText = (input: string) => {
    const lines = input.split('\n');
    return lines.map((line, index) => {
      // Bold text (**text**)
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      // Italic text (*text*)
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');
      
      // Headings (# Heading)
      if (line.startsWith('### ')) {
        return (
          <h3 key={index} className="mb-2 mt-4 text-lg font-bold text-white">
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <h2 key={index} className="mb-2 mt-4 text-xl font-bold text-white">
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith('# ')) {
        return (
          <h1 key={index} className="mb-2 mt-4 text-2xl font-bold text-white">
            {line.slice(2)}
          </h1>
        );
      }

      // Empty line
      if (line.trim() === '') {
        return <div key={index} className="h-4" />;
      }

      // Regular paragraph
      return (
        <p
          key={index}
          className="mb-3 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div
      ref={containerRef}
      className="max-h-[60vh] overflow-y-auto pr-2"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: 'hsla(0, 0%, 100%, 0.2) transparent',
      }}
    >
      <div className="font-mono text-sm text-white/90 sm:text-base">
        {formatText(displayedText)}
        
        {/* Blinking Cursor */}
        {isStreaming && (
          <motion.span
            className="inline-block w-0.5 h-5 align-middle ml-0.5"
            style={{ backgroundColor: cursorColor }}
            animate={{ opacity: [1, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        )}
      </div>

      {/* Streaming Indicator */}
      {isStreaming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 flex items-center gap-2 text-xs text-white/50"
        >
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-white/50"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span>Generating response...</span>
        </motion.div>
      )}
    </div>
  );
}
