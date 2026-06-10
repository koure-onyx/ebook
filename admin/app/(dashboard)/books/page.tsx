'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, BookOpen, ChevronDown, ChevronRight, Eye, Layers, RefreshCw, Sparkles, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useSession } from 'next-auth/react';
import { adminApi } from '@/lib/api/admin';

type Chapter = {
  _id: string;
  title: string;
  chapter_number: number;
  is_live: boolean;
  topic_count: number;
};

type Book = {
  _id: string;
  title: string;
  subject: string;
  subject_slug: string;
  edition_year: number;
  is_live: boolean;
  total_chapters?: number;
  total_topics?: number;
  program_id?: { name?: string; slug?: string };
  board_id?: { name?: string; short_code?: string };
  chapters: Chapter[];
};

export default function ManageBooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [expandedBooks, setExpandedBooks] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      setLoading(true);
      const token = (session?.user as any)?.token || null;
      const data = await adminApi.books.listServer(token);

      if (!data) {
        setResult({ success: false, error: 'Failed to load books' });
        return;
      }

      setBooks(data.books || []);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load books',
      });
    } finally {
      setLoading(false);
    }
  }

  function bookKey(book: Book) {
    return String(book._id);
  }

  function toggleBook(bookId: string) {
    setExpandedBooks((current) => {
      const next = new Set(current);
      if (next.has(bookId)) next.delete(bookId);
      else next.add(bookId);
      return next;
    });
  }

  async function previewBook(book: Book) {
    const id = bookKey(book);
    try {
      setPreviewingId(id);
      // Open student app directly with book slug
      const studentAppUrl = process.env.NEXT_PUBLIC_STUDENT_APP_URL || 'http://localhost:3000';
      const url = `${studentAppUrl}/${book.subject_slug || book.slug}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open book preview',
      });
    } finally {
      setPreviewingId(null);
    }
  }

  async function deleteBook(book: Book) {
    const ok = window.confirm(
      `Delete "${book.title}"?\n\nThis permanently deletes the book, its chapters, topics, questions, student progress, and saved vault items linked to it.`
    );
    if (!ok) return;

    try {
      setDeletingId(book._id);
      await adminApi.books.delete(book._id);

      setBooks((current) => current.filter((item) => item._id !== book._id));
      setResult({
        success: true,
        message: `Deleted "${book.title}".`,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete book',
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function deleteChapter(bookId: string, chapter: Chapter) {
    const ok = window.confirm(
      `Delete "${chapter.title}"?\n\nThis permanently deletes the chapter, its topics, questions, student progress, and saved vault items linked to it.`
    );
    if (!ok) return;

    try {
      setDeletingId(chapter._id);
      // Note: Express backend may not have direct chapter delete - TODO if needed
      setResult({ success: false, error: 'Chapter deletion requires backend endpoint' });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete chapter',
      });
    } finally {
      setDeletingId(null);
    }
  }

  async function toggleBookLiveStatus(book: Book) {
    const id = bookKey(book);
    const newStatus = !book.is_live;

    try {
      setStatusUpdatingId(id);
      await adminApi.books.update(id, { is_live: newStatus });

      setBooks((current) =>
        current.map((b) => (b._id === id ? { ...b, is_live: newStatus } : b))
      );
      setResult({
        success: true,
        message: `"${book.title}" is now ${newStatus ? 'LIVE' : 'DRAFT'}.`,
      });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update book status',
      });
    } finally {
      setStatusUpdatingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Manage Books
            </h1>
            <p className="text-slate-600 mt-1">
              Delete books or individual chapters from the database.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={fetchBooks} disabled={loading}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <a href="/books/ingest">
              <Button>
                <BookOpen className="w-4 h-4 mr-2" />
                Ingest Book
              </Button>
            </a>
          </div>
        </div>

        <Card className="bg-red-50 border-red-200 text-red-900">
          <div className="flex gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="text-sm leading-6">
              Deletes are permanent. Book deletes cascade through chapters, topics, questions, student progress, and vault items connected to that content.
            </p>
          </div>
        </Card>

        {result && (
          <Alert
            variant={result.success ? 'success' : 'error'}
            onDismiss={() => setResult(null)}
          >
            {result.success ? result.message : result.error}
          </Alert>
        )}

        {loading ? (
          <Card className="p-12 text-center text-slate-600">
            Loading books...
          </Card>
        ) : books.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <p className="font-semibold text-slate-700">No books found</p>
            <p className="text-sm text-slate-500 mt-1">Ingest a book to manage it here.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {books.map((book) => {
              const id = bookKey(book);
              const isExpanded = expandedBooks.has(id);
              return (
                <Card key={id} className="overflow-hidden p-0">
                  <div className="p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <button
                      type="button"
                      onClick={() => toggleBook(id)}
                      className="flex items-start gap-3 text-left min-w-0 flex-1"
                    >
                      <span className="mt-1 text-slate-400">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block font-bold text-slate-900 truncate">{book.title}</span>
                        <span className="block text-sm text-slate-500 mt-1">
                          {book.program_id?.name || 'Unknown program'} • {book.board_id?.short_code || book.board_id?.name || 'No board'} • {book.edition_year}
                        </span>
                        <span className="flex flex-wrap gap-2 mt-3 text-xs">
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {book.chapters.length} chapters
                          </span>
                          <span className="px-2 py-1 rounded-full bg-slate-100 text-slate-700">
                            {book.total_topics || 0} topics
                          </span>
                          <span className={`px-2 py-1 rounded-full ${book.is_live ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                            {book.is_live ? 'Live' : 'Draft - Hidden'}
                          </span>
                        </span>
                      </span>
                    </button>

                    <div className="relative z-10 flex flex-col gap-3">
                      <div className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-sm ${book.is_live ? 'border-border bg-bg-secondary' : 'border-emerald-200 bg-emerald-50/80'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-primary">
                              {book.is_live ? 'Visible to students' : 'Hidden from students'}
                            </p>
                            <p className="mt-1 text-xs text-text-muted">
                              {book.is_live
                                ? 'You can move it back to draft anytime.'
                                : 'Publish it to let students see and open it.'}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${book.is_live ? 'bg-accent/10 text-accent-dark' : 'bg-warning/10 text-warning'}`}>
                            {book.is_live ? 'Live' : 'Draft'}
                          </span>
                        </div>
                        <Button
                          variant={book.is_live ? 'secondary' : 'success'}
                          size="sm"
                          onClick={() => toggleBookLiveStatus(book)}
                          disabled={statusUpdatingId === id}
                          className={`relative z-20 w-full justify-center sm:w-auto sm:self-start ${book.is_live ? '' : 'shadow-md shadow-emerald-500/25 ring-1 ring-emerald-500/20'}`}
                        >
                          {book.is_live ? (
                            <BookOpen className="w-4 h-4 mr-2" />
                          ) : (
                            <Sparkles className="w-4 h-4 mr-2" />
                          )}
                          {statusUpdatingId === id
                            ? 'Updating...'
                            : book.is_live
                              ? 'Set Draft'
                              : 'Make Live'}
                        </Button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => previewBook(book)}
                        disabled={previewingId === id || !book.is_live}
                        title={!book.is_live ? 'Book must be live to preview' : undefined}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {previewingId === id ? 'Opening...' : 'Preview'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteBook(book)}
                        disabled={deletingId === id}
                        className="w-full sm:w-auto"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {deletingId === id ? 'Deleting...' : 'Delete Book'}
                      </Button>
                      </div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/70">
                      {book.chapters.length === 0 ? (
                        <div className="px-6 py-6 text-sm text-slate-500">No chapters in this book.</div>
                      ) : (
                        <div className="divide-y divide-slate-200">
                          {book.chapters.map((chapter) => (
                            <div key={chapter._id} className="px-6 py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex items-start gap-3 min-w-0">
                                <Layers className="w-4 h-4 text-slate-400 mt-1 shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-semibold text-slate-800 truncate">
                                    Chapter {chapter.chapter_number}: {chapter.title}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {chapter.topic_count} topics • {chapter.is_live ? 'Live' : 'Draft'}
                                  </p>
                                </div>
                              </div>

                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => deleteChapter(id, chapter)}
                                disabled={deletingId === String(chapter._id)}
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                {deletingId === chapter._id ? 'Deleting...' : 'Delete Chapter'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
