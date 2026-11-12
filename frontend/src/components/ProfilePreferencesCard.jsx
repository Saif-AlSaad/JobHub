import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Bell,
  Mail,
  Plus,
  X,
  Briefcase,
  Target,
} from 'lucide-react';

const JOB_TYPE_OPTIONS = ['Internship', 'Full-time', 'Part-time', 'Remote'];

const SUGGESTED_ROLES = [
  'Software Engineer',
  'Backend Developer',
  'Frontend Developer',
  'Full-Stack Developer',
  'AI / ML Engineer',
  'DevOps Engineer',
];

const MATCH_SCORE_PRESETS = [50, 60, 70, 80, 90];

export default function ProfilePreferencesCard({
  isRecruiter,
  profile,
  onProfileChange,
  notifPrefs,
  onNotifPrefsChange,
}) {
  const [newRole, setNewRole] = useState('');

  const toggleJobType = (jobType) => {
    const current = profile.preferred_job_types || [];
    const next = current.includes(jobType)
      ? current.filter((t) => t !== jobType)
      : [...current, jobType];
    onProfileChange({ ...profile, preferred_job_types: next });
  };

  const addRole = (roleToAdd) => {
    const target = (roleToAdd || newRole).trim();
    const current = profile.preferred_roles || [];
    if (target && !current.includes(target)) {
      onProfileChange({ ...profile, preferred_roles: [...current, target] });
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove) => {
    const current = profile.preferred_roles || [];
    onProfileChange({
      ...profile,
      preferred_roles: current.filter((r) => r !== roleToRemove),
    });
  };

  const accentText = isRecruiter ? 'text-[#F97316]' : 'text-[#0F766E]';

  return (
    <div className="space-y-6">
      {/* Seeker-only Career & Match Preferences */}
      {!isRecruiter && (
        <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E4]">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0F766E]" />
              <div>
                <h3 className="text-base font-bold text-[#1C1917]">Career & AI Match Preferences</h3>
                <p className="text-[11px] text-[#78716C] font-medium">
                  Calibrates your hybrid semantic match score and job recommendations
                </p>
              </div>
            </div>
          </div>

          {/* Preferred Job Types */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#1C1917] flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-[#0F766E]" />
              <span>Preferred Employment Types</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {JOB_TYPE_OPTIONS.map((type) => {
                const selected = (profile.preferred_job_types || []).includes(type);
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleJobType(type)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer active:scale-95 ${
                      selected
                        ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-xs'
                        : 'bg-[#FAF8F5] text-[#57534E] border-[#E7E5E4] hover:border-[#0F766E]/40 hover:text-[#1C1917]'
                    }`}
                  >
                    {selected ? `✓ ${type}` : `+ ${type}`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target Roles */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#1C1917]">Target Job Roles</label>
              <span className="text-[11px] font-semibold text-[#78716C]">
                {(profile.preferred_roles || []).length} selected
              </span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addRole();
                  }
                }}
                placeholder="Add target role (e.g. Backend Developer) and press Enter..."
                className="flex-1 px-3.5 py-2 text-xs font-medium text-[#1C1917] bg-[#FAF8F5]/80 hover:bg-white focus:bg-white rounded-xl border border-[#E7E5E4] focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/10"
              />
              <button
                type="button"
                onClick={() => addRole()}
                className="px-4 py-2 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold inline-flex items-center gap-1 cursor-pointer active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-0.5">
              {(profile.preferred_roles || []).map((role) => (
                <span
                  key={role}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F0FDFA] text-[#0F766E] border border-[#99F6E4] text-xs font-semibold"
                >
                  <span>{role}</span>
                  <button
                    type="button"
                    onClick={() => removeRole(role)}
                    className="hover:text-red-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#78716C] pt-1">
              <span className="font-semibold text-[#1C1917]">Suggestions:</span>
              {SUGGESTED_ROLES.filter((r) => !(profile.preferred_roles || []).includes(r)).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => addRole(role)}
                  className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#E7E5E4] hover:bg-[#CCFBF1] hover:text-[#0F766E] font-semibold transition-colors cursor-pointer"
                >
                  + {role}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Match Score Threshold */}
          <div className="space-y-2 pt-2 border-t border-[#E7E5E4]/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#1C1917] flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#0F766E]" />
                <span>Minimum Match Alert Threshold</span>
              </span>
              <span className="font-extrabold text-[#0F766E]">
                {profile.min_match_score || 70}%+
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5 p-1 rounded-xl bg-[#F3EFEA] border border-[#E7E5E4]/80">
              {MATCH_SCORE_PRESETS.map((threshold) => (
                <button
                  key={threshold}
                  type="button"
                  onClick={() => {
                    onProfileChange({ ...profile, min_match_score: threshold });
                    onNotifPrefsChange({ ...notifPrefs, min_match_score: threshold });
                  }}
                  className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    Number(profile.min_match_score || 70) === threshold
                      ? 'bg-[#0F766E] text-white shadow-xs'
                      : 'text-[#78716C] hover:text-[#1C1917] hover:bg-white/50'
                  }`}
                >
                  {threshold}%
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Smart Alert Delivery Channels (Seeker & Recruiter) */}
      <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E7E5E4]">
          <Bell className={`w-5 h-5 ${accentText}`} />
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">Notification Channels</h3>
            <p className="text-[11px] text-[#78716C]">Control how JobHub delivers placement & match alerts</p>
          </div>
        </div>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] cursor-pointer hover:bg-white transition-colors">
            <div className="flex items-center gap-3">
              <Mail className={`w-4 h-4 ${accentText}`} />
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Email Digest & Match Alerts</p>
                <p className="text-[11px] text-[#78716C]">Receive updates for high-match postings and status changes</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(notifPrefs?.email_alerts)}
              onChange={(e) => onNotifPrefsChange({ ...notifPrefs, email_alerts: e.target.checked })}
              className={`w-4 h-4 cursor-pointer ${isRecruiter ? 'accent-[#F97316]' : 'accent-[#0F766E]'}`}
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E5E4] cursor-pointer hover:bg-white transition-colors">
            <div className="flex items-center gap-3">
              <Bell className={`w-4 h-4 ${accentText}`} />
              <div>
                <p className="text-xs font-bold text-[#1C1917]">In-App Real-Time Alerts</p>
                <p className="text-[11px] text-[#78716C]">Instant WebSocket notifications in the navigation bell</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={Boolean(notifPrefs?.in_app_alerts)}
              onChange={(e) => onNotifPrefsChange({ ...notifPrefs, in_app_alerts: e.target.checked })}
              className={`w-4 h-4 cursor-pointer ${isRecruiter ? 'accent-[#F97316]' : 'accent-[#0F766E]'}`}
            />
          </label>
        </div>
      </div>
    </div>
  );
}

