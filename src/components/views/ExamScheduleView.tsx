import React, { useState, useRef } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  Percent,
  Plus,
  Edit2,
  Sparkles,
  BookOpen,
  Award,
  Save,
  Table,
  Image as ImageIcon,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Check,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import { formatDate, getDaysLeft, calculateSubjectProgress } from '../../lib/utils';
import { Exam } from '../../types';
import {
  GYAN_NIKETAN_HALF_YEARLY_2026,
} from '../../data/gyanNiketanSchedule';
import { analyzeImageWithNvidiaVision, extractJson } from '../../lib/nvidiaApi';

export const ExamScheduleView: React.FC = () => {
  const {
    exams,
    subjects,
    chapters,
    user,
    updateUser,
    updateSubjectAllocations,
    updateExam,
    currentDate,
    generateAutoPlan,
    triggerAiConfiguration,
  } = useApp();

  // Priority distribution state
  const [mathsAlloc, setMathsAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-maths'] ?? 45);
  const [sciAlloc, setSciAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-science'] ?? 30);
  const [engAlloc, setEngAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-english'] ?? 15);
  const [othAlloc, setOthAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-others'] ?? 10);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Active View Tab: 'timeline' | 'gyan_niketan' | 'ai_scanner'
  const [activeTab, setActiveTab] = useState<'timeline' | 'gyan_niketan' | 'ai_scanner'>('timeline');

  // Edit Exam Modal State
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editTargetMarks, setEditTargetMarks] = useState<number>(75);
  const [editNotes, setEditNotes] = useState('');

  // AI Date Sheet Scanner State (Image Picker)
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [extractedExams, setExtractedExams] = useState<any[] | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Success Notification
  const [scheduleAppliedMsg, setScheduleAppliedMsg] = useState<string | null>(null);

  const totalAlloc = mathsAlloc + sciAlloc + engAlloc + othAlloc;

  const handleSaveAllocations = () => {
    updateUser({
      studyPreference: {
        ...user.studyPreference,
        subjectAllocation: {
          'sub-maths': mathsAlloc,
          'sub-science': sciAlloc,
          'sub-english': engAlloc,
          'sub-others': othAlloc,
        },
      },
    });

    updateSubjectAllocations({
      'sub-maths': mathsAlloc,
      'sub-science': sciAlloc,
      'sub-english': engAlloc,
      'sub-hindi': Math.round(othAlloc / 3),
      'sub-sst': Math.round(othAlloc / 3),
      'sub-ai': Math.round(othAlloc / 3),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // 1-Click Apply Gyan Niketan Official Schedule & Switch Class
  const handleApplyGyanNiketanSchedule = (customClass?: string) => {
    const targetClass = customClass || user.classGrade || 'Class 9';
    triggerAiConfiguration(targetClass);
    setScheduleAppliedMsg(`Official Gyan Niketan ${targetClass} schedule & study calendar configured with AI!`);
    try {
      confetti({ particleCount: 80, spread: 70 });
    } catch {}
    setTimeout(() => setScheduleAppliedMsg(null), 5000);
  };

  // Open Edit Exam Modal
  const handleOpenEdit = (exam: Exam) => {
    setEditingExam(exam);
    setEditDate(exam.date);
    setEditStartTime(exam.startTime || '09:00 AM');
    setEditTargetMarks(exam.targetMarks || 75);
    setEditNotes(exam.notes || '');
  };

  const handleSaveEditExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingExam) return;

    updateExam(editingExam.id, {
      date: editDate,
      startTime: editStartTime,
      targetMarks: Number(editTargetMarks),
      notes: editNotes.trim(),
    });

    setEditingExam(null);
    generateAutoPlan();
  };

  // Handle Image Upload for Vision AI Date Sheet Scanner
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const b64 = evt.target?.result as string;
      setUploadedImage(b64);
      setScanResult(null);
      setExtractedExams(null);
      setScanError(null);
    };
    reader.readAsDataURL(file);
  };

  // Run NVIDIA NIM Vision Analysis on Uploaded Schedule Image
  const handleRunVisionAnalysis = async () => {
    if (!uploadedImage || isScanning) return;
    setIsScanning(true);
    setScanError(null);
    setScanResult(null);
    setExtractedExams(null);

    const prompt = `You are an expert AI examination coordinator analyzing an image of an official school date sheet / examination schedule (e.g. Gyan Niketan Half Yearly Examination).
Target Student Class: ${user.classGrade || 'Class 9'}.

Tasks:
1. Transcribe and identify the exact dates, days, and subjects for ${user.classGrade || 'Class 9'}.
2. Output a structured summary of the schedule.
3. Also generate a JSON code block in this exact format:
\`\`\`json
[
  {
    "date": "2026-09-18",
    "subjectName": "Mathematics",
    "day": "Friday",
    "time": "09:00 AM"
  }
]
\`\`\`
Ensure all dates match the standard YYYY-MM-DD format (e.g. 2026-09-18).`;

    try {
      const response = await analyzeImageWithNvidiaVision(uploadedImage, prompt, {
        apiKey: user.nvidiaApiKey,
        model: user.nvidiaModel,
        baseUrl: user.nvidiaBaseUrl,
      });

      setScanResult(response);
      try {
        const parsed = extractJson<any[]>(response);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setExtractedExams(parsed);
        }
      } catch {}
    } catch (err: any) {
      setScanError(err.message || 'Failed to analyze schedule image with NVIDIA Vision API.');
    } finally {
      setIsScanning(false);
    }
  };

  // 1-Click apply AI-extracted schedule
  const handleApplyExtractedExams = () => {
    if (!extractedExams || extractedExams.length === 0) return;

    extractedExams.forEach(item => {
      const matchedSubject = subjects.find(
        s =>
          s.name.toLowerCase().includes(item.subjectName.toLowerCase()) ||
          item.subjectName.toLowerCase().includes(s.name.toLowerCase())
      );

      if (matchedSubject) {
        const existing = exams.find(e => e.subjectId === matchedSubject.id);
        if (existing) {
          updateExam(existing.id, {
            date: item.date,
            startTime: item.time || existing.startTime,
          });
        }
      }
    });

    generateAutoPlan();
    setScheduleAppliedMsg('AI Extracted Exam Dates successfully applied to your study OS!');
    try {
      confetti({ particleCount: 70, spread: 60 });
    } catch {}
    setTimeout(() => setScheduleAppliedMsg(null), 5000);
  };

  const sortedExams = [...exams].sort((a, b) => {
    const diffA = getDaysLeft(a.date, currentDate);
    const diffB = getDaysLeft(b.date, currentDate);
    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
    if (diffA >= 0) return -1;
    if (diffB >= 0) return 1;
    return diffB - diffA;
  });

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Examination Schedule & Date Sheet
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold font-mono">
              {user.classGrade || 'Class 9'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Official Gyan Niketan timetable, custom date pickers, and NVIDIA Vision AI date sheet scanner
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-850 border border-slate-800 rounded-2xl">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            My Timeline
          </button>
          <button
            onClick={() => setActiveTab('gyan_niketan')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'gyan_niketan'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Gyan Niketan Table</span>
          </button>
          <button
            onClick={() => setActiveTab('ai_scanner')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'ai_scanner'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>AI Date Sheet Scanner</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {scheduleAppliedMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          <span>{scheduleAppliedMsg}</span>
        </div>
      )}

      {/* TAB 1: MY TIMELINE & SMART SUBJECT WEIGHTS */}
      {activeTab === 'timeline' && (
        <div className="space-y-6">
          {/* Editable Subject Time Allocation Sliders */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <Percent className="w-4 h-4" />
                  <span>Smart Subject Prioritization Weights</span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                  Study Workload Split for {user.classGrade || 'Class 9'}
                </h2>
              </div>

              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full self-start sm:self-center ${
                  totalAlloc === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                Total: {totalAlloc}% (Editable)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
              {/* Maths */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Mathematics</span>
                  <span className="font-extrabold text-indigo-400 font-mono text-sm">{mathsAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="70"
                  value={mathsAlloc}
                  onChange={e => setMathsAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <span className="text-[10px] text-slate-400 block">Syllabus complete • Practice mode</span>
              </div>

              {/* Science */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Science</span>
                  <span className="font-extrabold text-cyan-400 font-mono text-sm">{sciAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={sciAlloc}
                  onChange={e => setSciAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <span className="text-[10px] text-slate-400 block">Physics numericals + Bio cell</span>
              </div>

              {/* English */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">English</span>
                  <span className="font-extrabold text-amber-400 font-mono text-sm">{engAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={engAlloc}
                  onChange={e => setEngAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <span className="text-[10px] text-slate-400 block">Grammar reported speech</span>
              </div>

              {/* Others */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">Other Subjects</span>
                  <span className="font-extrabold text-emerald-400 font-mono text-sm">{othAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={othAlloc}
                  onChange={e => setOthAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <span className="text-[10px] text-slate-400 block">Hindi, SST, AI maintenance</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                onClick={handleSaveAllocations}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{savedSuccess ? 'Weights Saved!' : 'Apply Priority Weights'}</span>
              </button>
            </div>
          </div>

          {/* Exam Cards Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
                Active Examination Timeline ({sortedExams.length} Exams)
              </h3>
              <button
                onClick={() => handleApplyGyanNiketanSchedule()}
                className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/25 px-3 py-1.5 rounded-xl cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Sync with Gyan Niketan 2026</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedExams.map((exam, idx) => {
                const subject = subjects.find(s => s.id === exam.subjectId);
                const daysLeft = getDaysLeft(exam.date, currentDate);
                const { syllabusPercent, masteryPercent } = subject
                  ? calculateSubjectProgress(subject, chapters)
                  : { syllabusPercent: 0, masteryPercent: 0 };

                const isFirstExam = idx === 0;

                return (
                  <div
                    key={exam.id}
                    className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 shadow-lg ${
                      isFirstExam
                        ? 'bg-gradient-to-br from-indigo-950/60 via-slate-850 to-slate-900 border-indigo-500/40 ring-1 ring-indigo-500/30'
                        : 'bg-slate-850 border-slate-800'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: subject?.color || '#6366f1' }}
                          />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                            {exam.subjectName}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleOpenEdit(exam)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Edit Exam Date / Target"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="text-right">
                            {daysLeft > 1 ? (
                              <>
                                <span className="text-xl font-black text-white font-mono">{daysLeft}</span>
                                <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-wider ml-1">
                                  Days Left
                                </span>
                              </>
                            ) : daysLeft === 1 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/40">
                                Tomorrow
                              </span>
                            ) : daysLeft === 0 ? (
                              <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-extrabold text-xs border border-emerald-500/40 animate-pulse">
                                Today (Exam Day!)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-semibold text-xs">
                                Completed ({Math.abs(daysLeft)}d ago)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <h3 className="text-xl font-extrabold text-white">{exam.subjectName}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-semibold">
                          {formatDate(exam.date, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>

                      {/* Readiness Metrics */}
                      <div className="grid grid-cols-2 gap-2 my-4 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Syllabus Readiness</span>
                          <span className="text-sm font-extrabold text-emerald-400 font-mono">{syllabusPercent}%</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 font-semibold block">Mastery & Retention</span>
                          <span className="text-sm font-extrabold text-cyan-400 font-mono">{masteryPercent}%</span>
                        </div>
                      </div>

                      {/* Exam Notes */}
                      {exam.notes && (
                        <p className="text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                          {exam.notes}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span>{exam.startTime} • {exam.durationMinutes} min</span>
                      <span className="font-bold text-white">Target: {exam.targetMarks || 75}/{exam.totalMarks} Marks</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GYAN NIKETAN OFFICIAL SCHEDULE MATRIX TABLE (FROM IMAGE) */}
      {activeTab === 'gyan_niketan' && (
        <div className="space-y-5">
          <div className="p-6 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                    Official School Timetable (Session 2026 – 2027)
                  </span>
                </div>
                <h2 className="text-xl font-extrabold text-white mt-1">
                  Gyan Niketan Half-Yearly Examination Schedule (Classes I to XII)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Extracted from official school diary schedule. Choose your class to apply directly to your OS.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleApplyGyanNiketanSchedule('Class 7')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Apply to Class 7th
                </button>
                <button
                  onClick={() => handleApplyGyanNiketanSchedule('Class 8')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Apply to Class 8th
                </button>
                <button
                  onClick={() => handleApplyGyanNiketanSchedule('Class 9')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Apply to Class 9th
                </button>
                <button
                  onClick={() => handleApplyGyanNiketanSchedule('Class 10')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-bold border border-slate-700 cursor-pointer"
                >
                  Apply to Class 10th
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                    <th className="p-3 whitespace-nowrap">Date / Day</th>
                    <th className="p-3 whitespace-nowrap">I & II</th>
                    <th className="p-3 whitespace-nowrap">III & IV</th>
                    <th className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 7' ? 'bg-indigo-600/20 text-indigo-300 font-extrabold' : ''}`}>
                      V to VII {user.classGrade === 'Class 7' && '★'}
                    </th>
                    <th className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 8' ? 'bg-indigo-600/20 text-indigo-300 font-extrabold' : ''}`}>
                      VIII {user.classGrade === 'Class 8' && '★'}
                    </th>
                    <th className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 9' ? 'bg-indigo-600/25 text-indigo-300 font-extrabold ring-1 ring-indigo-500/40' : ''}`}>
                      IX (Active) {user.classGrade === 'Class 9' && '★'}
                    </th>
                    <th className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 10' ? 'bg-indigo-600/20 text-indigo-300 font-extrabold' : ''}`}>
                      X {user.classGrade === 'Class 10' && '★'}
                    </th>
                    <th className="p-3 whitespace-nowrap">XI</th>
                    <th className="p-3 whitespace-nowrap">XII</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-medium">
                  {GYAN_NIKETAN_HALF_YEARLY_2026.map((row, idx) => {
                    const isToday = row.date === currentDate;
                    return (
                      <tr
                        key={idx}
                        className={`hover:bg-slate-800/60 transition-colors ${
                          isToday ? 'bg-indigo-600/10 font-semibold text-white' : ''
                        }`}
                      >
                        <td className="p-3 whitespace-nowrap font-mono font-bold text-white flex flex-col">
                          <span>{row.displayDate}</span>
                          <span className="text-[10px] text-slate-400 font-sans font-normal">{row.day}</span>
                        </td>
                        <td className="p-3 whitespace-nowrap">{row.class1_2 || '----'}</td>
                        <td className="p-3 whitespace-nowrap">{row.class3_4 || '----'}</td>
                        <td className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 7' ? 'bg-indigo-600/15 font-bold text-indigo-200' : ''}`}>
                          {row.class5_7 || '----'}
                        </td>
                        <td className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 8' ? 'bg-indigo-600/15 font-bold text-indigo-200' : ''}`}>
                          {row.class8 || '----'}
                        </td>
                        <td className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 9' ? 'bg-indigo-600/20 font-extrabold text-white' : ''}`}>
                          {row.class9 ? (
                            <span className="px-2 py-0.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                              {row.class9}
                            </span>
                          ) : (
                            '----'
                          )}
                        </td>
                        <td className={`p-3 whitespace-nowrap ${user.classGrade === 'Class 10' ? 'bg-indigo-600/15 font-bold text-indigo-200' : ''}`}>
                          {row.class10 || '----'}
                        </td>
                        <td className="p-3 whitespace-nowrap">{row.class11 || '----'}</td>
                        <td className="p-3 whitespace-nowrap">{row.class12 || '----'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-800 text-center text-xs text-slate-400 italic">
              &quot;Success is not permanent. The same is also true of failure.&quot; — Gyan Niketan Motto
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: NVIDIA VISION AI DATE SHEET SCANNER (IMAGE PICKER) */}
      {activeTab === 'ai_scanner' && (
        <div className="space-y-6">
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sparkles className="w-4 h-4" />
                <span>NVIDIA NIM Multimodal Vision Scanner</span>
              </div>
              <h2 className="text-xl font-extrabold text-white mt-1">
                Upload School Timetable Photo or Date Sheet
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Upload or snap a photo of any printed date sheet or syllabus. Llama 3.2 11B Vision will extract dates and build your personal study plan.
              </p>
            </div>

            {/* Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="p-8 rounded-3xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-900 flex flex-col items-center justify-center text-center cursor-pointer transition-all group"
            >
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              {uploadedImage ? (
                <div className="space-y-3">
                  <img
                    src={uploadedImage}
                    alt="Uploaded date sheet"
                    className="max-h-64 rounded-2xl shadow-xl border border-slate-700 object-contain mx-auto"
                  />
                  <span className="text-xs text-indigo-400 font-semibold block">
                    Click to choose a different photo
                  </span>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Click or drag & drop date sheet photo</h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Supports PNG, JPG, JPEG photos of school diaries, notice boards, or date sheets.
                  </p>
                </div>
              )}
            </div>

            {/* Action Bar */}
            {uploadedImage && (
              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setUploadedImage(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Clear Photo
                </button>

                <button
                  onClick={handleRunVisionAnalysis}
                  disabled={isScanning}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>NVIDIA Vision Analyzing Timetable...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Extract Exam Dates with Vision AI</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Error Message */}
            {scanError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Results Display */}
            {scanResult && (
              <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-white">NVIDIA Vision Analysis Result</span>
                  </div>
                  {extractedExams && (
                    <button
                      onClick={handleApplyExtractedExams}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Apply Extracted Dates to My OS</span>
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed font-sans max-h-80 overflow-y-auto custom-scrollbar pr-2">
                  {scanResult}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Exam Date & Time Modal (Date Picker) */}
      {editingExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md bg-navy-900 border border-slate-700 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-white">Edit Exam Schedule</h3>
                <p className="text-xs text-slate-400">{editingExam.subjectName}</p>
              </div>
              <button
                onClick={() => setEditingExam(null)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditExam} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Examination Date</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={e => setEditDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Start Time</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 09:00 AM"
                    value={editStartTime}
                    onChange={e => setEditStartTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Target Marks</label>
                  <input
                    type="number"
                    min="1"
                    max={editingExam.totalMarks || 100}
                    value={editTargetMarks}
                    onChange={e => setEditTargetMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Syllabus Notes / Chapters</label>
                <textarea
                  rows={2}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="e.g. Ch 1 to Ch 7. Focus on numericals & diagrams."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
