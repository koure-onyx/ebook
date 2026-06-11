'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

const BOARD_GROUPS = {
  FEDERAL: ['Federal Board'],
  PUNJAB: [
    'BISE Lahore',
    'BISE Rawalpindi',
    'BISE Gujranwala',
    'BISE Sargodha',
    'BISE Multan',
    'BISE Sahiwal',
    'BISE Faisalabad',
    'BISE Bahawalpur',
    'BISE DG Khan',
  ],
  OTHER: ['Sindh Board', 'KPK Board', 'Balochistan Board', 'AJK Board'],
} as const;

const GRADES = [
  'Class 1',
  'Class 2',
  'Class 3',
  'Class 4',
  'Class 5',
  'Class 6',
  'Class 7',
  'Class 8',
  'Grade 9',
  'Grade 10',
  'Grade 11 (FSc Part 1)',
  'Grade 12 (FSc Part 2)',
  'MDCAT Prep',
  'ECAT Prep',
];

export function OnboardingForm() {
  const [region, setRegion] = useState<keyof typeof BOARD_GROUPS | ''>('');
  const [board, setBoard] = useState('');
  const [grade, setGrade] = useState('');
  const [section, setSection] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, update } = useSession();

  const boardOptions = useMemo(() => {
    if (!region) return [];
    return BOARD_GROUPS[region];
  }, [region]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Map grade to backend schema format
      const gradeValue = grade.replace(/^Class\s*/i, '').replace(/^Grade\s*/i, '');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/onboarding`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(session?.user as any)?.token}`
        },
        body: JSON.stringify({ 
          board, 
          grade: gradeValue,
          className: section 
        }),
      });
      const data = await response.json();

      if (!data.success) {
        setError(data.error?.message || data.error || 'Could not save your profile.');
        return;
      }

      // Refresh session to update user data
      await update({
        board: board,
        grade: gradeValue
      });
      router.push('/dashboard');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="region" className="mb-1 block text-sm font-medium text-slate-700">Board region</label>
        <select
          id="region"
          value={region}
          onChange={(e) => {
            setRegion(e.target.value as keyof typeof BOARD_GROUPS);
            setBoard('');
          }}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select region</option>
          {Object.keys(BOARD_GROUPS).map((key) => (
            <option key={key} value={key}>{key}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="board" className="mb-1 block text-sm font-medium text-slate-700">Education board</label>
        <select
          id="board"
          value={board}
          onChange={(e) => setBoard(e.target.value)}
          disabled={!region}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-50"
        >
          <option value="">Select board</option>
          {boardOptions.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="grade" className="mb-1 block text-sm font-medium text-slate-700">Grade</label>
        <select
          id="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="">Select grade</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="class" className="mb-1 block text-sm font-medium text-slate-700">Class / section</label>
        <input
          id="class"
          type="text"
          value={section}
          onChange={(e) => setSection(e.target.value)}
          placeholder="Optional: e.g., A, B, Science"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full bg-emerald-600 py-3 text-white hover:bg-emerald-700">
        {loading ? 'Saving...' : 'Continue to Dashboard'}
      </Button>
    </form>
  );
}
