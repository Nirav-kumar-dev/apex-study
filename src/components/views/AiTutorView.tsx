import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Bot,
  FileCheck2,
  Send,
  Loader2,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  BookOpen,
  Layers,
  Clock,
  Play,
  RotateCcw,
  Zap,
  Image as ImageIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useApp } from '../../context/AppContext';
import {
  generateNvidiaMockTest,
  evaluateStudentExamWithNvidia,
  callNvidiaChat,
  analyzeImageWithNvidiaVision,
  DEFAULT_NVIDIA_MODEL,
} from '../../lib/nvidiaApi';
import { InteractiveMockExam, InteractiveQuizQuestion } from '../../types';

export const AiTutorView: React.FC = () => {
  const {
    user,
    subjects,
    chapters,
    interactiveMocks,
    addInteractiveMock,
    addMockTest,
    addErrorLog,
    currentDate,
    setActiveView,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'generator' | 'interactive_test' | 'problem_solver'>('generator');

  // Generator State
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(subjects[0]?.id || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'standard' | 'challenging'>('standard');
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // Active Interactive Exam State
  const [currentExam, setCurrentExam] = useState<InteractiveMockExam | null>(
    interactiveMocks[0] || null
  );
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any>(null);

  // Problem Solver State with Image Picker
  const [problemQuery, setProblemQuery] = useState('');
  const [problemImage, setProblemImage] = useState<string | null>(null);
  const [problemResponse, setProblemResponse] = useState<string | null>(null);
  const [isSolving, setIsSolving] = useState(false);
  const problemImageInputRef = useRef<HTMLInputElement>(null);

  const handleProblemImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      setProblemImage(evt.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const selectedSubject = subjects.find(s => s.id === selectedSubjectId);
  const subjectChapters = chapters.filter(c => c.subjectId === selectedSubjectId);

  // Generate Mock Exam using NVIDIA NIM
  const handleGenerateExam = async () => {
    if (!selectedSubject) return;
    setIsGenerating(true);
    setGenError(null);

    try {
      const chapterNames = subjectChapters.map(c => c.name).slice(0, 4);
      const generated = await generateNvidiaMockTest(
        selectedSubject.name,
        chapterNames,
        selectedDifficulty,
        user.nvidiaApiKey,
        user.nvidiaModel,
        user.nvidiaBaseUrl
      );

      const newExam: InteractiveMockExam = {
        id: `imock-${Date.now()}`,
        subjectId: selectedSubject.id,
        title: generated.title || `${selectedSubject.name} AI Generated Mock Exam`,
        durationMinutes: generated.durationMinutes || 45,
        totalMarks: generated.totalMarks || 20,
        instructions: generated.instructions || ['All questions are compulsory.'],
        questions: generated.questions || [],
        createdDate: currentDate,
        status: 'draft',
      };

      addInteractiveMock(newExam);
      setCurrentExam(newExam);
      setUserAnswers({});
      setEvaluationResult(null);
      setActiveTab('interactive_test');

      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch {}
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Failed to generate mock exam. Please check NVIDIA API key.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Submit & Grade Interactive Exam with NVIDIA AI
  const handleSubmitAndEvaluate = async () => {
    if (!currentExam || isEvaluating) return;
    setIsEvaluating(true);

    try {
      const subName = subjects.find(s => s.id === currentExam.subjectId)?.name || 'Subject';
      const result = await evaluateStudentExamWithNvidia(
        subName,
        currentExam.questions,
        userAnswers,
        user.nvidiaApiKey,
        user.nvidiaModel,
        user.nvidiaBaseUrl
      );

      setEvaluationResult(result);

      // Automatically add to MockTests History
      addMockTest({
        subjectId: currentExam.subjectId,
        title: `${currentExam.title} (AI Evaluated)`,
        date: currentDate,
        durationMinutes: currentExam.durationMinutes,
        score: result.totalScore,
        totalMarks: result.maxScore,
        weakTopics: result.evaluatedQuestions
          .filter(q => q.marksObtained < q.maxMarks)
          .map(q => {
            const origQ = currentExam.questions.find(orig => orig.id === q.questionId);
            return origQ?.topic || 'General';
          }),
        mistakesCount: result.evaluatedQuestions.filter(q => q.marksObtained < q.maxMarks).length,
        notes: result.feedbackSummary,
        keyTakeaways: 'Review step-by-step corrections generated by NVIDIA NIM evaluation.',
        isAiGenerated: true,
      });

      try {
        confetti({ particleCount: 100, spread: 80 });
      } catch {}
    } catch (err) {
      alert(`Evaluation failed: ${err instanceof Error ? err.message : 'Please check NVIDIA API settings'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Step-by-step Problem Solver (Text & Vision AI)
  const handleSolveProblem = async () => {
    if ((!problemQuery.trim() && !problemImage) || isSolving) return;
    setIsSolving(true);
    setProblemResponse(null);

    try {
      if (problemImage) {
        // Vision AI Image Solver
        const prompt = problemQuery.trim()
          ? `Question details: ${problemQuery}\n\nPlease solve the problem/diagram shown in the attached image step-by-step for CBSE curriculum.`
          : 'Please analyze this question/diagram image and provide the complete step-by-step mathematical derivation, theorems applied, and final answer with CBSE marking rubric breakdown.';

        const response = await analyzeImageWithNvidiaVision(problemImage, prompt, {
          apiKey: user.nvidiaApiKey,
          model: user.nvidiaModel,
          baseUrl: user.nvidiaBaseUrl,
        });
        setProblemResponse(response);
      } else {
        // Text Problem Solver
        const response = await callNvidiaChat(
          [
            {
              role: 'system',
              content: `You are an expert CBSE ${user.classGrade || 'Class 9'} Math & Science problem solver and AI tutor.
DO NOT output any thinking processes, outlines, or meta commentary like "Here's a thinking process".
Jump DIRECTLY into the final solution:
- Explain the step-by-step derivation, formula used, algebraic reasoning, and final answer with proper SI units.
- Format equations cleanly using markdown math ($...$ and $$...$$).
- Note common mistakes students make on this type of question.`,
            },
            { role: 'user', content: problemQuery },
          ],
          {
            apiKey: user.nvidiaApiKey,
            model: user.nvidiaModel || DEFAULT_NVIDIA_MODEL,
            baseUrl: user.nvidiaBaseUrl,
            temperature: 0.2,
            maxTokens: 1500,
          }
        );
        setProblemResponse(response);
      }
    } catch (err) {
      setProblemResponse(`⚠️ Error: ${err instanceof Error ? err.message : 'Failed to reach NVIDIA API.'}`);
    } finally {
      setIsSolving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              NVIDIA AI Exam Engine & Problem Solver
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1 font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>{user.nvidiaModel || DEFAULT_NVIDIA_MODEL}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Generate customized Class 9 mock papers, take interactive tests with automated AI grading, and solve complex theorems
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-slate-850 p-1 rounded-2xl border border-slate-800 self-start sm:self-center">
          <button
            onClick={() => setActiveTab('generator')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'generator'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Mock Generator</span>
          </button>

          <button
            onClick={() => setActiveTab('interactive_test')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'interactive_test'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-3.5 h-3.5" />
            <span>Take Interactive Test</span>
          </button>

          <button
            onClick={() => setActiveTab('problem_solver')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'problem_solver'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>Step Problem Solver</span>
          </button>
        </div>
      </div>

      {/* 1. AI MOCK EXAM GENERATOR TAB */}
      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-slate-850 border border-slate-800 shadow-xl space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>NVIDIA NIM Exam Synthesizer</span>
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Generate Targeted Class 9 Examination Paper
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Creates Section A (MCQs), Section B (2-marks), Section C (3-marks), and Section D (5-mark proofs/numericals) matching official CBSE blueprints.
              </p>
            </div>

            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subject</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(s.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedSubjectId === s.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{s.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{s.code}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Difficulty Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'easy', label: 'Easy (Confidence Builder)', desc: 'Direct NCERT questions' },
                  { id: 'standard', label: 'Standard (CBSE Half-Yearly)', desc: 'Balanced exam standard' },
                  { id: 'challenging', label: 'Challenging (Exemplar & HOTS)', desc: 'High-order thinking' },
                ].map(diff => (
                  <button
                    key={diff.id}
                    type="button"
                    onClick={() => setSelectedDifficulty(diff.id as any)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      selectedDifficulty === diff.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{diff.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{diff.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Action */}
            <div className="pt-2">
              <button
                onClick={handleGenerateExam}
                disabled={isGenerating}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>NVIDIA AI is Generating Exam Blueprint...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate & Launch Interactive Exam</span>
                  </>
                )}
              </button>

              {genError && (
                <p className="text-xs text-rose-400 font-semibold mt-2 text-center">{genError}</p>
              )}
            </div>
          </div>

          {/* Right Column: Model Info & Saved Mock Exams */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 rounded-3xl bg-slate-850 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-white">NVIDIA NIM Status</span>
                <button
                  onClick={() => setActiveView('settings')}
                  className="text-[10px] font-bold text-indigo-400 hover:underline"
                >
                  Configure Key
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span>Selected Model:</span>
                  <span className="font-bold text-white font-mono">{user.nvidiaModel || DEFAULT_NVIDIA_MODEL}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span>API Status:</span>
                  <span className={`font-bold ${user.nvidiaApiKey ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {user.nvidiaApiKey ? '✓ Key Configured' : '⚠️ No Key (Using Demo Fallback)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Previously Generated Interactive Mocks */}
            <div className="p-6 rounded-3xl bg-slate-850 border border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-white block">
                Saved Interactive Mock Tests ({interactiveMocks.length})
              </span>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {interactiveMocks.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setCurrentExam(m);
                      setActiveTab('interactive_test');
                    }}
                    className="w-full p-3 rounded-2xl bg-slate-900 hover:bg-indigo-600/20 border border-slate-800 text-left transition-all flex items-center justify-between group"
                  >
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {m.title}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {m.questions.length} Questions • {m.totalMarks} Marks • {m.durationMinutes} min
                      </div>
                    </div>
                    <Play className="w-3.5 h-3.5 text-indigo-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. TAKE INTERACTIVE TEST TAB */}
      {activeTab === 'interactive_test' && currentExam && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-850 border border-slate-800 shadow-2xl space-y-6">
          {/* Exam Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
                <FileCheck2 className="w-4 h-4" />
                <span>Live Interactive Examination</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">{currentExam.title}</h2>
              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                <span>Total Marks: <strong className="text-white">{currentExam.totalMarks}</strong></span>
                <span>•</span>
                <span>Time Allotted: <strong className="text-white">{currentExam.durationMinutes} min</strong></span>
              </div>
            </div>

            <button
              onClick={handleSubmitAndEvaluate}
              disabled={isEvaluating}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 active:scale-95 transition-all self-start sm:self-center"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>NVIDIA AI is Grading Answers...</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Submit & Get AI Grade</span>
                </>
              )}
            </button>
          </div>

          {/* AI Evaluation Summary Callout */}
          {evaluationResult && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-navy-900 border border-emerald-500/40 space-y-3 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">
                    AI Evaluation Scorecard
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-emerald-400 font-mono">
                    {evaluationResult.totalScore} / {evaluationResult.maxScore}
                  </span>
                  <span className="text-xs font-bold text-slate-300 ml-1">
                    ({evaluationResult.percentage}%)
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
                {evaluationResult.feedbackSummary}
              </p>
            </div>
          )}

          {/* Questions List */}
          <div className="space-y-6">
            {currentExam.questions.map((q, idx) => {
              const evalItem = evaluationResult?.evaluatedQuestions?.find(
                (e: any) => e.questionId === q.id
              );

              return (
                <div
                  key={q.id}
                  className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center justify-center font-bold text-xs">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase">{q.topic}</span>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-mono">
                      {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {q.question}
                  </h3>

                  {/* Multiple Choice Options */}
                  {q.options && q.options.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelected = userAnswers[q.id] === opt;
                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setUserAnswers(prev => ({ ...prev, [q.id]: opt }))}
                            className={`p-3 rounded-2xl border text-left text-xs font-semibold transition-all ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                                : 'bg-slate-850 border-slate-800 text-slate-300 hover:border-slate-700'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Text / Numerical / Proof Answer Area */
                    <div>
                      <textarea
                        rows={3}
                        placeholder="Write your step-by-step solution, formulas, and calculations here..."
                        value={userAnswers[q.id] || ''}
                        onChange={e => setUserAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        className="w-full p-3 rounded-2xl bg-slate-850 border border-slate-700 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {/* Question Evaluation Result from AI */}
                  {evalItem && (
                    <div className="p-3.5 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          {evalItem.marksObtained === evalItem.maxMarks ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-400" />
                          )}
                          <span>AI Feedback & Score</span>
                        </span>
                        <span className="font-extrabold text-emerald-400 font-mono">
                          {evalItem.marksObtained} / {evalItem.maxMarks} Marks
                        </span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">{evalItem.feedback}</p>
                      {evalItem.improvementTip && (
                        <p className="text-amber-300 font-semibold text-[11px]">
                          💡 Tip: {evalItem.improvementTip}
                        </p>
                      )}
                      <details className="pt-1 text-[11px] text-slate-400 cursor-pointer">
                        <summary className="font-semibold text-indigo-400 hover:underline">
                          View Model Solution
                        </summary>
                        <p className="mt-1 text-slate-200 font-mono bg-slate-900 p-2 rounded-xl border border-slate-800 whitespace-pre-wrap">
                          {q.modelAnswer}
                        </p>
                      </details>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. STEP-BY-STEP PROBLEM SOLVER TAB WITH VISION AI & IMAGE PICKER */}
      {activeTab === 'problem_solver' && (
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-850 border border-slate-800 shadow-2xl space-y-5">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Bot className="w-4 h-4" />
              <span>NVIDIA Deep Reasoning & Vision Solver</span>
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              Ask Any Complex Problem, Theorem Proof, or Upload Diagram Photo
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Llama 3.2 Vision & Nemotron breaks down geometry figures, textbook photos, and numerical equations step-by-step.
            </p>
          </div>

          <div className="space-y-3">
            {/* Attached Photo Preview */}
            {problemImage && (
              <div className="relative inline-block p-2 rounded-2xl bg-slate-900 border border-slate-700">
                <img
                  src={problemImage}
                  alt="Attached problem"
                  className="max-h-48 rounded-xl object-contain shadow"
                />
                <button
                  type="button"
                  onClick={() => setProblemImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center text-xs font-bold shadow-lg cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={4}
                placeholder="Type your question or attach a photo of your book/homework (e.g. A body of mass 2kg is dropped from a height of 20m. Find its velocity before hitting the ground.)"
                value={problemQuery}
                onChange={e => setProblemQuery(e.target.value)}
                className="w-full p-4 rounded-2xl bg-slate-900 border border-slate-700 text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />

              <input
                type="file"
                ref={problemImageInputRef}
                accept="image/*"
                onChange={handleProblemImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => problemImageInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 text-xs font-bold flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-indigo-400" />
                  <span>{problemImage ? 'Change Photo' : 'Upload Question Photo'}</span>
                </button>

                <button
                  onClick={() => setProblemQuery('Prove that in a right triangle, the square of hypotenuse equals the sum of squares of other two sides.')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-[11px] font-semibold border border-slate-800 whitespace-nowrap cursor-pointer"
                >
                  📐 Pythagoras Theorem
                </button>
                <button
                  onClick={() => setProblemQuery('Factorize: x^3 - 23x^2 + 142x - 120 using factor theorem.')}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-[11px] font-semibold border border-slate-800 whitespace-nowrap cursor-pointer"
                >
                  🔢 Cubic Polynomial
                </button>
              </div>

              <button
                onClick={handleSolveProblem}
                disabled={isSolving || (!problemQuery.trim() && !problemImage)}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:brightness-110 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 active:scale-95 transition-all cursor-pointer self-end sm:self-auto"
              >
                {isSolving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>NVIDIA Solving...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Solve Step-by-Step</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Solution Display */}
          {problemResponse && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-indigo-500/30 space-y-3 animate-fade-in shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step-by-Step Solution Breakdown</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">NVIDIA NIM Vision</span>
              </div>

              <div className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
                {problemResponse}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
