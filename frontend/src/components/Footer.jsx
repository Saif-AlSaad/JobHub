import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, Heart, ArrowUpRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#F3EFEA] border-t border-[#E7E5E4] text-[#1C1917] mt-auto transition-colors">
      <div className="max-w-[1280px] mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-[#E7E5E4]">
          
          {/* Brand Info & Mission */}
          <div className="space-y-3.5 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-0.5 text-2xl font-extrabold tracking-tight font-heading">
              <span className="text-[#0F766E]">Job</span>
              <span className="text-[#F97316]">Hub</span>
            </Link>
            <p className="text-xs text-[#78716C] leading-relaxed">
              Human-centric AI placement and internship discovery platform connecting software engineering graduates with top verified tech employers.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] animate-pulse"></span>
              <span>Placement Engine Active</span>
            </div>
          </div>

          {/* Quick Links: Opportunities */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider font-heading">
              Opportunities
            </h4>
            <ul className="space-y-2 text-xs text-[#78716C]">
              <li>
                <Link to="/jobs" className="hover:text-[#0F766E] transition-colors flex items-center gap-1">
                  <span>Explore Jobs</span>
                  <ArrowUpRight className="w-3 h-3 text-[#A8A29E]" />
                </Link>
              </li>
              <li>
                <Link to="/jobs?sort_by=best_match" className="hover:text-[#0F766E] transition-colors">
                  AI Ranked Matches
                </Link>
              </li>
              <li>
                <Link to="/jobs?job_type=INTERNSHIP" className="hover:text-[#0F766E] transition-colors">
                  Entry-Level & Internships
                </Link>
              </li>
              <li>
                <Link to="/applications" className="hover:text-[#0F766E] transition-colors">
                  Application Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links: Employers */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider font-heading">
              For Employers
            </h4>
            <ul className="space-y-2 text-xs text-[#78716C]">
              <li>
                <Link to="/recruiter/post-job" className="text-[#F97316] font-semibold hover:text-[#EA580C] transition-colors flex items-center gap-1">
                  <span>+ Post a New Role</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </li>
              <li>
                <Link to="/messages" className="hover:text-[#0F766E] transition-colors">
                  Candidate Direct Chat
                </Link>
              </li>
              <li>
                <span className="text-[#78716C]">Automated Skill Matching</span>
              </li>
              <li>
                <span className="text-[#78716C]">Campus Recruitment Partner</span>
              </li>
            </ul>
          </div>

          {/* Location Hubs & Campus Community */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#1C1917] uppercase tracking-wider font-heading">
              Active Tech Hubs
            </h4>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <span className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4]">
                Savar Smart City
              </span>
              <span className="badge-pill bg-[#FFEDD5] text-[#C2410C] border-[#FED7AA]">
                Banani Tech
              </span>
              <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0]">
                Mohakhali
              </span>
              <span className="badge-pill bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4]">
                Dhanmondi
              </span>
            </div>
            <p className="text-[11px] text-[#78716C] pt-2">
              Privacy-preserving location awareness without continuous GPS tracking.
            </p>
          </div>

        </div>

        {/* Bottom Sub-Footer */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#78716C]">
          <p>
            © {new Date().getFullYear()} <span className="font-semibold text-[#1C1917]">JobHub</span>. Designed with the Nordic Teal & Warm Terracotta aesthetic.
          </p>
          <div className="flex items-center gap-4">
            <Link to="/profile" className="hover:text-[#0F766E] transition-colors">
              Privacy & Settings
            </Link>
            <span>•</span>
            <Link to="/notifications" className="hover:text-[#0F766E] transition-colors">
              Placement Alerts
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
