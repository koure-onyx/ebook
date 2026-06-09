import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

/**
 * IconButton Component - Mobile-First Design
 * 
 * MOBILE BEHAVIOR:
 * - Minimum 44x44px touch target (WCAG compliant)
 * - Square aspect ratio maintained
 * - Icon-only buttons for compact actions
 * 
 * ACCESSIBILITY:
 * - aria-label required for screen readers
 * - Focus visible ring with proper offset
 * - Disabled state reduces opacity
 * 
 * STATES (from Design System):
 * - Default: Normal appearance
 * - Hover: Background change (desktop only)
 * - Active: Scale down slightly
 * - Disabled: 50% opacity
 */

const iconButtonVariants = cva(
  'inline-flex items-center justify-center transition-all duration-normal ease-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Primary: Filled button for main actions
        primary: `
          bg-[var(--color-primary)]
          text-[var(--color-primary-foreground)]
          hover:bg-[var(--color-primary-light)]
          active:bg-[var(--color-primary-dark)]
          shadow-md hover:shadow-lg
          focus-visible:ring-[var(--color-primary)]
        `,
        // Secondary: Outlined style
        secondary: `
          bg-[var(--color-bg-secondary)]
          border border-[var(--color-border)]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-tertiary)]
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Ghost: Minimal, no background
        ghost: `
          bg-transparent
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-secondary)]
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Outline: Border only
        outline: `
          bg-transparent
          border border-[var(--color-border-strong)]
          text-[var(--color-text-secondary)]
          hover:bg-[var(--color-bg-secondary)]
          focus-visible:ring-[var(--color-border-focus)]
        `,
        // Destructive: Error actions
        destructive: `
          bg-[var(--color-error)]
          text-white
          hover:bg-[var(--color-error-light)]
          focus-visible:ring-[var(--color-error)]
        `,
      },
      size: {
        // Small: Compact icon button
        sm: 'h-8 w-8 rounded-md min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)]',
        // Default: Standard size
        default: 'h-10 w-10 rounded-lg min-h-[var(--touch-target-min)] min-w-[var(--touch-target-min)]',
        // Large: Prominent icon button
        lg: 'h-12 w-12 rounded-xl min-h-[var(--touch-target-comfortable)] min-w-[var(--touch-target-comfortable)]',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'default',
    },
  }
);

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  /** Icon to display (SVG only - no emojis) */
  icon: React.ReactNode;
  /** Accessible label for screen readers (REQUIRED) */
  'aria-label': string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, icon, 'aria-label': ariaLabel, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(iconButtonVariants({ variant, size, className }))}
        aria-label={ariaLabel}
        {...props}
      >
        <span className="flex items-center justify-center">
          {icon}
        </span>
      </button>
    );
  }
);
IconButton.displayName = 'IconButton';

export { IconButton, iconButtonVariants };
