import { BookDocument, Chapter, Exam, RevisionItem, StudyTask, Subject } from '../types';
import { getGyanNiketanExamsForClass } from './gyanNiketanSchedule';

export interface ClassCurriculum {
  classGrade: string; // 'Class 7' | 'Class 8' | 'Class 9' | 'Class 10'
  subjects: Subject[];
  chapters: Chapter[];
  exams: Exam[];
  tasks: StudyTask[];
  revisions: RevisionItem[];
  books: BookDocument[];
}

// -------------------------------------------------------------
// CLASS 7 CURRICULUM & STUDY PLAN
// -------------------------------------------------------------
export const CLASS_7_SUBJECTS: Subject[] = [
  {
    id: 'c7-sub-english',
    name: 'English Class 7',
    code: 'ENG-07',
    color: '#f59e0b',
    icon: 'BookOpen',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 20,
    examDate: '2026-09-17',
    targetStudyHours: 25,
    completedStudyHours: 8,
    category: 'language',
  },
  {
    id: 'c7-sub-sst',
    name: 'Social Science Class 7',
    code: 'SST-07',
    color: '#ec4899',
    icon: 'Globe2',
    isWeak: false,
    weaknessLevel: 'medium',
    syllabusStatus: 'in_progress',
    priorityWeight: 20,
    examDate: '2026-09-19',
    targetStudyHours: 28,
    completedStudyHours: 9,
    category: 'core',
  },
  {
    id: 'c7-sub-maths',
    name: 'Mathematics Class 7',
    code: 'MATH-07',
    color: '#6366f1',
    icon: 'Calculator',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 30,
    examDate: '2026-09-22',
    targetStudyHours: 40,
    completedStudyHours: 14,
    category: 'core',
  },
  {
    id: 'c7-sub-science',
    name: 'Science Class 7',
    code: 'SCI-07',
    color: '#10b981',
    icon: 'Atom',
    isWeak: false,
    weaknessLevel: 'medium',
    syllabusStatus: 'in_progress',
    priorityWeight: 20,
    examDate: '2026-09-24',
    targetStudyHours: 32,
    completedStudyHours: 11,
    category: 'core',
    subBranches: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'c7-sub-hindi',
    name: 'Hindi Class 7',
    code: 'HIN-07',
    color: '#f97316',
    icon: 'Languages',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 5,
    examDate: '2026-09-26',
    targetStudyHours: 15,
    completedStudyHours: 5,
    category: 'language',
  },
  {
    id: 'c7-sub-sans-ai',
    name: 'Sanskrit & AI Class 7',
    code: 'SAI-07',
    color: '#8b5cf6',
    icon: 'Sparkles',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 5,
    examDate: '2026-09-29',
    targetStudyHours: 12,
    completedStudyHours: 4,
    category: 'applied',
  },
];

export const CLASS_7_CHAPTERS: Chapter[] = [
  // English Class 7 (Exam Sep 17)
  { id: 'c7-ch-e1', subjectId: 'c7-sub-english', name: 'Three Questions (Honeycomb)', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 15, targetQuestions: 15, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-02', revisionCount: 2, mistakesCount: 0, notes: 'Theme of present moment, Leo Tolstoy wisdom.' },
  { id: 'c7-ch-e2', subjectId: 'c7-sub-english', name: 'A Gift of Chappals & The Rebel', order: 2, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 14, targetQuestions: 18, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-03', revisionCount: 1, mistakesCount: 0, notes: 'Themes of kindness, non-conformity.' },
  { id: 'c7-ch-e3', subjectId: 'c7-sub-english', name: 'Grammar: Tenses, Prepositions & Modals', order: 3, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 70, status: 'learning', isMastered: false, questionsSolved: 20, targetQuestions: 30, lastRevisedDate: null, nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 0, notes: 'Correct tense usage and modal verbs.' },

  // Social Science Class 7 (Exam Sep 19)
  { id: 'c7-ch-sst1', subjectId: 'c7-sub-sst', name: 'Tracing Changes Through 1000 Years', order: 1, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 16, targetQuestions: 20, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-02', revisionCount: 1, mistakesCount: 0, notes: 'Manuscripts, jatis, and medieval terms.' },
  { id: 'c7-ch-sst2', subjectId: 'c7-sub-sst', name: 'Environment & Inside Our Earth (Geo)', order: 2, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 18, targetQuestions: 22, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-04', revisionCount: 2, mistakesCount: 0, notes: 'Crust, mantle, core, igneous/sedimentary/metamorphic rocks.' },
  { id: 'c7-ch-sst3', subjectId: 'c7-sub-sst', name: 'On Equality & Role of Govt in Health (Civics)', order: 3, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 90, status: 'practicing', isMastered: false, questionsSolved: 14, targetQuestions: 15, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-05', revisionCount: 2, mistakesCount: 0, notes: 'Universal adult franchise and healthcare systems.' },

  // Maths Class 7 (Exam Sep 22)
  { id: 'c7-ch-m1', subjectId: 'c7-sub-maths', name: 'Integers', order: 1, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 90, status: 'practicing', isMastered: false, questionsSolved: 35, targetQuestions: 40, lastRevisedDate: '2026-08-24', nextRevisionDate: '2026-09-02', revisionCount: 2, mistakesCount: 0, notes: 'Rules for negative signs and absolute values.' },
  { id: 'c7-ch-m2', subjectId: 'c7-sub-maths', name: 'Fractions and Decimals', order: 2, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 75, status: 'learning', isMastered: false, questionsSolved: 28, targetQuestions: 40, lastRevisedDate: null, nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 0, notes: 'Fraction division reciprocals and decimals.' },
  { id: 'c7-ch-m3', subjectId: 'c7-sub-maths', name: 'Data Handling (Mean, Median, Mode)', order: 3, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 22, targetQuestions: 25, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-04', revisionCount: 2, mistakesCount: 0, notes: 'Range, arithmetic mean, and bar graph scales.' },
  { id: 'c7-ch-m4', subjectId: 'c7-sub-maths', name: 'Simple Equations (Linear)', order: 4, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 65, status: 'learning', isMastered: false, questionsSolved: 20, targetQuestions: 35, lastRevisedDate: null, nextRevisionDate: '2026-09-03', revisionCount: 0, mistakesCount: 0, notes: 'Transposition method and forming algebraic equations.' },
  { id: 'c7-ch-m5', subjectId: 'c7-sub-maths', name: 'Lines and Angles', order: 5, difficulty: 'hard', confidenceLevel: 2, completionPercentage: 50, status: 'learning', isMastered: false, questionsSolved: 15, targetQuestions: 40, lastRevisedDate: null, nextRevisionDate: '2026-09-02', revisionCount: 0, mistakesCount: 0, notes: 'Parallel lines, transversals, alternate & interior angles.' },

  // Science Class 7 (Exam Sep 24)
  { id: 'c7-ch-s1', subjectId: 'c7-sub-science', subBranch: 'Biology', name: 'Nutrition in Plants & Animals', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 30, targetQuestions: 30, lastRevisedDate: '2026-08-29', nextRevisionDate: '2026-09-10', revisionCount: 3, mistakesCount: 0, notes: 'Autotrophs, stomata, human digestive canal.' },
  { id: 'c7-ch-s2', subjectId: 'c7-sub-science', subBranch: 'Physics', name: 'Heat & Temperature', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 22, targetQuestions: 30, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-03', revisionCount: 1, mistakesCount: 0, notes: 'Conduction, convection, radiation, sea breeze.' },
  { id: 'c7-ch-s3', subjectId: 'c7-sub-science', subBranch: 'Chemistry', name: 'Acids, Bases & Salts', order: 3, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 65, status: 'learning', isMastered: false, questionsSolved: 18, targetQuestions: 30, lastRevisedDate: null, nextRevisionDate: '2026-09-02', revisionCount: 0, mistakesCount: 0, notes: 'Natural indicators, litmus, neutralization.' },

  // Hindi Class 7 (Exam Sep 26)
  { id: 'c7-ch-h1', subjectId: 'c7-sub-hindi', name: 'Ham Panchhi Unmukt Gagan Ke & Dadi Maa', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 90, status: 'mastered', isMastered: true, questionsSolved: 15, targetQuestions: 15, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-06', revisionCount: 2, mistakesCount: 0, notes: 'Poem meaning, emotion, Dadi Maa character sketch.' },
  { id: 'c7-ch-h2', subjectId: 'c7-sub-hindi', name: 'Hindi Vyakaran: Sandhi, Vilom & Patra', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 75, status: 'practicing', isMastered: false, questionsSolved: 16, targetQuestions: 20, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-05', revisionCount: 1, mistakesCount: 0, notes: 'Formal letters and grammatical word pairs.' },

  // Sanskrit & AI Class 7 (Exam Sep 29)
  { id: 'c7-ch-sai1', subjectId: 'c7-sub-sans-ai', name: 'Ruchira Sanskrit: Subhashitani & Dhatu Roop', order: 1, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 12, targetQuestions: 15, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-08', revisionCount: 1, mistakesCount: 0, notes: 'Sanskrit shlokas and present tense dhatu roop.' },
  { id: 'c7-ch-sai2', subjectId: 'c7-sub-sans-ai', name: 'AI Foundations: Smart Living & Coding Basics', order: 2, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 95, status: 'mastered', isMastered: true, questionsSolved: 15, targetQuestions: 15, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-12', revisionCount: 2, mistakesCount: 0, notes: 'Applications of AI in smartphones and smart homes.' },
];

export const CLASS_7_TASKS: StudyTask[] = [
  { id: 'c7-t1', title: 'English: Three Questions Reading & Q/A Review', subjectId: 'c7-sub-english', chapterId: 'c7-ch-e1', taskType: 'learning', estimatedMinutes: 45, scheduledDate: '2026-08-30', scheduledTime: '16:00', priority: 'high', priorityScore: 88, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c7-t2', title: 'Maths: Simple Equations Transposition Practice', subjectId: 'c7-sub-maths', chapterId: 'c7-ch-m4', taskType: 'practice', estimatedMinutes: 50, scheduledDate: '2026-08-30', scheduledTime: '17:00', priority: 'urgent', priorityScore: 94, status: 'pending', isAutoGenerated: true, orderIndex: 1 },
  { id: 'c7-t3', title: 'Science: Heat & Temperature Numericals & Notes', subjectId: 'c7-sub-science', chapterId: 'c7-ch-s2', taskType: 'revision', estimatedMinutes: 40, scheduledDate: '2026-08-30', scheduledTime: '18:15', priority: 'medium', priorityScore: 78, status: 'pending', isAutoGenerated: true, orderIndex: 2 },
  { id: 'c7-t4', title: 'SST: Environment & Earth Layers Diagrams', subjectId: 'c7-sub-sst', chapterId: 'c7-ch-sst2', taskType: 'learning', estimatedMinutes: 45, scheduledDate: '2026-08-31', scheduledTime: '16:30', priority: 'high', priorityScore: 84, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c7-t5', title: 'Maths: Lines and Angles Theorem Review', subjectId: 'c7-sub-maths', chapterId: 'c7-ch-m5', taskType: 'practice', estimatedMinutes: 60, scheduledDate: '2026-08-31', scheduledTime: '17:45', priority: 'urgent', priorityScore: 92, status: 'pending', isAutoGenerated: true, orderIndex: 1 },
  { id: 'c7-t6', title: 'English: Grammar Tenses & Modals Exercise', subjectId: 'c7-sub-english', chapterId: 'c7-ch-e3', taskType: 'practice', estimatedMinutes: 45, scheduledDate: '2026-09-01', scheduledTime: '16:00', priority: 'high', priorityScore: 86, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c7-t7', title: 'English: Intensive Pre-Exam Mock Paper (Half-Yearly)', subjectId: 'c7-sub-english', taskType: 'mock_test', estimatedMinutes: 90, scheduledDate: '2026-09-15', scheduledTime: '10:00', priority: 'urgent', priorityScore: 98, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c7-t8', title: 'English Exam Eve: Active Recall & Grammar Formulas', subjectId: 'c7-sub-english', taskType: 'active_recall', estimatedMinutes: 60, scheduledDate: '2026-09-16', scheduledTime: '16:00', priority: 'urgent', priorityScore: 100, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
];

export const CLASS_7_CURRICULUM: ClassCurriculum = {
  classGrade: 'Class 7',
  subjects: CLASS_7_SUBJECTS,
  chapters: CLASS_7_CHAPTERS,
  exams: getGyanNiketanExamsForClass('Class 7'),
  tasks: CLASS_7_TASKS,
  revisions: [
    { id: 'c7-rev-1', subjectId: 'c7-sub-english', chapterId: 'c7-ch-e1', stage: 2, dueDate: '2026-09-02', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-25', confidenceBefore: 4, notes: 'Check central themes and vocabulary.' },
    { id: 'c7-rev-2', subjectId: 'c7-sub-maths', chapterId: 'c7-ch-m1', stage: 3, dueDate: '2026-09-02', intervalDays: 7, status: 'due', lastStudiedDate: '2026-08-24', confidenceBefore: 4, notes: 'Rules for negative signs in multiplication.' },
    { id: 'c7-rev-3', subjectId: 'c7-sub-science', chapterId: 'c7-ch-s2', stage: 2, dueDate: '2026-09-03', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-28', confidenceBefore: 3, notes: 'Clinical vs Laboratory thermometer differences.' },
  ],
  books: [
    { id: 'c7-bk-maths', title: 'NCERT Mathematics Class 7', classGrade: 'Class 7', subjectId: 'c7-sub-maths', subjectName: 'Mathematics Class 7', fileName: 'NCERT_Maths_Class7.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?gemh1=0-15', fileSize: '14.2 MB', uploadedAt: '2026-08-30' },
    { id: 'c7-bk-science', title: 'NCERT Science Class 7', classGrade: 'Class 7', subjectId: 'c7-sub-science', subjectName: 'Science Class 7', fileName: 'NCERT_Science_Class7.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?gesc1=0-18', fileSize: '18.5 MB', uploadedAt: '2026-08-30' },
    { id: 'c7-bk-english', title: 'NCERT Honeycomb (English Class 7)', classGrade: 'Class 7', subjectId: 'c7-sub-english', subjectName: 'English Class 7', fileName: 'NCERT_Honeycomb_Class7.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?gehc1=0-10', fileSize: '11.8 MB', uploadedAt: '2026-08-30' },
    { id: 'c7-bk-sst', title: 'NCERT Our Pasts - II (SST Class 7)', classGrade: 'Class 7', subjectId: 'c7-sub-sst', subjectName: 'Social Science Class 7', fileName: 'NCERT_OurPasts2_Class7.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?gess1=0-10', fileSize: '16.4 MB', uploadedAt: '2026-08-30' },
  ],
};

// -------------------------------------------------------------
// CLASS 8 CURRICULUM & STUDY PLAN
// -------------------------------------------------------------
export const CLASS_8_SUBJECTS: Subject[] = [
  {
    id: 'c8-sub-science',
    name: 'Science Class 8',
    code: 'SCI-08',
    color: '#10b981',
    icon: 'Atom',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 25,
    examDate: '2026-09-18',
    targetStudyHours: 40,
    completedStudyHours: 15,
    category: 'core',
    subBranches: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'c8-sub-english',
    name: 'English Class 8',
    code: 'ENG-08',
    color: '#f59e0b',
    icon: 'BookOpen',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 15,
    examDate: '2026-09-21',
    targetStudyHours: 25,
    completedStudyHours: 9,
    category: 'language',
  },
  {
    id: 'c8-sub-hindi',
    name: 'Hindi Class 8',
    code: 'HIN-08',
    color: '#f97316',
    icon: 'Languages',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 10,
    examDate: '2026-09-23',
    targetStudyHours: 18,
    completedStudyHours: 6,
    category: 'language',
  },
  {
    id: 'c8-sub-sst',
    name: 'Social Science Class 8',
    code: 'SST-08',
    color: '#ec4899',
    icon: 'Globe2',
    isWeak: false,
    weaknessLevel: 'medium',
    syllabusStatus: 'in_progress',
    priorityWeight: 15,
    examDate: '2026-09-25',
    targetStudyHours: 28,
    completedStudyHours: 10,
    category: 'core',
  },
  {
    id: 'c8-sub-maths',
    name: 'Mathematics Class 8',
    code: 'MATH-08',
    color: '#6366f1',
    icon: 'Calculator',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 30,
    examDate: '2026-09-28',
    targetStudyHours: 45,
    completedStudyHours: 18,
    category: 'core',
  },
  {
    id: 'c8-sub-sans-ai',
    name: 'Sanskrit & AI Class 8',
    code: 'SAI-08',
    color: '#8b5cf6',
    icon: 'Sparkles',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 5,
    examDate: '2026-09-30',
    targetStudyHours: 14,
    completedStudyHours: 5,
    category: 'applied',
  },
];

export const CLASS_8_CHAPTERS: Chapter[] = [
  // Science Class 8 (Exam Sep 18 - 1st exam for Class 8!)
  { id: 'c8-ch-s1', subjectId: 'c8-sub-science', subBranch: 'Biology', name: 'Crop Production & Management', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 30, targetQuestions: 30, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-12', revisionCount: 3, mistakesCount: 0, notes: 'Kharif vs Rabi crops, sowing, irrigation & manures.' },
  { id: 'c8-ch-s2', subjectId: 'c8-sub-science', subBranch: 'Biology', name: 'Microorganisms: Friend and Foe', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 25, targetQuestions: 30, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-03', revisionCount: 2, mistakesCount: 0, notes: 'Nitrogen fixation cycle, food preservation & antibiotics.' },
  { id: 'c8-ch-s3', subjectId: 'c8-sub-science', subBranch: 'Chemistry', name: 'Coal and Petroleum', order: 3, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 75, status: 'practicing', isMastered: false, questionsSolved: 20, targetQuestions: 25, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 0, notes: 'Fossil fuels, fractional distillation, conservation.' },
  { id: 'c8-ch-s4', subjectId: 'c8-sub-science', subBranch: 'Chemistry', name: 'Combustion and Flame', order: 4, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 60, status: 'learning', isMastered: false, questionsSolved: 18, targetQuestions: 30, lastRevisedDate: null, nextRevisionDate: '2026-09-02', revisionCount: 0, mistakesCount: 0, notes: 'Ignition temp, flame zones (dark, luminous, non-luminous).' },

  // English Class 8 (Exam Sep 21)
  { id: 'c8-ch-e1', subjectId: 'c8-sub-english', name: 'The Best Christmas Present in the World', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 18, targetQuestions: 18, lastRevisedDate: '2026-08-24', nextRevisionDate: '2026-09-05', revisionCount: 2, mistakesCount: 0, notes: 'Theme of war, humanity, Christmas truce 1914.' },
  { id: 'c8-ch-e2', subjectId: 'c8-sub-english', name: 'The Tsunami & Geography Lesson', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 15, targetQuestions: 20, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-06', revisionCount: 1, mistakesCount: 0, notes: 'Courage, survival stories and poetic perspective.' },

  // Hindi Class 8 (Exam Sep 23)
  { id: 'c8-ch-h1', subjectId: 'c8-sub-hindi', name: 'Dhwani & Lakh Ki Chudiyan (Vasant)', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 90, status: 'mastered', isMastered: true, questionsSolved: 16, targetQuestions: 18, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-08', revisionCount: 2, mistakesCount: 0, notes: 'Suryakant Tripathi Nirala poetry & traditional artisan plight.' },

  // SST Class 8 (Exam Sep 25)
  { id: 'c8-ch-sst1', subjectId: 'c8-sub-sst', name: 'How, When and Where & Trade to Territory', order: 1, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 20, targetQuestions: 25, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 0, notes: 'Battle of Plassey & Buxar, Subsidiary Alliance.' },
  { id: 'c8-ch-sst2', subjectId: 'c8-sub-sst', name: 'The Indian Constitution & Secularism (Civics)', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 18, targetQuestions: 20, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-07', revisionCount: 2, mistakesCount: 0, notes: 'Key features of Constitution, Fundamental Rights.' },

  // Maths Class 8 (Exam Sep 28)
  { id: 'c8-ch-m1', subjectId: 'c8-sub-maths', name: 'Rational Numbers', order: 1, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 90, status: 'practicing', isMastered: false, questionsSolved: 35, targetQuestions: 40, lastRevisedDate: '2026-08-24', nextRevisionDate: '2026-09-02', revisionCount: 2, mistakesCount: 0, notes: 'Closure, commutativity, associativity, distributivity.' },
  { id: 'c8-ch-m2', subjectId: 'c8-sub-maths', name: 'Linear Equations in One Variable', order: 2, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 75, status: 'learning', isMastered: false, questionsSolved: 30, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 0, notes: 'Word problems involving ages, perimeter and numbers.' },
  { id: 'c8-ch-m3', subjectId: 'c8-sub-maths', name: 'Understanding Quadrilaterals', order: 3, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 65, status: 'learning', isMastered: false, questionsSolved: 20, targetQuestions: 40, lastRevisedDate: null, nextRevisionDate: '2026-09-03', revisionCount: 1, mistakesCount: 0, notes: 'Angle sum property of polygons, properties of parallelograms.' },
  { id: 'c8-ch-m4', subjectId: 'c8-sub-maths', name: 'Squares and Square Roots', order: 4, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 28, targetQuestions: 40, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 0, notes: 'Prime factorization and long division method.' },
  { id: 'c8-ch-m5', subjectId: 'c8-sub-maths', name: 'Cubes and Cube Roots', order: 5, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 22, targetQuestions: 30, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-05', revisionCount: 1, mistakesCount: 0, notes: 'Estimation method and Hardy-Ramanujan numbers.' },

  // Sanskrit & AI Class 8 (Exam Sep 30)
  { id: 'c8-ch-sai1', subjectId: 'c8-sub-sans-ai', name: 'Ruchira Bhag 3: Shloka Recitation & Karaka', order: 1, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 14, targetQuestions: 16, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-10', revisionCount: 1, mistakesCount: 0, notes: 'Karaka vibhakti rules and word derivations.' },
  { id: 'c8-ch-sai2', subjectId: 'c8-sub-sans-ai', name: 'AI Ethics, Bias & Smart Machine Principles', order: 2, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 90, status: 'mastered', isMastered: true, questionsSolved: 15, targetQuestions: 15, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-12', revisionCount: 2, mistakesCount: 0, notes: 'Machine learning fundamentals and ethical guidelines.' },
];

export const CLASS_8_TASKS: StudyTask[] = [
  { id: 'c8-t1', title: 'Science: Combustion & Flame Diagram & Theory Focus', subjectId: 'c8-sub-science', chapterId: 'c8-ch-s4', taskType: 'learning', estimatedMinutes: 50, scheduledDate: '2026-08-30', scheduledTime: '16:00', priority: 'urgent', priorityScore: 96, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c8-t2', title: 'Science: Microorganisms Spaced Revision & Q/A', subjectId: 'c8-sub-science', chapterId: 'c8-ch-s2', taskType: 'revision', estimatedMinutes: 40, scheduledDate: '2026-08-30', scheduledTime: '17:15', priority: 'high', priorityScore: 88, status: 'pending', isAutoGenerated: true, orderIndex: 1 },
  { id: 'c8-t3', title: 'Maths: Linear Equations Word Problems Practice', subjectId: 'c8-sub-maths', chapterId: 'c8-ch-m2', taskType: 'practice', estimatedMinutes: 50, scheduledDate: '2026-08-30', scheduledTime: '18:15', priority: 'high', priorityScore: 86, status: 'pending', isAutoGenerated: true, orderIndex: 2 },
  { id: 'c8-t4', title: 'Science: Full Syllabus Class 8 Mock Exam 1', subjectId: 'c8-sub-science', taskType: 'mock_test', estimatedMinutes: 90, scheduledDate: '2026-09-15', scheduledTime: '09:00', priority: 'urgent', priorityScore: 98, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c8-t5', title: 'Science Eve: Active Recall & Key Chemical Reactions', subjectId: 'c8-sub-science', taskType: 'active_recall', estimatedMinutes: 60, scheduledDate: '2026-09-17', scheduledTime: '16:30', priority: 'urgent', priorityScore: 100, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
];

export const CLASS_8_CURRICULUM: ClassCurriculum = {
  classGrade: 'Class 8',
  subjects: CLASS_8_SUBJECTS,
  chapters: CLASS_8_CHAPTERS,
  exams: getGyanNiketanExamsForClass('Class 8'),
  tasks: CLASS_8_TASKS,
  revisions: [
    { id: 'c8-rev-1', subjectId: 'c8-sub-science', chapterId: 'c8-ch-s4', stage: 1, dueDate: '2026-09-02', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-29', confidenceBefore: 3, notes: 'Zones of candle flame and calorific value calculations.' },
    { id: 'c8-rev-2', subjectId: 'c8-sub-maths', chapterId: 'c8-ch-m2', stage: 2, dueDate: '2026-09-01', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-27', confidenceBefore: 3, notes: 'Age related linear equation derivations.' },
  ],
  books: [
    { id: 'c8-bk-science', title: 'NCERT Science Class 8', classGrade: 'Class 8', subjectId: 'c8-sub-science', subjectName: 'Science Class 8', fileName: 'NCERT_Science_Class8.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?hesc1=0-18', fileSize: '21.3 MB', uploadedAt: '2026-08-30' },
    { id: 'c8-bk-maths', title: 'NCERT Mathematics Class 8', classGrade: 'Class 8', subjectId: 'c8-sub-maths', subjectName: 'Mathematics Class 8', fileName: 'NCERT_Maths_Class8.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?hemh1=0-16', fileSize: '16.8 MB', uploadedAt: '2026-08-30' },
    { id: 'c8-bk-english', title: 'NCERT Honeydew (English Class 8)', classGrade: 'Class 8', subjectId: 'c8-sub-english', subjectName: 'English Class 8', fileName: 'NCERT_Honeydew_Class8.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?hehd1=0-10', fileSize: '12.4 MB', uploadedAt: '2026-08-30' },
  ],
};

// -------------------------------------------------------------
// CLASS 9 CURRICULUM & STUDY PLAN (DEFAULT)
// -------------------------------------------------------------
export const CLASS_9_SUBJECTS: Subject[] = [
  {
    id: 'sub-maths',
    name: 'Mathematics Class 9',
    code: 'MATH-041',
    color: '#6366f1',
    icon: 'Calculator',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 30,
    examDate: '2026-09-18',
    targetStudyHours: 48,
    completedStudyHours: 29.5,
    category: 'core',
  },
  {
    id: 'sub-science',
    name: 'Science Class 9',
    code: 'SCI-086',
    color: '#06b6d4',
    icon: 'Atom',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 25,
    examDate: '2026-09-21',
    targetStudyHours: 42,
    completedStudyHours: 18.5,
    category: 'core',
    subBranches: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'sub-hindi',
    name: 'Hindi / Sanskrit Class 9',
    code: 'HIN-002',
    color: '#ec4899',
    icon: 'Languages',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 10,
    examDate: '2026-09-23',
    targetStudyHours: 16,
    completedStudyHours: 6.0,
    category: 'language',
  },
  {
    id: 'sub-english',
    name: 'English Language & Lit Class 9',
    code: 'ENG-184',
    color: '#f59e0b',
    icon: 'BookOpen',
    isWeak: false,
    weaknessLevel: 'medium',
    syllabusStatus: 'in_progress',
    priorityWeight: 15,
    examDate: '2026-09-25',
    targetStudyHours: 22,
    completedStudyHours: 10.0,
    category: 'language',
  },
  {
    id: 'sub-sst',
    name: 'Social Science Class 9',
    code: 'SST-087',
    color: '#10b981',
    icon: 'Globe',
    isWeak: false,
    weaknessLevel: 'medium',
    syllabusStatus: 'in_progress',
    priorityWeight: 15,
    examDate: '2026-09-28',
    targetStudyHours: 25,
    completedStudyHours: 8.0,
    category: 'core',
  },
  {
    id: 'sub-ai',
    name: 'Artificial Intelligence Class 9',
    code: 'AI-417',
    color: '#8b5cf6',
    icon: 'Bot',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 5,
    examDate: '2026-09-30',
    targetStudyHours: 12,
    completedStudyHours: 4.5,
    category: 'applied',
  },
];

export const CLASS_9_CHAPTERS: Chapter[] = [
  // Maths Class 9 (Exam Sep 18 - 1st exam for Class 9!)
  { id: 'ch-m1', subjectId: 'sub-maths', name: 'Number Systems', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 45, targetQuestions: 40, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-05', revisionCount: 3, mistakesCount: 1, notes: 'Rationalization of denominators, laws of exponents for real numbers.' },
  { id: 'ch-m2', subjectId: 'sub-maths', name: 'Polynomials', order: 2, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 38, targetQuestions: 50, lastRevisedDate: '2026-08-22', nextRevisionDate: '2026-09-02', revisionCount: 2, mistakesCount: 4, notes: 'Factor theorem, algebraic identities: (a+b+c)^2, (a+b)^3, a^3+b^3+c^3-3abc.' },
  { id: 'ch-m3', subjectId: 'sub-maths', name: 'Coordinate Geometry', order: 3, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 90, status: 'mastered', isMastered: true, questionsSolved: 25, targetQuestions: 25, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-08', revisionCount: 2, mistakesCount: 0, notes: 'Cartesian plane, quadrants, plotting coordinates (x, y).' },
  { id: 'ch-m4', subjectId: 'sub-maths', name: 'Linear Equations in Two Variables', order: 4, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 30, targetQuestions: 35, lastRevisedDate: '2026-08-20', nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 2, notes: 'General form ax + by + c = 0 and graphical representation.' },
  { id: 'ch-m5', subjectId: 'sub-maths', name: 'Lines and Angles', order: 5, difficulty: 'hard', confidenceLevel: 2, completionPercentage: 60, status: 'learning', isMastered: false, questionsSolved: 20, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-08-31', revisionCount: 0, mistakesCount: 5, notes: 'Transversal angles, alternate interior angles theorem, vertically opposite angles.' },
  { id: 'ch-m6', subjectId: 'sub-maths', name: 'Triangles (Congruence)', order: 6, difficulty: 'hard', confidenceLevel: 2, completionPercentage: 50, status: 'learning', isMastered: false, questionsSolved: 15, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-03', revisionCount: 0, mistakesCount: 6, notes: 'SAS, ASA, AAS, SSS, RHS congruence criteria and isosceles triangle theorems.' },

  // Science Class 9 (Exam Sep 21)
  { id: 'ch-s1', subjectId: 'sub-science', subBranch: 'Chemistry', name: 'Matter in Our Surroundings', order: 1, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 90, status: 'practicing', isMastered: false, questionsSolved: 30, targetQuestions: 35, lastRevisedDate: '2026-08-24', nextRevisionDate: '2026-09-03', revisionCount: 2, mistakesCount: 1, notes: 'Latent heat of fusion/vaporization, evaporation cooling.' },
  { id: 'ch-s2', subjectId: 'sub-science', subBranch: 'Chemistry', name: 'Is Matter Around Us Pure?', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 28, targetQuestions: 35, lastRevisedDate: '2026-08-23', nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 2, notes: 'Colloids, Tyndall effect, solutions concentration percentage.' },
  { id: 'ch-s3', subjectId: 'sub-science', subBranch: 'Biology', name: 'The Fundamental Unit of Life (Cell)', order: 3, difficulty: 'medium', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 40, targetQuestions: 40, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-10', revisionCount: 3, mistakesCount: 0, notes: 'Mitochondria (ATP), Golgi apparatus, Endoplasmic reticulum, Osmosis.' },
  { id: 'ch-s4', subjectId: 'sub-science', subBranch: 'Biology', name: 'Tissues', order: 4, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 70, status: 'learning', isMastered: false, questionsSolved: 22, targetQuestions: 40, lastRevisedDate: null, nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 3, notes: 'Meristematic vs permanent plant tissue, Xylem, Phloem, Muscular & Nervous tissues.' },
  { id: 'ch-s5', subjectId: 'sub-science', subBranch: 'Physics', name: 'Motion', order: 5, difficulty: 'hard', confidenceLevel: 2, completionPercentage: 65, status: 'learning', isMastered: false, questionsSolved: 25, targetQuestions: 50, lastRevisedDate: null, nextRevisionDate: '2026-08-31', revisionCount: 0, mistakesCount: 7, notes: 'Equations of motion: v=u+at, s=ut+1/2at^2, v^2-u^2=2as. Velocity-time graphs.' },
  { id: 'ch-s6', subjectId: 'sub-science', subBranch: 'Physics', name: 'Force and Laws of Motion', order: 6, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 60, status: 'learning', isMastered: false, questionsSolved: 18, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-04', revisionCount: 0, mistakesCount: 4, notes: 'Newton first, second (F=ma), third law, momentum conservation.' },

  // Hindi Class 9 (Exam Sep 23)
  { id: 'ch-h1', subjectId: 'sub-hindi', name: 'Do Bailon Ki Katha & Sakhiyan', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 20, targetQuestions: 20, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-07', revisionCount: 2, mistakesCount: 0, notes: 'Premchand story of Heera and Moti + Kabir Sakhiyan.' },
  { id: 'ch-h2', subjectId: 'sub-hindi', name: 'Hindi Vyakaran: Upasarg, Pratyay, Samas', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 25, targetQuestions: 30, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-06', revisionCount: 1, mistakesCount: 1, notes: 'Tatpurush, Karmadharaya, Dvandva & Bahuvrihi Samas.' },

  // English Class 9 (Exam Sep 25)
  { id: 'ch-e1', subjectId: 'sub-english', name: 'The Fun They Had & The Road Not Taken', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 20, targetQuestions: 20, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-09', revisionCount: 2, mistakesCount: 0, notes: 'Isaac Asimov future schooling + Robert Frost choice.' },
  { id: 'ch-e2', subjectId: 'sub-english', name: 'The Sound of Music & Wind', order: 2, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 90, status: 'practicing', isMastered: false, questionsSolved: 18, targetQuestions: 20, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-08', revisionCount: 1, mistakesCount: 0, notes: 'Evelyn Glennie & Bismillah Khan inspirational accounts.' },
  { id: 'ch-e3', subjectId: 'sub-english', name: 'Writing: Descriptive Paragraph & Diary Entry', order: 3, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 75, status: 'practicing', isMastered: false, questionsSolved: 15, targetQuestions: 20, lastRevisedDate: '2026-08-24', nextRevisionDate: '2026-09-07', revisionCount: 1, mistakesCount: 0, notes: 'Format, word limit, tone, coherent flow.' },

  // SST Class 9 (Exam Sep 28)
  { id: 'ch-sst1', subjectId: 'sub-sst', name: 'The French Revolution (History)', order: 1, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 24, targetQuestions: 30, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-05', revisionCount: 2, mistakesCount: 0, notes: 'Causes of 1789, Estates, Reign of Terror, Robespierre.' },
  { id: 'ch-sst2', subjectId: 'sub-sst', name: 'India: Size and Location & Physical Features', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 22, targetQuestions: 30, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-07', revisionCount: 1, mistakesCount: 1, notes: 'Himalayan ranges, Northern Plains, Peninsular Plateau.' },
  { id: 'ch-sst3', subjectId: 'sub-sst', name: 'What is Democracy? Why Democracy? & Village Palampur', order: 3, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 20, targetQuestions: 25, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-08', revisionCount: 1, mistakesCount: 0, notes: 'Features of democracy + 4 factors of production.' },

  // AI Class 9 (Exam Sep 30)
  { id: 'ch-ai1', subjectId: 'sub-ai', name: 'AI Project Cycle & Python Basics', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 95, status: 'mastered', isMastered: true, questionsSolved: 25, targetQuestions: 25, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-12', revisionCount: 2, mistakesCount: 0, notes: 'Problem Scoping, Data Acquisition, Data Exploration, Modeling, Evaluation.' },
];

export const CLASS_9_TASKS: StudyTask[] = [
  { id: 'task-1', title: 'Maths: Lines & Angles NCERT Ex 6.1 & 6.2 Proofs', subjectId: 'sub-maths', chapterId: 'ch-m5', taskType: 'learning', estimatedMinutes: 50, scheduledDate: '2026-08-30', scheduledTime: '16:00', priority: 'urgent', priorityScore: 96, status: 'pending', isAutoGenerated: true, orderIndex: 0, notes: 'Target theorem 6.1 vertically opposite angles proof and parallel lines transversals.' },
  { id: 'task-2', title: 'Science: Motion Derivation of 3 Equations graphically', subjectId: 'sub-science', chapterId: 'ch-s5', taskType: 'learning', estimatedMinutes: 45, scheduledDate: '2026-08-30', scheduledTime: '17:00', priority: 'urgent', priorityScore: 94, status: 'pending', isAutoGenerated: true, orderIndex: 1, notes: 'Practice graphical derivations of v=u+at, s=ut+1/2at^2 and v^2-u^2=2as.' },
  { id: 'task-3', title: 'Maths: Polynomials Factor Theorem & Identities Drills', subjectId: 'sub-maths', chapterId: 'ch-m2', taskType: 'practice', estimatedMinutes: 45, scheduledDate: '2026-08-30', scheduledTime: '18:00', priority: 'high', priorityScore: 88, status: 'pending', isAutoGenerated: true, orderIndex: 2, notes: 'Solve 10 identity problems on (x+y+z)^2 and (x+y)^3.' },
  { id: 'task-4', title: 'Science: Biology Tissues Spaced Repetition Flashcards', subjectId: 'sub-science', chapterId: 'ch-s4', taskType: 'revision', estimatedMinutes: 30, scheduledDate: '2026-08-30', scheduledTime: '19:00', priority: 'medium', priorityScore: 78, status: 'pending', isAutoGenerated: true, orderIndex: 3, notes: 'Active recall: Meristematic tissues (apical, intercalary, lateral) & complex tissues.' },
  { id: 'task-5', title: 'Maths: Triangles Congruence Criteria & NCERT Ex 7.1', subjectId: 'sub-maths', chapterId: 'ch-m6', taskType: 'practice', estimatedMinutes: 60, scheduledDate: '2026-08-31', scheduledTime: '16:30', priority: 'urgent', priorityScore: 95, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'task-6', title: 'Science: Force & Laws of Motion Numericals (F=ma)', subjectId: 'sub-science', chapterId: 'ch-s6', taskType: 'practice', estimatedMinutes: 50, scheduledDate: '2026-08-31', scheduledTime: '17:45', priority: 'high', priorityScore: 90, status: 'pending', isAutoGenerated: true, orderIndex: 1 },
  { id: 'task-7', title: 'Maths: Full Half-Yearly Mock Examination 1 (80 Marks)', subjectId: 'sub-maths', taskType: 'mock_test', estimatedMinutes: 180, scheduledDate: '2026-09-14', scheduledTime: '09:00', priority: 'urgent', priorityScore: 100, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'task-8', title: 'Maths Exam Eve: Error Log Revision & Theorem Sheet', subjectId: 'sub-maths', taskType: 'active_recall', estimatedMinutes: 60, scheduledDate: '2026-09-17', scheduledTime: '16:00', priority: 'urgent', priorityScore: 100, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
];

export const CLASS_9_CURRICULUM: ClassCurriculum = {
  classGrade: 'Class 9',
  subjects: CLASS_9_SUBJECTS,
  chapters: CLASS_9_CHAPTERS,
  exams: getGyanNiketanExamsForClass('Class 9'),
  tasks: CLASS_9_TASKS,
  revisions: [
    { id: 'rev-1', subjectId: 'sub-maths', chapterId: 'ch-m2', stage: 2, dueDate: '2026-09-02', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-22', confidenceBefore: 3, notes: 'Factorization using middle term splitting and cubic identities.' },
    { id: 'rev-2', subjectId: 'sub-science', chapterId: 'ch-s4', stage: 1, dueDate: '2026-09-01', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-28', confidenceBefore: 3, notes: 'Plant tissues vs Animal tissues flowchart.' },
    { id: 'rev-3', subjectId: 'sub-maths', chapterId: 'ch-m5', stage: 1, dueDate: '2026-08-31', intervalDays: 1, status: 'due', lastStudiedDate: '2026-08-29', confidenceBefore: 2, notes: 'Alternate interior angles proof.' },
  ],
  books: [
    {
      id: 'book-maths-9',
      title: 'NCERT Mathematics (Class 9)',
      classGrade: 'Class 9',
      subjectId: 'sub-maths',
      subjectName: 'Mathematics Class 9',
      folderPath: '/book/class 9th/maths9/iemh1dd/',
      fileName: 'iemh101.pdf',
      fileUrl: '/book/class 9th/maths9/iemh1dd/iemh101.pdf',
      fileSize: '21.5 MB (8 Chapters)',
      uploadedAt: '2026-08-30',
      chapterFiles: [
        { name: 'Chapter 1: Number Systems', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh101.pdf', chapterNumber: 1 },
        { name: 'Chapter 2: Polynomials', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh102.pdf', chapterNumber: 2 },
        { name: 'Chapter 3: Coordinate Geometry', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh103.pdf', chapterNumber: 3 },
        { name: 'Chapter 4: Linear Equations in Two Variables', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh104.pdf', chapterNumber: 4 },
        { name: "Chapter 5: Introduction to Euclid's Geometry", pdfPath: '/book/class 9th/maths9/iemh1dd/iemh105.pdf', chapterNumber: 5 },
        { name: 'Chapter 6: Lines and Angles', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh106.pdf', chapterNumber: 6 },
        { name: 'Chapter 7: Triangles', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh107.pdf', chapterNumber: 7 },
        { name: "Chapter 8: Quadrilaterals", pdfPath: '/book/class 9th/maths9/iemh1dd/iemh108.pdf', chapterNumber: 8 },
        { name: 'Prelims, Answers & Syllabus Overview', pdfPath: '/book/class 9th/maths9/iemh1dd/iemh1ps.pdf' },
      ],
    },
    {
      id: 'book-sci-9',
      title: 'NCERT Science (Class 9)',
      classGrade: 'Class 9',
      subjectId: 'sub-science',
      subjectName: 'Science Class 9',
      folderPath: '/book/class 9th/science9/iesc1dd/',
      fileName: 'iesc101.pdf',
      fileUrl: '/book/class 9th/science9/iesc1dd/iesc101.pdf',
      fileSize: '135 MB (13 Chapters)',
      uploadedAt: '2026-08-30',
      chapterFiles: [
        { name: 'Chapter 1: Matter in Our Surroundings (Chemistry)', pdfPath: '/book/class 9th/science9/iesc1dd/iesc101.pdf', chapterNumber: 1 },
        { name: 'Chapter 2: Is Matter Around Us Pure?', pdfPath: '/book/class 9th/science9/iesc1dd/iesc102.pdf', chapterNumber: 2 },
        { name: 'Chapter 3: Atoms and Molecules', pdfPath: '/book/class 9th/science9/iesc1dd/iesc103.pdf', chapterNumber: 3 },
        { name: 'Chapter 4: Structure of the Atom', pdfPath: '/book/class 9th/science9/iesc1dd/iesc104.pdf', chapterNumber: 4 },
        { name: 'Chapter 5: The Fundamental Unit of Life (Cell)', pdfPath: '/book/class 9th/science9/iesc1dd/iesc105.pdf', chapterNumber: 5 },
        { name: 'Chapter 6: Tissues (Biology)', pdfPath: '/book/class 9th/science9/iesc1dd/iesc106.pdf', chapterNumber: 6 },
        { name: 'Chapter 7: Diversity in Living Organisms', pdfPath: '/book/class 9th/science9/iesc1dd/iesc107.pdf', chapterNumber: 7 },
        { name: 'Chapter 8: Motion (Physics)', pdfPath: '/book/class 9th/science9/iesc1dd/iesc108.pdf', chapterNumber: 8 },
        { name: 'Chapter 9: Force and Laws of Motion', pdfPath: '/book/class 9th/science9/iesc1dd/iesc109.pdf', chapterNumber: 9 },
        { name: 'Chapter 10: Gravitation', pdfPath: '/book/class 9th/science9/iesc1dd/iesc110.pdf', chapterNumber: 10 },
        { name: 'Chapter 11: Work and Energy', pdfPath: '/book/class 9th/science9/iesc1dd/iesc111.pdf', chapterNumber: 11 },
        { name: 'Chapter 12: Sound', pdfPath: '/book/class 9th/science9/iesc1dd/iesc112.pdf', chapterNumber: 12 },
        { name: 'Chapter 13: Improvement in Food Resources', pdfPath: '/book/class 9th/science9/iesc1dd/iesc113.pdf', chapterNumber: 13 },
        { name: 'Science Preliminary & Lab Notes', pdfPath: '/book/class 9th/science9/iesc1dd/iesc1ps.pdf' },
      ],
    },
    {
      id: 'book-eng-9',
      title: 'NCERT Beehive (English Class 9)',
      classGrade: 'Class 9',
      subjectId: 'sub-english',
      subjectName: 'English Class 9',
      folderPath: '/book/class 9th/English9/iebe1dd/',
      fileName: 'iebe101.pdf',
      fileUrl: '/book/class 9th/English9/iebe1dd/iebe101.pdf',
      fileSize: '36.8 MB (9 Chapters)',
      uploadedAt: '2026-08-30',
      chapterFiles: [
        { name: 'Chapter 1: The Fun They Had & The Road Not Taken', pdfPath: '/book/class 9th/English9/iebe1dd/iebe101.pdf', chapterNumber: 1 },
        { name: 'Chapter 2: The Sound of Music & Wind', pdfPath: '/book/class 9th/English9/iebe1dd/iebe102.pdf', chapterNumber: 2 },
        { name: 'Chapter 3: The Little Girl & Rain on the Roof', pdfPath: '/book/class 9th/English9/iebe1dd/iebe103.pdf', chapterNumber: 3 },
        { name: 'Chapter 4: A Truly Beautiful Mind & Innisfree', pdfPath: '/book/class 9th/English9/iebe1dd/iebe104.pdf', chapterNumber: 4 },
        { name: 'Chapter 5: The Snake and the Mirror & Northland', pdfPath: '/book/class 9th/English9/iebe1dd/iebe105.pdf', chapterNumber: 5 },
        { name: 'Chapter 6: My Childhood & No Men Are Foreign', pdfPath: '/book/class 9th/English9/iebe1dd/iebe106.pdf', chapterNumber: 6 },
        { name: 'Chapter 7: Reach for the Top & On Killing a Tree', pdfPath: '/book/class 9th/English9/iebe1dd/iebe107.pdf', chapterNumber: 7 },
        { name: 'Chapter 8: Kathmandu & A Slumber Did My Spirit Seal', pdfPath: '/book/class 9th/English9/iebe1dd/iebe108.pdf', chapterNumber: 8 },
        { name: 'Chapter 9: If I Were You (Play)', pdfPath: '/book/class 9th/English9/iebe1dd/iebe1a1.pdf', chapterNumber: 9 },
        { name: 'English Preliminary & Study Guide', pdfPath: '/book/class 9th/English9/iebe1dd/iebe1ps.pdf' },
      ],
    },
    {
      id: 'book-hin-9',
      title: 'NCERT Kshitij (Hindi Class 9)',
      classGrade: 'Class 9',
      subjectId: 'sub-hindi',
      subjectName: 'Hindi Class 9',
      folderPath: '/book/class 9th/hindi9/ihga1dd/',
      fileName: 'ihga101.pdf',
      fileUrl: '/book/class 9th/hindi9/ihga1dd/ihga101.pdf',
      fileSize: '29.5 MB (12 Chapters)',
      uploadedAt: '2026-08-30',
      chapterFiles: [
        { name: 'Chapter 1: Do Bailon Ki Katha (Premchand)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga101.pdf', chapterNumber: 1 },
        { name: 'Chapter 2: Lhasa Ki Aur (Rahul Sankrityayan)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga102.pdf', chapterNumber: 2 },
        { name: 'Chapter 3: Upbhoktavad Ki Sanskriti', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga103.pdf', chapterNumber: 3 },
        { name: 'Chapter 4: Sanwle Sapno Ki Yaad', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga104.pdf', chapterNumber: 4 },
        { name: 'Chapter 5: Premchand Ke Phate Joote (Harishankar Parsai)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga105.pdf', chapterNumber: 5 },
        { name: 'Chapter 6: Mere Bachpan Ke Din (Mahadevi Varma)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga106.pdf', chapterNumber: 6 },
        { name: 'Chapter 7: Sakhiyan Evam Sabad (Kabir)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga107.pdf', chapterNumber: 7 },
        { name: 'Chapter 8: Vaakh (Laldyad)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga108.pdf', chapterNumber: 8 },
        { name: 'Chapter 9: Savaiye (Raskhan)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga109.pdf', chapterNumber: 9 },
        { name: 'Chapter 10: Kaidi Aur Kokila (Makhanlal Chaturvedi)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga110.pdf', chapterNumber: 10 },
        { name: 'Chapter 11: Gram Shree (Sumitranandan Pant)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga111.pdf', chapterNumber: 11 },
        { name: 'Chapter 12: Megh Aaye (Sarveshwar Dayal Saxena)', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga112.pdf', chapterNumber: 12 },
        { name: 'Hindi Preliminary & Index', pdfPath: '/book/class 9th/hindi9/ihga1dd/ihga1ps.pdf' },
      ],
    },
    {
      id: 'book-sst-9',
      title: 'NCERT Contemporary India & Economics (SST Class 9)',
      classGrade: 'Class 9',
      subjectId: 'sub-sst',
      subjectName: 'Social Science Class 9',
      folderPath: '/book/class 9th/social science9/iest1dd/',
      fileName: 'iest101.pdf',
      fileUrl: '/book/class 9th/social science9/iest1dd/iest101.pdf',
      fileSize: '38.2 MB (9 Chapters)',
      uploadedAt: '2026-08-30',
      chapterFiles: [
        { name: 'Geo Chapter 1: India - Size and Location', pdfPath: '/book/class 9th/social science9/iest1dd/iest101.pdf', chapterNumber: 1 },
        { name: 'Geo Chapter 2: Physical Features of India', pdfPath: '/book/class 9th/social science9/iest1dd/iest102.pdf', chapterNumber: 2 },
        { name: 'Geo Chapter 3: Drainage', pdfPath: '/book/class 9th/social science9/iest1dd/iest103.pdf', chapterNumber: 3 },
        { name: 'Geo Chapter 4: Climate', pdfPath: '/book/class 9th/social science9/iest1dd/iest104.pdf', chapterNumber: 4 },
        { name: 'Geo Chapter 5: Natural Vegetation and Wildlife', pdfPath: '/book/class 9th/social science9/iest1dd/iest105.pdf', chapterNumber: 5 },
        { name: 'Geo Chapter 6: Population', pdfPath: '/book/class 9th/social science9/iest1dd/iest106.pdf', chapterNumber: 6 },
        { name: 'Econ Chapter 1: The Story of Village Palampur', pdfPath: '/book/class 9th/social science9/iest1dd/iest107.pdf', chapterNumber: 7 },
        { name: 'Econ Chapter 2: People as Resource', pdfPath: '/book/class 9th/social science9/iest1dd/iest108.pdf', chapterNumber: 8 },
        { name: 'Econ Chapter 3: Poverty as a Challenge', pdfPath: '/book/class 9th/social science9/iest1dd/iest109.pdf', chapterNumber: 9 },
        { name: 'Social Science Preliminary & Notes', pdfPath: '/book/class 9th/social science9/iest1dd/iest1ps.pdf' },
      ],
    },
  ],
};

// -------------------------------------------------------------
// CLASS 10 CURRICULUM & STUDY PLAN (BOARD EXAM YEAR)
// -------------------------------------------------------------
export const CLASS_10_SUBJECTS: Subject[] = [
  {
    id: 'c10-sub-english',
    name: 'English Class 10',
    code: 'ENG-184',
    color: '#f59e0b',
    icon: 'BookOpen',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 15,
    examDate: '2026-09-18',
    targetStudyHours: 28,
    completedStudyHours: 12,
    category: 'language',
  },
  {
    id: 'c10-sub-maths',
    name: 'Mathematics Class 10',
    code: 'MATH-041',
    color: '#6366f1',
    icon: 'Calculator',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 35,
    examDate: '2026-09-21',
    targetStudyHours: 65,
    completedStudyHours: 24,
    category: 'core',
  },
  {
    id: 'c10-sub-sst',
    name: 'Social Science Class 10',
    code: 'SST-087',
    color: '#ec4899',
    icon: 'Globe2',
    isWeak: false,
    weaknessLevel: 'medium',
    syllabusStatus: 'in_progress',
    priorityWeight: 15,
    examDate: '2026-09-23',
    targetStudyHours: 35,
    completedStudyHours: 11,
    category: 'core',
  },
  {
    id: 'c10-sub-science',
    name: 'Science Class 10',
    code: 'SCI-086',
    color: '#10b981',
    icon: 'Atom',
    isWeak: true,
    weaknessLevel: 'high',
    syllabusStatus: 'in_progress',
    priorityWeight: 25,
    examDate: '2026-09-25',
    targetStudyHours: 55,
    completedStudyHours: 20,
    category: 'core',
    subBranches: ['Physics', 'Chemistry', 'Biology'],
  },
  {
    id: 'c10-sub-hindi',
    name: 'Hindi / Sanskrit Class 10',
    code: 'HIN-002',
    color: '#f97316',
    icon: 'Languages',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 5,
    examDate: '2026-09-28',
    targetStudyHours: 16,
    completedStudyHours: 6,
    category: 'language',
  },
  {
    id: 'c10-sub-ai',
    name: 'Artificial Intelligence Class 10',
    code: 'AI-417',
    color: '#8b5cf6',
    icon: 'Bot',
    isWeak: false,
    weaknessLevel: 'low',
    syllabusStatus: 'in_progress',
    priorityWeight: 5,
    examDate: '2026-09-30',
    targetStudyHours: 14,
    completedStudyHours: 5,
    category: 'applied',
  },
];

export const CLASS_10_CHAPTERS: Chapter[] = [
  // English Class 10 (Exam Sep 18 - 1st exam for Class 10!)
  { id: 'c10-ch-e1', subjectId: 'c10-sub-english', name: 'A Letter to God & Dust of Snow', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 100, status: 'mastered', isMastered: true, questionsSolved: 20, targetQuestions: 20, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-04', revisionCount: 3, mistakesCount: 0, notes: 'Lencho faith vs irony of postmaster + Robert Frost symbolism.' },
  { id: 'c10-ch-e2', subjectId: 'c10-sub-english', name: 'Nelson Mandela: Long Walk to Freedom', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 18, targetQuestions: 22, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-05', revisionCount: 2, mistakesCount: 0, notes: 'Apartheid struggle, twin obligations, bravery quote.' },
  { id: 'c10-ch-e3', subjectId: 'c10-sub-english', name: 'Writing: Analytical Paragraph & Formal Letter', order: 3, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 15, targetQuestions: 20, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-03', revisionCount: 1, mistakesCount: 0, notes: 'Chart interpretation and Letter to Editor format.' },

  // Maths Class 10 (Exam Sep 21)
  { id: 'c10-ch-m1', subjectId: 'c10-sub-maths', name: 'Real Numbers', order: 1, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 90, status: 'practicing', isMastered: false, questionsSolved: 35, targetQuestions: 40, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-02', revisionCount: 2, mistakesCount: 0, notes: 'Fundamental Theorem of Arithmetic, proving sqrt(2), sqrt(3), sqrt(5) irrational.' },
  { id: 'c10-ch-m2', subjectId: 'c10-sub-maths', name: 'Polynomials', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 30, targetQuestions: 40, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-03', revisionCount: 2, mistakesCount: 0, notes: 'Sum of zeroes alpha+beta = -b/a, product alpha*beta = c/a.' },
  { id: 'c10-ch-m3', subjectId: 'c10-sub-maths', name: 'Pair of Linear Equations in Two Variables', order: 3, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 70, status: 'learning', isMastered: false, questionsSolved: 28, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 0, notes: 'Elimination method, consistent/inconsistent condition a1/a2!=b1/b2.' },
  { id: 'c10-ch-m4', subjectId: 'c10-sub-maths', name: 'Quadratic Equations', order: 4, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 65, status: 'learning', isMastered: false, questionsSolved: 25, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 0, notes: 'Discriminant D = b^2 - 4ac, nature of roots and word problems.' },
  { id: 'c10-ch-m5', subjectId: 'c10-sub-maths', name: 'Arithmetic Progressions (AP)', order: 5, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 80, status: 'practicing', isMastered: false, questionsSolved: 30, targetQuestions: 40, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-05', revisionCount: 1, mistakesCount: 0, notes: 'nth term a_n = a + (n-1)d and sum S_n = n/2 [2a + (n-1)d].' },
  { id: 'c10-ch-m6', subjectId: 'c10-sub-maths', name: 'Triangles (Similarity & BPT Theorem)', order: 6, difficulty: 'hard', confidenceLevel: 2, completionPercentage: 45, status: 'learning', isMastered: false, questionsSolved: 18, targetQuestions: 50, lastRevisedDate: null, nextRevisionDate: '2026-09-03', revisionCount: 0, mistakesCount: 0, notes: 'Basic Proportionality Theorem (Thales) proof and criteria.' },
  { id: 'c10-ch-m7', subjectId: 'c10-sub-maths', name: 'Introduction to Trigonometry', order: 7, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 60, status: 'learning', isMastered: false, questionsSolved: 22, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 0, notes: 'sin^2 theta + cos^2 theta = 1, values at 0, 30, 45, 60, 90 deg.' },

  // SST Class 10 (Exam Sep 23)
  { id: 'c10-ch-sst1', subjectId: 'c10-sub-sst', name: 'The Rise of Nationalism in Europe', order: 1, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 70, status: 'learning', isMastered: false, questionsSolved: 20, targetQuestions: 30, lastRevisedDate: null, nextRevisionDate: '2026-09-03', revisionCount: 1, mistakesCount: 0, notes: 'Frederic Sorrieu vision, French Rev ideas, Unification of Germany & Italy.' },
  { id: 'c10-ch-sst2', subjectId: 'c10-sub-sst', name: 'Resources and Development (Geo)', order: 2, difficulty: 'easy', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 22, targetQuestions: 25, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-06', revisionCount: 2, mistakesCount: 0, notes: 'Soil classification (Alluvial, Black, Red/Yellow, Laterite), conservation.' },
  { id: 'c10-ch-sst3', subjectId: 'c10-sub-sst', name: 'Power Sharing & Federalism (Civics)', order: 3, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 90, status: 'mastered', isMastered: true, questionsSolved: 25, targetQuestions: 25, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-08', revisionCount: 2, mistakesCount: 0, notes: 'Belgium vs Sri Lanka model, Union/State/Concurrent lists.' },

  // Science Class 10 (Exam Sep 25)
  { id: 'c10-ch-s1', subjectId: 'c10-sub-science', subBranch: 'Chemistry', name: 'Chemical Reactions and Equations', order: 1, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 85, status: 'practicing', isMastered: false, questionsSolved: 30, targetQuestions: 35, lastRevisedDate: '2026-08-27', nextRevisionDate: '2026-09-03', revisionCount: 2, mistakesCount: 0, notes: 'Balancing equations, redox, precipitation and corrosion.' },
  { id: 'c10-ch-s2', subjectId: 'c10-sub-science', subBranch: 'Chemistry', name: 'Acids, Bases and Salts', order: 2, difficulty: 'medium', confidenceLevel: 3, completionPercentage: 70, status: 'learning', isMastered: false, questionsSolved: 25, targetQuestions: 40, lastRevisedDate: null, nextRevisionDate: '2026-09-02', revisionCount: 1, mistakesCount: 0, notes: 'pH scale, Bleaching powder, Baking soda, Plaster of Paris.' },
  { id: 'c10-ch-s3', subjectId: 'c10-sub-science', subBranch: 'Biology', name: 'Life Processes', order: 3, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 65, status: 'learning', isMastered: false, questionsSolved: 28, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-04', revisionCount: 1, mistakesCount: 0, notes: 'Human heart circulation diagram, nephron excretion structure, respiration.' },
  { id: 'c10-ch-s4', subjectId: 'c10-sub-science', subBranch: 'Physics', name: 'Light: Reflection and Refraction', order: 4, difficulty: 'hard', confidenceLevel: 3, completionPercentage: 60, status: 'learning', isMastered: false, questionsSolved: 22, targetQuestions: 45, lastRevisedDate: null, nextRevisionDate: '2026-09-01', revisionCount: 1, mistakesCount: 0, notes: 'Mirror formula 1/v + 1/u = 1/f, Lens formula, ray diagrams and refractive index.' },

  // Hindi Class 10 (Exam Sep 28)
  { id: 'c10-ch-h1', subjectId: 'c10-sub-hindi', name: 'Netaji Ka Chashma & Surdas Ke Pad', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 90, status: 'mastered', isMastered: true, questionsSolved: 20, targetQuestions: 20, lastRevisedDate: '2026-08-25', nextRevisionDate: '2026-09-07', revisionCount: 2, mistakesCount: 0, notes: 'Patriotism theme, Captain chashmewala + Bhakti ras in Surdas.' },
  { id: 'c10-ch-h2', subjectId: 'c10-sub-hindi', name: 'Hindi Vyakaran: Padbandh, Vakya & Vachya', order: 2, difficulty: 'medium', confidenceLevel: 4, completionPercentage: 75, status: 'practicing', isMastered: false, questionsSolved: 18, targetQuestions: 25, lastRevisedDate: '2026-08-26', nextRevisionDate: '2026-09-06', revisionCount: 1, mistakesCount: 0, notes: 'Transformation of sentences and identifying padbandh types.' },

  // AI Class 10 (Exam Sep 30)
  { id: 'c10-ch-ai1', subjectId: 'c10-sub-ai', name: 'AI Project Cycle, Computer Vision & NLP', order: 1, difficulty: 'easy', confidenceLevel: 5, completionPercentage: 95, status: 'mastered', isMastered: true, questionsSolved: 25, targetQuestions: 25, lastRevisedDate: '2026-08-28', nextRevisionDate: '2026-09-12', revisionCount: 2, mistakesCount: 0, notes: 'Data science pipeline, pixel values, OpenCV basics & NLP tokenization.' },
];

export const CLASS_10_TASKS: StudyTask[] = [
  { id: 'c10-t1', title: 'English: A Letter to God Theme & Analytical Paragraph', subjectId: 'c10-sub-english', chapterId: 'c10-ch-e1', taskType: 'learning', estimatedMinutes: 45, scheduledDate: '2026-08-30', scheduledTime: '16:00', priority: 'high', priorityScore: 90, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c10-t2', title: 'Maths: Trigonometric Identities & Table Value Drills', subjectId: 'c10-sub-maths', chapterId: 'c10-ch-m7', taskType: 'practice', estimatedMinutes: 60, scheduledDate: '2026-08-30', scheduledTime: '17:00', priority: 'urgent', priorityScore: 96, status: 'pending', isAutoGenerated: true, orderIndex: 1 },
  { id: 'c10-t3', title: 'Science: Light Ray Diagrams & Lens Formula Numericals', subjectId: 'c10-sub-science', chapterId: 'c10-ch-s4', taskType: 'practice', estimatedMinutes: 55, scheduledDate: '2026-08-30', scheduledTime: '18:15', priority: 'urgent', priorityScore: 94, status: 'pending', isAutoGenerated: true, orderIndex: 2 },
  { id: 'c10-t4', title: 'Maths: Triangles BPT Proof & Ex 6.2 Application Problems', subjectId: 'c10-sub-maths', chapterId: 'c10-ch-m6', taskType: 'learning', estimatedMinutes: 60, scheduledDate: '2026-08-31', scheduledTime: '16:30', priority: 'urgent', priorityScore: 95, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c10-t5', title: 'English: Full Half-Yearly Board Style Mock 1', subjectId: 'c10-sub-english', taskType: 'mock_test', estimatedMinutes: 120, scheduledDate: '2026-09-15', scheduledTime: '10:00', priority: 'urgent', priorityScore: 98, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
  { id: 'c10-t6', title: 'English Eve: Active Recall Literature Characters & Formats', subjectId: 'c10-sub-english', taskType: 'active_recall', estimatedMinutes: 60, scheduledDate: '2026-09-17', scheduledTime: '16:30', priority: 'urgent', priorityScore: 100, status: 'pending', isAutoGenerated: true, orderIndex: 0 },
];

export const CLASS_10_CURRICULUM: ClassCurriculum = {
  classGrade: 'Class 10',
  subjects: CLASS_10_SUBJECTS,
  chapters: CLASS_10_CHAPTERS,
  exams: getGyanNiketanExamsForClass('Class 10'),
  tasks: CLASS_10_TASKS,
  revisions: [
    { id: 'c10-rev-1', subjectId: 'c10-sub-maths', chapterId: 'c10-ch-m7', stage: 1, dueDate: '2026-09-04', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-28', confidenceBefore: 3, notes: 'Trigonometric identities substitution shortcuts.' },
    { id: 'c10-rev-2', subjectId: 'c10-sub-science', chapterId: 'c10-ch-s4', stage: 1, dueDate: '2026-09-01', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-27', confidenceBefore: 3, notes: 'Sign convention Cartesian coordinate rules for mirrors and lenses.' },
    { id: 'c10-rev-3', subjectId: 'c10-sub-english', chapterId: 'c10-ch-e3', stage: 2, dueDate: '2026-09-03', intervalDays: 3, status: 'due', lastStudiedDate: '2026-08-26', confidenceBefore: 4, notes: 'Analytical paragraph comparison keywords.' },
  ],
  books: [
    { id: 'c10-bk-maths', title: 'NCERT Mathematics Class 10', classGrade: 'Class 10', subjectId: 'c10-sub-maths', subjectName: 'Mathematics Class 10', fileName: 'NCERT_Maths_Class10.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?jemh1=0-15', fileSize: '22.1 MB', uploadedAt: '2026-08-30' },
    { id: 'c10-bk-science', title: 'NCERT Science Class 10', classGrade: 'Class 10', subjectId: 'c10-sub-science', subjectName: 'Science Class 10', fileName: 'NCERT_Science_Class10.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?jesc1=0-16', fileSize: '26.8 MB', uploadedAt: '2026-08-30' },
    { id: 'c10-bk-english', title: 'NCERT First Flight (English Class 10)', classGrade: 'Class 10', subjectId: 'c10-sub-english', subjectName: 'English Class 10', fileName: 'NCERT_FirstFlight_Class10.pdf', fileUrl: 'https://ncert.nic.in/textbook.php?jeff1=0-11', fileSize: '14.9 MB', uploadedAt: '2026-08-30' },
  ],
};

// -------------------------------------------------------------
// CURRICULUM SELECTOR UTILITY
// -------------------------------------------------------------
export function getClassCurriculum(classGrade: string): ClassCurriculum {
  const normalized = classGrade?.trim();
  if (normalized === 'Class 7' || normalized === 'Grade 7') return CLASS_7_CURRICULUM;
  if (normalized === 'Class 8' || normalized === 'Grade 8') return CLASS_8_CURRICULUM;
  if (normalized === 'Class 10' || normalized === 'Grade 10') return CLASS_10_CURRICULUM;
  return CLASS_9_CURRICULUM;
}

export const CLASS_OPTIONS = [
  { id: 'Class 7', label: 'Class 7th (Middle School)', badge: 'Grade 7', firstExam: '17 Sep (English)', examCount: 6 },
  { id: 'Class 8', label: 'Class 8th (Middle School)', badge: 'Grade 8', firstExam: '18 Sep (Science)', examCount: 6 },
  { id: 'Class 9', label: 'Class 9th (Secondary Foundation)', badge: 'Grade 9', firstExam: '18 Sep (Maths)', examCount: 6 },
  { id: 'Class 10', label: 'Class 10th (CBSE Board Exam Year)', badge: 'Grade 10', firstExam: '18 Sep (English)', examCount: 6 },
];
