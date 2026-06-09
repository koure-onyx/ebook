import React from 'react';
import { FileText, TrendingUp, AlertCircle } from 'lucide-react';
import Card from '../ui/Card';
import Tabs from '../ui/Tabs';
import Skeleton from '../ui/Skeleton';

/**
 * AIResultViewer Component
 * 
 * Purpose: Display comprehensive AI analysis results
 * Mobile Behavior: Scrollable results with summary first, tabbed navigation
 * Accessibility: Result structure, refresh announcement
 * 
 * @param {Object} props
 * @param {Array} props.results - Analysis result sections
 * @param {boolean} props.isLoading - Loading state
 * @param {Function} props.onRefresh - Refresh handler
 */
interface AIResultViewerProps {
  results?: Array<{
    id: string;
    title: string;
    content: string;
    type?: 'summary' | 'analysis' | 'recommendation';
  }>;
  isLoading: boolean;
  onRefresh?: () => void;
}

const AIResultViewer: React.FC<AIResultViewerProps> = ({
  results,
  isLoading,
  onRefresh
}) => {
  if (isLoading) {
    return (
      <Card variant="elevated" className="w-full">
        <div className="mb-4">
          <Skeleton variant="text" lines={2} />
        </div>
        <Skeleton variant="text" lines={5} />
      </Card>
    );
  }

  if (!results || results.length === 0) {
    return null;
  }

  // Group results by type for tabs
  const tabs = results.map((result) => ({
    id: result.id,
    label: result.title,
    content: result.content,
    icon: result.type === 'summary' ? FileText : 
           result.type === 'analysis' ? TrendingUp : AlertCircle
  }));

  return (
    <Card variant="elevated" className="w-full" role="region" aria-label="AI Analysis Results">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-semibold text-text-primary"
          style={{
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          AI Analysis
        </h3>
        
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
            style={{
              minHeight: '44px',
              minWidth: '44px',
            }}
            aria-label="Refresh analysis"
          >
            <FileText
              size={18}
              stroke="var(--color-text-secondary)"
              strokeWidth={1.5}
            />
          </button>
        )}
      </div>

      {/* Tabbed Content */}
      <Tabs tabs={tabs} />
    </Card>
  );
};

export default AIResultViewer;
