import { Suspense } from 'react';
import { BookOpen, Library } from 'lucide-react';
import connectDB from '@studyvault/db/connect';
import Book from '@studyvault/db/models/Book';
import '@studyvault/db/models/Program';
import '@studyvault/db/models/Board';
import { getUser } from '@studyvault/lib/auth/server';
import { buildBookFilter, resolveUserContentProfile } from '@studyvault/lib/content/bookFilter';
import { BooksGrid } from '@/components/books/BooksGrid';

export const dynamic = 'force-dynamic';

interface RawBook {
  _id: any;
  title: string;
  subject: string;
  subject_slug?: string;
  slug: string;
  grade: number;
  board_id?: {
    name: string;
    short_code?: string;
    slug?: string;
  };
  program_id?: {
    slug?: string;
  };
  metadata?: {
    grade_level?: string;
    edition?: string;
  };
  chapters?: number;
  topics?: number;
  isDraft?: boolean;
}

async function fetchBooksData() {
  await connectDB();
  const user = await getUser();
  const profile = user ? await resolveUserContentProfile(user) : null;
  const filter = profile ? buildBookFilter(profile) : { is_current_edition: { $ne: false } };

  const books = await Book
    .find(filter)
    .sort({ title: 1 })
    .populate('program_id', 'name slug')
    .populate('board_id', 'name short_code slug')
    .select('title subject subject_slug grade slug program_id board_id subject metadata chapters topics isDraft')
    .lean();

  // Transform to format expected by BooksGrid
  return books.map((book: RawBook) => ({
    _id: book._id.toString(),
    title: book.title,
    subject: book.subject || 'General',
    board: book.board_id?.name || book.metadata?.grade_level || 'Unknown Board',
    grade: book.grade || parseInt(book.metadata?.grade_level || '9'),
    edition: book.metadata?.edition || '2024',
    chapters: book.chapters || 0,
    topics: book.topics || 0,
    isDraft: book.isDraft || false,
    slug: book.slug,
    subject_slug: book.subject_slug,
    board_short_code: book.board_id?.short_code,
    board_slug: book.board_id?.short_code || book.board_id?.slug,
    program_slug: book.program_id?.slug,
  }));
}

function LoadingSkeleton() {
  return (
    <div className="space-y-8">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="h-4 w-64 bg-slate-100 rounded animate-pulse" />
      </div>
      
      {/* Filter Bar Skeleton */}
      <div className="flex flex-wrap gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-slate-100 rounded-lg animate-pulse" />
        ))}
      </div>
      
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
            <div className="h-24 bg-slate-900 animate-pulse" />
            <div className="p-5 space-y-3">
              <div className="h-4 w-3/4 bg-slate-100 rounded animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse mt-4" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function BooksContent() {
  const books = await fetchBooksData();
  
  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
          <Library className="w-12 h-12 text-slate-300" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">No books found yet</h3>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">
          Check that your board and grade match ingested content, or browse subjects from search.
        </p>
      </div>
    );
  }
  
  return <BooksGrid books={books} />;
}

export default async function BooksPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-4xl font-bold text-slate-900">Textbooks</h1>
        <p className="mt-2 text-slate-600">
          Your curriculum, organized by board and grade.
        </p>
      </div>
      
      {/* Main Content with Suspense */}
      <Suspense fallback={<LoadingSkeleton />}>
        <BooksContent />
      </Suspense>
    </main>
  );
}
