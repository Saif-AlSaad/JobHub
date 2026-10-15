import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import EmptyState from '../components/EmptyState';

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('ALL');

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === 'UNREAD') return !n.is_read;
    if (activeTab === 'MATCHES') return n.type === 'JOB_MATCH' || n.type === 'HIGH_MATCH';
    if (activeTab === 'APPLICATIONS') return n.type.startsWith('APPLICATION') || n.type === 'SHORTLISTED';
    return true;
  });

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Placement Alerts & Notifications</h1>
          <p className="text-sm text-[#475569] mt-1">
            Real-time proactive match drops, recruiter updates, and application stage alerts.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="px-4 py-2 rounded-[10px] border border-[#E2E8F0] text-xs font-bold text-[#475569] hover:text-[#0F172A] hover:bg-slate-50 transition-colors"
          >
            Mark All as Read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-[#E2E8F0] pb-3 text-xs">
        {['ALL', 'UNREAD', 'MATCHES', 'APPLICATIONS'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-[8px] font-bold transition-colors ${
              activeTab === tab
                ? 'bg-[#0F172A] text-white'
                : 'text-[#475569] hover:text-[#0F172A] hover:bg-slate-100'
            }`}
          >
            {tab}
            {tab === 'UNREAD' && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[10px] n">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {filteredNotifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You're All Caught Up"
          description="There are no notifications matching your current filter."
        />
      ) : (
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] divide-y divide-slate-100 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-hidden">
          {filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.is_read) markAsRead(notif.id);
                if (notif.link) navigate(notif.link);
              }}
              className={`p-5 hover:bg-slate-50 cursor-pointer transition-colors flex items-start justify-between gap-4 ${
                !notif.is_read ? 'bg-[#EEF2FF]/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  notif.type.includes('MATCH')
                    ? 'bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]'
                    : 'bg-[#D1FAE5] text-[#047857]'
                }`}>
                  {notif.type.includes('MATCH') ? <Sparkles className="w-5 h-5 text-[#06B6D4]" /> : <CheckCircle2 className="w-5 h-5 text-[#10B981]" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[#0F172A]">{notif.title}</h4>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#4F46E5]"></span>
                    )}
                  </div>
                  <p className="text-xs text-[#475569] mt-1 leading-relaxed max-w-2xl">
                    {notif.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-[11px] text-[#64748B] n">
                  {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <ArrowRight className="w-4 h-4 text-slate-300" />
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
