import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  MapPin, 
  TrendingUp, 
  FileText, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  Navigation,
  BookOpen,
  Check,
  Building2
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
  }, []);

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

  const { candidate_name, first_name, stats, top_matches, nearby_opportunities, recent_applications, skill_gap_roadmap } = data;

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

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-8">
      
      {/* 1. Hero Placement Radar & Radial Gauge */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Left greeting & mission */}
        <div className="space-y-3 flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
            Proactive AI Placement Engine Active
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            Welcome back, {first_name || 'Sarah'}
          </h1>

          <p className="text-sm text-[#475569] leading-relaxed max-w-2xl">
            JOB HUB is continuously calculating hybrid semantic matches against open software engineering and internship roles within your preferred hub radius.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors shadow-sm"
            >
              <Compass className="w-4 h-4" />
              Explore Matches
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[10px] bg-slate-100 hover:bg-slate-200 text-[#0F172A] text-xs font-bold transition-colors"
            >
              Adjust Hub & Skills
            </Link>
          </div>
        </div>

        {/* Center / Right Radial Market Readiness Hero Gauge */}
        <div className="flex items-center gap-6 p-5 rounded-[16px] bg-[#F8FAFC] border border-[#E2E8F0] flex-shrink-0">
          <svg 
            width="96" 
            height="96" 
            viewBox="0 0 140 140" 
            role="img" 
            aria-label={`Overall Placement Readiness ${overallScore} percent`}
            className="flex-shrink-0"
          >
            <circle 
              cx="70" 
              cy="70" 
              r="54" 
              fill="none" 
              stroke="#E2E8F0" 
              strokeWidth="16" 
            />
            <circle 
              cx="70" 
              cy="70" 
              r="54" 
              fill="none" 
              stroke="#10B981" 
              strokeWidth="16" 
              strokeLinecap="round" 
              strokeDasharray="339.3" 
              strokeDashoffset={dashoffset} 
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div>
            <div className="n text-3xl font-extrabold text-[#0F172A] leading-none">
              {overallScore}%
            </div>
            <div className="text-xs font-bold text-[#0F172A] mt-1">
              Profile Placement Readiness
            </div>
            <div className="text-[11px] text-[#047857] font-semibold mt-0.5">
              Top 5% of DIU graduates
            </div>
            <div className="text-[10px] text-[#64748B] mt-1">
              Based on semantic resume vector overlap
            </div>
          </div>
        </div>

      </div>

      {/* 2. "Next Best Action" Opportunity Callout Card */}
      <div className="bg-[#ECFEFF] border border-[#06B6D4] rounded-[16px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-[12px] bg-white border border-[#A5F3FC] text-[#0E7490] flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5 text-[#06B6D4]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#0E7490] uppercase tracking-wider">
              Next Best Action Recommendation
            </p>
            <p className="text-sm font-semibold text-[#0F172A] mt-0.5">
              Add <span className="underline decoration-[#06B6D4] font-bold">Docker & Redis</span> to increase your average placement match score from 87% to 94%.
            </p>
          </div>
        </div>

        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[10px] bg-[#0E7490] hover:bg-[#155E75] text-white text-xs font-bold transition-colors whitespace-nowrap flex-shrink-0"
        >
          Update Skills Now
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 3. Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold text-[#64748B]">Profile Strength</p>
          <p className="n text-2xl font-extrabold text-[#0F172A] mt-1">{stats.profile_strength}%</p>
          <span className="text-[11px] text-[#047857] font-semibold bg-[#D1FAE5] px-2 py-0.5 rounded-full inline-block mt-1">
            Verified ATS Ready
          </span>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold text-[#64748B]">Active Matches</p>
          <p className="n text-2xl font-extrabold text-[#4F46E5] mt-1">{stats.new_matches}</p>
          <span className="text-[11px] text-[#4F46E5] font-semibold bg-[#EEF2FF] px-2 py-0.5 rounded-full inline-block mt-1">
            Above 70% match threshold
          </span>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold text-[#64748B]">Applications Sent</p>
          <p className="n text-2xl font-extrabold text-[#0F172A] mt-1">{stats.applications}</p>
          <span className="text-[11px] text-[#64748B] font-semibold bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
            Actively tracked pipeline
          </span>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
          <p className="text-xs font-semibold text-[#64748B]">Shortlisted Candidates</p>
          <p className="n text-2xl font-extrabold text-[#10B981] mt-1">{stats.shortlisted}</p>
          <span className="text-[11px] text-[#047857] font-semibold bg-[#D1FAE5] px-2 py-0.5 rounded-full inline-block mt-1">
            Active recruiter interest
          </span>
        </div>

      </div>

      {/* 4. Section: Top AI Placement Matches */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
              Top Semantic & AI Matches
            </h2>
            <p className="text-xs text-[#64748B]">
              Ranked dynamically by hybrid vector embeddings and taxonomy overlap.
            </p>
          </div>
          <Link 
            to="/jobs?sort_by=best_match" 
            className="text-xs font-bold text-[#4F46E5] hover:underline flex items-center gap-1"
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

      {/* 5. Section: Location-Aware Opportunities with Hub Pills */}
      <section className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 sm:p-7 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#10B981]" />
                Opportunities Near You
              </h2>
              <span className="n px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]">
                {filteredNearby.length} opportunities within {radiusFilter} km
              </span>
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Configured hub: <span className="font-semibold text-[#0F172A]">{data.preferred_location || 'Savar'}</span> · Privacy preserved (no live tracking)
            </p>
          </div>

          {/* Radius selector */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-[#64748B] font-medium hidden sm:inline">Alert Radius:</span>
            <select
              value={radiusFilter}
              onChange={(e) => setRadiusFilter(Number(e.target.value))}
              className="px-3 py-1.5 rounded-[10px] border border-[#E2E8F0] text-xs bg-slate-50 focus-ring font-semibold text-[#0F172A]"
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
          <span className="text-xs text-[#64748B] font-semibold mr-1 flex-shrink-0">Bangladesh Hubs:</span>
          {hubs.map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors flex-shrink-0 ${
                selectedHub === hub
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
              }`}
            >
              {hub}
            </button>
          ))}
        </div>

        {/* Jobs list in selected radius */}
        {filteredNearby.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] bg-[#F8FAFC] rounded-[12px] border border-dashed border-[#CBD5E1]">
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

      {/* 6. Section: Horizontal Application Tracker */}
      <section className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#0F172A]">Active Applications Pipeline</h2>
            <p className="text-xs text-[#64748B]">Real-time transparent stage tracking</p>
          </div>
          <Link to="/applications" className="text-xs font-bold text-[#4F46E5] hover:underline">
            View All Applications →
          </Link>
        </div>

        {recent_applications.length === 0 ? (
          <p className="text-xs text-[#64748B] py-4 text-center">No active applications yet. Apply to your top AI matches above!</p>
        ) : (
          <div className="space-y-3">
            {recent_applications.slice(0, 3).map((app) => (
              <div 
                key={app.id} 
                className="p-4 rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">{app.job_title}</h4>
                  <p className="text-xs text-[#64748B] mt-0.5">{app.company_name} · Applied on {new Date(app.created_at).toLocaleDateString()}</p>
                </div>

                {/* Horizontal Step Tracker */}
                <div className="flex items-center gap-1.5">
                  {applicationSteps.map((step, idx) => {
                    const currentIdx = applicationSteps.indexOf(app.status);
                    const isPassed = idx <= currentIdx;
                    return (
                      <div key={step} className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          isPassed 
                            ? 'bg-[#D1FAE5] text-[#047857]' 
                            : 'bg-slate-200 text-slate-500'
                        }`}>
                          {step}
                        </span>
                        {idx < applicationSteps.length - 1 && (
                          <span className="text-slate-300">→</span>
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
