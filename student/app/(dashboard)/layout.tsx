import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const headersList = await headers();
  const pathname = headersList.get('x-pathname') || '';

  if (!session) {
    redirect('/api/auth/signin');
  }

  // Profile completeness check: Redirect to onboarding if board or grade is missing
  // Skip this check when already on /onboarding to prevent infinite redirect loops
  const user = session.user as any;
  const hasBoard = !!user?.board || !!user?.board_id;
  const hasGrade = !!user?.grade || !!user?.grade_level;

  if (!hasBoard || !hasGrade) {
    // Only redirect if not already on onboarding page
    if (!pathname.includes('/onboarding')) {
      redirect('/onboarding');
    }
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
