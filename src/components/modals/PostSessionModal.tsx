import React, { useState } from 'react';
import { Star, CheckCircle, Sparkles, Clock, BookOpen, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyTask } from '../../types';
import { getConfidenceBadge } from '../../lib/utils';

interface PostSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: StudyTask | null;
  durationMinutes: number;
}

export const PostSessionModal: React.FC<PostSessionModalProps> = ({
  isOpen,
  onClose,
  task,
  durationMinutes,
}) => {
  const { completeFocusSession, subjects, chapters, currentDate } = useApp();

  const [confidenceRating, setConfidenceRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const subject = task ? subjects.find(s => s.id === task.subjectId) : subjects[0];
  const chapter = task?.chapterId ? chapters.find(c => c.id === task.chapterId) : undefined;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject) return;

    completeFocusSession(
      {
        taskId: task?.id,
        subjectId: subject.id,
        chapterId: chapter?.id,
        durationMinutes,
        date: currentDate,
        confidenceRating,
        taskType: task?.taskType || 'practice',
        notes: notes.trim() || `Completed ${durationMinutes} min focus session on ${task?.title || subject.name}`,
      },
      confidenceRating
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
        {/* Celebration Header */}
        <div className="p-6 border-b border-slate-800 text-center bg-gradient-to-b from-indigo-950/40 to-navy-900">
          <div className="w-14 h-14 rounded-3xl bg-gradient-to-tr from-emerald-500 to-cyan-500 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/25">
            <CheckCircle className="w-7 h-7" />
          </div>
          <h2 className="font-extrabold text-xl text-white">Focus Session Complete! 🎉</h2>
          <p className="text-xs text-slate-400 mt-1">
            Logged <span className="text-white font-bold">{durationMinutes} minutes</span> of deep study
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Task Info Pill */}
          <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold"
                style={{ backgroundColor: `${subject?.color || '#6366f1'}25`, color: subject?.color || '#6366f1' }}
              >
                {subject?.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-white truncate">{task?.title || subject?.name}</div>
                {chapter && <div className="text-[10px] text-slate-400 truncate">{chapter.name}</div>}
              </div>
            </div>
            <span className="text-xs font-extrabold text-indigo-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>{durationMinutes}m</span>
            </span>
          </div>

          {/* Key Question: How confident do you feel? */}
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <label className="text-xs font-bold text-white">How confident do you feel with this topic now?</label>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              This score directly calibrates your next spaced revision date and daily priority algorithm.
            </p>

            <div className="space-y-2">
              {[
                { lvl: 5, label: '5 — Can teach someone else', desc: 'Mastered concepts, high accuracy, clear derivations' },
                { lvl: 4, label: '4 — Confident', desc: 'Solved standard questions with ease, minor check needed' },
                { lvl: 3, label: '3 — Understandable', desc: 'Got the gist, but need another practice pass' },
                { lvl: 2, label: '2 — Need revision', desc: 'Felt shaky on formulas or multi-step logic' },
                { lvl: 1, label: '1 — Completely confused', desc: 'Requires step-by-step re-learning from basics' },
              ].map(opt => {
                const isSelected = confidenceRating === opt.lvl;
                const badge = getConfidenceBadge(opt.lvl);

                return (
                  <button
                    key={opt.lvl}
                    type="button"
                    onClick={() => setConfidenceRating(opt.lvl as 1 | 2 | 3 | 4 | 5)}
                    className={`w-full p-3 rounded-2xl border text-left transition-all flex items-center justify-between group ${
                      isSelected
                        ? `${badge.bg} ${badge.border} ring-2 ring-indigo-500 text-white shadow-md`
                        : 'bg-slate-850/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                        {opt.lvl}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {opt.label}
                        </div>
                        <div className="text-[10px] text-slate-400">{opt.desc}</div>
                      </div>
                    </div>
                    <Star className={`w-4 h-4 ${isSelected ? 'fill-amber-400 text-amber-400' : 'text-slate-600'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick reflection notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Session Takeaway (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Solved 12 numericals. Need to review question 8 graph derivation."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Action */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 active:scale-98 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Record Session & Update Study Plan</span>
          </button>
        </form>
      </div>
    </div>
  );
};
