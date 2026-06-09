import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookOpen, Filter, Library, Search } from 'lucide-react';
import Link from 'next/link';
import connectDB from '@studyvault/db/connect';
import _Book from '@studyvault/db/models/Book';
import '@studyvault/db/models/Program';
import '@studyvault/db/models/Board';
import { getUser } from '@studyvault/lib/auth/server';
import { buildBookFilter, resolveUserContentProfile } from '@studyvault/lib/content/bookFilter';
import { bookUrl } from '@/lib/reader-urls';

const Book = _Book;

export const dynamic = 'force-dynamic';

export default async function MyVaultPage({ searchParams }: { searchParams: { programId?: string, boardId?: string } }) {
  await connectDB();
  const user = await getUser();

  const contentProfile = user ? await resolveUserContentProfile(user) : null;
  const bookFilter = contentProfile ? buildBookFilter(contentProfile) : { is_live: true };

  const books = await Book.find(bookFilter)
    .sort({ title: 1 })
    .populate('program_id', 'name slug')
    .populate('board_id', 'name short_code slug')
    .select('title subject_slug grade slug program_id board_id')
    .lean();

  const totalBooks = books.length;

  return (
    <AppShell>
      <PageContainer title="My Library" description="Your collection of official board textbooks and study materials.">
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
              <Input 
                placeholder="Search books..." 
                className="pl-10"
                type="search"
              />
            </div>
            <Button variant="outline" className="shrink-0">
              <Filter className="w-4 h-4 mr-2" /> 
              Filter
            </Button>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 border-b border-border">
            <button className="px-4 py-2 text-sm font-medium text-primary border-b-2 border-primary -mb-px">
              All Books ({totalBooks})
            </button>
            <button className="px-4 py-2 text-sm font-medium text-text-muted hover:text-text-primary transition-colors">
              Recently Read
            </button>
          </div>

          {/* Books Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {books.map((book: any) => (
              <Link
                key={book._id.toString()}
                href={bookUrl(book.subject_slug || 'subject', { boardSlug: book.board_id?.short_code || book.board_id?.slug, programSlug: book.program_id?.slug })}
                className="block group"
              >
                <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-32 bg-bg-tertiary p-4 flex flex-col justify-end relative">
                    <span className="text-xs font-semibold text-text-secondary bg-bg-secondary px-2 py-1 rounded self-start">
                      {book.board_id?.name || 'Board'}
                    </span>
                    <h3 className="font-bold text-lg text-text-primary leading-tight mt-2 line-clamp-2">
                      {book.title}
                    </h3>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-text-secondary bg-bg-secondary px-2 py-1 rounded">
                        {book.program_id?.name || 'Program'}
                      </span>
                      <span className="text-xs text-text-muted">
                        {book.metadata?.language === 'urdu' ? 'Urdu' : 'English'}
                      </span>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-muted">Chapters</span>
                        <span className="font-semibold text-text-secondary">{book.total_chapters || 0}</span>
                      </div>
                    </div>
                    <Button variant="primary" size="sm" className="w-full group-hover:bg-primary-dark transition-colors">
                      Open Book
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}

            {books.length === 0 && (
              <div className="col-span-full text-center py-12 bg-bg-secondary border border-dashed rounded-lg border-border">
                <Library className="w-12 h-12 text-text-muted mx-auto mb-4" />
                <h3 className="text-lg font-bold text-text-primary mb-2">No Books Found</h3>
                <p className="text-text-secondary text-sm">
                  We couldn&apos;t find any books for {contentProfile.gradeName || 'your grade'}
                  {contentProfile.boardName ? ` (${contentProfile.boardName})` : ''}.
                </p>
              </div>
            )}
          </div>
        </div>
      </PageContainer>
    </AppShell>
  );
}
