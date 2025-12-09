// app/dashboard/recruiter/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type JobStats = {
  total_jobs: number;
  active_jobs: number;
  total_applications: number;
};

type RecentJob = {
  id: number;
  title: string;
  company: string;
  is_active: boolean;
  created_at: string;
  applications_count?: number;
};

type DashboardData = {
  stats: JobStats;
  recent_jobs: RecentJob[];
  applications_by_status: Array<{
    status: string;
    count: number;
  }>;
};

export default function RecruiterDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const access = localStorage.getItem('access_token');
    
    if (!access) {
      router.replace('/login');
      return;
    }

    async function loadDashboardData() {
      try {
        setLoading(true);
        console.log('Loading dashboard stats...');
        const response = await apiFetch('/jobs/recruiter/stats/', { 
          method: 'GET' 
        }, access!);
        
        console.log('Dashboard response:', response);
        setData(response);
      } catch (err: any) {
        console.error('Error loading dashboard:', err);
        if (err.status === 403) {
          setError('Access restricted to recruiters only.');
          router.push('/dashboard');
        } else if (err.status === 404) {
          setError('Dashboard endpoint not found. Please check backend configuration.');
        } else {
          setError(`Unable to load dashboard data: ${err.message?.detail || err.message}`);
        }
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [router]);

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading recruiter dashboard...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">Error</h2>
          <p className="text-red-700 dark:text-red-400">{error}</p>
          <div className="mt-4 space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to main dashboard
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Recruiter Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your job postings and applications
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data?.stats.total_jobs || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Jobs
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data?.stats.active_jobs || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Applications
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                {data?.stats.total_applications || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard/recruiter/jobs/create"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col items-center justify-center group"
          >
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
              <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Post New Job
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Create and publish a new job posting
            </p>
          </Link>

          <Link
            href="/dashboard/recruiter/jobs"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col items-center justify-center group"
          >
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mb-4 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-colors">
              <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Manage My Jobs
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              View and edit your existing job postings
            </p>
          </Link>

          <Link
            href="/dashboard/recruiter/applications"
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow hover:shadow-lg transition-shadow flex flex-col items-center justify-center group"
          >
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg mb-4 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              View Applications
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              Manage all received applications
            </p>
          </Link>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Recent Jobs
          </h2>
          <Link
            href="/dashboard/recruiter/jobs"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {data?.recent_jobs && data.recent_jobs.length > 0 ? (
            data.recent_jobs.map((job) => (
              <div key={job.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">{job.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {job.company} • Posted on {new Date(job.created_at).toLocaleDateString('en-US')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      job.is_active 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {job.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Link
                        href={`/dashboard/recruiter/jobs/${job.id}`} 
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Manage
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center">
              <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-4 text-gray-500 dark:text-gray-400">
                No jobs posted yet
              </p>
              <Link
                href="/dashboard/recruiter/jobs/create"
                className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post your first job
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}