import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileText, 
  MapPin, 
  Sparkles, 
  Check, 
  Clock, 
  MessageSquare, 
  ArrowRight, 
  Calendar,
  Search,
  ChevronDown,
  Edit3,
  X,
  AlertCircle,
  Download
} from 'lucide-react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

const STEPS = [
  { key: 'APPLIED', label: 'Applied' },
  { key: 'VIEWED', label: 'Viewed' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'HIRED', label: 'Hired' },
];

const STEP_KEYS = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];

const formatDate = (dateStr) => {
  if (!dateStr) return 'Recently';
  try {
    return new Date(dateStr).toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Recently';
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case 'HIRED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        label: 'HIRED',
      };
    case 'INTERVIEW':
      return {
        bg: 'bg-violet-50 text-violet-700 border-violet-200',
        label: 'INTERVIEW',
      };
    case 'SHORTLISTED':
      return {
        bg: 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]',
        label: 'SHORTLISTED',
      };
    case 'VIEWED':
      return {
        bg: 'bg-sky-50 text-sky-700 border-sky-200',
        label: 'VIEWED',
      };
    case 'REJECTED':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        label: 'REJECTED',
      };
    case 'WITHDRAWN':
      return {
        bg: 'bg-stone-100 text-stone-500 border-stone-200',
        label: 'WITHDRAWN',
      };
    case 'APPLIED':
    default:
      return {
        bg: 'bg-stone-100 text-stone-700 border-stone-200',
        label: 'APPLIED',
      };
  }
};

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest_match' | 'company'
  
  // Personal notes management
  const [openNotesId, setOpenNotesId] = useState(null);
  const [currentNoteText, setCurrentNoteText] = useState('');
  
  // Withdrawal confirmation modal
  const [withdrawModalApp, setWithdrawModalApp] = useState(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data || []);
    } catch (err) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStepIndex = (status) => {
    return STEP_KEYS.indexOf(status);
  };

  // Open note drawer for an app
  const handleOpenNotes = (appId) => {
    if (openNotesId === appId) {
      setOpenNotesId(null);
    } else {
      setOpenNotesId(appId);
      const saved = localStorage.getItem(`jobhub_app_note_${appId}`) || '';
      setCurrentNoteText(saved);
    }
  };

  const handleSaveNote = (appId) => {
    localStorage.setItem(`jobhub_app_note_${appId}`, currentNoteText);
    setOpenNotesId(null);
  };

  // Confirm withdraw
  const handleWithdraw = (appId) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status: 'WITHDRAWN', notes: 'Application withdrawn by candidate' } : a))
    );
    setWithdrawModalApp(null);
  };

  // Export summary to clipboard or file
  const handleExportSummary = () => {
    const text = applications
      .map((a, i) => `${i + 1}. ${a.job_title || a.job?.title} at ${a.company_name || a.job?.company?.name} - Status: ${a.status} (Match: ${Math.round(a.match_score || 0)}%)`)
      .join('\n');
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      alert('Applications summary copied to clipboard!');
    }
  };

  // Filtered and sorted applications
  const filteredApplications = useMemo(() => {
    return applications
      .filter((app) => {
        const title = (app.job_title || app.job?.title || '').toLowerCase();
        const company = (app.company_name || app.job?.company?.name || '').toLowerCase();
        const loc = (app.location_name || app.job?.location_name || '').toLowerCase();
        const query = searchTerm.toLowerCase();

        const matchesSearch = title.includes(query) || company.includes(query) || loc.includes(query);

        if (!matchesSearch) return false;

        if (statusFilter === 'ALL') return true;
        if (statusFilter === 'ACTIVE') return !['REJECTED', 'WITHDRAWN', 'HIRED'].includes(app.status);
        return app.status === statusFilter;
      })
      .sort((a, b) => {
        if (sortBy === 'highest_match') {
          return (b.match_score || 0) - (a.match_score || 0);
        }
        if (sortBy === 'company') {
          const cA = (a.company_name || a.job?.company?.name || '').toLowerCase();
          const cB = (b.company_name || b.job?.company?.name || '').toLowerCase();
          return cA.localeCompare(cB);
        }
        // default newest
        return new Date(b.applied_at || b.created_at || 0) - new Date(a.applied_at || a.created_at || 0);
      });
  }, [applications, searchTerm, statusFilter, sortBy]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-7">
      
      {/* Header & Pipeline Metrics */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-[#0F766E] border border-[#99F6E4] text-xs font-semibold mb-2.5 shadow-2xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0F766E]"></span>
            </span>
            <span>Real-Time Recruitment Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight font-heading">
            Active Applications Tracker
          </h1>
          <p className="text-sm text-[#78716C] mt-1.5 max-w-2xl leading-relaxed">
            Monitor your interview stages, review recruiter feedback notes, and track your recruitment progression with zero opacity.
          </p>
        </div>

        {/* Quick Pipeline Status Metrics & Export */}
        {!loading && applications.length > 0 && (
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            <div className="bg-white border border-stone-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Total Active</span>
              <span className="text-lg font-extrabold text-[#1C1917] n">{applications.length}</span>
            </div>
            <div className="bg-white border border-stone-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Shortlisted</span>
              <span className="text-lg font-extrabold text-[#0F766E] n">
                {applications.filter((a) => ['SHORTLISTED', 'INTERVIEW', 'HIRED'].includes(a.status)).length}
              </span>
            </div>
            <div className="bg-white border border-stone-200/90 rounded-xl px-3.5 py-2 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">Top Match</span>
              <span className="text-lg font-extrabold text-[#F97316] n">
                {Math.max(...applications.map((a) => Math.round(a.match_score || 0)), 0)}%
              </span>
            </div>
            <button
              type="button"
              onClick={handleExportSummary}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-stone-200 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-700 shadow-2xs transition-colors cursor-pointer"
              title="Copy formatted summary of all applications"
            >
              <Download className="w-3.5 h-3.5 text-[#0F766E]" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        )}
      </div>

      {/* SEARCH & FILTER CONTROLS BAR */}
      {!loading && applications.length > 0 && (
        <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by job title, company, or hub location..."
              className="w-full pl-8 pr-3 py-2 text-xs rounded-lg border border-stone-200 bg-[#FAF8F5] focus:bg-white text-[#1C1917] focus:outline-none focus:border-[#0F766E]"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {['ALL', 'ACTIVE', 'SHORTLISTED', 'INTERVIEW', 'HIRED', 'REJECTED'].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-[#0F766E] text-white shadow-2xs'
                    : 'bg-stone-100/80 hover:bg-stone-200 text-stone-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-stone-400 font-medium">Sort:</span>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-800 font-semibold cursor-pointer focus:outline-none focus:border-[#0F766E]"
              >
                <option value="newest">Recently Applied</option>
                <option value="highest_match">Highest Match %</option>
                <option value="company">Company Name</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-stone-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-44 bg-white rounded-2xl border border-stone-200/80 animate-pulse shadow-2xs"></div>
          <div className="h-44 bg-white rounded-2xl border border-stone-200/80 animate-pulse shadow-2xs"></div>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Active Applications Yet"
          description="Your next opportunity is waiting. Discover jobs tailored to your skills from your personalized feed."
          actionLabel="Find Matching Jobs"
          actionLink="/jobs"
        />
      ) : filteredApplications.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl border border-stone-200 text-center space-y-3">
          <p className="text-sm font-bold text-[#1C1917]">No applications match your filter criteria.</p>
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}
            className="px-4 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-semibold"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filteredApplications.map((app) => {
            const currentIdx = getStepIndex(app.status);
            const isRejected = app.status === 'REJECTED';
            const isWithdrawn = app.status === 'WITHDRAWN';
            const company = app.company_name || app.job?.company?.name || 'Tech Company';
            const initials = company
              .split(' ')
              .filter(Boolean)
              .map((w) => w[0])
              .slice(0, 2)
              .join('')
              .toUpperCase() || 'TC';
            const badgeInfo = getStatusBadge(app.status);
            const appliedDateStr = formatDate(app.applied_at || app.created_at);
            const updatedDateStr = formatDate(app.updated_at || app.applied_at);
            const hasPersonalNote = Boolean(localStorage.getItem(`jobhub_app_note_${app.id}`));

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(28,25,23,0.08)] hover:border-stone-300 transition-all duration-200 space-y-5"
              >
                
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Company Initial Avatar */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#0F766E]/10 to-[#0F766E]/20 border border-[#99F6E4]/70 text-[#0F766E] font-extrabold flex items-center justify-center text-sm shadow-2xs shrink-0 tracking-wider">
                      {initials}
                    </div>

                    <div className="space-y-1">
                      <Link 
                        to={`/jobs/${app.job_id}`}
                        className="text-base sm:text-lg font-bold text-[#1C1917] hover:text-[#0F766E] transition-colors font-heading inline-block"
                      >
                        {app.job_title || app.job?.title || 'Engineering Role'}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#78716C]">
                        <span className="font-semibold text-stone-800">{company}</span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400" />
                          {app.location_name || app.job?.location_name || 'Savar, Dhaka'}
                        </span>
                        <span className="text-stone-300">•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          Applied on {appliedDateStr}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Match Badges */}
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center gap-1.5 shadow-2xs">
                      <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                      <span className="n">{Math.round(app.match_score || 0)}% Match</span>
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold border shadow-2xs ${badgeInfo.bg}`}>
                      {badgeInfo.label}
                    </span>
                  </div>
                </div>

                {/* Recruiter Activity Pulse Strip */}
                <div className="px-4 py-2.5 bg-stone-50/90 border border-stone-200/80 rounded-xl text-xs text-stone-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span className="text-stone-600 font-medium">
                      <span className="text-stone-400 mr-1.5 font-normal">Recruiter Status:</span>
                      <b className="text-stone-900 font-semibold">{app.notes || 'Application received & profile vector match calculated'}</b>
                    </span>
                  </div>
                  <div className="text-[11px] font-medium text-stone-500 flex items-center gap-1.5 shrink-0">
                    <Clock className="w-3 h-3 text-stone-400" />
                    <span>Updated {updatedDateStr}</span>
                  </div>
                </div>

                {/* Horizontal Stepper Progress Pipeline */}
                {!isWithdrawn && (
                  <div className="pt-2 pb-1">
                    <div className="relative">
                      <div className="grid grid-cols-5 relative">
                        {STEPS.map((step, idx) => {
                          const isComplete = idx < currentIdx;
                          const isCurrent = idx === currentIdx;

                          return (
                            <div key={step.key} className="flex flex-col items-center relative">
                              
                              {/* Step Connector Line */}
                              {idx > 0 && (
                                <div 
                                  className={`absolute top-3.5 right-1/2 left-[-50%] h-[2.5px] -translate-y-1/2 z-0 transition-colors duration-300 ${
                                    idx <= currentIdx && !isRejected ? 'bg-[#0F766E]' : 'bg-stone-200'
                                  }`} 
                                />
                              )}

                              {/* Step Node Circle */}
                              <div className="relative z-10 flex items-center justify-center mb-2">
                                {isComplete && !isRejected ? (
                                  <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-2xs transition-transform hover:scale-105">
                                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                                  </div>
                                ) : isCurrent && !isRejected ? (
                                  <div className="relative flex items-center justify-center">
                                    <span className="animate-ping absolute inline-flex h-7 w-7 rounded-full bg-[#0F766E]/30"></span>
                                    <div className="w-7 h-7 rounded-full bg-[#0F766E] text-white flex items-center justify-center shadow-xs ring-4 ring-[#CCFBF1]">
                                      <span className="w-2 h-2 rounded-full bg-white"></span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="w-7 h-7 rounded-full bg-stone-100 border-2 border-stone-300 flex items-center justify-center text-stone-400 text-[11px] font-semibold">
                                    {idx + 1}
                                  </div>
                                )}
                              </div>

                              {/* Step Label */}
                              <div className="text-center px-1">
                                <span className={`block text-xs transition-colors ${
                                  isCurrent 
                                    ? 'font-bold text-[#0F766E]' 
                                    : isComplete 
                                    ? 'font-semibold text-stone-800' 
                                    : 'font-medium text-stone-400'
                                }`}>
                                  {step.label}
                                </span>
                                {isCurrent && !isRejected && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-teal-50 text-[#0F766E] border border-teal-200/60">
                                    Active
                                  </span>
                                )}
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Candidate Personal Prep Notes Drawer (Collapsible) */}
                {openNotesId === app.id && (
                  <div className="p-4 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl space-y-2 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
                        <Edit3 className="w-3.5 h-3.5 text-[#0F766E]" />
                        My Private Interview Notes & Checklist
                      </span>
                      <span className="text-[10px] text-[#78716C]">Stored locally on your device</span>
                    </div>
                    <textarea
                      rows={3}
                      value={currentNoteText}
                      onChange={(e) => setCurrentNoteText(e.target.value)}
                      placeholder="Add prep notes: salary expectation, key questions for recruiter, technical project talking points..."
                      className="w-full p-2.5 text-xs rounded-lg border border-stone-300 bg-white text-[#1C1917] focus:outline-none focus:border-[#0F766E]"
                    />
                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setOpenNotesId(null)}
                        className="px-3 py-1 rounded text-xs text-stone-600 hover:bg-stone-200/60 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveNote(app.id)}
                        className="px-3.5 py-1 rounded bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-semibold cursor-pointer"
                      >
                        Save Notes
                      </button>
                    </div>
                  </div>
                )}

                {/* Action CTA Bottom Bar */}
                <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/messages`}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold text-[#0F766E] bg-teal-50/80 hover:bg-teal-100/70 border border-teal-200/60 transition-all duration-150 active:scale-95 shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Chat with Hiring Manager</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleOpenNotes(app.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold border transition-all cursor-pointer ${
                        hasPersonalNote
                          ? 'bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                      title="Add private interview preparation notes"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>{hasPersonalNote ? 'View My Notes' : 'Add Prep Notes'}</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {!isWithdrawn && app.status !== 'HIRED' && (
                      <button
                        type="button"
                        onClick={() => setWithdrawModalApp(app)}
                        className="text-stone-400 hover:text-rose-600 text-xs font-medium transition-colors cursor-pointer"
                      >
                        Withdraw
                      </button>
                    )}

                    <Link
                      to={`/jobs/${app.job_id}`}
                      className="group inline-flex items-center gap-1.5 font-semibold text-stone-700 hover:text-[#0F766E] transition-colors py-1 px-2 cursor-pointer"
                    >
                      <span>Role Specs</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-150" />
                    </Link>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* WITHDRAW APPLICATION CONFIRMATION MODAL */}
      {withdrawModalApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-xl border border-stone-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-sm font-bold text-stone-900 font-heading">Withdraw Application?</h3>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to withdraw your application for <b>{withdrawModalApp.job_title || withdrawModalApp.job?.title}</b> at {withdrawModalApp.company_name || withdrawModalApp.job?.company?.name}? The recruiter will be notified.
            </p>
            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setWithdrawModalApp(null)}
                className="px-3.5 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Keep Application
              </button>
              <button
                type="button"
                onClick={() => handleWithdraw(withdrawModalApp.id)}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Confirm Withdrawal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
