import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  BookOpen,
  GraduationCap,
  Repeat,
  FileCheck2,
  CheckCircle2,
  Sparkles,
  Zap,
  Bot,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';
import { CLASS_OPTIONS } from '../../data/classCurriculums';

interface CalendarViewProps {
  onOpenAddTask: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenAddTask }) => {
  const {
    exams,
    tasks,
    revisions,
    mockTests,
    subjects,
    currentDate,
    user,
    switchClassGrade,
    triggerAiConfiguration,
  } = useApp();

  const [currentMonth, setCurrentMonth] = useState<Date>(new Date('2026-08-30'));
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-08-30');
  const [calendarMode, setCalendarMode] = useState<'month' | 'week' | 'day'>('month');

  // Month navigation
  const prevMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() - 1);
    setCurrentMonth(d);
  };

  const nextMonth = () => {
    const d = new Date(currentMonth);
    d.setMonth(d.getMonth() + 1);
    setCurrentMonth(d);
  };

  // Days in month calculation
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray = [];
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    daysArray.push(dateStr);
  }

  // Selected date events
  const selectedExams = exams.filter(e => e.date === selectedDateStr);
  const selectedTasks = tasks.filter(t => t.scheduledDate === selectedDateStr);
  const selectedRevisions = revisions.filter(r => r.dueDate === selectedDateStr);
  const selectedMocks = mockTests.filter(m => m.date === selectedDateStr);

  const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Study Calendar & Exam Plan
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold font-mono">
              {user.classGrade || 'Class 9'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Synchronized with official 2026–27 Half-Yearly Date Sheet & Spaced Repetition Cycles
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* AI Reconfigure Button */}
          <button
            type="button"
            onClick={() => triggerAiConfiguration(user.classGrade)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Optimize (NIM)</span>
          </button>

          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-850 p-1 rounded-xl border border-slate-800">
            {(['month', 'week', 'day'] as const).map(m => (
              <button
                key={m}
                type="button"
                onClick={() => setCalendarMode(m)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                  calendarMode === m
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={onOpenAddTask}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-white text-xs font-bold border border-slate-700 shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Schedule Task</span>
          </button>
        </div>
      </div>

      {/* 4-Class Quick Switcher Bar */}
      <div className="p-3.5 rounded-2xl bg-navy-900/90 border border-slate-800 shadow-lg space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-bold flex items-center gap-1.5 text-slate-300">
            <GraduationCap className="w-4 h-4 text-indigo-400" />
            <span>Select Class Curriculum & Date Sheet:</span>
          </span>
          <span className="text-[11px] text-indigo-300">Each class features its distinct exam schedule & daily study plan</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {CLASS_OPTIONS.map(opt => {
            const isSelected = user.classGrade === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => triggerAiConfiguration(opt.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer group ${
                  isSelected
                    ? 'bg-gradient-to-br from-indigo-950/90 to-slate-850 border-indigo-500 shadow-md shadow-indigo-600/20 ring-1 ring-indigo-500/50'
                    : 'bg-slate-850/80 border-slate-750 hover:bg-slate-800 hover:border-slate-600 text-slate-400'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs font-extrabold ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                    {opt.id}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${isSelected ? 'bg-indigo-500/30 text-cyan-300' : 'bg-slate-900 text-slate-400'}`}>
                    {opt.examCount} Exams
                  </span>
                </div>
                <div className="text-[11px] text-indigo-400 mt-1 font-semibold truncate">
                  Starts: {opt.firstExam}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Official Exams Sequence Strip for Active Class */}
      <div className="p-4 rounded-2xl bg-slate-850/90 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-amber-400" />
            <span>{user.classGrade || 'Class 9'} Half-Yearly Examination Timetable (16–30 Sep 2026)</span>
          </span>
          <span className="text-[11px] font-mono text-slate-400">Total 6 Official Papers</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-1">
          {sortedExams.map((ex, i) => {
            const isTarget = ex.date === selectedDateStr;
            const dayNum = ex.date.split('-')[2];
            return (
              <div
                key={ex.id}
                onClick={() => setSelectedDateStr(ex.date)}
                className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isTarget
                    ? 'bg-rose-950/60 border-rose-500 ring-1 ring-rose-500/50 shadow-md'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold text-rose-400 uppercase">
                  <span>Paper {i + 1}</span>
                  <span className="font-mono">{dayNum} Sep</span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5 truncate">{ex.subjectName.replace(` ${user.classGrade}`, '')}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">{ex.startTime}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Calendar Frame & Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
          {/* Month Header Controls */}
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-white font-sans">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={prevMonth}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setCurrentMonth(new Date('2026-08-30'));
                  setSelectedDateStr('2026-08-30');
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold uppercase text-slate-400 py-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Days Grid */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {daysArray.map((dateStr, idx) => {
              if (!dateStr) {
                return <div key={`empty-${idx}`} className="h-20 sm:h-24 rounded-2xl bg-slate-900/30" />;
              }

              const dayNumber = new Date(dateStr).getDate();
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === currentDate;

              // Check events on this day
              const dayExams = exams.filter(e => e.date === dateStr);
              const dayTasks = tasks.filter(t => t.scheduledDate === dateStr);
              const dayRevisions = revisions.filter(r => r.dueDate === dateStr);
              const dayMocks = mockTests.filter(m => m.date === dateStr);

              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-20 sm:h-24 p-1.5 sm:p-2 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                    dayExams.length > 0
                      ? isSelected
                        ? 'bg-rose-950/70 border-rose-500 shadow-lg ring-2 ring-rose-500/50'
                        : 'bg-rose-950/30 border-rose-500/40 hover:border-rose-400'
                      : isSelected
                      ? 'bg-indigo-950/70 border-indigo-500 shadow-md ring-2 ring-indigo-500/50'
                      : isToday
                      ? 'bg-slate-800/90 border-slate-700 ring-1 ring-cyan-500/40'
                      : 'bg-slate-900/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow'
                          : dayExams.length > 0
                          ? 'text-rose-300 font-extrabold'
                          : isSelected
                          ? 'text-indigo-300 font-extrabold'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayNumber}
                    </span>

                    {dayExams.length > 0 && (
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" title="Official Half-Yearly Exam" />
                    )}
                  </div>

                  {/* Micro event indicators */}
                  <div className="space-y-0.5 overflow-hidden w-full">
                    {dayExams.map(ex => (
                      <div
                        key={ex.id}
                        className="text-[9px] font-extrabold bg-rose-500/30 text-rose-200 border border-rose-500/50 px-1 rounded truncate leading-tight flex items-center gap-0.5"
                      >
                        <span className="w-1 h-1 rounded-full bg-rose-400" />
                        <span>{ex.subjectName.replace(` ${user.classGrade}`, '')}</span>
                      </div>
                    ))}

                    {dayMocks.map(m => (
                      <div
                        key={m.id}
                        className="text-[9px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1 rounded truncate leading-tight"
                      >
                        Mock Exam
                      </div>
                    ))}

                    {dayRevisions.length > 0 && (
                      <div className="text-[9px] font-semibold bg-amber-500/20 text-amber-300 px-1 rounded truncate leading-tight">
                        {dayRevisions.length} Revision
                      </div>
                    )}

                    {dayTasks.length > 0 && (
                      <div className="text-[9px] text-slate-400 truncate hidden sm:block">
                        {dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Inspector: Selected Date Schedule & Breakdown */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Day Schedule Inspector
                </span>
                <h3 className="text-base font-extrabold text-white">
                  {formatDate(selectedDateStr, { weekday: 'short', month: 'short', day: 'numeric' })}
                </h3>
              </div>

              <button
                type="button"
                onClick={onOpenAddTask}
                className="p-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 cursor-pointer"
                title="Add task to this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Exams on this day */}
            {selectedExams.map(ex => (
              <div
                key={ex.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/70 to-slate-900 border border-rose-500/60 text-rose-200 shadow-lg shadow-rose-950/50"
              >
                <div className="flex items-center gap-2 text-xs font-black text-rose-300 uppercase tracking-wider mb-1">
                  <GraduationCap className="w-4 h-4 text-rose-400" />
                  <span>OFFICIAL EXAMINATION</span>
                </div>
                <div className="text-sm font-extrabold text-white">{ex.subjectName}</div>
                <div className="text-xs text-rose-200/90 mt-1 flex items-center gap-2 font-mono">
                  <span>⏰ {ex.startTime}</span>
                  <span>•</span>
                  <span>⏳ {ex.durationMinutes} min</span>
                  <span>•</span>
                  <span>🎯 {ex.totalMarks} Marks</span>
                </div>
                {ex.notes && (
                  <p className="text-[11px] text-slate-300 mt-2 bg-rose-900/40 p-2.5 rounded-xl border border-rose-500/25 leading-relaxed">
                    {ex.notes}
                  </p>
                )}
              </div>
            ))}

            {/* Mock Tests */}
            {selectedMocks.map(mock => (
              <div
                key={mock.id}
                className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/30"
              >
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1">
                  <FileCheck2 className="w-4 h-4" />
                  <span>Mock Exam Simulation</span>
                </div>
                <div className="text-xs font-bold text-white">{mock.title}</div>
                <div className="text-[11px] text-slate-300 mt-0.5">
                  Score: <span className="text-emerald-400 font-bold">{mock.score}/{mock.totalMarks} ({mock.percentage}%)</span>
                </div>
              </div>
            ))}

            {/* Revisions */}
            {selectedRevisions.map(rev => {
              const sub = subjects.find(s => s.id === rev.subjectId);
              return (
                <div
                  key={rev.id}
                  className="p-3 rounded-2xl bg-amber-950/25 border border-amber-500/30"
                >
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-1">
                    <Repeat className="w-3.5 h-3.5" />
                    <span>Spaced Repetition Stage {rev.stage}</span>
                  </div>
                  <div className="text-xs font-bold text-white">{sub?.name || 'Subject Revision'}</div>
                  <div className="text-[11px] text-slate-400">{rev.notes}</div>
                </div>
              );
            })}

            {/* Study Tasks */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300">
                Scheduled Study Tasks ({selectedTasks.length})
              </span>

              {selectedTasks.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-900 text-center text-xs text-slate-400">
                  No study tasks scheduled for this day yet.
                </div>
              ) : (
                selectedTasks.map(t => {
                  const sub = subjects.find(s => s.id === t.subjectId);
                  return (
                    <div
                      key={t.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between"
                    >
                      <div className="min-w-0 pr-2">
                        <div className="text-[10px] font-bold uppercase truncate" style={{ color: sub?.color || '#6366f1' }}>
                          {sub?.name}
                        </div>
                        <div className="text-xs font-semibold text-white truncate">{t.title}</div>
                        <div className="text-[10px] text-slate-400">{t.estimatedMinutes} min • {t.scheduledTime}</div>
                      </div>
                      {t.status === 'completed' && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenAddTask}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
          >
            + Add Task for {formatDate(selectedDateStr, { month: 'short', day: 'numeric' })}
          </button>
        </div>
      </div>
    </div>
  );
};
