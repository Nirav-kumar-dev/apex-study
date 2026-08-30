import React from 'react';
import {
  Repeat,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { categorizeRevisions } from '../../lib/spacedRepetition';
import { formatDate, getConfidenceBadge, getDaysLeft } from '../../lib/utils';

interface RevisionViewProps {
  onOpenActiveRecall: (chapterId: string) => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({ onOpenActiveRecall }) => {
  const { revisions, chapters, subjects, currentDate } = useApp();

  const { dueToday, upcoming } = categorizeRevisions(revisions, currentDate);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Spaced Repetition & Retention
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Scientifically timed intervals to prevent the Ebbinghaus forgetting curve before exams
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Repeat className="w-3.5 h-3.5" />
            <span>{dueToday.length} Due for Recall</span>
          </span>
        </div>
      </div>

      {/* Spaced Interval Timeline Visualizer */}
      <div className="p-5 sm:p-6 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">5-Stage Spaced Intervals</h3>
            <p className="text-xs text-slate-400">Chapters automatically cycle through expanding intervals</p>
          </div>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            Active Recall System
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
          {[
            { stage: 1, interval: '1 Day Later', desc: 'Immediate consolidation' },
            { stage: 2, interval: '3 Days Later', desc: 'Early retention lock' },
            { stage: 3, interval: '7 Days Later', desc: 'Weekly spaced test' },
            { stage: 4, interval: '14 Days Later', desc: 'Long-term memory' },
            { stage: 5, interval: 'Pre-Exam Sprint', desc: 'Final mastery polish' },
          ].map(s => (
            <div
              key={s.stage}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-center flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider">
                  Stage {s.stage}
                </span>
                <div className="text-xs font-extrabold text-white mt-0.5">{s.interval}</div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 1. DUE TODAY QUEUE */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
            Revisions Due Right Now
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            {dueToday.length}
          </span>
        </div>

        {dueToday.length === 0 ? (
          <div className="p-6 rounded-3xl bg-slate-850/50 border border-slate-800 text-center space-y-2">
            <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-sm text-white">All spaced revisions up to date!</h4>
            <p className="text-xs text-slate-400">Great job staying ahead of your memory retention schedule.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dueToday.map(rev => {
              const chapter = chapters.find(c => c.id === rev.chapterId);
              const subject = subjects.find(s => s.id === rev.subjectId);
              if (!chapter || !subject) return null;

              const confidenceBadge = getConfidenceBadge(chapter.confidenceLevel);

              return (
                <div
                  key={rev.id}
                  className="p-5 rounded-3xl bg-slate-850 border border-amber-500/30 shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-wider"
                        style={{ color: subject.color }}
                      >
                        {subject.name}
                      </span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Stage {rev.stage} Due
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-white line-clamp-1">{chapter.name}</h4>

                    <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Last Studied</span>
                        <span className="font-bold text-white font-mono">{formatDate(rev.lastStudiedDate)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Confidence</span>
                        <span className={`font-bold ${confidenceBadge.color}`}>
                          {chapter.confidenceLevel}/5 ({confidenceBadge.label})
                        </span>
                      </div>
                    </div>

                    {rev.notes && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-3">{rev.notes}</p>
                    )}
                  </div>

                  <button
                    onClick={() => onOpenActiveRecall(chapter.id)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:brightness-110 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                  >
                    <Repeat className="w-4 h-4" />
                    <span>Launch Active Recall Session</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. UPCOMING REVISIONS QUEUE */}
      <div className="space-y-3 pt-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
            Upcoming Scheduled Revisions
          </h3>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
            {upcoming.length}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {upcoming.map(rev => {
            const chapter = chapters.find(c => c.id === rev.chapterId);
            const subject = subjects.find(s => s.id === rev.subjectId);
            if (!chapter || !subject) return null;

            const daysLeft = getDaysLeft(rev.dueDate, currentDate);

            return (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-slate-850/80 border border-slate-800 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="text-[10px] font-bold uppercase truncate" style={{ color: subject.color }}>
                    {subject.name} • Stage {rev.stage}
                  </div>
                  <div className="text-xs font-bold text-white truncate">{chapter.name}</div>
                  <div className="text-[10px] text-slate-400">Due: {formatDate(rev.dueDate)}</div>
                </div>

                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-indigo-300 font-mono">
                    in {daysLeft}d
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
