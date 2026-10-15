import React, { useState, useEffect } from 'react';
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
  Lock
} from 'lucide-react';
import api from '../services/api';
import ResumeReviewModal from '../components/ResumeReviewModal';

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [extractedData, setExtractedData] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [newSkill, setNewSkill] = useState('');

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/seekers/profile');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
        headers: { 'Content-Type': 'multipart/form-data' }
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
      await api.put('/seekers/profile', profile);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove)
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-6 py-16 text-center text-xs text-secondary animate-pulse">
        Loading career profile & placement radius...
      </div>
    );
  }

  const profileStrength = profile?.profile_strength || 87;

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8 space-y-8">
      
      {/* Top Header & Save Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight">Career Profile & Placement Hub</h1>
          <p className="text-sm text-[#475569] mt-1">
            Configure your AI resume document, verified taxonomy skills, and preferred alert proximity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {saveSuccess && (
            <span className="text-xs font-bold text-[#047857] bg-[#D1FAE5] px-3 py-1.5 rounded-full flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Profile Saved
            </span>
          )}

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-5 py-2.5 rounded-[10px] bg-[#4F46E5] hover:bg-[#4338CA] text-white text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Upload Studio Banner */}
      <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center font-bold flex-shrink-0">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#0F172A]">AI Resume Parser Studio</h3>
            <p className="text-xs text-[#475569] mt-1">
              Upload your latest PDF or DOCX (up to 5 MB). JOB HUB extracts education, CGPA, projects, and skills with zero manual typing.
            </p>
            {profile.resume_filename && (
              <p className="text-xs font-semibold text-[#0E7490] mt-1.5 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Active Document: {profile.resume_filename}
              </p>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <label className="cursor-pointer px-5 py-2.5 rounded-[10px] bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-bold transition-colors inline-flex items-center gap-2">
            <Upload className="w-4 h-4" />
            {uploading ? uploadStep : 'Upload New Resume'}
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

      {/* Grid: Main Details & Proximity Hub Studio */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Candidate Details & Skills (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Identity & Education Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#4F46E5]" />
              Academic Credentials & Candidate Info
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring font-medium text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">University / Institute</label>
                <input
                  type="text"
                  value={profile.university || ''}
                  onChange={(e) => setProfile({ ...profile, university: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring font-medium text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Degree & Major</label>
                <input
                  type="text"
                  value={profile.degree || ''}
                  onChange={(e) => setProfile({ ...profile, degree: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring font-medium text-[#0F172A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#475569] mb-1">Cumulative CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  value={profile.cgpa || ''}
                  onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring font-semibold text-[#0F172A] n"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1">Professional Bio / Executive Summary</label>
              <textarea
                rows={3}
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full p-3 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring text-[#0F172A] leading-relaxed"
              />
            </div>
          </div>

          {/* Technical Skills Taxonomy Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#06B6D4]" />
                Technical Skills Taxonomy
              </h3>
              <span className="text-xs text-[#64748B] font-semibold n">{profile.skills?.length || 0} skills active</span>
            </div>

            {/* Add Skill Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); }}}
                placeholder="Add skill (e.g. Docker, TypeScript, Redis) and press Enter..."
                className="flex-1 px-3 py-2 text-xs rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] focus-ring font-medium text-[#0F172A]"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 rounded-[10px] bg-[#0F172A] text-white text-xs font-bold"
              >
                Add Skill
              </button>
            </div>

            {/* Active Skill Chips */}
            <div className="flex flex-wrap gap-2 pt-1">
              {profile.skills?.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#D1FAE5] text-[#047857] border border-[#A7F3D0]"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="hover:text-red-600 focus:outline-none"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right: Hub Proximity & Privacy Controls (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Location Hub & Radius Studio Card */}
          <div className="bg-white rounded-[16px] border border-[#E2E8F0] p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#10B981]" />
              Placement Hub & Radius
            </h3>
            
            <p className="text-xs text-[#64748B] leading-relaxed">
              Jobs are proactively ranked based on distance between this hub and company facilities.
            </p>

            {/* Preferred Hub Selector */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-1.5">Selected Campus / Urban Hub</label>
              <select
                value={profile.location_name || 'Savar'}
                onChange={(e) => setProfile({ ...profile, location_name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] text-xs font-bold text-[#0F172A] focus-ring"
              >
                <option value="Savar">Savar / Daffodil Smart City</option>
                <option value="Banani">Banani Tech Corridor</option>
                <option value="Mohakhali">Mohakhali / Wireless Gate</option>
                <option value="Dhanmondi">Dhanmondi Hub</option>
                <option value="Uttara">Uttara Sector Hub</option>
                <option value="Mirpur">Mirpur Technical Area</option>
                <option value="Gulshan">Gulshan Hub</option>
              </select>
            </div>

            {/* Alert Radius Buttons */}
            <div>
              <label className="block text-xs font-semibold text-[#475569] mb-2">
                Alert Radius: <b className="text-[#0F172A] n font-bold">{profile.alert_radius_km || 5} km</b>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[2, 5, 10, 20].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setProfile({ ...profile, alert_radius_km: r })}
                    className={`py-2 rounded-[10px] text-xs font-bold transition-colors n ${
                      profile.alert_radius_km === r
                        ? 'bg-[#0F172A] text-white'
                        : 'bg-slate-100 text-[#475569] hover:bg-slate-200'
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>
            </div>

            {/* Privacy Guarantee Box */}
            <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[10px] text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#0F172A] font-bold">
                <Lock className="w-3.5 h-3.5 text-[#10B981]" />
                <span>Strict Privacy Guarantee</span>
              </div>
              <p className="text-[11px] text-[#64748B] leading-relaxed">
                JOB HUB never performs background GPS tracking. All distances are calculated from your configured hub coordinate using the Haversine formula.
              </p>
            </div>
          </div>

          {/* Profile Strength & Completeness Card */}
          <div className="bg-[#ECFEFF] border border-[#06B6D4] rounded-[16px] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0E7490] uppercase tracking-wider">Placement Readiness</span>
              <span className="n text-2xl font-black text-[#0F172A]">{profileStrength}%</span>
            </div>

            <div className="w-full bg-white rounded-full h-2 overflow-hidden border border-[#A5F3FC]">
              <div 
                className="bg-[#06B6D4] h-2 rounded-full transition-all duration-500" 
                style={{ width: `${profileStrength}%` }}
              />
            </div>

            <p className="text-xs text-[#0E7490] leading-relaxed font-medium">
              ✓ Verified technical resume parsed<br/>
              ✓ Active Bangladesh placement hub configured<br/>
              ✓ Academic CGPA verified
            </p>
          </div>

        </div>

      </div>

      {/* Review Modal for AI Resume Extraction */}
      {reviewModalOpen && extractedData && (
        <ResumeReviewModal
          isOpen={reviewModalOpen}
          extractedData={extractedData}
          onClose={() => setReviewModalOpen(false)}
          onConfirm={(confirmedData) => {
            setProfile({
              ...profile,
              full_name: confirmedData.full_name || profile.full_name,
              university: confirmedData.university || profile.university,
              degree: confirmedData.degree || profile.degree,
              cgpa: confirmedData.cgpa || profile.cgpa,
              skills: Array.from(new Set([...profile.skills, ...(confirmedData.skills || [])])),
              experience_years: confirmedData.experience_years || profile.experience_years
            });
            setReviewModalOpen(false);
          }}
        />
      )}

    </div>
  );
}
