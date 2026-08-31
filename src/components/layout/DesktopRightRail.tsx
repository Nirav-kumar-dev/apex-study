import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Calendar,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Plus,
  ArrowUpRight,
  Repeat,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getDaysLeft } from '../../lib/utils';
import { analyzeErrorPatterns } from '../../lib/errorIntelligence';

interface DesktopRightRailProps {
  onOpenAddErrorModal: () => void;
  onOpenActiveRecallModal: (chapterId: string) => void;
}

export const DesktopRightRail: React.FC<DesktopRightRailProps> = ({
  onOpenAddErrorModal,
  onOpenActiveRecallModal,
}) => {
  const {
    isRightRailOpen,
    toggleRightRail,
    exams,
    revisions,
    chapters,
    subjects,
    errorLogs,
    tasks,
    currentDate,
    setActiveView,
    startFocusSession,
  } = useApp();

  if (!isRightRailOpen) {
    return (
      <div className="hidden xl:flex flex-col items-center justify-start py-4 px-1 border-l border-slate-800 bg-navy-950/60 sticky top-0 h-screen">
        <button
          onClick={toggleRightRail}
          title="Expand contextual panel"
          className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all border border-slate-700/60 shadow"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Sorted exams
  const sortedExams = [...exams].sort((a, b) => {
    const diffA = getDaysLeft(a.date, currentDate);
    const diffB = getDaysLeft(b.date, currentDate);
    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
    if (diffA >= 0) return -1;
    if (diffB >= 0) return 1;
    return diffB - diffA;
  });
  const upcomingExams = sortedExams.slice(0, 3);

  // Due revisions
  const dueRevisions = revisions.filter(
    r => r.status !== 'completed' && getDaysLeft(r.dueDate, currentDate) <= 0
  );

  // Errors summary
  const { topErrorCategory, mostCriticalMistake } = analyzeErrorPatterns(errorLogs);

  // Today completed tasks
  const todayTasks = tasks.filter(t => t.scheduledDate === currentDate);
  const completedToday = todayTasks.filter(t => t.status === 'completed').length;
  const totalToday = todayTasks.length;

  return (
    <aside className="hidden xl:flex w-80 flex-shrink-0 bg-navy-900/60 border-l border-slate-800/80 flex-col h-screen sticky top-0 backdrop-blur-xl z-10 select-none overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">Exam Radar</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
        <button
          onClick={toggleRightRail}
          title="Collapse panel"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Daily Goal & Streak Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-850 to-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Study Streak</span>
            </div>
            <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
              Day 14 🔥
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300 mt-3">
            <span>Today&apos;s Goal</span>
            <span className="font-semibold text-white">
              {completedToday} of {totalToday} tasks
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${totalToday > 0 ? (completedToday / totalToday) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Due Revisions Alert Widget */}
        <div className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Repeat className="w-3.5 h-3.5 text-amber-400" />
              <span>Revisions Due Today</span>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
              {dueRevisions.length}
            </span>
          </div>

          {dueRevisions.length === 0 ? (
            <div className="p-3 rounded-xl bg-slate-900/60 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All spaced revisions up to date!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {dueRevisions.slice(0, 3).map(rev => {
                const chap = chapters.find(c => c.id === rev.chapterId);
                const sub = subjects.find(s => s.id === rev.subjectId);
                if (!chap || !sub) return null;

                return (
                  <div
                    key={rev.id}
                    className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: sub.color }}>
                        {sub.name}
                      </div>
                      <div className="text-xs font-medium text-slate-200 truncate">{chap.name}</div>
                      <div className="text-[10px] text-slate-400">Stage {rev.stage} • Conf: {chap.confidenceLevel}/5</div>
                    </div>
                    <button
                      onClick={() => onOpenActiveRecallModal(chap.id)}
                      className="px-2 py-1 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1 shadow-sm"
                    >
                      <span>Revise</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => setActiveView('revision')}
            className="w-full mt-2.5 text-center text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors flex items-center justify-center gap-1"
          >
            <span>Open Spaced Repetition Queue</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Most Frequent Mistake Diagnostic */}
        {topErrorCategory && mostCriticalMistake && (
          <div className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Critical Weakness Alert</span>
              </div>
              <button
                onClick={onOpenAddErrorModal}
                title="Log a mistake"
                className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <p className="text-[11px] font-bold text-white line-clamp-1">{mostCriticalMistake.chapterName || 'Maths & Physics'}</p>
            <p className="text-[11px] text-rose-200/90 mt-1 line-clamp-2 leading-relaxed bg-rose-900/30 p-2 rounded-lg border border-rose-500/20 font-mono text-[10px]">
              &ldquo;{mostCriticalMistake.mistake}&rdquo;
            </p>
            <div className="mt-2 text-[10px] text-slate-300">
              <span className="font-semibold text-rose-300">Action Tip:</span> {topErrorCategory.recommendation}
            </div>
          </div>
        )}

        {/* Upcoming Exam Timeline */}
        <div className="p-3.5 rounded-2xl bg-slate-850/90 border border-slate-800">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Upcoming Dates</span>
            </div>
            <button
              onClick={() => setActiveView('exams')}
              className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300"
            >
              View All
            </button>
          </div>

          <div className="space-y-2">
            {upcomingExams.map(exam => {
              const dLeft = getDaysLeft(exam.date, currentDate);
              const isUrgent = dLeft <= 14;

              return (
                <div
                  key={exam.id}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-white">{exam.subjectName}</div>
                    <div className="text-[10px] text-slate-400">{formatDate(exam.date)}</div>
                  </div>
                  <div
                    className={`text-xs font-extrabold px-2 py-0.5 rounded-lg border ${
                      isUrgent
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}
                  >
                    {dLeft}d
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
};
