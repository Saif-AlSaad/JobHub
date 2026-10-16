import React from 'react';
import { Check, AlertCircle, Sparkles, MapPin, GraduationCap, Code } from 'lucide-react';

export default function SkillMatchBreakdown({ matchAnalysis }) {
  if (!matchAnalysis) return null;

  const {
    match_score = 0,
    semantic_score = 0,
    skill_score = 0,
    exp_edu_score = 0,
    location_score = 0,
    matched_skills = [],
    missing_skills = [],
    explanation = [],
  } = matchAnalysis;

  const scoreCategories = [
    { label: 'Semantic & Requirement Fit', score: semantic_score, weight: '40% weight', icon: Sparkles, color: 'bg-[#0F766E]' },
    { label: 'Technical Skill Overlap', score: skill_score, weight: '30% weight', icon: Code, color: 'bg-[#047857]' },
    { label: 'Academic & Experience Fit', score: exp_edu_score, weight: '15% weight', icon: GraduationCap, color: 'bg-[#0F766E]' },
    { label: 'Location & Hub Proximity', score: location_score, weight: '15% weight', icon: MapPin, color: 'bg-[#F97316]' },
  ];

  return (
    <div className="bg-white rounded-[12px] border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-6">
      
      {/* Header Match Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E5E4]">
        <div>
          <span className="text-xs font-semibold text-[#78716C] uppercase tracking-wider">
            AI Hybrid Matching Engine
          </span>
          <h3 className="text-xl font-bold text-[#1C1917] mt-0.5 font-heading">
            Match Analysis & Fit Breakdown
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-[#CCFBF1] px-4 py-2.5 rounded-[12px] border border-[#99F6E4]">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-[#78716C]">Overall Match Score</p>
            <p className="n text-2xl font-black text-[#0F766E] tracking-tight">{Math.round(match_score)}%</p>
          </div>
          <div className="w-10 h-10 rounded-[10px] bg-[#0F766E] text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4-Part Hybrid Breakdown Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scoreCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="p-3.5 rounded-[10px] bg-[#F3EFEA] border border-[#E7E5E4]">
              <div className="flex items-center justify-between text-xs font-medium text-[#1C1917] mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-[#78716C]" />
                  {cat.label}
                </span>
                <span className="n font-bold text-[#1C1917]">{Math.round(cat.score)}%</span>
              </div>
              
              <div className="w-full bg-[#E7E5E4] h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                  style={{ width: `${Math.min(100, Math.max(10, cat.score))}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-[#78716C] mt-1 block">{cat.weight}</span>
            </div>
          );
        })}
      </div>

      {/* "Why this job matches you" Reasoning */}
      {explanation && explanation.length > 0 && (
        <div className="bg-[#FAF8F5] rounded-[10px] p-4 border border-[#E7E5E4]">
          <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-heading">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            Why This Job Matches You
          </h4>
          <ul className="space-y-2">
            {explanation.map((item, idx) => (
              <li key={idx} className="text-xs text-[#1C1917]/90 flex items-start gap-2">
                <Check className="w-4 h-4 text-[#047857] flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* "YOU HAVE" vs "YOU MAY NEED" Skill Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        
        {/* YOU HAVE */}
        <div className="p-4 rounded-[10px] bg-[#ECFDF5] border border-[#A7F3D0]">
          <h4 className="text-xs font-bold text-[#047857] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-heading">
            <Check className="w-4 h-4 text-[#047857]" />
            Skills You Have ({matched_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matched_skills.length > 0 ? (
              matched_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#78716C]">No exact skill overlap detected.</span>
            )}
          </div>
        </div>

        {/* YOU MAY NEED */}
        <div className="p-4 rounded-[10px] bg-[#FEF3C7] border border-[#FDE68A]">
          <h4 className="text-xs font-bold text-[#B45309] uppercase tracking-wider mb-2.5 flex items-center gap-1.5 font-heading">
            <AlertCircle className="w-4 h-4 text-[#B45309]" />
            Skills You May Need ({missing_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missing_skills.length > 0 ? (
              missing_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="badge-pill bg-white text-[#B45309] border-[#FDE68A]"
                >
                  +{skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#047857] font-medium">All prerequisite skills covered!</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
