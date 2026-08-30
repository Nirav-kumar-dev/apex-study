import React from 'react';
import {
  FileCheck2,
  Plus,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  AlertTriangle,
  BookOpen,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useApp } from '../../context/AppContext';
import { formatDate } from '../../lib/utils';

interface MockTestsViewProps {
  onOpenLogMock: () => void;
}

export const MockTestsView: React.FC<MockTestsViewProps> = ({ onOpenLogMock }) => {
  const { mockTests, subjects, deleteMockTest, setActiveView } = useApp();

  const mathsMocks = mockTests.filter(m => m.subjectId === 'sub-maths');

  const chartData = mockTests.map((m, idx) => ({
    name: `Mock ${idx + 1}`,
    score: m.percentage,
    subject: subjects.find(s => s.id === m.subjectId)?.name || 'Subject',
    title: m.title,
    rawScore: `${m.score}/${m.totalMarks}`,
  }));

  const latestPercentage = mockTests.length > 0 ? mockTests[mockTests.length - 1].percentage : 0;
  const initialPercentage = mockTests.length > 0 ? mockTests[0].percentage : 0;
  const overallImprovement = (latestPercentage - initialPercentage).toFixed(1);

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Mock Test Performance & Trajectory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Measure score improvement, time management, and weak topic eradication over time
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => setActiveView('ai-tutor')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:brightness-110 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate AI Mock Test</span>
          </button>

          <button
            onClick={onOpenLogMock}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Log Mock Exam</span>
          </button>
        </div>
      </div>

      {/* Score Progression Graph & Trajectory Highlights */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>Score Progression Trajectory</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
              Maths & Science Performance Curve
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Growth</span>
              <span className="text-lg font-extrabold text-emerald-400 font-mono">
                +{overallImprovement}% Jump 🚀
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Latest Mock</span>
              <span className="text-lg font-extrabold text-cyan-400 font-mono">
                {latestPercentage}%
              </span>
            </div>
          </div>
        </div>

        {/* Recharts Curve */}
        <div className="h-64 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis domain={[40, 100]} stroke="#64748b" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '1rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                formatter={(value: any, name: any, item: any) => [
                  `${value}% (${item.payload.rawScore})`,
                  'Score',
                ]}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#6366f1"
                strokeWidth={3.5}
                dot={{ r: 6, fill: '#6366f1', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 8, fill: '#06b6d4' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Milestone Callout */}
        <div className="p-3.5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-slate-200">
              Maths Mock progression:{' '}
              <span className="font-bold text-white">Mock 1 (62.5%) &rarr; Mock 2 (71.3%) &rarr; Mock 3 (82.5%)</span>
            </span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hidden sm:block">
            Target 90%+ in Sight
          </span>
        </div>
      </div>

      {/* Mock Tests List */}
      <div className="space-y-4">
        <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
          Mock Exam History ({mockTests.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockTests.map(mock => {
            const subject = subjects.find(s => s.id === mock.subjectId);

            return (
              <div
                key={mock.id}
                className="p-5 rounded-3xl bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[11px] font-extrabold uppercase tracking-wider"
                      style={{ color: subject?.color || '#6366f1' }}
                    >
                      {subject?.name}
                    </span>
                    <span className="text-xs font-bold text-slate-400">{formatDate(mock.date)}</span>
                  </div>

                  <h4 className="font-bold text-base text-white">{mock.title}</h4>

                  {/* Score & Duration matrix */}
                  <div className="grid grid-cols-3 gap-2 my-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Score</div>
                      <div className="text-sm font-extrabold text-white font-mono mt-0.5">
                        {mock.score} / {mock.totalMarks}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Percentage</div>
                      <div className="text-sm font-extrabold text-emerald-400 font-mono mt-0.5">
                        {mock.percentage}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400">Duration</div>
                      <div className="text-sm font-extrabold text-indigo-300 font-mono mt-0.5">
                        {mock.durationMinutes}m
                      </div>
                    </div>
                  </div>

                  {/* Weak topics */}
                  {mock.weakTopics && mock.weakTopics.length > 0 && (
                    <div className="mb-2">
                      <span className="text-[10px] uppercase font-bold text-amber-400 block mb-1">
                        Weak Topics Identified:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {mock.weakTopics.map((topic, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/20"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Takeaways */}
                  {mock.keyTakeaways && (
                    <p className="text-xs text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 font-sans">
                      <span className="font-bold text-indigo-300 mr-1">Key Takeaway:</span>
                      {mock.keyTakeaways}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">{mock.mistakesCount} mistakes logged</span>
                  <button
                    onClick={() => deleteMockTest(mock.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
