import React, { useState } from 'react';
import {
  Briefcase,
  FolderGit2,
  Award,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

const SECTION_CONFIGS = {
  experience: {
    title: 'Work & Internship Experience',
    subtitle: 'Boosts AI Education & Experience fit score',
    emptyText: 'No internships or work experience added yet.',
    addLabel: 'Add Experience',
    icon: Briefcase,
    emptyItem: { title: '', company: '', duration: '', description: '' },
    fields: [
      { key: 'title', label: 'Role / Position Title', placeholder: 'e.g. Software Engineering Intern', required: true },
      { key: 'company', label: 'Company / Organization', placeholder: 'e.g. TechNova Labs', required: true },
      { key: 'duration', label: 'Duration', placeholder: 'e.g. Jun 2025 - Dec 2025', fullWidth: true },
      { key: 'description', label: 'Key Responsibilities & Impact', placeholder: 'Describe APIs, features, or optimizations delivered...', type: 'textarea', fullWidth: true },
    ],
  },
  projects: {
    title: 'Portfolio & Capstone Projects',
    subtitle: '2+ projects unlocks maximum AI portfolio boost',
    emptyText: 'No projects added yet. Add capstone or GitHub projects.',
    addLabel: 'Add Project',
    icon: FolderGit2,
    emptyItem: { title: '', description: '', tech_stack: [], link: '' },
    fields: [
      { key: 'title', label: 'Project Title', placeholder: 'e.g. AI Semantic Job Matching Portal', required: true },
      { key: 'link', label: 'Repository / Live URL', placeholder: 'https://github.com/username/project' },
      { key: 'tech_stack', label: 'Tech Stack (comma-separated)', placeholder: 'e.g. Python, FastAPI, React, PostgreSQL', type: 'tags', fullWidth: true },
      { key: 'description', label: 'Project Summary', placeholder: 'Briefly explain architecture, problem solved, and results...', type: 'textarea', fullWidth: true },
    ],
  },
  certifications: {
    title: 'Certifications & Credentials',
    subtitle: 'Verified courses, badges, and technical training',
    emptyText: 'No certifications listed yet.',
    addLabel: 'Add Certification',
    icon: Award,
    emptyItem: { title: '', issuer: '', year: new Date().getFullYear() },
    fields: [
      { key: 'title', label: 'Certification Name', placeholder: 'e.g. Meta Certified Front-End Developer', required: true, fullWidth: true },
      { key: 'issuer', label: 'Issuing Organization', placeholder: 'e.g. Coursera / AWS / Google', required: true },
      { key: 'year', label: 'Year Earned', placeholder: '2025', type: 'number' },
    ],
  },
};

function normalizeDraftForEdit(type, item) {
  if (type === 'projects') {
    const stack = Array.isArray(item.tech_stack) ? item.tech_stack.join(', ') : item.tech_stack || '';
    return { ...item, tech_stack: stack };
  }
  return { ...item };
}

function finalizeDraft(type, draft) {
  if (type === 'projects') {
    const raw = typeof draft.tech_stack === 'string' ? draft.tech_stack : '';
    const tech_stack = raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    return { ...draft, tech_stack };
  }
  if (type === 'certifications') {
    return { ...draft, year: parseInt(draft.year, 10) || new Date().getFullYear() };
  }
  return draft;
}

export default function ProfileCareerRecords({ type, items = [], onChange }) {
  const config = SECTION_CONFIGS[type];
  const Icon = config.icon;

  const [editingIndex, setEditingIndex] = useState(null); // null = closed, -1 = adding new, >=0 = editing
  const [draft, setDraft] = useState(config.emptyItem);

  const openAddForm = () => {
    setDraft(normalizeDraftForEdit(type, config.emptyItem));
    setEditingIndex(-1);
  };

  const openEditForm = (index) => {
    setDraft(normalizeDraftForEdit(type, items[index]));
    setEditingIndex(index);
  };

  const closeForm = () => {
    setEditingIndex(null);
    setDraft(config.emptyItem);
  };

  const handleSaveItem = (e) => {
    e.preventDefault();
    const cleaned = finalizeDraft(type, draft);
    if (!cleaned.title?.trim()) return;

    const next = [...items];
    if (editingIndex === -1) {
      next.unshift(cleaned);
    } else {
      next[editingIndex] = cleaned;
    }
    onChange(next);
    closeForm();
  };

  const handleDeleteItem = (index) => {
    onChange(items.filter((_, idx) => idx !== index));
    if (editingIndex === index) closeForm();
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-[24px] border border-[#E7E5E4] p-6 sm:p-7 shadow-[0_2px_12px_rgba(28,25,23,0.03)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#E7E5E4]">
        <div className="flex items-center gap-2.5">
          <Icon className="w-5 h-5 text-[#0F766E]" />
          <div>
            <h3 className="text-base font-bold text-[#1C1917]">{config.title}</h3>
            <p className="text-[11px] text-[#78716C] font-medium">{config.subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#CCFBF1] text-[#0F766E] border border-[#99F6E4]">
            {items.length} {items.length === 1 ? 'entry' : 'entries'}
          </span>
          {editingIndex === null && (
            <button
              type="button"
              onClick={openAddForm}
              className="px-3.5 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{config.addLabel}</span>
            </button>
          )}
        </div>
      </div>

      {/* Inline Add / Edit Form */}
      {editingIndex !== null && (
        <form
          onSubmit={handleSaveItem}
          className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border border-[#99F6E4] space-y-3.5 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#0F766E]">
              {editingIndex === -1 ? `New ${type.slice(0, -1)} entry` : 'Edit entry'}
            </span>
            <button
              type="button"
              onClick={closeForm}
              className="text-[#78716C] hover:text-[#1C1917] p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {config.fields.map((field) => (
              <div key={field.key} className={field.fullWidth ? 'sm:col-span-2 space-y-1' : 'space-y-1'}>
                <label className="block text-[11px] font-bold text-[#1C1917]">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={2}
                    required={field.required}
                    value={draft[field.key] ?? ''}
                    onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full p-2.5 text-xs font-medium text-[#1C1917] bg-white rounded-xl border border-[#E7E5E4] focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/10"
                  />
                ) : (
                  <input
                    type={field.type === 'number' ? 'number' : 'text'}
                    required={field.required}
                    value={draft[field.key] ?? ''}
                    onChange={(e) => setDraft({ ...draft, [field.key]: e.target.value })}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 text-xs font-medium text-[#1C1917] bg-white rounded-xl border border-[#E7E5E4] focus:border-[#0F766E] focus:outline-none focus:ring-3 focus:ring-[#0F766E]/10"
                  />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeForm}
              className="px-3.5 py-1.5 rounded-xl border border-[#E7E5E4] bg-white text-xs font-semibold text-[#78716C] hover:text-[#1C1917] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#115E59] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{editingIndex === -1 ? 'Add Entry' : 'Update Entry'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Existing Entries List */}
      {items.length === 0 ? (
        <div className="p-6 text-center rounded-2xl bg-[#FAF8F5] border border-dashed border-[#E7E5E4] text-xs text-[#78716C]">
          {config.emptyText}
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={`${type}-${idx}-${item.title}`}
              className="p-4 rounded-2xl bg-[#FAF8F5]/80 border border-[#E7E5E4] hover:border-[#99F6E4] transition-colors flex items-start justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-[#1C1917]">{item.title}</h4>
                  {item.duration && (
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E5E4] text-[11px] font-semibold text-[#78716C]">
                      {item.duration}
                    </span>
                  )}
                  {item.year && (
                    <span className="px-2 py-0.5 rounded-md bg-white border border-[#E7E5E4] text-[11px] font-semibold text-[#0F766E]">
                      {item.year}
                    </span>
                  )}
                </div>

                {(item.company || item.issuer) && (
                  <p className="text-xs font-semibold text-[#0F766E]">
                    {item.company || item.issuer}
                  </p>
                )}

                {item.description && (
                  <p className="text-xs text-[#57534E] leading-relaxed">{item.description}</p>
                )}

                {Array.isArray(item.tech_stack) && item.tech_stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {item.tech_stack.map((tech, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-2 py-0.5 rounded-full bg-[#CCFBF1]/70 text-[#0F766E] border border-[#99F6E4]/70 text-[10px] font-bold"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {item.link && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F766E] hover:underline pt-0.5"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span className="truncate max-w-xs">{item.link}</span>
                  </a>
                )}
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => openEditForm(idx)}
                  title="Edit"
                  className="p-1.5 rounded-lg text-[#78716C] hover:text-[#0F766E] hover:bg-white transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(idx)}
                  title="Delete"
                  className="p-1.5 rounded-lg text-[#78716C] hover:text-red-600 hover:bg-white transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

