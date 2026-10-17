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

  const role = user?.role || 'JOB_SEEKER';

  const handleDemoSwitch = async (targetRole) => {
    if (role === 'JOB_SEEKER' && targetRole === 'recruiter') {
      return;
    }
    if (role === 'RECRUITER' && targetRole === 'seeker') {
      return;
    }
    setDemoOpen(false);
    await demoLogin(targetRole);
    navigate('/');
  };

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
    { to: '/profile', label: 'Company Profile' },
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
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md text-[#1C1917] border-b border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)] transition-colors">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 h-16 flex items-center gap-4 md:gap-6 justify-between">
        
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="font-extrabold text-xl tracking-tight flex items-center gap-0.5 hover:opacity-90 transition-opacity"
            aria-label="JobHub Home"
          >
            <span className="text-[#0F766E] font-heading font-extrabold text-2xl tracking-tight">Job</span>
            <span className="text-[#F97316] font-heading font-extrabold text-2xl tracking-tight">Hub</span>
          </Link>

          {/* Top Horizontal Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = item.end 
                ? location.pathname === item.to 
                : location.pathname.startsWith(item.to) && (item.to !== '/' || location.pathname === '/');
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={`px-3.5 py-1.5 rounded-lg text-xs transition-all duration-150 ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold shadow-xs'
                      : 'text-[#78716C] hover:text-[#0F766E] hover:bg-[#F3EFEA] font-medium'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Telemetry */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          
          {/* High-Conversion "Post a Job" CTA Button (Recruiters & Admins Only) */}
          {role !== 'JOB_SEEKER' && (
            <Link
              to="/recruiter/post-job"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-semibold shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition-all duration-150 active:scale-[0.98]"
            >
              <span>+</span>
              <span>Post a Job</span>
            </Link>
          )}

          {/* Active Location Hub Pill */}
          {role === 'JOB_SEEKER' && (
            <Link 
              to="/profile"
              className="hidden lg:flex items-center gap-1.5 bg-[#F3EFEA] border border-[#E7E5E4] rounded-[10px] px-3 py-1.5 text-xs text-[#78716C] hover:border-[#0F766E] hover:text-[#0F766E] transition-colors"
              title="Click to adjust placement location & radius"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Hub: <span className="font-semibold text-[#1C1917]">{currentHub}</span> · <span className="n font-semibold text-[#0F766E]">{currentRadius} km</span></span>
            </Link>
          )}

          {/* 1-Click Demo Persona Switcher */}
          <div className="relative" ref={demoRef}>
            <button
              onClick={() => setDemoOpen(!demoOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-[10px] bg-white border border-[#E7E5E4] hover:bg-[#F3EFEA] text-xs font-medium text-[#1C1917] shadow-xs transition-colors"
              title="Switch demo persona"
            >
              <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse"></span>
              <span className="hidden sm:inline text-[#78716C]">Demo:</span>
              <span className="font-bold text-[#0F766E]">
                {role === 'JOB_SEEKER' ? 'Job Seeker' : role === 'RECRUITER' ? 'Recruiter' : 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#78716C]" />
            </button>

            {demoOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-[#1C1917] rounded-[12px] shadow-[0_20px_48px_-8px_rgba(28,25,23,0.14)] border border-[#E7E5E4] py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3.5 py-1.5 border-b border-[#E7E5E4] text-[11px] font-semibold text-[#78716C] uppercase tracking-wider">
                  {role === 'ADMIN' ? 'Switch Active Persona' : 'Active Persona'}
                </div>
                
                {role !== 'RECRUITER' && (
                  <button
                    onClick={() => (role === 'JOB_SEEKER' ? setDemoOpen(false) : handleDemoSwitch('seeker'))}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#F3EFEA] flex items-center justify-between transition-colors ${
                      role === 'JOB_SEEKER' ? 'bg-[#CCFBF1]/60 font-semibold text-[#0F766E]' : 'text-[#1C1917]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center font-bold text-xs">
                        SR
                      </div>
                      <div>
                        <p className="font-semibold text-[#1C1917]">Sarah Rahman</p>
                        <p className="text-[11px] text-[#78716C]">Job Seeker • DIU SE Graduate</p>
                      </div>
                    </div>
                    {role === 'JOB_SEEKER' && <Check className="w-4 h-4 text-[#0F766E]" />}
                  </button>
                )}

                {role !== 'JOB_SEEKER' && (
                  <button
                    onClick={() => (role === 'RECRUITER' ? setDemoOpen(false) : handleDemoSwitch('recruiter'))}
                    className={`w-full text-left px-3.5 py-2.5 text-xs hover:bg-[#F3EFEA] flex items-center justify-between transition-colors ${
                      role === 'RECRUITER' ? 'bg-[#CCFBF1]/60 font-semibold text-[#0F766E]' : 'text-[#1C1917]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] flex items-center justify-center font-bold text-xs">
                        TN
                      </div>
                      <div>
                        <p className="font-semibold text-[#1C1917]">TechNova Labs</p>
                        <p className="text-[11px] text-[#78716C]">Employer & Technical Recruiter</p>
                      </div>
                    </div>
                    {role === 'RECRUITER' && <Check className="w-4 h-4 text-[#0F766E]" />}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notification Button */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={handleOpenNotif}
              aria-label="Notifications"
              className="w-9 h-9 rounded-[10px] border border-[#E7E5E4] bg-white hover:bg-[#F3EFEA] text-[#1C1917] flex items-center justify-center transition-colors relative shadow-xs"
            >
              <Bell className="w-4 h-4 text-[#78716C]" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#F97316] text-[10px] font-bold text-white flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white text-[#1C1917] rounded-[12px] shadow-[0_20px_48px_-8px_rgba(28,25,23,0.14)] border border-[#E7E5E4] z-50 overflow-hidden animate-in fade-in duration-150">
                <div className="p-3.5 border-b border-[#E7E5E4] flex items-center justify-between bg-[#F3EFEA]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#1C1917]">Alerts & Placements</span>
                    {unreadCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[10px] font-bold">
                        {unreadCount} new
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-[11px] text-[#0F766E] hover:text-[#115E59] hover:underline font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-[#E7E5E4]">
                  {notifications.length === 0 ? (
                    <div className="p-6 text-center text-xs text-[#78716C]">
                      No notifications yet. Matches in your hub radius will alert here!
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => markAsRead(item.id)}
                        className={`p-3 text-xs hover:bg-[#F3EFEA] cursor-pointer transition-colors ${
                          !item.is_read ? 'bg-[#CCFBF1]/20' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-[#1C1917]">{item.title}</p>
                          <span className="text-[10px] text-[#78716C] flex-shrink-0">
                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78716C] mt-1">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 border-t border-[#E7E5E4] bg-[#F3EFEA] text-center">
                  <Link
                    to="/notifications"
                    onClick={() => setNotifOpen(false)}
                    className="text-xs font-semibold text-[#0F766E] hover:text-[#115E59] hover:underline"
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
              className="w-9 h-9 rounded-[10px] border border-[#99F6E4] bg-[#CCFBF1] hover:bg-[#99F6E4] text-[#0F766E] flex items-center justify-center font-bold text-xs transition-colors shadow-xs overflow-hidden"
            >
              {(user?.profile?.avatar_url || user?.avatar_url || localStorage.getItem('jobhub_user_avatar')) ? (
                <img
                  src={user?.profile?.avatar_url || user?.avatar_url || localStorage.getItem('jobhub_user_avatar')}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                role === 'JOB_SEEKER' ? 'SR' : role === 'RECRUITER' ? 'TN' : 'AD'
              )}
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white text-[#1C1917] rounded-[12px] shadow-[0_20px_48px_-8px_rgba(28,25,23,0.14)] border border-[#E7E5E4] py-1.5 z-50 animate-in fade-in duration-150">
                <div className="px-3.5 py-2.5 border-b border-[#E7E5E4] bg-[#F3EFEA]/50 flex items-center gap-2.5">
                  {(user?.profile?.avatar_url || user?.avatar_url || localStorage.getItem('jobhub_user_avatar')) ? (
                    <img
                      src={user?.profile?.avatar_url || user?.avatar_url || localStorage.getItem('jobhub_user_avatar')}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover border border-[#99F6E4] flex-shrink-0"
                    />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-xs text-[#1C1917] truncate">{user?.profile?.full_name || user?.email}</p>
                    <p className="text-[11px] text-[#78716C] truncate">{user?.email}</p>
                  </div>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3.5 py-2 text-xs text-[#78716C] hover:text-[#0F766E] hover:bg-[#F3EFEA] transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>My Profile & Skills</span>
                </Link>

                <button
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs text-red-600 hover:bg-red-50 text-left border-t border-[#E7E5E4] mt-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-red-500" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Horizontal Sub-Navigation */}
      <div className="md:hidden flex items-center gap-1.5 overflow-x-auto px-4 py-2 border-t border-[#E7E5E4] bg-[#FAF8F5]">
        {navItems.map((item) => {
          const isActive = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors ${
                isActive ? 'bg-[#CCFBF1] text-[#0F766E] font-semibold' : 'text-[#78716C] hover:text-[#0F766E]'
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
