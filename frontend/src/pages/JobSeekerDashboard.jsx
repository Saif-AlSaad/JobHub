import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { 
  Sparkles, 
  MapPin, 
  ArrowRight, 
  Compass, 
  Check, 
  Bell, 
  BookmarkCheck, 
  Target, 
  ListTodo
} from 'lucide-react';
import api from '../services/api';
import JobCard from '../components/JobCard';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function JobSeekerDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedHub, setSelectedHub] = useState('All');
  const [radiusFilter, setRadiusFilter] = useState(5);
  const [savedCount, setSavedCount] = useState(0);
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();

  // Load saved jobs count
  const loadSavedCount = useCallback(() => {
    try {
      const ids = JSON.parse(localStorage.getItem('jobhub_saved_jobs') || '[]');
      setSavedCount(ids.length);
    } catch {
      setSavedCount(0);
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/seekers/dashboard-summary');
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();
    loadSavedCount();
    window.addEventListener('jobhub_saved_updated', loadSavedCount);
    return () => window.removeEventListener('jobhub_saved_updated', loadSavedCount);
  }, [fetchNotifications, loadSavedCount]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <EmptyState
          icon={Compass}
          title="Could not load your career opportunities"
          description={error || "Please check your network connection or login again."}
          actionLabel="Retry Loading"
          onAction={fetchDashboardData}
        />
      </div>
    );
  }

  const { candidate_name, first_name, stats, top_matches, nearby_opportunities, recent_applications } = data;

  const hubs = ['All', 'Savar', 'Banani', 'Mohakhali', 'Dhanmondi', 'Uttara'];

  const filteredNearby = nearby_opportunities.filter(job => {
    const matchesRadius = (job.distance_km == null || job.distance_km <= radiusFilter);
    const matchesHub = selectedHub === 'All' || (job.location_name && job.location_name.toLowerCase().includes(selectedHub.toLowerCase()));
    return matchesRadius && matchesHub;
  });

  // Calculate circular SVG gauge
  const overallScore = stats.profile_strength || 87;
  const circumference = 339.3;
  const dashoffset = Math.max(0, circumference - (circumference * overallScore) / 100);

  const applicationSteps = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];

  const readinessChecklist = [
    { title: 'Academic Degree & CGPA Verified', done: true, points: '+25%' },
    { title: 'Technical Taxonomy (Python, React, FastAPI)', done: true, points: '+25%' },
    { title: 'University Hub Proximity Configured (Savar / Banani)', done: true, points: '+20%' },
    { title: 'Verified PDF Resume Parsed & Vectorized', done: true, points: '+17%' },
    { title: 'GitHub Open-Source & Capstone Project Linked', done: false, points: '+13%', link: '/profile' }
  ];

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8 bg-[#FAF8F5]">
      
      {/* 1. Hero Placement Radar & Radial Gauge */}
      <div className="bg-white rounded-[14px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_6px_rgba(28,25,23,0.03)] flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left greeting & mission */}
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-bold shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            Proactive AI Placement Engine Active
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight font-heading">
            Welcome back, {first_name || 'Sarah'}
          </h1>

          <p className="text-sm text-[#78716C] leading-relaxed max-w-2xl">
            JobHub is continuously computing hybrid semantic matches against open software engineering roles within your preferred university hub radius.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all shadow-xs active:scale-[0.98] cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Explore Matches
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-[#F3EFEA] hover:bg-[#E7E5E4] text-[#1C1917] border border-[#E7E5E4] text-xs font-bold transition-colors cursor-pointer"
            >
              Adjust Hub & Skills
            </Link>
            {savedCount > 0 && (
              <Link
                to="/jobs?saved=true"
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-[10px] bg-[#FFEDD5] hover:bg-[#FED7AA] text-[#C2410C] border border-[#FED7AA] text-xs font-bold transition-colors cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                <span>{savedCount} Saved Roles</span>
              </Link>
            )}
          </div>
        </div>

        {/* Center / Right Radial Market Readiness Hero Gauge */}
        <div className="flex items-center gap-6 p-5 rounded-[12px] bg-[#F3EFEA] border border-[#E7E5E4] shrink-0">
          <svg 
            width="96" 
            height="96" 
            viewBox="0 0 140 140" 
            role="img" 
            aria-label={`Overall Placement Readiness ${overallScore} percent`}
            className="shrink-0"
          >
            <circle 
              cx="70" 
              cy="70" 
              r="54" 
              fill="none" 
              stroke="#E7E5E4" 
              strokeWidth="16" 
            />
            <circle 
              cx="70" 
              cy="70" 
              r="54" 
              fill="none" 
              stroke="#0F766E" 
              strokeWidth="16" 
              strokeLinecap="round" 
              strokeDasharray="339.3" 
              strokeDashoffset={dashoffset} 
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div>
            <div className="n text-3xl font-extrabold text-[#1C1917] leading-none">
              {overallScore}%
            </div>
            <div className="text-xs font-bold text-[#1C1917] mt-1">
              Profile Placement Readiness
            </div>
            <div className="text-[11px] text-[#047857] font-semibold mt-0.5">
              Top 5% of DIU graduates
            </div>
            <div className="text-[10px] text-[#78716C] mt-1">
              Based on semantic resume vector overlap
            </div>
          </div>
        </div>

      </div>

      {/* 2. Interactive Placement Checklist & Target Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Profile Optimization Checklist (8 cols) */}
        <div className="lg:col-span-8 bg-white border border-[#E7E5E4] rounded-[14px] p-5 sm:p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] font-heading">
                  AI Placement Optimization Checklist
                </h3>
                <p className="text-xs text-[#78716C]">
                  Complete these steps to maximize recruiter discovery and match confidence.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-[#0F766E] bg-[#CCFBF1] px-2.5 py-1 rounded-full border border-[#99F6E4]">
              4 / 5 Complete
            </span>
          </div>

          <div className="space-y-2 pt-1">
            {readinessChecklist.map((item, idx) => (
              <div 
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-xs transition-colors ${
                  item.done 
                    ? 'bg-stone-50/70 border-stone-200 text-stone-700' 
                    : 'bg-[#FFEDD5]/40 border-[#FED7AA] text-[#C2410C]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {item.done ? (
                    <div className="w-5 h-5 rounded-full bg-[#047857] text-white flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-[#F97316] text-[#F97316] flex items-center justify-center shrink-0 font-bold text-[10px]">
                      !
                    </div>
                  )}
                  <span className={`font-semibold ${item.done ? 'text-stone-800' : 'text-[#9A3412]'}`}>
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-bold text-stone-400">{item.points}</span>
                  {item.link && (
                    <Link
                      to={item.link}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-[11px] shadow-2xs transition-all"
                    >
                      <span>Complete Now</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Placement Target & Motivation (4 cols) */}
        <div className="lg:col-span-4 bg-white border border-[#E7E5E4] rounded-[14px] p-5 sm:p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFEDD5] text-[#F97316] border border-[#FED7AA] flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#1C1917] font-heading">
                  Weekly Placement Goal
                </h3>
                <p className="text-xs text-[#78716C]">Consistency boosts recruiter rank</p>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-[#1C1917]">3 of 5 applications sent</span>
                <span className="text-[#0F766E] font-bold">60%</span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2.5 overflow-hidden">
                <div className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] h-full rounded-full transition-all duration-500" style={{ width: '60%' }} />
              </div>
              <p className="text-[11px] text-[#78716C] mt-2">
                Sending 2 more tailored applications this week will maintain your placement momentum.
              </p>
            </div>
          </div>

          <Link
            to="/jobs?sort_by=best_match"
            className="w-full py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold text-center block shadow-2xs transition-all"
          >
            Browse Today's High Matches →
          </Link>
        </div>

      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[12px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Profile Strength</p>
          <p className="n text-2xl font-extrabold text-[#1C1917] mt-1">{stats.profile_strength}%</p>
          <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] mt-1.5">
            Verified ATS Ready
          </span>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Active Matches</p>
          <p className="n text-2xl font-extrabold text-[#0F766E] mt-1">{stats.new_matches}</p>
          <span className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4] mt-1.5">
            ≥ 70% match threshold
          </span>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Applications Sent</p>
          <p className="n text-2xl font-extrabold text-[#1C1917] mt-1">{stats.applications}</p>
          <span className="badge-pill bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4] mt-1.5">
            Actively tracked pipeline
          </span>
        </div>

        <div className="bg-white p-5 rounded-[12px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Shortlisted Roles</p>
          <p className="n text-2xl font-extrabold text-[#F97316] mt-1">{stats.shortlisted}</p>
          <span className="badge-pill bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] mt-1.5">
            Active recruiter interest
          </span>
        </div>

      </div>

      {/* 4. Placement Alerts & Activity Section */}
      {notifications.length > 0 && (
        <section className="bg-white rounded-[14px] border border-[#E7E5E4] p-5 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C1917] font-heading flex items-center gap-2">
                  Placement Alerts & Activity
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.2 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[10px] font-bold">
                      {unreadCount} new
                    </span>
                  )}
                </h2>
              </div>
            </div>
            <Link 
              to="/notifications" 
              className="text-xs font-bold text-[#0F766E] hover:text-[#115E59] hover:underline flex items-center gap-1"
            >
              All Alerts ({notifications.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (!notif.is_read) markAsRead(notif.id);
                  if (notif.link) navigate(notif.link);
                }}
                className={`p-3.5 rounded-xl border border-[#E7E5E4] hover:border-[#0F766E] hover:shadow-xs transition-all cursor-pointer flex flex-col justify-between ${
                  !notif.is_read ? 'bg-[#CCFBF1]/20' : 'bg-[#FAF8F5]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      notif.type?.includes('MATCH') 
                        ? 'bg-[#CCFBF1] text-[#0F766E]' 
                        : notif.type === 'MESSAGE' 
                          ? 'bg-[#EEF2FF] text-[#4F46E5]' 
                          : 'bg-[#ECFDF5] text-[#047857]'
                    }`}>
                      {notif.type?.replace('_', ' ') || 'ALERT'}
                    </span>
                    {!notif.is_read && (
                      <span className="w-2 h-2 rounded-full bg-[#F97316]" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#1C1917] line-clamp-1">{notif.title}</h4>
                  <p className="text-[11px] text-[#78716C] mt-1 line-clamp-2 leading-relaxed">
                    {notif.message}
                  </p>
                </div>
                <div className="pt-2 mt-2 border-t border-[#E7E5E4] flex items-center justify-between text-[10px] text-[#78716C]">
                  <span>{new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="font-bold text-[#0F766E] flex items-center gap-0.5">
                    View →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Section: Top AI Placement Matches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2 font-heading">
              <Sparkles className="w-4 h-4 text-[#0F766E]" />
              Top Semantic & AI Matches
            </h2>
            <p className="text-xs text-[#78716C]">
              Ranked dynamically by hybrid vector embeddings and taxonomy overlap.
            </p>
          </div>
          <Link 
            to="/jobs?sort_by=best_match" 
            className="text-xs font-bold text-[#0F766E] hover:text-[#115E59] hover:underline flex items-center gap-1"
          >
            See all matches
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {top_matches.slice(0, 3).map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>

      {/* 6. Section: Location-Aware Opportunities with Hub Pills */}
      <section className="bg-white rounded-[14px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2 font-heading">
                <MapPin className="w-4 h-4 text-[#0F766E]" />
                Opportunities Near You
              </h2>
              <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]">
                {filteredNearby.length} opportunities within {radiusFilter} km
              </span>
            </div>
            <p className="text-xs text-[#78716C] mt-1">
              Configured hub: <span className="font-semibold text-[#1C1917]">{data.preferred_location || 'Savar'}</span> · Privacy preserved (no live tracking)
            </p>
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#78716C] font-medium hidden sm:inline">Alert Radius:</span>
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="px-3 py-1.5 rounded-[8px] border border-[#E7E5E4] text-xs bg-[#F3EFEA] focus:outline-none focus:border-[#0F766E] font-semibold text-[#1C1917]"
            >
              <option value={2}>Within 2 km</option>
              <option value={5}>Within 5 km</option>
              <option value={10}>Within 10 km</option>
              <option value={20}>Within 20 km</option>
            </select>
          </div>
        </div>

        {/* Hub filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-[#78716C] font-semibold mr-1 shrink-0">Bangladesh Hubs:</span>
          {hubs.map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors shrink-0 cursor-pointer ${
                selectedHub === hub
                  ? 'bg-[#0F766E] text-white shadow-2xs'
                  : 'bg-[#F3EFEA] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>

        {/* Jobs list in selected radius */}
        {filteredNearby.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#78716C] bg-[#FAF8F5] rounded-[12px] border border-dashed border-[#E7E5E4]">
            No roles currently open in {selectedHub !== 'All' ? selectedHub : 'your hub'} within {radiusFilter} km. Try expanding your alert radius to 10 km or 20 km.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNearby.slice(0, 6).map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Section: Horizontal Application Tracker */}
      <section className="bg-white rounded-[14px] border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917] font-heading">Active Applications Pipeline</h2>
            <p className="text-xs text-[#78716C]">Real-time transparent stage tracking</p>
          </div>
          <Link to="/applications" className="text-xs font-bold text-[#0F766E] hover:text-[#115E59] hover:underline">
            View All Applications →
          </Link>
        </div>

        {recent_applications.length === 0 ? (
          <p className="text-xs text-[#78716C] py-4 text-center">No active applications yet. Apply to your top AI matches above!</p>
        ) : (
          <div className="space-y-3">
            {recent_applications.slice(0, 3).map((app) => (
              <div 
                key={app.id} 
                className="p-4 rounded-[12px] border border-[#E7E5E4] bg-[#FAF8F5] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#1C1917]">{app.job_title}</h4>
                  <p className="text-xs text-[#78716C] mt-0.5">{app.company_name} · Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                </div>

                {/* Horizontal Step Tracker with soft pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {applicationSteps.map((step, idx) => {
                    const currentIdx = applicationSteps.indexOf(app.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isPassed 
                            ? 'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]' 
                            : 'bg-[#F3EFEA] text-[#78716C] border border-[#E7E5E4]'
                        }`}>
                          {step}
                        </span>
                        {idx < applicationSteps.length - 1 && (
                          <span className="text-[#E7E5E4]">→</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
