import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Sparkles, X, Send, Eye, Wand2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

export default function PostJobPage() {
  const { user } = useAuth();
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
  const [submitting, setSubmitting] = useState(false);
  const [newReqSkill, setNewReqSkill] = useState('');
  const [newPrefSkill, setNewPrefSkill] = useState('');
  const [activePreviewTab, setActivePreviewTab] = useState('form'); // 'form' | 'preview'

  if (user && user.role === 'JOB_SEEKER') {
    return <Navigate to="/" replace />;
  }

  // Pre-configured role templates for instant autofill
  const roleTemplates = [
    {
      name: 'Junior Backend (FastAPI)',
      title: 'Junior Backend Engineer (FastAPI / Python)',
      job_type: 'Full-time',
      location_name: 'Savar, Dhaka',
      salary_min: 35000,
      salary_max: 50000,
      description: 'We are seeking a junior backend engineer to build scalable REST and async services using FastAPI, PostgreSQL, and Redis. You will collaborate directly with our senior cloud architects.',
      responsibilities: '• Design and implement asynchronous endpoints in FastAPI\n• Write optimized PostgreSQL queries and SQLAlchemy models\n• Participate in CI/CD pipeline automation and peer code reviews',
      required_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Git'],
      preferred_skills: ['Docker', 'Redis', 'AWS']
    },
    {
      name: 'Frontend React 19 Specialist',
      title: 'Frontend React Engineer (Tailwind / Next.js)',
      job_type: 'Full-time',
      location_name: 'Banani, Dhaka',
      salary_min: 40000,
      salary_max: 55000,
      description: 'Join our product engineering squad building responsive, accessible web interfaces using React 19, Tailwind CSS, and state-of-the-art client rendering patterns.',
      responsibilities: '• Translate UX prototypes into high-performance React components\n• Maintain strict accessibility standards and responsive layouts\n• Integrate backend REST and WebSocket APIs cleanly',
      required_skills: ['React', 'JavaScript', 'Tailwind CSS', 'Git'],
      preferred_skills: ['TypeScript', 'Next.js', 'Redux Toolkit']
    },
    {
      name: 'Full-Stack AI Intern',
      title: 'Full-Stack AI Engineering Intern',
      job_type: 'Internship',
      location_name: 'Mohakhali, Dhaka',
      salary_min: 22000,
      salary_max: 30000,
      description: 'Great opportunity for university graduates and final-year students. Learn to build modern full-stack web applications wired with LLM embeddings and recommendation engines.',
      responsibilities: '• Assist in developing full-stack prototype features\n• Experiment with OpenAI and Gemini API integrations\n• Write clean unit tests and technical documentation',
      required_skills: ['Python', 'React', 'REST APIs'],
      preferred_skills: ['PostgreSQL', 'LangChain', 'Docker']
    }
  ];

  const popularSkills = [
    'Python', 'FastAPI', 'React', 'PostgreSQL', 'Docker', 'Tailwind CSS', 
    'TypeScript', 'Next.js', 'Redis', 'AWS', 'Git', 'Node.js', 'MongoDB', 'GraphQL'
  ];

  const applyTemplate = (tpl) => {
    setForm((prev) => ({
      ...prev,
      title: tpl.title,
      job_type: tpl.job_type,
      location_name: tpl.location_name,
      salary_min: tpl.salary_min,
      salary_max: tpl.salary_max,
      description: tpl.description,
      responsibilities: tpl.responsibilities,
      required_skills: tpl.required_skills,
      preferred_skills: tpl.preferred_skills
    }));
  };

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
    } catch {
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

  const handleQuickAddReqSkill = (skill) => {
    if (!form.required_skills.includes(skill)) {
      setForm({ ...form, required_skills: [...form.required_skills, skill] });
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

  // Mock object for live student card preview
  const previewJob = {
    id: 9999,
    title: form.title || 'Job Title Preview',
    company: { name: user?.company_name || 'Your Company' },
    job_type: form.job_type,
    location_name: form.location_name,
    is_remote: form.is_remote,
    salary_min: form.salary_min,
    salary_max: form.salary_max,
    salary_currency: form.salary_currency,
    matched_skills: form.required_skills,
    missing_skills: form.preferred_skills,
    match_score: 92,
    distance_km: 2.4
  };

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-8 space-y-7">
      
      {/* Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200/80 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E]" />
            Employer Placement Creation Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight font-heading">
            Post New Engineering Opportunity
          </h1>
          <p className="text-sm text-[#78716C] mt-1">
            Our AI parsing engine will automatically detect required skills, predict graduate reach, and alert matching students.
          </p>
        </div>

        {/* Form vs. Preview Toggle */}
        <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActivePreviewTab('form')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activePreviewTab === 'form' ? 'bg-white text-[#0F766E] shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            Job Editor
          </button>
          <button
            type="button"
            onClick={() => setActivePreviewTab('preview')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activePreviewTab === 'preview' ? 'bg-white text-[#0F766E] shadow-2xs' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Student Preview</span>
          </button>
        </div>
      </div>

      {/* ONE-CLICK ROLE TEMPLATES BAR */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E5E4] shadow-2xs space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#1C1917]">
          <Wand2 className="w-4 h-4 text-[#F97316]" />
          <span>Quick Autofill Templates (1-Click):</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {roleTemplates.map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyTemplate(tpl)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100/90 hover:bg-[#CCFBF1] text-stone-700 hover:text-[#0F766E] border border-stone-200 transition-colors cursor-pointer"
            >
              + {tpl.name}
            </button>
          ))}
        </div>
      </div>

      {activePreviewTab === 'preview' ? (
        /* LIVE PREVIEW VIEW */
        <div className="space-y-6">
          <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#1C1917] font-heading">Student Feed Preview</h3>
                <p className="text-xs text-[#78716C]">This is exactly how your listing will appear to qualified candidates in the Explorer feed.</p>
              </div>
              <button
                type="button"
                onClick={() => setActivePreviewTab('form')}
                className="px-3.5 py-1.5 rounded-lg bg-[#0F766E] text-white text-xs font-bold cursor-pointer"
              >
                Return to Editor
              </button>
            </div>
            
            <div className="max-w-md mx-auto pt-4">
              <JobCard job={previewJob} />
            </div>
          </div>
        </div>
      ) : (
        /* FORM VIEW */
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Form (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
              <h2 className="text-base font-bold text-[#1C1917] font-heading">Core Position Details</h2>

              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Junior Backend Engineer (FastAPI / Python)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus:outline-none focus:border-[#0F766E] font-semibold text-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1">Position Type</label>
                  <select
                    value={form.job_type}
                    onChange={(e) => setForm({ ...form, job_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] font-semibold text-[#1C1917] focus:outline-none focus:border-[#0F766E]"
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
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] font-semibold text-[#1C1917] focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div className="flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl border border-stone-200 bg-[#FAF8F5] cursor-pointer text-xs font-semibold text-stone-700">
                    <input
                      type="checkbox"
                      checked={form.is_remote}
                      onChange={(e) => setForm({ ...form, is_remote: e.target.checked })}
                      className="rounded text-[#0F766E]"
                    />
                    <span>Remote-Friendly</span>
                  </label>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#78716C]">Role Overview & Description</label>
                  <button
                    type="button"
                    onClick={handleAiExtract}
                    disabled={aiExtracting}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F766E] hover:underline cursor-pointer"
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
                  className="w-full p-3 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus:outline-none focus:border-[#0F766E] text-[#1C1917] leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#78716C] mb-1">Key Responsibilities (One per line)</label>
                <textarea
                  rows={3}
                  value={form.responsibilities}
                  onChange={(e) => setForm({ ...form, responsibilities: e.target.value })}
                  placeholder="• Build backend microservices with PostgreSQL&#10;• Write clean, maintainable Python code"
                  className="w-full p-3 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] focus:outline-none focus:border-[#0F766E] text-[#1C1917]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1">Salary Min (BDT)</label>
                  <input
                    type="number"
                    value={form.salary_min}
                    onChange={(e) => setForm({ ...form, salary_min: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] font-semibold text-[#1C1917] n focus:outline-none focus:border-[#0F766E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#78716C] mb-1">Salary Max (BDT)</label>
                  <input
                    type="number"
                    value={form.salary_max}
                    onChange={(e) => setForm({ ...form, salary_max: parseInt(e.target.value) || 0 })}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E7E5E4] bg-[#FAF8F5] font-semibold text-[#1C1917] n focus:outline-none focus:border-[#0F766E]"
                  />
                </div>
              </div>
            </div>

            {/* Technical Skills Setup */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-[#1C1917] font-heading">Required vs. Preferred Skills</h2>
                <span className="text-[11px] text-[#78716C]">Used directly by vector matcher</span>
              </div>

              {/* Popular Skills Quick-Add Cloud */}
              <div>
                <label className="block text-[11px] font-semibold text-stone-500 mb-1.5">
                  Popular High-Demand Skills (Tap to add to Required):
                </label>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {popularSkills.map((sk) => (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleQuickAddReqSkill(sk)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all cursor-pointer ${
                        form.required_skills.includes(sk)
                          ? 'bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4] font-bold'
                          : 'bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200'
                      }`}
                    >
                      + {sk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Required Skills */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-[#78716C] mb-1.5">
                  Required Technical Skills (30% Placement Match Weight)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newReqSkill}
                    onChange={(e) => setNewReqSkill(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddReqSkill(); }}}
                    placeholder="e.g. Python, SQL..."
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#0F766E]"
                  />
                  <button
                    type="button"
                    onClick={handleAddReqSkill}
                    className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {form.required_skills.map((sk) => (
                    <span key={sk} className="badge-pill bg-[#CCFBF1] text-[#0F766E] border-[#99F6E4] inline-flex items-center gap-1.5 font-semibold">
                      {sk}
                      <button type="button" onClick={() => handleRemoveReqSkill(sk)} className="hover:opacity-75 cursor-pointer">
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
                    className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-[#1C1917] focus:outline-none focus:border-[#0F766E]"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrefSkill}
                    className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {form.preferred_skills.map((sk) => (
                    <span key={sk} className="badge-pill bg-[#FEF3C7] text-[#B45309] border-[#FDE68A] inline-flex items-center gap-1.5 font-semibold">
                      {sk}
                      <button type="button" onClick={() => handleRemovePrefSkill(sk)} className="hover:opacity-75 cursor-pointer">
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
                Based on DIU, BRAC, and BUET graduate profiles matching your required skills in the Savar and Dhaka corridors.
              </p>
            </div>

            {/* Quick Preview Card */}
            <div className="bg-white p-5 rounded-2xl border border-[#E7E5E4] shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#1C1917]">
                <span>Listing Preview Card:</span>
                <button
                  type="button"
                  onClick={() => setActivePreviewTab('preview')}
                  className="text-[#0F766E] hover:underline"
                >
                  Full Preview →
                </button>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
                <p className="font-bold text-stone-900 line-clamp-1">{form.title || 'Untitled Role'}</p>
                <p className="text-stone-500 mt-0.5">{form.location_name} • {form.job_type}</p>
                <div className="mt-2 flex gap-1 flex-wrap">
                  {form.required_skills.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full text-[10px] bg-[#CCFBF1] text-[#0F766E] font-semibold">{s}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Publish Button */}
            <div className="bg-white rounded-2xl border border-[#E7E5E4] p-6 shadow-[0_2px_6px_rgba(28,25,23,0.03)] space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full min-h-[48px] rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-sm font-bold transition-all shadow-[0_4px_12px_rgba(249,115,22,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
      )}

    </div>
  );
}
