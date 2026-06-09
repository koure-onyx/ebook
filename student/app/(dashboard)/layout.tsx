import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getMe } from '@/lib/api/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken');
  
  if (!accessToken) {
    redirect('/login');
  }

  // Verify token is still valid
  try {
    const user = await getMe();
    if (!user) {
      redirect('/login');
    }
  } catch {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-bg-secondary">
      {/* TODO: Add AppShell with navigation */}
      <main className="container mx-auto p-4">{children}</main>
    </div>
  );
}
