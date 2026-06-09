import { cn } from '@/lib/utils';
import { forwardRef, useEffect, useRef, useCallback } from 'react';

/**
 * Sheet Component - Bottom Drawer (Mobile-First)
 * 
 * MOBILE BEHAVIOR:
 * - Slides up from bottom of screen
 * - Takes most of viewport height on mobile
 * - Drag handle for intuitive closing
 * - Backdrop prevents background interaction
 * 
 * ACCESSIBILITY:
 * - Focus trap keeps navigation inside sheet
 * - Escape key closes sheet
 * - aria-modal="true" for screen readers
 * - Proper role="dialog"
 * - Returns focus on close
 * 
 * STATES (from Design System):
 * - Open: Visible with slide-up animation
 * - Closed: Hidden below viewport
 * - Dragging: User is dragging (future enhancement)
 */

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Prevent closing by clicking backdrop */
  preventBackdropClose?: boolean;
  /** Custom height percentage (default: 90%) */
  height?: 'sm' | 'md' | 'lg' | 'full';
}

export const Sheet = forwardRef<HTMLDivElement, SheetProps>(
  ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    preventBackdropClose = false,
    height = 'md',
  }, ref) => {
    const sheetRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Height mapping
    const heightClasses = {
      sm: 'max-h-[50vh]',
      md: 'max-h-[90vh]',
      lg: 'max-h-[95vh]',
      full: 'max-h-[100vh]',
    };

    // Store currently focused element when sheet opens
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        
        setTimeout(() => {
          sheetRef.current?.focus();
        }, 0);
      } else if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    }, [isOpen]);

    // Handle escape key
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [isOpen, onClose]);

    // Focus trap implementation
    useEffect(() => {
      if (!isOpen || !sheetRef.current) return;

      const sheet = sheetRef.current;
      const focusableElements = sheet.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      sheet.addEventListener('keydown', handleTabKey);

      return () => {
        sheet.removeEventListener('keydown', handleTabKey);
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !preventBackdropClose) {
        onClose();
      }
    }, [onClose, preventBackdropClose]);

    return (
      <div
        className="fixed inset-0 z-[var(--z-sheet)] flex items-end justify-center"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'sheet-title' : undefined}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-[var(--color-bg-overlay)] animate-fade-in"
          aria-hidden="true"
        />

        {/* Sheet Content */}
        <div
          ref={ref}
          className={cn(
            'relative z-10 w-full max-w-2xl animate-slide-up',
            'bg-[var(--color-bg-primary)]',
            'rounded-t-xl shadow-xl',
            'focus:outline-none',
            heightClasses[height]
          )}
        >
          <div
            ref={sheetRef}
            tabIndex={-1}
            className="flex flex-col h-full max-h-full"
          >
            {/* Drag Handle */}
            <div className="flex items-center justify-center pt-3 pb-1">
              <div 
                className="w-10 h-1.5 bg-[var(--color-border-strong)] rounded-full cursor-pointer"
                onClick={onClose}
                role="button"
                aria-label="Close sheet"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onClose();
                  }
                }}
              />
            </div>

            {/* Header */}
            {title && (
              <div className="px-4 pb-3 border-b border-[var(--color-border)]">
                <h2 
                  id="sheet-title"
                  className="text-lg font-semibold text-[var(--color-text-primary)]"
                >
                  {title}
                </h2>
              </div>
            )}

            {/* Body - Scrollable */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {children}
            </div>

            {/* Footer - Sticky at bottom */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--color-border)] bg-[var(--color-bg-primary)]">
                {footer}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
Sheet.displayName = 'Sheet';
