import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles, Navigation } from 'lucide-react';

export default function JobCard({ job }) {
  const matchScore = Math.round(job.match_score || 0);

  // Match score color badge
  const getMatchBadgeStyle = (score) => {
    if (score >= 80) return 'bg-[#D1FAE5] text-[#047857] border-[#A7F3D0]';
    if (score >= 70) return 'bg-[#EEF2FF] text-[#4F46E5] border-[#C7D2FE]';
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const matchedSkills = job.matched_skills || [];
  const missingSkills = job.missing_skills || [];
  const displayMatched = matchedSkills.slice(0, 3);
  const displayMissing = missingSkills.slice(0, 2);

  // Monogram initials
  const initials = job.company?.name
    ? job.company.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'BE';

  const salaryDisplay = job.salary_min
    ? `${job.salary_min.toLocaleString()} - ${job.salary_max ? job.salary_max.toLocaleString() : ''} ${job.salary_currency || 'BDT'}`
    : null;

  return (
    <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_30px_-4px_rgba(0,0,0,0.08)] hover:border-[#4F46E5]/40 transition-all duration-200 flex flex-col justify-between group">
      <div>
        
        {/* Top Header: Company info & Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[14px] bg-[#E0E7FF] text-[#4F46E5] font-extrabold flex items-center justify-center text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#475569] flex items-center gap-1.5">
                <span>{job.company?.name || 'Top Employer'}</span>
                {job.is_remote && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]">
                    Remote
                  </span>
                )}
              </div>
              <Link 
                to={`/jobs/${job.id}`}
                className="text-[16px] font-bold text-[#0F172A] group-hover:text-[#4F46E5] transition-colors line-clamp-1 mt-0.5"
              >
                {job.title}
              </Link>
            </div>
          </div>

          {/* Focal Match Badge */}
          {matchScore > 0 && (
            <div className={`px-2.5 py-1 rounded-[8px] border text-xs font-bold flex items-center gap-1 flex-shrink-0 ${getMatchBadgeStyle(matchScore)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="n">{matchScore}%</span>
            </div>
          )}
        </div>

        {/* Location & Proximity Line */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-[#475569] mb-3.5">
          <div className="flex items-center gap-1 text-[#0F172A] font-medium">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location_name}</span>
          </div>

          {job.distance_km !== null && job.distance_km !== undefined && !job.is_remote && (
            <span className="flex items-center gap-1 text-[#047857] font-semibold text-[11px] bg-[#D1FAE5] px-2 py-0.5 rounded-full n">
              <Navigation className="w-2.5 h-2.5" />
              {job.distance_km} km
            </span>
          )}

          <span className="text-slate-300">•</span>
          <span>{job.job_type}</span>
          
          {salaryDisplay && (
            <>
              <span className="text-slate-300">•</span>
              <span className="n font-semibold text-[#0F172A]">
                {salaryDisplay}
              </span>
            </>
          )}
        </div>

        {/* Skill Chips Matching the Prototype Standard */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {displayMatched.map((skill, i) => (
            <span 
              key={i} 
              className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#D1FAE5] text-[#047857]"
            >
              {skill}
            </span>
          ))}
          {displayMissing.map((skill, i) => (
            <span 
              key={i} 
              className="inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#92400E]"
            >
              +{skill}
            </span>
          ))}
        </div>

      </div>

      {/* Bottom CTA Row */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <span className="text-[11px] text-[#64748B] font-medium">
          {job.applied_status ? `Status: ${job.applied_status.status}` : 'Proactive AI Placement'}
        </span>

        <Link
          to={`/jobs/${job.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#4F46E5] group-hover:translate-x-0.5 transition-transform"
        >
          View Match Diagnostic
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
