'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';
import WaveformLoader from './WaveformLoader';
import StreamingText from './StreamingText';

// ============================================================================
// SPRING CONFIGURATIONS (from syntax-enforcer.md)
// ============================================================================
const springConfig = {
  cardSwipe: { stiffness: 150, damping: 10, mass: 1.2 },
  toastEntry: { stiffness: 300, damping: 25, mass: 0.8 },
  snappyButton: { stiffness: 400, damping: 20, mass: 0.5 },
};

// ============================================================================
// TYPES
// ============================================================================
interface AiExplanation {
  text: string;
  generated_at: string;
  model_used: string;
  is_approved: boolean;
}

interface PanelState {
  isOpen: boolean;
  isLoading: boolean;
  error: string | null;
  explanation: AiExplanation | null;
  provider: 'gemini' | 'openai';
  creditsRemaining: number;
}

interface AiCognitivePanelProps {
  topicId: string;
  userId: string;
  onClose?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function AiCognitivePanel({ topicId, userId, onClose }: AiCognitivePanelProps) {
  const [state, setState] = useState<PanelState>({
    isOpen: false,
    isLoading: false,
    error: null,
    explanation: null,
    provider: 'gemini',
    creditsRemaining: 5,
  });

  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  // Motion values for drag gestures
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0]);
  const springY = useSpring(y, springConfig.cardSwipe);

  // Swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedDown: () => handleClose(),
    preventScrollOnSwipe: true,
    delta: 10,
  });

  // Fetch AI explanation
  const fetchExplanation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    setStreamedText('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topicId, userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate explanation');
      }

      const data = await response.json();

      // Update provider and credits
      setState(prev => ({
        ...prev,
        provider: data.provider || 'gemini',
        creditsRemaining: data.creditsRemaining ?? prev.creditsRemaining,
      }));

      // Handle cached response
      if (data.isCached && data.explanation) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          explanation: data.explanation,
        }));
        setStreamedText(data.explanation.text);
        setIsStreaming(false);
        return;
      }

      // Stream new response
      if (data.streamUrl) {
        await streamResponse(data.streamUrl);
      } else if (data.explanation) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          explanation: data.explanation,
        }));
        setStreamedText(data.explanation.text);
        setIsStreaming(false);
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'An error occurred',
      }));
      setIsStreaming(false);
    }
  }, [topicId, userId]);

  // Stream response character by character
  const streamResponse = async (streamUrl: string) => {
    try {
      const response = await fetch(streamUrl);
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      let accumulatedText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        accumulatedText += chunk;
        setStreamedText(accumulatedText);
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        explanation: {
          text: accumulatedText,
          generated_at: new Date().toISOString(),
          model_used: prev.provider,
          is_approved: false,
        },
      }));
      setIsStreaming(false);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Streaming failed',
      }));
      setIsStreaming(false);
    }
  };

  const handleOpen = () => {
    setState(prev => ({ ...prev, isOpen: true }));
    if (!state.explanation && !state.isLoading) {
      fetchExplanation();
    }
  };

  const handleClose = () => {
    setState(prev => ({ ...prev, isOpen: false }));
    y.set(0);
    onClose?.();
  };

  const handleRetry = () => {
    fetchExplanation();
  };

  // Provider-specific gradient themes
  const getProviderTheme = () => {
    if (state.provider === 'openai') {
      return {
        gradient: 'from-emerald-500/20 to-teal-600/20',
        accent: 'text-emerald-400',
        border: 'border-emerald-500/30',
        waveform: '#10b981',
      };
    }
    // Default: Gemini
    return {
      gradient: 'from-violet-500/20 to-indigo-600/20',
      accent: 'text-violet-400',
      border: 'border-violet-500/30',
      waveform: '#8b5cf6',
    };
  };

  const theme = getProviderTheme();

  return (
    <>
      {/* Trigger Button */}
      <motion.button
        onClick={handleOpen}
        className="fixed bottom-24 right-6 z-40 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-white shadow-lg hover:shadow-xl"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={springConfig.snappyButton}
        style={{
          boxShadow: '0 4px 20px hsla(270, 90%, 60%, 0.4)',
          textShadow: '0 1px 2px hsla(0, 0%, 0%, 0.3)',
        }}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="font-semibold">Explain</span>
        {state.creditsRemaining !== null && (
          <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
            {state.creditsRemaining}
          </span>
        )}
      </motion.button>

      {/* Bottom Overlay Panel */}
      <AnimatePresence>
        {state.isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={springConfig.toastEntry}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Panel */}
            <motion.div
              {...swipeHandlers}
              style={{ y: springY, opacity }}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={springConfig.cardSwipe}
              className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-h-[85vh] w-full overflow-hidden rounded-t-3xl sm:max-w-2xl"
            >
              {/* Panel Content */}
              <div className={`relative flex h-full flex-col bg-card backdrop-blur-xl`}>
                {/* Drag Handle */}
                <div className="flex items-center justify-center py-4">
                  <motion.div
                    className="h-1.5 w-12 rounded-full bg-accent"
                    whileHover={{ scale: 1.1 }}
                    transition={springConfig.snappyButton}
                  />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 pb-4">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-text-primary">AI Explanation</h2>
                    
                    {/* Provider Badge */}
                    <div className="group relative">
                      <motion.div
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${theme.accent} ${theme.border} bg-secondary/10`}
                        whileHover={{ scale: 1.05 }}
                        transition={springConfig.snappyButton}
                      >
                        <span className={`h-2 w-2 rounded-full ${state.provider === 'openai' ? 'bg-emerald-400' : 'bg-violet-400'}`} />
                        {state.provider === 'openai' ? 'OpenAI' : 'Gemini'}
                      </motion.div>
                      
                      {/* Tooltip */}
                      <div className="absolute -top-10 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100">
                        Active AI Provider
                      </div>
                    </div>
                  </div>

                  <motion.button
                    onClick={handleClose}
                    className="rounded-full p-2 text-text-muted hover:bg-accent hover:text-text-primary"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={springConfig.snappyButton}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {/* Loading State */}
                  {state.isLoading && (
                    <div className="flex flex-col items-center justify-center py-12">
                      <WaveformLoader color={theme.waveform} />
                      <p className="mt-6 text-center text-sm text-text-muted">
                        {state.provider === 'openai' ? 'OpenAI is thinking...' : 'Gemini is analyzing...'}
                      </p>
                      <p className="mt-2 text-center text-xs text-text-muted/70">
                        This usually takes 5-10 seconds
                      </p>
                    </div>
                  )}

                  {/* Error State */}
                  {state.error && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={springConfig.toastEntry}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center"
                    >
                      <svg className="mx-auto mb-3 h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="mb-4 font-medium text-red-300">{state.error}</p>
                      <motion.button
                        onClick={handleRetry}
                        className="rounded-full bg-red-500/20 px-6 py-2 text-sm font-semibold text-red-300 hover:bg-red-500/30"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={springConfig.snappyButton}
                      >
                        Try Again
                      </motion.button>
                    </motion.div>
                  )}

                  {/* Success State - Streaming or Complete */}
                  {(streamedText || state.explanation) && !state.isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="prose prose-invert max-w-none"
                    >
                      <div
                        className="rounded-xl border bg-secondary p-6 backdrop-blur-sm"
                      >
                        <StreamingText
                          text={streamedText || state.explanation?.text || ''}
                          isStreaming={isStreaming}
                          cursorColor={theme.waveform}
                        />
                      </div>

                      {/* Credits Info */}
                      {!isStreaming && state.creditsRemaining !== null && (
                        <motion.p
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5 }}
                          className="mt-4 text-center text-xs text-text-muted/70"
                        >
                          {state.creditsRemaining} credits remaining today
                        </motion.p>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Footer Actions */}
                {!state.isLoading && !state.error && streamedText && (
                  <div className="border-t px-6 py-4">
                    <div className="flex gap-3">
                      <motion.button
                        className="flex-1 rounded-xl border bg-secondary/10 py-3 text-sm font-semibold text-text-primary hover:bg-secondary/20"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={springConfig.snappyButton}
                      >
                        Copy to Notes
                      </motion.button>
                      <motion.button
                        className="flex-1 rounded-xl bg-primary py-3 text-sm font-semibold text-white hover:shadow-lg"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={springConfig.snappyButton}
                        style={{ boxShadow: '0 4px 15px hsla(270, 90%, 60%, 0.3)' }}
                      >
                        Generate Quiz
                      </motion.button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
