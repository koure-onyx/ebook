import { PageContainer } from '@/components/layout/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Brain, BookOpen, Target, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function QuizRootPage() {
  return (
    <PageContainer 
      title="Quiz Engine" 
      description="Practice what you've learned with interactive quizzes."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">Quiz by Topic</h3>
          <p className="text-slate-500 mb-6">
            Pick a specific topic from any of your books and test your knowledge.
          </p>
          <Link href="/books" className="w-full">
            <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
              Browse Books
            </Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">AI Practice</h3>
          <p className="text-slate-500 mb-6">
            Let our AI generate a personalized quiz based on your recent study history.
          </p>
          <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50" disabled>
            Coming Soon
          </Button>
        </Card>
      </div>

      <div className="mt-12 bg-white border border-slate-100 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Ready for a challenge?</h2>
        <p className="text-slate-500 mb-8 max-w-lg mx-auto">
          Quizzes help you identify gaps in your knowledge and prepare you for actual board exam conditions.
        </p>
        <div className="flex justify-center gap-12">
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-slate-900">0</div>
            <div className="text-sm text-slate-500">Quizzes Taken</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-slate-900">0%</div>
            <div className="text-sm text-slate-500">Avg. Accuracy</div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-3xl font-bold text-slate-900">0</div>
            <div className="text-sm text-slate-500">XP Earned</div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
