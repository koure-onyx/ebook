'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { GraduationCap, BookOpen, Globe, CheckCircle2 } from 'lucide-react';

interface Board {
  _id: string;
  name: string;
  short_code: string;
}

interface Program {
  _id: string;
  name: string;
  slug: string;
}

export function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [boards, setBoards] = useState<Board[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [submitting, setSubmitting] = useState(false);
  
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedMedium, setSelectedMedium] = useState<'english' | 'urdu'>('english');

  const router = useRouter();

  useEffect(() => {
    checkOnboarding();
    fetchOptions();
  }, []);

  async function checkOnboarding() {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      
      if (data.success && !data.data.user.student_profile?.onboarding_completed) {
        setIsOpen(true);
      }
    } catch (err) {
      console.error('Failed to check onboarding status', err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchOptions() {
    try {
      const res = await fetch('/api/onboarding');
      const data = await res.json();
      if (data.success) {
        setBoards(data.data.boards);
        setPrograms(data.data.programs);
      }
    } catch (err) {
      console.error('Failed to fetch onboarding options', err);
    }
  }

  async function handleSubmit() {
    if (!selectedBoard || !selectedProgram || !selectedMedium) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: selectedBoard,
          programId: selectedProgram,
          medium: selectedMedium,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        router.refresh();
      }
    } catch (err) {
      console.error('Onboarding submission failed', err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto">
      <Card className="w-full max-w-2xl bg-white shadow-2xl rounded-3xl overflow-hidden border-0 animate-in fade-in zoom-in duration-300">
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-8 text-white text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-lg rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold font-display mb-2">Personalize Your Vault</h2>
          <p className="text-emerald-50 opacity-90">Let's set up your study profile to show you the right books.</p>
        </div>

        <div className="p-8 space-y-8">
          {/* Step 1: Grade/Class */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              1. Select Your Grade / Class
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {programs.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedProgram(p._id)}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all text-sm font-semibold flex items-center justify-between ${
                    selectedProgram === p._id
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md'
                      : 'border-slate-100 hover:border-emerald-200 text-slate-600'
                  }`}
                >
                  {p.name}
                  {selectedProgram === p._id && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Medium */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-cyan-500" />
              2. Preferred Medium
            </label>
            <div className="flex gap-4">
              {['english', 'urdu'].map((m) => ( m === 'english' || m === 'urdu' ? (
                <button
                  key={m}
                  onClick={() => setSelectedMedium(m as 'english' | 'urdu')}
                  className={`flex-1 py-4 rounded-2xl border-2 transition-all font-bold flex items-center justify-center gap-3 ${
                    selectedMedium === m
                      ? 'border-cyan-500 bg-cyan-50 text-cyan-700 shadow-md'
                      : 'border-slate-100 hover:border-cyan-200 text-slate-600'
                  }`}
                >
                  {m === 'english' ? 'English Medium' : 'Urdu Medium'}
                  {selectedMedium === m && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ) : null ))}
            </div>
          </div>

          {/* Step 3: Board */}
          <div className="space-y-4">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-700 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-amber-500" />
              3. Select Your Education Board
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {boards.map((b) => (
                <button
                  key={b._id}
                  onClick={() => setSelectedBoard(b._id)}
                  className={`px-4 py-3 rounded-2xl border-2 transition-all text-sm font-semibold flex items-center justify-between ${
                    selectedBoard === b._id
                      ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-md'
                      : 'border-slate-100 hover:border-amber-200 text-slate-600'
                  }`}
                >
                  <span className="truncate">{b.name}</span>
                  {selectedBoard === b._id && <CheckCircle2 className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!selectedBoard || !selectedProgram || submitting}
            className="w-full py-6 text-xl font-bold rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all disabled:opacity-50 disabled:translate-y-0"
          >
            {submitting ? 'Setting up your Vault...' : 'Enter Study Vault'}
          </Button>

          <p className="text-center text-xs text-slate-400">
            * You can change these preferences later in your profile settings.
          </p>
        </div>
      </Card>
    </div>
  );
}
