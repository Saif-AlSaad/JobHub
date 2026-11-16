import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Mail,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Building2,
  GraduationCap,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  isSupabaseConfigured,
  resendVerificationEmail,
  getSession,
  supabase,
} from '../services/supabaseClient';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, refreshUser } = useAuth();

  const emailParam = searchParams.get('email') || user?.email || '';
  const roleParam = searchParams.get('role') || user?.role || 'JOB_SEEKER';
  const isRecruiter = roleParam === 'RECRUITER';

  const [resending, setResending] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isVerified, setIsVerified] = useState(false);
  const [checking, setChecking] = useState(false);

  // Check if session has already been established / email verified
  useEffect(() => {
    async function checkCurrentSession() {
      if (isSupabaseConfigured && supabase) {
        const session = await getSession();
        if (session?.user && session.user.email_confirmed_at) {
          setIsVerified(true);
        }
      } else if (user?.is_verified) {
        setIsVerified(true);
      }
    }
    checkCurrentSession();

    // Listen for Supabase auth state change (e.g. user clicked confirmation link in same browser)
    let authListener = null;
    if (isSupabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          if (session?.user && session.user.email_confirmed_at) {
            setIsVerified(true);
            await refreshUser();
          }
        }
      });
      authListener = data?.subscription;
    }

    return () => {
      if (authListener) {
        authListener.unsubscribe();
      }
    };
  }, [user]);

  // Countdown timer for resend email button cooldown
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || !emailParam) return;
    setResending(true);
    setResendStatus('');
    try {
      if (isSupabaseConfigured) {
        await resendVerificationEmail(emailParam);
      }
      setResendStatus('Verification link dispatched! Please check your inbox and spam folder.');
      setCountdown(60);
    } catch (err) {
      setResendStatus(err.message || 'Unable to resend email at this moment. Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getUser();
        if (data?.user?.email_confirmed_at) {
          setIsVerified(true);
          await refreshUser();
          return;
        }
      }
      await refreshUser();
      if (user?.is_verified) {
        setIsVerified(true);
      } else {
        setResendStatus('Email has not been verified yet. Please click the link sent to your inbox.');
      }
    } catch (e) {
      setResendStatus('Verification check in progress. Please log in once confirmed.');
    } finally {
      setChecking(false);
    }
  };

  const handleProceed = () => {
    if (isRecruiter) {
      navigate('/');
    } else {
      navigate('/resume-upload');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#FAF8F5] relative overflow-hidden">
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

      <div className="max-w-[480px] w-full bg-white/95 backdrop-blur-xl rounded-[28px] sm:rounded-[32px] border border-[#E7E5E4] p-7 sm:p-9 shadow-[0_20px_50px_-12px_rgba(28,25,23,0.08),0_1px_3px_rgba(28,25,23,0.04)] ring-1 ring-black/[0.03] space-y-6 relative z-10 transition-all duration-300">
        {/* Verification Success State */}
        {isVerified ? (
          <div className="text-center space-y-5 animate-in fade-in duration-300">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" /> Email Verified
              </span>
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Welcome to JobHub!
              </h1>
              <p className="text-sm text-[#78716C] max-w-sm mx-auto leading-relaxed">
                Your email address <strong className="text-[#1C1917] font-semibold">{emailParam || 'your account'}</strong> has been verified successfully.
              </p>
            </div>

            {/* Next Step Banner */}
            <div className={`p-4 rounded-2xl text-left border ${
              isRecruiter ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-teal-50/70 border-teal-200 text-teal-900'
            }`}>
              <div className="flex items-center gap-2 font-semibold text-xs mb-1">
                <Sparkles className="w-4 h-4" />
                {isRecruiter ? 'Recruiter Dashboard Ready' : 'Next Step: Resume Upload & Profile Setup'}
              </div>
              <p className="text-xs leading-relaxed opacity-90">
                {isRecruiter
                  ? 'Your employer access is unlocked. Proceed to your recruiter dashboard to manage openings and review matched candidates.'
                  : 'Complete your profile setup by uploading your resume. All fields will start fresh so you can confirm or tailor your skills.'}
              </p>
            </div>

            <button
              onClick={handleProceed}
              className={`w-full py-3.5 px-5 rounded-2xl font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isRecruiter
                  ? 'bg-gradient-to-r from-[#D97706] to-[#B45309] text-white hover:brightness-105 shadow-amber-900/10'
                  : 'bg-gradient-to-r from-[#0D9488] to-[#0F766E] text-white hover:brightness-105 shadow-teal-900/10'
              }`}
            >
              <span>{isRecruiter ? 'Go to Recruiter Dashboard' : 'Proceed to Resume Upload'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Waiting for Verification State */
          <div className="text-center space-y-6">
            {/* Top Icon with Pulse Ring */}
            <div className="relative inline-flex items-center justify-center mx-auto">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-xs ${
                isRecruiter
                  ? 'bg-[#FFEDD5] border-[#FED7AA] text-[#C2410C]'
                  : 'bg-[#CCFBF1] border-[#99F6E4] text-[#0F766E]'
              }`}>
                <Mail className="w-8 h-8 animate-bounce" />
              </div>
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${
                  isRecruiter
                    ? 'bg-[#FFEDD5] border-[#FED7AA] text-[#C2410C]'
                    : 'bg-[#CCFBF1] border-[#99F6E4] text-[#0F766E]'
                }`}>
                  {isRecruiter ? <Building2 className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                  {isRecruiter ? 'Recruiter Verification' : 'Job Seeker Verification'}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1C1917]">
                Verify Your Email Address
              </h1>
              <p className="text-sm text-[#78716C] max-w-sm mx-auto leading-relaxed">
                We sent a verification confirmation link to:
              </p>
              <div className="inline-block px-3.5 py-1.5 rounded-xl bg-[#F5F5F4] border border-[#E7E5E4] font-medium text-xs text-[#1C1917]">
                {emailParam || 'your registered email'}
              </div>
            </div>

            {/* Roadmap Card */}
            <div className="bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl p-4 text-left space-y-2.5">
              <p className="text-xs font-semibold text-[#44403C] uppercase tracking-wider">
                {isRecruiter ? 'Recruiter Verification Roadmap' : 'Job Seeker Onboarding Roadmap'}
              </p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-medium">
                  <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold">1</div>
                  <span>Verify Email Address (Current)</span>
                </div>
                {isRecruiter ? (
                  <>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">2</div>
                      <span>Unlock Recruiter Dashboard</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">3</div>
                      <span>Post Openings & Screen Candidates</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">2</div>
                      <span>Upload Resume (<code className="text-[11px]">/resume-upload</code>)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">3</div>
                      <span>Review Profile (<code className="text-[11px]">/update-profile</code>)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[#78716C]">
                      <div className="w-4 h-4 rounded-full bg-stone-200 flex items-center justify-center text-[10px]">4</div>
                      <span>Unlock AI Match Scoring</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Status messages */}
            {resendStatus && (
              <div className="p-3 rounded-xl text-xs bg-teal-50 border border-teal-200 text-teal-800 text-center animate-in fade-in">
                {resendStatus}
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleManualCheck}
                disabled={checking}
                className="w-full py-3 px-4 rounded-xl font-semibold text-xs bg-[#1C1917] text-white hover:bg-stone-800 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
                <span>{checking ? 'Checking Status...' : "I've Clicked the Verification Link"}</span>
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending || countdown > 0}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  countdown > 0
                    ? 'bg-stone-100 border-stone-200 text-stone-400 cursor-not-allowed'
                    : 'bg-white border-[#E7E5E4] text-[#44403C] hover:bg-[#F5F5F4]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>
                  {countdown > 0
                    ? `Resend link in ${countdown}s`
                    : resending
                    ? 'Sending...'
                    : 'Resend Verification Email'}
                </span>
              </button>
            </div>

            {/* Back to Login */}
            <div className="pt-2 text-center text-xs text-[#78716C]">
              Already verified or want to use another email?{' '}
              <Link to="/login" className="font-semibold text-[#1C1917] hover:underline">
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
