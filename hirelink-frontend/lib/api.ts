// lib/api.ts - FIXED (correct endpoints)
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// File upload helper for applications
export async function apiUploadFile(
  path: string,
  formData: FormData,
  accessToken: string
) {
  const headers: HeadersInit = {
    'Authorization': Bearer ${accessToken},
  };
  
  let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
  
  const res = await fetch(${baseUrl}${path}, {
    method: 'POST',
    headers,
    body: formData,
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || Request failed with status ${res.status});
  }

  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return text;
  }
}

export async function apiFetch(
  endpoint: string,
  options: RequestInit = {},
  accessToken?: string | null
): Promise<any> {
  // Get base URL
  let baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';
  
  // Remove any trailing slash
  baseUrl = baseUrl.replace(/\/$/, '');
  
  const url = ${baseUrl}${endpoint};
  console.log('API Request URL:', url, options.method, accessToken ? 'with token' : 'no token');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (accessToken) {
    headers['Authorization'] = Bearer ${accessToken};
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      let errorData;
      const responseText = await response.text();
      console.log('Raw error response:', responseText);
      
      try {
        errorData = responseText ? JSON.parse(responseText) : {};
      } catch {
        errorData = { 
          detail: HTTP ${response.status}: ${response.statusText},
          raw: responseText
        };
      }
      
      // Only log in development to avoid console errors
      if (process.env.NODE_ENV !== 'production') {
        console.error('API Error:', errorData);
      }
      
      const error = new Error(errorData.detail || HTTP ${response.status});
      (error as any).status = response.status;
      (error as any).data = errorData;
      throw error;
    }

    const responseText = await response.text();
    console.log('Raw success response:', responseText);
    
    try {
      const data = responseText ? JSON.parse(responseText) : {};
      console.log('API Success:', data);
      return data;
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      throw new Error(Invalid JSON response: ${responseText});
    }
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
}

// Recruiter-specific API helpers
export const recruiterApi = {
  // Dashboard stats - FROM OLD CODE: /jobs/recruiter/stats/
  getRecruiterStats: (token: string) => {
    return apiFetch('/jobs/recruiter/stats/', {}, token);
  },

  // Recruiter's jobs - FROM OLD CODE: /jobs/recruiter/jobs/
  getRecruiterJobs: (token: string) => {
    return apiFetch('/jobs/recruiter/jobs/', {}, token);
  },

  // Create job - FROM OLD CODE: /jobs/create/
  createJob: (token: string, data: any) => {
    return apiFetch('/jobs/create/', {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  // Update job - FROM OLD CODE: /jobs/${jobId}/update/
  updateJob: (token: string, jobId: number, data: any) => {
    return apiFetch(/jobs/${jobId}/update/, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  // Delete job - FROM OLD CODE: /jobs/${jobId}/delete/
  deleteJob: (token: string, jobId: number) => {
    return apiFetch(/jobs/${jobId}/delete/, {
      method: 'DELETE',
    }, token);
  },

  // Get job details - FROM OLD CODE: /jobs/${jobId}/
  getJob: (token: string, jobId: number) => {
    return apiFetch(/jobs/${jobId}/, {}, token);
  },

  // Get job applications
  getJobApplications: (token: string, jobId: number) => {
    return apiFetch(/jobs/recruiter/applications/${jobId}/, {}, token);
  },

  // Get all applications for recruiter
  getAllApplications: (token: string) => {
    return apiFetch('/jobs/recruiter/applications/', {}, token);
  },
};

// Application-specific API helpers - CORRECTED ENDPOINTS
export const applicationApi = {
  // Jobs - Use /jobs/ for candidates
  getJobs: (token: string, filters?: any) => {
    const params = new URLSearchParams();
    if (filters?.job_type) params.append('job_type', filters.job_type);
    if (filters?.location) params.append('location', filters.location);
    if (filters?.search) params.append('search', filters.search);
    
    const query = params.toString() ? ?${params.toString()} : '';
    return apiFetch(/jobs/${query}, {}, token);
  },

  // Profile
  updateProfile: (token: string, data: any) => {
    return apiFetch('/users/profile/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, token);
  },

  uploadResume: (token: string, formData: FormData) => {
    return apiUploadFile('/users/upload-resume/', formData, token);
  },
  
  getJob: (id: number, token: string) => {
    return apiFetch(/jobs/${id}/, {}, token);
  },

  // Applications - CORRECTED: Use /applications/ for POST (create) and GET (list)
  getApplications: (token: string, filters?: { status?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    
    const query = params.toString() ? ?${params.toString()} : '';
    return apiFetch(/applications/${query}, {}, token);
  },

  getApplication: (id: number, token: string) => {
    return apiFetch(/applications/${id}/, {}, token);
  },

  // FIXED: Changed from '/applications/create/' to '/applications/' (POST to create)
  createApplication: (token: string, data: { job: number; cover_letter: string; resume: File }) => {
    const formData = new FormData();
    formData.append('job', data.job.toString());
    formData.append('cover_letter', data.cover_letter);
    formData.append('resume', data.resume);
    
    // CORRECT: POST to /applications/ to create new application
    return apiUploadFile('/applications/', formData, token);
  },

  // FIXED: Changed from '/applications/{id}/delete/' to '/applications/{id}/' (DELETE)
  deleteApplication: (id: number, token: string) => {
    return apiFetch(/applications/${id}/, { method: 'DELETE' }, token);
  },

  // AI recommended job Function
  getAIRecommendations: (token: string, limit?: number) => {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    
    const query = params.toString() ? ?${params.toString()} : '';
    return apiFetch(/jobs/ai/recommendations/${query}, {}, token);
  },

  // Interviews
  getInterviews: (token: string) => {
    return apiFetch('/interviews/', {}, token);
  },

  // Notifications
  getNotifications: (token: string) => {
    return apiFetch('/notifications/', {}, token);
  },

  markAllNotificationsRead: (token: string) => {
    return apiFetch('/notifications/mark_all_read/', { 
      method: 'POST',
      body: JSON.stringify({}) 
    }, token);
  },

  // Stats
  getApplicationStats: (token: string) => {
    return apiFetch('/stats/applications/', {}, token);
  },

  // Additional endpoints from your Django URLs
  saveJob: (token: string, jobId: number) => {
    return apiFetch(/jobs/${jobId}/save/, { method: 'POST' }, token);
  },

  applyJob: (token: string, jobId: number, data: any) => {
    return apiFetch(/jobs/${jobId}/apply/, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
  },

  getSavedJobs: (token: string) => {
    return apiFetch('/candidate/saved-jobs/', {}, token);
  },

  getCandidateApplications: (token: string) => {
    return apiFetch('/candidate/applications/', {}, token);
  },
};

// Helper to get token
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
}

// Helper function to check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Helper function to logout
export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}

// STATUS CONSTANTS (for frontend usage)
export const APPLICATION_STATUS = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
  under_review: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  shortlisted: { label: 'Shortlisted', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
  interview_scheduled: { label: 'Interview Scheduled', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
  interviewed: { label: 'Interviewed', color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  accepted: { label: 'Accepted', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
  offer_sent: { label: 'Offer Sent', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200' },
  hired: { label: 'Hired', color: 'bg-green-200 text-green-900 dark:bg-green-800 dark:text-green-100' },
};

export const JOB_TYPES = {
  full_time: 'Full Time',
  part_time: 'Part Time',
  contract: 'Contract',
  remote: 'Remote',
};