import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Check, 
  Send, 
  MessageSquare, 
  Sparkles, 
  BookOpen, 
  FileText, 
  X, 
  CheckCircle2 
} from 'lucide-react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';
import { useAuth } from '../context/AuthContext';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Application Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [resumeCustomizerOpen, setResumeCustomizerOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/jobs/${id}`);
      setJob(res.data);
    } catch (err) {
      setError(err.message || 'Job not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleApply = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/applications/', {
        job_id: job.id,
        cover_note: coverNote || 'Excited to apply via JOB HUB placement matching.'
      });
      setApplySuccess(true);
      setApplyModalOpen(false);
      await fetchJob();
    } catch (err) {
      alert(err.message || 'Failed to submit application.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartChat = async () => {
    try {
      const res = await api.post('/chat/start', { job_id: job.id });
      navigate(`/messages?conversation_id=${res.data.conversation_id}`);
    } catch (err) {
      alert('Could not open chat with recruiter.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center text-sm text-secondary animate-pulse">
        Loading job specifications and computing AI match diagnostics...
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16">
        <EmptyState
          title="Job Opportunity Not Found"
          description="The job you are looking for may have been archived or filled."
          actionLabel="Back to Explorer"
          actionLink="/jobs"
        />
      </div>
    );
  }

  const matchAnalysis = job.match_analysis || {};
  const matchScore = Math.round(matchAnalysis.match_score || 88);

  // SVG circular gauge math: circumference = 2 * PI * 54 = ~339.29
  const circumference = 339.3;
  const dashoffset = Math.max(0, circumference - (circumference * matchScore) / 100);

  // Monogram for company
  const companyInitials = job.company?.name
    ? job.company.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'BE';

  // Extract skills breakdown
  const matchedSkills = matchAnalysis.skill_overlap?.matched_skills?.length > 0
    ? matchAnalysis.skill_overlap.matched_skills
    : ['Python', 'SQL', 'Git'];

  const missingSkills = matchAnalysis.skill_overlap?.missing_skills?.length > 0
    ? matchAnalysis.skill_overlap.missing_skills
    : ['Docker', 'Redis', 'FastAPI'];

  // Synthesize transferable skills (prerequisites with adjacent experience)
  const transferableSkills = ['Flask', 'PostgreSQL', 'REST APIs'].filter(s => !matchedSkills.includes(s));

  // Distance & transit
  const distanceKm = matchAnalysis.location_fit?.distance_km != null 
    ? matchAnalysis.location_fit.distance_km 
    : 4;
  const transitMin = Math.round(distanceKm * 5) || 20;

  // Format salary
  const salaryDisplay = job.salary_min
    ? `${job.salary_min.toLocaleString()} - ${job.salary_max ? job.salary_max.toLocaleString() : ''} ${job.salary_currency || 'BDT'}`
    : 'Competitive (Negotiable)';

  // Format responsibilities & culture
  const responsibilitiesList = job.responsibilities 
    ? job.responsibilities.split('\n').filter(Boolean)
    : [
        'Design and deploy resilient backend microservices with optimal database schema design.',
        'Collaborate with frontend engineers to construct clean, versioned REST and WebSocket APIs.',
        'Participate in peer code reviews, continuous integration pipelines, and cloud automated testing.'
      ];

  const cultureText = job.benefits || 'Inclusive engineering culture with dedicated mentorship, university graduate onboarding, flexible hybrid schedules, and sponsored professional learning budgets.';

  return (
    <div className="min-h-full bg-[#FAF8F5]">
      
      {/* Breadcrumb Navigation */}
      <div className="max-w-[1280px] mx-auto px-6 pt-6 pb-2">
        <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#0F766E] transition-colors">
          <ArrowLeft className="w-3.5 h-3.5 text-[#0F766E]" />
          Back to all opportunities
        </Link>
      </div>

      {/* Main 3-Column Prototype Grid */}
      <main className="max-w-[1280px] mx-auto px-6 py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: Aside Company & Quick Apply Card (3.5 cols on desktop) */}
        <aside className="lg:col-span-4 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)] p-6 box-border">
          
          {/* Monogram */}
          <div className="w-[52px] h-[52px] rounded-[12px] bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] font-extrabold flex items-center justify-center text-lg">
            {companyInitials}
          </div>

          {/* Job Title & Subhead */}
          <h1 className="text-[20px] font-bold text-[#1C1917] mt-4 mb-1 tracking-tight leading-snug font-heading">
            {job.title}
          </h1>
          <div className="text-[#78716C] text-sm font-medium">
            {job.company?.name || 'TechNova Labs'} · {job.location_name || 'Savar'}
          </div>

          {/* Specs List */}
          <div className="my-5 grid gap-2.5 text-sm text-[#1C1917]">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2">
              <span className="text-[#78716C]">Salary</span>
              <b className="n text-right font-semibold">{salaryDisplay}</b>
            </div>
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-2">
              <span className="text-[#78716C]">Distance</span>
              <b className="n text-right font-semibold">{distanceKm} km · {transitMin} min</b>
            </div>
            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[#78716C]">Type</span>
              <b className="text-right font-semibold">{job.job_type || 'Full-time'}</b>
            </div>
          </div>

          {/* Action Button */}
          {job.applied_status ? (
            <div className="w-full min-h-[48px] rounded-[10px] bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] font-bold text-xs flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-[#047857]" />
              Applied ({job.applied_status.status})
            </div>
          ) : user?.role === 'JOB_SEEKER' ? (
            <div className="space-y-2.5">
              <button
                onClick={() => setApplyModalOpen(true)}
                className="w-full min-h-[48px] border-0 rounded-[10px] bg-[#F97316] hover:bg-[#EA580C] text-white font-bold text-sm cursor-pointer shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <Send className="w-4 h-4" />
                Quick Apply Now
              </button>

              <button
                onClick={handleStartChat}
                className="w-full min-h-[42px] border border-[#E7E5E4] hover:bg-[#F3EFEA] text-[#1C1917] font-semibold text-xs rounded-[10px] transition-colors flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#0F766E]" />
                Message Hiring Manager
              </button>
            </div>
          ) : (
            <div className="p-3 bg-[#F3EFEA] border border-[#E7E5E4] rounded-[10px] text-center text-xs text-[#78716C] font-medium">
              Viewing as {user?.role || 'Guest'}
            </div>
          )}

        </aside>

        {/* COLUMN 2: Article Job Details (4.5 cols on desktop) */}
        <article className="lg:col-span-4 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)] p-6 box-border space-y-5">
          
          {/* Overview */}
          <div>
            <h2 className="text-[18px] font-bold text-[#1C1917] mb-2 font-heading">Overview</h2>
            <p className="text-[#1C1917]/90 leading-relaxed text-sm whitespace-pre-line m-0">
              {job.description}
            </p>
          </div>

          {/* Responsibilities */}
          <div>
            <h2 className="text-[18px] font-bold text-[#1C1917] mb-2 font-heading">Responsibilities</h2>
            <ul className="text-[#1C1917]/90 leading-relaxed text-sm space-y-1.5 pl-5 list-disc m-0">
              {responsibilitiesList.map((resp, i) => (
                <li key={i}>{resp.replace(/^[•\-\*]\s*/, '')}</li>
              ))}
            </ul>
          </div>

          {/* Culture */}
          <div>
            <h2 className="text-[18px] font-bold text-[#1C1917] mb-2 font-heading">Culture & Benefits</h2>
            <p className="text-[#1C1917]/90 leading-relaxed text-sm m-0">
              {cultureText}
            </p>
          </div>

          {/* Academic Prerequisites */}
          {job.academic_prerequisites && (
            <div className="pt-2 border-t border-[#E7E5E4]">
              <h2 className="text-[16px] font-bold text-[#1C1917] mb-1.5 font-heading">Academic Qualifications</h2>
              <p className="text-[#78716C] text-xs leading-relaxed">
                {job.academic_prerequisites}
              </p>
            </div>
          )}

        </article>

        {/* COLUMN 3: Section Explainable Match (4 cols on desktop) */}
        <section className="lg:col-span-4 bg-white border border-[#E7E5E4] rounded-[12px] shadow-[0_2px_6px_rgba(28,25,23,0.03)] p-6 box-border">
          
          {/* Top Radial Match Gauge & Percentage */}
          <div className="flex items-center gap-4">
            <svg 
              width="88" 
              height="88" 
              viewBox="0 0 140 140" 
              role="img" 
              aria-label={`Match ${matchScore} percent`}
              className="flex-shrink-0"
            >
              {/* Background ring */}
              <circle 
                cx="70" 
                cy="70" 
                r="54" 
                fill="none" 
                stroke="#E7E5E4" 
                strokeWidth="16" 
              />
              {/* Animated Progress ring */}
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
                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
              />
            </svg>
            <div>
              <div className="n text-[28px] font-extrabold text-[#1C1917] leading-none">
                {matchScore}%
              </div>
              <div className="text-[13px] text-[#78716C] font-medium mt-1">
                Why this match
              </div>
            </div>
          </div>

          {/* Matched Skills */}
          <h3 className="text-sm font-bold text-[#1C1917] mt-5 mb-2 font-heading">
            Matched Skills
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {matchedSkills.map((skill, i) => (
              <span 
                key={i} 
                className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Transferable Skills */}
          <h3 className="text-sm font-bold text-[#1C1917] mt-4 mb-2 font-heading">
            Transferable Skills
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {transferableSkills.map((skill, i) => (
              <span 
                key={i} 
                className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]"
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Missing Prerequisites */}
          <h3 className="text-sm font-bold text-[#1C1917] mt-4 mb-2 font-heading">
            Missing Prerequisites
          </h3>
          <div className="flex gap-1.5 flex-wrap">
            {missingSkills.map((skill, i) => (
              <span 
                key={i} 
                className="badge-pill bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]"
              >
                +{skill}
              </span>
            ))}
          </div>

          {/* Learning Roadmap */}
          <h3 className="text-sm font-bold text-[#1C1917] mt-5 mb-2 font-heading">
            Learning Roadmap
          </h3>
          <div className="space-y-1">
            {missingSkills.slice(0, 2).map((skill, i) => (
              <a 
                key={i} 
                href={`https://devdocs.io/${skill.toLowerCase()}`}
                target="_blank"
                rel="noreferrer"
                className="block text-sm text-[#0F766E] hover:text-[#115E59] hover:underline leading-relaxed font-medium"
              >
                {skill}: free tutorial →
              </a>
            ))}
          </div>

          {/* AI Resume Customizer Button */}
          <button 
            onClick={() => setResumeCustomizerOpen(true)}
            className="w-full mt-4 min-h-[48px] border border-[#99F6E4] rounded-[10px] bg-[#CCFBF1]/50 hover:bg-[#CCFBF1] text-[#0F766E] font-bold text-sm cursor-pointer transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#0F766E]" />
            AI Resume Customizer
          </button>

        </section>

      </main>

      {/* QUICK APPLY MODAL */}
      {applyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 shadow-[0_20px_48px_-8px_rgba(28,25,23,0.14)] border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] font-heading">Apply to {job.title}</h3>
                <p className="text-xs text-[#78716C]">{job.company?.name} • {matchScore}% Profile Match</p>
              </div>
              <button 
                onClick={() => setApplyModalOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1C1917] mb-1.5">
                  Tailored Candidate Note / Introduction
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder={`Hi ${job.company?.name || 'Hiring Team'}, I am excited to apply for the ${job.title} position. My experience in ${matchedSkills.join(', ')} aligns strongly with this opportunity...`}
                  className="w-full p-3 text-xs rounded-[10px] border border-[#E7E5E4] bg-[#FAF8F5] focus-ring text-[#1C1917]"
                />
              </div>

              <div className="p-3 bg-[#CCFBF1]/30 border border-[#99F6E4] rounded-[10px] flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#0F766E] flex-shrink-0" />
                <div className="text-xs">
                  <p className="font-semibold text-[#1C1917]">{user?.profile?.resume_filename || 'Sarah_Rahman_Software_Engineering_Resume.pdf'}</p>
                  <p className="text-[11px] text-[#78716C]">Parsed & Verified AI Placement Profile</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-[#E7E5E4] text-xs font-semibold text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold shadow-[0_4px_12px_rgba(249,115,22,0.25)] transition-all flex items-center gap-2"
                >
                  {submitting ? 'Submitting...' : 'Submit 1-Click Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI RESUME CUSTOMIZER MODAL */}
      {resumeCustomizerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-[12px] max-w-lg w-full p-6 shadow-[0_20px_48px_-8px_rgba(28,25,23,0.14)] border border-[#E7E5E4] space-y-4">
            <div className="flex items-center justify-between border-b border-[#E7E5E4] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-[#0F766E]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1C1917] font-heading">AI Resume Tailoring Assistant</h3>
                  <p className="text-xs text-[#78716C]">Highlights to emphasize for {job.company?.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setResumeCustomizerOpen(false)}
                className="text-[#78716C] hover:text-[#1C1917] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-[#F3EFEA] border border-[#E7E5E4] rounded-[10px]">
                <p className="font-bold text-[#1C1917] mb-1 text-[13px]">Recommended Resume Focus Points:</p>
                <ul className="space-y-1.5 text-[#1C1917]/90 pl-4 list-disc">
                  <li>Prominently feature your <b>{matchedSkills.join(' & ')}</b> projects on GitHub in the first section of your profile.</li>
                  <li>Emphasize your DIU Capstone Project demonstrating real-world backend API latency reductions.</li>
                  <li>Mention your familiarity with <b>{transferableSkills.join(', ')}</b> to demonstrate rapid technical adaptability.</li>
                </ul>
              </div>

              <div className="p-3 bg-[#ECFDF5] border border-[#A7F3D0] rounded-[10px] text-[#047857]">
                <p className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#047857]" />
                  Your Profile Match Score is {matchScore}% (High Tier)
                </p>
                <p className="text-[11px] mt-0.5 text-[#78716C]">
                  Applicants with ≥ 80% match receive proactive recruiter prioritization in the candidate pipeline.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => {
                  setResumeCustomizerOpen(false);
                  setApplyModalOpen(true);
                }}
                className="w-full px-5 py-2.5 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                Proceed to Apply With Tailored Profile →
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
