import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, MapPin, Sparkles, Check, Clock, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import EmptyState from '../components/EmptyState';

const STEPS = ['APPLIED', 'VIEWED', 'SHORTLISTED', 'INTERVIEW', 'HIRED'];

export default function ApplicationsTrackerPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get('/applications/my');
      setApplications(res.data);
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
    return STEPS.indexOf(status);
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Active Applications Tracker</h1>
        <p className="text-sm text-[#475569] mt-1">
          Monitor your interview stages and recruitment progression with zero opacity.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          <div className="h-32 bg-white rounded-[16px] border border-[#E2E8F0] animate-pulse"></div>
          <div className="h-32 bg-white rounded-[16px] border border-[#E2E8F0] animate-pulse"></div>
        </div>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No Active Applications Yet"
          description="Your next opportunity is waiting. Discover jobs tailored to your skills from your personalized feed."
          actionLabel="Find Matching Jobs"
          actionLink="/jobs"
        />
      ) : (
        <div className="space-y-5">
          {applications.map((app) => {
            const currentIdx = getStepIndex(app.status);
            const isRejected = app.status === 'REJECTED';
            const initials = app.company_name
              ? app.company_name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
              : 'BE';

            return (
              <div 
                key={app.id} 
                className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-5 hover:border-[#4F46E5]/30 transition-all"
              >
                
                {/* Application Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-[14px] bg-[#E0E7FF] text-[#4F46E5] font-extrabold flex items-center justify-center text-sm flex-shrink-0">
                      {initials}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0F172A]">{app.job_title}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-[#475569] mt-0.5">
                        <span className="font-semibold text-[#0F172A]">{app.company_name}</span>
                        <span>•</span>
                        <span>{app.location_name || 'Savar'}</span>
                        <span>•</span>
                        <span>Applied on {new Date(app.applied_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status & Match Badges */}
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span className="n">{Math.round(app.match_score)}% Match</span>
                    </span>

                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isRejected 
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : app.status === 'HIRED'
                        ? 'bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]'
                        : 'bg-[#ECFEFF] text-[#0E7490] border border-[#A5F3FC]'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                </div>

                {/* Recruiter Activity Pulse */}
                <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] text-xs text-[#475569] flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
                    <span>Recruiter activity: <b className="text-[#0F172A]">Application viewed & verified</b></span>
                  </span>
                  <span className="text-[11px] text-[#64748B]">Updated {new Date(app.updated_at || app.applied_at).toLocaleDateString()}</span>
                </div>

                {/* Horizontal Stepper Progress */}
                <div className="pt-2">
                  <div className="grid grid-cols-5 gap-2">
                    {STEPS.map((step, idx) => {
                      const isComplete = idx <= currentIdx;
                      const isCurrent = idx === currentIdx;

                      return (
                        <div key={step} className="flex flex-col items-center text-center">
                          <div className={`w-full h-2 rounded-full mb-2 transition-all ${
                            isComplete 
                              ? 'bg-[#10B981]' 
                              : 'bg-slate-200'
                          }`} />
                          <span className={`text-[11px] font-bold ${
                            isCurrent 
                              ? 'text-[#4F46E5]' 
                              : isComplete 
                              ? 'text-[#0F172A]' 
                              : 'text-slate-400'
                          }`}>
                            {step}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action CTA Bottom Bar */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/messages`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4F46E5] hover:underline"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat with Hiring Manager
                  </Link>

                  <Link
                    to={`/jobs/${app.job_id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0F172A] hover:text-[#4F46E5]"
                  >
                    View Original Role Specs
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
