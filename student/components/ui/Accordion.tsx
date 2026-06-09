import { cn } from '@/lib/utils';
import { useState, useCallback } from 'react';

/**
 * Accordion Component - Mobile-First Expandable Sections
 * 
 * MOBILE BEHAVIOR:
 * - Full-width expandable sections
 * - Smooth height animation
 * - Touch-friendly chevron icon
 * - Content scrolls naturally when expanded
 * 
 * ACCESSIBILITY:
 * - Proper button + region pattern
 * - aria-expanded state
 * - aria-controls for relationship
 * - Keyboard accessible (Enter/Space)
 * 
 * STATES (from Design System):
 * - Collapsed: Content hidden
 * - Expanded: Content visible
 * - Hover: Background change (desktop)
 */

interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: AccordionItem[];
  /** Allow multiple items open simultaneously */
  multiple?: boolean;
  /** Initially open item IDs */
  defaultOpen?: string[];
  /** Controlled open state */
  openItems?: string[];
  onOpenChange?: (openItems: string[]) => void;
}

export function Accordion({ 
  items, 
  multiple = false,
  defaultOpen = [],
  openItems: controlledOpenItems,
  onOpenChange,
}: AccordionProps) {
  const [internalOpenItems, setInternalOpenItems] = useState<string[]>(defaultOpen);
  
  const openItems = controlledOpenItems ?? internalOpenItems;
  
  const toggleItem = useCallback((itemId: string) => {
    if (controlledOpenItems) {
      // Controlled mode
      const newOpenItems = multiple
        ? openItems.includes(itemId)
          ? openItems.filter(id => id !== itemId)
          : [...openItems, itemId]
        : openItems.includes(itemId)
          ? []
          : [itemId];
      
      onOpenChange?.(newOpenItems);
    } else {
      // Uncontrolled mode
      setInternalOpenItems(prev => {
        if (multiple) {
          return prev.includes(itemId)
            ? prev.filter(id => id !== itemId)
            : [...prev, itemId];
        } else {
          return prev.includes(itemId) ? [] : [itemId];
        }
      });
    }
  }, [multiple, controlledOpenItems, openItems, onOpenChange]);

  return (
    <div className="space-y-2">
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        
        return (
          <div
            key={item.id}
            className={cn(
              'border border-[var(--color-border)] rounded-lg',
              'bg-[var(--color-bg-primary)]',
              'overflow-hidden',
              item.disabled && 'opacity-50'
            )}
          >
            {/* Header/Button */}
            <button
              onClick={() => !item.disabled && toggleItem(item.id)}
              disabled={item.disabled}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3',
                'text-left font-medium text-sm',
                'transition-colors duration-fast ease-default',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                !item.disabled && 'hover:bg-[var(--color-bg-secondary)]',
                isOpen && 'bg-[var(--color-bg-secondary)]'
              )}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.id}`}
              tabIndex={item.disabled ? -1 : 0}
            >
              <span className="text-[var(--color-text-primary)]">
                {item.title}
              </span>
              <span
                className={cn(
                  'flex-shrink-0 ml-4 transition-transform duration-normal ease-default',
                  isOpen && 'rotate-180'
                )}
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-[var(--color-text-muted)]"
                >
                  <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </button>

            {/* Content Panel */}
            <div
              id={`accordion-content-${item.id}`}
              role="region"
              aria-labelledby={`accordion-header-${item.id}`}
              className={cn(
                'overflow-hidden transition-all duration-normal ease-default',
                isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
              )}
            >
              <div className="px-4 pb-4 pt-2 text-[var(--color-text-secondary)]">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
