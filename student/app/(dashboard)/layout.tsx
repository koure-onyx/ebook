import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { AppShell } from '@/components/layout/AppShell';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  // Profile completeness check: Redirect to onboarding if board or grade is missing
  const user = session.user as any;
  const hasBoard = !!user?.board || !!user?.board_id;
  const hasGrade = !!user?.grade || !!user?.grade_level;

  if (!hasBoard || !hasGrade) {
    redirect('/onboarding');
  }

  return (
    <AppShell>
      {children}
    </AppShell>
  );
}
