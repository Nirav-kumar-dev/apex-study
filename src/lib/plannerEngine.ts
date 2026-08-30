import { Chapter, Exam, PriorityLevel, StudyTask, Subject, TaskType, UserProfile } from '../types';
import { getDaysLeft } from './utils';

export interface PriorityBreakdown {
  totalScore: number;
  priorityLevel: PriorityLevel;
  examUrgencyScore: number;
  subjectWeaknessScore: number;
  chapterDifficultyScore: number;
  lowConfidenceBoost: number;
  incompleteRevisionScore: number;
  missedTaskPenalty: number;
}

export function calculateTaskPriorityScore(
  task: Partial<StudyTask>,
  subject: Subject | undefined,
  chapter: Chapter | undefined,
  exams: Exam[],
  currentDate: string = '2026-08-30'
): PriorityBreakdown {
  let examUrgencyScore = 0;
  let subjectWeaknessScore = 0;
  let chapterDifficultyScore = 0;
  let lowConfidenceBoost = 0;
  let incompleteRevisionScore = 0;
  let missedTaskPenalty = 0;

  // 1. Exam Urgency (Subjects with closer exam dates receive higher priority)
  if (subject) {
    const subjectExam = exams.find(e => e.subjectId === subject.id);
    const examDate = subjectExam?.date || subject.examDate;
    if (examDate) {
      const daysLeft = Math.max(1, getDaysLeft(examDate, currentDate));
      if (daysLeft <= 7) {
        examUrgencyScore = 40 + (7 - daysLeft) * 4; // Up to 68 pts
      } else if (daysLeft <= 14) {
        examUrgencyScore = 25 + (14 - daysLeft) * 2; // Up to 39 pts
      } else if (daysLeft <= 30) {
        examUrgencyScore = Math.max(10, 30 - daysLeft);
      } else {
        examUrgencyScore = 5;
      }
    }
  }

  // 2. Subject Weakness
  if (subject) {
    if (subject.weaknessLevel === 'high') {
      subjectWeaknessScore = 28;
    } else if (subject.weaknessLevel === 'medium') {
      subjectWeaknessScore = 18;
    } else {
      subjectWeaknessScore = 8;
    }
    // Multiply by custom subject allocation weight if present
    if (subject.priorityWeight) {
      subjectWeaknessScore += Math.round((subject.priorityWeight / 100) * 15);
    }
  }

  // 3. Chapter Difficulty
  if (chapter) {
    if (chapter.difficulty === 'hard') {
      chapterDifficultyScore = 18;
    } else if (chapter.difficulty === 'medium') {
      chapterDifficultyScore = 12;
    } else {
      chapterDifficultyScore = 6;
    }

    // 4. Low Confidence Boost: (6 - confidence) * 4
    lowConfidenceBoost = (6 - (chapter.confidenceLevel || 3)) * 4; // 1 -> 20 pts, 5 -> 4 pts

    // 5. Incomplete Revision
    if (chapter.revisionCount < 3 && chapter.completionPercentage >= 80) {
      incompleteRevisionScore = 14;
    } else if (!chapter.isMastered) {
      incompleteRevisionScore = 8;
    }
  }

  // 6. Missed Task / Task Type adjustment
  if (task.taskType === 'error_correction' || task.taskType === 'active_recall') {
    missedTaskPenalty += 10;
  }
  if (task.status === 'skipped') {
    missedTaskPenalty += 15;
  }

  const totalScore = Math.min(
    100,
    Math.round(
      examUrgencyScore * 0.35 +
      subjectWeaknessScore * 0.25 +
      chapterDifficultyScore * 0.15 +
      lowConfidenceBoost * 0.15 +
      incompleteRevisionScore * 0.05 +
      missedTaskPenalty * 0.05
    )
  );

  let priorityLevel: PriorityLevel = 'medium';
  if (totalScore >= 85) priorityLevel = 'urgent';
  else if (totalScore >= 70) priorityLevel = 'high';
  else if (totalScore >= 50) priorityLevel = 'medium';
  else priorityLevel = 'low';

  return {
    totalScore,
    priorityLevel,
    examUrgencyScore,
    subjectWeaknessScore,
    chapterDifficultyScore,
    lowConfidenceBoost,
    incompleteRevisionScore,
    missedTaskPenalty,
  };
}

// Determines the phase for Mathematics preparation as the exam approaches
export function getSubjectPreparationPhase(
  subject: Subject,
  examDateStr: string,
  currentDateStr: string = '2026-08-30'
): { phase: 'Learning' | 'Intensive Practice' | 'Mock Test & Error Fix' | 'Pre-Exam Polish'; description: string } {
  const daysLeft = getDaysLeft(examDateStr, currentDateStr);

  if (daysLeft > 25) {
    return {
      phase: 'Learning',
      description: 'Cover foundational theory, key concepts, and standard examples.',
    };
  } else if (daysLeft > 14) {
    return {
      phase: 'Intensive Practice',
      description: 'Solve exemplar problems, high-weightage numericals, and theorem proofs.',
    };
  } else if (daysLeft > 5) {
    return {
      phase: 'Mock Test & Error Fix',
      description: 'Timed full mock exams, error log rectification, and speed optimization.',
    };
  } else {
    return {
      phase: 'Pre-Exam Polish',
      description: 'Rapid active recall, formula sheets, key mistakes review, and confidence retention.',
    };
  }
}

export interface SuggestedTaskProposal {
  title: string;
  subjectId: string;
  chapterId?: string;
  taskType: TaskType;
  estimatedMinutes: number;
  priority: PriorityLevel;
  priorityScore: number;
  notes: string;
  reason: string;
}

// Generate intelligent suggestions for today's study plan
export function generateSuggestedPlan(
  subjects: Subject[],
  chapters: Chapter[],
  exams: Exam[],
  user: UserProfile,
  currentDate: string = '2026-08-30'
): SuggestedTaskProposal[] {
  const proposals: SuggestedTaskProposal[] = [];
  const d = new Date(currentDate);
  const isWeekend = d.getDay() === 0 || d.getDay() === 6;
  const availableHours = isWeekend ? user.studyPreference.weekendHours : user.studyPreference.schoolDaysHours;
  const availableMinutes = availableHours * 60;

  // 1. Check for urgent revisions due
  const dueChapters = chapters.filter(c => {
    if (!c.nextRevisionDate) return false;
    return getDaysLeft(c.nextRevisionDate, currentDate) <= 0;
  });

  dueChapters.forEach(chap => {
    const sub = subjects.find(s => s.id === chap.subjectId);
    if (!sub) return;
    const priorityCalc = calculateTaskPriorityScore({}, sub, chap, exams, currentDate);
    proposals.push({
      title: `${sub.name}: ${chap.name} (Spaced Revision)`,
      subjectId: sub.id,
      chapterId: chap.id,
      taskType: 'revision',
      estimatedMinutes: 40,
      priority: 'urgent',
      priorityScore: Math.max(90, priorityCalc.totalScore),
      notes: `Spaced repetition due for ${chap.name}. Current confidence: ${chap.confidenceLevel}/5.`,
      reason: 'Spaced repetition schedule due today',
    });
  });

  // 2. High priority weak chapters with low confidence (< 4)
  const weakChapters = chapters
    .filter(c => c.confidenceLevel <= 3 && !dueChapters.some(dc => dc.id === c.id))
    .sort((a, b) => {
      const subA = subjects.find(s => s.id === a.subjectId);
      const subB = subjects.find(s => s.id === b.subjectId);
      const scoreA = calculateTaskPriorityScore({}, subA, a, exams, currentDate).totalScore;
      const scoreB = calculateTaskPriorityScore({}, subB, b, exams, currentDate).totalScore;
      return scoreB - scoreA;
    });

  weakChapters.slice(0, 4).forEach(chap => {
    const sub = subjects.find(s => s.id === chap.subjectId);
    if (!sub) return;
    const priorityCalc = calculateTaskPriorityScore({}, sub, chap, exams, currentDate);
    
    // Choose appropriate task type based on subject syllabus status
    let taskType: TaskType = 'practice';
    if (sub.syllabusStatus === 'revision_phase' || chap.completionPercentage >= 100) {
      taskType = chap.mistakesCount > 4 ? 'error_correction' : 'practice';
    } else {
      taskType = 'learning';
    }

    proposals.push({
      title: `${sub.name}: ${chap.name} — ${taskType === 'error_correction' ? 'Error Fixes' : 'Problem Practice'}`,
      subjectId: sub.id,
      chapterId: chap.id,
      taskType,
      estimatedMinutes: taskType === 'practice' ? 50 : 35,
      priority: priorityCalc.priorityLevel,
      priorityScore: priorityCalc.totalScore,
      notes: `Target ${chap.name}. Solved ${chap.questionsSolved}/${chap.targetQuestions} target questions.`,
      reason: `High priority weak chapter (${chap.difficulty} difficulty, confidence ${chap.confidenceLevel}/5)`,
    });
  });

  // Sort proposals by priority score descending
  proposals.sort((a, b) => b.priorityScore - a.priorityScore);

  // Filter within daily time budget
  let accumulatedMinutes = 0;
  const filteredProposals: SuggestedTaskProposal[] = [];
  for (const prop of proposals) {
    if (accumulatedMinutes + prop.estimatedMinutes <= availableMinutes + 30) {
      filteredProposals.push(prop);
      accumulatedMinutes += prop.estimatedMinutes;
    }
  }

  return filteredProposals.length > 0 ? filteredProposals : proposals.slice(0, 3);
}

// Calculate the optimal next slot when a task is skipped or missed
export function calculateRescheduleSuggestion(
  task: StudyTask,
  existingTasks: StudyTask[],
  exams: Exam[],
  currentDate: string = '2026-08-30'
): { suggestedDate: string; suggestedTime: string; rationale: string } {
  // Suggest tomorrow evening or the next open slot
  const current = new Date(currentDate);
  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfterTomorrow = new Date(current);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const dayAfterStr = dayAfterTomorrow.toISOString().split('T')[0];

  // Count tomorrow's load
  const tomorrowTasks = existingTasks.filter(t => t.scheduledDate === tomorrowStr && t.status !== 'skipped');
  const tomorrowLoadMins = tomorrowTasks.reduce((acc, t) => acc + t.estimatedMinutes, 0);

  const exam = exams.find(e => e.subjectId === task.subjectId);
  const daysToExam = exam ? getDaysLeft(exam.date, currentDate) : 20;

  if (daysToExam <= 5 || tomorrowLoadMins <= 180) {
    return {
      suggestedDate: tomorrowStr,
      suggestedTime: '17:30',
      rationale: `Moved to tomorrow due to high exam urgency (${daysToExam} days left). Tomorrow's schedule has capacity.`,
    };
  } else {
    return {
      suggestedDate: dayAfterStr,
      suggestedTime: '18:00',
      rationale: `Tomorrow has ${tomorrowTasks.length} tasks scheduled (${tomorrowLoadMins} min). Moving to ${dayAfterStr} to prevent burnout while maintaining retention.`,
    };
  }
}
