import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import Card from '../ui/Card';

/**
 * NoteCard Component
 * 
 * Purpose: Display user-created notes
 * Mobile Behavior: Expandable content preview, touch-friendly actions
 * Accessibility: Note content, creation dates, action labels
 * 
 * @param {Object} props
 * @param {Object} props.note - Note data object
 * @param {Function} props.onEdit - Edit handler
 * @param {Function} props.onDelete - Delete handler
 * @param {boolean} props.showPreview - Show content preview
 */
interface NoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    createdAt?: string;
    updatedAt?: string;
    color?: string;
  };
  onEdit?: () => void;
  onDelete?: () => void;
  showPreview?: boolean;
}

const NoteCard: React.FC<NoteCardProps> = ({
  note,
  onEdit,
  onDelete,
  showPreview = true
}) => {
  return (
    <Card
      variant="outlined"
      className="w-full mb-3"
      role="article"
      aria-label={`Note: ${note.title}`}
      style={{
        padding: 'var(--space-4)',
        borderStyle: 'dashed',
        borderWidth: '1px',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3
          className="text-base font-semibold text-text-primary flex-1"
          style={{
            fontSize: 'var(--text-base)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text-primary)',
          }}
        >
          {note.title}
        </h3>
        
        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label={`Edit note: ${note.title}`}
              >
                <Edit
                  size={16}
                  stroke="var(--color-text-secondary)"
                  strokeWidth={1.5}
                />
              </button>
            )}
            
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
                style={{ minHeight: '44px', minWidth: '44px' }}
                aria-label={`Delete note: ${note.title}`}
              >
                <Trash2
                  size={16}
                  stroke="var(--color-error)"
                  strokeWidth={1.5}
                />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Content Preview */}
      {showPreview && note.content && (
        <div
          className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap"
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-primary)',
            lineHeight: 'var(--line-height-relaxed)',
          }}
        >
          {note.content.length > 200
            ? `${note.content.substring(0, 200)}...`
            : note.content}
        </div>
      )}

      {/* Footer - Date */}
      {note.updatedAt && (
        <p
          className="text-xs text-text-muted mt-3 pt-3 border-t"
          style={{
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            borderColor: 'var(--color-border)',
          }}
        >
          Updated {new Date(note.updatedAt).toLocaleDateString()}
        </p>
      )}
    </Card>
  );
};

export default NoteCard;
