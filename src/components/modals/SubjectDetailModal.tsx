import React, { useState } from 'react';
import { X, BookOpen, Calendar, Clock, BarChart2, Save, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Subject, WeaknessLevel, SyllabusStatus } from '../../types';

interface SubjectDetailModalProps {
  subject: Subject | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubjectDetailModal: React.FC<SubjectDetailModalProps> = ({ subject, isOpen, onClose }) => {
  const { updateSubject, deleteSubject } = useApp();

  if (!isOpen || !subject) return null;

  const [name, setName] = useState(subject.name);
  const [code, setCode] = useState(subject.code);
  const [color, setColor] = useState(subject.color);
  const [weaknessLevel, setWeaknessLevel] = useState<WeaknessLevel>(subject.weaknessLevel);
  const [syllabusStatus, setSyllabusStatus] = useState<SyllabusStatus>(subject.syllabusStatus);
  const [examDate, setExamDate] = useState(subject.examDate);
  const [targetStudyHours, setTargetStudyHours] = useState(subject.targetStudyHours);
  const [priorityWeight, setPriorityWeight] = useState(subject.priorityWeight);

  const handleSave = () => {
    updateSubject(subject.id, {
      name: name.trim(),
      code: code.trim(),
      color,
      isWeak: weaknessLevel === 'high' || weaknessLevel === 'medium',
      weaknessLevel,
      syllabusStatus,
      examDate,
      targetStudyHours: Number(targetStudyHours),
      priorityWeight: Number(priorityWeight),
    });
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${subject.name}? This will remove its chapters and tasks.`)) {
      deleteSubject(subject.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border shadow-md"
              style={{ backgroundColor: `${color}20`, borderColor: `${color}40` }}
            >
              <BookOpen className="w-5 h-5" style={{ color }} />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Subject Settings: {name}</h2>
              <p className="text-xs text-slate-400">Configure weighting, exam date, and target study hours</p>
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
        <form onSubmit={e => { e.preventDefault(); handleSave(); }} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Name & Code */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Code</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Color & Weakness Level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Accent Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={e => setColor(e.target.value)}
                  className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-700 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-300">{color}</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject Weakness Level</label>
              <select
                value={weaknessLevel}
                onChange={e => setWeaknessLevel(e.target.value as WeaknessLevel)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="high">High Weakness (Prioritize)</option>
                <option value="medium">Medium Weakness</option>
                <option value="low">Low Weakness (Strong)</option>
              </select>
            </div>
          </div>

          {/* Exam Date & Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Exam Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={examDate}
                  onChange={e => setExamDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Syllabus Status</label>
              <select
                value={syllabusStatus}
                onChange={e => setSyllabusStatus(e.target.value as SyllabusStatus)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 capitalize"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed (Needs Practice)</option>
                <option value="revision_phase">Revision Phase</option>
                <option value="mastered">Mastered</option>
              </select>
            </div>
          </div>

          {/* Priority Weight % & Target Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-semibold text-slate-400">Study Allocation Weight</span>
                <span className="text-xs font-bold text-indigo-400">{priorityWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={priorityWeight}
                onChange={e => setPriorityWeight(Number(e.target.value))}
                className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 block mb-1">Target Study Hours</span>
              <input
                type="number"
                min="1"
                value={targetStudyHours}
                onChange={e => setTargetStudyHours(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Subject</span>
            </button>

            <div className="flex items-center gap-2">
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
                <Save className="w-4 h-4" />
                <span>Save Subject</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
