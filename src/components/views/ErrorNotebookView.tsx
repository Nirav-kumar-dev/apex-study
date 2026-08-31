import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Trash2,
  Flame,
  Sparkles,
  Bot,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeErrorPatterns, CATEGORY_LABELS } from '../../lib/errorIntelligence';
import { ErrorCategory } from '../../types';
import { callNvidiaChat, DEFAULT_NVIDIA_MODEL } from '../../lib/nvidiaApi';

interface ErrorNotebookViewProps {
  onOpenAddError: () => void;
}

export const ErrorNotebookView: React.FC<ErrorNotebookViewProps> = ({ onOpenAddError }) => {
  const { errorLogs, subjects, chapters, incrementErrorOccurrence, deleteErrorLog, user } = useApp();

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  // AI explanation state per error item
  const [explainingErrorId, setExplainingErrorId] = useState<string | null>(null);
  const [aiExplanations, setAiExplanations] = useState<Record<string, string>>({});

  const { totalOccurrences, topErrorCategory, categoryBreakdown } =
    analyzeErrorPatterns(errorLogs);

  const filteredErrors = errorLogs.filter(e => {
    if (selectedCategoryFilter !== 'all' && e.category !== selectedCategoryFilter) return false;
    if (selectedSubjectFilter !== 'all' && e.subjectId !== selectedSubjectFilter) return false;
    return true;
  });

  const handleAskAiForError = async (errId: string, mistake: string, corrected: string, subName?: string) => {
    setExplainingErrorId(errId);
    try {
      const response = await callNvidiaChat(
        [
          {
            role: 'system',
            content: `You are an expert CBSE Class 9 teacher and exam coach.
Analyze the following student mistake and provide:
1. Exact Root Cause: Why students commonly get confused here.
2. The Golden Rule / Step to never make this mistake again.
3. A quick 1-question mini practice test with answer to verify understanding.`,
          },
          {
            role: 'user',
            content: `Subject: ${subName || 'General'}\nMistake: ${mistake}\nCorrect Rule: ${corrected}`,
          },
        ],
        {
          apiKey: user.nvidiaApiKey,
          model: user.nvidiaModel || DEFAULT_NVIDIA_MODEL,
          baseUrl: user.nvidiaBaseUrl,
          temperature: 0.2,
          maxTokens: 600,
        }
      );

      setAiExplanations(prev => ({ ...prev, [errId]: response }));
    } catch (err) {
      setAiExplanations(prev => ({
        ...prev,
        [errId]: `⚠️ AI Explanation Failed: ${err instanceof Error ? err.message : 'Please check NVIDIA API Key in Settings.'}`,
      }));
    } finally {
      setExplainingErrorId(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Error Notebook & Diagnostic Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Turn exam mistakes into guaranteed strengths with pattern tracking and NVIDIA AI remediation
          </p>
        </div>

        <button
          onClick={onOpenAddError}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 active:scale-95 transition-all self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Log Mistake</span>
        </button>
      </div>

      {/* Hero Diagnostic Card: "YOUR MOST COMMON MISTAKE" */}
      {topErrorCategory && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-rose-950/40 via-slate-900 to-navy-900 border border-rose-500/30 shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-rose-400">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Diagnostic Recommendation</span>
            </div>

            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 self-start sm:self-center">
              {topErrorCategory.count} Recorded Occurrences ({topErrorCategory.percentage}% of all errors)
            </span>
          </div>

          <div>
            <span className="text-xs text-slate-400 font-medium">YOUR MOST COMMON MISTAKE</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-0.5">
              {topErrorCategory.label}
            </h2>
          </div>

          <div className="p-4 rounded-2xl bg-rose-900/20 border border-rose-500/30 space-y-2">
            <div className="text-xs font-bold text-rose-200">
              <span className="text-rose-400 uppercase font-extrabold mr-1">Action Recommendation:</span>
              {topErrorCategory.recommendation}
            </div>
            <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
              {topErrorCategory.subAdvice}
            </p>
          </div>
        </div>
      )}

      {/* Category Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {(Object.keys(CATEGORY_LABELS) as ErrorCategory[]).map(cat => {
          const meta = CATEGORY_LABELS[cat];
          const stat = categoryBreakdown.find(c => c.category === cat);
          const count = stat ? stat.count : 0;
          const isSelected = selectedCategoryFilter === cat;

          return (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategoryFilter(prev => (prev === cat ? 'all' : cat))
              }
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-rose-950/50 border-rose-500 shadow-md ring-2 ring-rose-500/40 text-white'
                  : 'bg-slate-850/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold truncate">{meta.label}</span>
                <span className="text-sm font-extrabold font-mono text-white">{count}</span>
              </div>
              <div className="w-full bg-slate-900 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${totalOccurrences > 0 ? (count / totalOccurrences) * 100 : 0}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter & Mistakes List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-extrabold text-white uppercase tracking-wider">
              Recorded Error Entries
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              {filteredErrors.length}
            </span>
          </div>

          {/* Subject selector */}
          <div className="flex items-center gap-1.5">
            <select
              value={selectedSubjectFilter}
              onChange={e => setSelectedSubjectFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-850 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Subjects</option>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* List of Error Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredErrors.map(err => {
            const subject = subjects.find(s => s.id === err.subjectId);
            const chapter = chapters.find(c => c.id === err.chapterId);
            const categoryMeta = CATEGORY_LABELS[err.category];
            const aiText = aiExplanations[err.id];

            return (
              <div
                key={err.id}
                className="p-5 rounded-3xl bg-slate-850 border border-slate-800 hover:border-slate-700 shadow-md flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-[11px] font-extrabold uppercase tracking-wider"
                        style={{ color: subject?.color || '#6366f1' }}
                      >
                        {subject?.name}
                      </span>
                      {chapter && (
                        <span className="text-[11px] text-slate-400">• {chapter.name}</span>
                      )}
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {categoryMeta?.label || err.category}
                    </span>
                  </div>

                  {/* Mistake text */}
                  <div className="p-3 rounded-2xl bg-rose-950/30 border border-rose-500/25 mb-2">
                    <span className="text-[10px] uppercase font-bold text-rose-400 block mb-1">
                      What went wrong:
                    </span>
                    <p className="text-xs font-mono text-rose-100/90 leading-relaxed font-semibold">
                      {err.mistake}
                    </p>
                  </div>

                  {/* Correct understanding */}
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/25">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 block mb-1">
                      Correct Rule / Key Takeaway:
                    </span>
                    <p className="text-xs text-emerald-100/90 leading-relaxed font-sans">
                      {err.correctedUnderstanding}
                    </p>
                  </div>

                  {/* AI Explanation Accordion */}
                  {aiText && (
                    <div className="mt-3 p-3.5 rounded-2xl bg-slate-900 border border-indigo-500/30 text-xs text-slate-200 leading-relaxed font-sans space-y-1.5 animate-fade-in">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-[11px] uppercase">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>NVIDIA AI Conceptual Remediation</span>
                      </div>
                      <div className="whitespace-pre-wrap">{aiText}</div>
                    </div>
                  )}
                </div>

                {/* Footer metadata & occurrence increment */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <div className="text-slate-400 text-[11px]">
                    <span>Source: {err.source}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAskAiForError(err.id, err.mistake, err.correctedUnderstanding, subject?.name)}
                      disabled={explainingErrorId === err.id}
                      className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold flex items-center gap-1 transition-colors"
                      title="Generate AI breakdown"
                    >
                      {explainingErrorId === err.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Bot className="w-3 h-3" />
                      )}
                      <span>Ask AI to Explain</span>
                    </button>

                    <button
                      onClick={() => incrementErrorOccurrence(err.id)}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-300 text-[11px] font-bold border border-slate-700 flex items-center gap-1 transition-colors"
                      title="Increment repeated occurrence"
                    >
                      <Flame className="w-3 h-3 text-rose-400" />
                      <span>{err.occurrenceCount}x</span>
                    </button>

                    <button
                      onClick={() => deleteErrorLog(err.id)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
