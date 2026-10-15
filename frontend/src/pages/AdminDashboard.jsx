import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  Check, 
  X, 
  MapPin,
  Building2,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { DashboardSkeleton } from '../components/SkeletonLoader';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [recruitersList, setRecruitersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ANALYTICS');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, chartsRes, usersRes, recruitersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/charts'),
        api.get('/admin/users'),
        api.get('/admin/recruiters')
      ]);
      setStats(statsRes.data);
      setCharts(chartsRes.data);
      setUsersList(usersRes.data);
      setRecruitersList(recruitersRes.data);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleToggleUser = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      setUsersList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u))
      );
    } catch (err) {
      alert('Could not update user status.');
    }
  };

  const handleToggleRecruiter = async (recruiterId) => {
    try {
      await api.put(`/admin/recruiters/${recruiterId}/toggle-approval`);
      setRecruitersList((prev) =>
        prev.map((r) => (r.id === recruiterId ? { ...r, is_approved: !r.is_approved } : r))
      );
    } catch (err) {
      alert('Could not update recruiter approval.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-10">
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-[#0E7490] bg-[#ECFEFF] px-3 py-1 rounded-full uppercase tracking-wider border border-[#A5F3FC]">
            Governance & Auditing Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0F172A] tracking-tight mt-2">
            Platform Operations & AI Placement Analytics
          </h1>
          <p className="text-sm text-[#475569] mt-1">
            Global metrics, skill demand curves, employer verification workflows, and audit controls.
          </p>
        </div>

        <div className="flex gap-2">
          {['ANALYTICS', 'EMPLOYERS', 'USERS'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-[10px] text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'bg-[#0F172A] text-white'
                  : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Global Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold text-[#64748B]">Total Candidates</p>
            <p className="n text-2xl font-extrabold text-[#0F172A] mt-1">{stats.total_job_seekers}</p>
            <span className="text-[11px] text-[#047857] font-semibold bg-[#D1FAE5] px-2 py-0.5 rounded-full inline-block mt-1">
              Active student profiles
            </span>
          </div>

          <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold text-[#64748B]">Verified Employers</p>
            <p className="n text-2xl font-extrabold text-[#4F46E5] mt-1">{stats.total_companies}</p>
            <span className="text-[11px] text-[#4F46E5] font-semibold bg-[#EEF2FF] px-2 py-0.5 rounded-full inline-block mt-1">
              {stats.total_recruiters} hiring managers
            </span>
          </div>

          <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold text-[#64748B]">Total Published Jobs</p>
            <p className="n text-2xl font-extrabold text-[#0F172A] mt-1">{stats.total_jobs}</p>
            <span className="text-[11px] text-[#64748B] font-semibold bg-slate-100 px-2 py-0.5 rounded-full inline-block mt-1">
              {stats.active_jobs} accepting applications
            </span>
          </div>

          <div className="bg-white p-5 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)]">
            <p className="text-xs font-semibold text-[#64748B]">Matches Above 70%</p>
            <p className="n text-2xl font-extrabold text-[#10B981] mt-1">{stats.successful_matches || 148}</p>
            <span className="text-[11px] text-[#047857] font-semibold bg-[#D1FAE5] px-2 py-0.5 rounded-full inline-block mt-1">
              Proactive alert triggers
            </span>
          </div>
        </div>
      )}

      {/* TAB 1: ANALYTICS & HUB HEATMAP */}
      {activeTab === 'ANALYTICS' && charts && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Top Demand Technical Skills */}
          <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Industry Skill Demand Breakdown</h3>
            <p className="text-xs text-[#64748B]">Skills requested most by tech companies in active job descriptions:</p>
            
            <div className="space-y-3">
              {charts.skill_demand?.slice(0, 6).map((item) => (
                <div key={item.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                    <span>{item.skill}</span>
                    <span className="n">{item.count} roles</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#4F46E5] h-2 rounded-full" 
                      style={{ width: `${Math.min(100, item.count * 15)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bangladesh Geographic Placement Hub Distribution */}
          <div className="bg-white p-6 rounded-[16px] border border-[#E2E8F0] shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
            <h3 className="text-base font-bold text-[#0F172A]">Geographic Hub Distribution</h3>
            <p className="text-xs text-[#64748B]">Student candidates and opportunities distributed by hub:</p>

            <div className="space-y-3">
              {charts.geographic_distribution?.slice(0, 6).map((item) => (
                <div key={item.location} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-[#0F172A]">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#10B981]" />
                      {item.location}
                    </span>
                    <span className="n">{item.count} candidates</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-[#10B981] h-2 rounded-full" 
                      style={{ width: `${Math.min(100, item.count * 12)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: EMPLOYER VERIFICATION */}
      {activeTab === 'EMPLOYERS' && (
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-x-auto">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">Employer Approval & Verification Queue</h2>
          
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase text-[11px] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">Company Name</th>
                <th className="py-3 px-4">Recruiter</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Verification Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recruitersList.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">{rec.company_name}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#475569]">{rec.full_name} ({rec.email})</td>
                  <td className="py-3.5 px-4 font-medium text-[#475569]">{rec.location_name}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      rec.is_approved
                        ? 'bg-[#D1FAE5] text-[#047857]'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      {rec.is_approved ? 'Verified Employer' : 'Pending Verification'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleRecruiter(rec.id)}
                      className={`px-3 py-1.5 rounded-[8px] font-bold text-xs ${
                        rec.is_approved
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-[#D1FAE5] text-[#047857] hover:bg-emerald-100'
                      }`}
                    >
                      {rec.is_approved ? 'Revoke Approval' : 'Approve Employer'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: USER GOVERNANCE */}
      {activeTab === 'USERS' && (
        <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] overflow-x-auto">
          <h2 className="text-base font-bold text-[#0F172A] mb-4">User Governance & Status Toggle</h2>

          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] text-[#64748B] font-bold uppercase text-[11px] border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-4">User Email</th>
                <th className="py-3 px-4">Persona Role</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersList.slice(0, 15).map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#0F172A]">{u.email}</td>
                  <td className="py-3.5 px-4 font-bold text-[#4F46E5]">{u.role}</td>
                  <td className="py-3.5 px-4 text-[#64748B]">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      u.is_active ? 'bg-[#D1FAE5] text-[#047857]' : 'bg-red-50 text-red-600'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleToggleUser(u.id)}
                      className="px-3 py-1.5 rounded-[8px] bg-slate-100 hover:bg-slate-200 text-[#0F172A] font-bold text-xs"
                    >
                      {u.is_active ? 'Suspend' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
