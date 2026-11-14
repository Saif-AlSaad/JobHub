import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Briefcase,
  Phone,
  MapPin,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Trash2,
  Check,
  RefreshCw,
  FileCheck,
  RotateCcw,
  Target,
  ChevronRight,
  HelpCircle,
  Building2,
  Clock,
  Award
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
  'Java',
  'C++',
  'Figma',
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

const PLACEMENT_TYPES = [
  { id: 'Internship', label: 'Internship', desc: 'University placement & trainee roles' },
  { id: 'Full-time', label: 'Full-time', desc: 'Permanent engineering positions' },
  { id: 'Part-time', label: 'Part-time', desc: 'Flexible hours / student-friendly' },
  { id: 'Contract', label: 'Contract', desc: 'Project-based placement contracts' },
];

export default function UpdateProfilePage() {
  const { user, refreshUser, markProfileCompleted } = useAuth();
  const navigate = useNavigate();

  const [resumeInfo, setResumeInfo] = useState({
    filename: user?.profile?.resume_filename || '',
    url: user?.profile?.resume_url || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [celebrationStep, setCelebrationStep] = useState(false);
  const [matchCount, setMatchCount] = useState(0);

  // IN ACCORDANCE WITH REQUIREMENT:
  // Every section starts completely EMPTY, EXCEPT full_name which was used in registration.
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    headline: '',
    phone: '',
    preferred_location_name: '',
    preferred_job_types: [],
    preferred_roles: [],
    skills: [],
    education: [],
    experience: [],
    projects: [],
  });

  // Builders for inline lists
  const [newSkill, setNewSkill] = useState('');
  const [newDegree, setNewDegree] = useState({
    university: '',
    degree: '',
    graduation_year: '',
    cgpa: '',
  });
  const [newExp, setNewExp] = useState({
    title: '',
    company: '',
    duration: '',
    description: '',
  });

  // Fetch resume status on load
  useEffect(() => {
    async function loadResumeStatus() {
      try {
        const res = await api.get('/resume/status');
        if (res.data?.has_resume) {
          setResumeInfo({
            filename: res.data.resume_filename || 'Uploaded Resume',
            url: res.data.resume_url,
          });
        } else {
          // If no resume, prompt them to upload first
          navigate('/resume-upload', { replace: true });
        }
      } catch (err) {
        console.error('Error fetching resume status:', err);
      }
    }
    loadResumeStatus();
  }, [navigate]);

  // Keep full_name in sync with registration user if it loads later
  useEffect(() => {
    if (user?.full_name && !formData.full_name) {
      setFormData((prev) => ({ ...prev, full_name: user.full_name }));
    }
  }, [user]);

  // Skill management
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

  // Education management
  const handleAddEducation = () => {
    if (newDegree.university.trim() && newDegree.degree.trim()) {
      setFormData((prev) => ({
        ...prev,
        education: [
          ...prev.education,
          {
            university: newDegree.university.trim(),
            degree: newDegree.degree.trim(),
            graduation_year: newDegree.graduation_year ? parseInt(newDegree.graduation_year, 10) : null,
            cgpa: newDegree.cgpa ? parseFloat(newDegree.cgpa) : null,
          },
        ],
      }));
      setNewDegree({ university: '', degree: '', graduation_year: '', cgpa: '' });
    }
  };

  const handleRemoveEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  // Experience management
  const handleAddExperience = () => {
    if (newExp.title.trim() && newExp.company.trim()) {
      setFormData((prev) => ({
        ...prev,
        experience: [
          ...prev.experience,
          {
            title: newExp.title.trim(),
            company: newExp.company.trim(),
            duration: newExp.duration.trim(),
            description: newExp.description.trim(),
          },
        ],
      }));
      setNewExp({ title: '', company: '', duration: '', description: '' });
    }
  };

  const handleRemoveExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // Preferences toggles
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

  // Final confirmation
  const handleSaveProfile = async () => {
    setError('');

    if (!formData.full_name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (formData.skills.length === 0 && formData.education.length === 0) {
      setError('Please provide at least one technical skill or educational qualification.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await api.post('/resume/confirm-profile', formData);
      setMatchCount(res.data?.new_matches_count || 4);
      setCelebrationStep(true);

      // Instantly mark profile as completed in AuthContext
      if (typeof markProfileCompleted === 'function') {
        markProfileCompleted({
          ...formData,
          profile_completed: true,
          resume_filename: resumeInfo.filename,
          resume_url: resumeInfo.url,
        });
      }

      await refreshUser();
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2400);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to complete profile setup.');
      setSubmitting(false);
    }
  };

  if (celebrationStep) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 sm:py-24 text-center">
        <div className="bg-white rounded-[24px] border border-[#E7E5E4] p-10 sm:p-14 shadow-[0_4px_24px_-4px_rgba(15,118,110,0.12)] space-y-6 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#CCFBF1] text-[#0F766E] border-2 border-[#99F6E4] flex items-center justify-center shadow-xs">
            <Check className="w-8 h-8 text-[#0F766E]" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h1 className="text-2xl font-black text-[#1C1917] font-heading tracking-tight">
              Profile Setup Complete!
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Your resume and profile are verified. We matched your profile with <span className="font-bold text-[#0F766E]">{matchCount} open opportunities</span> across Dhaka hubs.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FAF8F5] border border-[#E7E5E4] text-xs font-semibold text-[#1C1917]">
            <RefreshCw className="w-3.5 h-3.5 text-[#0F766E] animate-spin" />
            <span>Redirecting to your Dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2 of 2 • Candidate Profile Configuration</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#1C1917] tracking-tight font-heading">
              Update & Complete Your Profile
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              All sections start clean for you to setup. Enter your university, CGPA, address, skills, and experience below.
            </p>
          </div>

          {/* Stepper Indicator */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E7E5E4] self-start sm:self-auto text-xs font-bold">
            <button
              type="button"
              onClick={() => navigate('/resume-upload')}
              className="px-3 py-1.5 rounded-lg text-[#0F766E] hover:bg-white flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              1. Resume
            </button>
            <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
            <span className="px-3 py-1.5 rounded-lg bg-white text-[#0F766E] shadow-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Update Profile
            </span>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Attached Resume Banner */}
      <div className="bg-white rounded-[16px] border border-[#E7E5E4] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center flex-shrink-0">
            <FileCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-bold text-[#1C1917]">{resumeInfo.filename || 'Attached Resume'}</p>
              <span className="badge-pill bg-[#ECFDF5] text-[#047857] border-[#A7F3D0] text-[10px] font-bold">
                ✓ Uploaded
              </span>
            </div>
            <p className="text-[11px] text-[#78716C]">
              Your resume document is ready. Now fill in your profile details to unlock your account.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate('/resume-upload')}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E7E5E4] text-xs font-bold text-[#78716C] hover:text-[#1C1917] hover:bg-[#FAF8F5] transition-colors self-start sm:self-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Re-upload Resume
        </button>
      </div>

      {/* SECTION 1: PERSONAL DETAILS & ADDRESS */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
            <User className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1C1917] font-heading">
              1. Personal Details & Address
            </h2>
            <p className="text-[11px] text-[#78716C]">
              Your name is loaded from registration. Add your headline, contact number, and location.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Full Name (From Registration) */}
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
            <p className="text-[10px] text-[#A8A29E] mt-1">Pre-filled from your registration credentials.</p>
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

          {/* Phone Number */}
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

          {/* Address / Location */}
          <div>
            <label className="block text-xs font-bold text-[#1C1917] mb-1.5">
              Address / Preferred Tech Hub
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-[#A8A29E] absolute left-3 top-2.5" />
              <input
                type="text"
                value={formData.preferred_location_name}
                onChange={(e) => setFormData({ ...formData, preferred_location_name: e.target.value })}
                placeholder="e.g. Savar, Dhaka or Dhanmondi"
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
            {/* Quick Hub Chips */}
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

      {/* SECTION 2: ACADEMIC BACKGROUND (UNIVERSITY, DEGREE, YEAR, CGPA) */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1C1917] font-heading">
              2. Academic Background (University & CGPA)
            </h2>
            <p className="text-[11px] text-[#78716C]">
              Add your university or college qualification details.
            </p>
          </div>
        </div>

        {/* List of Added Degrees */}
        {formData.education.length === 0 ? (
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] text-xs text-[#78716C] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#A8A29E]" />
            <span>No academic background added yet. Use the fields below to add your university or degree.</span>
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
                    {edu.university}
                    {edu.graduation_year ? ` • Graduating: ${edu.graduation_year}` : ''}
                    {edu.cgpa ? ` • CGPA: ${edu.cgpa}` : ''}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveEducation(idx)}
                  className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove qualification"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inline Degree Adder Form */}
        <div className="p-4 rounded-xl border border-[#E7E5E4] bg-white space-y-3">
          <span className="text-xs font-bold text-[#1C1917] block">Add Academic Qualification:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">University / Institute</label>
              <input
                type="text"
                placeholder="e.g. Daffodil International Univ"
                value={newDegree.university}
                onChange={(e) => setNewDegree({ ...newDegree, university: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">Degree / Program</label>
              <input
                type="text"
                placeholder="e.g. BSc in Computer Science"
                value={newDegree.degree}
                onChange={(e) => setNewDegree({ ...newDegree, degree: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">Graduation Year</label>
              <input
                type="number"
                placeholder="e.g. 2026"
                value={newDegree.graduation_year}
                onChange={(e) => setNewDegree({ ...newDegree, graduation_year: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">CGPA (e.g. 3.75)</label>
              <input
                type="text"
                placeholder="e.g. 3.75"
                value={newDegree.cgpa}
                onChange={(e) => setNewDegree({ ...newDegree, cgpa: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddEducation}
            className="px-4 py-2 rounded-xl bg-[#F3EFEA] hover:bg-[#E7E5E4] text-xs font-bold text-[#1C1917] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Degree
          </button>
        </div>
      </div>

      {/* SECTION 3: SKILLS */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#E7E5E4]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1C1917] font-heading">
                3. Technical & Professional Skills
              </h2>
              <p className="text-[11px] text-[#78716C]">
                Add the skills you want the AI engine to match against job openings.
              </p>
            </div>
          </div>
          <span className="badge-pill bg-[#FAF8F5] border-[#E7E5E4] text-[#1C1917] text-xs font-bold self-start sm:self-auto">
            {formData.skills.length} skills added
          </span>
        </div>

        {/* Selected Skills Pills Box */}
        <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] min-h-[58px] flex flex-wrap gap-2 items-center">
          {formData.skills.length === 0 ? (
            <div className="text-xs text-[#78716C] flex items-center gap-2 py-1">
              <HelpCircle className="w-4 h-4 text-[#A8A29E]" />
              <span>No skills added yet. Type below or pick from popular recommendations.</span>
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

        {/* Add Skill Input */}
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
            placeholder="Type a skill name (e.g. Python, React, SQL, Docker, Git)..."
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

        {/* Quick Add Tray */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] text-[#78716C] font-semibold">Popular Skills Suggestions:</span>
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

      {/* SECTION 4: WORK / INTERNSHIP EXPERIENCE */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1C1917] font-heading">
              4. Work & Internship Experience <span className="text-[11px] font-normal text-[#78716C]">(Optional)</span>
            </h2>
            <p className="text-[11px] text-[#78716C]">
              Add any relevant internships, freelance work, or full-time positions.
            </p>
          </div>
        </div>

        {/* Added Experience Items */}
        {formData.experience.length === 0 ? (
          <div className="p-4 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] text-xs text-[#78716C] flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#A8A29E]" />
            <span>No experience added yet. If you have past roles or internships, add them below.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {formData.experience.map((exp, idx) => (
              <div
                key={idx}
                className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E5E4] flex items-start justify-between text-xs transition-colors hover:border-[#D6D3D1]"
              >
                <div className="space-y-1">
                  <p className="font-bold text-[#1C1917] text-xs">{exp.title}</p>
                  <p className="text-[11px] text-[#78716C]">
                    {exp.company} {exp.duration ? `• ${exp.duration}` : ''}
                  </p>
                  {exp.description && (
                    <p className="text-[11px] text-[#44403C] mt-1">{exp.description}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExperience(idx)}
                  className="text-stone-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                  title="Remove experience"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Inline Experience Adder Form */}
        <div className="p-4 rounded-xl border border-[#E7E5E4] bg-white space-y-3">
          <span className="text-xs font-bold text-[#1C1917] block">Add Experience:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">Role / Job Title</label>
              <input
                type="text"
                placeholder="e.g. Software Engineer Intern"
                value={newExp.title}
                onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">Company / Organization</label>
              <input
                type="text"
                placeholder="e.g. Tech Solutions Ltd."
                value={newExp.company}
                onChange={(e) => setNewExp({ ...newExp, company: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#78716C] mb-1">Duration</label>
              <input
                type="text"
                placeholder="e.g. Jun 2025 - Dec 2025"
                value={newExp.duration}
                onChange={(e) => setNewExp({ ...newExp, duration: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#78716C] mb-1">Responsibilities / Highlights</label>
            <input
              type="text"
              placeholder="e.g. Developed REST endpoints with FastAPI and built React components"
              value={newExp.description}
              onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[#E7E5E4] text-xs font-semibold text-[#1C1917] focus-ring shadow-2xs"
            />
          </div>
          <button
            type="button"
            onClick={handleAddExperience}
            className="px-4 py-2 rounded-xl bg-[#F3EFEA] hover:bg-[#E7E5E4] text-xs font-bold text-[#1C1917] transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            + Add Experience
          </button>
        </div>
      </div>

      {/* SECTION 5: CAREER TARGETS & PREFERENCES */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
          <div className="w-7 h-7 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] flex items-center justify-center text-[#0F766E]">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#1C1917] font-heading">
              5. Placement & Target Role Preferences
            </h2>
            <p className="text-[11px] text-[#78716C]">
              Select which placement types and career tracks you are aiming for.
            </p>
          </div>
        </div>

        {/* Placement Type Cards */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#1C1917]">
            Desired Placement Type <span className="text-[11px] font-normal text-[#78716C]">(Select any that apply)</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {PLACEMENT_TYPES.map((jt) => {
              const isSelected = formData.preferred_job_types.includes(jt.id);
              return (
                <button
                  key={jt.id}
                  type="button"
                  onClick={() => handleToggleJobType(jt.id)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#CCFBF1]/40 border-[#0F766E] shadow-xs'
                      : 'bg-white border-[#E7E5E4] hover:bg-[#FAF8F5]'
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

        {/* Target Roles */}
        <div className="space-y-2 pt-2">
          <label className="block text-xs font-bold text-[#1C1917]">
            Target Specializations <span className="text-[11px] font-normal text-[#78716C]">(Click to toggle)</span>
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

      {/* ACTION FOOTER */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-5 sm:p-6 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/resume-upload')}
          className="text-xs font-bold text-[#78716C] hover:text-[#1C1917] transition-colors order-2 sm:order-1 flex items-center gap-1"
        >
          ← Back to Resume Upload
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={handleSaveProfile}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-[0_4px_14px_rgba(15,118,110,0.3)] transition-all order-1 sm:order-2"
        >
          {submitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Saving Profile & Unlocking Dashboard...
            </>
          ) : (
            <>
              <Check className="w-4 h-4" />
              Save & Complete Profile
            </>
          )}
        </button>
      </div>
    </div>
  );
}
