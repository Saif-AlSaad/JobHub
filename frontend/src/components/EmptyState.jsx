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
    <div className="bg-white rounded-container border border-border p-12 text-center flex flex-col items-center justify-center max-w-md mx-auto my-8">
      <div className="w-12 h-12 rounded-xl bg-slate-100 text-secondary flex items-center justify-center mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-primary mb-1">{title}</h3>
      <p className="text-xs text-secondary leading-relaxed mb-6">{description}</p>
      
      {actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-input transition-colors shadow-sm"
        >
          {actionLabel}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      )}

      {onAction && !actionLink && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-input transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
