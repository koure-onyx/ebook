'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Edit2 } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { adminApi } from '@/lib/api/admin';

interface Topic {
  _id: string;
  title: string;
  chapter_id: {
    title: string;
    chapter_number: number;
  };
  book_id: {
    title: string;
    subject: string;
  };
  workflow_status: 'draft' | 'pending_review' | 'approved' | 'rejected' | 'live';
  version_status: 'new' | 'unchanged' | 'modified';
  is_live: boolean;
}

const ARABIC_RE = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufeff]/;

function arabicTextProps(value?: string) {
  if (!value || !ARABIC_RE.test(value)) return {};
  return {
    dir: 'rtl',
    lang: 'ar',
    className: 'arabic-content font-quran-core text-right leading-[2.6]',
  };
}

export default function ContentReviewPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set());
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);
  const { data: session } = useSession();

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      // TODO: Backend endpoint for content review not yet available
      // Using placeholder - will need to add /topics?status=draft,pending_review to Express backend
      setResult({ success: false, error: 'Content review endpoint not yet available in Express backend' });
      setTopics([]);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch topics'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async (topicId: string) => {
    try {
      setActionLoading(`preview-${topicId}`);
      // TODO: Add topic preview endpoint to Express backend
      setResult({ success: false, error: 'Topic preview endpoint not yet available' });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to open preview',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (topicId: string) => {
    try {
      setActionLoading(topicId);
      // TODO: Add topic approval endpoint to Express backend
      setResult({ success: false, error: 'Topic approval endpoint not yet available in Express backend' });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to approve topic'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedTopics.size === 0) return;
    try {
      setActionLoading('bulk');
      // TODO: Add bulk approval endpoint to Express backend
      setResult({ success: false, error: 'Bulk approval endpoint not yet available in Express backend' });
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to bulk approve'
      });
    } finally {
      setActionLoading(null);
    }
  };

  const toggleSelect = (topicId: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicId)) {
      newSelected.delete(topicId);
    } else {
      newSelected.add(topicId);
    }
    setSelectedTopics(newSelected);
  };

  const selectAllUnchanged = () => {
    const unchanged = topics.filter(t => t.version_status === 'unchanged');
    setSelectedTopics(new Set(unchanged.map(t => t._id)));
  };

  const getVersionBadgeColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'modified': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'unchanged': return 'bg-slate-100 text-slate-600 border-slate-300';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-100 text-slate-700';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'live': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-medium">Loading topics for review...</p>
        </div>
      </div>
    );
  }

  const unchangedCount = topics.filter(t => t.version_status === 'unchanged').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Content Review
            </h1>
            <p className="text-slate-600 mt-1">
              Review and approve textbook topics before publishing
            </p>
          </div>
          {unchangedCount > 0 && (
            <Button onClick={selectAllUnchanged} variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
              Select All Unchanged ({unchangedCount})
            </Button>
          )}
        </div>

        {selectedTopics.size > 0 && (
          <Card className="bg-emerald-50 border-emerald-200">
            <div className="flex items-center justify-between">
              <p className="font-medium text-emerald-800">{selectedTopics.size} topic(s) selected</p>
              <div className="flex gap-3">
                <Button onClick={() => setSelectedTopics(new Set())} variant="outline" size="sm">Clear Selection</Button>
                <Button onClick={handleBulkApprove} disabled={actionLoading === 'bulk'} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  {actionLoading === 'bulk' ? 'Approving...' : `Approve ${selectedTopics.size}`}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {result && (
          <Alert variant={result.success ? 'success' : 'error'} onDismiss={() => setResult(null)}>
            {result.success ? result.message : result.error}
          </Alert>
        )}

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left w-12">
                    <input type="checkbox" checked={selectedTopics.size === topics.length && topics.length > 0} onChange={(e) => {
                      if (e.target.checked) setSelectedTopics(new Set(topics.map(t => t._id)));
                      else setSelectedTopics(new Set());
                    }} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Topic Title</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Chapter</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Version</th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  <th className="px-4 py-3 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {topics.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <div className="space-y-3">
                        <div className="w-16 h-16 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-slate-600 font-medium">No topics pending review</p>
                        <p className="text-sm text-slate-500">All caught up! Check back later for new content.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  topics.map((topic) => (
                    <tr key={topic._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selectedTopics.has(topic._id)} onChange={() => toggleSelect(topic._id)} className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800" {...arabicTextProps(topic.title)}>{topic.title}</div>
                        <div className="text-xs text-slate-500" {...arabicTextProps(topic.book_id?.subject)}>{topic.book_id?.subject}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        <span {...arabicTextProps(topic.chapter_id?.title)}>{topic.chapter_id?.title || `Ch ${topic.chapter_id?.chapter_number}`}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${getVersionBadgeColor(topic.version_status)}`}>
                          {topic.version_status === 'new' && (<span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-emerald-500" /> New</span>)}
                          {topic.version_status === 'modified' && (<span className="flex items-center gap-1"><Edit2 className="w-3 h-3 text-amber-500" /> Modified</span>)}
                          {topic.version_status === 'unchanged' && (<span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-slate-400" /> Unchanged</span>)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(topic.workflow_status)}`}>{topic.workflow_status.replace('_', ' ')}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button onClick={() => handlePreview(topic._id)} disabled={actionLoading === `preview-${topic._id}`} variant="outline" size="sm">
                            {actionLoading === `preview-${topic._id}` ? '...' : 'Preview'}
                          </Button>
                          <Button onClick={() => handleApprove(topic._id)} disabled={actionLoading === topic._id} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                            {actionLoading === topic._id ? '...' : 'Approve'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {topics.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-blue-50 border-blue-200 text-center p-4">
              <div className="text-2xl font-bold text-blue-600">{topics.filter(t => t.version_status === 'new').length}</div>
              <div className="text-sm text-blue-700">New Topics</div>
            </Card>
            <Card className="bg-orange-50 border-orange-200 text-center p-4">
              <div className="text-2xl font-bold text-orange-600">{topics.filter(t => t.version_status === 'modified').length}</div>
              <div className="text-sm text-orange-700">Modified</div>
            </Card>
            <Card className="bg-slate-50 border-slate-200 text-center p-4">
              <div className="text-2xl font-bold text-slate-600">{topics.filter(t => t.version_status === 'unchanged').length}</div>
              <div className="text-sm text-slate-700">Unchanged</div>
            </Card>
            <Card className="bg-emerald-50 border-emerald-200 text-center p-4">
              <div className="text-2xl font-bold text-emerald-600">{selectedTopics.size}</div>
              <div className="text-sm text-emerald-700">Selected</div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
