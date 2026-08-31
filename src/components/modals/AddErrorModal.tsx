import React, { useState } from 'react';
import { X, AlertCircle, BookOpen, Layers, Tag, HelpCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ErrorCategory } from '../../types';
import { CATEGORY_LABELS } from '../../lib/errorIntelligence';

interface AddErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddErrorModal: React.FC<AddErrorModalProps> = ({ isOpen, onClose }) => {
  const { subjects, chapters, addErrorLog, currentDate } = useApp();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [chapterId, setChapterId] = useState('');
  const [mistake, setMistake] = useState('');
  const [category, setCategory] = useState<ErrorCategory>('calculation');
  const [correctedUnderstanding, setCorrectedUnderstanding] = useState('');
  const [source, setSource] = useState('Maths Mock 2 / Self Practice');
  const [severity, setSeverity] = useState<'critical' | 'moderate' | 'minor'>('moderate');

  if (!isOpen) return null;

  const filteredChapters = chapters.filter(c => c.subjectId === subjectId);
  const selectedChapter = chapters.find(c => c.id === chapterId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mistake.trim() || !subjectId) return;

    addErrorLog({
      subjectId,
      chapterId: chapterId || undefined,
      chapterName: selectedChapter?.name,
      mistake: mistake.trim(),
      category,
      correctedUnderstanding: correctedUnderstanding.trim() || 'Review the correct formula/procedure before next mock test.',
      date: currentDate,
      occurrenceCount: 1,
      source: source.trim() || 'Practice Session',
      severity,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Log Error in Notebook</h2>
              <p className="text-xs text-slate-400">Track and eradicate repeated exam mistakes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Subject & Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject *</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={subjectId}
                  onChange={e => {
                    setSubjectId(e.target.value);
                    setChapterId('');
                  }}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chapter</label>
              <div className="relative">
                <Layers className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={chapterId}
                  onChange={e => setChapterId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  <option value="">-- General Topic --</option>
                  {filteredChapters.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Error Category *</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(CATEGORY_LABELS) as ErrorCategory[]).map(cat => {
                const meta = CATEGORY_LABELS[cat];
                const isSelected = category === cat;

                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`p-2.5 rounded-xl border text-left transition-all text-xs font-semibold ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="block truncate">{meta.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* What went wrong? */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">What was the mistake? *</label>
            <textarea
              required
              rows={2}
              placeholder="e.g. Forgot to reverse positive/negative sign when transposing term across equals sign."
              value={mistake}
              onChange={e => setMistake(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
            />
          </div>

          {/* Correct understanding */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Correct Rule / Key Takeaway</span>
              <span className="text-[10px] text-slate-400 font-normal">How to prevent next time</span>
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Always write transposition in two deliberate steps rather than doing mental leaps."
              value={correctedUnderstanding}
              onChange={e => setCorrectedUnderstanding(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-sans"
            />
          </div>

          {/* Source & Severity */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Source Exam / Worksheet</label>
              <input
                type="text"
                placeholder="e.g. Mock Test 2 Section B"
                value={source}
                onChange={e => setSource(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Severity</label>
              <select
                value={severity}
                onChange={e => setSeverity(e.target.value as 'critical' | 'moderate' | 'minor')}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 appearance-none capitalize"
              >
                <option value="critical">Critical (High Mark Loss)</option>
                <option value="moderate">Moderate</option>
                <option value="minor">Minor Slip</option>
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 active:scale-95 transition-all"
            >
              Save to Error Notebook
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
