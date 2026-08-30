import React, { useState } from 'react';
import {
  CalendarCheck2,
  Clock,
  Sparkles,
  Plus,
  Play,
  CheckCircle2,
  FastForward,
  Calendar,
  GripVertical,
  MoreVertical,
  Coffee,
  Check,
  ChevronDown,
  Trash2,
  ArrowUpDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyTask, PriorityLevel } from '../../types';
import { formatTime12H, getPriorityBadge } from '../../lib/utils';
import { RescheduleModal } from '../modals/RescheduleModal';
import { CLASS_OPTIONS } from '../../data/classCurriculums';

interface PlanViewProps {
  onOpenAddTask: () => void;
}

export const PlanView: React.FC<PlanViewProps> = ({ onOpenAddTask }) => {
  const {
    tasks,
    subjects,
    chapters,
    currentDate,
    completeTask,
    skipTask,
    deleteTask,
    updateTask,
    reorderTasks,
    startFocusSession,
    generateAutoPlan,
    triggerAiConfiguration,
    user,
  } = useApp();

  const [rescheduleTaskTarget, setRescheduleTaskTarget] = useState<StudyTask | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Filter tasks for current date
  const todayTasks = tasks
    .filter(t => t.scheduledDate === currentDate)
    .sort((a, b) => a.orderIndex - b.orderIndex);

  const displayedTasks = todayTasks.filter(t => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const totalMinutes = todayTasks.reduce((acc, t) => acc + (t.status !== 'skipped' ? t.estimatedMinutes : 0), 0);
  const completedMinutes = todayTasks.reduce(
    (acc, t) => acc + (t.status === 'completed' ? t.estimatedMinutes : 0),
    0
  );

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === idx) return;

    const updated = [...todayTasks];
    const [moved] = updated.splice(draggedIndex, 1);
    updated.splice(idx, 0, moved);

    setDraggedIndex(idx);
    reorderTasks(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Today&apos;s Study Timeline
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
              30 Aug 2026
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold font-mono">
              {user.classGrade || 'Class 9'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Intelligently distributed schedule • {user.studyPreference.schoolDaysHours} hrs planned for {user.name || 'Student'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => triggerAiConfiguration(user.classGrade)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/25 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" style={{ animationDuration: '4s' }} />
            <span>AI Recalibrate (NIM)</span>
          </button>

          <button
            type="button"
            onClick={() => generateAutoPlan()}
            className="px-3.5 py-2 rounded-xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Generate AI suggested schedule for today"
          >
            <CalendarCheck2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Suggested Plan</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddTask}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* 4-Class Quick Switcher Tabs */}
      <div className="p-3 rounded-2xl bg-slate-850/90 border border-slate-800 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
          Target Class:
        </span>
        <div className="flex items-center gap-1.5 flex-1 justify-end">
          {CLASS_OPTIONS.map(opt => {
            const isSelected = user.classGrade === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => triggerAiConfiguration(opt.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-400/50'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{opt.id}</span>
                <span className={`text-[10px] px-1 py-0.2 rounded font-normal ${isSelected ? 'bg-indigo-700 text-cyan-200' : 'bg-slate-800 text-slate-500'}`}>
                  {opt.firstExam}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Progress & Time Budget Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-850 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-bold text-white">
              {Math.floor(completedMinutes / 60)}h {completedMinutes % 60}m studied of{' '}
              {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m planned
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {todayTasks.filter(t => t.status === 'completed').length} of {todayTasks.length} tasks completed
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 self-start sm:self-center">
          {(['all', 'pending', 'completed'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all ${
                filter === f
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative space-y-3">
        {displayedTasks.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-850/50 border border-slate-800 text-center space-y-3">
            <CalendarCheck2 className="w-10 h-10 text-indigo-400 mx-auto" />
            <h3 className="font-bold text-base text-white">No tasks in this filter</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Click below to let the AI planner auto-populate high-priority tasks based on your upcoming exams.
            </p>
            <button
              onClick={() => generateAutoPlan()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 inline-flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate Suggested Daily Plan</span>
            </button>
          </div>
        ) : (
          displayedTasks.map((task, idx) => {
            const subject = subjects.find(s => s.id === task.subjectId);
            const chapter = task.chapterId ? chapters.find(c => c.id === task.chapterId) : undefined;
            const isCompleted = task.status === 'completed';
            const isSkipped = task.status === 'skipped';
            const priorityBadge = getPriorityBadge(task.priority);

            return (
              <React.Fragment key={task.id}>
                {/* Break Indicator between session 1 & session 2 */}
                {idx === 1 && (
                  <div className="flex items-center justify-center my-2">
                    <div className="px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-semibold flex items-center gap-2 shadow-sm">
                      <Coffee className="w-3.5 h-3.5 text-amber-400" />
                      <span>5:30 PM • 15 Min Relaxation / Hydration Break</span>
                    </div>
                  </div>
                )}

                <div
                  draggable
                  onDragStart={() => handleDragStart(idx)}
                  onDragOver={e => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    isCompleted
                      ? 'bg-slate-900/60 border-slate-800 opacity-75'
                      : isSkipped
                      ? 'bg-rose-950/20 border-rose-500/20 opacity-60'
                      : 'bg-slate-850 border-slate-800 hover:border-slate-700 shadow-md'
                  }`}
                >
                  {/* Left: Drag Handle & Time Block */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="cursor-grab active:cursor-grabbing text-slate-600 group-hover:text-slate-400 p-1">
                      <GripVertical className="w-4 h-4" />
                    </div>

                    <div className="min-w-[70px] text-left">
                      <span className="text-xs font-mono font-bold text-white block">
                        {task.scheduledTime ? formatTime12H(task.scheduledTime) : 'Flexible'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {task.estimatedMinutes} min
                      </span>
                    </div>

                    <div
                      className="w-1 self-stretch rounded-full hidden sm:block"
                      style={{ backgroundColor: subject?.color || '#6366f1' }}
                    />

                    {/* Task Title & Details */}
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span
                          className="text-[11px] font-extrabold uppercase tracking-wider"
                          style={{ color: subject?.color || '#6366f1' }}
                        >
                          {subject?.name}
                        </span>
                        {chapter && (
                          <span className="text-[11px] text-slate-400 font-medium truncate max-w-xs">
                            • {chapter.name}
                          </span>
                        )}
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${priorityBadge.bg}`}>
                          {priorityBadge.label}
                        </span>
                        {task.isAutoGenerated && (
                          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
                            Suggested
                          </span>
                        )}
                      </div>

                      <h3
                        className={`text-sm sm:text-base font-bold text-white ${
                          isCompleted ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h3>

                      {task.notes && (
                        <p className="text-xs text-slate-400 mt-1 line-clamp-1">{task.notes}</p>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center">
                    {/* Duration Adjuster */}
                    <select
                      value={task.estimatedMinutes}
                      onChange={e => updateTask(task.id, { estimatedMinutes: Number(e.target.value) })}
                      disabled={isCompleted}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value={25}>25m</option>
                      <option value={35}>35m</option>
                      <option value={45}>45m</option>
                      <option value={60}>60m</option>
                      <option value={90}>90m</option>
                    </select>

                    {/* Priority Adjuster */}
                    <select
                      value={task.priority}
                      onChange={e => updateTask(task.id, { priority: e.target.value as PriorityLevel })}
                      disabled={isCompleted}
                      className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-indigo-500 capitalize"
                    >
                      <option value="urgent">Urgent</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    {isCompleted ? (
                      <button
                        onClick={() => updateTask(task.id, { status: 'pending' })}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Done</span>
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => completeTask(task.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 transition-colors"
                          title="Mark as completed"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            skipTask(task.id);
                            setRescheduleTaskTarget(task);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 transition-colors"
                          title="Skip & reschedule automatically"
                        >
                          <FastForward className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setRescheduleTaskTarget(task)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 transition-colors"
                          title="Reschedule to another date"
                        >
                          <Calendar className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => startFocusSession(task)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 active:scale-95 transition-all"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                          <span>Focus</span>
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      {/* Auto-reschedule suggestion modal when skipped */}
      <RescheduleModal
        task={rescheduleTaskTarget}
        isOpen={!!rescheduleTaskTarget}
        onClose={() => setRescheduleTaskTarget(null)}
      />
    </div>
  );
};
