import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Chapter, Difficulty, PriorityLevel, Subject, WeaknessLevel } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getDaysLeft(targetDateStr: string, currentDateStr?: string): number {
  if (!targetDateStr) return 0;

  // Extract Year, Month, Day cleanly from YYYY-MM-DD
  const targetDateOnly = targetDateStr.split('T')[0].trim();
  const tParts = targetDateOnly.split('-').map(Number);
  if (tParts.length !== 3 || isNaN(tParts[0]) || isNaN(tParts[1]) || isNaN(tParts[2])) {
    return 0;
  }
  const [tYear, tMonth, tDay] = tParts;
  const targetUtc = Date.UTC(tYear, tMonth - 1, tDay);

  let cYear: number, cMonth: number, cDay: number;
  if (currentDateStr && currentDateStr.trim()) {
    const curDateOnly = currentDateStr.split('T')[0].trim();
    const cParts = curDateOnly.split('-').map(Number);
    if (cParts.length === 3 && !isNaN(cParts[0]) && !isNaN(cParts[1]) && !isNaN(cParts[2])) {
      [cYear, cMonth, cDay] = cParts;
    } else {
      const now = new Date();
      cYear = now.getFullYear();
      cMonth = now.getMonth() + 1;
      cDay = now.getDate();
    }
  } else {
    const now = new Date();
    cYear = now.getFullYear();
    cMonth = now.getMonth() + 1;
    cDay = now.getDate();
  }

  const currentUtc = Date.UTC(cYear, cMonth - 1, cDay);

  // Exact difference in 24-hour calendar days
  const diffTime = targetUtc - currentUtc;
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

export function formatDate(dateStr: string, options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', options || {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatTime12H(time24: string): string {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  if (isNaN(hours)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good Morning, ${name}`;
  if (hour < 17) return `Good Afternoon, ${name}`;
  return `Good Evening, ${name}`;
}

export function getConfidenceBadge(level: number): { label: string; color: string; bg: string; border: string } {
  switch (level) {
    case 1:
      return { label: 'Completely Confused', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30' };
    case 2:
      return { label: 'Need Revision', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
    case 3:
      return { label: 'Understandable', color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' };
    case 4:
      return { label: 'Confident', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
    case 5:
      return { label: 'Can Teach Others', color: 'text-cyan-400', bg: 'bg-cyan-500/10', border: 'border-cyan-500/30' };
    default:
      return { label: 'Unrated', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/30' };
  }
}

export function getDifficultyBadge(diff: Difficulty): { label: string; color: string; bg: string } {
  switch (diff) {
    case 'hard':
      return { label: 'Hard', color: 'text-rose-400', bg: 'bg-rose-500/15' };
    case 'medium':
      return { label: 'Medium', color: 'text-amber-400', bg: 'bg-amber-500/15' };
    case 'easy':
      return { label: 'Easy', color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
  }
}

export function getPriorityBadge(priority: PriorityLevel): { label: string; color: string; bg: string } {
  switch (priority) {
    case 'urgent':
      return { label: 'Urgent', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' };
    case 'high':
      return { label: 'High', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' };
    case 'medium':
      return { label: 'Medium', color: 'text-indigo-400', bg: 'bg-indigo-500/15 border-indigo-500/30' };
    case 'low':
      return { label: 'Low', color: 'text-slate-400', bg: 'bg-slate-500/15 border-slate-500/30' };
  }
}

export function getWeaknessBadge(level: WeaknessLevel): { label: string; color: string; bg: string } {
  switch (level) {
    case 'high':
      return { label: 'Weak Focus', color: 'text-rose-400', bg: 'bg-rose-500/15' };
    case 'medium':
      return { label: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500/15' };
    case 'low':
      return { label: 'Strong', color: 'text-emerald-400', bg: 'bg-emerald-500/15' };
  }
}

export function calculateSubjectProgress(subject: Subject, chapters: Chapter[]): { syllabusPercent: number; masteryPercent: number; chaptersCompleted: number; totalChapters: number } {
  const subjectChapters = chapters.filter(c => c.subjectId === subject.id);
  if (subjectChapters.length === 0) return { syllabusPercent: 0, masteryPercent: 0, chaptersCompleted: 0, totalChapters: 0 };
  
  const totalCompletion = subjectChapters.reduce((acc, c) => acc + c.completionPercentage, 0);
  const avgSyllabus = Math.round(totalCompletion / subjectChapters.length);
  
  const masteredCount = subjectChapters.filter(c => c.isMastered || (c.completionPercentage === 100 && c.confidenceLevel >= 4 && c.revisionCount >= 2)).length;
  const avgMastery = Math.round((masteredCount / subjectChapters.length) * 100);
  
  const completedCount = subjectChapters.filter(c => c.completionPercentage >= 100).length;

  return {
    syllabusPercent: avgSyllabus,
    masteryPercent: avgMastery,
    chaptersCompleted: completedCount,
    totalChapters: subjectChapters.length,
  };
}
