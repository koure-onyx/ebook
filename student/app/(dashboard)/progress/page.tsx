import { AppShell } from '@/components/layout/AppShell';
import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Target, TrendingUp, Award, BrainCircuit, BookOpen, CheckCircle } from 'lucide-react';
import connectDB from '@studyvault/db/connect';
import _UserProgress from '@studyvault/db/models/UserProgress';
import _Book from '@studyvault/db/models/Book';
import { getServerUser } from '@studyvault/lib/auth/server';
import Link from 'next/link';

const UserProgress = _UserProgress;
const Book = _Book;

export const dynamic = 'force-dynamic';

export default async function ProgressPage() {
  await connectDB();
  const user = await getServerUser();

  if (!user) {
    return (
      <AppShell>
        <PageContainer title="Progress">
          <div className="text-center py-12">
            <p className="text-text-secondary">Open the dashboard to view your progress.</p>
            <Link href="/dashboard">
              <Button variant="primary" className="mt-4">
                Open Dashboard
              </Button>
            </Link>
          </div>
        </PageContainer>
      </AppShell>
    );
  }

  const studentProfile = user.student_profile || {};
  const activeProgramId = studentProfile.active_program_id;

  // Fetch all books for the current program to show mastery per book/subject
  const books = await Book.find({ program_id: activeProgramId, is_live: true }).lean();

  // Fetch user progress for these books
  const progressEntries = await UserProgress.find({
    user_id: user._id,
    program_id: activeProgramId
  }).lean();

  // Calculate mastery per book
  const subjectMastery = books.map((book: any) => {
    const bookProgress = progressEntries.filter((p: any) => p.book_id?.toString() === book._id.toString());
    const totalTopics = book.total_topics || 1; // Avoid division by zero
    const masteredTopics = bookProgress.filter((p: any) => p.mastery_status === 'mastered').length;
    const progressPercent = Math.min(Math.round((masteredTopics / totalTopics) * 100), 100);

    return {
      name: book.title,
      progress: progressPercent,
      color: progressPercent > 70 ? 'bg-success' : progressPercent > 30 ? 'bg-primary' : 'bg-border'
    };
  });

  // Calculate overall stats
  const totalCompletedTopics = progressEntries.filter((p: any) => p.is_read).length;
  const avgQuizAccuracy = progressEntries.length > 0
    ? Math.round(progressEntries.reduce((acc: number, p: any) => acc + (p.highest_quiz_score || 0), 0) / progressEntries.length)
    : 0;

  const currentLevel = Math.floor((studentProfile.xp_total || 0) / 100) + 1;
  const xpForNextLevel = currentLevel * 100;
  const currentXpInLevel = (studentProfile.xp_total || 0) % 100;

  return (
    <AppShell>
      <PageContainer 
        title="Your Progress" 
        description="Track your exam readiness across all subjects."
      >
        <div className="space-y-6">
          {/* Level Header */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-bg-tertiary flex items-center justify-center">
                  <Award className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-text-primary">Level {currentLevel} Scholar</h2>
                  <p className="text-xs text-text-muted">{currentXpInLevel} / {xpForNextLevel} XP</p>
                </div>
              </div>
              <Badge variant="primary">Level {currentLevel}</Badge>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300" 
                style={{ width: `${(currentXpInLevel / xpForNextLevel) * 100}%` }}
              />
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-text-secondary">Topics Completed</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{totalCompletedTopics}</p>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-text-secondary">Avg Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-text-primary">{avgQuizAccuracy}%</p>
            </Card>
          </div>

          {/* Subject Mastery */}
          <Card className="p-4">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> 
              Subject Mastery
            </h2>
            <div className="space-y-4">
              {subjectMastery.length > 0 ? subjectMastery.map((sub: any) => (
                <div key={sub.name}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-text-secondary">{sub.name}</span>
                    <span className="text-text-muted">{sub.progress}% Mastery</span>
                  </div>
                  <div className="w-full bg-bg-tertiary rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${sub.color} transition-all duration-300`} 
                      style={{ width: `${sub.progress}%` }}
                    />
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-text-muted">
                  <BrainCircuit className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No progress data available yet.</p>
                  <p className="text-xs mt-1">Start learning to see your mastery grow!</p>
                </div>
              )}
            </div>
          </Card>

          {/* Achievements Preview */}
          <Card className="p-4">
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> 
              Recent Achievements
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-bg-tertiary rounded-lg flex flex-col items-center justify-center p-2">
                  <CheckCircle className="w-6 h-6 text-text-muted mb-1" />
                  <span className="text-xs text-center text-text-muted">Locked</span>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              View All Achievements
            </Button>
          </Card>
        </div>
      </PageContainer>
    </AppShell>
  );
}
