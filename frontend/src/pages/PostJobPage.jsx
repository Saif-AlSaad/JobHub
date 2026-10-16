import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Check, Plus, X, ArrowRight, Building2, Send, MapPin } from 'lucide-react';
import api from '../services/api';

export default function PostJobPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    responsibilities: '',
    job_type: 'Internship',
    location_name: 'Savar, Dhaka',
    is_remote: false,
    salary_min: 25000,
    salary_max: 35000,
    salary_currency: 'BDT',
    experience_level: 'Entry-level / Fresh Graduate',
    education_level: 'BSc in Software Engineering or Computer Science',
    required_skills: ['Python', 'FastAPI', 'PostgreSQL'],
    preferred_skills: ['Docker', 'AWS'],
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [aiExtracting, setAiExtracting] = useState(false);
  const [aiDetected, setAiDetected] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');

  const handleAiExtract = async () => {
    if (!form.title || !form.description) {
      alert('Please enter a Job Title and Description first.');
      return;
    }
    setAiExtracting(true);
    try {
      const res = await api.post('/jobs/ai-extract-requirements', {
        title: form.title,
        description: form.description,
        requirements: form.requirements
      });
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        required_skills: data.required_skills || prev.required_skills,
        preferred_skills: data.preferred_skills || prev.preferred_skills,
        experience_level: data.experience_level || prev.experience_level,
        education_level: data.education_level || prev.education_level,
        job_type: data.job_type || prev.job_type
      }));
      setAiDetected(true);
    } catch (err) {
      alert('Could not extract requirements automatically. You can enter them manually.');
    } finally {
      setAiExtracting(false);
    }
  };

  const handleAddReqSkill = () => {
    if (newReqSkill.trim() && !form.required_skills.includes(newReqSkill.trim())) {
      setForm({ ...form, required_skills: [...form.required_skills, newReqSkill.trim()] });
      setNewReqSkill('');
    }
  };

  const handleRemoveReqSkill = (skill) => {
    setForm({ ...form, required_skills: form.required_skills.filter((s) => s !== skill) });
  };

  const handleAddPrefSkill = () => {
    if (newPrefSkill.trim() && !form.preferred_skills.includes(newPrefSkill.trim())) {
      setForm({ ...form, preferred_skills: [...form.preferred_skills, newPrefSkill.trim()] });
      setNewPrefSkill('');
    }
  };

  const handleRemovePrefSkill = (skill) => {
    setForm({ ...form, preferred_skills: form.preferred_skills.filter((s) => s !== skill) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/jobs/', form);
      alert('Job published successfully! AI candidate matching and alerts have been scheduled.');
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to publish job.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#1C1917] tracking-tight">Post New Placement Opportunity</h1>
        <p className="text-sm text-[#78716C] mt-1">
          Our AI parsing engine will automatically detect required skills, predict graduate reach, and alert matching students.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Form (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
            <h2 className="text-base font-bold text-[#1C1917]">Core Position Details</h2>

            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1">Job Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Junior Backend Engineer (FastAPI / Python)"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus-ring font-semibold text-[#1C1917]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Position Type</label>
                <select
                  value={form.job_type}
                  onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus-ring font-semibold text-[#1C1917]"
                >
                  <option value="Internship">Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Hub Location</label>
                <input
                  type="text"
                  required
                  value={form.location_name}
                  onChange={(e) => setForm({ ...form, location_name: e.target.value })}
                  placeholder="e.g. Savar, Banani, Mohakhali"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus-ring font-semibold text-[#1C1917]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#78716C]">Role Overview & Description</label>
                <button
                  type="button"
                  onClick={handleAiExtract}
                  disabled={aiExtracting}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
                  {aiExtracting ? 'Analyzing JD with AI...' : 'Auto-Extract Skills With AI'}
                </button>
              </div>
              <textarea
                rows={4}
                required
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe the opportunity, engineering team, and stack..."
                className="w-full p-3 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus-ring text-[#1C1917] leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1">Key Responsibilities (One per line)</label>
              <textarea
                rows={3}
                value={form.responsibilities}
                onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                placeholder="• Build backend microservices with PostgreSQL&#10;• Write clean, maintainable Python code"
                className="w-full p-3 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus-ring text-[#1C1917]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Salary Min (BDT)</label>
                <input
                  type="number"
                  value={form.salary_min}
                  onChange={(e) => setForm({ ...form, salary_min: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] font-semibold text-[#1C1917] n"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Salary Max (BDT)</label>
                <input
                  type="number"
                  value={form.salary_max}
                  onChange={(e) => setForm({ ...form, salary_max: parseInt(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] font-semibold text-[#1C1917] n"
                />
              </div>
            </div>
          </div>

          {/* Technical Skills Setup */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
            <h2 className="text-base font-bold text-[#1C1917]">Required vs. Preferred Skills</h2>

            {/* Required Skills */}
            <div>
              <label className="block text-xs font-semibold text-[#78716C] mb-1.5">
                Required Technical Skills (30% Match Weight)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newReqSkill}
                  onChange={(e) => setNewReqSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddReqSkill(); }}}
                  placeholder="e.g. Python, SQL..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-[#1C1917] focus-ring"
                />
                <button
                  type="button"
                  onClick={handleAddReqSkill}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {form.required_skills.map((sk) => (
                  <span key={sk} className="badge-pill badge-salary-verified inline-flex items-center gap-1.5">
                    {sk}
                    <button type="button" onClick={() => handleRemoveReqSkill(sk)} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            <div className="pt-3 border-t border-[#E7E5E4]">
              <label className="block text-xs font-semibold text-[#78716C] mb-1.5">
                Preferred / Nice-to-Have Skills
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPrefSkill}
                  onChange={(e) => setNewPrefSkill(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddPrefSkill(); }}}
                  placeholder="e.g. Docker, Redis..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-[#1C1917] focus-ring"
                />
                <button
                  type="button"
                  onClick={handleAddPrefSkill}
                  className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {form.preferred_skills.map((sk) => (
                  <span key={sk} className="badge-pill badge-job-type inline-flex items-center gap-1.5">
                    {sk}
                    <button type="button" onClick={() => handleRemovePrefSkill(sk)} className="hover:opacity-75">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Right Info & Publish Action (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Predicted Talent Reach Card */}
          <div className="bg-[#CCFBF1] border border-[#99F6E4] rounded-2xl p-6 shadow-sm space-y-3">
            <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider">Talent Pool Reach</span>
            
            <div className="n text-3xl font-extrabold text-[#1C1917]">
              ~42 Candidates
            </div>

            <p className="text-xs text-[#0F766E] leading-relaxed">
              Based on DIU, BRAC, and NSU graduate profiles matching your required skills in the Savar and Dhaka corridors.
            </p>
          </div>

          {/* Publish Button */}
          <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-3">
            <button
              type="submit"
              disabled={submitting}
              className="w-full min-h-[48px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-all shadow-[0_4px_12px_rgba(249,115,22,0.25)] flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Publishing...' : 'Publish Job Opportunity'}
            </button>

            <p className="text-[11px] text-[#78716C] text-center">
              Instant alerts will be dispatched to students with ≥ 70% match within the alert radius.
            </p>
          </div>

        </div>

      </form>

    </div>
  );
}
