import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileText,
  FileCheck,
  Sparkles,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ResumeUploadPage() {
  const { user, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);

  // Check if resume is already uploaded
  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await api.get('/resume/status');
        if (res.data?.has_resume) {
          setUploadedFile({
            name: res.data.resume_filename || 'Uploaded Resume',
            url: res.data.resume_url,
          });
        }
      } catch (err) {
        console.error('Error checking resume status:', err);
      }
    }
    checkExisting();
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

      // Attempt upload endpoint, fallback to parse-upload if needed
      let res;
      try {
        res = await api.post('/resume/upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } catch {
        res = await api.post('/resume/parse-upload', data, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      const filename = res.data?.filename || file.name;
      const resumeUrl = res.data?.resume_url || `/uploads/${filename}`;

      setUploadedFile({ name: filename, url: resumeUrl });

      if (typeof updateUserProfile === 'function') {
        updateUserProfile({
          resume_filename: filename,
          resume_url: resumeUrl,
        });
      }

      // Automatically proceed to update profile page after brief confirmation
      setTimeout(() => {
        navigate('/update-profile');
      }, 900);
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to upload resume. Please try again.');
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:py-14 space-y-6">
      {/* Onboarding Header Banner */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-8 shadow-[0_4px_20px_-2px_rgba(28,25,23,0.05)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] text-[11px] font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Step 1 of 2 • Resume Attachment
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#1C1917] tracking-tight font-heading">
              Upload Your Resume
            </h1>
            <p className="text-xs sm:text-sm text-[#78716C] leading-relaxed">
              Welcome, <span className="font-bold text-[#1C1917]">{user?.full_name || 'Candidate'}</span>! Please attach your CV or resume document. In the next step, you will configure your profile details.
            </p>
          </div>

          {/* Stepper Pill Indicator */}
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] p-1.5 rounded-xl border border-[#E7E5E4] self-start sm:self-auto text-xs font-bold">
            <span className="px-3 py-1.5 rounded-lg bg-white text-[#0F766E] shadow-xs flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              1. Resume
            </span>
            <ChevronRight className="w-3 h-3 text-[#A8A29E]" />
            <span className="px-3 py-1.5 rounded-lg text-[#A8A29E] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              2. Profile Setup
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Upload Card */}
      <div className="bg-white rounded-[20px] border border-[#E7E5E4] p-6 sm:p-10 shadow-[0_2px_8px_rgba(28,25,23,0.03)] space-y-6">
        <div className="border-b border-[#E7E5E4] pb-4">
          <h2 className="text-base font-bold text-[#1C1917] font-heading flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#0F766E]" />
            Select or Drop Resume Document
          </h2>
          <p className="text-xs text-[#78716C] mt-0.5">
            Accepted formats: PDF, DOCX, or TXT up to 5 MB.
          </p>
        </div>

        {/* Drag & Drop Zone */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-[18px] p-8 sm:p-16 text-center cursor-pointer transition-all ${
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
              <RefreshCw className="w-10 h-10 text-[#0F766E] animate-spin" />
              <p className="text-sm font-bold text-[#1C1917]">Uploading Resume Document...</p>
              <p className="text-xs text-[#78716C]">Attaching file to your JobHub candidate account</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4] flex items-center justify-center shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1C1917]">
                  Click to select resume or drag & drop here
                </p>
                <p className="text-xs text-[#78716C]">
                  PDF, DOCX, or TXT • Maximum file size 5MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Uploaded File Confirmation */}
        {uploadedFile && (
          <div className="p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#D1FAE5] text-[#047857] flex items-center justify-center flex-shrink-0">
                <FileCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#047857]">Resume Document Attached</p>
                <p className="text-xs text-[#065F46] font-medium">{uploadedFile.name}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/update-profile')}
              className="px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <span>Continue to Profile Setup</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Security / Quality Note */}
        <div className="flex items-center gap-2 pt-2 text-[#78716C] text-[11px]">
          <ShieldCheck className="w-4 h-4 text-[#0F766E] flex-shrink-0" />
          <span>Your resume is stored securely and presented to recruiters when you apply.</span>
        </div>
      </div>
    </div>
  );
}
