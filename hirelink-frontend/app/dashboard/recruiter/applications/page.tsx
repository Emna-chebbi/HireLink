'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, getAuthToken } from '@/lib/api';

type ApplicationStatus = 'new' | 'in_process' | 'rejected' | 'hired';

type ApplicationItem = {
  id: number;
  candidate_name: string;
  candidate_email: string;
  job_id: number;
  job_title: string;
  status: ApplicationStatus;
  applied_at: string;
};

export default function RecruiterApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Future AI state (placeholder)
  const [selectedApp, setSelectedApp] = useState<ApplicationItem | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      router.push('/login');
      return;
    }

    if (typeof window !== 'undefined') {
      const role = localStorage.getItem('user_role');
      if (role !== 'recruiter') {
        router.push('/login');
        return;
      }
    }

    loadApplications(token);
  }, [router]);

  async function loadApplications(token: string) {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch('/users/recruiter/applications/', {}, token);
      setApplications(data.applications || []);
    } catch (err: any) {
      console.error('Error loading recruiter applications:', err);
      if (err?.status === 401) {
        setError('Session expired. Please log in again.');
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
        router.push('/login');
      } else {
        setError(
          err?.message ||
            'Unable to load your applications.'
        );
      }
    } finally {
      setLoading(false);
    }
  }

  const totalNew = applications.filter((a) => a.status === 'new').length;
  const totalInProcess = applications.filter((a) => a.status === 'in_process').length;
  const totalHired = applications.filter((a) => a.status === 'hired').length;

  return (
    <div>
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="text-sm text-slate-400">
            Track all applications received for your job postings.
          </p>
        </div>
      </header>

      {error && (
        <div className="mb-4 rounded-md border border-red-500/60 bg-red-500/10 px-3 py-2 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-300">Loading applications...</p>
      ) : applications.length === 0 ? (
        <p className="text-sm text-slate-300">
          You do not have any applications yet.
        </p>
      ) : (
        <div className="space-y-4">
          {/* Top KPIs */}
          <section className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">Total applications</p>
              <p className="mt-1 text-2xl font-semibold">
                {applications.length}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">New</p>
              <p className="mt-1 text-2xl font-semibold">
                {totalNew}
              </p>
            </div>
            <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">In process / Hired</p>
              <p className="mt-1 text-2xl font-semibold">
                {totalInProcess + totalHired}
              </p>
            </div>
          </section>

          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            {/* Applications table */}
            <section className="overflow-hidden rounded-lg border border-slate-800 bg-slate-900/60">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Candidate</th>
                    <th className="px-4 py-3">Job</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Applied on</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="border-t border-slate-800/80 hover:bg-slate-900/80"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium">{app.candidate_name}</div>
                        <div className="text-xs text-slate-400">
                          {app.candidate_email}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{app.job_title}</div>
                        <div className="text-xs text-slate-400">
                          Job ID: {app.job_id}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        <span
                          className={
                            app.status === 'new'
                              ? 'rounded-full bg-blue-600/20 px-2 py-1 text-blue-300'
                              : app.status === 'in_process'
                              ? 'rounded-full bg-yellow-500/20 px-2 py-1 text-yellow-300'
                              : app.status === 'hired'
                              ? 'rounded-full bg-emerald-500/20 px-2 py-1 text-emerald-300'
                              : 'rounded-full bg-red-500/20 px-2 py-1 text-red-300'
                          }
                        >
                          {app.status === 'new'
                            ? 'New'
                            : app.status === 'in_process'
                            ? 'In process'
                            : app.status === 'hired'
                            ? 'Hired'
                            : 'Rejected'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-300">
                        {app.applied_at}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() =>
                            router.push(
                              `/dashboard/recruiter/jobs/${app.job_id}/applications/${app.id}`
                            )
                          }
                          className="rounded-md bg-blue-600 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-500"
                        >
                          View
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedApp(app)}
                          className="rounded-md border border-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/10"
                        >
                          AI actions
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>

            {/* AI integration panel (placeholder) */}
            <aside className="rounded-lg border border-slate-800 bg-slate-900/70 p-4">
              <h2 className="mb-2 text-sm font-semibold text-slate-100">
                AI assistant
              </h2>
              {selectedApp ? (
                <div className="space-y-2 text-xs text-slate-300">
                  <p>
                    Selected candidate:{' '}
                    <span className="font-semibold">
                      {selectedApp.candidate_name}
                    </span>
                    {' · '}
                    {selectedApp.job_title}
                  </p>

                  <p className="text-slate-400">
                    This is where you will plug your AI to generate emails
                    (rejection, follow‑up, interview invitation), summarize
                    resumes, or suggest next steps.
                  </p>

                  <button
                    type="button"
                    className="mt-2 w-full rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500"
                  >
                    Generate email with AI
                  </button>
                </div>
              ) : (
                <p className="text-xs text-slate-400">
                  Select an application in the table to use the AI assistant.
                </p>
              )}
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}
