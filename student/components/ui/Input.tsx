import React, { forwardRef } from 'react';

/**
 * Input Component - Mobile-First Design
 * 
 * MOBILE BEHAVIOR:
 * - Minimum 44px height for touch targets
 * - Full-width by default on mobile
 * - Proper keyboard type for email/password
 * - Auto-focus support for mobile forms
 * 
 * ACCESSIBILITY:
 * - Label association via htmlFor
 * - Error announcements for screen readers
 * - Focus ring visible on keyboard navigation
 * - Disabled state clearly indicated
 * 
 * STATES (from Design System):
 * - Default: Normal border
 * - Focused: Primary color ring
 * - Error: Red border and shadow
 * - Disabled: Reduced opacity, no interaction
 */

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Label text (required for accessibility) */
  label: string;
  /** Error message to display */
  error?: string;
  /** Icon to display before input (SVG only - no emojis) */
  icon?: React.ReactNode;
  /** Helper text below input */
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    
    return (
      <div className="w-full">
        {/* Label - Required for Accessibility */}
        <label 
          htmlFor={inputId} 
          className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2"
        >
          {label}
        </label>
        
        {/* Input Container with Icon */}
        <div className="relative">
          {/* Left Icon */}
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-text-muted)]">
              {icon}
            </div>
          )}
          
          {/* Actual Input Field */}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3
              bg-[var(--input-bg)]
              border rounded-lg
              text-[var(--input-text)]
              placeholder-[var(--input-placeholder)]
              transition-all duration-fast ease-default
              min-h-[var(--touch-target-min)]
              
              /* Hover State */
              hover:border-[var(--color-border-strong)]
              
              /* Focus State */
              focus:outline-none
              focus:border-[var(--input-border-focus)]
              focus:ring-2
              focus:ring-[var(--color-border-focus)]
              focus:ring-offset-2
              
              /* Disabled State */
              disabled:opacity-50
              disabled:cursor-not-allowed
              disabled:bg-[var(--color-bg-tertiary)]
              
              /* Icon Padding */
              ${icon ? 'pl-10' : ''}
              
              /* Error State */
              ${error 
                ? 'border-[var(--input-border-error)] focus:ring-[var(--color-error)] focus:border-[var(--color-error)]' 
                : 'border-[var(--input-border)]'
              }
              
              ${className}
            `}
            {...props}
          />
        </div>
        
        {/* Error Message - Announced to Screen Readers */}
        {error && (
          <p 
            role="alert" 
            className="mt-1 text-sm text-[var(--color-error)] animate-fade-in"
          >
            {error}
          </p>
        )}
        
        {/* Helper Text */}
        {!error && helperText && (
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
export type { InputProps };
