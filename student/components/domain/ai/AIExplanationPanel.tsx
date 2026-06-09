import React from 'react';
import { Sparkles, RefreshCw, ExternalLink } from 'lucide-react';
import Card from '../ui/Card';
import Skeleton from '../ui/Skeleton';
import Button from '../ui/Button';

/**
 * AIExplanationPanel Component
 * 
 * Purpose: Display AI-generated explanations and insights
 * Mobile Behavior: Scrollable content area, compact header
 * Accessibility: Content structure, source attribution, loading states
 * 
 * @param {Object} props
 * @param {string} props.explanation - AI-generated explanation text
 * @param {Array} props.sources - Source references
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onRetry - Retry handler
 */
interface AIExplanationPanelProps {
  explanation?: string;
  sources?: Array<{ title: string; url?: string }>;
  isLoading: boolean;
  onRetry?: () => void;
}

const AIExplanationPanel: React.FC<AIExplanationPanelProps> = ({
  explanation,
  sources,
  isLoading,
  onRetry
}) => {
  if (isLoading) {
    return (
      <Card variant="outlined" className="w-full">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles
            size={18}
            stroke="var(--color-primary)"
            strokeWidth={1.5}
          />
          <span
            className="text-sm font-semibold text-primary"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            AI Explanation
          </span>
        </div>
        
        {/* Skeleton Loading */}
        <div className="space-y-2">
          <Skeleton variant="text" lines={3} />
          <Skeleton variant="text" lines={2} />
        </div>
      </Card>
    );
  }

  if (!explanation) {
    return null;
  }

  return (
    <Card
      variant="outlined"
      className="w-full"
      style={{
        borderLeftWidth: '4px',
        borderLeftColor: 'var(--color-primary)',
      }}
      role="article"
      aria-label="AI Explanation"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Sparkles
            size={18}
            stroke="var(--color-primary)"
            strokeWidth={1.5}
            aria-hidden="true"
          />
          <span
            className="text-sm font-semibold text-primary"
            style={{
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-primary)',
            }}
          >
            AI Explanation
          </span>
        </div>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            style={{
              minHeight: '44px',
              minWidth: '44px',
            }}
            aria-label="Regenerate explanation"
          >
            <RefreshCw
              size={16}
              stroke="var(--color-text-secondary)"
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>

      {/* Explanation Content */}
      <div
        className="text-base text-text-primary leading-relaxed mb-4 max-h-64 overflow-y-auto"
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-primary)',
          lineHeight: 'var(--line-height-relaxed)',
        }}
      >
        {explanation}
      </div>

      {/* Sources */}
      {sources && sources.length > 0 && (
        <div
          className="pt-3 border-t"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <p
            className="text-xs font-semibold text-text-secondary mb-2"
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-secondary)',
            }}
          >
            Sources:
          </p>
          <ul className="space-y-1">
            {sources.map((source, index) => (
              <li key={index}>
                {source.url ? (
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {source.title}
                    <ExternalLink size={12} strokeWidth={1.5} aria-hidden="true" />
                  </a>
                ) : (
                  <span
                    className="text-xs text-text-secondary"
                    style={{
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-secondary)',
                    }}
                  >
                    {source.title}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};

export default AIExplanationPanel;
