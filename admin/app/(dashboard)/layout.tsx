import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/api/auth/signin');
  }

  // Admin layout: Only check for valid admin session, no student profile constraints
  // This prevents crashes from board/grade checks that don't apply to admin users
  const user = session.user as any;
  const isAdmin = user?.role === 'admin';

  if (!isAdmin) {
    // Non-admin users should not access admin dashboard
    redirect('/api/auth/signin');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {children}
    </div>
  );
}
