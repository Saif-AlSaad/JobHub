import React, { useState } from 'react';
import { X, Check, Plus, Trash2, Sparkles, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function ResumeReviewModal({ isOpen, onClose, extractedData, onConfirmed }) {
  if (!isOpen || !extractedData) return null;

  const [formData, setFormData] = useState({
    full_name: extractedData.full_name || '',
    headline: extractedData.headline || '',
    phone: extractedData.phone || '',
    preferred_location_name: extractedData.preferred_location_name || 'Dhaka, Bangladesh',
    skills: extractedData.skills || [],
    education: extractedData.education || [],
    experience: extractedData.experience || [],
    projects: extractedData.projects || [],
    certifications: extractedData.certifications || []
  });

  const [newSkill, setNewSkill] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, newSkill.trim()]
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      await api.post('/resume/confirm-profile', formData);
      onConfirmed();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update career profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-container max-w-3xl w-full max-h-[90vh] flex flex-col shadow-modal border border-border animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-border flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-light text-brand flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-primary">Review Your AI-Generated Profile</h3>
              <p className="text-xs text-secondary">
                AI extracted this information from your resume. Review and edit any field before confirming.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-secondary hover:text-primary p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {error && (
            <div className="p-3 bg-danger-bg border border-danger-border text-danger text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-secondary mb-1">Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-secondary mb-1">Professional Headline</label>
              <input
                type="text"
                value={formData.headline}
                onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-secondary mb-1">Preferred Location</label>
              <input
                type="text"
                value={formData.preferred_location_name}
                onChange={(e) => setFormData({ ...formData, preferred_location_name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-input border border-border focus-ring"
              />
            </div>
          </div>

          {/* Skills Management */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">
              Extracted Technical Skills ({formData.skills.length})
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3 p-3 bg-slate-50 rounded-card border border-border/80 min-h-[50px]">
              {formData.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-border text-xs font-medium text-primary shadow-2xs"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-secondary hover:text-danger"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

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
                placeholder="Add missing skill (e.g. Docker, AWS, React)"
                className="flex-1 px-3 py-1.5 text-xs rounded-input border border-border focus-ring"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-3 py-1.5 rounded-input bg-slate-100 hover:bg-slate-200 text-xs font-medium text-primary flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Education Breakdown */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">Education Background</label>
            <div className="space-y-2">
              {formData.education.map((edu, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-card border border-border/70 text-xs flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-primary">{edu.degree}</p>
                    <p className="text-secondary">{edu.university} • CGPA: {edu.cgpa || 'N/A'}</p>
                  </div>
                  <span className="text-[11px] font-medium text-secondary">Class of {edu.graduation_year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Breakdown */}
          <div>
            <label className="block text-xs font-semibold text-secondary mb-2">Projects</label>
            <div className="space-y-2">
              {formData.projects.map((proj, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-card border border-border/70 text-xs">
                  <p className="font-semibold text-primary">{proj.title}</p>
                  <p className="text-secondary mt-0.5">{proj.description}</p>
                  {proj.tech_stack && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {proj.tech_stack.map((t, i) => (
                        <span key={i} className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-border flex items-center justify-between bg-slate-50 rounded-b-container">
          <p className="text-xs text-secondary">
            Clicking confirm will update your profile and recalculate job match scores.
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-secondary hover:text-primary rounded-input"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand hover:bg-brand-hover rounded-input flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              {submitting ? 'Confirming...' : 'Confirm Profile'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
