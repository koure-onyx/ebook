import React from 'react';
import { Beaker, Lightbulb, Info } from 'lucide-react';
import QuranVerseRenderer from '@/components/QuranVerseRenderer';

function blockHtmlText(block: any): string {
  const raw = block?.html ?? block?.text ?? '';
  return typeof raw === 'string' ? raw : String(raw);
}

function BlockRenderer({ block, index, topicId }: { block: any; index: number; topicId?: string }) {
  if (!block) return null;

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
