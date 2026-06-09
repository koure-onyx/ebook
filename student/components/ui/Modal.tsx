import { cn } from '@/lib/utils';
import { forwardRef, useEffect, useRef, useState } from 'react';

/**
 * Modal Component - Mobile-First Design with Focus Trap
 * 
 * MOBILE BEHAVIOR:
 * - Full-screen on mobile devices (< 640px)
 * - Centered dialog on tablet/desktop
 * - Backdrop prevents interaction with background
 * 
 * ACCESSIBILITY:
 * - Focus trap keeps keyboard navigation inside modal
 * - Escape key closes modal
 * - aria-modal="true" for screen readers
 * - Proper role="dialog"
 * - Returns focus to trigger element on close
 * 
 * STATES (from Design System):
 * - Open: Visible with animation
 * - Closed: Hidden
 * - Animating: Transition states
 */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  /** Prevent closing by clicking backdrop */
  preventBackdropClose?: boolean;
  /** Accessible description */
  description?: string;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  ({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    footer,
    preventBackdropClose = false,
    description,
  }, ref) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    // Store currently focused element when modal opens
    useEffect(() => {
      if (isOpen) {
        previousActiveElement.current = document.activeElement as HTMLElement;
        
        // Focus the modal when it opens
        setTimeout(() => {
          modalRef.current?.focus();
        }, 0);
      } else if (previousActiveElement.current) {
        // Return focus to previous element when closed
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
        // Prevent body scroll when modal is open
        document.body.style.overflow = 'hidden';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [isOpen, onClose]);

    // Focus trap implementation
    useEffect(() => {
      if (!isOpen || !modalRef.current) return;

      const modal = modalRef.current;
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      modal.addEventListener('keydown', handleTabKey);

      return () => {
        modal.removeEventListener('keydown', handleTabKey);
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget && !preventBackdropClose) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center"
        onClick={handleBackdropClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? 'modal-description' : undefined}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-[var(--color-bg-overlay)] animate-fade-in"
          aria-hidden="true"
        />

        {/* Modal Content */}
        <div
          ref={ref}
          className="relative z-10 w-full max-w-lg mx-4 animate-slide-up"
        >
          <div
            ref={modalRef}
            className="bg-[var(--color-bg-primary)] rounded-xl shadow-xl focus:outline-none sm:max-w-lg"
            tabIndex={-1}
          >
            {/* Header */}
            {(title || footer) && (
              <div className="flex items-center justify-between p-4 border-b border-[var(--color-border)]">
                {title && (
                  <h2 
                    id="modal-title"
                    className="text-lg font-semibold text-[var(--color-text-primary)]"
                  >
                    {title}
                  </h2>
                )}
                {!footer && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-fast"
                    aria-label="Close modal"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="p-4">
              {description && (
                <p 
                  id="modal-description"
                  className="text-[var(--color-text-secondary)] mb-4"
                >
                  {description}
                </p>
              )}
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-2 p-4 border-t border-[var(--color-border)]">
                {footer}
                {title && (
                  <button
                    onClick={onClose}
                    className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-fast"
                    aria-label="Close modal"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);
Modal.displayName = 'Modal';
