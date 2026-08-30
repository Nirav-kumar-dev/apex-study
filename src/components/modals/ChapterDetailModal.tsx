import React, { useState } from 'react';
import {
  X,
  Layers,
  Star,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Plus,
  Minus,
  Sparkles,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Chapter, Difficulty, ChapterStatus } from '../../types';
import { getConfidenceBadge, getDifficultyBadge } from '../../lib/utils';

interface ChapterDetailModalProps {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenActiveRecall?: (chapterId: string) => void;
}

export const ChapterDetailModal: React.FC<ChapterDetailModalProps> = ({
  chapter,
  isOpen,
  onClose,
  onOpenActiveRecall,
}) => {
  const { subjects, updateChapter, errorLogs, currentDate } = useApp();

  if (!isOpen || !chapter) return null;

  const subject = subjects.find(s => s.id === chapter.subjectId);
  const chapterErrors = errorLogs.filter(e => e.chapterId === chapter.id || e.chapterName === chapter.name);

  // Form state
  const [difficulty, setDifficulty] = useState<Difficulty>(chapter.difficulty);
  const [confidenceLevel, setConfidenceLevel] = useState<1 | 2 | 3 | 4 | 5>(chapter.confidenceLevel);
  const [completionPercentage, setCompletionPercentage] = useState<number>(chapter.completionPercentage);
  const [status, setStatus] = useState<ChapterStatus>(chapter.status);
  const [questionsSolved, setQuestionsSolved] = useState<number>(chapter.questionsSolved);
  const [targetQuestions, setTargetQuestions] = useState<number>(chapter.targetQuestions);
  const [notes, setNotes] = useState<string>(chapter.notes);

  const isMastered = completionPercentage >= 100 && confidenceLevel >= 4 && (chapter.revisionCount || 0) >= 2;

  const handleSave = () => {
    updateChapter(chapter.id, {
      difficulty,
      confidenceLevel,
      completionPercentage: Number(completionPercentage),
      status,
      questionsSolved: Number(questionsSolved),
      targetQuestions: Number(targetQuestions),
      notes: notes.trim(),
      isMastered,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md"
              style={{ backgroundColor: `${subject?.color || '#6366f1'}20`, borderColor: `${subject?.color || '#6366f1'}40` }}
            >
              <Layers className="w-5 h-5" style={{ color: subject?.color || '#6366f1' }} />
            </div>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {subject?.name} {chapter.subBranch ? `• ${chapter.subBranch}` : ''}
              </div>
              <h2 className="font-bold text-base text-white truncate max-w-md">{chapter.name}</h2>
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
          {/* Syllabus Status vs Mastery Banner */}
          <div className={`p-4 rounded-2xl border ${
            isMastered
              ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
              : completionPercentage >= 100
              ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300'
              : 'bg-slate-850 border-slate-800 text-slate-300'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  {isMastered
                    ? 'Chapter Mastered 🏆'
                    : completionPercentage >= 100
                    ? 'Syllabus Completed (Requires Revision & Mastery)'
                    : 'Learning In Progress'}
                </span>
              </div>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700">
                {questionsSolved}/{targetQuestions} Solved
              </span>
            </div>
            <p className="text-[11px] mt-1 opacity-80">
              {isMastered
                ? 'High confidence (4+), repeated spaced revisions done, questions practiced.'
                : '100% syllabus does not mean exam mastery. Continue problem practice and active recall.'}
            </p>
          </div>

          {/* Confidence Slider (1-5) */}
          <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300">Confidence Level</span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full border ${getConfidenceBadge(confidenceLevel).bg} ${getConfidenceBadge(confidenceLevel).border} ${getConfidenceBadge(confidenceLevel).color}`}>
                Level {confidenceLevel}: {getConfidenceBadge(confidenceLevel).label}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map(lvl => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setConfidenceLevel(lvl as 1 | 2 | 3 | 4 | 5)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center gap-1 ${
                    confidenceLevel === lvl
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  <Star className={`w-3.5 h-3.5 ${confidenceLevel === lvl ? 'fill-white' : ''}`} />
                  <span>{lvl}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty</label>
              <select
                value={difficulty}
                onChange={e => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 appearance-none capitalize"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Preparation Phase</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as ChapterStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 appearance-none capitalize"
              >
                <option value="learning">Learning Theory</option>
                <option value="practicing">Practicing Problems</option>
                <option value="revision">Spaced Revision Phase</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>

          {/* Questions Counter & Completion Percentage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800">
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Questions Solved</label>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setQuestionsSolved(prev => Math.max(0, prev - 5))}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-base font-extrabold text-white">
                  {questionsSolved} <span className="text-xs text-slate-400">/ {targetQuestions}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setQuestionsSolved(prev => prev + 5)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-400">Syllabus Progress</label>
                <span className="text-xs font-bold text-indigo-400">{completionPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={completionPercentage}
                onChange={e => setCompletionPercentage(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Revision Notes & Key Formulas</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-sans"
              placeholder="Add key formulas, theorem constraints, and personal study tips..."
            />
          </div>

          {/* Recorded Chapter Errors */}
          {chapterErrors.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-rose-950/25 border border-rose-500/30">
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Recorded Mistakes ({chapterErrors.length})</span>
              </span>
              <div className="space-y-1.5">
                {chapterErrors.map(err => (
                  <div key={err.id} className="text-xs text-rose-200/90 font-mono bg-rose-900/40 p-2 rounded-xl border border-rose-500/20">
                    • {err.mistake}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-navy-950/60">
          {onOpenActiveRecall ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenActiveRecall(chapter.id);
              }}
              className="px-4 py-2.5 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-600/30 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Active Recall</span>
            </button>
          ) : <div />}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
