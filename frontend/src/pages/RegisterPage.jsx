import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, User, Building2, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'JOB_SEEKER',
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
        
        <div className="text-center space-y-1">
          <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center mx-auto shadow-subtle">
            <Sparkles className="w-6 h-6 text-brand" />
          </div>
          <h2 className="text-2xl font-bold text-primary tracking-tight">Create Account</h2>
          <p className="text-xs text-secondary">
            Join JOB HUB to find AI-ranked internships and hire top talent.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger-bg border border-danger-border text-danger text-xs rounded-card flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          
          {/* Role Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1.5">Account Role</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'JOB_SEEKER' })}
                className={`py-2 px-3 text-xs font-semibold rounded-input border transition-colors flex items-center justify-center gap-2 ${
                  form.role === 'JOB_SEEKER'
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                Job Seeker / Student
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, role: 'RECRUITER' })}
                className={`py-2 px-3 text-xs font-semibold rounded-input border transition-colors flex items-center justify-center gap-2 ${
                  form.role === 'RECRUITER'
                    ? 'bg-brand text-white border-brand shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-border hover:bg-slate-100'
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
