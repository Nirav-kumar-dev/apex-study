import React, { useState, useRef } from 'react';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  GraduationCap,
  Upload,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Bot,
  Zap,
  Check,
  User,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CLASS_OPTIONS } from '../../data/classCurriculums';
import { testNvidiaConnection, DEFAULT_NVIDIA_API_KEY, DEFAULT_NVIDIA_MODEL } from '../../lib/nvidiaApi';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({ isOpen, onClose }) => {
  const {
    user,
    updateUser,
    updateNvidiaConfig,
    generateAutoPlan,
    setActiveView,
    importDataJSON,
    switchClassGrade,
    openAuthModal,
    setIsAiConfiguring,
  } = useApp();

  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states (clean defaults for any user)
  const [studentName, setStudentName] = useState(
    user.name && user.name !== 'Student' ? user.name : ''
  );
  const [selectedClass, setSelectedClass] = useState(user.classGrade || 'Class 9');
  const [examName, setExamName] = useState(
    user.examName && user.examName !== 'Upcoming Examination 2026'
      ? user.examName
      : 'Half-Yearly Examination 2026'
  );
  const [targetExamDate, setTargetExamDate] = useState(user.targetExamDate || '2026-09-18');

  const [schoolHours, setSchoolHours] = useState(user.studyPreference?.schoolDaysHours || 3.5);
  const [weekendHours, setWeekendHours] = useState(user.studyPreference?.weekendHours || 6.5);

  const [mathsAlloc, setMathsAlloc] = useState(45);
  const [sciAlloc, setSciAlloc] = useState(30);
  const [engAlloc, setEngAlloc] = useState(15);
  const [othAlloc, setOthAlloc] = useState(10);

  // NVIDIA AI test in onboarding
  const [apiKey, setApiKey] = useState(user.nvidiaApiKey || DEFAULT_NVIDIA_API_KEY);
  const [selectedModel, setSelectedModel] = useState(user.nvidiaModel || DEFAULT_NVIDIA_MODEL);
  const [isTestingAi, setIsTestingAi] = useState(false);
  const [aiTestResult, setAiTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // JSON Import status
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<string | null>(null);
  const [nameError, setNameError] = useState(false);

  if (!isOpen) return null;

  const totalSteps = 6;

  // Handle JSON Import
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const success = importDataJSON(content);
        if (success) {
          setImportSuccess('Backup restored successfully! Syncing your workspace...');
          setImportError(null);
          setTimeout(() => {
            onClose();
            setActiveView('dashboard');
          }, 1200);
        } else {
          setImportError('Invalid backup file format. Please choose a valid JSON file.');
          setImportSuccess(null);
        }
      } catch {
        setImportError('Failed to read file. Please ensure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
  };

  const handleTestAi = async () => {
    setIsTestingAi(true);
    setAiTestResult(null);
    try {
      const res = await testNvidiaConnection(apiKey, selectedModel);
      setAiTestResult({ success: res.success, message: res.message });
    } catch (err: any) {
      setAiTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTestingAi(false);
    }
  };

  const handleNextStep = () => {
    if (step === 2 && !studentName.trim()) {
      setNameError(true);
      return;
    }
    setNameError(false);
    setStep(prev => prev + 1);
  };

  const handleFinish = () => {
    const finalName = studentName.trim() || 'Student';
    const finalExam = examName.trim() || 'Examination 2026';

    // 1. Switch curriculum & update profile atomically
    switchClassGrade(selectedClass, finalName, finalExam);

    // 2. Update preferences
    updateUser({
      name: finalName,
      classGrade: selectedClass,
      examName: finalExam,
      targetExamDate,
      completedOnboarding: true,
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

    // 3. Update NVIDIA AI
    updateNvidiaConfig(apiKey, selectedModel);

    // 4. Generate fresh initial plan, trigger AI configuration loader and open dashboard
    generateAutoPlan();
    setIsAiConfiguring(true);
    setActiveView('dashboard');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-lg animate-fade-in">
      <div className="bg-navy-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
        {/* Step Progress Header */}
        <div className="p-5 border-b border-slate-800 bg-navy-950/70">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
            <span className="text-indigo-400 font-bold uppercase tracking-wider font-mono">
              Slide {step} of {totalSteps}
            </span>
            <span>
              {step === 1 && 'Welcome & Setup Mode'}
              {step === 2 && 'Personal Profile'}
              {step === 3 && 'Class Grade & Target Exam'}
              {step === 4 && 'Daily Study Availability'}
              {step === 5 && 'Subject Focus & Weights'}
              {step === 6 && 'NVIDIA AI Engine & Launch'}
            </span>
          </div>

          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 h-full rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Body Content */}
        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* SLIDE 1: Welcome & Setup Choice */}
          {step === 1 && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  Welcome to Apex Study OS
                </h3>
                <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                  AI-Powered Revision & Exam Intelligence OS for CBSE Classes 7th, 8th, 9th & 10th.
                </p>
              </div>

              {/* Import Alerts */}
              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {importSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{importSuccess}</span>
                </div>
              )}

              {/* Choice Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                {/* Option A: Guided Setup */}
                <div
                  onClick={() => setStep(2)}
                  className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/70 to-slate-850 border border-indigo-500/50 hover:border-indigo-400 cursor-pointer group transition-all text-left flex flex-col justify-between shadow-lg shadow-indigo-500/10 hover:scale-[1.01]"
                >
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform shadow">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Guided Setup Wizard
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Configure your class (7th–10th), personal syllabus, exams, study hours & AI engine step-by-step.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs font-bold text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                    <span>Start Step-by-Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Option B: Import Existing JSON Data */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="p-5 rounded-2xl bg-slate-850 border border-slate-700/80 hover:border-indigo-500/60 hover:bg-slate-800/90 cursor-pointer group transition-all text-left flex flex-col justify-between hover:scale-[1.01]"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                      <FileJson className="w-5 h-5" />
                    </div>
                    <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                      Import Backup (.json)
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Upload previous <code className="text-indigo-300 bg-slate-900 px-1 py-0.5 rounded text-[11px]">.json</code> backup to restore all subjects, books & history.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Select Backup File</span>
                  </div>
                </div>
              </div>

              {/* Cloud Account Quick Login Action */}
              <div className="p-3 rounded-2xl bg-slate-850 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                    <LogIn className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-slate-300">Already have an account or want cloud sync?</span>
                </div>
                <button
                  type="button"
                  onClick={() => openAuthModal('signin')}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
                >
                  Sign In / Create Account
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 2: Personal Profile */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">What is your name?</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your name will personalize your study timetable, error logs, and AI tutor chats.
                </p>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-850 border border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-500 text-white font-extrabold text-xl flex items-center justify-center shadow-lg">
                  {studentName.trim().charAt(0).toUpperCase() || 'S'}
                </div>
                <div className="flex-1 space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={studentName}
                    onChange={e => {
                      setStudentName(e.target.value);
                      if (e.target.value.trim()) setNameError(false);
                    }}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border text-white text-xs font-bold focus:outline-none ${
                      nameError ? 'border-rose-500 ring-1 ring-rose-500' : 'border-slate-700 focus:border-indigo-500'
                    }`}
                  />
                  {nameError && (
                    <p className="text-[10px] text-rose-400 mt-1">Please enter your name to proceed.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 3: Class Grade & Target Exam */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">Select Your Class & Upcoming Exam</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select your class grade to automatically generate tailored NCERT books and CBSE chapter blueprints.
                </p>
              </div>

              {/* Class Selector Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {CLASS_OPTIONS.map(opt => {
                  const isSelected = selectedClass === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setSelectedClass(opt.id)}
                      className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600/25 border-indigo-500 text-white shadow-md shadow-indigo-600/25 ring-1 ring-indigo-500/50'
                          : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                          {opt.badge}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-indigo-400" />}
                      </div>
                      <div className="text-sm font-extrabold text-white mt-2">{opt.id}</div>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Upcoming Exam Name</label>
                  <input
                    type="text"
                    value={examName}
                    onChange={e => setExamName(e.target.value)}
                    placeholder="e.g. Half-Yearly Exam 2026"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">First Exam Date</label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="date"
                      value={targetExamDate}
                      onChange={e => setTargetExamDate(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Gyan Niketan Quick Preset */}
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-indigo-300">🏫 Gyan Niketan 2026 Timetable</div>
                  <div className="text-[10px] text-slate-400">Apply official Gyan Niketan session 2026-27 Half-Yearly dates</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setExamName('Gyan Niketan Half-Yearly Exam 2026');
                    if (selectedClass === 'Class 7') setTargetExamDate('2026-09-17');
                    else setTargetExamDate('2026-09-18');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold shadow-md transition-colors cursor-pointer"
                >
                  Use This Schedule
                </button>
              </div>
            </div>
          )}

          {/* SLIDE 4: Daily Study Availability */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">Daily Study Availability</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  How many hours can you dedicate to focused self-study without burnout?
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-slate-300 font-semibold">School Days Study Target</span>
                    <span className="font-bold text-indigo-400 font-mono">{schoolHours} Hours / Day</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="0.5"
                    value={schoolHours}
                    onChange={e => setSchoolHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5 text-xs">
                    <span className="text-slate-300 font-semibold">Weekends & Holidays Target</span>
                    <span className="font-bold text-indigo-400 font-mono">{weekendHours} Hours / Day</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="12"
                    step="0.5"
                    value={weekendHours}
                    onChange={e => setWeekendHours(Number(e.target.value))}
                    className="w-full h-2 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SLIDE 5: Subject Focus & Weights */}
          {step === 5 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">Subject Time Allocation</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Allocate percentage of daily study blocks to your core and language subjects.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Mathematics ({selectedClass})</span>
                    <span className="text-indigo-400 font-bold font-mono">{mathsAlloc}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="70"
                    value={mathsAlloc}
                    onChange={e => setMathsAlloc(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Science ({selectedClass})</span>
                    <span className="text-cyan-400 font-bold font-mono">{sciAlloc}%</span>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="60"
                    value={sciAlloc}
                    onChange={e => setSciAlloc(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">English Language & Literature</span>
                    <span className="text-amber-400 font-bold font-mono">{engAlloc}%</span>
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-300">Social Science & Others</span>
                    <span className="text-emerald-400 font-bold font-mono">{othAlloc}%</span>
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
          )}

          {/* SLIDE 6: NVIDIA AI Engine & Ready */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-base text-white">NVIDIA AI Engine Configuration</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Your AI Textbook Companion and CBSE Exam Generator are ready with verified endpoints.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-850 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-bold text-white">Selected AI Model:</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/15 px-2.5 py-0.5 rounded-lg border border-indigo-500/30">
                    {selectedModel}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300">NVIDIA API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={e => setApiKey(e.target.value)}
                    placeholder="nvapi-..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleTestAi}
                  disabled={isTestingAi}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{isTestingAi ? 'Testing Connection...' : 'Test AI Connection'}</span>
                </button>

                {aiTestResult && (
                  <div
                    className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                      aiTestResult.success
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300'
                        : 'bg-rose-500/15 border border-rose-500/30 text-rose-300'
                    }`}
                  >
                    {aiTestResult.success ? (
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
                    )}
                    <span>{aiTestResult.message}</span>
                  </div>
                )}
              </div>

              {/* Ready Summary */}
              <div className="p-3.5 rounded-2xl bg-indigo-600/15 border border-indigo-500/30 text-xs space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>Workspace Ready for {studentName.trim() || 'Student'} ({selectedClass})</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Target Exam: <strong className="text-white">{examName}</strong> on <strong className="text-white">{targetExamDate}</strong>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="p-5 border-t border-slate-800 flex items-center justify-between bg-navy-950/70">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(prev => prev - 1)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNextStep}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 text-white text-xs font-extrabold shadow-xl shadow-indigo-500/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Study OS</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
