'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

/**
 * Button Component - Mobile-First Design
 * 
 * MOBILE BEHAVIOR:
 * - Minimum 44px touch target (WCAG compliant)
 * - Full-width on small screens for primary actions
 * - Icon buttons maintain square aspect ratio
 * 
 * ACCESSIBILITY:
 * - Focus visible ring with proper offset
 * - Disabled state reduces opacity and prevents interaction
 * - Loading state uses skeleton pattern (no spinners)
 * - Proper ARIA attributes for screen readers
 * 
 * STATES (from Design System):
 * - Default: Normal appearance
 * - Hover: Slight elevation increase (desktop only)
 * - Active: Scale down to 0.98
 * - Disabled: 50% opacity, no pointer events
 * - Loading: Shows skeleton text
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-all duration-normal ease-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary: Pakistani Green for main actions
        primary: `
          bg-[var(--button-primary-bg)]
          text-[var(--button-primary-text)]
          hover:bg-[var(--button-primary-hover)]
          active:bg-[var(--button-primary-active)]
          shadow-md hover:shadow-lg
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Secondary: Outlined style
        secondary: `
          bg-[var(--button-secondary-bg)]
          border border-[var(--button-secondary-border)]
          text-[var(--button-secondary-text)]
          hover:bg-[var(--button-secondary-hover)]
          shadow-xs hover:shadow-sm
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Outline: Minimal border-only style
        outline: `
          bg-transparent
          border border-[var(--color-border-strong)]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-secondary)]
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Ghost: No background or border
        ghost: `
          bg-transparent
          text-[var(--button-ghost-text)]
          hover:bg-[var(--button-ghost-hover)]
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Destructive: Error actions
        destructive: `
          bg-[var(--color-error)]
          text-white
          hover:bg-[var(--color-error-light)]
          focus-visible:ring-[var(--color-error)]
        `,
        // Success: Positive actions
        success: `
          bg-[var(--color-success)]
          text-white
          hover:bg-[var(--color-success-light)]
          focus-visible:ring-[var(--color-success)]
        `,
        // Gold: Premium/achievement actions
        gold: `
          bg-[var(--color-secondary)]
          text-white
          hover:bg-[var(--color-secondary-light)]
          focus-visible:ring-[var(--color-secondary)]
        `,
      },
      size: {
        // Small: Compact actions
        sm: 'h-8 px-3 text-xs rounded-md min-h-[var(--touch-target-min)]',
        // Default: Standard button
        default: 'h-10 px-5 py-2 text-sm rounded-lg min-h-[var(--touch-target-min)]',
        // Large: Prominent actions
        lg: 'h-12 px-8 text-base rounded-xl min-h-[var(--touch-target-comfortable)]',
        // Icon: Square icon button
        icon: 'h-10 w-10 rounded-lg min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)]',
        // Icon Large: Larger icon button
        'icon-lg': 'h-12 w-12 rounded-xl min-h-[var(--touch-target-comfortable)] min-w-[var(--touch-target-comfortable)]',
      },
    },
    defaultVariants: { 
      variant: 'primary', 
      size: 'default' 
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  /** Icon to display before text (SVG only - no emojis) */
  leftIcon?: React.ReactNode;
  /** Icon to display after text (SVG only - no emojis) */
  rightIcon?: React.ReactNode;
  /** Full width button (mobile-first) */
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, leftIcon, rightIcon, fullWidth, ...props }, ref) => {
    return (
      <button 
        ref={ref} 
        className={cn(
          buttonVariants({ variant, size, className }),
          fullWidth && 'w-full'
        )} 
        disabled={isLoading || disabled} 
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            {/* Skeleton placeholder instead of spinner */}
            <span className="h-4 w-20 bg-[var(--skeleton-bg)] rounded animate-pulse" />
          </span>
        ) : (
          <>
            {leftIcon && (
              <span className={cn('flex-shrink-0', children ? 'mr-2' : '')}>
                {leftIcon}
              </span>
            )}
            {children}
            {rightIcon && (
              <span className={cn('flex-shrink-0', children ? 'ml-2' : '')}>
                {rightIcon}
              </span>
            )}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
