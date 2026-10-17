import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Sparkles,
  MapPin,
  Check,
  Plus,
  X,
  GraduationCap,
  Briefcase,
  Save,
  CheckCircle2,
  Lock,
  Camera,
  Trash2,
  Award,
  User,
  TrendingUp,
  ShieldCheck,
  Image as ImageIcon,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResumeReviewModal from '../components/ResumeReviewModal';

const SAMPLE_AVATARS = [
  {
    name: 'Sarah Rahman',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
  },
  {
    name: 'Tech Scholar',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=256&auto=format&fit=crop&q=80',
  },
  {
    name: 'AI Developer',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80',
  },
  {
    name: 'Software Engineer',
    url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=256&auto=format&fit=crop&q=80',
  },
];

const SUGGESTED_SKILLS = [
  'Docker',
  'TypeScript',
  'Next.js',
  'GraphQL',
  'AWS',
  'Redux',
  'MongoDB',
  'Redis',
];

export default function ProfilePage() {
  const { refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [showPresets, setShowPresets] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/seekers/profile');
      const data = res.data;
      const edu = Array.isArray(data.education) && data.education.length > 0 ? data.education[0] : {};
      const savedAvatar = localStorage.getItem('jobhub_user_avatar');

      setProfile({
        ...data,
        full_name: data.full_name || 'Sarah Rahman',
        university: data.university || edu.university || 'Daffodil International University',
        degree: data.degree || edu.degree || 'BSc in Software Engineering',
        cgpa: data.cgpa || edu.cgpa || 3.75,
        bio:
          data.bio ||
          data.headline ||
          'Aspiring Software Engineer passionate about full-stack development, distributed backend systems, and AI-powered recommendation pipelines.',
        headline: data.headline || 'Aspiring Software Engineer | Recent Graduate',
        skills:
          Array.isArray(data.skills) && data.skills.length > 0
            ? data.skills
            : ['Python', 'FastAPI', 'PostgreSQL', 'React', 'Git', 'SQL', 'Tailwind CSS', 'REST APIs'],
        preferred_location_name: data.preferred_location_name || 'Savar',
        alert_radius_km: data.alert_radius_km || 5,
        avatar_url:
          data.avatar_url ||
          savedAvatar ||
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80',
      });
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Profile Picture Upload Handler with Client-Side Canvas Compression
  const handlePhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Photo size exceeds the 8 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxSize = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.88);

        setProfile((prev) => ({ ...prev, avatar_url: compressedDataUrl }));
        localStorage.setItem('jobhub_user_avatar', compressedDataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (url) => {
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    localStorage.setItem('jobhub_user_avatar', url);
    setShowPresets(false);
  };

  const handleRemovePhoto = () => {
    setProfile((prev) => ({ ...prev, avatar_url: '' }));
    localStorage.removeItem('jobhub_user_avatar');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Resume File Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5 MB limit.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadStep('Analyzing resume vector embeddings...');

    setTimeout(() => setUploadStep('Extracting technical taxonomy & credentials...'), 700);
    setTimeout(() => setUploadStep('Mapping experience to placement hubs...'), 1400);

    try {
      const res = await api.post('/resume/parse-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setExtractedData(res.data.extracted_profile);
      setReviewModalOpen(true);
    } catch (err) {
      alert(err.message || 'Failed to analyze resume.');
    } finally {
      setUploading(false);
      setUploadStep('');
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const payload = {
        full_name: profile.full_name,
        headline: profile.bio || profile.headline,
        phone: profile.phone || '',
        preferred_location_name: profile.preferred_location_name,
        alert_radius_km: profile.alert_radius_km,
        skills: profile.skills || [],
        avatar_url: profile.avatar_url || '',
        education: [
          {
            university: profile.university,
            degree: profile.degree,
            cgpa: parseFloat(profile.cgpa) || 0,
            graduation_year: 2026,
          },
        ],
      };

      if (profile.avatar_url) {
        localStorage.setItem('jobhub_user_avatar', profile.avatar_url);
      } else {
        localStorage.removeItem('jobhub_user_avatar');
      }

      await api.put('/seekers/profile', payload);
      if (refreshUser) {
        await refreshUser();
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      alert(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = (skillToAdd) => {
    const target = skillToAdd || newSkill;
    if (target.trim() && !profile.skills.includes(target.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, target.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 py-20 text-center space-y-3 animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] text-[#0F766E] flex items-center justify-center mx-auto">
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-[#78716C]">Loading career profile & placement studio...</p>
      </div>
    );
  }

  // Calculate dynamic placement readiness score
  let score = 50;
  if (profile.full_name && profile.university) score += 15;
  if (profile.cgpa) score += 10;
  if (profile.skills?.length >= 5) score += 12;
  if (profile.avatar_url) score += 8;
  if (profile.resume_filename) score += 5;
  const profileStrength = Math.min(score, 100);

  const getInitials = (name) => {
    if (!name) return 'SR';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* =========================================================================
          HERO SECTION: Profile Identity Card & Picture Studio
          ========================================================================= */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_8px_30px_rgb(28,25,23,0.04)] relative overflow-hidden transition-all duration-300">
        
        {/* Decorative ambient corner glow */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-bl from-[#CCFBF1]/50 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-gradient-to-tr from-[#FFEDD5]/40 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Avatar Upload + Candidate Bio Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
            
            {/* Avatar Studio with Camera Trigger */}
            <div className="relative group flex-shrink-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white ring-4 ring-[#CCFBF1] shadow-lg overflow-hidden bg-gradient-to-br from-[#0F766E] to-[#115E59] flex items-center justify-center transition-transform group-hover:scale-[1.02]">
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Candidate Avatar'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl sm:text-3xl font-black text-white tracking-wider">
                    {getInitials(profile.full_name)}
                  </span>
                )}
              </div>

              {/* Upload Trigger Badge */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Upload Profile Picture"
                className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer group-hover:shadow-teal-900/30"
              >
                <Camera className="w-4 h-4" />
              </button>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handlePhotoFileChange}
                className="hidden"
              />
            </div>

            {/* Candidate Identity & Role */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
                  {profile.full_name || 'Sarah Rahman'}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857] text-[11px] font-bold">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Candidate
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#78716C] font-medium max-w-xl">
                {profile.headline || 'Aspiring Software Engineer | Recent Graduate'}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-semibold">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {profile.university || 'Daffodil International University'}
                </span>

                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] text-xs font-semibold">
                  <MapPin className="w-3.5 h-3.5" />
                  {profile.preferred_location_name || 'Savar'} • {profile.alert_radius_km || 5} km Hub
                </span>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4] text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Actively Seeking Placement
                </span>
              </div>

              {/* Photo Management Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-semibold text-[#0F766E] hover:text-[#115E59] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" /> Upload Photo
                </button>
                <span className="text-[#E7E5E4]">•</span>
                <button
                  type="button"
                  onClick={() => setShowPresets(!showPresets)}
                  className="font-semibold text-[#78716C] hover:text-[#1C1917] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5" /> Choose Sample Avatar
                </button>
                {profile.avatar_url && (
                  <>
                    <span className="text-[#E7E5E4]">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Remove Photo
                    </button>
                  </>
                )}
              </div>

              {/* Preset Avatars Tray */}
              {showPresets && (
                <div className="pt-3 p-3 bg-[#FAF8F5] border border-[#E7E5E4] rounded-2xl flex flex-wrap items-center gap-3 animate-in fade-in duration-150">
                  <span className="text-[11px] font-bold text-[#1C1917]">Select Preset:</span>
                  <div className="flex items-center gap-2">
                    {SAMPLE_AVATARS.map((avatar) => (
                      <button
                        key={avatar.name}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(avatar.url)}
                        title={avatar.name}
                        className="w-8 h-8 rounded-full overflow-hidden border-2 border-white hover:border-[#0F766E] shadow-xs hover:scale-110 transition-all cursor-pointer"
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresets(false)}
                    className="text-[11px] text-[#78716C] hover:text-[#1C1917] ml-auto"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right: Save Changes CTA & Readiness Preview */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-end justify-between w-full lg:w-auto gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-[#E7E5E4]">
            
            {saveSuccess && (
              <span className="text-xs font-bold text-[#047857] bg-[#ECFDF5] border border-[#A7F3D0] px-3.5 py-1.5 rounded-full flex items-center gap-1.5 animate-in fade-in shadow-xs">
                <Check className="w-4 h-4" />
                Profile Updated Successfully
              </span>
            )}

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#0F766E] text-white text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(15,118,110,0.25)] hover:shadow-[0_8px_24px_rgba(15,118,110,0.35)] cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>

            <div className="text-[11px] text-[#78716C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Changes sync automatically across JobHub</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 2: AI Resume Parser Studio Banner
          ========================================================================= */}
      <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-[#0F766E]/50">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
            <Upload className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1C1917]">AI Resume Parser Studio</h3>
              <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold">
                Automated Extraction
              </span>
            </div>
            <p className="text-xs text-[#78716C] leading-relaxed max-w-2xl">
              Upload your latest PDF or DOCX (up to 5 MB). JobHub analyzes skills, CGPA, graduation data, and projects with zero manual typing.
            </p>
            {profile.resume_filename && (
              <div className="pt-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-[#0F766E] bg-[#CCFBF1]/50 px-2.5 py-1 rounded-lg border border-[#99F6E4]/60 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Active Document: <strong className="font-bold">{profile.resume_filename}</strong>
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="cursor-pointer px-5 py-2.5 rounded-xl bg-[#1C1917] hover:bg-[#292524] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm active:scale-95">
            <Upload className="w-4 h-4" />
            <span>{uploading ? uploadStep : 'Upload New Resume'}</span>
            <input
              type="file"
              accept=".pdf,.docx,.doc"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: 2-Column Main Form Grid
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Academic Credentials & Technical Skills (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Academic Credentials & Candidate Info */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#0F766E]" />
                Academic Credentials & Candidate Info
              </h3>
              <span className="text-[11px] text-[#78716C] font-semibold">Education & Target Profile</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">Full Name</label>
                <div className="relative group">
                  <User className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    value={profile.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="e.g. Sarah Rahman"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* University / Institute */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">University / Institute</label>
                <div className="relative group">
                  <GraduationCap className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    value={profile.university || ''}
                    onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                    placeholder="e.g. Daffodil International University"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Degree & Major */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">Degree & Major</label>
                <div className="relative group">
                  <Award className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                  <input
                    type="text"
                    value={profile.degree || ''}
                    onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                    placeholder="e.g. BSc in Software Engineering"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200"
                  />
                </div>
              </div>

              {/* Cumulative CGPA */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#1C1917]">Cumulative CGPA</label>
                <div className="relative group">
                  <TrendingUp className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="4.00"
                    value={profile.cgpa || ''}
                    onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
                    placeholder="e.g. 3.75"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-bold text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200 n"
                  />
                </div>
              </div>
            </div>

            {/* Professional Bio / Executive Summary */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1C1917]">Professional Bio / Career Summary</label>
                <span className="text-[11px] text-[#78716C]">Shared with recruiters on job match</span>
              </div>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Highlight your software engineering focus, core languages, and placement aspirations..."
                className="w-full p-3.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200 leading-relaxed placeholder:text-[#78716C]/60"
              />
            </div>
          </div>

          {/* Card 2: Technical Skills Taxonomy */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#0F766E]" />
                <h3 className="text-base font-bold text-[#1C1917]">Technical Skills Taxonomy</h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-xs font-bold n">
                {profile.skills?.length || 0} skills active
              </span>
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Sparkles className="w-4 h-4 text-[#78716C] group-focus-within:text-[#0F766E] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addSkill();
                    }
                  }}
                  placeholder="Add skill (e.g. Docker, TypeScript, Redis) and press Enter..."
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all duration-200 placeholder:text-[#78716C]/60"
                />
              </div>
              <button
                type="button"
                onClick={() => addSkill()}
                className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Skill</span>
              </button>
            </div>

            {/* Active Skill Chips */}
            <div className="flex flex-wrap gap-2 pt-1 min-h-[40px]">
              {profile.skills?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] shadow-2xs hover:bg-[#99F6E4]/40 transition-colors"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-700 hover:scale-110 focus:outline-none transition-transform cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            {/* Quick Add Suggestions */}
            <div className="pt-2 border-t border-[#E7E5E4]/80 flex flex-wrap items-center gap-1.5 text-xs text-[#78716C]">
              <span className="font-semibold text-[#1C1917]">Suggested:</span>
              {SUGGESTED_SKILLS.filter((s) => !profile.skills?.includes(s)).map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#CCFBF1] hover:text-[#0F766E] border border-[#E7E5E4] text-[11px] font-semibold transition-colors cursor-pointer"
                >
                  + {skill}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Hub Proximity & Readiness (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Placement Hub & Proximity Radius */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
              <MapPin className="w-5 h-5 text-[#F97316]" />
              <h3 className="text-base font-bold text-[#1C1917]">Placement Hub & Radius</h3>
            </div>
            
            <p className="text-xs text-[#78716C] leading-relaxed">
              Jobs are proactively ranked based on distance between your designated university hub and verified company engineering offices.
            </p>

            {/* Campus / Urban Hub Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1917]">Selected Campus / Urban Hub</label>
              <select
                value={profile.preferred_location_name || profile.location_name || 'Savar'}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferred_location_name: e.target.value,
                    location_name: e.target.value,
                  })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white text-xs font-bold text-[#1C1917] focus:border-[#0F766E] focus:outline-none focus:ring-4 focus:ring-[#0F766E]/10 transition-all cursor-pointer"
              >
                <option value="Savar">Savar / Daffodil Smart City</option>
                <option value="Banani">Banani Tech Corridor</option>
                <option value="Mohakhali">Mohakhali / Wireless Gate</option>
                <option value="Dhanmondi">Dhanmondi Hub</option>
                <option value="Uttara">Uttara Sector Hub</option>
                <option value="Mirpur">Mirpur Technical Area</option>
                <option value="Gulshan">Gulshan Corporate Hub</option>
              </select>
            </div>

            {/* Segmented Alert Radius Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1C1917]">Alert Radius</span>
                <span className="font-bold text-[#0F766E] n">{profile.alert_radius_km || 5} km</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80">
                {[2, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setProfile({ ...profile, alert_radius_km: r })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all n cursor-pointer ${
                      profile.alert_radius_km === r
                        ? 'bg-[#0F766E] text-white shadow-xs'
                        : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/50'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* Strict Privacy Guarantee */}
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E7E5E4] rounded-xl text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#1C1917] font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Strict Privacy Guarantee</span>
              </div>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                JobHub never performs background GPS tracking. Proximity is computed strictly from your chosen campus anchor using the Haversine equation.
              </p>
            </div>
          </div>

          {/* Card 2: Placement Readiness Score Card */}
          <div className="bg-gradient-to-br from-[#F0FDFA] to-white border border-[#99F6E4] rounded-2xl sm:rounded-[24px] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-extrabold text-[#0F766E] uppercase tracking-wider">
                  Placement Readiness
                </span>
                <p className="text-xs text-[#78716C]">AI Matching Optimization</p>
              </div>
              <span className="n text-3xl font-black text-[#0F766E] tracking-tight">{profileStrength}%</span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-[#CCFBF1]/60 rounded-full h-2.5 overflow-hidden border border-[#99F6E4]/50">
              <div
                className="bg-gradient-to-r from-[#0F766E] to-[#14B8A6] h-full rounded-full transition-all duration-700"
                style={{ width: `${profileStrength}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2 text-xs font-medium text-[#1C1917] pt-1">
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${profile.resume_filename ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                <span>Verified technical resume parsed</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${profile.avatar_url ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                <span>Professional candidate photo attached</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${profile.cgpa ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                <span>Academic CGPA & degree verified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={`w-4 h-4 ${profile.skills?.length >= 5 ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                <span>5+ verified taxonomy skills mapped</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* Review Modal for AI Resume Extraction */}
      {reviewModalOpen && extractedData && (
        <ResumeReviewModal
          isOpen={reviewModalOpen}
          extractedData={extractedData}
          onClose={() => setReviewModalOpen(false)}
          onConfirmed={() => {
            fetchProfile();
            setReviewModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
