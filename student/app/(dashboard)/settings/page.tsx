import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch'; // Assuming this exists or using a checkbox fallback
import { Bell, Moon, Globe, Shield, Smartphone } from 'lucide-react';

export default function SettingsPage() {
  return (
    <PageContainer title="Settings" description="Customize your experience on Study Vault.">
      <div className="max-w-3xl space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" /> Notifications
          </h2>
          <Card className="divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Email Notifications</p>
                <p className="text-sm text-slate-500">Receive weekly progress reports and study tips.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-600" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Push Notifications</p>
                <p className="text-sm text-slate-500">Get reminded of your daily goals.</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-600" />
            </div>
          </Card>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" /> Appearance & Language
          </h2>
          <Card className="divide-y divide-slate-100">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Dark Mode</p>
                <p className="text-sm text-slate-500">Toggle dark theme for the interface.</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-emerald-600" />
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-slate-900">Language</p>
                <p className="text-sm text-slate-500">Choose your preferred interface language.</p>
              </div>
              <select className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm">
                <option>English</option>
                <option>Urdu</option>
              </select>
            </div>
          </Card>
        </section>
      </div>
    </PageContainer>
  );
}
