import React, { useEffect, useState } from 'react';
import {
  Bot,
  Sparkles,
  CheckCircle2,
  Cpu,
  Database,
  Calendar,
  Layers,
  Zap,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AiConfigLoaderProps {
  isOpen: boolean;
  classGrade: string;
  studentName?: string;
  onComplete: () => void;
}

interface StepItem {
  id: number;
  label: string;
  detail: string;
  icon: React.ElementType;
}

export const AiConfigLoader: React.FC<AiConfigLoaderProps> = ({
  isOpen,
  classGrade,
  studentName,
  onComplete,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const steps: StepItem[] = [
    {
      id: 1,
      label: 'NVIDIA NIM Reasoning Engine Handshake',
      detail: 'Connecting to Meta Llama 3.2 11B Vision & Nemotron distributed endpoints...',
      icon: Cpu,
    },
    {
      id: 2,
      label: `Ingesting Official 2026-27 Examination Matrix`,
      detail: `Synchronizing Half-Yearly datesheet & subject priorities for ${classGrade}...`,
      icon: Calendar,
    },
    {
      id: 3,
      label: 'Calibrating NCERT Syllabus & Difficulty Curves',
      detail: 'Structuring high-yield chapter blueprints, theorem proofs & numerical distributions...',
      icon: Layers,
    },
    {
      id: 4,
      label: 'Synthesizing Spaced Repetition (Ebbinghaus) Intervals',
      detail: 'Calculating 1d, 3d, 7d and 14d memory retention decay cycles for weak concepts...',
      icon: Database,
    },
    {
      id: 5,
      label: 'Compiling Daily Study Timeline & AI Tutor Prompts',
      detail: 'Generating personalized daily calendar blocks and timed mock benchmarks...',
      icon: Zap,
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStepIndex(0);
      setTelemetryLogs([]);
      setIsFinished(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsFinished(true);
          try {
            confetti({ particleCount: 60, spread: 80, origin: { y: 0.6 } });
          } catch {}
          return 100;
        }

        const next = Math.min(100, prev + Math.floor(Math.random() * 8) + 5);

        // Step thresholds
        if (next >= 85) setCurrentStepIndex(4);
        else if (next >= 65) setCurrentStepIndex(3);
        else if (next >= 40) setCurrentStepIndex(2);
        else if (next >= 15) setCurrentStepIndex(1);
        else setCurrentStepIndex(0);

        return next;
      });
    }, 280);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Log telemetry ticker
  useEffect(() => {
    if (!isOpen) return;

    const logMessages = [
      `[NVIDIA NIM] Initializing model inference worker: meta/llama-3.2-11b-vision-instruct`,
      `[CBSE Matrix] Parsing Gyan Niketan Half-Yearly 2026 timetable for ${classGrade}`,
      `[Optimizer] Subject weights mapped: Core Maths & Science boosted for peak retention`,
      `[Spaced Repetition] Active recall intervals scheduled across September 1-17`,
      `[AI Tutor] Pre-loading NCERT formulas and Socratic reasoning pipelines`,
      `[System] 100% Calibrated. Ready for ${studentName || 'Student'} (${classGrade})!`,
    ];

    const timer = setInterval(() => {
      setTelemetryLogs(prev => {
        if (prev.length < logMessages.length) {
          return [...prev, logMessages[prev.length]];
        }
        return prev;
      });
    }, 450);

    return () => clearInterval(timer);
  }, [isOpen, classGrade, studentName]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy-950/95 backdrop-blur-2xl animate-fade-in select-none">
      {/* Ambient background glow */}
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-3xl pointer-events-none -bottom-20 -right-20 animate-pulse" />

      <div className="bg-navy-900/90 border border-slate-750 rounded-3xl w-full max-w-2xl shadow-2xl shadow-indigo-950/80 overflow-hidden relative backdrop-blur-xl flex flex-col">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800/80 bg-navy-950/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-0.5 shadow-lg shadow-indigo-500/25">
              <div className="w-full h-full bg-navy-950 rounded-[14px] flex items-center justify-center">
                <Bot className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-lg text-white tracking-tight">
                  Apex AI Neural Configuration
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-bold border border-indigo-500/30">
                  NVIDIA NIM
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calibrating custom academic OS for{' '}
                <strong className="text-white">{studentName || 'Student'}</strong> •{' '}
                <span className="text-cyan-300 font-semibold">{classGrade}</span>
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 to-cyan-300 bg-clip-text text-transparent">
              {progress}%
            </span>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-800/80 h-2 relative overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 transition-all duration-300 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-8 bg-white/40 blur-[2px] animate-pulse" />
          </div>
        </div>

        {/* Steps and Visual Loader Body */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar max-h-[60vh]">
          {/* Active Step Highlight Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-slate-850 border border-indigo-500/40 shadow-inner flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center flex-shrink-0 text-indigo-400">
              <Sparkles className="w-6 h-6 animate-spin text-cyan-300" style={{ animationDuration: '4s' }} />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-cyan-400 font-mono">
                Current Calibration Phase
              </span>
              <h3 className="text-sm font-extrabold text-white truncate">
                {steps[currentStepIndex]?.label || 'Configuring Study Engine...'}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {steps[currentStepIndex]?.detail}
              </p>
            </div>
          </div>

          {/* Step-by-Step Checkpoint List */}
          <div className="space-y-2.5">
            {steps.map((s, idx) => {
              const Icon = s.icon;
              const isPassed = idx < currentStepIndex || isFinished;
              const isCurrent = idx === currentStepIndex && !isFinished;

              return (
                <div
                  key={s.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isPassed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                      : isCurrent
                      ? 'bg-indigo-950/40 border-indigo-500/50 text-white ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/40 border-slate-800/60 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isPassed
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : isCurrent
                          ? 'bg-indigo-500/20 text-cyan-400 animate-pulse'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="truncate">
                      <div className={`text-xs font-bold ${isCurrent ? 'text-white' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                        {s.label}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">{s.detail}</div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 ml-3">
                    {isPassed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isCurrent ? (
                      <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="w-3 h-3 rounded-full bg-slate-800" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI Thought Stream / Telemetry Readout */}
          <div className="p-3.5 rounded-2xl bg-black/50 border border-slate-800 font-mono text-[11px] space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between pb-1 border-b border-slate-850">
              <span>NVIDIA NIM AI Telemetry Stream</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live
              </span>
            </div>
            <div className="space-y-1 pt-1 max-h-24 overflow-y-auto custom-scrollbar">
              {telemetryLogs.map((log, i) => (
                <div key={i} className="text-slate-300 text-[11px] leading-relaxed flex items-start gap-1.5">
                  <span className="text-cyan-400 select-none">›</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800/80 bg-navy-950/70 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            {isFinished
              ? '✨ AI Workspace successfully synthesized!'
              : '⚡ Optimizing curriculum for high distinction...'}
          </span>

          <button
            type="button"
            onClick={onComplete}
            className={`px-6 py-2.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isFinished
                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-white shadow-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            <span>{isFinished ? 'Enter Workspace' : 'Skip & Open'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
