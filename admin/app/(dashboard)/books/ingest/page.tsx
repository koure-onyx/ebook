'use client';

import { useState } from 'react';
import { BookOpen, Upload, CheckCircle, AlertCircle, Loader2, Eye, X } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { adminApi } from '@/lib/api/admin';

// Helper to generate canonical board slug (matches student app's reader-urls.ts)
function canonicalBoardSlug(value: string): string {
  if (!value) return 'PUB';
  const segment = String(value).trim().replace(/\s+/g, '-').replace(/\/+/g, '-');
  const normalized = segment.toLowerCase();
  const PUNJAB_BOARD_ALIASES = new Set([
    'pb', 'punjab', 'punjab-board', 'punjab-board-of-intermediate-and-secondary-education',
    'punjab-curriculum-and-textbook-board', 'punjab-curriculum-and-textboard-board-pctb',
    'punjab-curriculum-and-textbook-board-pctb', 'pub',
  ]);
  if (PUNJAB_BOARD_ALIASES.has(normalized) || normalized.includes('punjab')) {
    return 'PUB';
  }
  return segment;
}

interface IngestionState {
  idle: boolean;
  loading: boolean;
  success: boolean;
  error: boolean;
}

function normalizeGradeForUrl(value: string): string {
  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return '9';
  if (normalized.includes('all')) return 'all';
  const numeric = normalized.match(/\d{1,2}/)?.[0];
  if (numeric) return numeric;
  return normalized.replace(/^class[-\s]*/i, '').replace(/^grade[-\s]*/i, '') || '9';
}

function buildStudentPreviewUrl(result: any, formData: { board: string; gradeLevel: string; subject: string }) {
  const studentAppUrl = process.env.NEXT_PUBLIC_STUDENT_APP_URL || 'http://localhost:3000';
  const boardSlug = canonicalBoardSlug(
    result?.boardShortCode ||
    result?.board_short_code ||
    result?.book?.board_id?.short_code ||
    result?.book?.board_short_code ||
    formData.board ||
    'PUB'
  ).toLowerCase();
  const grade = normalizeGradeForUrl(result?.grade || result?.book?.grade || formData.gradeLevel);
  const subjectSlug = String(
    result?.subjectSlug ||
    result?.subject_slug ||
    result?.book?.subject_slug ||
    formData.subject
  ).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

  if (!subjectSlug) return null;
  return `${studentAppUrl}/books/${boardSlug}/${grade}/${subjectSlug}`;
}

function normalizeTopic(topic: any, index: number) {
  return {
    title: topic?.title || `Topic ${index + 1}`,
    slug: topic?.slug || String(topic?.title || `topic-${index + 1}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
    topic_number: topic?.topic_number || topic?.number || index + 1,
    title_urdu: topic?.title_urdu || '',
    display_order: topic?.display_order ?? index + 1,
    difficulty: topic?.difficulty || 'medium',
    estimated_read_time: topic?.estimated_read_time || 3,
    edition_year: topic?.edition_year || new Date().getFullYear(),
    seo: topic?.seo || {},
    raw_text: topic?.raw_text || '',
    clean_html: topic?.clean_html || '',
    content_blocks: topic?.content_blocks || [],
    formulas: topic?.formulas || [],
    key_terms: topic?.key_terms || [],
    book_mcqs: topic?.book_mcqs || [],
    book_short_questions: topic?.book_short_questions || [],
    book_problems: topic?.book_problems || [],
    keywords: topic?.keywords || [],
  };
}

function collectTopics(parsedJson: any) {
  if (Array.isArray(parsedJson?.topics) && parsedJson.topics.length > 0) {
    return parsedJson.topics.map(normalizeTopic);
  }

  if (Array.isArray(parsedJson?.chapter?.topics) && parsedJson.chapter.topics.length > 0) {
    return parsedJson.chapter.topics.map(normalizeTopic);
  }

  if (Array.isArray(parsedJson?.book_metadata?.topics) && parsedJson.book_metadata.topics.length > 0) {
    return parsedJson.book_metadata.topics.map(normalizeTopic);
  }

  if (Array.isArray(parsedJson?.chapters) && parsedJson.chapters.length > 0) {
    const chapterEntry = parsedJson.chapters.find((ch: any) => Array.isArray(ch?.topics) && ch.topics.length > 0) || parsedJson.chapters[0];
    if (Array.isArray(chapterEntry?.topics) && chapterEntry.topics.length > 0) {
      return chapterEntry.topics.map(normalizeTopic);
    }
  }

  return [];
}

function getFirstChapter(parsedJson: any) {
  if (parsedJson?.chapter) return parsedJson.chapter;
  if (Array.isArray(parsedJson?.chapters) && parsedJson.chapters.length > 0) {
    const chapterEntry = parsedJson.chapters.find((ch: any) => ch?.chapter_number || ch?.number || ch?.id) || parsedJson.chapters[0];
    return chapterEntry;
  }
  return null;
}

export default function BooksIngestPage() {
  const [state, setState] = useState<IngestionState>({ idle: true, loading: false, success: false, error: false });
  const [result, setResult] = useState<{ success: boolean; message: string; data?: any } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const { data: session } = useSession();

  const [formData, setFormData] = useState({
    title: '',
    gradeLevel: '',
    board: '',
    subject: '',
    description: '',
    coverImageUrl: '',
    jsonPayload: '',
  });

  const generateSlug = (text: string): string => {
    if (!text) return '';
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').trim();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState({ idle: false, loading: true, success: false, error: false });
    setResult(null);

    try {
      const parsedJson = JSON.parse(formData.jsonPayload);

      const chapterSource = getFirstChapter(parsedJson) || parsedJson.book_metadata?.chapter || {};
      const chapterNumber = chapterSource.number || chapterSource.chapter_number || chapterSource.id;
      const chapterTitle = chapterSource.title || chapterSource.name;
      const chapterDescription = chapterSource.description;

      if (chapterNumber === undefined || chapterNumber === null) {
        throw new Error('JSON payload must contain a "chapter" object with a "number", "chapter_number", or "id" field');
      }

      const chapterNum = Number(chapterNumber);
      if (isNaN(chapterNum) || chapterNum < 1) {
        throw new Error('Chapter number must be a valid positive integer (got: ' + chapterNumber + ')');
      }

      const ingestionData = {
        book_metadata: {
          title: parsedJson.book_metadata?.title || formData.title,
          subject: parsedJson.book_metadata?.subject || formData.subject,
          subject_slug: parsedJson.book_metadata?.subject_slug || generateSlug(formData.subject),
          grade_level: parsedJson.book_metadata?.grade_level || formData.gradeLevel,
          board: parsedJson.book_metadata?.board || formData.board,
          edition_year: parsedJson.book_metadata?.edition_year || new Date().getFullYear(),
          publisher: parsedJson.book_metadata?.publisher || '',
          authors: parsedJson.book_metadata?.authors || [],
          language: parsedJson.book_metadata?.language || '',
          script_direction: parsedJson.book_metadata?.script_direction || '',
          cover_image: parsedJson.book_metadata?.cover_image_url || formData.coverImageUrl,
          description: parsedJson.book_metadata?.description || formData.description,
        },
        chapter: {
          chapter_number: chapterNum,
          title: chapterTitle || `Chapter ${chapterNum}`,
          slug: chapterSource.slug || generateSlug(chapterTitle || `Chapter ${chapterNum}`),
          chapter_number_display: chapterSource.chapter_number_display || `Chapter ${chapterNum}`,
          chapter_summary: chapterDescription || chapterSource.chapter_summary || '',
          page_start: chapterSource.page_start,
          page_end: chapterSource.page_end,
          student_learning_outcomes: chapterSource.student_learning_outcomes || [],
          seo: chapterSource.seo || {},
        },
        topics: collectTopics(parsedJson),
      };

      const ingestResult = await adminApi.ingestion.ingestBook(ingestionData);

      setResult({ success: true, message: 'Book ingested successfully!', data: ingestResult });
      setState({ idle: false, loading: false, success: true, error: false });
    } catch (error: any) {
      const details = error?.details;
      const detailMessage = Array.isArray(details) ? details.join(', ') : (typeof details === 'string' ? details : '');
      setResult({
        success: false,
        message: detailMessage ? `${error.message || 'An unexpected error occurred'}: ${detailMessage}` : (error.message || 'An unexpected error occurred'),
      });
      setState({ idle: false, loading: false, success: false, error: true });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const value = event.target?.result as string;
      setFormData(prev => ({ ...prev, jsonPayload: value }));

      try {
        const parsed = JSON.parse(value);
        if (parsed.book_metadata) {
          setFormData(prev => ({
            ...prev,
            title: parsed.book_metadata.title || '',
            gradeLevel: parsed.book_metadata.grade_level || '',
            board: parsed.book_metadata.board || '',
            subject: parsed.book_metadata.subject || '',
            description: parsed.book_metadata.description || '',
            coverImageUrl: parsed.book_metadata.cover_image_url || '',
          }));
        }
      } catch {
        // Invalid JSON, ignore auto-fill
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-indigo-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Ingest New Book
          </h1>
        </div>
        <p className="text-slate-600">Upload a DeepSeek-generated JSON file to ingest a new textbook.</p>
      </div>

      {state.success && result && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-green-900">Ingestion Successful</h3>
            <p className="text-sm text-green-700 mt-1">{result.message}</p>
            {(() => {
              const previewUrl = buildStudentPreviewUrl(result.data, formData);
              return previewUrl ? (
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                <Eye className="h-4 w-4" />
                Preview in Student App
              </a>
              ) : null;
            })()}
          </div>
          <button
            type="button"
            onClick={() => {
              setState({ idle: true, loading: false, success: false, error: false });
              setResult(null);
              setFormData({ title: '', gradeLevel: '', board: '', subject: '', description: '', coverImageUrl: '', jsonPayload: '' });
            }}
            className="mt-3 ml-2 inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <X className="h-4 w-4" /> Reset Form
          </button>
        </div>
      )}

      {state.error && result && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-medium text-red-900">Ingestion Failed</h3>
            <p className="text-sm text-red-700 mt-1">{result.message}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-400" /> Book Metadata
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Book Title *</label>
              <input type="text" id="title" required value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., Mathematics Class 10" />
            </div>
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input type="text" id="subject" required value={formData.subject} onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., Mathematics" />
            </div>
            <div>
              <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-1">Grade Level *</label>
              <input type="text" id="gradeLevel" required value={formData.gradeLevel} onChange={(e) => setFormData(prev => ({ ...prev, gradeLevel: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., Class 10" />
            </div>
            <div>
              <label htmlFor="board" className="block text-sm font-medium text-gray-700 mb-1">Board *</label>
              <input type="text" id="board" required value={formData.board} onChange={(e) => setFormData(prev => ({ ...prev, board: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="e.g., FBISE" />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea id="description" rows={2} value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none" placeholder="Optional book description..." />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="coverImageUrl" className="block text-sm font-medium text-gray-700 mb-1">Cover Image URL</label>
              <input type="url" id="coverImageUrl" value={formData.coverImageUrl} onChange={(e) => setFormData(prev => ({ ...prev, coverImageUrl: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="https://example.com/cover.jpg" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Upload className="h-5 w-5 text-gray-400" /> JSON Payload *
          </h2>
          <div>
            <label htmlFor="jsonPayload" className="block text-sm font-medium text-gray-700 mb-1">DeepSeek JSON Format</label>
            <input type="file" id="jsonFile" accept=".json" required onChange={handleFileUpload} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            {formData.jsonPayload && (<p className="mt-2 text-sm text-green-600 flex items-center gap-1"><CheckCircle className="h-4 w-4" /> JSON loaded successfully</p>)}
            <p className="mt-2 text-sm text-gray-500">Select your DeepSeek-generated JSON file here. Metadata will be auto-extracted if available.</p>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button type="submit" disabled={state.loading} className="w-full md:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            {state.loading ? (<><Loader2 className="h-5 w-5 animate-spin" /> Processing Ingestion...</>) : (<><Upload className="h-5 w-5" /> Start Ingestion</>)}
          </button>
        </div>
      </form>

      <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-3">How to use:</h3>
        <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
          <li>Generate curriculum content using DeepSeek AI with the book ingestion prompt and save it as a <code className="bg-gray-200 px-1 rounded">.json</code> file.</li>
          <li>The file must contain <code className="bg-gray-200 px-1 rounded">book_metadata</code>, <code className="bg-gray-200 px-1 rounded">chapter</code>, and <code className="bg-gray-200 px-1 rounded">topics</code>.</li>
          <li>Select the JSON file in the payload field above - metadata will auto-fill.</li>
          <li>Review and adjust metadata if needed.</li>
          <li>Click "Start Ingestion" to process the content.</li>
        </ol>
      </div>
    </div>
  );
}
