import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building2,
  GraduationCap,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  Briefcase,
  Users,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Role can be 'seeker' | 'recruiter' | null (null shows the 2-portal selection view)
  const currentRole = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectRole = (role) => {
    setError('');
    setEmail('');
    setPassword('');
    setSearchParams({ role });
  };

  const clearRole = () => {
    setError('');
    setEmail('');
    setPassword('');
    setSearchParams({});
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (roleType) => {
    setLoading(true);
    setError('');
    try {
      await demoLogin(roleType);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to switch demo account');
    } finally {
      setLoading(false);
    }
  };

  const prefillCredentials = (prefillEmail, prefillPass) => {
    setEmail(prefillEmail);
    setPassword(prefillPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50/70">
      
      {/* =========================================================================
          STEP 1: TWO DEDICATED SECTIONS (JOB SEEKER vs. JOB RECRUITER)
          Displayed when no specific role is selected yet.
          ========================================================================= */}
      {!currentRole && (
        <div className="max-w-4xl w-full mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* Header Title & Tagline */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-bold tracking-wide shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              JOB HUB Placement Ecosystem
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Select Your Portal to Sign In
            </h1>
            
            <p className="text-sm text-slate-600 leading-relaxed">
              Choose your dedicated login workspace below. Tailored experiences for university job seekers and corporate hiring teams.
            </p>
          </div>

          {/* 2-Section Interactive Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* SECTION 1: JOB SEEKER PORTAL */}
            <div
              onClick={() => selectRole('seeker')}
              className="group relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-indigo-500 p-7 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle decorative background gradient pill */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-indigo-100/60 to-cyan-50/0 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-6 relative z-10">
                {/* Header row: Icon & Role Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Students & Graduates
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    Job Seeker Portal
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Explore high-match internships, track your active applications in real time, and gain transparent skill gap analyses to land your next software role.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>AI-Powered Hybrid Placement Radar & Matching</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Automated resume parser & skill extraction</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>Direct recruiter messaging & status pipeline</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-8 relative z-10">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/30 flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  <span>Sign In as Job Seeker</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-[11px] text-center text-slate-600 mt-2.5">
                  1-Click Demo Available: Sarah Rahman (DIU Graduate)
                </p>
              </div>
            </div>

            {/* SECTION 2: JOB RECRUITER PORTAL */}
            <div
              onClick={() => selectRole('recruiter')}
              className="group relative bg-white rounded-2xl border-2 border-slate-200/90 hover:border-purple-500 p-7 sm:p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Subtle decorative background gradient pill */}
              <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-purple-100/60 to-pink-50/0 rounded-full blur-2xl -mr-12 -mt-12 pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-6 relative z-10">
                {/* Header row: Icon & Role Tag */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-purple-600/25 group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    Employers & Recruiters
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 group-hover:text-purple-700 transition-colors">
                    Job Recruiter Portal
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Post openings with semantic skill requirements, automatically rank applicants using AI scoring, and manage your technical hiring pipeline.
                  </p>
                </div>

                {/* Feature Highlights */}
                <div className="space-y-2.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Candidate AI Ranking & semantic match analysis</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>Publish job requisitions with radius criteria</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    <span>1-Click status updates & interview scheduler</span>
                  </div>
                </div>
              </div>

              {/* Bottom CTA Button */}
              <div className="pt-8 relative z-10">
                <button
                  type="button"
                  className="w-full py-3 px-4 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-sm shadow-purple-700/30 flex items-center justify-center gap-2 group-hover:gap-3"
                >
                  <span>Sign In as Job Recruiter</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
                <p className="text-[11px] text-center text-slate-600 mt-2.5">
                  1-Click Demo Available: TechNova Labs (Talent Lead)
                </p>
              </div>
            </div>

          </div>

          {/* Quick Registration & Admin Callout */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 text-center text-xs text-slate-600 flex flex-wrap items-center justify-center gap-4">
            <span>Don't have an account yet?</span>
            <div className="flex items-center gap-3">
              <Link
                to="/register?role=seeker"
                className="font-bold text-indigo-600 hover:text-indigo-700 hover:underline inline-flex items-center gap-1"
              >
                Register as Job Seeker
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/register?role=recruiter"
                className="font-bold text-purple-700 hover:text-purple-800 hover:underline inline-flex items-center gap-1"
              >
                Register as Recruiter
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 2 (OPTION A): DESTINATED JOB SEEKER LOGIN PAGE
          Displayed when the user selects or navigates to ?role=seeker
          ========================================================================= */}
      {currentRole === 'seeker' && (
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Bar with Back Link & Quick Role Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Portals</span>
            </button>

            {/* Quick Segmented Toggle */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                className="px-2.5 py-1 rounded-md bg-white text-indigo-700 shadow-xs"
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => selectRole('recruiter')}
                className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Header & Logo */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-indigo-600/25">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Job Seeker Sign In
            </h2>
            <p className="text-xs text-slate-600">
              Access your personalized AI career radar, applications, and matches.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant 1-Click Demo Login for Job Seeker */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block text-center">
              Instant 1-Click Candidate Demo
            </span>

            <button
              type="button"
              onClick={() => handleDemo('seeker')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100/70 transition-all flex items-center justify-between group shadow-xs disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  SR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sarah Rahman (Job Seeker)</p>
                  <p className="text-[11px] text-indigo-700 font-medium">DIU Graduate • 87% Match • Savar</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-indigo-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] text-slate-600 uppercase font-bold tracking-wider">
              Or with credentials
            </span>
          </div>

          {/* Seeker Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Student / Candidate Email</label>
                <button
                  type="button"
                  onClick={() => prefillCredentials('sarah.rahman@jobhub.io', 'password123')}
                  className="text-[10px] text-indigo-600 hover:underline font-semibold"
                >
                  Fill demo email
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.rahman@jobhub.io"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setPassword('password123')}
                  className="text-[10px] text-indigo-600 hover:underline font-semibold"
                >
                  Fill demo password
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50"
            >
              {loading ? 'Signing in to Job Seeker...' : 'Sign In as Job Seeker'}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Don't have a candidate account? </span>
            <Link to="/register?role=seeker" className="font-bold text-indigo-600 hover:underline">
              Register as Job Seeker
            </Link>
          </div>

        </div>
      )}

      {/* =========================================================================
          STEP 2 (OPTION B): DESTINATED JOB RECRUITER LOGIN PAGE
          Displayed when the user selects or navigates to ?role=recruiter
          ========================================================================= */}
      {currentRole === 'recruiter' && (
        <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
          
          {/* Top Bar with Back Link & Quick Role Switcher */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>All Portals</span>
            </button>

            {/* Quick Segmented Toggle */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => selectRole('seeker')}
                className="px-2.5 py-1 rounded-md text-slate-500 hover:text-slate-800 transition-colors"
              >
                Job Seeker
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded-md bg-white text-purple-700 shadow-xs"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Header & Logo */}
          <div className="text-center space-y-1.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-700 text-white flex items-center justify-center mx-auto shadow-md shadow-purple-700/25">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Job Recruiter Sign In
            </h2>
            <p className="text-xs text-slate-600">
              Manage talent requisitions, screen applicant rankings, and post roles.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Instant 1-Click Demo Login for Recruiter */}
          <div className="space-y-2 pt-1">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block text-center">
              Instant 1-Click Employer Demo
            </span>

            <button
              type="button"
              onClick={() => handleDemo('recruiter')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100/70 transition-all flex items-center justify-between group shadow-xs disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  TN
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">TechNova Labs (Recruiter)</p>
                  <p className="text-[11px] text-purple-700 font-medium">Candidate Ranking & Requirements AI</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[10px] text-slate-600 uppercase font-bold tracking-wider">
              Or with work credentials
            </span>
          </div>

          {/* Recruiter Credentials Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Company Work Email</label>
                <button
                  type="button"
                  onClick={() => prefillCredentials('recruiter@technova.io', 'password123')}
                  className="text-[10px] text-purple-700 hover:underline font-semibold"
                >
                  Fill demo email
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@technova.io"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setPassword('password123')}
                  className="text-[10px] text-purple-700 hover:underline font-semibold"
                >
                  Fill demo password
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3 top-2.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-600 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-all shadow-md shadow-purple-700/25 disabled:opacity-50"
            >
              {loading ? 'Signing in to Recruiter Portal...' : 'Sign In as Job Recruiter'}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2 border-t border-slate-100 text-xs text-slate-600">
            <span>Hiring top talent for your company? </span>
            <Link to="/register?role=recruiter" className="font-bold text-purple-700 hover:underline">
              Register your Company
            </Link>
          </div>

        </div>
      )}

    </div>
  );
}
