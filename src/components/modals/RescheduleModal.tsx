import React, { useState } from 'react';
import { X, Sparkles, Calendar, Clock, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { StudyTask } from '../../types';
import { calculateRescheduleSuggestion } from '../../lib/plannerEngine';
import { formatDate } from '../../lib/utils';

interface RescheduleModalProps {
  task: StudyTask | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RescheduleModal: React.FC<RescheduleModalProps> = ({ task, isOpen, onClose }) => {
  const { tasks, exams, currentDate, rescheduleTask } = useApp();

  if (!isOpen || !task) return null;

  const suggestion = calculateRescheduleSuggestion(task, tasks, exams, currentDate);

  const [selectedDate, setSelectedDate] = useState(suggestion.suggestedDate);
  const [selectedTime, setSelectedTime] = useState(suggestion.suggestedTime);
  const [useSuggested, setUseSuggested] = useState(true);

  const handleApply = () => {
    const targetDate = useSuggested ? suggestion.suggestedDate : selectedDate;
    const targetTime = useSuggested ? suggestion.suggestedTime : selectedTime;
    rescheduleTask(task.id, targetDate, targetTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Reschedule Task</h2>
              <p className="text-xs text-slate-400">Intelligent workload re-balancing</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Current Task Preview */}
          <div className="p-3 rounded-2xl bg-slate-850 border border-slate-700/80">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Task To Move</span>
            <p className="text-xs font-bold text-white mt-0.5">{task.title}</p>
            <p className="text-[11px] text-slate-400 mt-1">Est. Duration: {task.estimatedMinutes} min</p>
          </div>

          {/* Smart Recommendation Card */}
          <div
            onClick={() => setUseSuggested(true)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              useSuggested
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-850/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Suggested Next Slot</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Optimal
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm font-extrabold text-white">
              <span>{formatDate(suggestion.suggestedDate)}</span>
              <span className="text-indigo-400">•</span>
              <span>{suggestion.suggestedTime}</span>
            </div>

            <p className="text-[11px] text-slate-300 mt-2 leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-sans">
              {suggestion.rationale}
            </p>
          </div>

          {/* Custom Date Override */}
          <div
            onClick={() => setUseSuggested(false)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              !useSuggested
                ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-850/50 border-slate-800 hover:border-slate-700'
            }`}
          >
            <span className="text-xs font-bold text-slate-300 block mb-2">Or Choose Custom Slot</span>
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value);
                    setUseSuggested(false);
                  }}
                  className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="relative">
                <Clock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={e => {
                    setSelectedTime(e.target.value);
                    setUseSuggested(false);
                  }}
                  className="w-full pl-8 pr-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Confirm Reschedule</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
