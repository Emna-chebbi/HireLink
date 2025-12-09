// app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';

type UserProfile = {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'candidate' | 'recruiter' | string;
  full_name?: string;
  is_validated?: boolean;
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const access = localStorage.getItem('access_token');

    if (!access) {
      router.replace('/login');
      return;
    }

    async function loadProfile() {
      try {
        const data = await apiFetch('/users/profile/', { method: 'GET' }, access!);
        setUser(data);
      } catch {
        setError('Unable to load your profile. Please log in again.');
      }
    }

    loadProfile();
  }, [router]);

  if (error) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-red-300">
        {error}
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 text-slate-200">
        Loading dashboard...
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 text-slate-900 dark:text-slate-50">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Profile
          </h2>
          <p className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Name:</span>{' '}
            <span className="font-medium">
              {user.full_name || user.username}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Email:</span>{' '}
            <span className="font-medium">{user.email}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-500 dark:text-slate-400">Role:</span>{' '}
            <span className="font-medium capitalize">{user.role}</span>
          </p>
          {user.role === 'recruiter' && (
            <p className="mt-2 text-xs text-slate-400">
              Recruiter account status:{' '}
              <span className="font-semibold text-slate-200">
                {user.is_validated ? 'Validated by administrator' : 'Pending validation'}
              </span>
            </p>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Quick Access
          </h2>
          <ul className="space-y-2 text-sm text-blue-600 dark:text-blue-300">
            {user.role === 'candidate' && (
              <>
                <li>Browse available jobs</li>
                <li>Track your applications</li>
              </>
            )}
            {user.role === 'recruiter' && (
              <>
                <li>Post a new job</li>
                <li>Manage received applications</li>
              </>
            )}
            {user.role === 'admin' && (
              <>
                <li>Validate recruiter accounts</li>
                <li>Monitor platform activity</li>
              </>
            )}
          </ul>
        </section>

        {user.role === 'recruiter' && (
          <section className="md:col-span-2 mt-4 rounded-xl border border-slate-200 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-r dark:from-gray-900 dark:to-slate-900">
            <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              Job Management
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              <Link
                href="/dashboard/recruiter"
                className="block rounded-lg bg-white px-4 py-4 text-center shadow hover:shadow-md transition-shadow dark:bg-slate-800"
              >
                <div className="mb-2 inline-block rounded-lg bg-blue-100 p-3 dark:bg-blue-900/30">
                  <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-200">
                  Dashboard
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Statistics and overview
                </p>
              </Link>
              
              <Link
                href="/dashboard/recruiter/jobs/create"
                className="block rounded-lg bg-white px-4 py-4 text-center shadow hover:shadow-md transition-shadow dark:bg-slate-800"
              >
                <div className="mb-2 inline-block rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
                  <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-200">
                  New Job
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Post a new job opening
                </p>
              </Link>
              
              <Link
                href="/dashboard/recruiter/jobs"
                className="block rounded-lg bg-white px-4 py-4 text-center shadow hover:shadow-md transition-shadow dark:bg-slate-800"
              >
                <div className="mb-2 inline-block rounded-lg bg-purple-100 p-3 dark:bg-purple-900/30">
                  <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-medium text-slate-900 dark:text-slate-200">
                  My Jobs
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  Manage all my job postings
                </p>
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}