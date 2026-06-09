'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SearchInput } from '@/components/SearchInput';
import { useUser } from '@/hooks/use-user';

const AUTH_ONLY_PATHS = ['/login', '/signup', '/onboarding'];

export function AccountNav({ initialUser = null }: { initialUser?: { name?: string; email?: string } | null }) {
  const { user, loading } = useUser(initialUser);
  const pathname = usePathname();

  if (AUTH_ONLY_PATHS.includes(pathname)) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'DELETE' }).catch(() => {});
    await signOut({ redirect: false });
    window.location.replace('/');
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <Link href={user ? '/dashboard' : '/'} className="font-display text-lg font-bold text-slate-950">
          StudyVault
        </Link>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {!loading && (
            <div className="w-full sm:w-80">
              <SearchInput />
            </div>
          )}

          <div className="flex min-h-10 items-center justify-end gap-2">
            {loading ? (
              <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" />
            ) : user ? (
              <>
                <nav className="hidden items-center gap-2 text-sm font-medium sm:flex">
                  <Link href="/books" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">Books</Link>
                  <Link href="/dashboard" className="rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">Dashboard</Link>
                </nav>
                <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:inline">
                  {user.name || user.email}
                </span>
                <Button type="button" variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm">Dashboard</Button>
                </Link>
                <Link href="/books">
                  <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">Books</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
