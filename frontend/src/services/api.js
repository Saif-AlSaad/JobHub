import axios from 'axios';
import {
  MOCK_USERS,
  MOCK_JOBS,
  MOCK_APPLICATIONS,
  MOCK_NOTIFICATIONS,
  MOCK_JOB_SEEKER_NOTIFICATIONS,
  MOCK_RECRUITER_NOTIFICATIONS,
  MOCK_CONVERSATIONS,
  MOCK_DASHBOARD_SUMMARY,
  MOCK_RECRUITER_SUMMARY,
  MOCK_ADMIN_SUMMARY,
} from './mockData';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('jobhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Helper to provide realistic mock data when backend server is offline (e.g. GitHub Pages static preview)
function getMockFallbackResponse(config) {
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // Auth / Current user
  if (url.includes('/auth/me')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    const user = savedUser ? JSON.parse(savedUser) : MOCK_USERS.JOB_SEEKER;
    return { data: user };
  }

  // Demo Logins
  if (url.includes('/auth/demo-login/')) {
    const roleKey = url.split('/').pop().toUpperCase();
    const user = MOCK_USERS[roleKey] || MOCK_USERS.JOB_SEEKER;
    localStorage.setItem('jobhub_mock_user', JSON.stringify(user));
    return { data: { access_token: `mock_token_${roleKey.toLowerCase()}`, user } };
  }

  // Standard Login / Register
  if (url.includes('/auth/register')) {
    let postData = {};
    try {
      postData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
    } catch {
      postData = {};
    }
    const role = postData.role === 'RECRUITER' ? 'RECRUITER' : 'JOB_SEEKER';
    const isSeeker = role === 'JOB_SEEKER';
    const user = {
      id: 999,
      email: postData.email || 'newcandidate@jobhub.io',
      role,
      full_name: postData.full_name || 'New Candidate',
      is_verified: true,
      profile: isSeeker ? {
        id: 999,
        full_name: postData.full_name || 'New Candidate',
        headline: 'Aspiring Professional',
        profile_completed: false,
        resume_url: null,
        resume_filename: null,
        skills: [],
        education: [],
        preferred_location_name: 'Dhaka, Bangladesh',
      } : {
        id: 998,
        full_name: postData.full_name || 'New Recruiter',
        company_name: postData.company_name || 'Tech Ventures',
        profile_completed: true,
      }
    };
    localStorage.setItem('jobhub_mock_user', JSON.stringify(user));
    return { data: { access_token: 'mock_token_register', user } };
  }

  if (url.includes('/auth/login')) {
    const user = MOCK_USERS.JOB_SEEKER;
    localStorage.setItem('jobhub_mock_user', JSON.stringify(user));
    return { data: { access_token: 'mock_token_demo', user } };
  }

  // Dashboards
  if (url.includes('/seekers/dashboard-summary')) {
    return { data: MOCK_DASHBOARD_SUMMARY };
  }
  if (url.includes('/recruiters/dashboard-summary')) {
    return { data: MOCK_RECRUITER_SUMMARY };
  }
  if (url.includes('/admin/analytics') || url.includes('/admin/stats')) {
    return { data: MOCK_ADMIN_SUMMARY };
  }

  // Jobs
  if (url.includes('/jobs')) {
    const idMatch = url.match(/\/jobs\/(\d+)/);
    if (idMatch) {
      const jobId = parseInt(idMatch[1], 10);
      const job = MOCK_JOBS.find((j) => j.id === jobId) || MOCK_JOBS[0];
      return { data: job };
    }
    return { data: { jobs: MOCK_JOBS, total: MOCK_JOBS.length } };
  }

  // Applications
  if (url.includes('/applications')) {
    if (method === 'post') {
      const savedUser = localStorage.getItem('jobhub_mock_user');
      const user = savedUser ? JSON.parse(savedUser) : null;
      const isComplete = user?.role === 'JOB_SEEKER' 
        ? Boolean(user?.profile?.profile_completed && (user?.profile?.resume_url || user?.profile?.resume_filename))
        : true;
      if (!isComplete) {
        return Promise.reject({
          message: 'Please upload your resume and complete your profile setup before applying.',
          status: 400,
        });
      }
      return { data: { status: 'success', message: 'Application submitted successfully (Demo Mode)' } };
    }
    return { data: MOCK_APPLICATIONS };
  }

  // Notifications
  if (url.includes('/notifications')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    const user = savedUser ? JSON.parse(savedUser) : MOCK_USERS.JOB_SEEKER;
    const isRecruiter = user?.role === 'RECRUITER';
    let notifs = isRecruiter ? [...MOCK_RECRUITER_NOTIFICATIONS] : [...MOCK_JOB_SEEKER_NOTIFICATIONS];

    // If seeker has not finished setup, prepend the mandatory setup notification
    if (user?.role === 'JOB_SEEKER' && (!user.profile?.profile_completed || user.profile?.profile_completed === false)) {
      notifs = [
        {
          id: 399,
          type: 'ACTION_REQUIRED',
          notification_type: 'ACTION_REQUIRED',
          title: 'Complete Your Profile & Upload Resume',
          message: 'Please complete your career profile setup and upload your resume to activate 4-factor AI job matching across Dhaka hubs.',
          link: '/profile-setup',
          is_read: false,
          created_at: new Date().toISOString(),
        },
        ...notifs
      ];
    }

    if (url.includes('/unread-count')) {
      const count = notifs.filter((n) => !n.is_read).length;
      return { data: { unread_count: count } };
    }
    if (url.includes('/mark-all-read')) {
      notifs.forEach((n) => { n.is_read = true; });
      return { data: { status: 'success', message: 'All notifications marked as read' } };
    }
    const readMatch = url.match(/\/notifications\/(\d+)\/read/);
    if (readMatch) {
      const id = parseInt(readMatch[1], 10);
      const targetNotif = notifs.find((n) => n.id === id);
      if (targetNotif) targetNotif.is_read = true;
      return { data: { status: 'success', id, is_read: true } };
    }
    return { data: notifs };
  }

  // Resume Endpoints
  if (url.includes('/resume/status')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    const user = savedUser ? JSON.parse(savedUser) : null;
    const p = user?.profile;
    return {
      data: {
        has_resume: Boolean(p?.resume_url || p?.resume_filename),
        resume_url: p?.resume_url || null,
        resume_filename: p?.resume_filename || null,
        profile_completed: Boolean(p?.profile_completed)
      }
    };
  }

  if (url.includes('/resume/parse-upload')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    let filename = 'Candidate_Resume.pdf';
    if (config.data instanceof FormData) {
      const file = config.data.get('file');
      if (file && file.name) {
        filename = file.name;
      }
    }
    const resumeUrl = `/uploads/${filename}`;
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        if (user.profile) {
          user.profile.resume_url = resumeUrl;
          user.profile.resume_filename = filename;
        }
        localStorage.setItem('jobhub_mock_user', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
    return {
      data: {
        status: 'success',
        filename,
        resume_url: resumeUrl,
        extracted_profile: {
          full_name: '',
          headline: '',
          skills: [],
          education: [],
          preferred_location_name: ''
        }
      }
    };
  }

  if (url.includes('/resume/confirm-profile')) {
    let postData = {};
    try {
      postData = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
    } catch {
      postData = {};
    }
    const savedUser = localStorage.getItem('jobhub_mock_user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        user.profile_completed = true;
        if (user.profile) {
          user.profile.profile_completed = true;
          user.profile.resume_url = user.profile.resume_url || '/uploads/Candidate_Resume.pdf';
          user.profile.resume_filename = user.profile.resume_filename || 'Candidate_Resume.pdf';
          if (postData.full_name) user.profile.full_name = postData.full_name;
          if (postData.headline) user.profile.headline = postData.headline;
          if (postData.phone) user.profile.phone = postData.phone;
          if (postData.skills) user.profile.skills = postData.skills;
          if (postData.education) user.profile.education = postData.education;
          if (postData.preferred_location_name) user.profile.preferred_location_name = postData.preferred_location_name;
          if (postData.preferred_job_types) user.profile.preferred_job_types = postData.preferred_job_types;
          if (postData.preferred_roles) user.profile.preferred_roles = postData.preferred_roles;
        }
        localStorage.setItem('jobhub_mock_user', JSON.stringify(user));
      } catch (e) {
        console.error(e);
      }
    }
    return {
      data: {
        status: 'success',
        profile_completed: true,
        new_matches_count: 5,
        message: 'Career profile confirmed, resume verified, and AI matching activated!'
      }
    };
  }

  // Messages & Chat
  if (url.includes('/messages') || url.includes('/chat')) {
    return { data: MOCK_CONVERSATIONS };
  }

  // Profiles
  if (url.includes('/seekers/profile')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    return { data: savedUser ? JSON.parse(savedUser) : MOCK_USERS.JOB_SEEKER };
  }
  if (url.includes('/recruiter/profile')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    return { data: savedUser ? JSON.parse(savedUser) : MOCK_USERS.RECRUITER };
  }

  return null;
}

// Response interceptor: graceful fallback on network failure for GitHub Pages preview
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Check if network failed or server is unreachable (typical on static GitHub Pages)
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message?.includes('Network Error');
    if (isNetworkError && error.config) {
      const mockFallback = getMockFallbackResponse(error.config);
      if (mockFallback) {
        console.info(`[JobHub Live Demo] Backend offline; serving demo response for: ${error.config.url}`);
        return Promise.resolve(mockFallback);
      }
    }

    const customError = {
      message: error.response?.data?.detail || error.message || 'An unexpected error occurred. Please try again.',
      status: error.response?.status || 500,
    };
    return Promise.reject(customError);
  }
);

export default api;
