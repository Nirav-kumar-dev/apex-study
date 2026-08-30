import React, { useState } from 'react';
import { X, CheckCircle, Repeat, AlertTriangle, BookOpen, Star, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getConfidenceBadge } from '../../lib/utils';

interface ActiveRecallModalProps {
  chapterId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ActiveRecallModal: React.FC<ActiveRecallModalProps> = ({ chapterId, isOpen, onClose }) => {
  const { chapters, subjects, errorLogs, updateChapterConfidence, completeRevision, revisions } = useApp();

  const [confidenceRating, setConfidenceRating] = useState<1 | 2 | 3 | 4 | 5>(4);
  const [activeTab, setActiveTab] = useState<'review' | 'rate'>('review');

  if (!isOpen || !chapterId) return null;

  const chapter = chapters.find(c => c.id === chapterId);
  const subject = chapter ? subjects.find(s => s.id === chapter.subjectId) : null;
  const chapterErrors = errorLogs.filter(e => e.chapterId === chapterId || e.chapterName === chapter?.name);

  // Find linked revision if any
  const linkedRevision = revisions.find(r => r.chapterId === chapterId && r.status !== 'completed');

  const handleFinish = () => {
    if (chapter) {
      if (linkedRevision) {
        completeRevision(linkedRevision.id, confidenceRating);
      } else {
        updateChapterConfidence(chapter.id, confidenceRating);
      }
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Repeat className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-indigo-400">
                {subject?.name || 'Subject'} • Spaced Active Recall
              </div>
              <h2 className="font-bold text-base text-white truncate max-w-md">{chapter?.name}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {activeTab === 'review' ? (
            <>
              {/* Revision Goal */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/30">
                <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-1">
                  <span>Spaced Repetition Stage {chapter?.revisionCount || 1} of 5</span>
                  <span>Previous Conf: {chapter?.confidenceLevel}/5</span>
                </div>
                <p className="text-xs text-slate-200">
                  Try to recall core theorems, formulas, and derivations on scratch paper before glancing at notes below!
                </p>
              </div>

              {/* Key Topics / Syllabus Coverage */}
              {chapter?.keyTopics && chapter.keyTopics.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Key Concepts to Recall</span>
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {chapter.keyTopics.map((topic, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-850 border border-slate-800 text-xs text-slate-200 flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        <span>{topic}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chapter Notes */}
              {chapter?.notes && (
                <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                    Your High-Yield Revision Notes
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">{chapter.notes}</p>
                </div>
              )}

              {/* Past Mistakes Recorded */}
              {chapterErrors.length > 0 && (
                <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-500/30">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Watch Out: Past Mistakes in this Chapter</span>
                  </span>
                  <div className="space-y-2">
                    {chapterErrors.map(err => (
                      <div key={err.id} className="text-xs text-rose-200/90 font-mono bg-rose-900/40 p-2 rounded-xl border border-rose-500/20">
                        • {err.mistake}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Rate Confidence Step */
            <div className="space-y-5 py-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-white">How confident do you feel after this revision?</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Your confidence score dynamically calculates the next spaced interval and updates your priority study plan.
                </p>
              </div>

              {/* 5-Star Confidence Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-2">
                {[1, 2, 3, 4, 5].map(lvl => {
                  const badge = getConfidenceBadge(lvl);
                  const isSelected = confidenceRating === lvl;

                  return (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setConfidenceRating(lvl as 1 | 2 | 3 | 4 | 5)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${badge.bg} ${badge.border} ring-2 ring-indigo-500`
                          : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-0.5">
                        <Star className={`w-4 h-4 ${isSelected ? 'fill-current text-amber-400' : 'text-slate-500'}`} />
                        <span className="font-extrabold text-sm text-white">{lvl}</span>
                      </div>
                      <span className={`text-[10px] font-semibold ${badge.color} leading-tight`}>{badge.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-navy-950/60">
          {activeTab === 'review' ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
              <button
                onClick={() => setActiveTab('rate')}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <span>Done Revising • Rate Confidence</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setActiveTab('review')}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Back to Notes
              </button>
              <button
                onClick={handleFinish}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Save & Advance Spaced Interval</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
