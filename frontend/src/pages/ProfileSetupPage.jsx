import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  MapPin,
  Briefcase,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  Check,
  RefreshCw,
  Clock,
  User,
  Compass,
  FileCheck,
  Zap,
  Building2,
  Target
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const SUGGESTED_SKILLS = [
  'Python',
  'FastAPI',
  'React',
  'PostgreSQL',
  'Docker',
  'Git',
  'JavaScript',
  'TypeScript',
  'Tailwind CSS',
  'Node.js',
  'MongoDB',
  'AWS',
  'PyTorch',
  'Scikit-Learn',
  'REST APIs',
  'Next.js',
];

const TARGET_ROLES = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'AI / ML Engineer',
  'DevOps Aspirant',
  'QA Automation Engineer',
];

const BD_HUBS = [
  'Savar, Dhaka',
  'Banani, Dhaka',
  'Mohakhali, Dhaka',
  'Dhanmondi, Dhaka',
  'Uttara, Dhaka',
  'Gulshan, Dhaka',
];

const JOB_TYPES = ['Internship', 'Full-time', 'Part-time'];

export default function ProfileSetupPage() {
  const { user, refreshUser, markProfileCompleted } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = Upload, 2 = Review & Confirm, 3 = Success Celebration
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [matchCountResult, setMatchCountResult] = useState(0);

  // Extracted / Editable Profile State
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    headline: 'Aspiring Software Engineer',
    phone: '',
    preferred_location_name: 'Savar, Dhaka',
    preferred_job_types: ['Internship', 'Full-time'],
    preferred_roles: ['Software Engineer', 'Backend Developer'],
    skills: [],
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newDegree, setNewDegree] = useState({
    degree: '',
    university: '',
    graduation_year: 2026,
    cgpa: '',
  });

  // Check if resume was previously uploaded
  useEffect(() => {
    async function checkStatus() {
      try {
        const res = await api.get('/resume/status');
        if (res.data?.has_resume) {
          setUploadedFilename(res.data.resume_filename || 'Uploaded Resume');
          setStep(2);
        }
      } catch (err) {
        console.error('Error checking resume status:', err);
      }
    }
    checkStatus();
  }, []);

  const handleFileUpload = async (file) => {
    if (!file) return;

    const lowerName = file.name.toLowerCase();
    if (!lowerName.endsWith('.pdf') && !lowerName.endsWith('.docx') && !lowerName.endsWith('.txt')) {
      setError('Please upload a PDF, DOCX, or TXT file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds the 5 MB limit.');
      return;
    }

    setError('');
    setUploading(true);

    try {
      const data = new FormData();
      data.append('file', file);

      const res = await api.post('/resume/parse-upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setUploadedFilename(file.name);
      const extracted = res.data?.extracted_profile || {};

      setFormData((prev) => ({
        ...prev,
        full_name: extracted.full_name || prev.full_name || user?.full_name || '',
        headline: extracted.headline || prev.headline || 'Software Engineer',
        phone: extracted.phone || prev.phone || '',
        preferred_location_name: extracted.preferred_location_name || prev.preferred_location_name,
        skills: Array.isArray(extracted.skills) && extracted.skills.length > 0 ? extracted.skills : prev.skills,
        education: Array.isArray(extracted.education) && extracted.education.length > 0 ? extracted.education : prev.education,
        experience: Array.isArray(extracted.experience) ? extracted.experience : [],
        projects: Array.isArray(extracted.projects) ? extracted.projects : [],
        certifications: Array.isArray(extracted.certifications) ? extracted.certifications : [],
      }));

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload and extract resume.');
    } finally {
      setUploading(false);
    }
  };

  const handleDemoFill = async () => {
    setError('');
    setUploading(true);
    // Create a demo text blob representing a DIU CS graduate resume
    const demoResumeText = `
Sarah Rahman
Software Engineering Graduate
Email: ${user?.email || 'sarah.rahman@diu.edu.bd'}
Phone: +880 1712-345678
Location: Savar, Dhaka

Objective:
Passionate Software Engineer specializing in backend APIs with FastAPI, PostgreSQL, and reactive React applications.

Skills:
Python, FastAPI, React, PostgreSQL, Docker, Git, Tailwind CSS, REST APIs

Education:
BSc in Software Engineering, Daffodil International University, 2026, CGPA: 3.82

Projects:
- AI Semantic Job Matcher: Built TF-IDF and Haversine distance ranking engine with FastAPI and React.
- E-Commerce Microservices: Implemented JWT-authenticated checkout with PostgreSQL and Redis.
`;
    const blob = new Blob([demoResumeText], { type: 'text/plain' });
    const file = new File([blob], 'Sarah_Rahman_DIU_Resume.txt', { type: 'text/plain' });
    await handleFileUpload(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleAddSkill = () => {
    const trimmed = newSkill.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, trimmed] }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s !== skillToRemove),
    }));
  };

  const handleToggleSuggestedSkill = (skill) => {
    if (formData.skills.includes(skill)) {
      handleRemoveSkill(skill);
    } else {
      setFormData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
  };

  const handleToggleJobType = (jobType) => {
    setFormData((prev) => {
      const exists = prev.preferred_job_types.includes(jobType);
      const updated = exists
        ? prev.preferred_job_types.filter((t) => t !== jobType)
        : [...prev.preferred_job_types, jobType];
      return { ...prev, preferred_job_types: updated.length ? updated : [jobType] };
    });
  };

  const handleToggleRole = (role) => {
    setFormData((prev) => {
      const exists = prev.preferred_roles.includes(role);
      const updated = exists
        ? prev.preferred_roles.filter((r) => r !== role)
        : [...prev.preferred_roles, role];
      return { ...prev, preferred_roles: updated };
    });
  };

  const handleAddEducation = () => {
    if (newDegree.degree.trim() && newDegree.university.trim()) {
      setFormData((prev) => ({
        ...prev,
        education: [...prev.education, { ...newDegree }],
      }));
      setNewDegree({ degree: '', university: '', graduation_year: 2026, cgpa: '' });
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const handleFinalConfirm = async () => {
    setError('');

    if (!uploadedFilename) {
      setError('Please upload your resume document before finalizing your profile.');
      setStep(1);
      return;
    }

    if (!formData.full_name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (formData.skills.length === 0) {
      setError('Please add at least one technical skill to activate job matching.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/resume/confirm-profile', formData);
      setMatchCountResult(res.data?.new_matches_count || 3);
      setStep(3); // Success celebration screen

      // Synchronously mark profile completed in AuthContext to immediately unlock navigation
      if (typeof markProfileCompleted === 'function') {
        markProfileCompleted({
          ...formData,
          profile_completed: true,
          resume_url: res.data?.resume_url || '/uploads/uploaded_resume.pdf',
          resume_filename: uploadedFilename,
        });
      }

      await refreshUser();
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to confirm profile setup.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Onboarding Header Banner */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="badge-pill bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[11px] font-bold inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Mandatory Setup • Candidate Profile & Resume Required
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight font-heading">
              Setup Your Career Profile & Upload Resume
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] max-w-2xl leading-relaxed">
              Upload your resume to activate our 4-factor AI matching engine. Your profile will be automatically matched against open roles in Savar, Banani, Mohakhali, and across Dhaka tech hubs.
            </p>
          </div>

          {/* Stepper Pill Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F3EFEA] p-1.5 rounded-xl border border-[#E7E5E4] text-xs font-bold">
            <button
              onClick={() => step !== 3 && setStep(1)}
              disabled={step === 3}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                step === 1 ? 'bg-white text-[#0F766E] shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Resume
            </button>
            <button
              onClick={() => uploadedFilename && step !== 3 && setStep(2)}
              disabled={!uploadedFilename || step === 3}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                step === 2 ? 'bg-white text-[#0F766E] shadow-xs' : 'text-[#78716C] disabled:opacity-40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Review & Activate
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* STEP 1: RESUME UPLOAD */}
      {step === 1 && (
        <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1C1917] font-heading flex items-center gap-2">
                <Upload className="w-5 h-5 text-[#0F766E]" />
                Upload Your Resume Document
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Supports PDF, DOCX, or TXT up to 5 MB. Our AI extracts your credentials automatically.
              </p>
            </div>

            {/* Quick Demo Resume Option */}
            <button
              type="button"
              onClick={handleDemoFill}
              disabled={uploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#99F6E4] bg-[#CCFBF1] text-[#0F766E] hover:bg-[#99F6E4] text-xs font-bold transition-colors shadow-xs"
            >
              <Zap className="w-3.5 h-3.5 text-[#0F766E]" />
              Use Sample CS Resume
            </button>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[16px] p-8 sm:p-14 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-[#0F766E] bg-[#CCFBF1]/20 scale-[1.01]'
                : 'border-[#E7E5E4] bg-[#FAF8F5] hover:bg-[#F3EFEA] hover:border-[#0F766E]'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />

            {uploading ? (
              <div className="space-y-3 py-6 flex flex-col items-center">
                <RefreshCw className="w-9 h-9 text-[#0F766E] animate-spin" />
                <p className="text-sm font-bold text-[#1C1917]">
                  Analyzing Resume with AI Engine...
                </p>
                <p className="text-xs text-[#78716C] max-w-sm">
                  Extracting programming languages, degrees, projects, and geographic coordinates.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1917]">
                    Click to select resume or drag and drop here
                  </p>
                  <p className="text-xs text-[#78716C] mt-1">
                    PDF, DOCX, or TXT • Maximum file size 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          {uploadedFilename && (
            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] text-[#047857] flex items-center justify-center flex-shrink-0">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-[#047857]">Attached Resume Document</p>
                  <p className="text-xs text-[#065F46] font-medium">{uploadedFilename}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
              >
                Proceed to Review
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PROFILE REVIEW & ACTIVATION */}
      {step === 2 && (
        <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E7E5E4] pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1C1917] font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
                Review & Confirm Profile Details
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Verify your extracted technical background and set your career targets.
              </p>
            </div>
            {uploadedFilename && (
              <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] text-xs">
                Attached: {uploadedFilename}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="e.g. Sarah Rahman"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] focus-ring"
              />
            </div>

            {/* Headline */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                placeholder="e.g. Junior Full-Stack Developer | DIU CSE"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] focus-ring"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+880 1712-XXXXXX"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] focus-ring"
              />
            </div>

            {/* Preferred Location */}
            <div>
              <label className="block text-xs font-bold text-[#1C1917] mb-1">
                Preferred Hub / Location
              </label>
              <input
                type="text"
                value={formData.preferred_location_name}
                onChange={(e) => setFormData({ ...formData, preferred_location_name: e.target.value })}
                placeholder="e.g. Savar, Dhaka"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] focus-ring"
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] text-[#78716C] font-semibold self-center">Hubs:</span>
                {BD_HUBS.map((hub) => (
                  <button
                    key={hub}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferred_location_name: hub })}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors ${
                      formData.preferred_location_name === hub
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'bg-[#F3EFEA] text-[#78716C] hover:bg-[#E7E5E4]'
                    }`}
                  >
                    {hub}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Job Types & Preferred Roles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-[#E7E5E4]">
            {/* Preferred Job Types */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1917]">
                Desired Placement Type
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map((jt) => {
                  const isSelected = formData.preferred_job_types.includes(jt);
                  return (
                    <button
                      key={jt}
                      type="button"
                      onClick={() => handleToggleJobType(jt)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-[#F3EFEA] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]'
                      }`}
                    >
                      {isSelected ? `✓ ${jt}` : jt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Roles */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1917]">
                Target Specializations
              </label>
              <div className="flex flex-wrap gap-1.5">
                {TARGET_ROLES.map((r) => {
                  const isSelected = formData.preferred_roles.includes(r);
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleToggleRole(r)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-[#F3EFEA] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]'
                      }`}
                    >
                      {isSelected ? `✓ ${r}` : `+ ${r}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Technical Skills Section */}
          <div className="space-y-3 pt-3 border-t border-[#E7E5E4]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">
                Technical Skills <span className="text-red-500">*</span> (Determines AI Match Score)
              </label>
              <span className="text-[11px] text-[#78716C] font-semibold">
                {formData.skills.length} skills verified
              </span>
            </div>

            {/* Selected Skills Tags */}
            <div className="flex flex-wrap gap-2 p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] min-h-[50px] items-center">
              {formData.skills.length === 0 ? (
                <span className="text-xs text-[#78716C]">
                  No skills added yet. Type below or click suggestions.
                </span>
              ) : (
                formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge-pill bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-bold inline-flex items-center gap-1.5"
                  >
                    {skill}
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-600 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Add Custom Skill */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
                placeholder="Add skill (e.g. PyTorch, Redux, Docker)..."
                className="flex-1 px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3.5 py-1.5 rounded-lg bg-[#F3EFEA] hover:bg-[#E7E5E4] text-xs font-bold text-[#1C1917] transition-colors"
              >
                Add Skill
              </button>
            </div>

            {/* Suggested Skill Pills */}
            <div className="space-y-1">
              <span className="text-[11px] text-[#78716C] font-semibold">Quick Add:</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.map((sk) => {
                  const isSelected = formData.skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleToggleSuggestedSkill(sk)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors ${
                        isSelected
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-[#F3EFEA] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]'
                      }`}
                    >
                      {isSelected ? `✓ ${sk}` : `+ ${sk}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Education Section */}
          <div className="space-y-3 pt-3 border-t border-[#E7E5E4]">
            <label className="text-xs font-bold text-[#1C1917]">
              Academic Background
            </label>

            {formData.education.map((edu, idx) => (
              <div
                key={idx}
                className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-[#1C1917]">{edu.degree}</p>
                  <p className="text-[11px] text-[#78716C]">
                    {edu.university} • Graduating {edu.graduation_year} {edu.cgpa && `• CGPA: ${edu.cgpa}`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="text-stone-400 hover:text-red-500 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
              <input
                type="text"
                placeholder="Degree (e.g. BSc in CSE)"
                value={newDegree.degree}
                onChange={(e) => setNewDegree({ ...newDegree, degree: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring"
              />
              <input
                type="text"
                placeholder="University / Institute"
                value={newDegree.university}
                onChange={(e) => setNewDegree({ ...newDegree, university: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring"
              />
              <input
                type="number"
                placeholder="Year"
                value={newDegree.graduation_year}
                onChange={(e) => setNewDegree({ ...newDegree, graduation_year: e.target.value })}
                className="px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring"
              />
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-3 py-1.5 rounded-lg bg-[#F3EFEA] hover:bg-[#E7E5E4] text-xs font-bold text-[#1C1917] transition-colors"
              >
                + Add Degree
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-[#E7E5E4] flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors order-2 sm:order-1"
            >
              ← Replace / Re-upload Resume
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalConfirm}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(15,118,110,0.25)] transition-all order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Activating Profile & Matching...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Save & Activate Career Profile
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CELEBRATION / ACTIVATION TRANSITION */}
      {step === 3 && (
        <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-10 sm:p-14 text-center shadow-[0_4px_24px_-4px_rgba(15,118,110,0.12)] space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#CCFBF1] text-[#0F766E] border-2 border-[#99F6E4] flex items-center justify-center shadow-sm">
            <Check className="w-8 h-8 text-[#0F766E]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
              Profile Setup Complete!
            </h2>
            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Your resume has been verified and vectorized. We matched your credentials with <span className="font-bold text-[#0F766E]">{matchCountResult} top opportunities</span> across Dhaka hubs.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E7E5E4] text-xs font-semibold text-[#1C1917]">
            <RefreshCw className="w-3.5 h-3.5 text-[#0F766E] animate-spin" />
            <span>Redirecting to your personalized Career Dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
}
