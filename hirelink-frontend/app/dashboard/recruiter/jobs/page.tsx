// app/dashboard/recruiter/jobs/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import ConfirmationModal from '@/app/components/ConfirmationModal';

type Job = {
  id: number;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level: string;
  is_active: boolean;
  created_at: string;
  applications_count?: number;
  salary_min?: number;
  salary_max?: number;
  salary_currency: string;
};

export default function RecruiterJobsPage() {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    jobId: number | null;
    jobTitle: string;
  }>({
    isOpen: false,
    jobId: null,
    jobTitle: '',
  });

  useEffect(() => {
    const access = localStorage.getItem('access_token');
    
    if (!access) {
      router.replace('/login');
      return;
    }

    async function loadJobs() {
      try {
        setLoading(true);
        console.log('Loading recruiter jobs...');
        const data = await apiFetch('/jobs/recruiter/jobs/', { 
          method: 'GET' 
        }, access!);
        
        console.log('Jobs data received:', data);
        setJobs(data.results || data);
      } catch (err: any) {
        console.error('Error loading jobs:', err);
        setError(`Unable to load your job postings: ${err.message?.detail || err.message}`);
      } finally {
        setLoading(false);
      }
    }

    loadJobs();
  }, [router]);

  const toggleJobStatus = async (jobId: number, currentStatus: boolean) => {
    const access = localStorage.getItem('access_token');
    if (!access) return;

    setUpdating(jobId);
    
    try {
      await apiFetch(
        `/jobs/recruiter/jobs/${jobId}/toggle/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
        access!
      );

      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, is_active: !currentStatus } : job
      ));
    } catch (err) {
      console.error('Error toggling job status:', err);
      alert('Error updating job status.');
    } finally {
      setUpdating(null);
    }
  };

  const openDeleteModal = (jobId: number, jobTitle: string) => {
    setDeleteModal({
      isOpen: true,
      jobId,
      jobTitle,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      jobId: null,
      jobTitle: '',
    });
  };

  const deleteJob = async (jobId: number) => {
  const access = localStorage.getItem('access_token');
  if (!access) return;

  setUpdating(jobId);
  
  try {
    console.log('Deleting job ID:', jobId);
    const response = await apiFetch(
      `/jobs/${jobId}/delete/`,
      {
        method: 'DELETE',
      },
      access!
    );

    console.log('Delete response:', response);
    
    // Remove job from the list immediately
    setJobs(jobs.filter(job => job.id !== jobId));
    closeDeleteModal();
    
    // Optional: Show success toast
    alert('Job deleted successfully!');
  } catch (err: any) {
    console.error('Error deleting job:', err);
    alert(`Error deleting job: ${err.message?.detail || err.message || 'Please try again.'}`);
  } finally {
    setUpdating(null);
  }
};

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getJobTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'full_time': 'Full Time',
      'part_time': 'Part Time',
      'contract': 'Contract',
      'internship': 'Internship',
      'remote': 'Remote',
    };
    return types[type] || type;
  };

  const getExperienceLabel = (level: string) => {
    const levels: Record<string, string> = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'executive': 'Executive',
    };
    return levels[level] || level;
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Loading your jobs...</p>
        </div>
      </main>
    );
  }

  return (
    <>
      <main className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Job Postings
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage all your job postings ({jobs.length} total)
              </p>
            </div>
            <Link
              href="/dashboard/recruiter/jobs/create"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              New Job
            </Link>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-6 text-lg font-medium text-gray-900 dark:text-white">
              No jobs posted
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Start by creating your first job posting.
            </p>
            <div className="mt-6">
              <Link
                href="/dashboard/recruiter/jobs/create"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                Create your first job
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Job
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Details
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {job.title}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {job.company}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900 dark:text-gray-300">
                            {getJobTypeLabel(job.job_type)} • {getExperienceLabel(job.experience_level)}
                          </div>
                          <div className="text-gray-500 dark:text-gray-400">
                            {job.location}
                          </div>
                          {(job.salary_min || job.salary_max) && (
                            <div className="text-gray-500 dark:text-gray-400 mt-1">
                              {job.salary_min && job.salary_max 
                                ? `${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()} ${job.salary_currency}`
                                : job.salary_min
                                  ? `From ${job.salary_min.toLocaleString()} ${job.salary_currency}`
                                  : job.salary_max
                                    ? `Up to ${job.salary_max.toLocaleString()} ${job.salary_currency}`
                                    : ''
                              }
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          job.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(job.created_at)}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleJobStatus(job.id, job.is_active)}
                            disabled={updating === job.id}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updating === job.id ? (
                              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                              </svg>
                            ) : job.is_active ? (
                              'Deactivate'
                            ) : (
                              'Activate'
                            )}
                          </button>
                          <Link
                            href={`/dashboard/recruiter/jobs/${job.id}/edit`}
                            className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => openDeleteModal(job.id, job.title)}
                            disabled={updating === job.id}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={() => deleteModal.jobId && deleteJob(deleteModal.jobId)}
        title="Delete Job"
        message={`Are you sure you want to delete "${deleteModal.jobTitle}"? This action is irreversible.`}
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        isLoading={updating === deleteModal.jobId}
/>
    </>
  );
}