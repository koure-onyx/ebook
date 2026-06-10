import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { BookOpen, Filter, Library, Search, Archive, FileText, BrainCircuit, Bookmark } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getVaultServer } from '@/lib/api/client';

export const dynamic = 'force-dynamic';

interface VaultItem {
  _id: string;
  topicTitle: string;
  itemType: 'flashcard' | 'bookmark' | 'note' | 'highlight';
  content?: any;
  createdAt: string;
  topicId?: string;
}

interface VaultData {
  user_id: string;
  items_count: number;
  items: VaultItem[];
}

async function VaultContent() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Extract the JWT token from the session
  const token = (session.user as any)?.token || null;
  let data: VaultData | null = null;

  try {
    // Forward the token to the server-side API call
    data = await getVaultServer(token);
  } catch (error) {
    console.error('Failed to fetch vault:', error);
    data = {
      user_id: '',
      items_count: 0,
      items: [],
    };
  }

  // Group items by type
  const items = data?.items || [];
  const flashcards = items.filter(item => item.itemType === 'flashcard');
  const notes = items.filter(item => item.itemType === 'note');
  const bookmarks = items.filter(item => item.itemType === 'bookmark');
  const highlights = items.filter(item => item.itemType === 'highlight');

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'flashcard': return <BrainCircuit className="w-5 h-5 text-purple-500" />;
      case 'note': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'bookmark': return <Bookmark className="w-5 h-5 text-amber-500" />;
      case 'highlight': return <BookOpen className="w-5 h-5 text-emerald-500" />;
      default: return <Archive className="w-5 h-5 text-slate-500" />;
    }
  };

  const renderVaultItem = (item: VaultItem) => (
    <Card key={item._id} className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        {getItemIcon(item.itemType)}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 truncate">{item.topicTitle}</h3>
          <p className="text-xs text-slate-500 capitalize">{item.itemType}</p>
          <p className="text-xs text-slate-400 mt-1">
            {new Date(item.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );

  return (
    <PageContainer title="My Vault" description="Your saved flashcards, notes, and highlights.">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-2xl font-bold text-slate-900">{data?.items_count || 0}</div>
            <div className="text-sm text-slate-500">Total Items</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-purple-600">{flashcards.length}</div>
            <div className="text-sm text-slate-500">Flashcards</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-blue-600">{notes.length}</div>
            <div className="text-sm text-slate-500">Notes</div>
          </Card>
          <Card className="p-4">
            <div className="text-2xl font-bold text-amber-600">{bookmarks.length + highlights.length}</div>
            <div className="text-sm text-slate-500">Bookmarks</div>
          </Card>
        </div>

        {/* All Items */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">All Items</h2>
          {items.length === 0 ? (
            <Card className="p-8 text-center">
              <Archive className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Your vault is empty. Start saving content while studying!</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(renderVaultItem)}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

export default async function MyVaultPage() {
  return <VaultContent />;
}
