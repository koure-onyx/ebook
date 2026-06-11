import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // 1. Guard: Force login if session is empty (redundant with middleware but safe to keep for RSC)
  if (!session) {
    redirect('/api/auth/signin');
  }

  const user = session.user as any;

  // 2. Admin Bypass: If the user is an admin, let them through directly!
  if (user?.role === 'admin') {
    return <AppShell>{children}</AppShell>;
  }

  // NOTE: Onboarding redirect logic has been moved to middleware.ts for reliability.

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}