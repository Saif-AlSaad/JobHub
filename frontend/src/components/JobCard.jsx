import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles, Navigation } from 'lucide-react';

export default function JobCard({ job }) {
  const matchScore = Math.round(job.match_score || 0);

  // Soft-tint match score badge
  const getMatchBadgeStyle = (score) => {
    if (score >= 80) return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
    if (score >= 70) return 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]';
    return 'bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4]';
  };

  const matchedSkills = job.matched_skills || [];
  const missingSkills = job.missing_skills || [];
  const displayMatched = matchedSkills.slice(0, 3);
  const displayMissing = missingSkills.slice(0, 2);

  // Company initials
  const initials = job.company?.name
    ? job.company.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : 'JH';

  const isFeaturedOrUrgent = Boolean(job.is_urgent || job.is_featured || job.urgent || job.featured || matchScore >= 88);

  const salaryDisplay = job.salary_min
    ? `${job.salary_min.toLocaleString()} - ${job.salary_max ? job.salary_max.toLocaleString() : ''} ${job.salary_currency || 'BDT'}`
    : null;

  const formatJobType = (type) => {
    if (!type) return 'Full-Time';
    const cleaned = type.replace('_', ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  return (
    <div className="bg-white rounded-[12px] border border-[#E7E5E4] p-5 shadow-[0_2px_6px_rgba(28,25,23,0.03)] hover:-translate-y-[3px] hover:border-[#0F766E] hover:shadow-[0_12px_24px_-4px_rgba(15,118,110,0.08)] transition-all duration-200 flex flex-col justify-between group">
      <div>
        
        {/* Top Header: Company info & Match Badge */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-[10px] bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] font-extrabold flex items-center justify-center text-sm flex-shrink-0">
              {initials}
            </div>
            <div>
              <div className="text-xs font-semibold text-[#78716C] flex items-center gap-1.5 flex-wrap">
                <span>{job.company?.name || 'Top Employer'}</span>
                {job.is_remote ? (
                  <span className="badge-pill bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]">
                    Remote
                  </span>
                ) : (
                  <span className="badge-pill bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4]">
                    On-Site
                  </span>
                )}
                {isFeaturedOrUrgent && (
                  <span className="badge-pill bg-[#FEF3C7] text-[#B45309] border-[#FDE68A]">
                    Featured
                  </span>
                )}
              </div>
              <Link 
                to={`/jobs/${job.id}`}
                className="text-[15px] sm:text-[16px] font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors line-clamp-1 mt-0.5"
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
        <div className="flex flex-wrap items-center gap-y-1.5 gap-x-2 text-xs text-[#78716C] mb-3.5">
          <div className="flex items-center gap-1 text-[#1C1917] font-medium">
            <MapPin className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>{job.location_name}</span>
          </div>

          {job.distance_km !== null && job.distance_km !== undefined && !job.is_remote && (
            <span className="flex items-center gap-1 text-[#047857] font-semibold text-[11px] bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full n">
              <Navigation className="w-2.5 h-2.5" />
              {job.distance_km} km
            </span>
          )}

          <span className="text-[#E7E5E4]">•</span>
          
          {/* Job Type Soft-Tint Pill */}
          <span className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]">
            {formatJobType(job.job_type)}
          </span>
          
          {salaryDisplay && (
            <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]">
              {salaryDisplay}
            </span>
          )}
        </div>

        {/* Skill Chips */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {displayMatched.map((skill, i) => (
            <span 
              key={i} 
              className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]/70"
            >
              {skill}
            </span>
          ))}
          {displayMissing.map((skill, i) => (
            <span 
              key={i} 
              className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]/70"
            >
              +{skill}
            </span>
          ))}
        </div>

      </div>

      {/* Bottom CTA Row: Status & High-Conversion Apply Button */}
      <div className="pt-3 border-t border-[#E7E5E4] flex items-center justify-between gap-2">
        <span className="text-[11px] text-[#78716C] font-medium truncate">
          {job.applied_status ? `Status: ${job.applied_status.status}` : 'AI Placement Match'}
        </span>

        <Link
          to={`/jobs/${job.id}`}
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 ${
            isFeaturedOrUrgent
              ? 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-[0_4px_12px_rgba(249,115,22,0.25)]'
              : 'bg-[#0F766E] hover:bg-[#115E59] text-white'
          }`}
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
