import React from 'react';
import { Search, Briefcase, Bell, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({ 
  icon: Icon = Search, 
  title = "No results found", 
  description = "Try adjusting your filters or search terms.", 
  actionLabel, 
  actionLink,
  onAction
}) {
  return (
    <div className="bg-white rounded-[12px] border border-[#E7E5E4] p-10 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8 shadow-[0_2px_6px_rgba(28,25,23,0.03)]">
      <div className="w-12 h-12 rounded-xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-[#1C1917] mb-1 font-heading">{title}</h3>
      <p className="text-xs text-[#78716C] leading-relaxed mb-6">{description}</p>
      
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg transition-colors shadow-xs"
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}

      {onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#115E59] rounded-lg transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
