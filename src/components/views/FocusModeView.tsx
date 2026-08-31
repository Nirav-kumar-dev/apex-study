import React, { useState, useEffect, useRef } from 'react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Plus,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  Layers,
  Maximize2,
  Minimize2,
  CloudRain,
  Radio,
  Wind,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundSynth } from '../../lib/audio';
import { PostSessionModal } from '../modals/PostSessionModal';
import { StudyTask } from '../../types';

export const FocusModeView: React.FC = () => {
  const { activeFocusTask, tasks, subjects, chapters, currentDate } = useApp();

  const [selectedTask, setSelectedTask] = useState<StudyTask | null>(
    activeFocusTask || tasks.find(t => t.scheduledDate === currentDate && t.status === 'pending') || null
  );

  const [initialMinutes, setInitialMinutes] = useState<number>(50);
  const [secondsLeft, setSecondsLeft] = useState<number>(50 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientSound, setAmbientSound] = useState<'rain' | 'white_noise' | 'binaural' | 'none'>('none');
  const [isPostSessionOpen, setIsPostSessionOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync when activeFocusTask prop updates
  useEffect(() => {
    if (activeFocusTask) {
      setSelectedTask(activeFocusTask);
      const mins = activeFocusTask.estimatedMinutes || 45;
      setInitialMinutes(mins);
      setSecondsLeft(mins * 60);
      setIsRunning(true);
    }
  }, [activeFocusTask]);

  // Timer Tick
  useEffect(() => {
    if (isRunning && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            soundSynth.playChime('complete');
            setIsPostSessionOpen(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, secondsLeft]);

  // Ambient sound handler
  const handleToggleAmbient = (mode: 'rain' | 'white_noise' | 'binaural') => {
    if (ambientSound === mode) {
      soundSynth.stopAmbient();
      setAmbientSound('none');
    } else {
      soundSynth.startAmbient(mode);
      setAmbientSound(mode);
    }
  };

  // Preset selector
  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setInitialMinutes(mins);
    setSecondsLeft(mins * 60);
  };

  // Extend session
  const handleExtend = (extraMinutes: number) => {
    setSecondsLeft(prev => prev + extraMinutes * 60);
  };

  const handleFinishEarly = () => {
    setIsRunning(false);
    setIsPostSessionOpen(true);
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const progressPercent = 100 - (secondsLeft / (initialMinutes * 60)) * 100;

  const currentSubject = selectedTask ? subjects.find(s => s.id === selectedTask.subjectId) : subjects[0];
  const currentChapter = selectedTask?.chapterId ? chapters.find(c => c.id === selectedTask.chapterId) : undefined;

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="min-h-[82vh] flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in relative pb-16">
      {/* Top Controls: Ambient sounds & Fullscreen */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-8">
        {/* Ambient Sound Generators */}
        <div className="flex items-center gap-1.5 bg-slate-850 p-1.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-2 hidden sm:block">Ambient</span>
          <button
            onClick={() => handleToggleAmbient('rain')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              ambientSound === 'rain'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            <span>Rain</span>
          </button>

          <button
            onClick={() => handleToggleAmbient('white_noise')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              ambientSound === 'white_noise'
                ? 'bg-indigo-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            <span>Noise</span>
          </button>

          <button
            onClick={() => handleToggleAmbient('binaural')}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              ambientSound === 'binaural'
                ? 'bg-violet-500 text-white font-bold shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Alpha 10Hz</span>
          </button>
        </div>

        <button
          onClick={toggleFullscreen}
          className="p-2 rounded-2xl bg-slate-850 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Main Focus Card */}
      <div className="w-full max-w-xl text-center space-y-6">
        {/* Active Task Selector / Display */}
        <div className="p-4 rounded-3xl bg-slate-850 border border-slate-800 inline-block max-w-md w-full shadow-lg">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-400 block mb-1">
            Current Focus Task
          </span>
          <div className="text-sm sm:text-base font-extrabold text-white truncate">
            {selectedTask?.title || 'General Deep Study & Practice'}
          </div>
          {currentChapter && (
            <div className="text-xs text-slate-400 mt-0.5 truncate">
              {currentSubject?.name} • {currentChapter.name}
            </div>
          )}
        </div>

        {/* Big Circular Pomodoro Timer */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 mx-auto flex items-center justify-center">
          {/* Circular Progress Ring (SVG) */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-slate-800"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="text-indigo-500 transition-all duration-1000 ease-linear"
              strokeWidth="4.5"
              strokeDasharray={276.46}
              strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
              strokeLinecap="round"
              stroke="url(#focusGradient)"
              fill="transparent"
            />
            <defs>
              <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-5xl sm:text-7xl font-black text-white font-mono tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-2">
              {isRunning ? 'Deep Work in Progress' : 'Paused / Ready'}
            </span>
          </div>
        </div>

        {/* Timer Duration Presets */}
        <div className="flex items-center justify-center gap-2">
          {[
            { mins: 25, label: '25m (Pomodoro)' },
            { mins: 50, label: '50m (Deep Work)' },
            { mins: 90, label: '90m (Ultra Focus)' },
          ].map(preset => (
            <button
              key={preset.mins}
              onClick={() => handleSelectPreset(preset.mins)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                initialMinutes === preset.mins
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-850 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-3 pt-2">
          {/* Pause / Resume */}
          <button
            onClick={() => setIsRunning(prev => !prev)}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:brightness-110 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2.5 active:scale-95 transition-all"
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                <span>{secondsLeft === initialMinutes * 60 ? 'Start Focus' : 'Resume'}</span>
              </>
            )}
          </button>

          {/* Extend Session */}
          <button
            onClick={() => handleExtend(10)}
            className="px-4 py-3.5 rounded-2xl bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
            title="Add +10 minutes"
          >
            <Plus className="w-4 h-4" />
            <span>+10m</span>
          </button>

          {/* Finish & Complete */}
          <button
            onClick={handleFinishEarly}
            className="px-4 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Complete</span>
          </button>
        </div>
      </div>

      {/* Post Session Modal for 5-star feedback */}
      <PostSessionModal
        isOpen={isPostSessionOpen}
        onClose={() => setIsPostSessionOpen(false)}
        task={selectedTask}
        durationMinutes={Math.max(1, Math.round((initialMinutes * 60 - secondsLeft) / 60) || initialMinutes)}
      />
    </div>
  );
};
