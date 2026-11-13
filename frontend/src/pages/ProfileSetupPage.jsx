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
];

export default function ProfileSetupPage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1); // 1 = Upload, 2 = Review & Confirm
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFilename, setUploadedFilename] = useState('');

  // Extracted / Editable Profile State
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    headline: 'Aspiring Software Engineer',
    phone: '',
    preferred_location_name: 'Dhaka, Bangladesh',
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
      await api.post('/resume/confirm-profile', formData);
      await refreshUser();
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to confirm profile setup.');
    } finally {
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
              To ensure fairness and accurate 4-factor AI matching, job seekers must upload their resume and review their profile before accessing job search and application features.
            </p>
          </div>

          {/* Stepper Pill Indicator */}
          <div className="flex items-center gap-2 self-start sm:self-auto bg-[#F3EFEA] p-1.5 rounded-xl border border-[#E7E5E4] text-xs font-bold">
            <button
              onClick={() => setStep(1)}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                step === 1 ? 'bg-white text-[#0F766E] shadow-xs' : 'text-[#78716C] hover:text-[#1C1917]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              1. Resume
            </button>
            <button
              onClick={() => uploadedFilename && setStep(2)}
              disabled={!uploadedFilename}
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
          <div className="text-center max-w-md mx-auto space-y-2">
            <h2 className="text-lg font-bold text-[#1C1917] font-heading">
              Upload Your Resume Document
            </h2>
            <p className="text-xs text-[#78716C]">
              Supports PDF, DOCX, or TXT (up to 5 MB). Our parser extracts your skills, education, and experience automatically.
            </p>
          </div>

          {/* Dropzone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-[16px] p-8 sm:p-12 text-center cursor-pointer transition-all ${
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
              <div className="space-y-3 py-4 flex flex-col items-center">
                <RefreshCw className="w-8 h-8 text-[#0F766E] animate-spin" />
                <p className="text-sm font-bold text-[#1C1917]">
                  Extracting Profile with AI Engine...
                </p>
                <p className="text-xs text-[#78716C]">
                  Vectorizing skills, degrees, and candidate timeline.
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
            <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-[#047857]" />
                <div>
                  <p className="text-xs font-bold text-[#047857]">Attached Resume</p>
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
                Review & Confirm AI Extracted Profile
              </h2>
              <p className="text-xs text-[#78716C] mt-0.5">
                Verify your extracted technical background before unlocking placement matches.
              </p>
            </div>
            {uploadedFilename && (
              <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] text-xs">
                File: {uploadedFilename}
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
                placeholder="e.g. Savar, Dhaka or Dhanmondi, Dhaka"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E7E5E4] bg-[#FAF8F5] text-xs font-semibold text-[#1C1917] focus-ring"
              />
            </div>
          </div>

          {/* Technical Skills Section */}
          <div className="space-y-3 pt-3 border-t border-[#E7E5E4]">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">
                Technical Skills <span className="text-red-500">*</span> (Used for AI Match Score)
              </label>
              <span className="text-[11px] text-[#78716C] font-semibold">
                {formData.skills.length} skills selected
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
    </div>
  );
}
