import React from 'react';
import {
  BarChart3,
  Clock,
  BookOpen,
  Award,
  TrendingUp,
  Repeat,
  AlertTriangle,
  PieChart as PieChartIcon,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { calculateSubjectProgress } from '../../lib/utils';
import { getRevisionRetentionScore } from '../../lib/spacedRepetition';

export const AnalyticsView: React.FC = () => {
  const { subjects, chapters, revisions, mockTests, sessionLogs } = useApp();

  // Weekly study hours data (Simulated Monday through Sunday)
  const weeklyHoursData = [
    { day: 'Mon', hours: 3.5, target: 3.5 },
    { day: 'Tue', hours: 4.0, target: 3.5 },
    { day: 'Wed', hours: 3.0, target: 3.5 },
    { day: 'Thu', hours: 4.5, target: 3.5 },
    { day: 'Fri', hours: 3.5, target: 3.5 },
    { day: 'Sat', hours: 6.5, target: 6.5 },
    { day: 'Sun', hours: 7.0, target: 6.5 },
  ];

  // Subject time distribution
  const subjectTimeData = subjects.map(s => ({
    name: s.name,
    hours: s.completedStudyHours,
    color: s.color,
  }));

  // Syllabus completed vs Mastered
  const totalChapters = chapters.length;
  const completedChapters = chapters.filter(c => c.completionPercentage >= 100).length;
  const masteredChapters = chapters.filter(c => c.isMastered).length;
  const retentionScore = getRevisionRetentionScore(revisions, chapters);

  // Weak subjects improvement
  const weakSubjects = subjects.filter(s => s.isWeak);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Preparation Analytics & Mastery
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
          High-yield metrics on study volume, subject time distribution, and retention rates
        </p>
      </div>

      {/* Top 4 Key Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Total Study Time</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {subjects.reduce((acc, s) => acc + s.completedStudyHours, 0).toFixed(1)} <span className="text-sm text-slate-400 font-sans font-normal">hrs</span>
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">32.0 hrs this week</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Syllabus Covered</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {Math.round((completedChapters / Math.max(1, totalChapters)) * 100)}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">{completedChapters} of {totalChapters} chapters</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Mastery & Retention</span>
            <Repeat className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">
            {retentionScore}%
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Spaced recall retention</p>
        </div>

        <div className="p-5 rounded-3xl bg-slate-850 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Mock Test Average</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white font-mono">
            {mockTests.length > 0 ? (mockTests.reduce((acc, m) => acc + m.percentage, 0) / mockTests.length).toFixed(1) : '72'}%
          </div>
          <p className="text-[11px] text-emerald-400 font-semibold mt-1">+20% improvement trajectory</p>
        </div>
      </div>

      {/* Chart Row 1: Weekly Study Hours & Subject Time Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Hours Bar Chart */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white">Daily Study Hours vs Target</h3>
              <p className="text-xs text-slate-400">School days (3.5h) and Weekend surges (6.5h+)</p>
            </div>
            <span className="text-xs font-bold text-indigo-400 bg-indigo-500/15 px-2.5 py-0.5 rounded-lg">
              This Week
            </span>
          </div>

          <div className="h-60 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    color: '#f8fafc',
                  }}
                  formatter={(val: any) => [`${val} Hours`, 'Studied']}
                />
                <Bar dataKey="hours" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Time Distribution Pie */}
        <div className="p-5 sm:p-6 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-4">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white">Subject Hours Distribution</h3>
            <p className="text-xs text-slate-400">Maths (45%) and Science (30%) prioritization</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subjectTimeData}
                    dataKey="hours"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                  >
                    {subjectTimeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '1rem',
                      fontSize: '12px',
                      color: '#f8fafc',
                    }}
                    formatter={(val: any) => [`${val} Hours`, 'Completed']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs">
              {subjects.map(s => (
                <div key={s.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-slate-300 font-semibold">{s.name}</span>
                  </div>
                  <span className="font-mono text-white font-bold">{s.completedStudyHours}h</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Weak Subjects Improvement Tracking */}
      <div className="p-6 rounded-3xl bg-slate-850 border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-white">Weak Subject Acceleration Trajectories</h3>
          <p className="text-xs text-slate-400">Targeted preparation status for identified focus areas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {weakSubjects.map(sub => {
            const { syllabusPercent, masteryPercent, chaptersCompleted, totalChapters } = calculateSubjectProgress(sub, chapters);

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                    <span className="font-bold text-sm text-white">{sub.name}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Weak Focus
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Syllabus Coverage</span>
                      <span className="font-bold text-white">{syllabusPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${syllabusPercent}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-1">
                      <span>Exam Mastery (Confidence &ge; 4)</span>
                      <span className="font-bold text-cyan-400">{masteryPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${masteryPercent}%` }} />
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{chaptersCompleted}/{totalChapters} Chapters Solved</span>
                  <span className="font-bold text-white">{sub.completedStudyHours} hrs</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
