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
  TrendingUp,
  FileText,
  Compass,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Role can be 'seeker' | 'recruiter' | null (null renders Page 1: Role Selection)
  const currentRole = searchParams.get('role');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
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
      setError(err.message || 'Invalid email or password. Please try again.');
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
      setError(err.message || 'Failed to initialize demo persona.');
    } finally {
      setLoading(false);
    }
  };

  const prefill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] relative overflow-hidden">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#CCFBF1]/40 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[600px] h-[400px] bg-[#FFEDD5]/40 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#FAF8F5] to-transparent pointer-events-none" />

      {/* =========================================================================
          PAGE 1: DUAL-PORTAL ROLE SELECTOR (Clean, Smooth & Modern UI)
          ========================================================================= */}
      {!currentRole && (
        <div className="max-w-4xl w-full mx-auto space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Header & Brand Identity */}
          <div className="text-center space-y-3.5 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E7E5E4] shadow-xs text-xs font-semibold text-[#1C1917]">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI-Powered Career & Placement Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-[#1C1917] tracking-tight leading-[1.15]">
              Welcome to <span className="text-[#0F766E]">Job</span><span className="text-[#F97316]">Hub</span>
            </h1>

            <p className="text-sm sm:text-base text-[#78716C] leading-relaxed font-normal">
              Select your role to access your dedicated workspace. Tailored for students, university graduates, and enterprise hiring teams.
            </p>
          </div>

          {/* 2-Column Portal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* CARD 1: JOB SEEKER PORTAL */}
            <div
              onClick={() => selectRole('seeker')}
              className="group relative bg-white rounded-3xl border border-[#E7E5E4] hover:border-[#0F766E] p-8 shadow-[0_8px_30px_rgb(28,25,23,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(15,118,110,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top ambient hover glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#CCFBF1] to-teal-50/50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-6 relative z-10">
                {/* Header Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center shadow-lg shadow-teal-900/20 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="badge-pill badge-job-type">
                    For Students & Alumni
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight group-hover:text-[#0F766E] transition-colors">
                    Job Seeker Portal
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#78716C] leading-relaxed">
                    Discover proactive AI-matched internships, analyze transparent skill gaps, and apply to vetted tech companies in 1 click.
                  </p>
                </div>

                {/* Feature Value Props */}
                <div className="space-y-2.5 pt-4 border-t border-[#E7E5E4]">
                  <div className="flex items-center gap-3 text-xs text-[#1C1917] font-medium">
                    <div className="w-6 h-6 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>Proactive hybrid placement radar & match score</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#1C1917] font-medium">
                    <div className="w-6 h-6 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>Instant resume parser & skill gap recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#1C1917] font-medium">
                    <div className="w-6 h-6 rounded-lg bg-[#ECFDF5] text-[#047857] flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-3.5 h-3.5" />
                    </div>
                    <span>Real-time status tracking & recruiter chat</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Demo Hint */}
              <div className="pt-8 relative z-10 space-y-2.5">
                <button
                  type="button"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#0F766E] hover:bg-[#115E59] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-teal-900/20 flex items-center justify-between group-hover:shadow-teal-900/30"
                >
                  <span>Sign In as Job Seeker</span>
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-[#78716C] font-medium">
                    1-Click Demo Available: <strong className="text-[#1C1917] font-semibold">Sarah Rahman</strong> (DIU Graduate)
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: JOB RECRUITER PORTAL */}
            <div
              onClick={() => selectRole('recruiter')}
              className="group relative bg-white rounded-3xl border border-[#E7E5E4] hover:border-[#F97316] p-8 shadow-[0_8px_30px_rgb(28,25,23,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(249,115,22,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top ambient hover glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-[#FFEDD5] to-orange-50/50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-6 relative z-10">
                {/* Header Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-[#F97316] text-white flex items-center justify-center shadow-lg shadow-orange-600/25 group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="badge-pill badge-location-type">
                    For Employers & HR
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight group-hover:text-[#F97316] transition-colors">
                    Job Recruiter Portal
                  </h2>
                  <p className="text-xs sm:text-[13px] text-[#78716C] leading-relaxed">
                    Post roles with semantic skill criteria, screen candidates with automated AI ranking, and manage your pipeline efficiently.
                  </p>
                </div>

                {/* Feature Value Props */}
                <div className="space-y-2.5 pt-4 border-t border-[#E7E5E4]">
                  <div className="flex items-center gap-3 text-xs text-[#1C1917] font-medium">
                    <div className="w-6 h-6 rounded-lg bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span>Candidate AI Ranking & automated CV scoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#1C1917] font-medium">
                    <div className="w-6 h-6 rounded-lg bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <span>Publish job openings in under 2 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#1C1917] font-medium">
                    <div className="w-6 h-6 rounded-lg bg-[#FEF3C7] text-[#B45309] flex items-center justify-center flex-shrink-0">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                    <span>Direct messaging & interview scheduling</span>
                  </div>
                </div>
              </div>

              {/* Action Button & Demo Hint */}
              <div className="pt-8 relative z-10 space-y-2.5">
                <button
                  type="button"
                  className="w-full py-3.5 px-5 rounded-2xl bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-orange-500/25 flex items-center justify-between group-hover:shadow-orange-500/40"
                >
                  <span>Sign In as Job Recruiter</span>
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-[#78716C] font-medium">
                    1-Click Demo Available: <strong className="text-[#1C1917] font-semibold">TechNova Labs</strong> (Sabrina Rahman)
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Footer Helper */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-[#E7E5E4] p-4 text-center text-xs text-[#78716C] flex flex-wrap items-center justify-center gap-3 shadow-xs">
            <span>New to JobHub?</span>
            <div className="flex items-center gap-3">
              <Link
                to="/register?role=seeker"
                className="font-semibold text-[#0F766E] hover:text-[#115E59] hover:underline"
              >
                Register as Job Seeker
              </Link>
              <span className="text-[#E7E5E4]">•</span>
              <Link
                to="/register?role=recruiter"
                className="font-semibold text-[#F97316] hover:text-[#EA580C] hover:underline"
              >
                Register Company
              </Link>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          PAGE 2 (OPTION A): DESTINATED JOB SEEKER LOGIN (Clean & Professional)
          ========================================================================= */}
      {currentRole === 'seeker' && (
        <div className="max-w-[460px] w-full bg-white rounded-3xl border border-[#E7E5E4] p-8 sm:p-10 shadow-[0_20px_50px_rgba(15,118,110,0.06)] space-y-7 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Top Bar: Back Button + Quick Segmented Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-[#F3EFEA]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Portal</span>
            </button>

            {/* Segmented Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4] text-xs font-semibold">
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-[#0F766E] text-white shadow-xs font-bold"
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => selectRole('recruiter')}
                className="px-3 py-1 rounded-lg text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#CCFBF1] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center mx-auto shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-[#1C1917] tracking-tight">
              Job Seeker Sign In
            </h2>
            <p className="text-xs sm:text-[13px] text-[#78716C] leading-relaxed">
              Enter your student or candidate credentials to access your placement dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* VIP 1-Click Instant Demo Card */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block text-center">
              1-Click Instant Demo Access
            </span>

            <button
              type="button"
              onClick={() => handleDemo('seeker')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-2xl border border-[#99F6E4] bg-[#CCFBF1]/40 hover:bg-[#CCFBF1]/70 transition-all flex items-center justify-between group shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  SR
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1C1917]">Sarah Rahman</p>
                  <p className="text-[11px] text-[#0F766E] font-semibold">DIU Graduate • 87% Match • Savar</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white border border-[#99F6E4] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E7E5E4] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#78716C] uppercase font-bold tracking-wider">
              Or with credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#1C1917]">Student Email Address</label>
                <button
                  type="button"
                  onClick={() => prefill('sarah.rahman@jobhub.io', 'password123')}
                  className="text-[11px] text-[#0F766E] hover:text-[#115E59] font-semibold hover:underline"
                >
                  Fill demo credentials
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.rahman@jobhub.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-[#E7E5E4] hover:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 focus:border-[#0F766E] transition-all placeholder:text-[#78716C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#1C1917]">Password</label>
                <span className="text-[11px] text-[#78716C]">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] rounded-xl border border-[#E7E5E4] hover:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 focus:border-[#0F766E] transition-all placeholder:text-[#78716C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#78716C] hover:text-[#1C1917] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-[#78716C] font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E7E5E4] text-[#0F766E] focus:ring-[#0F766E]"
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => prefill('sarah.rahman@jobhub.io', 'password123')}
                className="text-[#78716C] hover:text-[#0F766E] font-medium"
              >
                Reset demo
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-teal-900/20 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In as Job Seeker'}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-3 border-t border-[#E7E5E4] text-xs text-[#78716C] space-y-2">
            <p>
              New candidate on JobHub?{' '}
              <Link to="/register?role=seeker" className="font-bold text-[#0F766E] hover:text-[#115E59] hover:underline">
                Create Free Seeker Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78716C]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by 256-bit encrypted authentication</span>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          PAGE 2 (OPTION B): DESTINATED JOB RECRUITER LOGIN (Clean & Professional)
          ========================================================================= */}
      {currentRole === 'recruiter' && (
        <div className="max-w-[460px] w-full bg-white rounded-3xl border border-[#E7E5E4] p-8 sm:p-10 shadow-[0_20px_50px_rgba(249,115,22,0.06)] space-y-7 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Top Bar: Back Button + Quick Segmented Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-[#F3EFEA]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Portal</span>
            </button>

            {/* Segmented Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4] text-xs font-semibold">
              <button
                type="button"
                onClick={() => selectRole('seeker')}
                className="px-3 py-1 rounded-lg text-[#78716C] hover:text-[#1C1917] transition-colors"
              >
                Job Seeker
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-[#F97316] text-white shadow-xs font-bold"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-[#FFEDD5] border border-[#FED7AA] text-[#C2410C] flex items-center justify-center mx-auto shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-[#1C1917] tracking-tight">
              Recruiter & Employer Sign In
            </h2>
            <p className="text-xs sm:text-[13px] text-[#78716C] leading-relaxed">
              Sign in with your corporate credentials to manage postings, rankings, and applicants.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* VIP 1-Click Instant Demo Card */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-[#78716C] uppercase tracking-wider block text-center">
              1-Click Instant Employer Demo
            </span>

            <button
              type="button"
              onClick={() => handleDemo('recruiter')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-2xl border border-[#FED7AA] bg-[#FFEDD5]/40 hover:bg-[#FFEDD5]/70 transition-all flex items-center justify-between group shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F97316] text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  TN
                </div>
                <div>
                  <p className="text-xs font-bold text-[#1C1917]">TechNova Labs</p>
                  <p className="text-[11px] text-[#C2410C] font-semibold">Sabrina Rahman • Lead Technical Recruiter</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white border border-[#FED7AA] text-[#C2410C] flex items-center justify-center group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E7E5E4] w-full" />
            <span className="bg-white px-3 text-[11px] text-[#78716C] uppercase font-bold tracking-wider">
              Or with work credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#1C1917]">Corporate Work Email</label>
                <button
                  type="button"
                  onClick={() => prefill('recruiter@technova.io', 'password123')}
                  className="text-[11px] text-[#F97316] hover:text-[#EA580C] font-semibold hover:underline"
                >
                  Fill demo credentials
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@technova.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-[#E7E5E4] hover:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all placeholder:text-[#78716C]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-[#1C1917]">Password</label>
                <span className="text-[11px] text-[#78716C]">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#78716C] absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] rounded-xl border border-[#E7E5E4] hover:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 focus:border-[#F97316] transition-all placeholder:text-[#78716C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#78716C] hover:text-[#1C1917] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-[#78716C] font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E7E5E4] text-[#F97316] focus:ring-[#F97316]"
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => prefill('recruiter@technova.io', 'password123')}
                className="text-[#78716C] hover:text-[#F97316] font-medium"
              >
                Reset demo
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-[#EA580C] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-orange-500/25 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In as Job Recruiter'}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-3 border-t border-[#E7E5E4] text-xs text-[#78716C] space-y-2">
            <p>
              Looking to hire top software graduates?{' '}
              <Link to="/register?role=recruiter" className="font-bold text-[#F97316] hover:text-[#EA580C] hover:underline">
                Register your Company
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78716C]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by 256-bit encrypted authentication</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
