import React from 'react';
import {
  Sparkles,
  Timer,
  CheckCircle2,
  Calendar,
  Layers,
  Repeat,
  AlertCircle,
  Play,
  ArrowRight,
  TrendingUp,
  Clock,
  BookOpen,
  Award,
  ChevronRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate, getDaysLeft, getGreeting, getPriorityBadge } from '../../lib/utils';
import { calculateSubjectProgress } from '../../lib/utils';

interface DashboardViewProps {
  onOpenAddTask: () => void;
  onOpenAddError: () => void;
  onOpenActiveRecall: (chapterId: string) => void;
  onOpenChapterDetail: (chapterId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenAddTask,
  onOpenAddError,
  onOpenActiveRecall,
  onOpenChapterDetail,
}) => {
  const {
    user,
    exams,
    subjects,
    chapters,
    tasks,
    revisions,
    errorLogs,
    mockTests,
    sessionLogs,
    currentDate,
    completeTask,
    startFocusSession,
    setActiveView,
    generateAutoPlan,
  } = useApp();

  // Find target primary exam (e.g. Mathematics)
  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const nextExam = sortedExams[0];
  const daysLeft = nextExam ? getDaysLeft(nextExam.date, currentDate) : 0;
  const targetSubject = nextExam ? subjects.find(s => s.id === nextExam.subjectId) : subjects[0];

  // Subject progress calculation
  const targetProgress = targetSubject ? calculateSubjectProgress(targetSubject, chapters) : { syllabusPercent: 100, masteryPercent: 72 };

  // Revisions due
  const dueRevisions = revisions.filter(
    r => r.status !== 'completed' && getDaysLeft(r.dueDate, currentDate) <= 0
  );

  // Today's prioritized tasks
  const todayTasks = tasks
    .filter(t => t.scheduledDate === currentDate)
    .sort((a, b) => {
      // Pending first, then by priorityScore descending
      if (a.status === 'completed' && b.status !== 'completed') return 1;
      if (a.status !== 'completed' && b.status === 'completed') return -1;
      return b.priorityScore - a.priorityScore;
    });

  // Top urgent pending task for "What should I study right now?"
  const currentTopTask = todayTasks.find(t => t.status === 'pending');

  // Stats
  const totalCompletedStudyHours = subjects.reduce((acc, s) => acc + s.completedStudyHours, 0);
  const completedChaptersCount = chapters.filter(c => c.completionPercentage >= 100).length;
  const masteredChaptersCount = chapters.filter(c => c.isMastered).length;
  const latestMock = mockTests[mockTests.length - 1];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
            {getGreeting(user.name)}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-400 mt-1">
            <span className="font-semibold text-slate-300">
              {user.schoolName ? `${user.schoolName} • ` : ''}{user.examName} • {user.classGrade}
            </span>
            {user.targetScore && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 font-bold text-[11px]">
                🎯 Goal: {user.targetScore}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-semibold text-[11px]">
              {user.preferredStudySlot === 'morning'
                ? '🌅 Morning Focus (05:30-08:30)'
                : user.preferredStudySlot === 'afternoon'
                ? '☀️ Afternoon Slot (14:00-17:00)'
                : user.preferredStudySlot === 'night_owl'
                ? '🦉 Night Owl (21:30-00:30)'
                : '🌙 Evening Focus (17:30-21:30)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => generateAutoPlan()}
            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recalculate Plan</span>
          </button>
          <button
            onClick={onOpenAddTask}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5"
          >
            <span>+ Add Task</span>
          </button>
        </div>
      </div>

      {/* Hero: Large Exam Countdown Component */}
      {nextExam && (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-950/70 via-navy-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8 shadow-2xl">
          {/* Subtle background glow */}
          <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
          <div className="absolute right-32 bottom-0 w-48 h-48 rounded-full bg-cyan-500/10 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-indigo-400 mb-2">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                <span>Next Upcoming Examination</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight uppercase">
                {nextExam.subjectName} EXAM
              </h2>
              <div className="flex items-center gap-3 mt-2 text-xs sm:text-sm text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white">{formatDate(nextExam.date, { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                </span>
                <span>•</span>
                <span className="text-slate-400">Total Marks: {nextExam.totalMarks}</span>
                <span>•</span>
                <span className="text-slate-400">Target: {nextExam.targetMarks || 76}/80</span>
              </div>
            </div>

            {/* Countdown Badge & Mastery Ring */}
            <div className="flex items-center gap-6 self-start lg:self-center">
              <div className="text-right">
                <div className="text-3xl sm:text-5xl font-black text-white tracking-tighter font-mono leading-none">
                  {daysLeft}
                </div>
                <div className="text-[10px] sm:text-xs font-extrabold uppercase tracking-wider text-indigo-300 mt-1">
                  Days Left
                </div>
              </div>

              <div className="h-14 w-[1px] bg-slate-700/80 hidden sm:block" />

              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-navy-950/80 border border-slate-700 p-2 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-cyan-400 leading-none">{targetProgress.masteryPercent}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Mastery</span>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-navy-950/80 border border-slate-700 p-2 flex flex-col items-center justify-center text-center">
                  <span className="text-base font-extrabold text-emerald-400 leading-none">{targetProgress.syllabusPercent}%</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Syllabus</span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-300 font-medium">
                Mathematics Syllabus: <span className="text-emerald-400 font-bold">100% Completed</span> • Phase: <span className="text-indigo-300 font-bold">Intensive Practice & Mock Tests</span>
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                {targetSubject?.completedStudyHours} hrs studied of {targetSubject?.targetStudyHours} hrs target
              </span>
            </div>
            <div className="w-full bg-navy-950/80 h-2.5 rounded-full overflow-hidden border border-slate-800">
              <div
                className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, ((targetSubject?.completedStudyHours || 0) / (targetSubject?.targetStudyHours || 1)) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Immediate Answer: "What should I study right now?" */}
      {currentTopTask && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-slate-900 to-slate-850 border border-indigo-500/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 flex-shrink-0 mt-0.5">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Recommended Study Right Now
                </span>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentTopTask.estimatedMinutes} min
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {currentTopTask.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 line-clamp-1">{currentTopTask.notes}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <button
              onClick={() => startFocusSession(currentTopTask)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start Focus Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Due Spaced Revisions Alert */}
      {dueRevisions.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-950/25 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <span>{dueRevisions.length} Spaced Revisions Due Today</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Physics Motion, Biology Cell & Maths Polynomials need active recall before memory decay.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveView('revision')}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1 self-start sm:self-center whitespace-nowrap"
          >
            <span>Review Queue</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Today's Priorities List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Today&apos;s Priorities
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {todayTasks.filter(t => t.status === 'completed').length}/{todayTasks.length} Completed
            </span>
          </div>

          <button
            onClick={() => setActiveView('plan')}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>Open Timeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {todayTasks.map((task, idx) => {
            const subject = subjects.find(s => s.id === task.subjectId);
            const chapter = task.chapterId ? chapters.find(c => c.id === task.chapterId) : undefined;
            const priorityBadge = getPriorityBadge(task.priority);
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between group ${
                  isDone
                    ? 'bg-slate-900/50 border-slate-800/80 opacity-70'
                    : 'bg-slate-850/90 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-wider"
                        style={{ color: subject?.color || '#6366f1' }}
                      >
                        {subject?.name}
                      </span>
                      {chapter && (
                        <span className="text-[11px] text-slate-400">• {chapter.name}</span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadge.bg}`}>
                      {priorityBadge.label}
                    </span>
                  </div>

                  <h4 className={`text-sm font-bold text-white mb-1 ${isDone ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h4>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-3">{task.notes}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{task.estimatedMinutes} min</span>
                    {task.scheduledTime && (
                      <>
                        <span>•</span>
                        <span>{task.scheduledTime}</span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {isDone ? (
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/15 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Completed</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => completeTask(task.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                        >
                          Mark Done
                        </button>
                        <button
                          onClick={() => startFocusSession(task)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                        >
                          <Play className="w-3 h-3 fill-white" />
                          <span>Start</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Study Hours</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {totalCompletedStudyHours.toFixed(1)} <span className="text-xs text-slate-400 font-sans font-normal">hrs</span>
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">On track for weekly goal</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Chapters Mastered</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {masteredChaptersCount} <span className="text-xs text-slate-400 font-sans font-normal">/ {chapters.length}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">{completedChaptersCount} syllabus completed</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Latest Mock Test</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {latestMock ? `${latestMock.percentage}%` : '82.5%'}
          </div>
          <p className="text-[10px] text-emerald-400 font-semibold mt-1">Mock 3: 66/80 (+11.25% jump)</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Mistakes Logged</span>
            <AlertCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">
            {errorLogs.reduce((acc, e) => acc + (e.occurrenceCount || 1), 0)}
          </div>
          <button
            onClick={() => setActiveView('errors')}
            className="text-[10px] text-rose-400 font-semibold mt-1 hover:underline block"
          >
            Review Diagnostic Tips &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
