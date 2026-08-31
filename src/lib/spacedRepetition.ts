import { Chapter, RevisionItem } from '../types';
import { getDaysLeft } from './utils';

// Standard 5-stage spaced repetition intervals in days:
// Stage 1: 1 day later
// Stage 2: 3 days later
// Stage 3: 7 days later
// Stage 4: 14 days later
// Stage 5: Pre-Exam (or 21 days later)
export const REVISION_INTERVALS = [1, 3, 7, 14, 21];

export function getNextRevisionDueDate(lastDateStr: string, stage: 1 | 2 | 3 | 4 | 5): string {
  const date = new Date(lastDateStr);
  const interval = REVISION_INTERVALS[stage - 1] || 7;
  date.setDate(date.getDate() + interval);
  return date.toISOString().split('T')[0];
}

export function createOrUpdateRevisionItem(
  chapter: Chapter,
  confidenceRating: 1 | 2 | 3 | 4 | 5,
  currentDateStr: string = '2026-08-30'
): { updatedChapter: Chapter; newRevision: RevisionItem } {
  let nextStage: 1 | 2 | 3 | 4 | 5 = 1;
  
  if (confidenceRating >= 4) {
    // Advanced: move to next stage
    nextStage = Math.min(5, (chapter.revisionCount || 0) + 1) as 1 | 2 | 3 | 4 | 5;
  } else if (confidenceRating === 3) {
    // Keep current stage
    nextStage = Math.min(5, Math.max(1, chapter.revisionCount || 1)) as 1 | 2 | 3 | 4 | 5;
  } else {
    // Reset or step down stage due to confusion
    nextStage = 1;
  }

  const nextDueDate = getNextRevisionDueDate(currentDateStr, nextStage);

  const updatedChapter: Chapter = {
    ...chapter,
    lastRevisedDate: currentDateStr,
    nextRevisionDate: nextDueDate,
    revisionCount: (chapter.revisionCount || 0) + 1,
    confidenceLevel: confidenceRating,
    isMastered: nextStage >= 4 && confidenceRating >= 4 && chapter.completionPercentage >= 100,
  };

  const newRevision: RevisionItem = {
    id: `rev-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    subjectId: chapter.subjectId,
    chapterId: chapter.id,
    stage: nextStage,
    dueDate: nextDueDate,
    intervalDays: REVISION_INTERVALS[nextStage - 1],
    status: 'due',
    lastStudiedDate: currentDateStr,
    confidenceBefore: chapter.confidenceLevel,
    confidenceAfter: confidenceRating,
    notes: `Revision Stage ${nextStage} completed with confidence ${confidenceRating}/5`,
  };

  return { updatedChapter, newRevision };
}

export function getRevisionRetentionScore(revisions: RevisionItem[], chapters: Chapter[]): number {
  if (chapters.length === 0) return 0;
  
  const completedOrHighConfidence = chapters.filter(c => c.confidenceLevel >= 4 || c.revisionCount >= 3).length;
  return Math.round((completedOrHighConfidence / chapters.length) * 100);
}

export function categorizeRevisions(revisions: RevisionItem[], currentDateStr: string = '2026-08-30'): {
  dueToday: RevisionItem[];
  upcoming: RevisionItem[];
  completed: RevisionItem[];
} {
  const dueToday: RevisionItem[] = [];
  const upcoming: RevisionItem[] = [];
  const completed: RevisionItem[] = [];

  revisions.forEach(rev => {
    if (rev.status === 'completed') {
      completed.push(rev);
    } else {
      const daysLeft = getDaysLeft(rev.dueDate, currentDateStr);
      if (daysLeft <= 0) {
        dueToday.push(rev);
      } else {
        upcoming.push(rev);
      }
    }
  });

  return { dueToday, upcoming, completed };
}
