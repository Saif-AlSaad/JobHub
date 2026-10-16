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
    <aside className="w-64 bg-[#F3EFEA] border-r border-[#E7E5E4] min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 hidden md:flex transition-colors">
      <div className="space-y-6">
        
        {/* Role Context Tag */}
        <div className="px-3.5 py-2 bg-white rounded-lg border border-[#E7E5E4] flex items-center gap-2 shadow-xs">
          <div className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse"></div>
          <span className="text-[11px] font-bold text-[#1C1917] uppercase tracking-wider">
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
                  `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#CCFBF1] text-[#0F766E] font-bold shadow-xs'
                      : 'text-[#78716C] hover:text-[#0F766E] hover:bg-[#FAF8F5]'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#F97316] text-white shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Proactive Placement Badge */}
      <div className="p-3.5 rounded-[12px] bg-white border border-[#E7E5E4] shadow-xs">
        <div className="flex items-center gap-2 text-[#0F766E] font-bold text-xs mb-1">
          <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
          <span>Location Awareness</span>
        </div>
        <p className="text-[11px] text-[#78716C] leading-relaxed">
          Matches are automatically calculated using your configured radius and skills.
        </p>
      </div>
    </aside>
  );
}
