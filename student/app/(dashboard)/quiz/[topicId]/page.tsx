import connectDB from '@studyvault/db/connect';
import _Question from '@studyvault/db/models/Question';
import _Topic from '@studyvault/db/models/Topic';
import QuizEngine from '@/components/QuizEngine';
import { getServerUser } from '@studyvault/lib/auth/server';
import { notFound } from 'next/navigation';

const Question = _Question;
const Topic = _Topic;

export default async function QuizPage({ params }: { params: Promise<{ topicId: string }> }) {
  const resolvedParams = await params;
  
  await connectDB();
  const user = await getServerUser();
  
  const topic = await Topic.findById(resolvedParams.topicId).lean();
  if (!topic) return notFound();

  const questions = await Question.find({ 
    topic_id: resolvedParams.topicId,
    type: 'mcq'
  }).limit(10).lean();

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
          userId={user?._id.toString()}
        />
      ) : (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <p className="text-slate-500 font-medium">No quiz questions available for this topic yet.</p>
        </div>
      )}
    </main>
  );
}
