import { getMe } from '@/lib/api/auth';

export default async function DashboardPage() {
  const user = await getMe();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-muted">Welcome back, {user?.name}</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* TODO: Add dashboard stats cards */}
        <div className="p-6 bg-card rounded-lg border border-border shadow-card">
          <h3 className="text-sm font-medium text-text-muted">Total Progress</h3>
          <p className="text-2xl font-bold text-text-primary">0%</p>
        </div>
      </div>
    </div>
  );
}
