import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Sparkles, Navigation, Bookmark, BookmarkCheck, Share2, Check } from 'lucide-react';

export default function JobCard({ job, layout = 'grid' }) {
  const matchScore = Math.round(job.match_score || job.match_percentage || 0);

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('jobhub_saved_jobs') || '[]');
      setSaved(savedIds.includes(job.id));
    } catch {
      setSaved(false);
    }
  }, [job.id]);

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const savedIds = JSON.parse(localStorage.getItem('jobhub_saved_jobs') || '[]');
      let updated;
      if (savedIds.includes(job.id)) {
        updated = savedIds.filter(id => id !== job.id);
        setSaved(false);
      } else {
        updated = [...savedIds, job.id];
        setSaved(true);
      }
      localStorage.setItem('jobhub_saved_jobs', JSON.stringify(updated));
      window.dispatchEvent(new Event('jobhub_saved_updated'));
    } catch {
      setSaved(!saved);
    }
  };

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/jobs/${job.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Soft-tint match score badge
  const getMatchBadgeStyle = (score) => {
    if (score >= 80) return 'bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]';
    if (score >= 70) return 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]';
    return 'bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4]';
  };

  const matchedSkills = job.matched_skills || job.matching_skills || [];
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
    : job.salary_range || null;

  const formatJobType = (type) => {
    if (!type) return 'Full-Time';
    const cleaned = type.replace('_', ' ');
    return cleaned.charAt(0).toUpperCase() + cleaned.slice(1).toLowerCase();
  };

  // LIST / TABLE COMPACT VIEW
  if (layout === 'list') {
    return (
      <div className="bg-white rounded-xl border border-[#E7E5E4] p-4 shadow-[0_2px_6px_rgba(28,25,23,0.02)] hover:border-[#0F766E] hover:shadow-[0_8px_20px_-4px_rgba(15,118,110,0.07)] transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 group">
        <div className="flex items-start gap-3.5 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-lg bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] font-extrabold flex items-center justify-center text-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-[#78716C]">{job.company?.name || 'Top Employer'}</span>
              {job.is_remote && (
                <span className="badge-pill bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA] text-[10px] py-0.5">Remote</span>
              )}
              {isFeaturedOrUrgent && (
                <span className="badge-pill bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] text-[10px] py-0.5">Featured</span>
              )}
            </div>
            <Link 
              to={`/jobs/${job.id}`}
              className="text-sm font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors truncate block mt-0.5"
            >
              {job.title}
            </Link>
            <div className="flex items-center gap-2 text-xs text-[#78716C] mt-1 flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#0F766E]" />
                {job.location_name}
              </span>
              <span>•</span>
              <span className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4] text-[10px]">
                {formatJobType(job.job_type)}
              </span>
              {salaryDisplay && (
                <>
                  <span>•</span>
                  <span className="text-[#047857] font-semibold text-xs">{salaryDisplay}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right side actions in list view */}
        <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
          {matchScore > 0 && (
            <div className={`px-2.5 py-1 rounded-[8px] border text-xs font-bold flex items-center gap-1 ${getMatchBadgeStyle(matchScore)}`}>
              <Sparkles className="w-3.5 h-3.5" />
              <span className="n">{matchScore}% Match</span>
            </div>
          )}

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              title={copied ? "Link Copied!" : "Share Job Link"}
              className="p-2 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-[#047857]" /> : <Share2 className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={toggleBookmark}
              title={saved ? "Remove Bookmark" : "Save Job"}
              className={`p-2 rounded-lg transition-colors ${
                saved ? 'text-[#F97316] bg-[#FFEDD5]/60 hover:bg-[#FFEDD5]' : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
              }`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 text-[#F97316]" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          <Link
            to={`/jobs/${job.id}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#0F766E] hover:bg-[#115E59] text-white transition-all shadow-2xs"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    );
  }

  // DEFAULT GRID CARD VIEW
  return (
    <div className="bg-white rounded-[14px] border border-[#E7E5E4] p-5 shadow-[0_2px_6px_rgba(28,25,23,0.03)] hover:-translate-y-[3px] hover:border-[#0F766E] hover:shadow-[0_12px_24px_-4px_rgba(15,118,110,0.09)] transition-all duration-200 flex flex-col justify-between group relative">
      <div>
        
        {/* Top Header: Company info & Match Badge & Bookmark */}
        <div className="flex items-start justify-between gap-3 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-[10px] bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] font-extrabold flex items-center justify-center text-sm shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-[#78716C] flex items-center gap-1.5 flex-wrap">
                <span className="truncate">{job.company?.name || 'Top Employer'}</span>
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

          {/* Focal Match Badge & Bookmark */}
          <div className="flex items-center gap-1.5 shrink-0">
            {matchScore > 0 && (
              <div className={`px-2.5 py-1 rounded-[8px] border text-xs font-bold flex items-center gap-1 ${getMatchBadgeStyle(matchScore)}`}>
                <Sparkles className="w-3.5 h-3.5" />
                <span className="n">{matchScore}%</span>
              </div>
            )}
            <button
              type="button"
              onClick={toggleBookmark}
              title={saved ? "Remove Bookmark" : "Save Job"}
              className={`p-1.5 rounded-lg border transition-all ${
                saved 
                  ? 'border-[#FED7AA] bg-[#FFEDD5] text-[#F97316]' 
                  : 'border-transparent text-stone-300 hover:text-stone-600 hover:border-stone-200 hover:bg-stone-50'
              }`}
            >
              {saved ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors"
            title={copied ? "Copied to clipboard!" : "Copy Job Link"}
          >
            {copied ? (
              <span className="text-[10px] text-[#047857] font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Copied!
              </span>
            ) : (
              <Share2 className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="text-[11px] text-[#78716C] font-medium truncate">
            {job.applied_status ? `Status: ${job.applied_status.status}` : 'AI Placement Match'}
          </span>
        </div>

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
