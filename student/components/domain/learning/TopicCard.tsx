'use client';

import React, { useState, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import Card from '../ui/Card';

/**
 * SPRING PRESETS (from syntax-enforcer.md)
 */
const tapSpring = { stiffness: 400, damping: 15, mass: 0.8 };
const cardSpring = { stiffness: 100, damping: 15, mass: 1.0 };

interface TopicCardProps {
  topic: {
    id: string;
    number: number;
    title: string;
    duration?: string;
    isCompleted?: boolean;
    isLocked?: boolean;
    isActive?: boolean;
    content?: React.ReactNode;
  };
  onClick?: () => void;
  showProgress?: boolean;
  chapterId: string;
}

const TopicCard: React.FC<TopicCardProps> = ({
  topic,
  onClick,
  showProgress = false,
  chapterId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const controls = useAnimation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const handleTapStart = useCallback(() => {
    if (!topic.isLocked) {
      controls.start({ scale: 0.98, transition: { duration: 0.1 } });
    }
  }, [controls, topic.isLocked]);

  const handleTapEnd = useCallback(() => {
    if (!topic.isLocked) {
      controls.start({ scale: 1, transition: tapSpring });
      
      if (onClick) {
        if (isMobile && topic.content) {
          setIsExpanded(true);
        } else {
          onClick();
        }
      }
    }
  }, [controls, onClick, topic.isLocked, topic.content, isMobile]);

  const handleCloseSheet = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const cardContent = (
    <motion.div
      initial={false}
      animate={controls}
      onHoverStart={!topic.isLocked ? handleTapStart : undefined}
      onHoverEnd={!topic.isLocked ? () => controls.start({ scale: 1 }) : undefined}
      onTouchStart={!topic.isLocked ? handleTapStart : undefined}
      onTouchEnd={!topic.isLocked ? handleTapEnd : undefined}
      whileTap={!topic.isLocked ? { scale: 0.95 } : undefined}
      className="w-full mb-2"
    >
      <Card
        variant={topic.isActive ? 'filled' : 'outlined'}
        className="w-full"
        role="article"
        aria-label={`Topic ${topic.number}: ${topic.title}`}
        aria-current={topic.isActive ? 'step' : undefined}
        style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius-md)',
          opacity: topic.isLocked ? 0.6 : 1,
          cursor: topic.isLocked ? 'not-allowed' : 'pointer',
        }}
      >
        <div className="flex items-center gap-3">
          {/* Status Icon */}
          <div
            className="flex-shrink-0"
            style={{ width: '24px', height: '24px' }}
            aria-hidden="true"
          >
            {topic.isLocked ? (
              <Lock
                size={20}
                stroke="var(--color-text-muted)"
                strokeWidth={1.5}
              />
            ) : topic.isCompleted ? (
              <CheckCircle
                size={20}
                stroke="var(--color-success)"
                strokeWidth={1.5}
              />
            ) : (
              <Circle
                size={20}
                stroke={topic.isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'}
                strokeWidth={1.5}
              />
            )}
          </div>

          {/* Topic Info */}
          <div className="flex-1 min-w-0">
            <h4
              className={`text-sm font-medium truncate ${
                topic.isActive ? 'text-primary' : 'text-text-primary'
              }`}
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-medium)',
                color: topic.isActive
                  ? 'var(--color-primary)'
                  : 'var(--color-text-primary)',
              }}
            >
              {topic.number}. {topic.title}
            </h4>

            {topic.duration && !topic.isLocked && (
              <p
                className="text-xs text-text-muted mt-0.5"
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {topic.duration}
              </p>
            )}
          </div>

          {/* Active Indicator */}
          {topic.isActive && (
            <div
              className="flex-shrink-0 w-2 h-2 rounded-full bg-primary"
              style={{ backgroundColor: 'var(--color-primary)' }}
              aria-label="Active topic"
            />
          )}

          {/* Mobile Expand Indicator */}
          {isMobile && topic.content && !topic.isLocked && (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={cardSpring}
              aria-hidden="true"
            >
              <Circle size={16} stroke="var(--color-text-secondary)" strokeWidth={1.5} />
            </motion.div>
          )}
        </div>
      </Card>
    </motion.div>
  );

  // Mobile: Use Sheet for expansion to prevent stuck UI states
  if (isMobile && topic.content) {
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
              className="absolute bottom-0 left-0 right-0 h-[70vh] bg-card rounded-t-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col h-full p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {topic.number}. {topic.title}
                  </h3>
                  {topic.isCompleted && (
                    <CheckCircle size={20} stroke="var(--color-success)" />
                  )}
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {topic.content}
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
                      Continue Learning
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
    <div onClick={!topic.isLocked ? onClick : undefined}>
      {cardContent}
    </div>
  );
};

export default TopicCard;
