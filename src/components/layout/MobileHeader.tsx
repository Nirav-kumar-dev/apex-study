import React from 'react';
import { Menu, Sparkles, Timer, Settings, Sun, Moon } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getDaysLeft } from '../../lib/utils';

export const MobileHeader: React.FC = () => {
  const {
    exams,
    user,
    currentDate,
    startFocusSession,
    setActiveView,
    toggleSidebar,
    toggleTheme,
    firebaseUser,
    cloudSyncStatus,
    openAuthModal,
  } = useApp();

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

  return (
    <header className="lg:hidden sticky top-0 z-30 bg-navy-950/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-[max(2.25rem,calc(env(safe-area-inset-top)+0.75rem))] pb-3 flex items-center justify-between shadow-lg">
      {/* Left Menu & Logo */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          aria-label="Open navigation menu"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5" onClick={() => setActiveView('dashboard')}>
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/30">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight">Apex OS</span>
        </div>
      </div>

      {/* Target Exam Countdown Pill */}
      {nextExam && (
        <button
          onClick={() => setActiveView('exams')}
          className="px-2.5 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center gap-1.5 text-xs font-semibold"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          <span className="truncate max-w-[90px]">{nextExam.subjectName}</span>
          <span className="font-bold text-white bg-indigo-600 px-1.5 py-0.2 rounded text-[10px]">{daysLeft}d</span>
        </button>
      )}

      {/* Right Quick Actions */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => openAuthModal()}
          className="w-7 h-7 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300 relative"
          title={firebaseUser ? 'Account & Cloud Sync' : 'Sign In'}
        >
          {firebaseUser ? (
            firebaseUser.photoURL ? (
              <img src={firebaseUser.photoURL} alt="Avatar" className="w-full h-full rounded-full" />
            ) : (
              (firebaseUser.displayName || user.name).charAt(0).toUpperCase()
            )
          ) : (
            user.name.charAt(0)
          )}
          <span
            className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-navy-950 ${
              cloudSyncStatus === 'synced' ? 'bg-emerald-400' : 'bg-slate-500'
            }`}
          />
        </button>

        <button
          onClick={() => startFocusSession()}
          className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:brightness-110 active:scale-95 transition-all"
          title="Start Focus Session"
        >
          <Timer className="w-4 h-4" />
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
          title="Toggle theme"
        >
          {user.theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
