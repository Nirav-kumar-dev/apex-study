import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  Timer,
  BarChart3,
  MoreHorizontal,
  BookOpen,
  Layers,
  Repeat,
  AlertCircle,
  FileCheck2,
  GraduationCap,
  Settings,
  X,
  Sparkles,
  Bot,
  Library,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { getDaysLeft } from '../../lib/utils';

export const MobileBottomNav: React.FC = () => {
  const { activeView, setActiveView, revisions, errorLogs, currentDate } = useApp();
  const [isMoreDrawerOpen, setIsMoreDrawerOpen] = useState(false);

  const dueRevisionsCount = revisions.filter(
    r => r.status !== 'completed' && getDaysLeft(r.dueDate, currentDate) <= 0
  ).length;

  const totalErrors = errorLogs.reduce((acc, e) => acc + (e.occurrenceCount || 1), 0);

  const moreItems: { id: NavigationTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'ai-tutor', label: 'NVIDIA AI Tutor', icon: Bot, badge: 'NIM AI' },
    { id: 'books', label: 'Textbook Library', icon: Library },
    { id: 'subjects', label: 'Subjects & Syllabi', icon: BookOpen },
    { id: 'chapters', label: 'Chapter Deep-Dive', icon: Layers },
    {
      id: 'revision',
      label: 'Spaced Repetition',
      icon: Repeat,
      badge: dueRevisionsCount > 0 ? `${dueRevisionsCount} due` : undefined,
    },
    {
      id: 'errors',
      label: 'Error Notebook',
      icon: AlertCircle,
      badge: totalErrors > 0 ? totalErrors : undefined,
    },
    { id: 'mocks', label: 'Mock Test Tracker', icon: FileCheck2 },
    { id: 'calendar', label: 'Study Calendar', icon: CalendarCheck2 },
    { id: 'exams', label: 'Exam Schedule', icon: GraduationCap },
    { id: 'settings', label: 'Settings & NVIDIA API', icon: Settings },
  ];

  const handleSelectMoreItem = (id: NavigationTab) => {
    setActiveView(id);
    setIsMoreDrawerOpen(false);
  };

  return (
    <>
      {/* Fixed Bottom Navigation Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-2xl border-t border-slate-800/90 pb-safe">
        <nav className="flex items-center justify-around px-2 py-1.5 h-16">
          {/* 1. Home */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeView === 'dashboard' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard className={`w-5 h-5 ${activeView === 'dashboard' ? 'scale-110 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">Home</span>
          </button>

          {/* 2. Plan */}
          <button
            onClick={() => setActiveView('plan')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeView === 'plan' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarCheck2 className={`w-5 h-5 ${activeView === 'plan' ? 'scale-110 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">Plan</span>
          </button>

          {/* 3. Center Elevated Focus Mode Button */}
          <button
            onClick={() => setActiveView('focus')}
            className="flex flex-col items-center justify-center -mt-5 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/40 border-2 border-navy-950 group-active:scale-95 transition-transform">
              <Timer className="w-6 h-6 text-white animate-pulse" />
            </div>
            <span className="text-[10px] font-bold text-indigo-300 mt-1">Focus</span>
          </button>

          {/* 4. Progress */}
          <button
            onClick={() => setActiveView('analytics')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeView === 'analytics' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className={`w-5 h-5 ${activeView === 'analytics' ? 'scale-110 stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold mt-1">Progress</span>
          </button>

          {/* 5. More / Menu */}
          <button
            onClick={() => setIsMoreDrawerOpen(true)}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all relative ${
              isMoreDrawerOpen || ['ai-tutor', 'books', 'subjects', 'chapters', 'revision', 'errors', 'mocks', 'exams', 'settings', 'calendar'].includes(activeView)
                ? 'text-indigo-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-[10px] font-semibold mt-1">More</span>
            {dueRevisionsCount > 0 && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>
        </nav>
      </div>

      {/* Mobile "More" Bottom Sheet Modal */}
      {isMoreDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
          <div
            className="w-full bg-navy-900 border-t border-slate-800 rounded-t-3xl p-5 shadow-2xl max-h-[85vh] overflow-y-auto animate-slide-up"
          >
            {/* Sheet Handle & Header */}
            <div className="w-12 h-1.5 rounded-full bg-slate-700 mx-auto mb-4" />
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="font-bold text-base text-white">Study Tools & Modules</span>
              </div>
              <button
                onClick={() => setIsMoreDrawerOpen(false)}
                className="p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Grid of Tools */}
            <div className="grid grid-cols-2 gap-2.5 mt-4">
              {moreItems.map(item => {
                const Icon = item.icon;
                const isItemActive = activeView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectMoreItem(item.id)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isItemActive
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                        : 'bg-slate-850/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                          isItemActive ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-semibold truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
