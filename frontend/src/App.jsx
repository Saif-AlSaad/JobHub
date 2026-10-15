import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

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

function RoleBasedHome() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'RECRUITER') return <RecruiterDashboard />;
  if (user.role === 'ADMIN') return <AdminDashboard />;
  return <JobSeekerDashboard />;
}

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-xs font-semibold text-secondary">
        Initializing JOB HUB...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1 w-full">
        {children}
      </main>
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
              path="/recruiter/post-job"
              element={
                <ProtectedLayout>
                  <PostJobPage />
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
