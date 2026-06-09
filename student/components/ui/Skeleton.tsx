import { cn } from '@/lib/utils';

/**
 * Skeleton Component - Loading Placeholder (NO SPINNERS)
 * 
 * MOBILE BEHAVIOR:
 * - Maintains layout space during loading
 * - Prevents content shift when data loads
 * - Smooth pulse animation
 * 
 * ACCESSIBILITY:
 * - aria-hidden="true" (decorative)
 * - Not announced to screen readers
 * - Reduced motion support
 * 
 * STATES (from Design System):
 * - Pulsing: Default animation
 * - Static: When reduced-motion preferred
 */

export interface SkeletonProps {
  className?: string;
  /** Skeleton variant */
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  /** Width override */
  width?: string | number;
  /** Height override */
  height?: string | number;
  /** Number of lines for text variant */
  lines?: number;
}

export function Skeleton({ 
  className, 
  variant = 'text',
  width,
  height,
  lines = 1,
}: SkeletonProps) {
  const baseStyles = cn(
    'bg-[var(--skeleton-bg)]',
    'animate-pulse',
    'transition-colors duration-fast',
    variant === 'circular' && 'rounded-full',
    variant === 'rounded' && 'rounded-lg',
    variant === 'rectangular' && 'rounded-md',
    variant === 'text' && 'rounded-md',
    className
  );

  // Text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={baseStyles}
            style={{
              width: i === lines - 1 ? '60%' : '100%',
              height: height || '1rem',
              ...(width && i === lines - 1 ? { width } : {}),
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={baseStyles}
      aria-hidden="true"
      style={{
        width: width || '100%',
        height: height || (variant === 'circular' ? '48px' : '1.5rem'),
      }}
    />
  );
}

/**
 * CardSkeleton - Pre-built skeleton for card layouts
 */
export function CardSkeleton() {
  return (
    <div className="p-4 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg-primary)]">
      <div className="flex items-start gap-3 mb-3">
        <Skeleton variant="circular" width="40px" height="40px" />
        <div className="flex-1 space-y-2">
          <Skeleton width="60%" />
          <Skeleton width="40%" />
        </div>
      </div>
      <Skeleton lines={2} />
      <div className="flex gap-2 mt-3">
        <Skeleton width="30%" height="32px" />
        <Skeleton width="30%" height="32px" />
      </div>
    </div>
  );
}

/**
 * ListSkeleton - Pre-built skeleton for list items
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border border-[var(--color-border)] rounded-lg">
          <Skeleton variant="circular" width="32px" height="32px" />
          <div className="flex-1 space-y-2">
            <Skeleton width="70%" />
            <Skeleton width="50%" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * PageSkeleton - Full page loading state
 */
export function PageSkeleton() {
  return (
    <div className="p-4 space-y-6" aria-hidden="true">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton width="40%" height="32px" />
        <Skeleton width="48px" height="48px" variant="rounded" />
      </div>
      
      {/* Content */}
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
