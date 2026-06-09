import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

/**
 * Toast Component - Mobile-First Feedback Messages
 * 
 * MOBILE BEHAVIOR:
 * - Bottom-positioned on mobile (above safe area)
 * - Auto-dismiss after duration
 * - Swipe to dismiss (future enhancement)
 * - Stacks multiple toasts vertically
 * 
 * ACCESSIBILITY:
 * - role="status" for polite announcements
 * - aria-live="polite" for screen readers
 * - Visible for sufficient time (min 5s)
 * - Dismissible via button
 * 
 * STATES (from Design System):
 * - Visible: Sliding in/out animation
 * - Hidden: Not rendered
 * - Dismissing: Fade out animation
 */

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastProps {
  id: string;
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({ 
  id, 
  message, 
  type = 'info', 
  duration = 5000,
  onClose 
}: ToastProps) {
  const [isDismissing, setIsDismissing] = useState(false);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsDismissing(true);
    setTimeout(() => {
      onClose(id);
    }, 200); // Match animation duration
  };

  const typeStyles = {
    info: 'bg-[var(--color-info)] text-white',
    success: 'bg-[var(--color-success)] text-white',
    warning: 'bg-[var(--color-warning)] text-white',
    error: 'bg-[var(--color-error)] text-white',
  };

  const typeIcons = {
    info: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 16v-4M12 8h.01"/>
      </svg>
    ),
    success: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <path d="M22 4L12 14.01l-3-3"/>
      </svg>
    ),
    warning: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    error: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>
    ),
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg',
        'max-w-sm w-full mx-4 mb-2',
        'animate-slide-up',
        typeStyles[type],
        isDismissing && 'animate-fade-out'
      )}
      role="status"
      aria-live="polite"
    >
      <span className="flex-shrink-0">
        {typeIcons[type]}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        className="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors duration-fast"
        aria-label="Dismiss notification"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
    </div>
  );
}

/**
 * Toast Container - Manages multiple toasts
 */
export interface ToastContainerProps {
  toasts: Array<{ id: string; message: string; type?: ToastType }>;
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[var(--z-toast)] flex flex-col items-end pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="w-full max-w-sm mx-auto mb-4 space-y-2 pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * useToast Hook - Easy toast management
 */
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: ToastType }>>([]);

  const addToast = (message: string, type: ToastType = 'info', duration?: number) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove after duration (default 5s)
    setTimeout(() => {
      removeToast(id);
    }, duration ?? 5000);
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const info = (message: string) => addToast(message, 'info');
  const success = (message: string) => addToast(message, 'success');
  const warning = (message: string) => addToast(message, 'warning');
  const error = (message: string) => addToast(message, 'error');

  return {
    toasts,
    addToast,
    removeToast,
    info,
    success,
    warning,
    error,
    ToastContainer: () => <ToastContainer toasts={toasts} onRemove={removeToast} />,
  };
}
