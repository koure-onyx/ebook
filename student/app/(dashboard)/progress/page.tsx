import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Target, TrendingUp, Award, BrainCircuit, BookOpen, CheckCircle } from 'lucide-react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getProgressServer } from '@/lib/api/client';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface SubjectMastery {
  name: string;
  progress: number;
  color: string;
}

interface ProgressData {
  overall_progress: number;
  total_books_read: number;
  books_in_progress: number;
  topics_completed: number;
  quiz_accuracy: number;
  current_level: number;
  xp_current: number;
  xp_to_next: number;
  subject_mastery: SubjectMastery[];
}

async function ProgressContent() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Extract the JWT token from the session
  const token = (session.user as any)?.token || null;
  let data: ProgressData | null = null;

  try {
    // Forward the token to the server-side API call
    const raw = await getProgressServer(token);
    
    // Normalize data from backend response
    data = {
      overall_progress: raw?.overall_progress ?? raw?.completion_rate ?? 0,
      total_books_read: raw?.total_books_read ?? 0,
      books_in_progress: raw?.books_in_progress ?? 0,
      topics_completed: raw?.total_topics_studied ?? raw?.topics_completed ?? 0,
      quiz_accuracy: raw?.quiz_accuracy ?? raw?.average_quiz_score ?? 0,
      current_level: raw?.current_level ?? 1,
      xp_current: raw?.xp_current ?? 0,
      xp_to_next: raw?.xp_to_next ?? 100,
      subject_mastery: raw?.subject_mastery ?? [],
    };
  } catch (error) {
    console.error('Failed to fetch progress:', error);
    // Return empty state
    data = {
      overall_progress: 0,
      total_books_read: 0,
      books_in_progress: 0,
      topics_completed: 0,
      quiz_accuracy: 0,
      current_level: 1,
      xp_current: 0,
      xp_to_next: 100,
      subject_mastery: [],
    };
  }

  return (
    <PageContainer
      title="Your Progress"
      description="Track your exam readiness across all subjects."
    >
      <div className="space-y-8">
        {/* Overall Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-slate-600">Overall Progress</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.overall_progress}%</div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-2">
              <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.overall_progress}%` }} />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-600">Books Read</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.total_books_read}</div>
            <div className="text-xs text-slate-500">{data.books_in_progress} in progress</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-5 h-5 text-amber-500" />
              <span className="text-sm font-medium text-slate-600">Level</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.current_level}</div>
            <div className="text-xs text-slate-500">{data.xp_current}/{data.xp_to_next} XP</div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BrainCircuit className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-slate-600">Quiz Accuracy</span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{data.quiz_accuracy}%</div>
            <div className="text-xs text-slate-500">Average score</div>
          </Card>
        </section>

        {/* Subject Mastery */}
        <section>
          <h2 className="text-lg font-semibold text-slate-800 mb-4">Subject Mastery</h2>
          {data.subject_mastery.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-slate-500">Start studying to see your progress here.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.subject_mastery.map((subject, idx) => (
                <Card key={idx} className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-slate-800">{subject.name}</span>
                    <Badge variant={subject.progress > 70 ? 'success' : subject.progress > 30 ? 'primary' : 'secondary'}>
                      {subject.progress}%
                    </Badge>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`${subject.color} h-2 rounded-full transition-all`} style={{ width: `${subject.progress}%` }} />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}

export default async function ProgressPage() {
  return <ProgressContent />;
}
