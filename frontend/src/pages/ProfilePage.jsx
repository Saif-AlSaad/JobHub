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
  Building2,
  Globe,
  Users,
  Phone,
  Mail,
  Compass,
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ResumeReviewModal from '../components/ResumeReviewModal';

const SAMPLE_AVATARS_SEEKER = [
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

const SAMPLE_AVATARS_RECRUITER = [
  {
    name: 'Sabrina Rahman',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
  },
  {
    name: 'Corporate Executive',
    url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=256&auto=format&fit=crop&q=80',
  },
  {
    name: 'Talent Director',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80',
  },
  {
    name: 'Engineering Partner',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80',
  },
];

const SUGGESTED_SKILLS_SEEKER = [
  'Docker',
  'TypeScript',
  'Next.js',
  'GraphQL',
  'AWS',
  'Redux',
  'MongoDB',
  'Redis',
];

const SUGGESTED_SKILLS_RECRUITER = [
  'Python',
  'FastAPI',
  'React',
  'Docker',
  'PostgreSQL',
  'TypeScript',
  'AWS',
  'Kubernetes',
];

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const fileInputRef = useRef(null);

  const isRecruiter = user?.role === 'RECRUITER';

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

  // Fetch profile based on role
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const savedAvatar = localStorage.getItem('jobhub_user_avatar');

      if (isRecruiter) {
        let recruiterData = {};
        try {
          const res = await api.get('/recruiter/profile');
          recruiterData = res.data;
        } catch {
          recruiterData = user?.profile || {};
        }

        const comp = recruiterData.company || {};
        setProfile({
          full_name: recruiterData.full_name || user?.full_name || 'Sabrina Rahman',
          designation: recruiterData.designation || 'Lead Technical Talent Partner',
          phone: recruiterData.phone || '+880 1819-876543',
          email: user?.email || 'recruiter@technova.io',
          avatar_url:
            recruiterData.avatar_url ||
            savedAvatar ||
            'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80',
          company_name: comp.name || 'TechNova Labs',
          company_industry: comp.industry || 'Software Engineering & Cloud AI',
          company_website: comp.website || 'https://technova.io',
          company_location: comp.location_name || 'Banani Tech Corridor, Dhaka',
          company_size: comp.size || '50-200 employees',
          company_description:
            comp.description ||
            'Fast-growing AI and engineering solutions company partnering with university placement offices to hire top graduates.',
          skills: ['Python', 'FastAPI', 'React', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
          preferred_location_name: 'Banani',
          alert_radius_km: 10,
        });
      } else {
        // Job Seeker Profile
        const res = await api.get('/seekers/profile');
        const data = res.data;
        const edu = Array.isArray(data.education) && data.education.length > 0 ? data.education[0] : {};

        setProfile({
          ...data,
          full_name: data.full_name || user?.full_name || 'Sarah Rahman',
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
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [isRecruiter]);

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

  // Resume File Upload (Seeker Exclusive)
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

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      if (profile.avatar_url) {
        localStorage.setItem('jobhub_user_avatar', profile.avatar_url);
      } else {
        localStorage.removeItem('jobhub_user_avatar');
      }

      if (isRecruiter) {
        const payload = {
          full_name: profile.full_name,
          designation: profile.designation,
          phone: profile.phone,
          avatar_url: profile.avatar_url || '',
          company_name: profile.company_name,
          company_website: profile.company_website,
          company_industry: profile.company_industry,
          company_location: profile.company_location,
          company_description: profile.company_description,
          company_size: profile.company_size,
        };
        await api.put('/recruiter/profile', payload);
      } else {
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
        await api.put('/seekers/profile', payload);
      }

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
    if (target.trim() && !profile.skills?.includes(target.trim())) {
      setProfile({
        ...profile,
        skills: [...(profile.skills || []), target.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills?.filter((s) => s !== skillToRemove) || [],
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1240px] mx-auto px-6 py-20 text-center space-y-3 animate-pulse">
        <div
          className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto ${
            isRecruiter ? 'bg-[#FFEDD5] text-[#C2410C]' : 'bg-[#CCFBF1] text-[#0F766E]'
          }`}
        >
          <Sparkles className="w-6 h-6 animate-spin" />
        </div>
        <p className="text-xs font-semibold text-[#78716C]">
          {isRecruiter
            ? 'Loading enterprise recruiter & corporate profile...'
            : 'Loading career profile & placement studio...'}
        </p>
      </div>
    );
  }

  // Calculate dynamic readiness score
  let score = 55;
  if (isRecruiter) {
    if (profile.full_name && profile.company_name) score += 15;
    if (profile.company_website) score += 10;
    if (profile.skills?.length >= 4) score += 10;
    if (profile.avatar_url) score += 10;
  } else {
    if (profile.full_name && profile.university) score += 15;
    if (profile.cgpa) score += 10;
    if (profile.skills?.length >= 5) score += 12;
    if (profile.avatar_url) score += 8;
  }
  const profileStrength = Math.min(score, 100);

  const getInitials = (name) => {
    if (!name) return isRecruiter ? 'TN' : 'SR';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const sampleAvatars = isRecruiter ? SAMPLE_AVATARS_RECRUITER : SAMPLE_AVATARS_SEEKER;
  const suggestedSkills = isRecruiter ? SUGGESTED_SKILLS_RECRUITER : SUGGESTED_SKILLS_SEEKER;

  return (
    <div className="max-w-[1240px] mx-auto px-4 sm:px-6 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* =========================================================================
          HERO SECTION: Profile Identity Card & Picture Studio
          ========================================================================= */}
      <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_8px_30px_rgb(28,25,23,0.04)] relative overflow-hidden transition-all duration-300">
        
        {/* Decorative ambient corner glow */}
        <div
          className={`absolute top-0 right-0 w-72 h-72 rounded-full blur-2xl pointer-events-none ${
            isRecruiter
              ? 'bg-gradient-to-bl from-[#FFEDD5]/60 to-transparent'
              : 'bg-gradient-to-bl from-[#CCFBF1]/50 to-transparent'
          }`}
        />
        <div
          className={`absolute bottom-0 left-1/3 w-64 h-64 rounded-full blur-2xl pointer-events-none ${
            isRecruiter
              ? 'bg-gradient-to-tr from-[#FED7AA]/30 to-transparent'
              : 'bg-gradient-to-tr from-[#FFEDD5]/40 to-transparent'
          }`}
        />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left: Avatar Studio + Identity Badges */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 w-full lg:w-auto">
            
            {/* Avatar Studio with Camera Trigger */}
            <div className="relative group flex-shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-white shadow-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-[1.02] ${
                  isRecruiter
                    ? 'ring-4 ring-[#FFEDD5] bg-gradient-to-br from-[#F97316] to-[#EA580C]'
                    : 'ring-4 ring-[#CCFBF1] bg-gradient-to-br from-[#0F766E] to-[#115E59]'
                }`}
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.full_name || 'Profile Avatar'}
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
                className={`absolute bottom-0 right-0 w-9 h-9 rounded-full text-white flex items-center justify-center shadow-md border-2 border-white transition-all cursor-pointer active:scale-95 ${
                  isRecruiter
                    ? 'bg-[#F97316] hover:bg-[#EA580C] group-hover:shadow-orange-600/30'
                    : 'bg-[#0F766E] hover:bg-[#115E59] group-hover:shadow-teal-900/30'
                }`}
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

            {/* Identity & Role */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1C1917] tracking-tight">
                  {profile.full_name || (isRecruiter ? 'Sabrina Rahman' : 'Sarah Rahman')}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isRecruiter
                      ? 'bg-[#FFEDD5] border border-[#FED7AA] text-[#C2410C]'
                      : 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#047857]'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  {isRecruiter ? 'Verified Employer' : 'Verified Candidate'}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[#78716C] font-medium max-w-xl">
                {isRecruiter
                  ? `${profile.designation || 'Lead Technical Talent Partner'} • ${profile.company_name || 'TechNova Labs'}`
                  : profile.headline || 'Aspiring Software Engineer | Recent Graduate'}
              </p>

              {/* Badges Row */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {isRecruiter ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] text-xs font-semibold">
                      <Building2 className="w-3.5 h-3.5" />
                      {profile.company_name || 'TechNova Labs'}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF8F5] text-[#78716C] border border-[#E7E5E4] text-xs font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
                      {profile.company_location || 'Banani, Dhaka'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#047857] border border-[#A7F3D0] text-xs font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Actively Hiring
                    </span>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>

              {/* Photo Management Actions */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className={`font-semibold hover:underline flex items-center gap-1 cursor-pointer ${
                    isRecruiter ? 'text-[#F97316] hover:text-[#EA580C]' : 'text-[#0F766E] hover:text-[#115E59]'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" /> {isRecruiter ? 'Upload Corporate Photo' : 'Upload Photo'}
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
                    {sampleAvatars.map((avatar) => (
                      <button
                        key={avatar.name}
                        type="button"
                        onClick={() => handleSelectPresetAvatar(avatar.url)}
                        title={avatar.name}
                        className={`w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-xs hover:scale-110 transition-all cursor-pointer ${
                          isRecruiter ? 'hover:border-[#F97316]' : 'hover:border-[#0F766E]'
                        }`}
                      >
                        <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPresets(false)}
                    className="text-[11px] text-[#78716C] hover:text-[#1C1917] ml-auto cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>

          {/* Right: Save Changes CTA */}
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
              className={`w-full sm:w-auto px-6 py-3 rounded-xl text-white text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                isRecruiter
                  ? 'bg-gradient-to-r from-[#F97316] to-[#EA580C] hover:from-[#EA580C] hover:to-[#F97316] shadow-[0_4px_16px_rgba(249,115,22,0.25)] hover:shadow-[0_8px_24px_rgba(249,115,22,0.35)]'
                  : 'bg-gradient-to-r from-[#0F766E] to-[#115E59] hover:from-[#115E59] hover:to-[#0F766E] shadow-[0_4px_16px_rgba(15,118,110,0.25)] hover:shadow-[0_8px_24px_rgba(15,118,110,0.35)]'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : isRecruiter ? 'Save Recruiter Changes' : 'Save Profile Changes'}</span>
            </button>

            <div className="text-[11px] text-[#78716C] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Enterprise 256-bit secure sync</span>
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SECTION 2: Quick Studio Banner (Resume Studio for Seeker / Fast Job for Recruiter)
          ========================================================================= */}
      {isRecruiter ? (
        <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-[#F97316]/50">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] flex items-center justify-center font-bold flex-shrink-0 shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#1C1917]">Enterprise Talent Pipeline Studio</h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A] text-[10px] font-bold">
                  Active Hiring Network
                </span>
              </div>
              <p className="text-xs text-[#78716C] leading-relaxed max-w-2xl">
                Configure your verified corporate profile, semantic skill requirements, and campus interview radar to attract top software graduates.
              </p>
              <div className="pt-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-[#C2410C] bg-[#FFEDD5]/60 px-2.5 py-1 rounded-lg border border-[#FED7AA]/60 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Organization: <strong className="font-bold">{profile.company_name || 'TechNova Labs'}</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex-shrink-0">
            <a
              href="#/recruiter/post-job"
              className="px-5 py-2.5 rounded-xl bg-[#F97316] hover:bg-[#EA580C] text-white text-xs font-bold transition-all inline-flex items-center gap-2 shadow-sm active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Post New Opportunity</span>
            </a>
          </div>
        </div>
      ) : (
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
      )}

      {/* =========================================================================
          SECTION 3: 2-Column Main Form Grid
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Credentials & Skills (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Card 1: Credentials & Details */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <h3 className="text-base font-bold text-[#1C1917] flex items-center gap-2">
                {isRecruiter ? (
                  <Building2 className="w-5 h-5 text-[#F97316]" />
                ) : (
                  <GraduationCap className="w-5 h-5 text-[#0F766E]" />
                )}
                <span>{isRecruiter ? 'Corporate Credentials & Recruiter Info' : 'Academic Credentials & Candidate Info'}</span>
              </h3>
              <span className="text-[11px] text-[#78716C] font-semibold">
                {isRecruiter ? 'Employer & Company Profile' : 'Education & Target Profile'}
              </span>
            </div>

            {isRecruiter ? (
              // Recruiter Fields
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Recruiter Full Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Recruiter Full Name</label>
                    <div className="relative group">
                      <User className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        value={profile.full_name || ''}
                        onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                        placeholder="e.g. Sabrina Rahman"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Professional Designation */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Job Designation / Role</label>
                    <div className="relative group">
                      <Briefcase className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        value={profile.designation || ''}
                        onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                        placeholder="e.g. Lead Technical Talent Partner"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Official Work Email */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Work Email Address</label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="email"
                        value={profile.email || ''}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        placeholder="e.g. recruiter@technova.io"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Direct Phone / WhatsApp */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Phone / WhatsApp Number</label>
                    <div className="relative group">
                      <Phone className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        value={profile.phone || ''}
                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                        placeholder="e.g. +880 1819-876543"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200 n"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Company / Organization</label>
                    <div className="relative group">
                      <Building2 className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        value={profile.company_name || ''}
                        onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
                        placeholder="e.g. TechNova Labs"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Industry Sector */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Industry Sector</label>
                    <div className="relative group">
                      <Compass className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="text"
                        value={profile.company_industry || ''}
                        onChange={(e) => setProfile({ ...profile, company_industry: e.target.value })}
                        placeholder="e.g. Software Engineering & Cloud AI"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Company Website */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Company Website</label>
                    <div className="relative group">
                      <Globe className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <input
                        type="url"
                        value={profile.company_website || ''}
                        onChange={(e) => setProfile({ ...profile, company_website: e.target.value })}
                        placeholder="e.g. https://technova.io"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200"
                      />
                    </div>
                  </div>

                  {/* Company Size */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#1C1917]">Team Size</label>
                    <div className="relative group">
                      <Users className="w-4 h-4 text-[#78716C] group-focus-within:text-[#F97316] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
                      <select
                        value={profile.company_size || '50-200 employees'}
                        onChange={(e) => setProfile({ ...profile, company_size: e.target.value })}
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200 cursor-pointer"
                      >
                        <option value="1-10 employees">1-10 employees (Seed Startup)</option>
                        <option value="10-50 employees">10-50 employees (Growing Tech Firm)</option>
                        <option value="50-200 employees">50-200 employees (Scale-up)</option>
                        <option value="200-500 employees">200-500 employees (Enterprise Tech)</option>
                        <option value="500+ employees">500+ employees (Global Corporation)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Company Overview */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-[#1C1917]">Company Overview & Culture</label>
                    <span className="text-[11px] text-[#78716C]">Displayed on published job listings</span>
                  </div>
                  <textarea
                    rows={3}
                    value={profile.company_description || ''}
                    onChange={(e) => setProfile({ ...profile, company_description: e.target.value })}
                    placeholder="Describe your engineering culture, tech stack, and what makes your team an exceptional place for students and graduates..."
                    className="w-full p-3.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:border-[#F97316] focus:outline-none focus:ring-4 focus:ring-[#F97316]/10 transition-all duration-200 leading-relaxed placeholder:text-[#78716C]/60"
                  />
                </div>
              </div>
            ) : (
              // Job Seeker Fields
              <div className="space-y-4">
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

                {/* Professional Bio */}
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
            )}
          </div>

          {/* Card 2: Skills Taxonomy */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-5 h-5 ${isRecruiter ? 'text-[#F97316]' : 'text-[#0F766E]'}`} />
                <h3 className="text-base font-bold text-[#1C1917]">
                  {isRecruiter ? 'Active Hiring Requirements & Preferred Tech Stack' : 'Technical Skills Taxonomy'}
                </h3>
              </div>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold n ${
                  isRecruiter
                    ? 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA]'
                    : 'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]'
                }`}
              >
                {profile.skills?.length || 0} skills mapped
              </span>
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <div className="relative flex-1 group">
                <Sparkles
                  className={`w-4 h-4 text-[#78716C] absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors pointer-events-none ${
                    isRecruiter ? 'group-focus-within:text-[#F97316]' : 'group-focus-within:text-[#0F766E]'
                  }`}
                />
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
                  placeholder={
                    isRecruiter
                      ? 'Add desired skill (e.g. Docker, Next.js, Kubernetes) and press Enter...'
                      : 'Add skill (e.g. Docker, TypeScript, Redis) and press Enter...'
                  }
                  className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-[13px] font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] hover:border-[#78716C]/40 focus:outline-none focus:ring-4 transition-all duration-200 placeholder:text-[#78716C]/60 ${
                    isRecruiter
                      ? 'focus:border-[#F97316] focus:ring-[#F97316]/10'
                      : 'focus:border-[#0F766E] focus:ring-[#0F766E]/10'
                  }`}
                />
              </div>
              <button
                type="button"
                onClick={() => addSkill()}
                className={`px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  isRecruiter
                    ? 'bg-[#F97316] hover:bg-[#EA580C]'
                    : 'bg-[#0F766E] hover:bg-[#115E59]'
                }`}
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
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-2xs transition-colors ${
                    isRecruiter
                      ? 'bg-[#FFEDD5] text-[#C2410C] border border-[#FED7AA] hover:bg-[#FED7AA]/40'
                      : 'bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] hover:bg-[#99F6E4]/40'
                  }`}
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

            {/* Suggested Skills */}
            <div className="pt-2 border-t border-[#E7E5E4]/80 flex flex-wrap items-center gap-1.5 text-xs text-[#78716C]">
              <span className="font-semibold text-[#1C1917]">Suggested:</span>
              {suggestedSkills
                .filter((s) => !profile.skills?.includes(s))
                .map((skill) => (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => addSkill(skill)}
                    className={`px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] text-[11px] font-semibold transition-colors cursor-pointer ${
                      isRecruiter
                        ? 'hover:bg-[#FFEDD5] hover:text-[#C2410C]'
                        : 'hover:bg-[#CCFBF1] hover:text-[#0F766E]'
                    }`}
                  >
                    + {skill}
                  </button>
                ))}
            </div>
          </div>

        </div>

        {/* Right Column: Proximity & Readiness (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Placement Hub & Radius */}
          <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
              <MapPin className={`w-5 h-5 ${isRecruiter ? 'text-[#F97316]' : 'text-[#F97316]'}`} />
              <h3 className="text-base font-bold text-[#1C1917]">
                {isRecruiter ? 'Campus Talent Radar & Proximity' : 'Placement Hub & Radius'}
              </h3>
            </div>
            
            <p className="text-xs text-[#78716C] leading-relaxed">
              {isRecruiter
                ? 'Job postings prioritize engineering candidates within this commuting radius to ensure reliable daily attendance.'
                : 'Jobs are proactively ranked based on distance between your designated university hub and verified company facilities.'}
            </p>

            {/* Campus / Urban Hub Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#1C1917]">
                {isRecruiter ? 'Company Office / Hiring Anchor Hub' : 'Selected Campus / Urban Hub'}
              </label>
              <select
                value={profile.preferred_location_name || profile.location_name || (isRecruiter ? 'Banani' : 'Savar')}
                onChange={(e) =>
                  setProfile({
                    ...profile,
                    preferred_location_name: e.target.value,
                    location_name: e.target.value,
                  })
                }
                className={`w-full px-3.5 py-2.5 rounded-xl border border-[#E7E5E4] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white text-xs font-bold text-[#1C1917] focus:outline-none focus:ring-4 transition-all cursor-pointer ${
                  isRecruiter
                    ? 'focus:border-[#F97316] focus:ring-[#F97316]/10'
                    : 'focus:border-[#0F766E] focus:ring-[#0F766E]/10'
                }`}
              >
                <option value="Banani">Banani Tech Corridor</option>
                <option value="Savar">Savar / Daffodil Smart City</option>
                <option value="Mohakhali">Mohakhali / Wireless Gate</option>
                <option value="Dhanmondi">Dhanmondi Hub</option>
                <option value="Uttara">Uttara Sector Hub</option>
                <option value="Mirpur">Mirpur Technical Area</option>
                <option value="Gulshan">Gulshan Corporate Hub</option>
              </select>
            </div>

            {/* Alert Radius Buttons */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#1C1917]">
                  {isRecruiter ? 'Hiring Candidate Proximity Radius' : 'Alert Radius'}
                </span>
                <span className={`font-bold n ${isRecruiter ? 'text-[#F97316]' : 'text-[#0F766E]'}`}>
                  {profile.alert_radius_km || 10} km
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80">
                {[2, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setProfile({ ...profile, alert_radius_km: r })}
                    className={`py-2 rounded-lg text-xs font-bold transition-all n cursor-pointer ${
                      profile.alert_radius_km === r
                        ? isRecruiter
                          ? 'bg-[#F97316] text-white shadow-xs'
                          : 'bg-[#0F766E] text-white shadow-xs'
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
                <span>Strict Enterprise Privacy</span>
              </div>
              <p className="text-[11px] text-[#78716C] leading-relaxed">
                JOB HUB never performs continuous background GPS tracking. Distances are computed strictly using the Haversine equation from designated campus hubs.
              </p>
            </div>
          </div>

          {/* Card 2: Placement Readiness Score Card */}
          <div
            className={`border rounded-2xl sm:rounded-[24px] p-6 shadow-sm space-y-4 ${
              isRecruiter
                ? 'bg-gradient-to-br from-[#FFF7ED] to-white border-[#FED7AA]'
                : 'bg-gradient-to-br from-[#F0FDFA] to-white border-[#99F6E4]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span
                  className={`text-[11px] font-extrabold uppercase tracking-wider ${
                    isRecruiter ? 'text-[#C2410C]' : 'text-[#0F766E]'
                  }`}
                >
                  {isRecruiter ? 'Employer Profile Readiness' : 'Placement Readiness'}
                </span>
                <p className="text-xs text-[#78716C]">
                  {isRecruiter ? 'Applicant Conversion Index' : 'AI Matching Optimization'}
                </p>
              </div>
              <span
                className={`n text-3xl font-black tracking-tight ${
                  isRecruiter ? 'text-[#C2410C]' : 'text-[#0F766E]'
                }`}
              >
                {profileStrength}%
              </span>
            </div>

            {/* Progress Bar */}
            <div
              className={`rounded-full h-2.5 overflow-hidden border ${
                isRecruiter
                  ? 'bg-[#FFEDD5]/60 border-[#FED7AA]/50'
                  : 'bg-[#CCFBF1]/60 border-[#99F6E4]/50'
              }`}
            >
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  isRecruiter
                    ? 'bg-gradient-to-r from-[#F97316] to-[#FB923C]'
                    : 'bg-gradient-to-r from-[#0F766E] to-[#14B8A6]'
                }`}
                style={{ width: `${profileStrength}%` }}
              />
            </div>

            {/* Checklist items */}
            <div className="space-y-2 text-xs font-medium text-[#1C1917] pt-1">
              {isRecruiter ? (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${profile.company_name ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                    <span>Verified Corporate Organization profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${profile.avatar_url ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                    <span>Recruiter executive photo configured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${profile.company_website ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                    <span>Official company website & location verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${profile.skills?.length >= 4 ? 'text-emerald-600' : 'text-[#78716C]'}`} />
                    <span>Active hiring tech stack defined</span>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Review Modal for AI Resume Extraction (Seeker Only) */}
      {!isRecruiter && reviewModalOpen && extractedData && (
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
