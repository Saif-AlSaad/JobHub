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
  Calendar,
  Zap,
  MapPin,
  Award,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import seekerIllustration from '../assets/job-seeker-workspace.jpg';

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
          PAGE 2 (OPTION A): MODERN SAAS WORKSPACE - CANDIDATE PORTAL
          ========================================================================= */}
      {currentRole === 'seeker' && (
        <div
          key="seeker-workspace"
          className="max-w-6xl w-full mx-auto bg-white rounded-[28px] border border-[#E7E5E4] shadow-[0_25px_60px_-15px_rgba(28,25,23,0.08)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10 animate-in fade-in duration-300"
        >
          {/* LEFT COLUMN: AUTHENTICATION FORM (5 cols on lg) */}
          <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between space-y-6">
            
            {/* Top Bar: Change Portal & Workspace Switcher */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]/80">
              <button
                type="button"
                onClick={clearRole}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-all py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-[#F3EFEA] active:scale-95 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Portals</span>
              </button>

              {/* Segmented Workspace Controller */}
              <div className="inline-flex p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80 text-xs font-semibold">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white text-[#0F766E] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-bold transition-all flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Candidate</span>
                </button>
                <button
                  type="button"
                  onClick={() => selectRole('recruiter')}
                  className="px-3 py-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-white/50 transition-all flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Recruiter</span>
                </button>
              </div>
            </div>

            {/* Header Identity */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Candidate Placement Workspace</span>
              </div>
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#1C1917] tracking-tight">
                Sign In to Your Workspace
              </h2>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Access your proactive AI match radar, skill gap recommendations, and direct company interview pipeline.
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
                  <Zap className="w-3 h-3 text-[#0F766E]" />
                  1-Click Instant Demo Persona
                </span>
                <span className="text-[10px] font-semibold text-[#0F766E] bg-[#CCFBF1] px-2 py-0.5 rounded-full">
                  87% Top Match
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleDemo('seeker')}
                disabled={loading}
                className="w-full text-left p-3.5 rounded-2xl border border-[#99F6E4] bg-gradient-to-r from-[#CCFBF1]/40 via-white to-[#CCFBF1]/20 hover:border-[#0F766E] hover:shadow-[0_8px_20px_-4px_rgba(15,118,110,0.15)] hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 flex items-center justify-between group shadow-xs disabled:opacity-50 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0F766E] to-[#14B8A6] text-white flex items-center justify-center text-xs font-bold shadow-sm ring-2 ring-white">
                    SR
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-[#1C1917] group-hover:text-[#0F766E] transition-colors">Sarah Rahman</p>
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded-full">Active Graduate</span>
                    </div>
                    <p className="text-[11px] text-[#78716C]">DIU Software Engineering • Savar Hub</p>
                  </div>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white border border-[#E7E5E4] text-[#78716C] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white group-hover:border-[#0F766E] group-hover:translate-x-0.5 shadow-xs transition-all duration-200">
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>

            {/* Balanced Centered Divider */}
            <div className="flex items-center gap-3 pt-1">
              <div className="h-px flex-1 bg-[#E7E5E4]" />
              <span className="text-[10px] font-bold text-[#78716C] uppercase tracking-wider whitespace-nowrap">
                Or sign in with email
              </span>
              <div className="h-px flex-1 bg-[#E7E5E4]" />
            </div>

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
                <span>{loading ? 'Accessing Workspace...' : 'Sign In as Job Seeker'}</span>
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

          {/* RIGHT COLUMN: JOB SEEKER ILLUSTRATION PANEL (7 cols on lg, edge-to-edge) */}
          <div className="hidden lg:block lg:col-span-7 bg-[#FAF8F5] border-l border-[#E7E5E4] relative overflow-hidden min-h-0 h-full">
            <img
              src={seekerIllustration}
              alt="Job Seeker Workspace"
              className="w-full h-full object-cover object-center block select-none pointer-events-none"
            />
          </div>

        </div>
      )}

      {/* =========================================================================
          PAGE 2 (OPTION B): DESTINATED JOB RECRUITER LOGIN (Modern SaaS Workspace)
          ========================================================================= */}
      {currentRole === 'recruiter' && (
        <div
          key="recruiter-workspace"
          className="max-w-6xl w-full mx-auto bg-white rounded-[28px] border border-[#E7E5E4] shadow-[0_25px_60px_-15px_rgba(249,115,22,0.08)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative z-10 animate-in fade-in duration-300"
        >
          {/* LEFT COLUMN: AUTHENTICATION FORM (5 cols on lg) */}
          <div className="lg:col-span-5 p-7 sm:p-9 flex flex-col justify-between space-y-6">
            
            {/* Top Bar: Change Portal & Workspace Switcher */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E7E5E4]/80">
              <button
                type="button"
                onClick={clearRole}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#78716C] hover:text-[#1C1917] transition-all py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-[#F3EFEA] active:scale-95 group"
              >
                <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Portals</span>
              </button>

              {/* Segmented Workspace Controller */}
              <div className="inline-flex p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => selectRole('seeker')}
                  className="px-3 py-1.5 rounded-lg text-[#78716C] hover:text-[#1C1917] hover:bg-white/50 transition-all flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Candidate</span>
                </button>
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-lg bg-white text-[#F97316] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-bold transition-all flex items-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Recruiter</span>
                </button>
              </div>
            </div>

            {/* Header Identity */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] animate-pulse" />
                <span>Enterprise Talent Workspace</span>
              </div>
              <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#1C1917] tracking-tight">
                Sign In to Employer Workspace
              </h2>
              <p className="text-xs text-[#78716C] leading-relaxed">
                Source top university talent across the Dhaka corridor, review AI semantic applicant rankings, and schedule interviews.
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
                  <Zap className="w-3 h-3 text-[#F97316]" />
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
                <span>{loading ? 'Accessing Workspace...' : 'Sign In as Job Recruiter'}</span>
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

          {/* RIGHT COLUMN: MODERN SAAS WORKSPACE SHOWCASE CANVAS (7 cols on lg) */}
          <div className="hidden lg:flex lg:col-span-7 bg-[#FAF8F5] border-l border-[#E7E5E4] p-8 lg:p-10 flex-col justify-between relative overflow-hidden">
            
            {/* Ambient workspace glows */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-[#FFEDD5]/50 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-[#CCFBF1]/40 rounded-full blur-3xl pointer-events-none" />

            {/* Top Workspace Header */}
            <div className="flex items-center justify-between relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-[#E7E5E4] shadow-xs text-xs font-semibold text-[#1C1917]">
                <span className="w-2 h-2 rounded-full bg-[#F97316] animate-pulse" />
                <span>Live Workspace • Enterprise Talent Pipeline</span>
              </div>
              <span className="text-[11px] font-bold text-[#C2410C] bg-[#FFEDD5] border border-[#FED7AA] px-2.5 py-1 rounded-full">
                Savar Corridor AI Matching
              </span>
            </div>

            {/* Workspace Interactive Mock Canvas */}
            <div className="space-y-4 my-auto py-6 relative z-10">
              
              {/* Card 1: AI Candidate Leaderboard & Match Ranking */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl border border-[#E7E5E4] p-5 shadow-[0_12px_28px_rgba(28,25,23,0.06)] space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center font-bold text-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#1C1917]">Applicant Semantic Rankings</p>
                      <p className="text-[11px] text-[#78716C]">Junior Full Stack Engineer • 48 Applicants</p>
                    </div>
                  </div>
                  <span className="badge-pill badge-primary text-[10px] font-bold">Top Matched</span>
                </div>

                {/* Candidate Rows */}
                <div className="space-y-2 pt-1">
                  
                  {/* Candidate 1 */}
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-between hover:bg-white hover:border-[#0F766E]/40 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                        SR
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1C1917]">Sarah Rahman</span>
                          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">CGPA 3.82</span>
                        </div>
                        <p className="text-[10px] text-[#78716C]">DIU SE '24 • Python, FastAPI, Docker</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="badge-pill badge-salary-verified text-[11px] font-bold">
                        96% AI Fit
                      </span>
                    </div>
                  </div>

                  {/* Candidate 2 */}
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-between hover:bg-white hover:border-[#F97316]/40 transition-all">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#F97316] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
                        TA
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-[#1C1917]">Tanvir Ahmed</span>
                          <span className="text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200">CGPA 3.75</span>
                        </div>
                        <p className="text-[10px] text-[#78716C]">BRAC CS '24 • React, Node.js, Next.js</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="badge-pill badge-location-type text-[11px] font-bold">
                        89% AI Fit
                      </span>
                    </div>
                  </div>

                </div>

                {/* Corridor Speed & Accuracy Stats */}
                <div className="pt-2 border-t border-[#E7E5E4] grid grid-cols-3 gap-2 text-center">
                  <div className="p-1.5 bg-[#F3EFEA]/70 rounded-lg">
                    <p className="text-xs font-bold text-[#1C1917]">48h</p>
                    <p className="text-[9px] text-[#78716C]">Avg Shortlist</p>
                  </div>
                  <div className="p-1.5 bg-[#F3EFEA]/70 rounded-lg">
                    <p className="text-xs font-bold text-[#0F766E]">94%</p>
                    <p className="text-[9px] text-[#78716C]">Fit Accuracy</p>
                  </div>
                  <div className="p-1.5 bg-[#F3EFEA]/70 rounded-lg">
                    <p className="text-xs font-bold text-[#F97316]">35+ Min</p>
                    <p className="text-[9px] text-[#78716C]">Commute Fit</p>
                  </div>
                </div>

              </div>

              {/* Card 2: Corridor Pipeline Quick Action Bar */}
              <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#FED7AA] p-4 shadow-sm flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFEDD5] text-[#C2410C] flex items-center justify-center flex-shrink-0">
                  <Briefcase className="w-5 h-5 text-[#C2410C]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-[#1C1917]">Direct University Corridor Pipeline</p>
                    <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">Active Campus Drive</span>
                  </div>
                  <p className="text-[11px] text-[#78716C] mt-0.5">Connecting employers with top 10% graduates from DIU, BRAC & JU</p>
                </div>
              </div>

            </div>

            {/* Bottom Social Proof */}
            <div className="pt-4 border-t border-[#E7E5E4] flex items-center justify-between text-xs text-[#78716C] relative z-10">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#1C1917]">Hiring teams from:</span>
                <span className="text-[11px] font-medium text-[#78716C]">TechNova • Brain Station 23 • Chaldal</span>
              </div>
              <span className="text-[11px] font-bold text-[#F97316] bg-[#FFEDD5] px-2 py-0.5 rounded-md">Enterprise Ready</span>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
