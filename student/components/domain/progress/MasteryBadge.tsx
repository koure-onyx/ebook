import React from 'react';
import { Award, Star, Trophy } from 'lucide-react';

/**
 * MasteryBadge Component
 * 
 * Purpose: Display achievement and mastery levels
 * Mobile Behavior: Compact badge with optional details
 * Accessibility: Level descriptions, earned status
 * 
 * @param {Object} props
 * @param {'beginner' | 'intermediate' | 'advanced' | 'master'} props.level - Mastery level
 * @param {string} props.title - Badge title
 * @param {Date} props.earnedDate - When badge was earned
 * @param {boolean} props.showDetails - Show detailed view
 */
interface MasteryBadgeProps {
  level: 'beginner' | 'intermediate' | 'advanced' | 'master';
  title: string;
  earnedDate?: Date;
  showDetails?: boolean;
}

const MasteryBadge: React.FC<MasteryBadgeProps> = ({
  level,
  title,
  earnedDate,
  showDetails = false
}) => {
  const levelConfig = {
    beginner: {
      icon: Star,
      color: 'var(--color-text-muted)',
      bgColor: 'var(--color-bg-tertiary)',
      label: 'Beginner',
    },
    intermediate: {
      icon: Award,
      color: 'var(--color-info)',
      bgColor: 'rgba(59, 130, 246, 0.1)',
      label: 'Intermediate',
    },
    advanced: {
      icon: Trophy,
      color: 'var(--color-warning)',
      bgColor: 'rgba(245, 158, 11, 0.1)',
      label: 'Advanced',
    },
    master: {
      icon: Trophy,
      color: 'var(--color-success)',
      bgColor: 'rgba(22, 163, 74, 0.1)',
      label: 'Master',
    },
  };

  const config = levelConfig[level];
  const Icon = config.icon;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg ${showDetails ? 'bg-bg-secondary' : ''}`}
      style={{
        backgroundColor: showDetails ? 'var(--color-bg-secondary)' : config.bgColor,
      }}
      role="img"
      aria-label={`${config.label} badge: ${title}`}
    >
      {/* Badge Icon */}
      <div
        className="w-12 h-12 flex items-center justify-center rounded-full"
        style={{
          backgroundColor: config.bgColor,
        }}
        aria-hidden="true"
      >
        <Icon
          size={24}
          stroke={config.color}
          strokeWidth={1.5}
        />
      </div>

      {/* Badge Info */}
      <div className="flex-1 min-w-0">
        <h4
          className="text-sm font-semibold text-text-primary truncate"
          style={{
            fontSize: 'var(--text-sm)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {title}
        </h4>
        
        <p
          className="text-xs font-medium mt-0.5"
          style={{
            fontSize: 'var(--text-xs)',
            fontWeight: 'var(--font-weight-medium)',
            color: config.color,
          }}
        >
          {config.label}
        </p>

        {/* Earned Date */}
        {earnedDate && showDetails && (
          <p
            className="text-xs text-text-muted mt-1"
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            Earned {earnedDate.toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Level Indicator Dots */}
      <div className="flex items-center gap-1" aria-hidden="true">
        {(['beginner', 'intermediate', 'advanced', 'master'] as const).map((l) => (
          <div
            key={l}
            className="w-2 h-2 rounded-full"
            style={{
              backgroundColor: l === level ? config.color : 'var(--color-border)',
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default MasteryBadge;
