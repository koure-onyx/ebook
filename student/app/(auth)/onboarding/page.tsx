import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  // If user already has board and grade, redirect to dashboard (prevent loop)
  if (session?.user?.board && session?.user?.grade) {
    redirect('/dashboard');
  }

  const { OnboardingForm } = await import('./onboarding-form');

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Step 2 of 3</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950">Set up your study profile</h1>
          <p className="mt-2 text-slate-600">Choose your board and grade so StudyVault can show the right books.</p>
        </div>
        <OnboardingForm />
      </div>
    </main>
  );
}
