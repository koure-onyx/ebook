import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard, ContinueStudyingCard, StreakCard, HotTopicsCard, VaultSnapshotCard } from "@/components/dashboard/DashboardComponents";
import { Zap, BookOpen, Trophy, Flame, Archive, TrendingUp, ChevronRight, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { bookUrl, chapterUrl } from "@/lib/reader-urls";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDashboardServer } from "@/lib/api/client";

// Types
interface DashboardStats {
  examReadiness: number;
  topicsMastered: number;
  xpThisWeek: number;
  currentLevel: number;
  xpToNextLevel: number;
  streakDays: number;
  topicsStudied: number;
  studiedDays: boolean[];
}

interface ChapterProgress {
  _id: string;
  bookTitle: string;
  chapterTitle: string;
  progress: number;
  href: string;
}

interface Book {
  _id: string;
  title: string;
  subject: string;
  subject_icon?: string;
  program_name: string;
  board: string;
  subject_slug: string;
  board_short_code?: string;
  board_slug?: string;
  program_slug?: string;
  total_topics: number;
  topicsRead?: number;
}

interface HotTopic {
  _id: string;
  title: string;
  exam_frequency_count: number;
  slug: string;
}

interface VaultItem {
  _id: string;
  topicTitle: string;
  itemType: "flashcard" | "bookmark" | "note";
  createdAt: string;
}

interface QuizAttempt {
  _id: string;
  topicTitle: string;
  score: number;
  status: "mastered" | "retry" | "in-progress";
  date: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentChapters: ChapterProgress[];
  books: Book[];
  hotTopics: HotTopic[];
  vaultItems: VaultItem[];
  recentQuizzes: QuizAttempt[];
  firstName: string;
  welcome_message?: string;
}

// Skeleton loaders
function StatsStripSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4">
          <Skeleton className="w-8 h-8 mb-2" />
          <Skeleton className="w-16 h-4 mb-1" />
          <Skeleton className="w-24 h-3" />
        </div>
      ))}
    </div>
  );
}

function getGreeting(firstName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}.`;
  if (hour < 17) return `Good afternoon, ${firstName}.`;
  return `Good evening, ${firstName}.`;
}

// Main dashboard content component
async function DashboardContent() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/api/auth/signin');
  }

  // Extract the JWT token from the session
  const token = (session.user as any)?.token || null;
  let data: DashboardData | null = null;
  
  try {
    // Forward the token to the server-side API call
    const raw = await getDashboardServer(token);
    
    // Normalise — guarantee every field the UI needs exists
    data = {
      firstName: raw?.firstName || raw?.user?.name?.split(' ')[0] || 'Student',
      welcome_message: raw?.welcome_message || null,
      stats: {
        examReadiness:  raw?.stats?.examReadiness  ?? raw?.progressStats?.completionRate ?? 0,
        topicsMastered: raw?.stats?.topicsMastered ?? raw?.progressStats?.completedTopics ?? 0,
        xpThisWeek:     raw?.stats?.xpThisWeek     ?? 0,
        currentLevel:   raw?.stats?.currentLevel   ?? 1,
        xpToNextLevel:  raw?.stats?.xpToNextLevel  ?? 100,
        streakDays:     raw?.stats?.streakDays      ?? 0,
        topicsStudied:  raw?.stats?.topicsStudied   ?? raw?.progressStats?.totalTopics ?? 0,
        studiedDays:    raw?.stats?.studiedDays     ?? [false,false,false,false,false,false,false],
      },
      recentChapters: raw?.recentChapters ?? [],
      books:          raw?.books          ?? raw?.recommendedBooks ?? [],
      hotTopics:      raw?.hotTopics      ?? [],
      vaultItems:     raw?.vaultItems     ?? [],
      recentQuizzes:  raw?.recentQuizzes  ?? [],
    };
  } catch (error) {
    console.error('Failed to fetch dashboard:', error);
    data = {
      books: [],
      recentChapters: [],
      stats: {
        examReadiness: 0,
        topicsMastered: 0,
        xpThisWeek: 0,
        currentLevel: 1,
        xpToNextLevel: 100,
        streakDays: 0,
        topicsStudied: 0,
        studiedDays: [false, false, false, false, false, false, false],
      },
      hotTopics: [],
      vaultItems: [],
      recentQuizzes: [],
      firstName: 'Student',
      welcome_message: 'Welcome back!',
    };
  }

  const firstName = data.firstName || 'Student';
  const greeting = data.welcome_message || getGreeting(firstName);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
          {greeting}
        </h1>
        <p className="text-slate-500 text-sm">Here's what's happening with your studies today.</p>
      </div>

      {/* Row 1: Stats Strip */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4" aria-label="Key Statistics">
        <StatCard
          icon={<Zap className="w-5 h-5 text-amber-500" />}
          label="Exam Readiness"
          value={`${data.stats.examReadiness}%`}
          subtext={`Level ${data.stats.currentLevel}`}
        />
        <StatCard
          icon={<BookOpen className="w-5 h-5 text-emerald-500" />}
          label="Topics Mastered"
          value={data.stats.topicsMastered.toString()}
          subtext={`${data.stats.xpThisWeek} XP this week`}
        />
        <StatCard
          icon={<Trophy className="w-5 h-5 text-indigo-500" />}
          label="Current Level"
          value={data.stats.currentLevel.toString()}
          subtext={`${data.stats.xpToNextLevel} XP to next`}
        />
        <StreakCard days={data.stats.streakDays} studiedDays={data.stats.studiedDays} />
      </section>

      {/* Row 2: Continue Studying */}
      <section aria-label="Continue Studying">
        <ContinueStudyingCard chapters={data.recentChapters} />
      </section>

      {/* Row 3: Your Books */}
      <section aria-label="Your Books">
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Your Books</h2>
            <a href="/books" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              View all →
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.books.slice(0, 6).map((book) => {
              const progress = book.topicsRead ? Math.round((book.topicsRead / book.total_topics) * 100) : 0;
              return (
                <div key={book._id} className="border border-slate-100 rounded-xl p-4 hover:border-emerald-200 transition-colors">
                  <div className="flex items-start gap-3 mb-3">
                    {book.subject_icon && (
                      <span className="text-2xl">{book.subject_icon}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate">{book.title}</h3>
                      <p className="text-xs text-slate-500">{book.subject} • {book.program_name}</p>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                  <a
                    href={bookUrl(book.subject_slug, {
                      boardSlug: book.board_short_code || book.board_slug,
                      programSlug: book.program_slug,
                    })}
                    className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Open <ChevronRight className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Row 4: Hot Topics + Vault */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Hot Topics and Vault">
        <HotTopicsCard topics={data.hotTopics} />
        <VaultSnapshotCard items={data.vaultItems} />
      </section>

      {/* Row 5: Recent Quiz Activity */}
      <section aria-label="Recent Quizzes">
        <div className="bg-white border border-slate-100 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Recent Quizzes</h2>
            <a href="/quiz" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
              Take a new quiz →
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-500 uppercase tracking-wide border-b border-slate-100">
                  <th className="pb-3 font-medium">Topic</th>
                  <th className="pb-3 font-medium">Score</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentQuizzes.map((quiz, idx) => (
                  <tr
                    key={quiz._id}
                    className={`border-b border-slate-100 last:border-0 ${
                      idx % 2 === 0 ? "bg-slate-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 pr-4">
                      <span className="font-medium text-slate-800 text-sm">{quiz.topicTitle}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`font-semibold ${
                        quiz.score >= 80 ? "text-green-600" : quiz.score >= 60 ? "text-amber-600" : "text-red-600"
                      }`}>
                        {quiz.score}%
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                        quiz.status === "mastered"
                          ? "bg-green-100 text-green-700"
                          : quiz.status === "retry"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }`}>
                        {quiz.status === "mastered" && <CheckCircle2 className="w-3 h-3" />}
                        {quiz.status === "retry" && <RotateCcw className="w-3 h-3" />}
                        {quiz.status === "in-progress" && <Clock className="w-3 h-3" />}
                        {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 text-sm text-slate-500">{quiz.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}

// Main page component (Server Component)
export default function DashboardPage() {
  return (
    <PageContainer title="Dashboard">
      <Suspense fallback={<StatsStripSkeleton />}>
        <DashboardContent />
      </Suspense>
    </PageContainer>
  );
}
