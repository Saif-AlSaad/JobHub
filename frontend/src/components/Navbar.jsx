import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Bell, 
  ChevronDown, 
  Check, 
  LogOut, 
  User, 
  Sparkles,
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Navbar() {
  const { user, logout, demoLogin } = useAuth();
  const { unreadCount, notifications, fetchNotifications, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [demoOpen, setDemoOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const demoRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (demoRef.current && !demoRef.current.contains(e.target)) setDemoOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenNotif = () => {
    if (!notifOpen) {
      fetchNotifications();
    }
    setNotifOpen(!notifOpen);
  };

  const handleDemoSwitch = async (role) => {
    setDemoOpen(false);
    await demoLogin(role);
    navigate('/');
  };

  const role = user?.role || 'JOB_SEEKER';

  const seekerNav = [
    { to: '/', label: 'Dashboard', end: true },
    { to: '/jobs', label: 'Explore' },
    { to: '/applications', label: 'Applications' },
    { to: '/messages', label: 'Messages' },
    { to: '/profile', label: 'Profile' },
  ];

  const recruiterNav = [
    { to: '/', label: 'Overview', end: true },
    { to: '/recruiter/post-job', label: 'Post Job' },
    { to: '/jobs', label: 'Explore' },
    { to: '/messages', label: 'Messages' },
  ];

  const adminNav = [
    { to: '/', label: 'Analytics', end: true },
    { to: '/jobs', label: 'Explore Jobs' },
    { to: '/messages', label: 'Messages' },
  ];

  let navItems = seekerNav;
  if (role === 'RECRUITER') navItems = recruiterNav;
  if (role === 'ADMIN') navItems = adminNav;

  const currentHub = user?.profile?.location_name || 'Savar Smart City';
  const currentRadius = user?.profile?.alert_radius_km || 5;

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A] text-white border-b border-[#1E293B] shadow-sm">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-6 md:gap-8 justify-between">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-6">
          <Link to="/" className="font-extrabold text-xl tracking-tight text-white hover:opacity-95 transition-opacity">
            JOB<span className="text-[#06B6D4]">HUB</span>
          </Link>

          {/* Top Horizontal Nav Links */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navItems.map((item) => {
              const isActive = item.end 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/');
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={`px-3.5 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-[#334155] text-white font-semibold'
                      : 'text-[#CBD5E1] hover:text-white font-medium hover:bg-[#1E293B]'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Telemetry */}
        <div className="flex items-center gap-3">
          
          {/* Active Location Hub Pill */}
          {role === 'JOB_SEEKER' && (
            <Link 
              to="/profile"
              className="hidden lg:flex items-center gap-1.5 bg-[#1E293B] border border-[#334155] rounded-[10px] px-3.5 py-2 text-xs text-[#CBD5E1] hover:border-slate-500 transition-colors"
              title="Click to adjust placement location & radius"
            >
              <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Hub: {currentHub} · <span className="n font-semibold text-white">{currentRadius} km</span></span>
            </Link>
          )}

          {/* 1-Click Demo Persona Switcher */}
          <div className="relative" ref={demoRef}>
            <button
              onClick={() => setDemoOpen(!demoOpen)}
              className="flex items-center gap-2 px-3 py-2 rounded-[10px] bg-[#1E293B] border border-[#334155] hover:bg-[#334155] text-xs font-medium text-white transition-colors"
              title="Switch demo persona"
            >
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="hidden sm:inline text-slate-300">Demo:</span>
              <span className="font-bold text-[#06B6D4]">
                {role === 'JOB_SEEKER' ? 'Job Seeker' : role === 'RECRUITER' ? 'Recruiter' : 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {demoOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-card shadow-modal border border-border py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 border-b border-border text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  Switch Active Persona
                </div>
                
                <button
                  onClick={() => handleDemoSwitch('seeker')}
                  className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    role === 'JOB_SEEKER' ? 'bg-indigo-50 font-semibold text-brand' : 'text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      SR
                    </div>
                    <div>
                      <p className="font-semibold text-primary">Sarah Rahman</p>
                      <p className="text-[11px] text-secondary">Job Seeker • DIU SE Graduate</p>
                    </div>
                  </div>
                  {role === 'JOB_SEEKER' && <Check className="w-4 h-4 text-brand" />}
                </button>

                <button
                  onClick={() => handleDemoSwitch('recruiter')}
                  className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-slate-50 flex items-center justify-between ${
                    role === 'RECRUITER' ? 'bg-indigo-50 font-semibold text-brand' : 'text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                      TN
                    </div>
                    <div>
                      <p className="font-semibold text-primary">TechNova Labs</p>
                      <p className="text-[11px] text-secondary">Employer & Technical Recruiter</p>
                    </div>
                  </div>
                  {role === 'RECRUITER' && <Check className="w-4 h-4 text-brand" />}
                </button>
              </div>
            )}
          </div>

          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotif}
              aria-label="Notifications"
              className="w-10 h-10 rounded-[10px] border border-[#334155] bg-[#1E293B] hover:bg-[#334155] text-white flex items-center justify-center transition-colors relative"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9M10 21h4" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#EF4444] text-[10px] font-bold text-white flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-slate-900 rounded-card shadow-modal border border-border z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3.5 border-b border-border flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-primary">Alerts & Placements</span>
                    {unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-brand-light text-brand text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-brand hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-border">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-secondary">
                      No notifications yet. Matches in your hub radius will alert here!
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className={`p-3 text-xs hover:bg-slate-50 cursor-pointer transition-colors ${
                          !item.is_read ? 'bg-brand-light/30' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-primary">{item.title}</p>
                          <span className="text-[10px] text-secondary flex-shrink-0">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-secondary mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2 border-t border-border bg-slate-50 text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    View All Notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="w-10 h-10 rounded-[10px] border border-[#334155] bg-[#1E293B] hover:bg-[#334155] text-white flex items-center justify-center font-bold text-xs transition-colors"
            >
              {role === 'JOB_SEEKER' ? 'SR' : role === 'RECRUITER' ? 'TN' : 'AD'}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-slate-900 rounded-card shadow-modal border border-border py-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3.5 py-2 border-b border-border">
                  <p className="font-bold text-xs text-primary">{user?.profile?.full_name || user?.email}</p>
                  <p className="text-[11px] text-secondary">{user?.email}</p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-secondary hover:text-primary hover:bg-slate-50"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Profile & Skills</span>
                </Link>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 text-left border-t border-border mt-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Horizontal Sub-Navigation */}
      <div className="md:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-[#1E293B] bg-[#0F172A]">
        {navItems.map((item) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${
                isActive ? 'bg-[#334155] text-white font-semibold' : 'text-[#CBD5E1]'
              }`}
            >
              {item.label}
            </NavLink>
          );
        })}
      </div>
    </header>
  );
}
