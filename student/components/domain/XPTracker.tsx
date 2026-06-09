'use client';

import { Award } from 'lucide-react';

export interface XPTrackerProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  showAnimation?: boolean;
}

export function XPTracker({
  currentXP,
  nextLevelXP,
  level,
}: XPTrackerProps) {
  const progress = Math.min((currentXP / nextLevelXP) * 100, 100);
  const remainingXP = nextLevelXP - currentXP;

  return (
    <div
      className="w-full p-4 rounded-lg bg-bg-secondary"
      style={{ backgroundColor: 'var(--color-bg-secondary)' }}
      role="status"
      aria-label={`Level ${level}, ${currentXP} XP`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-inverse"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
            }}
            aria-hidden="true"
          >
            <Award size={20} strokeWidth={1.5} />
          </div>

          <div>
            <p
              className="text-sm font-semibold text-text-primary"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--font-weight-semibold)',
                color: 'var(--color-text-primary)',
              }}
            >
              Level {level}
            </p>
            <p
              className="text-xs text-text-muted"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              {remainingXP > 0 ? `${remainingXP} XP to next level` : 'Max level!'}
            </p>
          </div>
        </div>

        <div className="text-right">
          <p
            className="text-lg font-bold text-primary"
            style={{
              fontSize: 'var(--text-lg)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-primary)',
            }}
          >
            {currentXP.toLocaleString()} XP
          </p>
          <p
            className="text-xs text-text-muted"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            / {nextLevelXP.toLocaleString()}
          </p>
        </div>
      </div>

      <div
        className="w-full h-2 rounded-full bg-bg-tertiary overflow-hidden"
        style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="XP progress"
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: 'var(--color-primary)',
          }}
        />
      </div>
    </div>
  );
}

export default XPTracker;
