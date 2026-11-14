import React from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobSeekerDashboard from './pages/JobSeekerDashboard';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import JobsSearchPage from './pages/JobsSearchPage';
import JobDetailsPage from './pages/JobDetailsPage';
import ApplicationsTrackerPage from './pages/ApplicationsTrackerPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import NotificationsPage from './pages/NotificationsPage';
import PostJobPage from './pages/PostJobPage';
import ProfileSetupPage from './pages/ProfileSetupPage';
import ResumeUploadPage from './pages/ResumeUploadPage';
import UpdateProfilePage from './pages/UpdateProfilePage';

function RoleBasedHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'RECRUITER') return <RecruiterDashboard />;
  if (user.role === 'ADMIN') return <AdminDashboard />;
  return <JobSeekerDashboard />;
}

function RecruiterOnlyRoute({ children }) {
  const { user } = useAuth();
  if (user && user.role === 'JOB_SEEKER') {
    return <Navigate to="/" replace />;
  }
  return children;
}

function ProtectedLayout({ children }) {
  const { user, loading, isProfileComplete } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-xs font-semibold text-secondary">
        Initializing JobHub...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isSeeker = user.role === 'JOB_SEEKER';
  const hasResume = Boolean(user.profile?.resume_url || user.profile?.resume_filename);
  const isOnboardingRoute = location.pathname === '/resume-upload' || location.pathname === '/update-profile' || location.pathname === '/profile-setup';

  // Mandatory Two-Step Onboarding Guard:
  // 1. Resume Upload (first step)
  // 2. Update Profile (second step with empty sections except registration name)
  if (isSeeker && !isProfileComplete) {
    if (!hasResume && location.pathname !== '/resume-upload') {
      return <Navigate to="/resume-upload" replace />;
    }
    if (hasResume && !isOnboardingRoute) {
      return <Navigate to="/update-profile" replace />;
    }
  } else if (isOnboardingRoute && (!isSeeker || isProfileComplete)) {
    // If seeker already completed profile (or user is recruiter/admin), redirect to home
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HashRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedLayout>
                  <RoleBasedHome />
                </ProtectedLayout>
              }
            />

            <Route
              path="/jobs"
              element={
                <ProtectedLayout>
                  <JobsSearchPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/jobs/:id"
              element={
                <ProtectedLayout>
                  <JobDetailsPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/applications"
              element={
                <ProtectedLayout>
                  <ApplicationsTrackerPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedLayout>
                  <ProfilePage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedLayout>
                  <MessagesPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedLayout>
                  <NotificationsPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/resume-upload"
              element={
                <ProtectedLayout>
                  <ResumeUploadPage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/update-profile"
              element={
                <ProtectedLayout>
                  <UpdateProfilePage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/profile-setup"
              element={
                <ProtectedLayout>
                  <UpdateProfilePage />
                </ProtectedLayout>
              }
            />

            <Route
              path="/recruiter/post-job"
              element={
                <ProtectedLayout>
                  <RecruiterOnlyRoute>
                    <PostJobPage />
                  </RecruiterOnlyRoute>
                </ProtectedLayout>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
