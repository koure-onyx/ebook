import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { User, Mail, Shield, Bell, LogOut } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  const user = session.user;

  return (
    <PageContainer title="My Profile" description="Manage your account settings and preferences.">
      <div className="max-w-2xl space-y-6">
        <Card className="p-8 flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-emerald-700">
              {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{user?.name || 'Student'}</h2>
          <p className="text-slate-500 mb-6">{user?.email}</p>
          <Button variant="outline" size="sm">Edit Profile</Button>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Email Address</p>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Change</Button>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-slate-400" />
              <div>
                <p className="text-sm font-medium text-slate-900">Password</p>
                <p className="text-sm text-slate-500">••••••••••••</p>
              </div>
            </div>
            <Button variant="ghost" size="sm">Update</Button>
          </Card>
        </div>
      </div>
    </PageContainer>
  );
}
