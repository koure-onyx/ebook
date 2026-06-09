import React from 'react';
import { FileText, Edit, Trash2, MoreVertical } from 'lucide-react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * VaultItemCard Component
 * 
 * Purpose: Display saved items in user's knowledge vault
 * Mobile Behavior: Full-width with action menu, touch-friendly
 * Accessibility: Item type announcements, action descriptions
 * 
 * @param {Object} props
 * @param {Object} props.item - Vault item data
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 */
interface VaultItemCardProps {
  item: {
    id: string;
    title: string;
    type: 'note' | 'bookmark' | 'flashcard' | 'document';
    content?: string;
    tags?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  onClick: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const VaultItemCard: React.FC<VaultItemCardProps> = ({
  item,
  onClick,
  onEdit,
  onDelete
}) => {
  const typeIcons = {
    note: FileText,
    bookmark: FileText,
    flashcard: FileText,
    document: FileText,
  };

  const TypeIcon = typeIcons[item.type];

  return (
    <Card
      variant="outlined"
      onClick={onClick}
      className="w-full mb-3"
      role="article"
      aria-label={`${item.type}: ${item.title}`}
      style={{ padding: 'var(--space-4)' }}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon */}
        <div
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-lg bg-bg-tertiary"
          style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
          aria-hidden="true"
        >
          <TypeIcon
            size={24}
            stroke="var(--color-text-secondary)"
            strokeWidth={1.5}
          />
        </div>

        {/* Item Info */}
        <div className="flex-1 min-w-0">
          <h3
            className="text-base font-semibold text-text-primary truncate"
            style={{
              fontSize: 'var(--text-base)',
              fontWeight: 'var(--font-weight-semibold)',
              color: 'var(--color-text-primary)',
            }}
          >
            {item.title}
          </h3>

          {/* Content Preview */}
          {item.content && (
            <p
              className="text-sm text-text-muted mt-1 line-clamp-2"
              style={{
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
              }}
            >
              {item.content.substring(0, 100)}
              {item.content.length > 100 ? '...' : ''}
            </p>
          )}

          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {item.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="secondary" size="sm">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Date */}
          {item.updatedAt && (
            <p
              className="text-xs text-text-muted mt-2"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-muted)',
              }}
            >
              Updated {new Date(item.updatedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        {/* Actions Menu */}
        {(onEdit || onDelete) && (
          <div className="flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                // Show action menu
              }}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              style={{ minHeight: '44px', minWidth: '44px' }}
              aria-label="More options"
            >
              <MoreVertical
                size={18}
                stroke="var(--color-text-secondary)"
                strokeWidth={1.5}
              />
            </button>
          </div>
        )}
      </div>

      {/* Inline Actions (optional) */}
      {(onEdit || onDelete) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
          {onEdit && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-primary text-primary hover:bg-primary/10 transition-colors"
              style={{ minHeight: '44px' }}
              aria-label={`Edit ${item.title}`}
            >
              <Edit size={16} strokeWidth={1.5} aria-hidden="true" />
              <span
                className="text-sm font-medium"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-primary)',
                }}
              >
                Edit
              </span>
            </button>
          )}
          
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg border border-error text-error hover:bg-error/10 transition-colors"
              style={{ minHeight: '44px' }}
              aria-label={`Delete ${item.title}`}
            >
              <Trash2 size={16} strokeWidth={1.5} aria-hidden="true" />
              <span
                className="text-sm font-medium"
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                  color: 'var(--color-error)',
                }}
              >
                Delete
              </span>
            </button>
          )}
        </div>
      )}
    </Card>
  );
};

export default VaultItemCard;
