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
  const [prefilled, setPrefilled] = useState(false);

  const selectRole = (role) => {
    setError('');
    setEmail('');
    setPassword('');
    setPrefilled(false);
    setSearchParams({ role });
  };

  const clearRole = () => {
    setError('');
    setEmail('');
    setPassword('');
    setPrefilled(false);
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
    setPrefilled(true);
    setTimeout(() => setPrefilled(false), 2200);
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
        <div
          key="seeker-portal"
          className="max-w-[440px] w-full bg-white/95 backdrop-blur-xl rounded-[28px] border border-[#E7E5E4] p-7 sm:p-9 shadow-[0_20px_50px_-12px_rgba(15,118,110,0.1),0_1px_3px_rgba(28,25,23,0.05)] ring-1 ring-black/[0.03] space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-250"
        >
          {/* Top Bar: Back Button + Quick Segmented Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]/80">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-all py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-[#F3EFEA] active:scale-95 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Change Portal</span>
            </button>

            {/* Segmented Toggle with Smooth iOS/macOS look */}
            <div className="inline-flex p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80 text-xs font-semibold">
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-white text-[#0F766E] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-bold transition-all"
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => selectRole('recruiter')}
                className="px-3 py-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-white/50 transition-all"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#CCFBF1] to-[#E6FFFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center mx-auto shadow-[0_4px_14px_rgba(15,118,110,0.15)] ring-4 ring-[#CCFBF1]/40">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              Job Seeker Sign In
            </h2>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-[320px] mx-auto">
              Enter your student or candidate credentials to access your placement dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}


          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C1917]">Student Email Address</label>
                <button
                  type="button"
                  onClick={() => prefill('sarah.rahman@jobhub.io', 'password123')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E] hover:text-[#115E59] bg-[#CCFBF1]/50 hover:bg-[#CCFBF1] px-2 py-0.5 rounded-md transition-all active:scale-95"
                >
                  {prefilled ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Credentials filled!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#0F766E]" />
                      <span>Fill demo credentials</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative group">
                <Mail className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.rahman@jobhub.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200 placeholder:text-[#78716C]/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C1917]">Password</label>
                <span className="text-[11px] text-[#78716C] font-normal">Default: <code className="bg-[#F3EFEA] px-1.5 py-0.5 rounded text-[#1C1917] font-semibold text-[11px]">password123</code></span>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200 placeholder:text-[#78716C]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-[#78716C] hover:text-[#1C1917] font-medium cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E7E5E4] text-[#0F766E] focus:ring-[#0F766E] focus:ring-offset-0 cursor-pointer accent-[#0F766E]"
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => prefill('sarah.rahman@jobhub.io', 'password123')}
                className="text-[11px] text-[#78716C] hover:text-[#0F766E] font-medium transition-colors"
              >
                Reset demo
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#0F766E] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_4px_16px_rgba(15,118,110,0.25)] hover:shadow-[0_8px_24px_rgba(15,118,110,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Signing In...' : 'Sign In as Job Seeker'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2 border-t border-[#E7E5E4]/80 text-xs text-[#78716C] space-y-2">
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
        <div
          key="recruiter-portal"
          className="max-w-[440px] w-full bg-white/95 backdrop-blur-xl rounded-[28px] border border-[#E7E5E4] p-7 sm:p-9 shadow-[0_20px_50px_-12px_rgba(249,115,22,0.1),0_1px_3px_rgba(28,25,23,0.05)] ring-1 ring-black/[0.03] space-y-6 relative z-10 animate-in fade-in zoom-in-95 duration-250"
        >
          {/* Top Bar: Back Button + Quick Segmented Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]/80">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-all py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-[#F3EFEA] active:scale-95 group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Change Portal</span>
            </button>

            {/* Segmented Toggle with Smooth iOS/macOS look */}
            <div className="inline-flex p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => selectRole('seeker')}
                className="px-3 py-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-white/50 transition-all"
              >
                Job Seeker
              </button>
              <button
                type="button"
                className="px-3 py-1.5 rounded-lg bg-white text-[#F97316] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-bold transition-all"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-2 pt-1">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FFEDD5] to-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] flex items-center justify-center mx-auto shadow-[0_4px_14px_rgba(249,115,22,0.15)] ring-4 ring-[#FFEDD5]/40">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">
              Recruiter & Employer Sign In
            </h2>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-[320px] mx-auto">
              Sign in with your corporate credentials to manage postings, rankings, and applicants.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* VIP 1-Click Instant Demo Card */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                1-Click Instant Employer Demo
              </span>
              <span className="text-[10px] font-semibold text-[#C2410C] bg-[#FFEDD5] px-2 py-0.5 rounded-full">
                Verified Recruiter
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDemo('recruiter')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-2xl border border-[#FED7AA] bg-gradient-to-r from-[#FFEDD5]/40 via-white to-[#FFEDD5]/20 hover:border-[#F97316] hover:shadow-[0_8px_20px_-4px_rgba(249,115,22,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 flex items-center justify-between group shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F97316] to-[#FB923C] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                  TN
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-[#1C1917] group-hover:text-[#F97316] transition-colors">TechNova Labs</p>
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded-full">Hiring Team</span>
                  </div>
                  <p className="text-[11px] text-[#78716C]">Sabrina Rahman • Lead Technical Recruiter</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white border border-[#E7E5E4] text-[#78716C] flex items-center justify-center group-hover:bg-[#F97316] group-hover:text-white group-hover:border-[#F97316] group-hover:translate-x-0.5 shadow-xs transition-all duration-200">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </button>
          </div>

          {/* Balanced Centered Divider */}
          <div className="flex items-center gap-3 pt-1">
            <div className="h-px flex-1 bg-[#E7E5E4]" />
            <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider whitespace-nowrap">
              Or sign in with work credentials
            </span>
            <div className="h-px flex-1 bg-[#E7E5E4]" />
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C1917]">Corporate Work Email</label>
                <button
                  type="button"
                  onClick={() => prefill('recruiter@technova.io', 'password123')}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#F97316] hover:text-[#EA580C] bg-[#FFEDD5]/50 hover:bg-[#FFEDD5] px-2 py-0.5 rounded-md transition-all active:scale-95"
                >
                  {prefilled ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Credentials filled!</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-[#F97316]" />
                      <span>Fill demo credentials</span>
                    </>
                  )}
                </button>
              </div>
              <div className="relative group">
                <Mail className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@technova.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200 placeholder:text-[#78716C]/60"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C1917]">Password</label>
                <span className="text-[11px] text-[#78716C] font-normal">Default: <code className="bg-[#F3EFEA] px-1.5 py-0.5 rounded text-[#1C1917] font-semibold text-[11px]">password123</code></span>
              </div>
              <div className="relative group">
                <Lock className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200 placeholder:text-[#78716C]/60"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] rounded-lg transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-[#78716C] hover:text-[#1C1917] font-medium cursor-pointer select-none transition-colors">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-[#E7E5E4] text-[#F97316] focus:ring-[#F97316] focus:ring-offset-0 cursor-pointer accent-[#F97316]"
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => prefill('recruiter@technova.io', 'password123')}
                className="text-[11px] text-[#78716C] hover:text-[#F97316] font-medium transition-colors"
              >
                Reset demo
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] active:scale-[0.99] text-white text-xs sm:text-sm font-bold transition-all shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.35)] disabled:opacity-50 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{loading ? 'Signing In...' : 'Sign In as Job Recruiter'}</span>
              {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-2 border-t border-[#E7E5E4]/80 text-xs text-[#78716C] space-y-2">
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
