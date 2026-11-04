import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Users, 
  Eye, 
  Award,
  Check,
  Clock
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, fetchNotifications } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();

  const isRecruiter = user?.role === 'RECRUITER';

  const [activeTab, setActiveTab] = useState('ALL');

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const tabs = isRecruiter 
    ? ['ALL', 'UNREAD', 'APPLICANTS', 'MATCHES', 'MESSAGES']
    : ['ALL', 'UNREAD', 'MATCHES', 'APPLICATIONS', 'MESSAGES'];

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.is_read;
    if (activeTab === 'MATCHES') return n.type === 'JOB_MATCH' || n.type === 'HIGH_MATCH';
    if (activeTab === 'APPLICATIONS' || activeTab === 'APPLICANTS') {
      return (
        n.type?.startsWith('APPLICATION') || 
        n.type === 'SHORTLISTED' || 
        n.type === 'INTERVIEW' || 
        n.type === 'HIRED' || 
        n.type === 'REJECTED'
      );
    }
    if (activeTab === 'MESSAGES') return n.type === 'MESSAGE';
    return true;
  });

  const getNotificationIcon = (type = '') => {
    if (type === 'HIGH_MATCH' || type === 'JOB_MATCH') {
      return {
        icon: Sparkles,
        bg: 'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]',
        label: 'AI Match'
      };
    }
    if (type === 'MESSAGE') {
      return {
        icon: MessageSquare,
        bg: 'bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE]',
        label: 'Message'
      };
    }
    if (type === 'INTERVIEW') {
      return {
        icon: Calendar,
        bg: 'bg-[#FFF7ED] text-[#EA580C] border border-[#FED7AA]',
        label: 'Interview'
      };
    }
    if (type === 'SHORTLISTED' || type === 'HIRED') {
      return {
        icon: CheckCircle2,
        bg: 'bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]',
        label: type === 'HIRED' ? 'Offer Extended' : 'Shortlisted'
      };
    }
    if (type === 'APPLICATION_VIEWED') {
      return {
        icon: Eye,
        bg: 'bg-[#F5F5F4] text-[#57534E] border border-[#E7E5E4]',
        label: 'Viewed'
      };
    }
    if (type === 'PROFILE_REMINDER') {
      return {
        icon: Award,
        bg: 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
        label: 'AI Coach'
      };
    }
    return {
      icon: isRecruiter ? Users : FileText,
      bg: 'bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]',
      label: isRecruiter ? 'Candidate' : 'Application'
    };
  };

  const formatNotificationTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-[16px] border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-pill badge-job-type">
            {isRecruiter ? 'Recruitment Hub Notifications' : 'Student & Candidate Alerts'}
          </span>
          <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight mt-1.5 font-heading">
            {isRecruiter ? 'Recruiter Activity & Candidate Alerts' : 'Placement Alerts & Notifications'}
          </h1>
          <p className="text-xs sm:text-sm text-[#78716C] mt-1">
            {isRecruiter
              ? 'Real-time candidate submissions, AI talent match drops, interview schedule confirmations, and messages.'
              : 'Real-time proactive match drops, recruiter updates, interview requests, and application stage alerts.'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] hover:bg-[#F3EFEA] text-xs font-bold text-[#1C1917] transition-colors self-start sm:self-auto shadow-xs"
          >
            <Check className="w-3.5 h-3.5 text-[#0F766E]" />
            Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E7E5E4] pb-3 text-xs overflow-x-auto">
        {tabs.map((tab) => {
          let count = 0;
          if (tab === 'UNREAD') count = unreadCount;
          if (tab === 'MATCHES') count = notifications.filter((n) => n.type === 'JOB_MATCH' || n.type === 'HIGH_MATCH').length;
          if (tab === 'APPLICATIONS' || tab === 'APPLICANTS') {
            count = notifications.filter((n) => 
              n.type?.startsWith('APPLICATION') || 
              n.type === 'SHORTLISTED' || 
              n.type === 'INTERVIEW' || 
              n.type === 'HIRED' || 
              n.type === 'REJECTED'
            ).length;
          }
          if (tab === 'MESSAGES') count = notifications.filter((n) => n.type === 'MESSAGE').length;

          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 rounded-lg font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA]'
              }`}
            >
              <span>{tab}</span>
              {tab === 'UNREAD' && unreadCount > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  activeTab === tab ? 'bg-white text-[#0F766E]' : 'bg-[#F97316] text-white'
                }`}>
                  {unreadCount}
                </span>
              )}
              {tab !== 'UNREAD' && count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${
                  activeTab === tab ? 'bg-white/20 text-white' : 'bg-[#E7E5E4] text-[#78716C]'
                }`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={activeTab === 'UNREAD' ? "You're All Caught Up" : "No Notifications in this Filter"}
          description={
            isRecruiter
              ? "New candidate applications and talent match alerts will appear here."
              : "Matches and employer updates for your jobs will appear here."
          }
          actionLabel="View All Alerts"
          onAction={() => setActiveTab('ALL')}
        />
      ) : (
        <div className="bg-white rounded-[16px] border border-[#E7E5E4] divide-y divide-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)] overflow-hidden">
          {filteredNotifications.map((notif) => {
            const config = getNotificationIcon(notif.type);
            const IconComponent = config.icon;

            return (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                className={`p-5 hover:bg-[#FAF8F5] cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  !notif.is_read ? 'bg-[#CCFBF1]/15' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Category Icon */}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs ${config.bg}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.bg}`}>
                        {config.label}
                      </span>
                      <h4 className="text-sm font-bold text-[#1C1917]">{notif.title}</h4>
                      {!notif.is_read && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-black bg-[#F97316] text-white">
                          NEW
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#78716C] leading-relaxed max-w-3xl">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {/* Right metadata & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E5E4]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#78716C]">
                    <Clock className="w-3.5 h-3.5 text-[#A8A29E]" />
                    <span className="n font-medium">{formatNotificationTime(notif.created_at)}</span>
                  </div>

                  {notif.link && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0F766E] group-hover:text-[#115E59]">
                      View
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
