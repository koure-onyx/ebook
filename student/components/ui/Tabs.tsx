import { cn } from '@/lib/utils';
import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Tabs Component - Mobile-First Scrollable Tabs
 * 
 * MOBILE BEHAVIOR:
 * - Horizontal scrollable when tabs overflow
 * - Active tab indicator with smooth animation
 * - Touch-friendly tab sizes
 * - Snap to active tab on scroll
 * 
 * ACCESSIBILITY:
 * - Proper tablist/role/tabpanel pattern
 * - Arrow key navigation between tabs
 * - aria-selected for current tab
 * - Keyboard accessible
 * 
 * STATES (from Design System):
 * - Default: Normal appearance
 * - Active: Highlighted with indicator
 * - Hover: Background change (desktop)
 * - Focus: Visible focus ring
 */

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  /** Variant: underline or pill */
  variant?: 'underline' | 'pill';
  /** Compact mode for limited space */
  compact?: boolean;
}

export function Tabs({ 
  tabs, 
  activeTab, 
  onTabChange, 
  variant = 'underline',
  compact = false,
}: TabsProps) {
  const tabsRef = useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number }>({ left: 0, width: 0 });

  // Update indicator position when active tab changes
  useEffect(() => {
    const activeTabElement = tabsRef.current?.querySelector(`[data-tab="${activeTab}"]`);
    if (activeTabElement && tabsRef.current) {
      const rect = activeTabElement.getBoundingClientRect();
      const containerRect = tabsRef.current.getBoundingClientRect();
      
      setIndicatorStyle({
        left: rect.left - containerRect.left,
        width: rect.width,
      });

      // Scroll active tab into view if needed
      activeTabElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [activeTab]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      if (!tabs[nextIndex].disabled) {
        onTabChange(tabs[nextIndex].id);
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      if (!tabs[prevIndex].disabled) {
        onTabChange(tabs[prevIndex].id);
      }
    }
  }, [activeTab, tabs, onTabChange]);

  return (
    <div 
      ref={tabsRef}
      className={cn(
        'relative flex items-center gap-1',
        'overflow-x-auto scrollbar-hide',
        'border-b border-[var(--color-border)]',
        variant === 'underline' ? 'pb-0' : 'pb-2'
      )}
      role="tablist"
      onKeyDown={handleKeyDown}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          data-tab={tab.id}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          disabled={tab.disabled}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium',
            'transition-colors duration-fast ease-default',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
            'whitespace-nowrap',
            compact && 'px-2 py-2 text-xs',
            tab.disabled && 'opacity-50 cursor-not-allowed',
            variant === 'pill'
              ? cn(
                  'rounded-lg',
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)]'
                )
              : cn(
                  activeTab === tab.id
                    ? 'text-[var(--color-primary)]'
                    : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
                )
          )}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-disabled={tab.disabled}
          tabIndex={tab.disabled ? -1 : 0}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          {tab.label}
        </button>
      ))}

      {/* Active Indicator (underline variant only) */}
      {variant === 'underline' && (
        <div
          className="absolute bottom-0 h-0.5 bg-[var(--color-primary)] transition-all duration-normal ease-default"
          style={{
            left: indicatorStyle.left,
            width: indicatorStyle.width,
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
