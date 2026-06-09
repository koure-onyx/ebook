import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Badge Component - Mobile-First Design
 * 
 * MOBILE BEHAVIOR:
 * - Readable text size on small screens
 * - Consistent padding for touch feedback
 * - Works in lists and cards
 * 
 * ACCESSIBILITY:
 * - Role="status" for dynamic badges
 * - Color + text for meaning (not color only)
 * - Proper contrast ratios
 * 
 * STATES (from Design System):
 * - Default: Normal appearance
 * - Active: Slightly darker background
 */

const badgeVariants = cva(
  'inline-flex items-center font-medium transition-colors duration-fast ease-default',
  {
    variants: {
      variant: {
        // Primary: Brand color badge
        primary: `
          bg-[var(--color-primary)]
          text-[var(--color-primary-foreground)]
        `,
        // Secondary: Neutral badge
        secondary: `
          bg-[var(--color-bg-secondary)]
          text-[var(--color-text-secondary)]
          border border-[var(--color-border)]
        `,
        // Success: Positive status
        success: `
          bg-[var(--color-success)]
          text-white
        `,
        // Warning: Caution status
        warning: `
          bg-[var(--color-warning)]
          text-white
        `,
        // Error: Negative status
        error: `
          bg-[var(--color-error)]
          text-white
        `,
        // Info: Informational status
        info: `
          bg-[var(--color-info)]
          text-white
        `,
        // Outline: Minimal border style
        outline: `
          bg-transparent
          border border-[var(--color-border-strong)]
          text-[var(--color-text-secondary)]
        `,
        // Gold: Premium/achievement badge
        gold: `
          bg-[var(--color-secondary)]
          text-white
        `,
      },
      size: {
        // Small: Compact badge
        sm: 'px-2 py-0.5 text-xs rounded-md min-h-[var(--touch-target-min)]',
        // Default: Standard badge
        default: 'px-2.5 py-1 text-sm rounded-lg',
        // Large: Prominent badge
        lg: 'px-3 py-1.5 text-base rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'secondary',
      size: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  /** Icon to display before text (SVG only) */
  icon?: React.ReactNode;
  /** Accessible label for screen readers */
  'aria-label'?: string;
}

export function Badge({ 
  className, 
  variant, 
  size, 
  icon, 
  children,
  'aria-label': ariaLabel,
  ...props 
}: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant, size, className }))}
      role={ariaLabel ? 'status' : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {icon && (
        <span className="mr-1 flex-shrink-0">
          {icon}
        </span>
      )}
      {children}
    </div>
  );
}
