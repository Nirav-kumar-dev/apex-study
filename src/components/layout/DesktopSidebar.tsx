import React from 'react';
import {
  LayoutDashboard,
  CalendarCheck2,
  CalendarDays,
  BookOpen,
  Layers,
  Repeat,
  AlertCircle,
  FileCheck2,
  BarChart3,
  Timer,
  GraduationCap,
  Settings,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Bot,
  Library,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavigationTab } from '../../types';
import { getDaysLeft } from '../../lib/utils';
import { CLASS_OPTIONS } from '../../data/classCurriculums';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
}

export const DesktopSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    user,
    exams,
    revisions,
    errorLogs,
    startFocusSession,
    toggleTheme,
    toggleSound,
    currentDate,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    firebaseUser,
    cloudSyncStatus,
    openAuthModal,
    triggerAiConfiguration,
  } = useApp();

  // Find nearest upcoming exam
  const sortedExams = [...exams].sort((a, b) => {
    const diffA = getDaysLeft(a.date, currentDate);
    const diffB = getDaysLeft(b.date, currentDate);
    if (diffA >= 0 && diffB >= 0) return diffA - diffB;
    if (diffA >= 0) return -1;
    if (diffB >= 0) return 1;
    return diffB - diffA;
  });
  const nextExam = sortedExams.find(e => getDaysLeft(e.date, currentDate) >= 0) || sortedExams[0];
  const daysLeft = nextExam ? getDaysLeft(nextExam.date, currentDate) : 0;

  // Counts
  const dueRevisionsCount = revisions.filter(
    r => r.status !== 'completed' && getDaysLeft(r.dueDate, currentDate) <= 0
  ).length;

  const totalErrors = errorLogs.reduce((acc, e) => acc + (e.occurrenceCount || 1), 0);

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plan', label: "Today's Plan", icon: CalendarCheck2 },
    { id: 'ai-tutor', label: 'NVIDIA AI Tutor', icon: Bot, badge: 'NIM AI', highlight: true },
    { id: 'books', label: 'Textbook Library', icon: Library },
    { id: 'calendar', label: 'Study Calendar', icon: CalendarDays },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'chapters', label: 'Chapters & Syllabus', icon: Layers },
    {
      id: 'revision',
      label: 'Spaced Revision',
      icon: Repeat,
      badge: dueRevisionsCount > 0 ? `${dueRevisionsCount} due` : undefined,
      highlight: dueRevisionsCount > 0,
    },
    {
      id: 'errors',
      label: 'Error Notebook',
      icon: AlertCircle,
      badge: totalErrors > 0 ? totalErrors : undefined,
    },
    { id: 'mocks', label: 'Mock Tests', icon: FileCheck2 },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'exams', label: 'Exam Schedule', icon: GraduationCap },
  ];

  return (
    <aside
      className={`flex-shrink-0 bg-navy-900/95 border-r border-slate-800/80 flex flex-col h-screen sticky top-0 backdrop-blur-xl z-30 select-none transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div
        className={`border-b border-slate-800/80 flex items-center transition-all duration-300 ${
          isSidebarCollapsed
            ? 'p-3.5 pt-[max(1.75rem,calc(env(safe-area-inset-top)+0.5rem))] lg:pt-3.5 justify-center'
            : 'p-5 pt-[max(1.75rem,calc(env(safe-area-inset-top)+0.5rem))] lg:pt-5 justify-between'
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            onClick={() => setActiveView('dashboard')}
            className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex-shrink-0 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30 cursor-pointer hover:scale-105 transition-transform"
            title="Apex Study OS"
          >
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          {!isSidebarCollapsed && (
            <div className="animate-fade-in truncate">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white font-sans">Apex</span>
                <span className="text-xs font-semibold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  OS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">Exam Intelligence</p>
            </div>
          )}
        </div>

        {/* Minimize / Expand Toggle Button (Gemini Style) */}
        <button
          onClick={toggleSidebarCollapse}
          title={isSidebarCollapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar'}
          className={`p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 active:scale-95 transition-all duration-150 ${
            isSidebarCollapsed ? 'hidden' : 'block'
          }`}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* Collapsed Mode Quick Expand Trigger */}
      {isSidebarCollapsed && (
        <div className="pt-2 px-3 pb-1 flex justify-center">
          <button
            onClick={toggleSidebarCollapse}
            title="Expand sidebar"
            className="p-2 rounded-xl text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/15 border border-transparent hover:border-indigo-500/30 transition-all duration-150"
          >
            <PanelLeftOpen className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Class Quick Switcher */}
      {!isSidebarCollapsed && (
        <div className="mx-3 mt-3 p-2 rounded-xl bg-slate-850/90 border border-slate-750/70">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">
            <span>Class Grade</span>
            <span className="text-cyan-400 font-mono">4 Classes</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            {CLASS_OPTIONS.map(opt => {
              const isSelected = user.classGrade === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => triggerAiConfiguration(opt.id)}
                  title={`${opt.label} • Starts ${opt.firstExam}`}
                  className={`py-1 rounded-lg text-[11px] font-extrabold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400/50'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {opt.id.replace('Class ', 'C-')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Target Exam Pill */}
      {nextExam && (
        <>
          {!isSidebarCollapsed ? (
            <div className="mx-3 mt-2 p-3 rounded-xl bg-gradient-to-b from-slate-850 to-slate-900 border border-slate-700/60 shadow-sm animate-fade-in">
              <div className="flex items-center justify-between text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                <span>Target Exam</span>
                <span className="text-indigo-400 font-bold">{daysLeft}d left</span>
              </div>
              <p className="text-xs font-bold text-white mt-1 truncate">{nextExam.subjectName} Half-Yearly</p>
              <div className="w-full bg-slate-700/60 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(10, Math.min(100, 100 - daysLeft * 3))}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="my-2 px-2 flex justify-center group relative">
              <div
                onClick={() => setActiveView('exams')}
                className="w-10 h-10 rounded-xl bg-slate-850 border border-slate-700/70 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500/50 hover:bg-slate-800 transition-all"
              >
                <span className="text-[9px] font-bold text-indigo-400 leading-none">{daysLeft}d</span>
                <span className="text-[7px] text-slate-400 font-medium uppercase mt-0.5">left</span>
              </div>

              {/* Floating Tooltip */}
              <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md text-xs font-medium text-white">
                  <span className="text-indigo-400 font-bold">{nextExam.subjectName} Exam:</span> {daysLeft} days remaining
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Navigation List */}
      <nav className={`flex-1 space-y-1 overflow-y-auto custom-scrollbar ${isSidebarCollapsed ? 'px-2 py-2' : 'px-3 py-3'}`}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;

          if (isSidebarCollapsed) {
            return (
              <div key={item.id} className="relative group flex justify-center">
                <button
                  onClick={() => setActiveView(item.id)}
                  className={`w-11 h-11 flex items-center justify-center rounded-xl transition-all duration-150 relative ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 border border-indigo-400/40'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  {item.badge && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border-2 border-navy-900 animate-pulse" />
                  )}
                </button>

                {/* Gemini Floating Tooltip */}
                <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
                  <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-md text-xs font-semibold text-white flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-600/90 text-white font-semibold shadow-md shadow-indigo-600/20 border border-indigo-500/40'
                  : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-semibold transition-all ${
                    item.highlight
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse-subtle'
                      : isActive
                      ? 'bg-indigo-700/80 text-white'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Focus Mode Action Button */}
      <div className={`border-t border-slate-800/80 transition-all ${isSidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}>
        {isSidebarCollapsed ? (
          <div className="relative group flex justify-center">
            <button
              onClick={() => startFocusSession()}
              className="w-11 h-11 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20 hover:scale-105 active:scale-95 transition-all"
            >
              <Timer className="w-5 h-5 animate-pulse" />
            </button>

            {/* Floating Tooltip */}
            <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
              <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-md text-xs font-semibold text-white">
                ⏱️ Start Focus Mode (Distraction-Free)
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => startFocusSession()}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-[0.98] transition-all group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <Timer className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-none">Focus Mode</div>
                <div className="text-[10px] text-indigo-100/80 font-normal mt-0.5">Distraction-Free Timer</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>

      {/* User Footer & Quick Toggles */}
      <div
        className={`bg-navy-950/70 border-t border-slate-800/80 flex items-center transition-all duration-300 ${
          isSidebarCollapsed ? 'p-2 flex-col gap-2 justify-center' : 'p-3 justify-between'
        }`}
      >
        {isSidebarCollapsed ? (
          <>
            <div className="relative group">
              <button
                onClick={() => openAuthModal()}
                className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 hover:border-indigo-400 transition-colors relative"
              >
                {firebaseUser ? (
                  firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    (firebaseUser.displayName || user.name || 'S').charAt(0).toUpperCase()
                  )
                ) : (
                  (user.name || 'S').charAt(0).toUpperCase()
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-navy-950 ${
                    cloudSyncStatus === 'synced' ? 'bg-emerald-400' : cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </button>

              <div className="absolute left-[calc(100%+12px)] top-1/2 -translate-y-1/2 opacity-0 pointer-events-none group-hover:opacity-100 transition-all duration-150 z-50 whitespace-nowrap">
                <div className="px-3 py-1.5 rounded-xl bg-slate-900/95 border border-slate-700/90 shadow-2xl backdrop-blur-md text-xs font-semibold text-white">
                  {firebaseUser ? `☁️ ${firebaseUser.displayName || user.name || 'Student'} • Cloud Synced` : '👤 Guest Mode • Sign In for Cloud'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveView('settings')}
              title="Settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => openAuthModal()}
              className="flex items-center gap-2.5 text-left group hover:opacity-85 transition-opacity truncate flex-1 mr-1"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex-shrink-0 flex items-center justify-center font-bold text-xs text-indigo-300 relative">
                {firebaseUser ? (
                  firebaseUser.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    (firebaseUser.displayName || user.name || 'S').charAt(0).toUpperCase()
                  )
                ) : (
                  (user.name || 'S').charAt(0).toUpperCase()
                )}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-navy-950 ${
                    cloudSyncStatus === 'synced' ? 'bg-emerald-400' : cloudSyncStatus === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-500'
                  }`}
                />
              </div>
              <div className="truncate">
                <div className="text-xs font-semibold text-slate-200 group-hover:text-white leading-tight truncate">
                  {firebaseUser?.displayName || user.name}
                </div>
                <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                  <span>{user.classGrade}</span>
                  <span>•</span>
                  <span className={cloudSyncStatus === 'synced' ? 'text-emerald-400' : 'text-slate-400'}>
                    {firebaseUser ? 'Cloud Sync' : 'Sign In'}
                  </span>
                </div>
              </div>
            </button>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={toggleSound}
                title={user.soundEnabled ? 'Disable audio chimes' : 'Enable audio chimes'}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                {user.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
              </button>
              <button
                onClick={toggleTheme}
                title="Toggle theme"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                {user.theme === 'dark' ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setActiveView('settings')}
                title="Settings"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};
