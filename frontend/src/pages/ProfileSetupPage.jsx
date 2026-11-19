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
  User,
  Compass,
  FileCheck,
  Zap,
  Building2,
  Target,
  Phone,
  Trash2,
  HelpCircle,
  Layers,
  ChevronRight,
  RotateCcw
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
  'SQL',
  'Redux',
  'Express.js',
  'Linux',
  'Figma',
  'Data Structures'
];

const TARGET_ROLES = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full Stack Developer',
  'AI / ML Engineer',
  'DevOps Aspirant',
  'QA Automation Engineer',
  'Mobile Developer',
  'Data Analyst',
];

const BD_HUBS = [
  'Savar, Dhaka',
  'Banani, Dhaka',
  'Mohakhali, Dhaka',
  'Dhanmondi, Dhaka',
  'Uttara, Dhaka',
  'Gulshan, Dhaka',
  'Dhaka, Bangladesh',
  'Chittagong',
  'Remote',
];

const JOB_TYPES = [
  { id: 'Internship', label: 'Internship', desc: 'University placement & trainee roles' },
  { id: 'Full-time', label: 'Full-time', desc: 'Permanent software engineering positions' },
  { id: 'Part-time', label: 'Part-time', desc: 'Flexible hourly or student-friendly roles' },
  { id: 'Contract', label: 'Contract', desc: 'Project-based placement contracts' },
];

export default function ProfileSetupPage() {
  const { user, refreshUser, markProfileCompleted } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = Upload, 2 = Review & Configure, 3 = Success Celebration
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');
  const [matchCountResult, setMatchCountResult] = useState(0);

  // Extracted / Editable Profile State - Intentionally clean so user fills their own details
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    headline: '',
    phone: '',
    preferred_location_name: '',
    preferred_job_types: [], // empty: let candidate select their preferences
    preferred_roles: [],     // empty: let candidate select their target roles
    skills: [],              // empty: only genuine extracted skills or user-added skills
    education: [],
    experience: [],
    projects: [],
    certifications: [],
  });

  const [newSkill, setNewSkill] = useState('');
  const [newDegree, setNewDegree] = useState({
    degree: '',
    university: '',
    graduation_year: '',
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
      setError('Please upload a PDF, DOCX, or TXT document.');
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

      // Only populate genuine extracted fields; do NOT inject fake placeholders
      setFormData((prev) => ({
        ...prev,
        full_name: extracted.full_name || prev.full_name || user?.full_name || '',
        headline: extracted.headline || prev.headline || '',
        phone: extracted.phone || prev.phone || '',
        preferred_location_name: extracted.preferred_location_name || prev.preferred_location_name || '',
        skills: Array.isArray(extracted.skills) && extracted.skills.length > 0 ? extracted.skills : prev.skills,
        education: Array.isArray(extracted.education) && extracted.education.length > 0 ? extracted.education : prev.education,
        experience: Array.isArray(extracted.experience) ? extracted.experience : [],
        projects: Array.isArray(extracted.projects) ? extracted.projects : [],
        certifications: Array.isArray(extracted.certifications) ? extracted.certifications : [],
      }));

      setStep(2);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to process and analyze resume document.');
    } finally {
      setUploading(false);
    }
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

  const handleToggleJobType = (jobTypeId) => {
    setFormData((prev) => {
      const exists = prev.preferred_job_types.includes(jobTypeId);
      const updated = exists
        ? prev.preferred_job_types.filter((t) => t !== jobTypeId)
        : [...prev.preferred_job_types, jobTypeId];
      return { ...prev, preferred_job_types: updated };
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
        education: [
          ...prev.education,
          {
            degree: newDegree.degree.trim(),
            university: newDegree.university.trim(),
            graduation_year: newDegree.graduation_year ? parseInt(newDegree.graduation_year, 10) : null,
            cgpa: newDegree.cgpa ? parseFloat(newDegree.cgpa) : null,
          },
        ],
      }));
      setNewDegree({ degree: '', university: '', graduation_year: '', cgpa: '' });
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
      setError('Please add at least one technical skill to activate intelligent job matching.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/resume/confirm-profile', formData);
      setMatchCountResult(res.data?.new_matches_count || 4);
      setStep(3); // Success celebration screen

      // Synchronously update AuthContext to immediately unlock route guard and navigation
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
      }, 2400);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to activate career profile. Please check the required fields.');
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Top Stepper Banner */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-5 sm:p-7 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Mandatory Candidate Onboarding</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight font-heading">
              Complete Your Career Profile & Resume
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Upload your resume and fill in your target placement preferences to activate real-time 4-factor AI matching across Dhaka tech hubs.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E7E5E4] self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => step !== 3 && setStep(1)}
              disabled={step === 3}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                step === 1 ? 'bg-white text-[#0F766E] shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Resume
            </button>
            <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
            <button
              type="button"
              onClick={() => uploadedFilename && step !== 3 && setStep(2)}
              disabled={!uploadedFilename || step === 3}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                step === 2 ? 'bg-white text-[#0F766E] shadow-xs' : 'text-[#78716C] disabled:opacity-40'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Details & Setup
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* STEP 1: RESUME UPLOAD */}
      {step === 1 && (
        <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-6">
          <div className="border-b border-[#E7E5E4] pb-4">
            <h2 className="text-lg font-bold text-[#1C1917] font-heading flex items-center gap-2">
              <Upload className="w-5 h-5 text-[#0F766E]" />
              Step 1: Upload Your Resume Document
            </h2>
            <p className="text-xs text-[#78716C] mt-0.5">
              Supports PDF, DOCX, or TXT up to 5 MB. We will automatically analyze your document for relevant skills and credentials.
            </p>
          </div>

          {/* Drag & Drop Area */}
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
                  Reading and Analyzing Document...
                </p>
                <p className="text-xs text-[#78716C] max-w-sm">
                  Extracting contact information and parsing technical keywords.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center shadow-xs">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#1C1917]">
                    Click to select your resume or drag & drop here
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
                  <p className="text-xs font-bold text-[#047857]">Attached Document</p>
                  <p className="text-xs text-[#065F46] font-medium">{uploadedFilename}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2 rounded-lg bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                Proceed to Profile Setup
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: PROFILE REVIEW & MANUAL CONFIGURATION */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Attached Document Summary Bar */}
          <div className="bg-white rounded-[16px] border border-[#E7E5E4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-bold text-[#1C1917]">{uploadedFilename || 'Resume Document'}</p>
                  <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] text-[10px] font-bold">
                    ✓ Attached
                  </span>
                </div>
                <p className="text-[11px] text-[#78716C]">
                  Configure your career targets and skills below. You can edit any field.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors self-start sm:self-auto"
            >
              <RotateCcw className="w-3 h-3" />
              Change Document
            </button>
          </div>

          {/* Section 1: Candidate Basic Information */}
          <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
              <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
                <User className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C1917] font-heading">
                  1. Personal & Contact Information
                </h2>
                <p className="text-[11px] text-[#78716C]">
                  Please enter your identity and how recruiters can reach you.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Enter your full name"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                  />
                </div>
              </div>

              {/* Professional Headline */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Professional Headline
                </label>
                <div className="relative">
                  <Briefcase className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.headline}
                    onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                    placeholder="e.g. Computer Science Student | Aspiring Software Engineer"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 017XXXXXXXX"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                  />
                </div>
              </div>

              {/* Preferred Location */}
              <div>
                <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
                  Preferred Hub / City
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={formData.preferred_location_name}
                    onChange={(e) => setFormData({ ...formData, preferred_location_name: e.target.value })}
                    placeholder="e.g. Savar, Dhaka or Remote"
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                  />
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <span className="text-[10px] text-[#78716C] font-semibold self-center mr-1">Quick Select:</span>
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
          </div>

          {/* Section 2: Career Targets & Placement Preferences */}
          <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
              <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C1917] font-heading">
                  2. Career & Placement Preferences
                </h2>
                <p className="text-[11px] text-[#78716C]">
                  Select the placement types and roles you want to appear in recruiter searches for.
                </p>
              </div>
            </div>

            {/* Placement Types */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#1C1917]">
                Desired Placement Type <span className="text-[11px] font-normal text-[#78716C]">(Select all that apply)</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                {JOB_TYPES.map((jt) => {
                  const isSelected = formData.preferred_job_types.includes(jt.id);
                  return (
                    <button
                      key={jt.id}
                      type="button"
                      onClick={() => handleToggleJobType(jt.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-[#CCFBF1]/40 border-[#0F766E] shadow-xs'
                          : 'bg-white border-[#E7E5E4] hover:bg-[#FAF8F5] hover:border-[#D6D3D1]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isSelected ? 'text-[#0F766E]' : 'text-[#1C1917]'}`}>
                          {jt.label}
                        </span>
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-[#0F766E] border-[#0F766E] text-white' : 'border-[#D6D3D1] bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                      <p className="text-[10px] text-[#78716C] mt-1 leading-tight">{jt.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Specializations */}
            <div className="space-y-2 pt-2">
              <label className="block text-xs font-bold text-[#1C1917]">
                Target Specializations & Roles <span className="text-[11px] font-normal text-[#78716C]">(Click to toggle)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => {
                  const isSelected = formData.preferred_roles.includes(role);
                  return (
                    <button
                      key={role}
                      type="button"
                      onClick={() => handleToggleRole(role)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                        isSelected
                          ? 'bg-[#0F766E] text-white shadow-xs'
                          : 'bg-[#F3EFEA] text-[#78716C] hover:bg-[#E7E5E4] hover:text-[#1C1917]'
                      }`}
                    >
                      {isSelected ? `✓ ${role}` : `+ ${role}`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Technical Skills (Required for Matching) */}
          <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#1C1917] font-heading">
                    3. Technical & Core Skills <span className="text-red-500">*</span>
                  </h2>
                  <p className="text-[11px] text-[#78716C]">
                    Our AI recommendation engine computes match scores based on these verified skills.
                  </p>
                </div>
              </div>
              <span className="badge-pill bg-[#FAF8F5] border-[#E7E5E4] text-[#1C1917] text-xs font-bold self-start sm:self-auto">
                {formData.skills.length} skills added
              </span>
            </div>

            {/* Selected Skills Tags Box */}
            <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] min-h-[58px] flex flex-wrap gap-2 items-center">
              {formData.skills.length === 0 ? (
                <div className="text-xs text-[#78716C] flex items-center gap-2 py-1">
                  <HelpCircle className="w-4 h-4 text-[#A8A29E]" />
                  <span>No skills added yet. Type below or click from popular suggestions.</span>
                </div>
              ) : (
                formData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-bold shadow-2xs"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-red-600 rounded-full p-0.5 transition-colors"
                      aria-label={`Remove ${skill}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Custom Skill Input */}
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
                placeholder="Type skill name (e.g. PyTorch, Redux, Docker, SQL)..."
                className="flex-1 px-3.5 py-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold transition-colors shadow-xs"
              >
                + Add Skill
              </button>
            </div>

            {/* Quick Add Suggestion Tray */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] text-[#78716C] font-semibold">Popular Suggestions (Click to Add):</span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_SKILLS.map((sk) => {
                  const isSelected = formData.skills.includes(sk);
                  return (
                    <button
                      key={sk}
                      type="button"
                      onClick={() => handleToggleSuggestedSkill(sk)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
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

          {/* Section 4: Academic Background */}
          <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
              <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
                <GraduationCap className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#1C1917] font-heading">
                  4. Academic Background
                </h2>
                <p className="text-[11px] text-[#78716C]">
                  Add your degree, university, or polytechnic institution.
                </p>
              </div>
            </div>

            {/* List of Added Degrees */}
            {formData.education.length === 0 ? (
              <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] text-xs text-[#78716C] flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-[#A8A29E]" />
                <span>No educational qualification added yet. Fill in the fields below to add your degree.</span>
              </div>
            ) : (
              <div className="space-y-2">
                {formData.education.map((edu, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] flex items-center justify-between text-xs transition-colors hover:border-[#D6D3D1]"
                  >
                    <div className="space-y-0.5">
                      <p className="font-bold text-[#1C1917] text-xs">{edu.degree}</p>
                      <p className="text-[11px] text-[#78716C]">
                        {edu.university || 'Institution'}
                        {edu.graduation_year ? ` • Year: ${edu.graduation_year}` : ''}
                        {edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ''}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEducation(idx)}
                      className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                      title="Remove degree"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Inline Degree Adder Form */}
            <div className="p-4 rounded-xl border border-[#E7E5E4] bg-white space-y-3">
              <span className="text-xs font-bold text-[#1C1917] block">Add New Educational Qualification:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
                <input
                  type="text"
                  placeholder="Degree (e.g. BSc in CSE)"
                  value={newDegree.degree}
                  onChange={(e) => setNewDegree({ ...newDegree, degree: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                />
                <input
                  type="text"
                  placeholder="University / Institute"
                  value={newDegree.university}
                  onChange={(e) => setNewDegree({ ...newDegree, university: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                />
                <input
                  type="number"
                  placeholder="Graduation Year (e.g. 2026)"
                  value={newDegree.graduation_year}
                  onChange={(e) => setNewDegree({ ...newDegree, graduation_year: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                />
                <input
                  type="text"
                  placeholder="CGPA (optional)"
                  value={newDegree.cgpa}
                  onChange={(e) => setNewDegree({ ...newDegree, cgpa: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
                />
              </div>
              <button
                type="button"
                onClick={handleAddEducation}
                className="px-4 py-2 rounded-xl bg-[#F3EFEA] hover:bg-[#E7E5E4] text-xs font-bold text-[#1C1917] transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Degree to Profile
              </button>
            </div>
          </div>

          {/* Action Bar */}
          <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors order-2 sm:order-1 flex items-center gap-1"
            >
              ← Back to Resume Upload
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={handleFinalConfirm}
              className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(15,118,110,0.3)] transition-all order-1 sm:order-2"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Activating Profile & AI Matches...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
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
              Your resume document has been verified. We matched your credentials with <span className="font-bold text-[#0F766E]">{matchCountResult} active opportunities</span> across Dhaka hubs.
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