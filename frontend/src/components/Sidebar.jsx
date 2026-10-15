import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  Bell, 
  User, 
  PlusCircle, 
  Users, 
  BarChart3, 
  Building2,
  CheckCircle2,
  Sliders,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

export default function Sidebar() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();

  const role = user?.role || 'JOB_SEEKER';

  const seekerLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
    { to: '/applications', label: 'Applications', icon: FileText },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { to: '/profile', label: 'Career Profile & AI', icon: User },
  ];

  const recruiterLinks = [
    { to: '/', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/recruiter/post-job', label: 'Post New Job', icon: PlusCircle },
    { to: '/jobs', label: 'Browse All Jobs', icon: Briefcase },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  const adminLinks = [
    { to: '/', label: 'Analytics Dashboard', icon: BarChart3, end: true },
    { to: '/jobs', label: 'All Jobs', icon: Briefcase },
    { to: '/messages', label: 'Messages', icon: MessageSquare },
    { to: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
  ];

  let links = seekerLinks;
  if (role === 'RECRUITER') links = recruiterLinks;
  if (role === 'ADMIN') links = adminLinks;

  return (
    <aside className="w-64 bg-white border-r border-border min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 hidden md:flex">
      <div className="space-y-6">
        
        {/* Role Context Tag */}
        <div className="px-3 py-2 bg-background rounded-lg border border-border/70 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand"></div>
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            {role.replace('_', ' ')} PORTAL
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {links.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-secondary hover:text-primary hover:bg-slate-100'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-brand text-white">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Proactive Placement Badge */}
      <div className="p-3.5 rounded-card bg-brand-light/60 border border-brand/20">
        <div className="flex items-center gap-2 text-brand font-semibold text-xs mb-1">
          <MapPin className="w-3.5 h-3.5" />
          <span>Location Awareness</span>
        </div>
        <p className="text-[11px] text-secondary leading-relaxed">
          Matches are automatically calculated using your configured radius and skills.
        </p>
      </div>
    </aside>
  );
}
