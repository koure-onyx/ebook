import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { generateQuizQuestionsServer } from '@/lib/api/client';
import QuizEngine from '@/components/QuizEngine';
import { notFound } from 'next/navigation';

export default async function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const resolvedParams = await params;
  const session = await getServerSession(authOptions);
  const token = (session?.user as any)?.token || null;

  if (!session) {
    // Redirect to signin if not authenticated
    return notFound();
  }

  let questions: any[] = [];
  try {
    // Use API client to generate quiz questions
    questions = await generateQuizQuestionsServer(token, resolvedParams.topicId);
  } catch (error) {
    console.error('Failed to generate quiz questions:', error);
    // If API fails, show empty state
    questions = [];
  }

  const topic = { _id: resolvedParams.topicId, title: 'Quiz Topic' }; // TODO: fetch topic title from API

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 font-display">Quiz: {topic.title}</h1>
        <p className="text-slate-500 mt-1">Test your understanding of this topic with {questions.length} MCQs.</p>
      </div>

      {questions.length > 0 ? (
        <QuizEngine
          topicId={resolvedParams.topicId}
          initialQuestions={JSON.parse(JSON.stringify(questions))}
          userId={(session.user as any)?.id || ''}
        />
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <p className="text-slate-500 font-medium">No quiz questions available for this topic yet.</p>
        </div>
      )}
    </main>
  );
}
