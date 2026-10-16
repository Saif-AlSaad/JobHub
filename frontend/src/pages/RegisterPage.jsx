import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sparkles, User, Building2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const initialRole = roleParam === 'recruiter' ? 'RECRUITER' : 'JOB_SEEKER';

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: initialRole,
    company_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-background animate-in fade-in duration-200">
      <div className="max-w-md w-full bg-white rounded-container border border-border p-8 shadow-card space-y-6">
        
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center mx-auto shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-[#1C1917] tracking-tight">Create <span className="text-[#0F766E]">Job</span><span className="text-[#F97316]">Hub</span> Account</h2>
          <p className="text-xs text-[#78716C]">
            Join JobHub to discover AI-ranked internships and hire top talent.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-[#78716C] mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'JOB_SEEKER' })}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  form.role === 'JOB_SEEKER'
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                    : 'bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4] hover:bg-[#FAF8F5]'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Job Seeker / Student
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'RECRUITER' })}
                className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all flex items-center justify-center gap-2 ${
                  form.role === 'RECRUITER'
                    ? 'bg-[#F97316] text-white border-[#F97316] shadow-xs'
                    : 'bg-[#F3EFEA] text-[#78716C] border-[#E7E5E4] hover:bg-[#FAF8F5]'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Recruiter / Employer
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              placeholder="e.g. Sarah Rahman"
              className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
            />
          </div>

          {form.role === 'RECRUITER' && (
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Company / Organization Name</label>
              <input
                type="text"
                required
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
                placeholder="e.g. TechNova Labs"
                className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Email Address</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="name@university.edu.bd"
              className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-input bg-brand hover:bg-brand-hover text-white text-xs font-semibold transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-xs text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand hover:underline">
            Sign In
          </Link>
        </p>

      </div>
    </div>
  );
}
