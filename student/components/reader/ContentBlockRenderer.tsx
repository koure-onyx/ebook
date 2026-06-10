import React from 'react';
import { Beaker, Lightbulb, Info, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import QuranVerseRenderer from '@/components/QuranVerseRenderer';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';


function blockHtmlText(block: any): string {
  const raw = block?.html ?? block?.text ?? '';
  return typeof raw === 'string' ? raw : String(raw);
}

/**
 * MCQTemplate Component - Renders Multiple Choice Questions from content blocks
 */
const MCQTemplate: React.FC<{ block: any }> = ({ block }) => {
  const questionText = block.question || block.text || '';
  const options = block.options || [];
  const correctAnswer = block.correct_answer || block.correctAnswer || null;
  const explanation = block.explanation || '';

  return (
    <div className="my-8 bg-[#FAEEDA] border-[0.5px] border-[#BA7517] rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-[#BA7517]" />
        <span className="text-[12px] uppercase tracking-wider text-[#412402] font-bold">
          Multiple Choice Question
        </span>
      </div>
      
      <div className="text-[14px] text-[#412402] leading-[1.6] mb-4 font-medium">
        {questionText}
      </div>
      
      <div className="space-y-2 mb-4">
        {options.map((option: string, index: number) => {
          const optionLabel = String.fromCharCode(65 + index);
          const isCorrect = correctAnswer && (
            correctAnswer === optionLabel.toLowerCase() || 
            correctAnswer === optionLabel ||
            correctAnswer === option ||
            correctAnswer === index.toString()
          );
          
          return (
            <div
              key={index}
              className={`p-3 rounded-lg border-l-[3px] ${
                isCorrect 
                  ? 'bg-green-50 border-green-500' 
                  : 'bg-white border-slate-200'
              }`}
            >
              <span className="text-[14px] text-slate-700">
                <strong>{optionLabel}.</strong> {option}
              </span>
            </div>
          );
        })}
      </div>
      
      {explanation && (
        <div className="mt-4 p-3 rounded-lg bg-blue-50 border-l-[3px] border-blue-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-blue-500" />
            <span className="text-[12px] uppercase tracking-wider text-blue-700 font-bold">
              Explanation
            </span>
          </div>
          <div className="text-[13px] text-blue-800 leading-[1.6]">
            {explanation}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * QuestionTemplate Component - Renders Short Answer Questions from content blocks
 */
const QuestionTemplate: React.FC<{ block: any }> = ({ block }) => {
  const questionText = block.question || block.text || '';
  const marks = block.marks || null;
  const answer = block.answer || '';
  const difficulty = block.difficulty || null;

  return (
    <div className="my-8 bg-slate-50 border-l-[3px] border-slate-400 rounded-r-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-slate-500" />
          <span className="text-[12px] uppercase tracking-wider text-slate-700 font-bold">
            Short Question
          </span>
        </div>
        {(marks || difficulty) && (
          <div className="flex gap-2">
            {marks && (
              <span className="text-[11px] px-2 py-1 rounded-full bg-slate-200 text-slate-700 font-medium">
                {marks} marks
              </span>
            )}
            {difficulty && (
              <span className={`text-[11px] px-2 py-1 rounded-full font-medium ${
                difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {difficulty}
              </span>
            )}
          </div>
        )}
      </div>
      
      <div className="text-[14px] text-slate-800 leading-[1.6] mb-4">
        {questionText}
      </div>
      
      {answer && (
        <div className="mt-4 p-4 rounded-lg bg-white border border-slate-200">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold block mb-2">
            Answer
          </span>
          <div className="text-[14px] text-slate-700 leading-[1.6]">
            {answer}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * ProblemTemplate Component - Renders Numerical/Long Problems from content blocks
 */
const ProblemTemplate: React.FC<{ block: any }> = ({ block }) => {
  const problemText = block.problem || block.text || block.question || '';
  const givenData = block.given || null;
  const solution = block.solution || '';
  const finalAnswer = block.final_answer || block.answer || '';
  const marks = block.marks || null;

  return (
    <div className="my-8 bg-[#F0F4FF] border-l-[3px] border-[#534AB7] rounded-r-xl p-6 shadow-sm">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Beaker className="w-5 h-5 text-[#534AB7]" />
          <span className="text-[12px] uppercase tracking-wider text-[#534AB7] font-bold">
            Problem / Long Question
          </span>
        </div>
        {marks && (
          <span className="text-[11px] px-2 py-1 rounded-full bg-[#534AB7]/10 text-[#534AB7] font-medium">
            {marks} marks
          </span>
        )}
      </div>
      
      <div className="text-[14px] text-[#26215C] leading-[1.6] mb-4">
        {problemText}
      </div>
      
      {givenData && (
        <div className="mb-4 p-3 rounded-lg bg-white border border-[#534AB7]/20">
          <span className="text-[11px] uppercase tracking-wider text-[#534AB7]/70 font-bold block mb-2">
            Given Data
          </span>
          <div className="text-[13px] text-[#26215C] leading-[1.6]">
            {givenData}
          </div>
        </div>
      )}
      
      {solution && (
        <div className="mb-4 p-4 rounded-lg bg-white border border-[#534AB7]/20">
          <span className="text-[11px] uppercase tracking-wider text-[#534AB7]/70 font-bold block mb-2">
            Solution
          </span>
          <div className="text-[14px] text-[#26215C] leading-[1.6] whitespace-pre-line">
            {solution}
          </div>
        </div>
      )}
      
      {finalAnswer && (
        <div className="mt-4 p-4 rounded-lg bg-[#534AB7] text-white">
          <span className="text-[11px] uppercase tracking-wider text-white/80 font-bold block mb-2">
            Final Answer
          </span>
          <div className="text-[15px] font-semibold leading-[1.6]">
            {finalAnswer}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * SummaryPointTemplate Component - Renders Summary Points from content blocks
 */
const SummaryPointTemplate: React.FC<{ block: any }> = ({ block }) => {
  const summaryText = block.text || block.summary || block.content || '';
  const icon = block.icon || 'bullet';

  return (
    <div className="my-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-l-[3px] border-emerald-500 rounded-r-xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center mt-0.5">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/>
          </svg>
        </div>
        <div className="text-[14px] text-emerald-900 leading-[1.7]">
          {summaryText}
        </div>
      </div>
    </div>
  );
};


function renderMathContent(content: string, isInline: boolean = true): JSX.Element {
  try {
    // Strip $ delimiters
    let latex = content.trim();
    if (isInline) {
      // Remove single $ delimiters
      latex = latex.replace(/^\$|\$$/g, '').trim();
      return <InlineMath math={latex} />;
    } else {
      // Remove double $$ delimiters
      latex = latex.replace(/^\$\$|\$\$$/g, '').trim();
      return <BlockMath math={latex} />;
    }
  } catch (error) {
    // Fallback for invalid LaTeX
    return <span className="text-red-500 text-sm">Invalid LaTeX: {content}</span>;
  }
}

function BlockRenderer({ block, index, topicId }: { block: any; index: number; topicId?: string }) {
  if (!block) return null;

  // Handle math blocks (KaTeX)
  if (block.type === 'math' || block.type === 'math_block') {
    return (
      <div key={index} className="my-6 p-4 bg-gray-50 rounded-lg border-l-[3px] border-indigo-500">
        <div className="text-sm text-gray-700">
          {renderMathContent(block.content || block.text || block.html, false)}
        </div>
      </div>
    );
  }

  if (block.type === 'math_inline') {
    return (
      <span key={index} className="inline-block px-1">
        {renderMathContent(block.content || block.text || block.html, true)}
      </span>
    );
  }



  const htmlText = blockHtmlText(block);
  const text = typeof block.text === 'string' ? block.text : blockHtmlText(block);

  // Custom wrappers for specific element types according to spec
  // We use Tailwind typography plugin (prose) for general text, but override for specific components

  // Handle Quran verse blocks
  if (block.type === 'quran_verse' && block.quran_data) {
    return (
      <div className="my-8">
        <QuranVerseRenderer
          topicId={topicId}
          surah={block.quran_data.surah}
          ayah={block.quran_data.ayah}
          wordAlignments={block.quran_data.word_alignments || []}
        />
      </div>
    );
  }

  if (block.type === 'heading') {
    if (block.level === 2 || (!block.level && index === 0)) {
      return (
        <h2 className="text-[22px] font-medium text-slate-900 border-b-[0.5px] border-slate-200 pb-2 mt-10 mb-4 font-display flex items-center gap-3">
          <div dangerouslySetInnerHTML={{ __html: htmlText || text }} />
        </h2>
      );
    } else if (block.level === 3 || (!block.level && index > 0)) {
      return (
        <h3 className="text-[16px] font-medium text-slate-800 border-l-[3px] border-indigo-600 pl-3 mt-8 mb-4">
          <div dangerouslySetInnerHTML={{ __html: htmlText || text }} />
        </h3>
      );
    } else {
      return <h4 className="text-[14px] font-medium text-emerald-800 mt-6 mb-3" dangerouslySetInnerHTML={{ __html: htmlText || text }} />;
    }
  }

  if (block.type === 'formula') {
    return (
      <div className="my-6 bg-[#f0f4ff] border-l-[3px] border-[#534AB7] rounded-r-xl p-5 shadow-sm">
        <div className="text-[10px] uppercase tracking-wider text-[#534AB7]/80 font-bold mb-2">
          {block.label || 'Formula'}
        </div>
        <div className="font-mono text-[17px] font-bold text-[#26215C] overflow-x-auto">
          {block.formula || block.html || block.text}
        </div>
        {(block.plain_text || block.caption) && (
          <div className="text-[12px] text-[#26215C]/70 mt-2">
            {block.plain_text || block.caption}
          </div>
        )}
      </div>
    );
  }

  if (block.type === 'activity' || htmlText.toLowerCase().includes('activity')) {
    return (
      <div className="my-8 bg-[#E1F5EE] border-l-[3px] border-[#1D9E75] rounded-r-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Beaker className="w-4 h-4 text-[#1D9E75]" />
          <span className="text-[12px] uppercase tracking-wider text-[#085041] font-bold">
            Activity / Experiment
          </span>
        </div>
        <div className="text-[14px] text-[#085041] leading-[1.6]" dangerouslySetInnerHTML={{ __html: htmlText }} />
      </div>
    );
  }

  if (block.type === 'example' || htmlText.toLowerCase().includes('example')) {
    return (
      <div className="my-8 bg-[#FAEEDA] border-[0.5px] border-[#BA7517] rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-[#BA7517]" />
          <span className="text-[12px] uppercase tracking-wider text-[#412402] font-bold">
            {block.label || 'Example'}
          </span>
        </div>
        <div className="text-[14px] text-[#412402] leading-[1.6] prose-p:mb-2 prose-strong:text-[#412402]" dangerouslySetInnerHTML={{ __html: htmlText }} />
      </div>
    );
  }

  if (block.type === 'callout' || block.type === 'definition') {
    return (
      <div className="my-8 bg-slate-50 border-l-[3px] border-slate-400 rounded-r-xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-slate-500" />
          <span className="text-[12px] uppercase tracking-wider text-slate-700 font-bold">
            {block.type === 'definition' ? 'Definition' : 'Note'}
          </span>
        </div>
        <div className="text-[14px] text-slate-800 leading-[1.6]" dangerouslySetInnerHTML={{ __html: htmlText || text }} />
      </div>
    );
  }

  if (block.type === 'table' || htmlText.includes('<table')) {
    return (
      <div className="overflow-x-auto my-8 bg-white border border-slate-200 rounded-xl shadow-sm">
        <div dangerouslySetInnerHTML={{ __html: htmlText }} className="
          p-4
          prose-table:w-full prose-table:text-left prose-table:border-collapse
          prose-td:p-4 prose-td:border-t prose-td:border-slate-100 prose-td:text-slate-700 prose-td:text-[14px]
          prose-th:bg-slate-50 prose-th:p-4 prose-th:text-slate-800 prose-th:font-semibold prose-th:text-[13px] prose-th:uppercase prose-th:tracking-wider
          prose-caption:caption-top prose-caption:pb-4 prose-caption:text-slate-600 prose-caption:font-medium prose-caption:text-sm
        " />
      </div>
    );
  }

  if (block.type === 'list' || htmlText.includes('<ul')) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: htmlText || `<ul><li>${text}</li></ul>` }}
        className="mb-6 pl-4 text-slate-700 text-[15px] leading-[1.75] marker:text-indigo-500 prose-li:mb-2"
      />
    );
  }

  if (block.type === 'image') {
    return (
      <figure className="my-8">
        <img src={block.url} alt={block.caption} className="rounded-xl shadow-md w-full object-cover max-h-[500px]" />
        {block.caption && <figcaption className="text-center text-[13px] text-slate-500 mt-3 font-medium">{block.caption}</figcaption>}
      </figure>
    );
  }

  // ADD THESE MISSING CASES:
  if (block.type === 'mcq') {
    return <MCQTemplate block={block} />;
  }

  if (block.type === 'question') {
    return <QuestionTemplate block={block} />;
  }

  if (block.type === 'problem') {
    return <ProblemTemplate block={block} />;
  }

  if (block.type === 'summary_point') {
    return <SummaryPointTemplate block={block} />;
  }

  // Default Paragraph Fallback
  return (
    <div
      dangerouslySetInnerHTML={{ __html: htmlText || `<p>${text}</p>` }}
      className="mb-6 text-slate-700 text-[15px] leading-[1.75] prose-strong:text-indigo-700 prose-strong:font-semibold prose-a:text-emerald-600"
    />
  );
}

export function ContentBlockRenderer({ blocks, topicId }: { blocks: any[]; topicId?: string }) {
  if (!blocks || !Array.isArray(blocks)) return null;
  return (
    <div className="studyvault-reader-content">
      {blocks.map((block, i) => (
        <BlockRenderer key={i} block={block} index={i} topicId={topicId} />
      ))}
    </div>
  );
}
