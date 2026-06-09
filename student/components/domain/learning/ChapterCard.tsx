'use client';

import React, { useState, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ChevronRight, Lock, CheckCircle } from 'lucide-react';
import Card from '../ui/Card';
import ProgressBar from '../ui/ProgressBar';

/**
 * SPRING PRESETS (from syntax-enforcer.md)
 */
const tapSpring = { stiffness: 400, damping: 15, mass: 0.8 };
const cardSpring = { stiffness: 100, damping: 15, mass: 1.0 };

interface ChapterCardProps {
  chapter: {
    id: string;
    number: number;
    title: string;
    totalTopics?: number;
    completedTopics?: number;
    isLocked?: boolean;
    content?: React.ReactNode;
  };
  onClick?: () => void;
  showProgress?: boolean;
  bookId: string;
}

const ChapterCard: React.FC<ChapterCardProps> = ({
  chapter,
  onClick,
  showProgress = false,
  bookId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const progress = chapter.totalTopics && chapter.completedTopics !== undefined
    ? (chapter.completedTopics / chapter.totalTopics) * 100
    : 0;

  const isComplete = progress === 100;

  const handleTapStart = useCallback(() => {
    if (!chapter.isLocked) {
      controls.start({ scale: 0.98, transition: { duration: 0.1 } });
    }
  }, [controls, chapter.isLocked]);

  const handleTapEnd = useCallback(() => {
    if (!chapter.isLocked) {
      controls.start({ scale: 1, transition: tapSpring });
      
      if (onClick) {
        if (isMobile && chapter.content) {
          setIsExpanded(true);
        } else {
          onClick();
        }
      }
    }
  }, [controls, onClick, chapter.isLocked, chapter.content, isMobile]);

  const handleCloseSheet = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const cardContent = (
    <motion.div
      initial={false}
      animate={controls}
      onHoverStart={!chapter.isLocked ? handleTapStart : undefined}
      onHoverEnd={!chapter.isLocked ? () => controls.start({ scale: 1 }) : undefined}
      onTouchStart={!chapter.isLocked ? handleTapStart : undefined}
      onTouchEnd={!chapter.isLocked ? handleTapEnd : undefined}
      whileTap={!chapter.isLocked ? { scale: 0.95 } : undefined}
      className="w-full mb-3"
    >
      <Card
        variant="outlined"
        className="w-full"
        role="article"
        aria-label={`Chapter ${chapter.number}: ${chapter.title}`}
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: chapter.isLocked
            ? 'var(--color-border)'
            : isComplete
              ? 'var(--color-success)'
              : 'var(--color-primary)',
          paddingLeft: 'var(--space-4)',
          paddingVertical: 'var(--space-3)',
          cursor: chapter.isLocked ? 'not-allowed' : 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Chapter Number Badge */}
          <div
            className="flex-shrink-0 flex items-center justify-center rounded-lg"
            style={{
              width: '48px',
              height: '48px',
              backgroundColor: chapter.isLocked
                ? 'var(--color-bg-tertiary)'
                : isComplete
                  ? 'var(--color-success)'
                  : 'var(--color-primary)',
              color: chapter.isLocked
                ? 'var(--color-text-muted)'
                : 'var(--color-text-inverse)',
            }}
            aria-hidden="true"
          >
            {chapter.isLocked ? (
              <Lock size={20} strokeWidth={1.5} />
            ) : isComplete ? (
              <CheckCircle size={20} strokeWidth={1.5} />
            ) : (
              <span
                className="text-lg font-semibold"
                style={{
                  fontSize: 'var(--text-lg)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {chapter.number}
              </span>
            )}
          </div>

          {/* Chapter Info */}
          <div className="flex-1 min-w-0">
            <h3
              className="text-base font-semibold text-text-primary truncate"
              style={{
                fontSize: 'var(--text-base)',
                fontWeight: 'var(--font-weight-semibold)',
              }}
            >
              {chapter.title}
            </h3>

            {chapter.totalTopics !== undefined && !chapter.isLocked && (
              <p
                className="text-xs text-text-muted mt-1"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {chapter.completedTopics || 0} of {chapter.totalTopics} topics
              </p>
            )}

            {/* Progress Bar */}
            {showProgress && !chapter.isLocked && progress > 0 && (
              <div className="mt-2">
                <ProgressBar
                  value={progress}
                  max={100}
                  showPercentage={false}
                  aria-label={`Progress: ${Math.round(progress)}%`}
                />
              </div>
            )}
          </div>

          {/* Navigation Arrow */}
          {!chapter.isLocked && (
            <motion.div
              animate={isMobile && chapter.content ? { x: isExpanded ? 4 : 0 } : {}}
              transition={cardSpring}
            >
              <ChevronRight
                size={20}
                stroke="var(--color-text-secondary)"
                strokeWidth={1.5}
                aria-hidden="true"
              />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  // Mobile: Use bottom sheet for expansion to prevent stuck UI states
  if (isMobile && chapter.content) {
    return (
      <>
        <div onClick={() => setIsExpanded(true)}>{cardContent}</div>
        {isExpanded && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" onClick={handleCloseSheet}>
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={cardSpring}
              className="absolute bottom-0 left-0 right-0 h-[75vh] bg-card rounded-t-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-text-primary">
                    Chapter {chapter.number}: {chapter.title}
                  </h3>
                  {isComplete && (
                    <CheckCircle size={24} stroke="var(--color-success)" />
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {chapter.content}
                </div>

                {onClick && (
                  <div className="mt-4 pt-4 border-t">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      transition={tapSpring}
                      onClick={() => {
                        handleCloseSheet();
                        onClick();
                      }}
                      className="w-full py-3 px-4 bg-primary text-text-inverse rounded-lg font-medium"
                      style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'var(--color-text-inverse)',
                      }}
                    >
                      Start Chapter
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </>
    );
  }

  // Desktop: Standard card with onClick
  return (
    <div onClick={!chapter.isLocked ? onClick : undefined}>
      {cardContent}
    </div>
  );
};

export default ChapterCard;
