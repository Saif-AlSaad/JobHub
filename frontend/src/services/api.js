import axios from 'axios';
import {
  MOCK_USERS,
  MOCK_JOBS,
  MOCK_APPLICATIONS,
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
  if (url.includes('/auth/login') || url.includes('/auth/register')) {
    const user = MOCK_USERS.JOB_SEEKER;
    localStorage.setItem('jobhub_mock_user', JSON.stringify(user));
    return { data: { access_token: 'mock_token_demo', user } };
  }

  // Dashboards
  if (url.includes('/seekers/dashboard-summary')) {
    return { data: MOCK_DASHBOARD_SUMMARY };
  }
  if (url.includes('/recruiter/dashboard') || url.includes('/recruiters/dashboard-summary')) {
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
      return { data: { status: 'success', message: 'Application submitted successfully (Demo Mode)' } };
    }
    return { data: MOCK_APPLICATIONS };
  }

  // Notification Preferences
  if (url.includes('/notifications/preferences')) {
    const defaultPrefs = { email_alerts: true, in_app_alerts: true, min_match_score: 70, alert_radius_km: 10 };
    if (method === 'put' && config.data) {
      const incoming = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const merged = { ...defaultPrefs, ...JSON.parse(localStorage.getItem('jobhub_mock_prefs') || '{}'), ...incoming };
      localStorage.setItem('jobhub_mock_prefs', JSON.stringify(merged));
      return { data: { status: 'success', message: 'Notification preferences updated' } };
    }
    const stored = localStorage.getItem('jobhub_mock_prefs');
    return { data: stored ? JSON.parse(stored) : defaultPrefs };
  }

  // Notifications
  if (url.includes('/notifications')) {
    const savedUser = localStorage.getItem('jobhub_mock_user');
    const user = savedUser ? JSON.parse(savedUser) : MOCK_USERS.JOB_SEEKER;
    const isRecruiter = user?.role === 'RECRUITER';
    const notifs = isRecruiter ? MOCK_RECRUITER_NOTIFICATIONS : MOCK_JOB_SEEKER_NOTIFICATIONS;

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

  // Messages & Chat
  if (url.includes('/messages') || url.includes('/chat')) {
    return { data: MOCK_CONVERSATIONS };
  }

  // Profiles
  if (url.includes('/seekers/profile') || url.includes('/recruiter/profile')) {
    const isRecruiterEndpoint = url.includes('/recruiter/profile');
    const savedUser = localStorage.getItem('jobhub_mock_user');
    const current = savedUser
      ? JSON.parse(savedUser)
      : isRecruiterEndpoint
        ? MOCK_USERS.RECRUITER
        : MOCK_USERS.JOB_SEEKER;

    if (method === 'put' && config.data) {
      const incoming = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      const updated = { ...current, ...incoming };
      localStorage.setItem('jobhub_mock_user', JSON.stringify(updated));
      return { data: { status: 'success', message: 'Profile updated successfully' } };
    }
    return { data: current };
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
