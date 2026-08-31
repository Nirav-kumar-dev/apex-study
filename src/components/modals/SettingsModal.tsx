import React, { useState, useEffect } from 'react';
import {
  X,
  Settings,
  User,
  Clock,
  Percent,
  Volume2,
  VolumeX,
  Download,
  Upload,
  RotateCcw,
  Sparkles,
  Check,
  AlertTriangle,
  Cloud,
  Key,
  Cpu,
  Zap,
  Loader2,
  CheckCircle2,
  Globe,
  School,
  Target,
  Sun,
  Moon,
  Timer,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import {
  NVIDIA_MODELS,
  testNvidiaConnection,
  DEFAULT_NVIDIA_BASE_URL,
  DEFAULT_NVIDIA_API_KEY,
  DEFAULT_NVIDIA_MODEL,
} from '../../lib/nvidiaApi';
import { CLASS_OPTIONS } from '../../data/classCurriculums';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenOnboarding: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenOnboarding,
}) => {
  const {
    user,
    updateUser,
    updateNvidiaConfig,
    updateSubjectAllocations,
    exportDataJSON,
    importDataJSON,
    resetToDefaultData,
    toggleSound,
    switchClassGrade,
    firebaseUser,
    cloudSyncStatus,
    openAuthModal,
    logout,
  } = useApp();

  // Profile & Personalization State
  const [name, setName] = useState(user.name);
  const [classGrade, setClassGrade] = useState(user.classGrade || 'Class 9');
  const [schoolName, setSchoolName] = useState(user.schoolName || 'Gyan Niketan');
  const [examName, setExamName] = useState(user.examName || 'Upcoming Examination 2026');
  const [targetExamDate, setTargetExamDate] = useState(user.targetExamDate || '2026-09-18');
  const [targetScore, setTargetScore] = useState(user.targetScore || '95%+ (Top Rank & Distinction)');
  const [preferredStudySlot, setPreferredStudySlot] = useState(user.preferredStudySlot || 'evening');
  const [aiTutorTone, setAiTutorTone] = useState(user.aiTutorTone || 'encouraging');
  const [pomodoroMinutes, setPomodoroMinutes] = useState(user.pomodoroMinutes || 45);

  // Workload Hours
  const [schoolHours, setSchoolHours] = useState(user.studyPreference?.schoolDaysHours || 3.5);
  const [weekendHours, setWeekendHours] = useState(user.studyPreference?.weekendHours || 6.5);

  // NVIDIA NIM & Dynamo settings
  const [apiKey, setApiKey] = useState(user.nvidiaApiKey || DEFAULT_NVIDIA_API_KEY);
  const [selectedModel, setSelectedModel] = useState(user.nvidiaModel || DEFAULT_NVIDIA_MODEL);
  const [baseUrl, setBaseUrl] = useState(user.nvidiaBaseUrl || DEFAULT_NVIDIA_BASE_URL);
  const [showAdvancedUrl, setShowAdvancedUrl] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Subject allocation sliders
  const [mathsAlloc, setMathsAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-maths'] ?? 45);
  const [sciAlloc, setSciAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-science'] ?? 30);
  const [engAlloc, setEngAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-english'] ?? 15);
  const [othAlloc, setOthAlloc] = useState(user.studyPreference?.subjectAllocation?.['sub-others'] ?? 10);

  const [copySuccess, setCopySuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Sync state whenever user prop updates
  useEffect(() => {
    setName(user.name);
    setClassGrade(user.classGrade || 'Class 9');
    setSchoolName(user.schoolName || 'Gyan Niketan');
    setExamName(user.examName || 'Upcoming Examination 2026');
    setTargetExamDate(user.targetExamDate || '2026-09-18');
    setTargetScore(user.targetScore || '95%+ (Top Rank & Distinction)');
    setPreferredStudySlot(user.preferredStudySlot || 'evening');
    setAiTutorTone(user.aiTutorTone || 'encouraging');
    setPomodoroMinutes(user.pomodoroMinutes || 45);

    setApiKey(user.nvidiaApiKey || DEFAULT_NVIDIA_API_KEY);
    setSelectedModel(user.nvidiaModel || DEFAULT_NVIDIA_MODEL);
    setBaseUrl(user.nvidiaBaseUrl || DEFAULT_NVIDIA_BASE_URL);
    setSchoolHours(user.studyPreference?.schoolDaysHours || 3.5);
    setWeekendHours(user.studyPreference?.weekendHours || 6.5);
    setMathsAlloc(user.studyPreference?.subjectAllocation?.['sub-maths'] ?? 45);
    setSciAlloc(user.studyPreference?.subjectAllocation?.['sub-science'] ?? 30);
    setEngAlloc(user.studyPreference?.subjectAllocation?.['sub-english'] ?? 15);
    setOthAlloc(user.studyPreference?.subjectAllocation?.['sub-others'] ?? 10);
  }, [user, isOpen]);

  // Handle Escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAlloc = mathsAlloc + sciAlloc + engAlloc + othAlloc;

  const handleTestConnection = async () => {
    setIsTestingKey(true);
    setTestResult(null);

    const res = await testNvidiaConnection(apiKey, selectedModel, baseUrl);
    setTestResult(res);
    setIsTestingKey(false);

    if (res.success) {
      updateNvidiaConfig(apiKey, selectedModel, baseUrl);
    }
  };

  const handleSaveProfile = () => {
    if (classGrade !== user.classGrade) {
      switchClassGrade(classGrade, name, examName);
    }

    updateUser({
      name: name.trim() || 'Student',
      classGrade: classGrade.trim(),
      schoolName: schoolName.trim(),
      examName: examName.trim(),
      targetExamDate,
      targetScore,
      preferredStudySlot: preferredStudySlot as any,
      aiTutorTone: aiTutorTone as any,
      pomodoroMinutes: Number(pomodoroMinutes),
      nvidiaApiKey: apiKey.trim(),
      nvidiaModel: selectedModel.trim(),
      nvidiaBaseUrl: baseUrl.trim() || DEFAULT_NVIDIA_BASE_URL,
      studyPreference: {
        schoolDaysHours: Number(schoolHours),
        weekendHours: Number(weekendHours),
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

    onClose();
  };

  const handleExport = () => {
    const json = exportDataJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `apex-study-os-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      const success = importDataJSON(content);
      if (success) {
        setImportStatus('Backup restored successfully!');
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus('Failed to import backup. Please check file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (
      confirm(
        'Are you sure you want to reset all data to the standard CBSE dataset? Any custom items will be overwritten.'
      )
    ) {
      resetToDefaultData();
      onClose();
    }
  };

  return (
    <div
      onClick={e => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
    >
      <div className="bg-navy-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-navy-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base text-white">Personalization & System Settings</h2>
              <p className="text-xs text-slate-400">Configure your profile, habits, NVIDIA NIM AI, and cloud sync</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onClose()}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-750 text-slate-300 hover:text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* SECTION 1: Student & Academic Personalization */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Student Academic Profile</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>Run Setup Wizard</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Student Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class / Grade</label>
                <select
                  value={classGrade}
                  onChange={e => setClassGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                >
                  {CLASS_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">School / Academy</label>
                <div className="relative">
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    placeholder="e.g. Gyan Niketan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Target Examination</label>
                <input
                  type="text"
                  value={examName}
                  onChange={e => setExamName(e.target.value)}
                  placeholder="e.g. Half-Yearly Exam 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">First Exam Date</label>
                <input
                  type="date"
                  value={targetExamDate}
                  onChange={e => setTargetExamDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Goal Score</label>
                <select
                  value={targetScore}
                  onChange={e => setTargetScore(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="95%+ (Top Rank & Distinction)">95%+ Top Rank & Distinction</option>
                  <option value="90%+ (Excellence)">90%+ Excellence</option>
                  <option value="85%+ (First Class)">85%+ First Class</option>
                  <option value="75%+ (Solid Foundation)">75%+ Solid Foundation</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Study Habits & Peak Focus Window */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3.5">
            <span className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Personal Study Habits & Focus Window</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Peak Focus Slot</label>
                <select
                  value={preferredStudySlot}
                  onChange={e => setPreferredStudySlot(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="morning">🌅 Early Morning (05:30 - 08:30)</option>
                  <option value="afternoon">☀️ Afternoon (14:00 - 17:00)</option>
                  <option value="evening">🌙 Evening Focus (17:30 - 21:30)</option>
                  <option value="night_owl">🦉 Night Owl (21:30 - 00:30)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">AI Tutor Tone</label>
                <select
                  value={aiTutorTone}
                  onChange={e => setAiTutorTone(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="encouraging">⚡ Encouraging & Motivational</option>
                  <option value="strict_cbse">🎯 Strict CBSE Marking Rubrics</option>
                  <option value="conceptual_socratic">🧠 Conceptual Socratic Step Guide</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Pomodoro Focus Block</label>
                <select
                  value={pomodoroMinutes}
                  onChange={e => setPomodoroMinutes(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-semibold cursor-pointer"
                >
                  <option value="25">25 Minutes (Standard Pomodoro)</option>
                  <option value="45">45 Minutes (Deep Subject Immersion)</option>
                  <option value="60">60 Minutes (Intensive Practice)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">School Days Study Target</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">{schoolHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="0.5"
                  value={schoolHours}
                  onChange={e => setSchoolHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-slate-300">Weekends / Holidays Target</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">{weekendHours} hrs/day</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  step="0.5"
                  value={weekendHours}
                  onChange={e => setWeekendHours(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Dynamic Subject Priority Allocations */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Percent className="w-4 h-4 text-indigo-400" />
                <span>Subject Prioritization Weights ({classGrade})</span>
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  totalAlloc === 100
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                Total: {totalAlloc}%
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Mathematics</span>
                  <span className="font-bold text-indigo-400 font-mono">{mathsAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={mathsAlloc}
                  onChange={e => setMathsAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Science</span>
                  <span className="font-bold text-cyan-400 font-mono">{sciAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  value={sciAlloc}
                  onChange={e => setSciAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">English Language & Lit</span>
                  <span className="font-bold text-amber-400 font-mono">{engAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={engAlloc}
                  onChange={e => setEngAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-slate-300 font-semibold">Other Subjects (Hindi, SST, AI)</span>
                  <span className="font-bold text-emerald-400 font-mono">{othAlloc}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="30"
                  value={othAlloc}
                  onChange={e => setOthAlloc(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: NVIDIA NIM & Vision AI Engine */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-850 to-slate-900 border border-indigo-500/30 space-y-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>NVIDIA NIM / Dynamo AI Configuration</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                NVIDIA Cloud & Dynamo
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center justify-between">
                <span>NVIDIA API Key</span>
                <span className="text-[10px] text-slate-400 font-normal font-mono">nvapi-...</span>
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="nvapi-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Model Selection for Test, Vision & Tutoring
              </label>
              <div className="relative">
                <Cpu className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <select
                  value={selectedModel}
                  onChange={e => setSelectedModel(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500 font-mono appearance-none cursor-pointer"
                >
                  {NVIDIA_MODELS.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.provider}) — {m.recommendedFor}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowAdvancedUrl(prev => !prev)}
                className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{showAdvancedUrl ? 'Hide Custom Endpoint' : 'Advanced: Custom Endpoint / NVIDIA Dynamo URL'}</span>
              </button>

              {showAdvancedUrl && (
                <div className="mt-2 space-y-1 animate-fade-in">
                  <label className="block text-[10px] text-slate-400">
                    Base URL (Default: <code className="text-slate-300 font-mono">https://integrate.api.nvidia.com/v1</code> or local proxy)
                  </label>
                  <input
                    type="text"
                    value={baseUrl}
                    onChange={e => setBaseUrl(e.target.value)}
                    placeholder="https://integrate.api.nvidia.com/v1"
                    className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <div className="pt-1 flex items-center justify-between">
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTestingKey}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                {isTestingKey ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying with NVIDIA NIM...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Test NVIDIA Connection</span>
                  </>
                )}
              </button>

              <span className="text-[10px] text-slate-400">Powers Vision Problem Solving & CBSE Exams</span>
            </div>

            {testResult && (
              <div
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {testResult.success ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>

          {/* SECTION 5: Firebase Cloud Account & Realtime Sync */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-850 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
                <Cloud className="w-4 h-4 text-cyan-400" />
                <span>Firebase Cloud Account & Sync</span>
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  cloudSyncStatus === 'synced'
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : cloudSyncStatus === 'syncing'
                    ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {firebaseUser ? `Realtime Sync: ${cloudSyncStatus}` : 'Offline / Guest Mode'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 flex-shrink-0">
                  {firebaseUser?.photoURL ? (
                    <img src={firebaseUser.photoURL} alt="Avatar" className="w-full h-full rounded-full" />
                  ) : (
                    (firebaseUser?.displayName || user.name || 'S').charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">
                    {firebaseUser ? firebaseUser.displayName || user.name : 'Guest Student Profile'}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {firebaseUser ? firebaseUser.email : 'Data saved locally on this browser'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {firebaseUser ? (
                  <button
                    type="button"
                    onClick={logout}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-rose-300 hover:text-rose-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Sign Out
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      openAuthModal('signin');
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
                  >
                    Sign In / Create Account
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 6: Sound & Notification Effects */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                {user.soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white">Sound Effects & Focus Bells</div>
                <div className="text-[10px] text-slate-400">Audio feedback on task completion & timers</div>
              </div>
            </div>
            <button
              type="button"
              onClick={toggleSound}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                user.soundEnabled
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {user.soundEnabled ? 'Enabled' : 'Muted'}
            </button>
          </div>

          {/* SECTION 7: Backup & Restore */}
          <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Complete Data Backup & Portability</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleExport}
                className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copySuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400">Downloaded JSON!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 text-indigo-400" />
                    <span>Export Backup (.JSON)</span>
                  </>
                )}
              </button>

              <label className="p-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Import Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <p className="text-xs text-center text-emerald-400 font-semibold pt-1">{importStatus}</p>
            )}
          </div>

          {/* Reset to Default Dataset */}
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-rose-300">Reset to Standard CBSE Baseline</div>
              <div className="text-[10px] text-rose-200/70">Reload the default curriculum dataset</div>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-end gap-2.5 bg-navy-950/60">
          <button
            type="button"
            onClick={() => onClose()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer active:scale-95 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveProfile}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 active:scale-95 transition-all cursor-pointer"
          >
            Save All Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
