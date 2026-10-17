import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  User,
  Building2,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const initialRole = roleParam === 'recruiter' ? 'RECRUITER' : 'JOB_SEEKER';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: initialRole,
    company_name: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [prefilled, setPrefilled] = useState(false);

  // Sync state if URL search param changes
  useEffect(() => {
    if (roleParam === 'recruiter') {
      setForm((prev) => ({ ...prev, role: 'RECRUITER' }));
    } else if (roleParam === 'seeker') {
      setForm((prev) => ({ ...prev, role: 'JOB_SEEKER' }));
    }
  }, [roleParam]);

  const isRecruiter = form.role === 'RECRUITER';

  const switchRole = (newRole) => {
    setError('');
    setForm((prev) => ({ ...prev, role: newRole }));
    setSearchParams({ role: newRole === 'RECRUITER' ? 'recruiter' : 'seeker' });
  };

  // Dynamic Password Strength Meter
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: 'bg-stone-200', text: 'text-stone-400' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || (pass.length >= 10 && /[A-Z]/.test(pass))) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Weak', color: 'bg-red-500', text: 'text-red-500' };
      case 2:
        return { score: 2, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-500' };
      case 3:
        return { score: 3, label: 'Good', color: 'bg-teal-500', text: 'text-teal-600' };
      case 4:
        return { score: 4, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
      default:
        return { score: 0, label: '', color: 'bg-stone-200', text: 'text-stone-400' };
    }
  };

  const passwordStrength = getPasswordStrength(form.password);

  const handleDemoFill = () => {
    if (isRecruiter) {
      setForm({
        full_name: 'Sabrina Rahman',
        company_name: 'TechNova Labs',
        email: 'recruiter@technova.io',
        password: 'password123',
        role: 'RECRUITER',
      });
    } else {
      setForm({
        full_name: 'Sarah Rahman',
        company_name: '',
        email: 'sarah.rahman@diu.edu.bd',
        password: 'password123',
        role: 'JOB_SEEKER',
      });
    }
    setPrefilled(true);
    setTimeout(() => setPrefilled(false), 2200);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreeTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] relative overflow-hidden">
      {/* Decorative ambient background glows */}
      <div
        className={`absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isRecruiter ? 'bg-[#FFEDD5]/40' : 'bg-[#CCFBF1]/40'
        }`}
      />
      <div
        className={`absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[600px] h-[400px] rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          isRecruiter ? 'bg-[#FED7AA]/30' : 'bg-[#99F6E4]/25'
        }`}
      />
      <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#FAF8F5] to-transparent pointer-events-none" />

      {/* Main Glassmorphic Card Container */}
      <div className="max-w-[460px] w-full bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-[#E7E5E4] p-7 sm:p-9 shadow-[0_20px_50px_-12px_rgba(28,25,23,0.08),0_1px_3px_rgba(28,25,23,0.04)] ring-1 ring-black/[0.03] space-y-6 relative z-10 transition-all duration-300">
        
        {/* Top Header Section */}
        <div className="text-center space-y-3">
          
          {/* Subtle Role Portal Badge */}
          <div className="inline-flex items-center gap-1.5">
            {isRecruiter ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEDD5] border border-[#FED7AA] text-[#C2410C] text-[11px] font-semibold shadow-xs transition-all">
                <Building2 className="w-3.5 h-3.5" />
                <span>Enterprise Talent Suite • Employer Portal</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] border border-[#99F6E4] text-[#0F766E] text-[11px] font-semibold shadow-xs transition-all">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Placement Radar • Candidate Portal</span>
              </span>
            )}
          </div>

          {/* Dynamic Role Icon Tile */}
          <div className="flex justify-center">
            {isRecruiter ? (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#FFEDD5] to-[#FFF7ED] border border-[#FED7AA] text-[#C2410C] flex items-center justify-center shadow-[0_4px_14px_rgba(249,115,22,0.15)] ring-4 ring-[#FFEDD5]/40 transition-all duration-300">
                <Building2 className="w-7 h-7" />
              </div>
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-b from-[#CCFBF1] to-[#E6FFFA] border border-[#99F6E4] text-[#0F766E] flex items-center justify-center shadow-[0_4px_14px_rgba(15,118,110,0.15)] ring-4 ring-[#CCFBF1]/40 transition-all duration-300">
                <GraduationCap className="w-7 h-7" />
              </div>
            )}
          </div>

          {/* Title & Description */}
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#1C1917] tracking-tight">
              Create <span className="text-[#0F766E]">Job</span><span className="text-[#F97316]">Hub</span> Account
            </h1>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-[340px] mx-auto font-normal">
              {isRecruiter
                ? 'Join leading tech companies discovering and hiring top university talent through AI-ranked pipelines.'
                : 'Join JobHub to discover AI-ranked internships, track applications, and accelerate your career.'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 bg-red-50/90 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Smooth iOS-Style Segmented Role Selector */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label className="font-bold text-[#1C1917]">Account Role</label>
            
            {/* Quick Demo Fill Helper Button */}
            <button
              type="button"
              onClick={handleDemoFill}
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md transition-all active:scale-95 ${
                isRecruiter
                  ? 'text-[#F97316] hover:text-[#EA580C] bg-[#FFEDD5]/60 hover:bg-[#FFEDD5]'
                  : 'text-[#0F766E] hover:text-[#115E59] bg-[#CCFBF1]/60 hover:bg-[#CCFBF1]'
              }`}
            >
              {prefilled ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">Sample filled!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3 h-3" />
                  <span>Fill sample info</span>
                </>
              )}
            </button>
          </div>

          <div className="p-1 rounded-2xl bg-[#F3EFEA] border border-[#E7E5E4]/80 grid grid-cols-2 gap-1 text-xs">
            {/* Job Seeker Tab */}
            <button
              type="button"
              onClick={() => switchRole('JOB_SEEKER')}
              className={`py-2 px-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                !isRecruiter
                  ? 'bg-white text-[#0F766E] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-bold ring-1 ring-black/[0.04]'
                  : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/40'
              }`}
            >
              <GraduationCap className={`w-4 h-4 ${!isRecruiter ? 'text-[#0F766E]' : 'text-[#78716C]'}`} />
              <span>Job Seeker / Student</span>
            </button>

            {/* Recruiter Tab */}
            <button
              type="button"
              onClick={() => switchRole('RECRUITER')}
              className={`py-2 px-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                isRecruiter
                  ? 'bg-white text-[#F97316] shadow-[0_2px_8px_rgba(0,0,0,0.06)] font-bold ring-1 ring-black/[0.04]'
                  : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/40'
              }`}
            >
              <Building2 className={`w-4 h-4 ${isRecruiter ? 'text-[#F97316]' : 'text-[#78716C]'}`} />
              <span>Recruiter / Employer</span>
            </button>
          </div>
        </div>

        {/* Main Registration Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#1C1917]">Full Name</label>
            <div className="relative group">
              <User
                className={`w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                  isRecruiter ? 'group-focus-within:text-[#F97316]' : 'group-focus-within:text-[#0F766E]'
                }`}
              />
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder={isRecruiter ? 'e.g. Sabrina Rahman' : 'e.g. Sarah Rahman'}
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-[#78716C]/60 ${
                  isRecruiter
                    ? 'focus:border-[#F97316] focus:ring-[#F97316]/10'
                    : 'focus:border-[#0F766E] focus:ring-[#0F766E]/10'
                }`}
              />
            </div>
          </div>

          {/* Company / Organization Name (Recruiter Exclusive) */}
          {isRecruiter && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#1C1917]">Company / Organization Name</label>
                <span className="text-[11px] text-[#78716C]">Verified employer tag</span>
              </div>
              <div className="relative group">
                <Building2 className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="text"
                  required
                  value={form.company_name}
                  onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                  placeholder="e.g. TechNova Labs"
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200 placeholder:text-[#78716C]/60"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">
                {isRecruiter ? 'Corporate Work Email' : 'Email Address'}
              </label>
              <span className="text-[11px] text-[#78716C]">
                {isRecruiter ? 'Use official company email' : 'University or personal email'}
              </span>
            </div>
            <div className="relative group">
              <Mail
                className={`w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                  isRecruiter ? 'group-focus-within:text-[#F97316]' : 'group-focus-within:text-[#0F766E]'
                }`}
              />
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder={isRecruiter ? 'recruiter@technova.io' : 'name@university.edu.bd'}
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-[#78716C]/60 ${
                  isRecruiter
                    ? 'focus:border-[#F97316] focus:ring-[#F97316]/10'
                    : 'focus:border-[#0F766E] focus:ring-[#0F766E]/10'
                }`}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">Password</label>
              {form.password && (
                <span className={`text-[11px] font-semibold ${passwordStrength.text}`}>
                  {passwordStrength.label}
                </span>
              )}
            </div>
            <div className="relative group">
              <Lock
                className={`w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                  isRecruiter ? 'group-focus-within:text-[#F97316]' : 'group-focus-within:text-[#0F766E]'
                }`}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-[#78716C]/60 ${
                  isRecruiter
                    ? 'focus:border-[#F97316] focus:ring-[#F97316]/10'
                    : 'focus:border-[#0F766E] focus:ring-[#0F766E]/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#78716C] hover:text-[#1C1917] hover:bg-[#F3EFEA] rounded-lg transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Micro Password Strength Progress Bar */}
            {form.password && (
              <div className="space-y-1 pt-1">
                <div className="grid grid-cols-4 gap-1.5 h-1">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-full rounded-full transition-all duration-200 ${
                        passwordStrength.score >= step ? passwordStrength.color : 'bg-stone-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#78716C]">
                  Must be at least 8 characters with letters & numbers.
                </p>
              </div>
            )}
          </div>

          {/* Terms Agreement Checkbox */}
          <div className="pt-1">
            <label className="flex items-start gap-2.5 text-xs text-[#78716C] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className={`mt-0.5 w-4 h-4 rounded border-[#E7E5E4] focus:ring-offset-0 cursor-pointer ${
                  isRecruiter
                    ? 'text-[#F97316] focus:ring-[#F97316] accent-[#F97316]'
                    : 'text-[#0F766E] focus:ring-[#0F766E] accent-[#0F766E]'
                }`}
              />
              <span className="leading-tight">
                I agree to the{' '}
                <a href="#/terms" className="font-semibold text-[#1C1917] hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#/privacy" className="font-semibold text-[#1C1917] hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-5 rounded-xl text-white text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 ${
              isRecruiter
                ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.35)]'
                : 'bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#0F766E] shadow-[0_4px_16px_rgba(15,118,110,0.25)] hover:shadow-[0_8px_24px_rgba(15,118,110,0.35)]'
            }`}
          >
            {loading ? (
              <span>Creating your account...</span>
            ) : (
              <>
                <span>{isRecruiter ? 'Create Recruiter Account' : 'Create Student Account'}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation & Security */}
        <div className="pt-2 border-t border-[#E7E5E4]/80 text-center space-y-2">
          <p className="text-xs text-[#78716C]">
            Already have an account?{' '}
            <Link
              to={isRecruiter ? '/login?role=recruiter' : '/login?role=seeker'}
              className={`font-bold hover:underline transition-colors ${
                isRecruiter ? 'text-[#F97316] hover:text-[#EA580C]' : 'text-[#0F766E] hover:text-[#115E59]'
              }`}
            >
              Sign In
            </Link>
          </p>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#78716C] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by 256-bit encrypted authentication</span>
          </div>
        </div>

      </div>
    </div>
  );
}
