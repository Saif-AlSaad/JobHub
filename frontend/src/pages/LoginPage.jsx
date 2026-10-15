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
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50/60 relative overflow-hidden">
      
      {/* Decorative ambient background glows (Figma style) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-200/30 via-purple-100/25 to-cyan-100/20 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-white to-transparent pointer-events-none" />

      {/* =========================================================================
          PAGE 1: DUAL-PORTAL ROLE SELECTOR (Clean, Smooth & Modern UI)
          ========================================================================= */}
      {!currentRole && (
        <div className="max-w-4xl w-full mx-auto space-y-10 relative z-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
          
          {/* Header & Brand Identity */}
          <div className="text-center space-y-3.5 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200/80 shadow-xs text-xs font-semibold text-slate-700">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>AI-Powered Career & Placement Network</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Welcome to <span className="text-indigo-600">JOB HUB</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
              Select your role to access your dedicated workspace. Tailored for students, university graduates, and enterprise hiring teams.
            </p>
          </div>

          {/* 2-Column Portal Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* CARD 1: JOB SEEKER PORTAL */}
            <div
              onClick={() => selectRole('seeker')}
              className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-indigo-400 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(79,70,229,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top ambient hover glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-indigo-100 to-cyan-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-6 relative z-10">
                {/* Header Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50/80 text-indigo-700 border border-indigo-200/70">
                    For Students & Alumni
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">
                    Job Seeker Portal
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    Discover proactive AI-matched internships, analyze transparent skill gaps, and apply to vetted tech companies in 1 click.
                  </p>
                </div>

                {/* Feature Value Props */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <span>Proactive hybrid placement radar & match score</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-cyan-50 text-cyan-700 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>Instant resume parser & skill gap recommendations</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
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
                  className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/25 flex items-center justify-between group-hover:shadow-indigo-600/40"
                >
                  <span>Sign In as Job Seeker</span>
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-slate-600 font-medium">
                    1-Click Demo Available: <strong className="text-slate-700 font-semibold">Sarah Rahman</strong> (DIU Graduate)
                  </span>
                </div>
              </div>
            </div>

            {/* CARD 2: JOB RECRUITER PORTAL */}
            <div
              onClick={() => selectRole('recruiter')}
              className="group relative bg-white rounded-3xl border border-slate-200/80 hover:border-purple-400 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_40px_-15px_rgba(147,51,234,0.18)] hover:-translate-y-1.5 transition-all duration-300 ease-out cursor-pointer flex flex-col justify-between overflow-hidden"
            >
              {/* Top ambient hover glow */}
              <div className="absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-purple-100 to-pink-50 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />

              <div className="space-y-6 relative z-10">
                {/* Header Row: Icon + Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-700 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/25 group-hover:scale-105 transition-transform">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50/80 text-purple-700 border border-purple-200/70">
                    For Employers & HR
                  </span>
                </div>

                {/* Title & Description */}
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-slate-900 tracking-tight group-hover:text-purple-700 transition-colors">
                    Job Recruiter Portal
                  </h2>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    Post roles with semantic skill criteria, screen candidates with automated AI ranking, and manage your pipeline efficiently.
                  </p>
                </div>

                {/* Feature Value Props */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <span>Candidate AI Ranking & automated CV scoring</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <span>Publish job openings in under 2 minutes</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
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
                  className="w-full py-3.5 px-5 rounded-2xl bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-purple-700/25 flex items-center justify-between group-hover:shadow-purple-700/40"
                >
                  <span>Sign In as Job Recruiter</span>
                  <div className="w-7 h-7 rounded-xl bg-white/20 flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <ArrowRight className="w-4 h-4 text-white" />
                  </div>
                </button>
                <div className="text-center">
                  <span className="text-[11px] text-slate-600 font-medium">
                    1-Click Demo Available: <strong className="text-slate-700 font-semibold">TechNova Labs</strong> (Sabrina Rahman)
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Footer Helper */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/80 p-4 text-center text-xs text-slate-600 flex flex-wrap items-center justify-center gap-3 shadow-xs">
            <span>New to JOB HUB?</span>
            <div className="flex items-center gap-3">
              <Link
                to="/register?role=seeker"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Register as Job Seeker
              </Link>
              <span className="text-slate-300">•</span>
              <Link
                to="/register?role=recruiter"
                className="font-semibold text-purple-700 hover:text-purple-800 hover:underline"
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
        <div className="max-w-[460px] w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] space-y-7 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Top Bar: Back Button + Quick Segmented Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Portal</span>
            </button>

            {/* Figma-Style Segmented Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold">
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-white text-indigo-600 shadow-xs font-bold"
              >
                Job Seeker
              </button>
              <button
                type="button"
                onClick={() => selectRole('recruiter')}
                className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              Job Seeker Sign In
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
              Enter your student or candidate credentials to access your placement dashboard.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* VIP 1-Click Instant Demo Card */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block text-center">
              1-Click Instant Demo Access
            </span>

            <button
              type="button"
              onClick={() => handleDemo('seeker')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-2xl border border-indigo-200/90 bg-indigo-50/60 hover:bg-indigo-100/70 transition-all flex items-center justify-between group shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  SR
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Sarah Rahman</p>
                  <p className="text-[11px] text-indigo-700 font-semibold">DIU Graduate • 87% Match • Savar</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white border border-indigo-200 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-600 uppercase font-bold tracking-wider">
              Or with credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Student Email Address</label>
                <button
                  type="button"
                  onClick={() => prefill('sarah.rahman@jobhub.io', 'password123')}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline"
                >
                  Fill demo credentials
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah.rahman@jobhub.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-600">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-600/10 focus:border-indigo-600 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-600 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => prefill('sarah.rahman@jobhub.io', 'password123')}
                className="text-slate-500 hover:text-indigo-600 font-medium"
              >
                Reset demo
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-indigo-600/25 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In as Job Seeker'}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <p>
              New candidate on JOB HUB?{' '}
              <Link to="/register?role=seeker" className="font-bold text-indigo-600 hover:text-indigo-800 hover:underline">
                Create Free Seeker Account
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
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
        <div className="max-w-[460px] w-full bg-white rounded-3xl border border-slate-200/90 p-8 sm:p-10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.07)] space-y-7 relative z-10 animate-in fade-in slide-in-from-bottom-3 duration-300">
          
          {/* Top Bar: Back Button + Quick Segmented Switcher */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <button
              type="button"
              onClick={clearRole}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors py-1.5 px-2.5 -ml-2 rounded-lg hover:bg-slate-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Change Portal</span>
            </button>

            {/* Figma-Style Segmented Toggle */}
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => selectRole('seeker')}
                className="px-3 py-1 rounded-lg text-slate-500 hover:text-slate-900 transition-colors"
              >
                Job Seeker
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded-lg bg-white text-purple-700 shadow-xs font-bold"
              >
                Recruiter
              </button>
            </div>
          </div>

          {/* Hero Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center mx-auto shadow-xs">
              <Building2 className="w-7 h-7" />
            </div>
            <h2 className="text-2xl sm:text-[26px] font-bold text-slate-900 tracking-tight">
              Recruiter & Employer Sign In
            </h2>
            <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
              Sign in with your corporate credentials to manage postings, rankings, and applicants.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* VIP 1-Click Instant Demo Card */}
          <div className="space-y-2.5">
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block text-center">
              1-Click Instant Employer Demo
            </span>

            <button
              type="button"
              onClick={() => handleDemo('recruiter')}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-2xl border border-purple-200/90 bg-purple-50/60 hover:bg-purple-100/70 transition-all flex items-center justify-between group shadow-xs active:scale-[0.99] disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                  TN
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">TechNova Labs</p>
                  <p className="text-[11px] text-purple-700 font-semibold">Sabrina Rahman • Lead Technical Recruiter</p>
                </div>
              </div>
              <div className="w-7 h-7 rounded-lg bg-white border border-purple-200 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </button>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 w-full" />
            <span className="bg-white px-3 text-[11px] text-slate-600 uppercase font-bold tracking-wider">
              Or with work credentials
            </span>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Corporate Work Email</label>
                <button
                  type="button"
                  onClick={() => prefill('recruiter@technova.io', 'password123')}
                  className="text-[11px] text-purple-700 hover:text-purple-900 font-semibold hover:underline"
                >
                  Fill demo credentials
                </button>
              </div>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recruiter@technova.io"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-semibold text-slate-700">Password</label>
                <span className="text-[11px] text-slate-600">Default: password123</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-600 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] rounded-xl border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-purple-600/10 focus:border-purple-600 transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-600 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Help */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-purple-700 focus:ring-purple-600"
                />
                <span>Remember me for 30 days</span>
              </label>
              <button
                type="button"
                onClick={() => prefill('recruiter@technova.io', 'password123')}
                className="text-slate-500 hover:text-purple-700 font-medium"
              >
                Reset demo
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-purple-700 hover:bg-purple-800 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-purple-700/25 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'Sign In as Job Recruiter'}
            </button>
          </form>

          {/* Footer Register Link */}
          <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-600 space-y-2">
            <p>
              Looking to hire top software graduates?{' '}
              <Link to="/register?role=recruiter" className="font-bold text-purple-700 hover:text-purple-900 hover:underline">
                Register your Company
              </Link>
            </p>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-600">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Protected by 256-bit encrypted authentication</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
