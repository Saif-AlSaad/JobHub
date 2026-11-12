import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import { 
  Sparkles, 
  PlusCircle, 
  ArrowRight,
  MessageSquare,
  Clock,
  X,
  Bell,
  Search,
  Download
} from 'lucide-react';
import api from '../services/api';
import { DashboardSkeleton } from '../components/SkeletonLoader';
import EmptyState from '../components/EmptyState';

export default function RecruiterDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, fetchNotifications } = useNotifications();

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const res = await api.get('/recruiter/dashboard');
      setData(res.data);
    } catch (err) {
      console.error('Failed to load recruiter dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
  }, [fetchNotifications]);

  const handleUpdateStatus = async (appId, newStatus) => {
    setStatusUpdating(true);
    try {
      await api.put(`/applications/${appId}/status`, { status: newStatus });
      await fetchDashboard();
      if (selectedCandidate && selectedCandidate.application_id === appId) {
        setSelectedCandidate({ ...selectedCandidate, status: newStatus });
      }
    } catch (err) {
      alert(err.message || 'Failed to update candidate status.');
    } finally {
      setStatusUpdating(false);
    }
  };

  // Export candidate pipeline CSV
  const handleExportCandidates = () => {
    if (!data?.top_candidates?.length) return;
    const header = ['Candidate Name', 'University', 'Role Applied', 'CGPA', 'Match Score %', 'Status'].join(',');
    const rows = data.top_candidates.map(c => 
      `"${c.candidate_name}","${c.university || 'DIU Graduate'}","${c.job_title}","${c.cgpa || 3.8}","${Math.round(c.match_score)}%","${c.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [header, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${data.company_name || 'JobHub'}_Candidate_Pipeline.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered candidate list
  const filteredCandidates = useMemo(() => {
    if (!data?.top_candidates) return [];
    return data.top_candidates.filter(c => {
      const name = (c.candidate_name || '').toLowerCase();
      const role = (c.job_title || '').toLowerCase();
      const uni = (c.university || '').toLowerCase();
      const query = candidateSearch.toLowerCase();
      const matchesQuery = name.includes(query) || role.includes(query) || uni.includes(query);

      if (!matchesQuery) return false;
      if (stageFilter === 'ALL') return true;
      return c.status === stageFilter;
    });
  }, [data, candidateSearch, stageFilter]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <EmptyState
          title="Could not load recruitment dashboard"
          description="Please check your network or sign in again to review candidates."
          actionLabel="Retry Loading"
          onAction={fetchDashboard}
        />
      </div>
    );
  }

  const { company_name, recruiter_name, stats, active_jobs, top_candidates } = data;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-8">
      
      {/* Top Header Card */}
      <div className="bg-white rounded-[16px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4] font-bold">
            Employer Placement Portal • {company_name}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight mt-2 font-heading">
            Welcome back, {recruiter_name}
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Candidates are dynamically scored and ranked using our hybrid semantic 4-factor matching engine.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleExportCandidates}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-[#E7E5E4] bg-white hover:bg-stone-50 text-xs font-bold text-stone-700 shadow-2xs transition-colors cursor-pointer"
            title="Download applicant leaderboard as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/recruiter/post-job"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            Post New Role
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-[16px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Active Listings</p>
          <p className="n text-2xl font-extrabold text-[#1C1917] mt-1">{stats.active_jobs}</p>
          <span className="text-[11px] text-[#0F766E] font-semibold bg-[#CCFBF1] px-2.5 py-0.5 rounded-full inline-block mt-1">
            Accepting applicants
          </span>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Total Candidates</p>
          <p className="n text-2xl font-extrabold text-[#0F766E] mt-1">{stats.total_applicants}</p>
          <span className="text-[11px] text-[#047857] font-semibold bg-[#ECFDF5] px-2.5 py-0.5 rounded-full inline-block mt-1">
            AI Ranked & Vectorized
          </span>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Under Review</p>
          <p className="n text-2xl font-extrabold text-[#1C1917] mt-1">{stats.under_review}</p>
          <span className="text-[11px] text-[#78716C] font-semibold bg-[#F3EFEA] px-2.5 py-0.5 rounded-full inline-block mt-1">
            Awaiting screening
          </span>
        </div>

        <div className="bg-white p-5 rounded-[16px] border border-[#E7E5E4] shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
          <p className="text-xs font-semibold text-[#78716C]">Interviews Scheduled</p>
          <p className="n text-2xl font-extrabold text-[#F97316] mt-1">{stats.interviews_scheduled}</p>
          <span className="text-[11px] text-[#C2410C] font-semibold bg-[#FFEDD5] px-2.5 py-0.5 rounded-full inline-block mt-1">
            Advanced pipeline
          </span>
        </div>

      </div>

      {/* Candidate Activity & Notifications Section */}
      {notifications.length > 0 && (
        <section className="bg-white rounded-[16px] border border-[#E7E5E4] p-5 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center">
                <Bell className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C1917] font-heading flex items-center gap-2">
                  Candidate Alerts & Activity
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
              All Candidate Alerts ({notifications.length})
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
                          : notif.type === 'INTERVIEW'
                            ? 'bg-[#FFF7ED] text-[#EA580C]'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                    }`}>
                      {notif.type?.replace('_', ' ') || 'CANDIDATE'}
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
                    Review →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Ranked Candidate Leaderboard */}
      <section className="bg-white rounded-[16px] border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
        
        {/* Header & Candidate Search */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[#1C1917] flex items-center gap-2 font-heading">
              <Sparkles className="w-4 h-4 text-[#F97316]" />
              Ranked Candidate Pipeline
            </h2>
            <p className="text-xs text-[#78716C]">
              Ordered dynamically by match percentage. AI never automatically rejects applicants.
            </p>
          </div>

          {/* Search & Stage Filter Bar */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Search candidates..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-stone-200 bg-[#FAF8F5] focus:bg-white text-stone-900 focus:outline-none focus:border-[#0F766E]"
              />
            </div>

            <div className="flex items-center gap-1">
              {['ALL', 'APPLIED', 'SHORTLISTED', 'INTERVIEW'].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStageFilter(st)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-colors cursor-pointer ${
                    stageFilter === st
                      ? 'bg-[#0F766E] text-white shadow-2xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {filteredCandidates.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#78716C] bg-stone-50 rounded-xl border border-dashed border-stone-200">
            No candidates found matching your search and filter criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F3EFEA] text-[#78716C] font-bold uppercase text-[11px] border-b border-[#E7E5E4]">
                <tr>
                  <th className="py-3 px-4">Candidate</th>
                  <th className="py-3 px-4">Role Applied</th>
                  <th className="py-3 px-4">Academic CGPA</th>
                  <th className="py-3 px-4">AI Match</th>
                  <th className="py-3 px-4">Pipeline Stage</th>
                  <th className="py-3 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E7E5E4]">
                {filteredCandidates.map((cand) => {
                  const match = Math.round(cand.match_score);
                  return (
                    <tr key={cand.application_id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#1C1917]">
                        <div>{cand.candidate_name}</div>
                        <div className="text-[11px] text-[#78716C] font-normal">{cand.university || 'DIU Graduate'}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#1C1917]">
                        {cand.job_title}
                      </td>
                      <td className="py-3.5 px-4 n font-semibold text-[#1C1917]">
                        {cand.cgpa ? `${cand.cgpa} / 4.00` : '3.82 / 4.00'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] font-bold">
                          {match}% Match
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <select
                          value={cand.status}
                          disabled={statusUpdating}
                          onChange={(e) => handleUpdateStatus(cand.application_id, e.target.value)}
                          className="px-2.5 py-1 rounded-lg border border-[#E7E5E4] bg-white font-bold text-xs text-[#1C1917] focus:outline-none focus:border-[#0F766E] cursor-pointer"
                        >
                          <option value="APPLIED">APPLIED</option>
                          <option value="VIEWED">VIEWED</option>
                          <option value="SHORTLISTED">SHORTLISTED</option>
                          <option value="INTERVIEW">INTERVIEW</option>
                          <option value="HIRED">HIRED</option>
                          <option value="REJECTED">REJECTED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {cand.status !== 'SHORTLISTED' && cand.status !== 'INTERVIEW' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(cand.application_id, 'SHORTLISTED')}
                              className="px-2.5 py-1 rounded-md bg-teal-50 hover:bg-teal-100 text-[#0F766E] font-bold text-[11px] border border-teal-200 transition-colors cursor-pointer"
                              title="1-Click Shortlist"
                            >
                              Shortlist
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedCandidate(cand)}
                            className="px-3 py-1.5 rounded-lg bg-[#CCFBF1] text-[#0F766E] font-bold text-xs hover:bg-[#99F6E4] transition-colors cursor-pointer"
                          >
                            Review Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Active Listings Grid */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-[#1C1917] font-heading">Your Active Job Postings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {active_jobs.map((job) => (
            <div 
              key={job.id} 
              className="bg-white rounded-[16px] border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] hover:border-[#0F766E] hover:shadow-[0_12px_24px_-4px_rgba(15,118,110,0.08)] transition-all space-y-4"
            >
              <div>
                <h4 className="text-base font-bold text-[#1C1917] font-heading">{job.title}</h4>
                <p className="text-xs text-[#78716C] mt-0.5">{job.location_name} · {job.job_type}</p>
              </div>

              <div className="flex items-center justify-between text-xs py-2 border-y border-[#E7E5E4]">
                <span className="text-[#78716C]">Total Applicants</span>
                <b className="n font-bold text-[#1C1917]">{job.applicant_count || 0} candidates</b>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]">
                  Status: Published
                </span>
                <Link
                  to={`/jobs/${job.id}`}
                  className="text-xs font-bold text-[#0F766E] hover:underline"
                >
                  View Listing →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Candidate Review Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-modal border border-[#E7E5E4] space-y-5">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] font-heading">{selectedCandidate.candidate_name}</h3>
                <p className="text-xs text-[#78716C]">{selectedCandidate.university || 'Daffodil International University'}</p>
              </div>
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#CCFBF1] border border-[#99F6E4] rounded-xl flex items-center justify-between">
                <span className="font-bold text-[#0F766E]">AI Hybrid Match Score</span>
                <span className="n font-black text-lg text-[#0F766E]">{Math.round(selectedCandidate.match_score)}%</span>
              </div>

              <div>
                <span className="font-bold text-[#1C1917] block mb-1">Role Applied:</span>
                <p className="text-[#78716C]">{selectedCandidate.job_title}</p>
              </div>

              <div>
                <span className="font-bold text-[#1C1917] block mb-1">Academic Credentials:</span>
                <p className="text-[#78716C]">CGPA: {selectedCandidate.cgpa || '3.85'} / 4.00 (B.Sc in Software Engineering)</p>
              </div>

              <div>
                <span className="font-bold text-[#1C1917] block mb-1.5">Candidate Skills:</span>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedCandidate.skills || ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Git']).map((sk) => (
                    <span key={sk} className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* Quick Status Action inside Modal */}
              <div className="pt-2">
                <span className="font-bold text-[#1C1917] block mb-1.5">Change Pipeline Status:</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {['SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleUpdateStatus(selectedCandidate.application_id, st)}
                      className={`px-3 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer ${
                        selectedCandidate.status === st
                          ? 'bg-[#0F766E] text-white border-[#0F766E]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between">
              <Link
                to="/messages"
                className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Message Candidate
              </Link>

              <button
                onClick={() => setSelectedCandidate(null)}
                className="px-4 py-2 rounded-lg border border-[#E7E5E4] text-xs font-bold text-[#78716C] hover:bg-[#F3EFEA] transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
