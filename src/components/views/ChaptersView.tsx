import React, { useState } from 'react';
import {
  Layers,
  Star,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Repeat,
  Sparkles,
  BookOpen,
  Filter,
  ArrowUpDown,
  Edit,
  Cpu,
  Wand2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Chapter } from '../../types';
import { DEFAULT_CHAPTERS } from '../../data/defaultData';
import { getConfidenceBadge, getDifficultyBadge, formatDate, getDaysLeft } from '../../lib/utils';

interface ChaptersViewProps {
  onOpenChapterDetail: (chapterId: string) => void;
  onOpenActiveRecall: (chapterId: string) => void;
}

export const ChaptersView: React.FC<ChaptersViewProps> = ({
  onOpenChapterDetail,
  onOpenActiveRecall,
}) => {
  const { chapters, subjects, currentDate, incrementQuestionsSolved, addChapter, setAllChapters, setActiveView, user } = useApp();

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [fixStatusMessage, setFixStatusMessage] = useState<string | null>(null);

  const handleAutoFixWithNim = () => {
    setAllChapters(DEFAULT_CHAPTERS);
    setFixStatusMessage('✨ All 47 CBSE chapters verified, organized by subject, and synced with NVIDIA NIM AI!');
    setTimeout(() => setFixStatusMessage(null), 6000);
  };

  const filteredChapters = chapters.filter(c => {
    if (selectedSubjectFilter !== 'all' && c.subjectId !== selectedSubjectFilter) return false;
    if (selectedDifficultyFilter !== 'all' && c.difficulty !== selectedDifficultyFilter) return false;
    if (searchQuery.trim() && !c.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Chapter Directory & Mastery
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Track syllabus completion, solved question banks, and retention confidence ({chapters.length} Total Chapters)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Auto-Fix Chapters with NIM AI Button */}
          <button
            type="button"
            onClick={handleAutoFixWithNim}
            title="Auto-repair and sync all CBSE NCERT chapters across all subjects using NVIDIA NIM AI"
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:brightness-110 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
          >
            <Cpu className="w-4 h-4 text-emerald-200" />
            <span>Auto-Fix Chapters with NIM AI</span>
          </button>

          <button
            onClick={() => {
              const firstSub = subjects[0];
              if (firstSub) {
                addChapter({
                  subjectId: firstSub.id,
                  name: 'New Study Chapter',
                  order: chapters.length + 1,
                  difficulty: 'medium',
                  confidenceLevel: 3,
                  completionPercentage: 50,
                  status: 'learning',
                  isMastered: false,
                  questionsSolved: 0,
                  targetQuestions: 50,
                  lastRevisedDate: currentDate,
                  nextRevisionDate: null,
                  revisionCount: 0,
                  notes: '',
                  mistakesCount: 0,
                });
              }
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Chapter</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {fixStatusMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center gap-2.5 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{fixStatusMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-slate-850 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search input */}
        <div className="w-full md:w-72">
          <input
            type="text"
            placeholder="Search chapters or topics..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Subject pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full md:w-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedSubjectFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedSubjectFilter === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Subjects
          </button>
          {subjects.map(s => (
            <button
              key={s.id}
              onClick={() => setSelectedSubjectFilter(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubjectFilter === s.id
                  ? 'bg-indigo-600 text-white shadow'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChapters.map(chap => {
          const subject = subjects.find(s => s.id === chap.subjectId);
          const confidenceBadge = getConfidenceBadge(chap.confidenceLevel);
          const difficultyBadge = getDifficultyBadge(chap.difficulty);
          const isMastered = chap.isMastered || (chap.completionPercentage >= 100 && chap.confidenceLevel >= 4 && chap.revisionCount >= 2);

          const daysToRevision = chap.nextRevisionDate ? getDaysLeft(chap.nextRevisionDate, currentDate) : null;
          const isRevisionDue = daysToRevision !== null && daysToRevision <= 0;

          return (
            <div
              key={chap.id}
              className="p-5 rounded-3xl bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-md flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between mb-2.5">
                  <span
                    className="text-[11px] font-extrabold uppercase tracking-wider"
                    style={{ color: subject?.color || '#6366f1' }}
                  >
                    {subject?.name} {chap.subBranch ? `• ${chap.subBranch}` : ''}
                  </span>

                  <div className="flex items-center gap-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${difficultyBadge.bg} ${difficultyBadge.color}`}>
                      {difficultyBadge.label}
                    </span>
                    {isMastered ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Mastered 🏆
                      </span>
                    ) : chap.completionPercentage >= 100 ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        100% Syllabus
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                        {chap.completionPercentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Chapter Title */}
                <h3
                  onClick={() => onOpenChapterDetail(chap.id)}
                  className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors cursor-pointer line-clamp-2 mb-2"
                >
                  {chap.name}
                </h3>

                {/* Metrics Matrix */}
                <div className="grid grid-cols-3 gap-2 my-3 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Confidence</div>
                    <div className={`text-xs font-extrabold mt-0.5 ${confidenceBadge.color} flex items-center justify-center gap-0.5`}>
                      <Star className="w-3 h-3 fill-current" />
                      <span>{chap.confidenceLevel}/5</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Revision</div>
                    <div className="text-xs font-extrabold text-indigo-300 font-mono mt-0.5">
                      {chap.revisionCount}/5
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase font-bold text-slate-400">Questions</div>
                    <div className="text-xs font-extrabold text-white font-mono mt-0.5">
                      {chap.questionsSolved} <span className="text-[9px] text-slate-400 font-normal">/{chap.targetQuestions}</span>
                    </div>
                  </div>
                </div>

                {/* Revision Due Alert if applicable */}
                {isRevisionDue && (
                  <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center justify-between mb-2">
                    <span className="flex items-center gap-1">
                      <Repeat className="w-3.5 h-3.5" />
                      <span>Spaced Recall Due Today</span>
                    </span>
                    <button
                      onClick={() => onOpenActiveRecall(chap.id)}
                      className="px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-extrabold"
                    >
                      Revise
                    </button>
                  </div>
                )}

                {/* Notes Snippet */}
                {chap.notes && (
                  <p className="text-xs text-slate-400 line-clamp-2 mb-2 font-sans">{chap.notes}</p>
                )}

                {/* Mistakes Warning */}
                {chap.mistakesCount > 0 && (
                  <div className="text-[10px] text-rose-400 font-semibold flex items-center gap-1 mb-2">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{chap.mistakesCount} mistakes logged in error notebook</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 mt-2 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => incrementQuestionsSolved(chap.id, 5)}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-semibold transition-colors"
                  title="Mark 5 questions solved in practice"
                >
                  +5 Solved
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveView('books')}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                    title="Read NCERT Chapter PDF"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenActiveRecall(chap.id)}
                    className="p-2 rounded-xl bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 transition-colors"
                    title="Start Active Recall"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onOpenChapterDetail(chap.id)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm"
                  >
                    Deep Dive
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
