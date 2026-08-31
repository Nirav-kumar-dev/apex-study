import React from 'react';
import {
  BookOpen,
  Plus,
  Layers,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { calculateSubjectProgress, formatDate, getDaysLeft, getWeaknessBadge } from '../../lib/utils';
import { Subject } from '../../types';

interface SubjectsViewProps {
  onOpenAddSubject: () => void;
  onOpenSubjectDetail: (subject: Subject) => void;
  onOpenChapterDetail?: (chapterId: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  onOpenAddSubject,
  onOpenSubjectDetail,
}) => {
  const { subjects, chapters, exams, currentDate, setActiveView } = useApp();

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Subjects & Syllabus Architecture
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Manage preparation phases, weak topic focus, and study hour distribution
          </p>
        </div>

        <button
          onClick={onOpenAddSubject}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Subject</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(subject => {
          const subjectExam = exams.find(e => e.subjectId === subject.id);
          const daysToExam = subjectExam ? getDaysLeft(subjectExam.date, currentDate) : getDaysLeft(subject.examDate, currentDate);
          const { syllabusPercent, masteryPercent, chaptersCompleted, totalChapters } = calculateSubjectProgress(subject, chapters);
          const subjectChapters = chapters.filter(c => c.subjectId === subject.id);
          const weaknessBadge = getWeaknessBadge(subject.weaknessLevel);

          return (
            <div
              key={subject.id}
              className="p-5 rounded-3xl bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-xl flex flex-col justify-between transition-all group"
            >
              <div>
                {/* Top Badge Strip */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm border shadow-sm"
                      style={{
                        backgroundColor: `${subject.color}20`,
                        borderColor: `${subject.color}40`,
                        color: subject.color,
                      }}
                    >
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-indigo-300 transition-colors">
                        {subject.name}
                      </h3>
                      <span className="text-[10px] text-slate-400 font-mono">{subject.code}</span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${weaknessBadge.bg} ${weaknessBadge.color}`}>
                    {weaknessBadge.label}
                  </span>
                </div>

                {/* Sub Branches breakdown if applicable (e.g. Science -> Physics, Biology, Chemistry) */}
                {subject.subBranches && (
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {subject.subBranches.map(branch => (
                      <span
                        key={branch}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-slate-300"
                      >
                        {branch} {branch === 'Physics' || branch === 'Biology' ? '⚠️ Weak' : '✓ Solid'}
                      </span>
                    ))}
                  </div>
                )}

                {/* Progress Indicators (Syllabus vs Mastery) */}
                <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Syllabus Covered</div>
                    <div className="text-base font-extrabold text-emerald-400 font-mono">
                      {syllabusPercent}%
                    </div>
                    <div className="text-[9px] text-slate-400">{chaptersCompleted}/{totalChapters} Chapters</div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Exam Mastery</div>
                    <div className="text-base font-extrabold text-cyan-400 font-mono">
                      {masteryPercent}%
                    </div>
                    <div className="text-[9px] text-slate-400">High Confidence & Practice</div>
                  </div>
                </div>

                {/* Status & Next Exam */}
                <div className="space-y-1.5 text-xs text-slate-300 py-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Preparation Phase:</span>
                    <span className="font-semibold text-white capitalize">
                      {subject.syllabusStatus.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Next Exam:</span>
                    <span className="font-bold text-indigo-300">
                      {formatDate(subjectExam?.date || subject.examDate, { month: 'short', day: 'numeric' })} ({daysToExam}d left)
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Study Allocation:</span>
                    <span className="font-bold text-white font-mono">{subject.priorityWeight}% Priority</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveView('chapters');
                  }}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Chapters ({subjectChapters.length})</span>
                </button>

                <button
                  onClick={() => onOpenSubjectDetail(subject)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Configure
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
