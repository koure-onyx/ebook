"use client";

import React, { forwardRef } from 'react';

/**
 * Card Component - Mobile-First Design
 * 
 * MOBILE BEHAVIOR:
 * - Full-width by default on mobile
 * - Touch-friendly padding
 * - Interactive cards have hover/active states
 * 
 * ACCESSIBILITY:
 * - Semantic HTML structure
 * - Proper heading hierarchy
 * - Interactive cards use button role or anchor tags
 * 
 * STATES (from Design System):
 * - Default: Normal shadow
 * - Hover: Elevated shadow (desktop only)
 * - Interactive: Cursor pointer, scale on active
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Variant: elevated (shadow), outlined (border), or interactive */
  variant?: 'elevated' | 'outlined' | 'interactive' | 'filled';
  /** Make card clickable */
  onClick?: () => void;
  /** Disable interactive states */
  disabled?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', variant = 'elevated', onClick, disabled, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        role={onClick && !disabled ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : -1}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && !disabled && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            onClick();
          }
        }}
        className={`
          bg-[var(--card-bg)]
          rounded-xl
          transition-all duration-normal ease-default
          ${variant === 'elevated' ? 'border border-[var(--card-border)] shadow-md hover:shadow-lg' : ''}
          ${variant === 'outlined' ? 'border border-[var(--color-border-strong)] shadow-none' : ''}
          ${variant === 'interactive' ? 'border border-[var(--card-border)] shadow-md cursor-pointer hover:shadow-lg active:scale-[0.98]' : ''}
          ${variant === 'filled' ? 'bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-none' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${className}
        `}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`flex flex-col space-y-1 pb-4 ${className}`} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className = '', ...props }, ref) => (
    <h3
      ref={ref}
      className={`font-semibold leading-tight tracking-tight text-[var(--color-text-primary)] ${className}`}
      {...props}
    />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className = '', ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-[var(--color-text-muted)] ${className}`}
      {...props}
    />
  )
);
CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div ref={ref} className={`pt-0 ${className}`} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', ...props }, ref) => (
    <div
      ref={ref}
      className={`flex items-center pt-4 mt-auto ${className}`}
      {...props}
    />
  )
);
CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
export type { CardProps };
