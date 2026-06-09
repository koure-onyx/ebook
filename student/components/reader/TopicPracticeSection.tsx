'use client';

import Link from 'next/link';

type TopicPracticeProps = {
  topic: {
    _id: string;
    title: string;
    book_mcqs?: Array<{
      question: string;
      options: string[];
      correct_answer?: string;
      explanation?: string;
    }>;
    book_short_questions?: string[];
    book_problems?: Array<string | { problem: string; answer?: string; steps?: string[] }>;
  };
};

export function TopicPracticeSection({ topic }: TopicPracticeProps) {
  const mcqCount = topic.book_mcqs?.length || 0;
  const shortCount = topic.book_short_questions?.length || 0;
  const problemCount = topic.book_problems?.length || 0;
  const total = mcqCount + shortCount + problemCount;

  if (total === 0) {
    return (
      <div className="mt-10 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium text-slate-600">No textbook questions for this topic yet.</p>
        <Link
          href={`/quiz/${topic._id}`}
          className="mt-3 inline-block text-sm font-semibold text-emerald-600 hover:underline"
        >
          Try AI quiz →
        </Link>
      </div>
    );
  }

  return (
    <section id={`practice-${topic._id}`} className="mt-10 scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold text-slate-900">Practice — {topic.title}</h3>
        <Link
          href={`/quiz/${topic._id}`}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Take interactive quiz
        </Link>
      </div>

      {mcqCount > 0 && (
        <div className="mb-8">
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Multiple choice</h4>
          <div className="space-y-4">
            {topic.book_mcqs!.map((mcq, idx) => (
              <div key={idx} className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <p className="mb-3 text-sm font-bold text-slate-900">
                  {idx + 1}. {mcq.question}
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                                {(Array.isArray(mcq.options) ? mcq.options : []).map((opt, oIdx) => {
                    const isCorrect =
                      mcq.correct_answer &&
                      opt.toLowerCase().includes(`(${mcq.correct_answer.toLowerCase()})`);
                    return (
                      <li
                        key={oIdx}
                        className={`rounded-lg px-3 py-2 text-sm ${
                          isCorrect
                            ? 'bg-emerald-600 font-medium text-white'
                            : 'bg-white text-slate-700 border border-emerald-100'
                        }`}
                      >
                        {opt}
                      </li>
                    );
                  })}
                </ul>
                {mcq.explanation && (
                  <p className="mt-3 text-xs italic text-slate-600">
                    <span className="font-semibold not-italic">Explanation:</span> {mcq.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(shortCount > 0 || problemCount > 0) && (
        <div>
          <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">Short questions & problems</h4>
          <div className="space-y-3">
            {topic.book_short_questions?.map((q, idx) => (
              <div key={`sq-${idx}`} className="rounded-lg border border-amber-100 bg-amber-50/50 px-4 py-3 text-sm text-slate-800">
                <span className="font-bold text-amber-800">Q{idx + 1}.</span> {q}
              </div>
            ))}
            {topic.book_problems?.map((q, idx) => (
              <div key={`p-${idx}`} className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800">
                <span className="font-bold text-slate-600">P{idx + 1}.</span>
                {' '}
                {typeof q === 'string' ? q : q.problem}
                {typeof q !== 'string' && q.answer && (
                  <div className="mt-2 font-mono text-xs text-slate-700 bg-white/60 rounded p-2 border border-slate-100">
                    <strong>Answer:</strong> {q.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
