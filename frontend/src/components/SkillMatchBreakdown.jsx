import React from 'react';
import { Check, AlertCircle, Sparkles, MapPin, GraduationCap, Briefcase, Code } from 'lucide-react';

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
    distance_km,
    is_nearby
  } = matchAnalysis;

  const scoreCategories = [
    { label: 'Semantic & Requirement Fit', score: semantic_score, weight: '40% weight', icon: Sparkles, color: 'bg-brand' },
    { label: 'Technical Skill Overlap', score: skill_score, weight: '30% weight', icon: Code, color: 'bg-emerald-600' },
    { label: 'Academic & Experience Fit', score: exp_edu_score, weight: '15% weight', icon: GraduationCap, color: 'bg-blue-600' },
    { label: 'Location & Job Type Proximity', score: location_score, weight: '15% weight', icon: MapPin, color: 'bg-amber-500' },
  ];

  return (
    <div className="bg-white rounded-container border border-border p-6 shadow-subtle space-y-6">
      
      {/* Header Match Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
        <div>
          <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
            AI Hybrid Matching Engine
          </span>
          <h3 className="text-xl font-bold text-primary mt-0.5">
            Match Analysis & Fit Breakdown
          </h3>
        </div>

        <div className="flex items-center gap-3 bg-brand-light/60 px-4 py-2.5 rounded-card border border-brand/20">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-secondary">Overall Match Score</p>
            <p className="text-2xl font-black text-brand tracking-tight">{Math.round(match_score)}%</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand text-white flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 4-Part Hybrid Breakdown Progress Bars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {scoreCategories.map((cat, i) => {
          const Icon = cat.icon;
          return (
            <div key={i} className="p-3.5 rounded-card bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-medium text-primary mb-1.5">
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-secondary" />
                  {cat.label}
                </span>
                <span className="font-bold text-slate-800">{Math.round(cat.score)}%</span>
              </div>
              
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${cat.color}`}
                  style={{ width: `${Math.min(100, Math.max(10, cat.score))}%` }}
                ></div>
              </div>
              <span className="text-[10px] text-secondary mt-1 block">{cat.weight}</span>
            </div>
          );
        })}
      </div>

      {/* "Why this job matches you" Reasoning */}
      {explanation && explanation.length > 0 && (
        <div className="bg-slate-50/80 rounded-card p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand" />
            Why This Job Matches You
          </h4>
          <ul className="space-y-2">
            {explanation.map((item, idx) => (
              <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* "YOU HAVE" vs "YOU MAY NEED" Skill Comparison */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
        
        {/* YOU HAVE */}
        <div className="p-4 rounded-card bg-emerald-50/50 border border-emerald-100">
          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Skills You Have ({matched_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matched_skills.length > 0 ? (
              matched_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-white text-emerald-800 text-xs font-medium border border-emerald-200 shadow-2xs"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-secondary">No exact skill overlap detected.</span>
            )}
          </div>
        </div>

        {/* YOU MAY NEED */}
        <div className="p-4 rounded-card bg-amber-50/50 border border-amber-100">
          <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            Skills You May Need ({missing_skills.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missing_skills.length > 0 ? (
              missing_skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-md bg-white text-amber-800 text-xs font-medium border border-amber-200 shadow-2xs"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-emerald-700 font-medium">All prerequisite skills covered!</span>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
