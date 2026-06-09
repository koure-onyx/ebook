import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatCard, ContinueStudyingCard, StreakCard, HotTopicsCard, VaultSnapshotCard } from "@/components/dashboard/DashboardComponents";
import { Zap, BookOpen, Trophy, Flame, Archive, TrendingUp, ChevronRight, CheckCircle2, RotateCcw, Clock } from "lucide-react";
import { bookUrl, chapterUrl } from "@/lib/reader-urls";

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
}

// Skeleton loaders
function StatsStripSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white border border-slate-100 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-slate-200 rounded-lg animate-pulse" />
            <div className="flex-1">
              <div className="h-8 bg-slate-200 rounded w-16 mb-2 animate-pulse" />
              <div className="h-3 bg-slate-200 rounded w-20 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ContinueStudyingSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="h-6 bg-slate-200 rounded w-48 mb-4 animate-pulse" />
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="border border-slate-100 rounded-xl p-4">
            <div className="h-4 bg-slate-200 rounded w-32 mb-2 animate-pulse" />
            <div className="h-5 bg-slate-200 rounded w-48 mb-3 animate-pulse" />
            <div className="h-2 bg-slate-200 rounded w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function StreakCardSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="h-6 bg-slate-200 rounded w-32 mb-4 animate-pulse" />
      <div className="h-3 bg-slate-200 rounded w-full mb-2 animate-pulse" />
      <div className="h-3 bg-slate-200 rounded w-24 mb-4 animate-pulse" />
      <div className="h-5 bg-slate-200 rounded w-36 mb-3 animate-pulse" />
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5, 6, 7].map((i) => (
          <div key={i} className="w-6 h-6 bg-slate-200 rounded-full animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function BooksRowSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
      </div>
      <div className="flex gap-4 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="w-40 flex-shrink-0 bg-white border border-slate-100 rounded-xl p-4">
            <div className="w-10 h-10 bg-slate-200 rounded-lg mb-3 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-full mb-2 animate-pulse" />
            <div className="h-3 bg-slate-200 rounded w-24 mb-4 animate-pulse" />
            <div className="h-2 bg-slate-200 rounded w-full animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function HotTopicsSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="h-6 bg-slate-200 rounded w-40 mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3 py-2">
            <div className="w-4 h-4 bg-slate-200 rounded animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-slate-200 rounded w-32 mb-1 animate-pulse" />
              <div className="h-3 bg-slate-200 rounded w-24 animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VaultSkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="h-6 bg-slate-200 rounded w-28 mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="py-2">
            <div className="h-4 bg-slate-200 rounded w-40 mb-2 animate-pulse" />
            <div className="h-5 bg-slate-200 rounded w-20 animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function QuizActivitySkeleton() {
  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6">
      <div className="h-6 bg-slate-200 rounded w-36 mb-4 animate-pulse" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-4 py-2">
            <div className="h-4 bg-slate-200 rounded w-32 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-12 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-20 animate-pulse" />
            <div className="h-4 bg-slate-200 rounded w-16 ml-auto animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

function getGreeting(firstName: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${firstName}.`;
  if (hour < 17) return `Good afternoon, ${firstName}.`;
  return `Good evening, ${firstName}.`;
}


// Data fetching functions (server-side)
async function getDashboardData(): Promise<DashboardData> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/dashboard`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    // Return empty state on error
    return {
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
    };
  }

  const json = await res.json();
  return json.data;
}

// Main dashboard content component
async function DashboardContent() {
  const data = await getDashboardData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1">
          {getGreeting(data.firstName)}
        </h1>
        <p className="text-slate-500">Here&apos;s where you left off.</p>
      </div>

      {/* Row 1: Stats Strip */}
      <section aria-label="Dashboard Statistics">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Trophy className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
            label="Exam Readiness"
            value={`${data.stats.examReadiness}%`}
            delay={0}
          />
          <StatCard
            icon={<BookOpen className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
            label="Topics Mastered"
            value={data.stats.topicsMastered.toString()}
            delay={0.05}
          />
          <StatCard
            icon={<Zap className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
            label="XP This Week"
            value={`${data.stats.xpThisWeek} XP`}
            delay={0.1}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />}
            label="Current Level"
            value={`Level ${data.stats.currentLevel}`}
            delay={0.15}
          />
        </div>
      </section>

      {/* Row 2: Continue Studying + Streak Card */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6" aria-label="Study Progress">
        <div className="lg:col-span-2">
          <ContinueStudyingCard chapters={data.recentChapters} />
        </div>
        <div>
          <StreakCard
            xpThisWeek={data.stats.xpThisWeek}
            xpToNextLevel={data.stats.xpToNextLevel}
            streakDays={data.stats.streakDays}
            topicsStudied={data.stats.topicsStudied}
            studiedDays={data.stats.studiedDays}
          />
        </div>
      </section>

      {/* Row 3: Your Books */}
      <section aria-label="Your Books">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Your Books
          </h2>
          <a href="/books" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
            View All <ChevronRight className="w-4 h-4" />
          </a>
        </div>
        <div className="flex gap-4 overflow-x-auto snap-x pb-2">
          {data.books.map((book) => {
            const progress = book.topicsRead ? Math.round((book.topicsRead / book.total_topics) * 100) : 0;
            return (
              <div
                key={book._id}
                className="w-40 flex-shrink-0 bg-white border border-slate-100 rounded-xl p-4 snap-start hover:shadow-md transition-shadow"
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3">
                  <BookOpen className="w-5 h-5 text-emerald-600" aria-hidden="true" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1 line-clamp-2">{book.title}</h3>
                <p className="text-xs text-slate-500 mb-3">
                  {book.program_name} · {book.board}
                </p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{book.topicsRead || 0} / {book.total_topics}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
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
    <AppShell>
      <PageContainer title="Dashboard">
        <Suspense fallback={<StatsStripSkeleton />}>
          <DashboardContent />
        </Suspense>
      </PageContainer>
    </AppShell>
  );
}
