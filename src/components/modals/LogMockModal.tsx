import React, { useState } from 'react';
import { X, FileCheck2, BookOpen, Calendar, Clock, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface LogMockModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogMockModal: React.FC<LogMockModalProps> = ({ isOpen, onClose }) => {
  const { subjects, addMockTest, currentDate } = useApp();

  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [title, setTitle] = useState('Maths Half-Yearly Mock 4 (Timed)');
  const [date, setDate] = useState(currentDate);
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [score, setScore] = useState(72);
  const [totalMarks, setTotalMarks] = useState(80);
  const [weakTopicsStr, setWeakTopicsStr] = useState('Polynomials identity expansion, Triangles RHS criteria');
  const [mistakesCount, setMistakesCount] = useState(3);
  const [notes, setNotes] = useState('Good time management. Finished 10 minutes early.');
  const [keyTakeaways, setKeyTakeaways] = useState('Double check calculations on 5-mark geometry proofs.');

  if (!isOpen) return null;

  const percentage = Math.round((Number(score) / Number(totalMarks)) * 100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !subjectId) return;

    const weakTopics = weakTopicsStr
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    addMockTest({
      subjectId,
      title: title.trim(),
      date,
      durationMinutes: Number(durationMinutes),
      score: Number(score),
      totalMarks: Number(totalMarks),
      weakTopics,
      mistakesCount: Number(mistakesCount),
      notes: notes.trim(),
      keyTakeaways: keyTakeaways.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Log Mock Test Result</h2>
              <p className="text-xs text-slate-400">Track score progression toward exam readiness</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mock Test Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Maths Half-Yearly Mock 4 (Timed Exam Simulation)"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Subject & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject *</label>
              <div className="relative">
                <BookOpen className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 appearance-none"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Test Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Scores Row */}
          <div className="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-slate-850 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Score Obtained</label>
              <input
                type="number"
                min="0"
                max={totalMarks}
                value={score}
                onChange={e => setScore(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Marks</label>
              <input
                type="number"
                min="1"
                value={totalMarks}
                onChange={e => setTotalMarks(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold text-center focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex flex-col items-center justify-center">
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Percentage</span>
              <span className="text-base font-extrabold text-indigo-400">{percentage}%</span>
            </div>
          </div>

          {/* Duration & Mistakes count */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Duration (Minutes)</label>
              <div className="relative">
                <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={e => setDurationMinutes(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mistakes Count</label>
              <input
                type="number"
                value={mistakesCount}
                onChange={e => setMistakesCount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Weak topics */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Weak Topics (Comma-separated)</label>
            <input
              type="text"
              placeholder="e.g. Kinematics graphs, Transposition sign errors"
              value={weakTopicsStr}
              onChange={e => setWeakTopicsStr(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Key Takeaways */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Key Takeaway / Improvement Goal</label>
            <textarea
              rows={2}
              placeholder="e.g. Improved speed on Section A. Need to review Triangles RHS proof steps."
              value={keyTakeaways}
              onChange={e => setKeyTakeaways(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <Award className="w-4 h-4" />
              <span>Save Mock Test</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
