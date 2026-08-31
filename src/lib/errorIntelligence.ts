import { ErrorCategory, ErrorLog } from '../types';

export interface CategorySummary {
  category: ErrorCategory;
  label: string;
  count: number;
  percentage: number;
  color: string;
  recommendation: string;
  subAdvice: string;
}

export const CATEGORY_LABELS: Record<ErrorCategory, { label: string; color: string; advice: string; subAdvice: string }> = {
  calculation: {
    label: 'Calculation Errors',
    color: '#ef4444',
    advice: 'Slow down during final algebraic & arithmetic calculation steps. Re-write transpositions in two clear lines rather than doing mental leaps.',
    subAdvice: '90% of lost marks in Class 9 Maths stem from sign flips during transposition and decimal arithmetic.',
  },
  conceptual: {
    label: 'Conceptual Gaps',
    color: '#f59e0b',
    advice: 'Review foundational definitions and derivation steps before solving complex multi-step problems.',
    subAdvice: 'Re-read NCERT theory sections and draw self-explained mindmaps.',
  },
  formula: {
    label: 'Formula & Unit Errors',
    color: '#8b5cf6',
    advice: 'Write formulas with SI units explicitly in the "Given" block before plugging in numerical values.',
    subAdvice: 'Create a one-page formula sheet for Physics & Heron formula, reviewed daily.',
  },
  careless: {
    label: 'Careless / Reading Mistakes',
    color: '#06b6d4',
    advice: 'Underline key constraints in the question (e.g. "not", "radius vs diameter", "m/s vs km/h") before starting.',
    subAdvice: 'Spend the first 45 seconds of every question actively parsing the prompt requirements.',
  },
  time_management: {
    label: 'Time Management Errors',
    color: '#ec4899',
    advice: 'Strictly enforce the 3-minute rule: If geometry proof or calculation path is unclear, star the question and move ahead immediately.',
    subAdvice: 'Leave 20 minutes buffer at the end of each 3-hour mock for thorough verification.',
  },
};

export function analyzeErrorPatterns(errors: ErrorLog[]): {
  totalOccurrences: number;
  topErrorCategory: CategorySummary | null;
  categoryBreakdown: CategorySummary[];
  mostCriticalMistake: ErrorLog | null;
} {
  if (errors.length === 0) {
    return {
      totalOccurrences: 0,
      topErrorCategory: null,
      categoryBreakdown: [],
      mostCriticalMistake: null,
    };
  }

  const categoryCounts: Record<ErrorCategory, number> = {
    calculation: 0,
    conceptual: 0,
    formula: 0,
    careless: 0,
    time_management: 0,
  };

  let totalOccurrences = 0;
  let mostCriticalMistake: ErrorLog | null = null;
  let maxMistakeCount = -1;

  errors.forEach(err => {
    const count = err.occurrenceCount || 1;
    categoryCounts[err.category] = (categoryCounts[err.category] || 0) + count;
    totalOccurrences += count;

    if (count > maxMistakeCount) {
      maxMistakeCount = count;
      mostCriticalMistake = err;
    }
  });

  const categoryBreakdown: CategorySummary[] = (Object.keys(CATEGORY_LABELS) as ErrorCategory[])
    .map(cat => {
      const count = categoryCounts[cat];
      const percentage = totalOccurrences > 0 ? Math.round((count / totalOccurrences) * 100) : 0;
      const meta = CATEGORY_LABELS[cat];
      return {
        category: cat,
        label: meta.label,
        count,
        percentage,
        color: meta.color,
        recommendation: meta.advice,
        subAdvice: meta.subAdvice,
      };
    })
    .filter(c => c.count > 0)
    .sort((a, b) => b.count - a.count);

  const topErrorCategory = categoryBreakdown.length > 0 ? categoryBreakdown[0] : null;

  return {
    totalOccurrences,
    topErrorCategory,
    categoryBreakdown,
    mostCriticalMistake,
  };
}
