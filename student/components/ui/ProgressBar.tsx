import { cn } from '@/lib/utils';

/**
 * ProgressBar Component - Mobile-First Progress Indicator
 * 
 * MOBILE BEHAVIOR:
 * - Full-width on mobile for clarity
 * - Clear percentage display
 * - Touch-friendly size
 * 
 * ACCESSIBILITY:
 * - role="progressbar"
 * - aria-valuenow, aria-valuemin, aria-valuemax
 * - aria-label for context
 * - High contrast colors
 * 
 * STATES (from Design System):
 * - Default: Static progress
 * - Animating: Smooth transition
 * - Complete: Full width with success color
 */

export interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Minimum value (default: 0) */
  min?: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Progress bar variant */
  variant?: 'default' | 'success' | 'warning' | 'error';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Accessible label */
  'aria-label'?: string;
  /** Custom class name */
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  min = 0,
  showPercentage = false,
  variant = 'default',
  size = 'md',
  'aria-label': ariaLabel = 'Progress',
  className,
}: ProgressBarProps) {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  
  // Variant colors
  const variantColors = {
    default: 'bg-[var(--color-primary)]',
    success: 'bg-[var(--color-success)]',
    warning: 'bg-[var(--color-warning)]',
    error: 'bg-[var(--color-error)]',
  };

  // Size variants
  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar Container */}
      <div
        className={cn(
          'w-full bg-[var(--color-bg-secondary)] rounded-full overflow-hidden',
          sizeStyles[size]
        )}
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-label={ariaLabel}
      >
        {/* Progress Fill */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-normal ease-default',
            variantColors[variant],
            percentage === 100 && 'bg-[var(--color-success)]'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage Text */}
      {showPercentage && (
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[var(--color-text-muted)]">
            {Math.round(min + ((max - min) * percentage) / 100)} / {max}
          </span>
          <span className="text-xs font-medium text-[var(--color-text-secondary)]">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
    </div>
  );
}

/**
 * CircularProgress - Circular progress indicator
 */
export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  'aria-label'?: string;
  className?: string;
}

export function CircularProgress({
  value,
  max = 100,
  size = 'md',
  showValue = false,
  'aria-label': ariaLabel = 'Circular progress',
  className,
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  // SVG dimensions
  const sizes = {
    sm: { width: 40, strokeWidth: 4 },
    md: { width: 64, strokeWidth: 6 },
    lg: { width: 96, strokeWidth: 8 },
  };

  const { width, strokeWidth } = sizes[size];
  const radius = (width - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="progressbar"
      aria-valuenow={Math.round(percentage)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      <svg
        width={width}
        height={width}
        viewBox={`0 0 ${width} ${width}`}
        className="transform -rotate-90"
      >
        {/* Background Circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bg-secondary)"
          strokeWidth={strokeWidth}
        />
        
        {/* Progress Circle */}
        <circle
          cx={width / 2}
          cy={width / 2}
          r={radius}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-normal ease-default"
        />
      </svg>

      {/* Center Value */}
      {showValue && (
        <span className="absolute text-sm font-semibold text-[var(--color-text-primary)]">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

/**
 * XPBar - Specialized progress bar for experience points
 */
export interface XPBarProps {
  currentXP: number;
  nextLevelXP: number;
  level: number;
  className?: string;
}

export function XPBar({ currentXP, nextLevelXP, level, className }: XPBarProps) {
  const percentage = (currentXP / nextLevelXP) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Level {level}
        </span>
        <span className="text-xs text-[var(--color-text-muted)]">
          {currentXP} / {nextLevelXP} XP
        </span>
      </div>
      <ProgressBar
        value={currentXP}
        max={nextLevelXP}
        variant="gold"
        size="md"
        aria-label="Experience progress"
      />
    </div>
  );
}
