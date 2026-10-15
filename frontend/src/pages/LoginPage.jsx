import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, User, Building2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleDemo = async (role) => {
    setLoading(true);
    setError('');
    try {
      await demoLogin(role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to switch demo account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-container border border-border p-8 shadow-card space-y-6">
        
        {/* Logo & Headline */}
        <div className="text-center space-y-1.5">
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center mx-auto shadow-subtle">
            <Sparkles className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Sign In to JOB HUB</h2>
          <p className="text-xs text-secondary">
            AI-powered internship & job placement for university graduates.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger-bg border border-danger-border text-danger text-xs rounded-card flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1-Click Demo Login Personas */}
        <div className="space-y-2 pt-1">
          <span className="text-[11px] font-semibold text-secondary uppercase tracking-wider block text-center">
            Instant 1-Click Demo Logins
          </span>

          <button
            type="button"
            onClick={() => handleDemo('seeker')}
            className="w-full text-left p-3 rounded-card border border-brand/30 bg-brand-light/40 hover:bg-brand-light/70 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand text-white flex items-center justify-center text-xs font-bold">
                SR
              </div>
              <div>
                <p className="text-xs font-bold text-primary">Sarah Rahman (Job Seeker)</p>
                <p className="text-[10px] text-secondary">DIU Graduate • 87% Match • Savar</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-brand group-hover:translate-x-0.5 transition-transform" />
          </button>

          <button
            type="button"
            onClick={() => handleDemo('recruiter')}
            className="w-full text-left p-3 rounded-card border border-purple-200 bg-purple-50/50 hover:bg-purple-50 transition-colors flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-700 text-white flex items-center justify-center text-xs font-bold">
                TN
              </div>
              <div>
                <p className="text-xs font-bold text-primary">TechNova Labs (Recruiter)</p>
                <p className="text-[10px] text-secondary">Candidate Ranking & Requirements AI</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-purple-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-border w-full"></div>
          <span className="bg-white px-3 text-[11px] text-secondary uppercase font-semibold">Or with credentials</span>
        </div>

        {/* Regular Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu.bd"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-secondary absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-input bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-secondary">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand hover:underline">
            Register as Candidate or Recruiter
          </Link>
        </p>

      </div>
    </div>
  );
}
