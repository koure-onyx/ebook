'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, CheckCircle, Lock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { bookUrl } from '@/lib/reader-urls';

export interface DashboardBook {
  _id: string;
  title: string;
  subject: string;
  subject_slug: string;
  program_name: string;
  board: string;
  board_short_code?: string;
  board_slug?: string;
  program_slug?: string;
  edition_year: number;
  total_chapters: number;
  total_topics: number;
  is_live: boolean;
  metadata?: { grade_level?: string; authors?: string[] };
  completed_chapters?: number;
  is_locked?: boolean;
  badge?: string;
}

export interface BookCardProps {
  book: DashboardBook;
  showProgress?: boolean;
}

export function BookCard({ book, showProgress = false }: BookCardProps) {
  const router = useRouter();
  const completedChapters = book.completed_chapters ?? 0;
  const progress =
    book.total_chapters > 0 ? (completedChapters / book.total_chapters) * 100 : 0;

  const handleClick = () => {
    router.push(
      bookUrl(book.subject_slug, {
        boardSlug: book.board_short_code || book.board_slug,
        programSlug: book.program_slug,
      })
    );
  };

  return (
    <Card
      variant="interactive"
      onClick={handleClick}
      className="w-full p-5"
      role="article"
      aria-label={`Book: ${book.title}`}
      style={{ minHeight: 'var(--space-20)' }}
    >
      <div className="flex gap-4">
        <div
          className="flex-shrink-0 bg-bg-tertiary rounded-lg flex items-center justify-center"
          style={{ width: '80px', height: '100px' }}
          aria-hidden="true"
        >
          <BookOpen size={32} stroke="var(--color-text-muted)" strokeWidth={1.5} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="min-w-0 flex-1">
              <h3
                className="text-base font-semibold text-text-primary truncate"
                style={{
                  fontSize: 'var(--text-base)',
                  fontWeight: 'var(--font-weight-semibold)',
                }}
              >
                {book.title}
              </h3>
              <p
                className="text-sm text-text-secondary mt-1"
                style={{
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                {book.subject} • {book.program_name} • {book.board}
              </p>
            </div>

            {book.badge && <Badge variant="primary" size="sm">{book.badge}</Badge>}
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" size="sm">
              {book.edition_year} Edition
            </Badge>
            {book.metadata?.grade_level && (
              <Badge variant="outline" size="sm">
                Grade {book.metadata.grade_level}
              </Badge>
            )}
            {book.is_live ? (
              <Badge variant="primary" size="sm">
                Live
              </Badge>
            ) : (
              <Badge variant="outline" size="sm">
                Draft
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 pt-3 border-t border-border">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-lg font-bold text-text-primary">{book.total_chapters}</p>
                <p className="text-xs text-text-muted">Chapters</p>
              </div>
              <div>
                <p className="text-lg font-bold text-text-primary">{book.total_topics}</p>
                <p className="text-xs text-text-muted">Topics</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted">
              {book.is_locked ? (
                <>
                  <Lock size={16} strokeWidth={1.8} />
                  Locked
                </>
              ) : progress === 100 ? (
                <>
                  <CheckCircle size={16} strokeWidth={1.8} />
                  Completed
                </>
              ) : (
                <>
                  <BookOpen size={16} strokeWidth={1.8} />
                  Open
                </>
              )}
            </div>
          </div>

          {showProgress && (
            <div className="mt-4">
              <ProgressBar
                value={progress}
                max={100}
                showPercentage={false}
                aria-label={`Progress: ${Math.round(progress)}%`}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default BookCard;
