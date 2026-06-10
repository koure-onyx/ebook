'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'parent' | 'admin';
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'family';
    status: 'active' | 'expired' | 'cancelled';
    expires_at: string;
  };
}

interface CourseRecord {
  _id: string;
  title: string;
  subject: string;
  program_name: string;
  board: string;
  ingestion_status: 'pending' | 'processing' | 'complete';
  workflow_status: 'draft' | 'pending_review' | 'live' | 'rejected';
  total_chapters: number;
  total_topics: number;
}

export default function AdminControlPage() {
  const { data: session, status } = useSession();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message?: string; error?: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Add admin endpoints to Express backend for users and courses
        setResult({ success: false, error: 'Admin control endpoints not yet available in Express backend. This page requires /api/admin/users and /api/admin/courses endpoints.' });
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Loading admin control board...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">Administrative Control Board</h1>
            <p className="text-gray-400 text-sm">Manage users, courses, and system configuration</p>
          </div>
        </div>

        {result && (
          <Card className="bg-amber-50 border-amber-200 p-4">
            <p className="text-amber-800 text-sm">{result.error}</p>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-purple-300 mb-4">User Overrides</h3>
            <p className="text-gray-400 text-xs">Endpoint not yet available in Express backend.</p>
          </Card>

          <Card className="bg-white/5 backdrop-blur-md rounded-lg border border-white/10 p-4">
            <h3 className="text-sm font-semibold text-blue-300 mb-4">Course Workflow</h3>
            <p className="text-gray-400 text-xs">Endpoint not yet available in Express backend.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
