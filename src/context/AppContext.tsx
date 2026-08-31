import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { User } from 'firebase/auth';
import { soundSynth } from '../lib/audio';
import { calculateTaskPriorityScore, generateSuggestedPlan } from '../lib/plannerEngine';
import { createOrUpdateRevisionItem } from '../lib/spacedRepetition';
import { storage } from '../lib/storage';
import {
  auth,
  onAuthChange,
  loginWithEmail,
  registerWithEmail,
  loginWithGoogle,
  sendPasswordReset,
  logoutUser,
  saveUserDataToCloud,
  loadUserDataFromCloud,
} from '../lib/firebase';
import {
  CLASS_7_CURRICULUM,
  CLASS_8_CURRICULUM,
  CLASS_9_CURRICULUM,
  CLASS_10_CURRICULUM,
  getClassCurriculum,
} from '../data/classCurriculums';
import {
  DEFAULT_SUBJECTS,
  DEFAULT_CHAPTERS,
  DEFAULT_EXAMS,
  DEFAULT_USER,
  DEFAULT_BOOKS,
} from '../data/defaultData';
import { deletePdfFromStorage } from '../lib/pdfStorage';
import {
  AppState,
  BookDocument,
  Chapter,
  ErrorLog,
  Exam,
  InteractiveMockExam,
  MockTest,
  NavigationTab,
  RevisionItem,
  StudySessionLog,
  StudyTask,
  Subject,
  UserProfile,
} from '../types';

interface AppContextType {
  state: AppState;
  user: UserProfile;
  exams: Exam[];
  subjects: Subject[];
  chapters: Chapter[];
  tasks: StudyTask[];
  revisions: RevisionItem[];
  errorLogs: ErrorLog[];
  mockTests: MockTest[];
  sessionLogs: StudySessionLog[];
  books: BookDocument[];
  interactiveMocks: InteractiveMockExam[];
  activeView: NavigationTab;
  currentDate: string;
  activeFocusTask: StudyTask | null;
  isSidebarOpen: boolean;
  isSidebarCollapsed: boolean;
  isRightRailOpen: boolean;
  isAiConfiguring: boolean;
  setIsAiConfiguring: (val: boolean) => void;
  triggerAiConfiguration: (targetClass?: string) => void;
  
  // Firebase & Auth
  firebaseUser: User | null;
  cloudSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: 'signin' | 'signup' | 'reset') => void;
  closeAuthModal: () => void;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  signupWithEmailPassword: (email: string, pass: string, name: string, classGrade: string) => Promise<void>;
  loginGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;

  // Multi-Class Switching
  switchClassGrade: (classGrade: string, newName?: string, newExamName?: string) => void;

  // Navigation
  setActiveView: (tab: NavigationTab) => void;
  toggleSidebar: () => void;
  toggleSidebarCollapse: () => void;
  toggleRightRail: () => void;

  // Task Actions
  addTask: (task: Omit<StudyTask, 'id' | 'priorityScore' | 'orderIndex'>) => void;
  updateTask: (id: string, updates: Partial<StudyTask>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string, actualMinutes?: number) => void;
  skipTask: (id: string, reason?: string) => void;
  rescheduleTask: (id: string, newDate: string, newTime?: string) => void;
  reorderTasks: (newTasks: StudyTask[]) => void;
  generateAutoPlan: () => void;
  
  // Focus Actions
  startFocusSession: (task?: StudyTask) => void;
  completeFocusSession: (
    sessionLog: Omit<StudySessionLog, 'id' | 'timestamp'>,
    confidenceRating: 1 | 2 | 3 | 4 | 5
  ) => void;

  // Chapter Actions
  addChapter: (chapter: Omit<Chapter, 'id'>) => void;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  deleteChapter: (id: string) => void;
  setAllChapters: (chapters: Chapter[]) => void;
  updateChapterConfidence: (id: string, confidence: 1 | 2 | 3 | 4 | 5) => void;
  incrementQuestionsSolved: (id: string, count?: number) => void;

  // Subject Actions
  addSubject: (subject: Omit<Subject, 'id' | 'completedStudyHours'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;
  updateSubjectAllocations: (allocations: Record<string, number>) => void;

  // Exam Actions
  addExam: (exam: Omit<Exam, 'id'>) => void;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;

  // Revision Actions
  completeRevision: (revisionId: string, confidenceRating: 1 | 2 | 3 | 4 | 5) => void;

  // Error Actions
  addErrorLog: (error: Omit<ErrorLog, 'id'>) => void;
  updateErrorLog: (id: string, updates: Partial<ErrorLog>) => void;
  deleteErrorLog: (id: string) => void;
  incrementErrorOccurrence: (id: string) => void;

  // Mock Test Actions
  addMockTest: (mock: Omit<MockTest, 'id' | 'percentage'>) => void;
  deleteMockTest: (id: string) => void;

  // Books Actions
  addBook: (book: Omit<BookDocument, 'id' | 'uploadedAt'>) => void;
  updateBook: (id: string, updates: Partial<BookDocument>) => void;
  deleteBook: (id: string) => void;
  deleteBooksByClass: (classGrade: string) => void;
  deleteChapterFromBook: (bookId: string, chapterIndex: number) => void;
  restoreDefaultBooks: (classGrade?: string) => void;

  // Interactive Mock Exam Actions
  addInteractiveMock: (mock: InteractiveMockExam) => void;
  updateInteractiveMock: (id: string, updates: Partial<InteractiveMockExam>) => void;
  deleteInteractiveMock: (id: string) => void;

  // Settings & System
  updateUser: (updates: Partial<UserProfile>) => void;
  updateNvidiaConfig: (apiKey: string, model: string, baseUrl?: string) => void;
  resetToDefaultData: () => void;
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>(() => storage.loadState());
  const [activeFocusTask, setActiveFocusTask] = useState<StudyTask | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('apex_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });
  const [isRightRailOpen, setIsRightRailOpen] = useState(true);
  const [isAiConfiguring, setIsAiConfiguring] = useState(false);

  // Firebase Auth & Cloud Sync State
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('offline');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup' | 'reset'>('signin');
  const isInitialLoad = useRef(true);
  const cloudDebounceTimer = useRef<any>(null);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthChange(async (authUser) => {
      setFirebaseUser(authUser);
      if (authUser) {
        setCloudSyncStatus('syncing');
        try {
          const cloudData = await loadUserDataFromCloud(authUser.uid);
          if (cloudData) {
            setState(cloudData);
            storage.saveState(cloudData);
            setCloudSyncStatus('synced');
          } else {
            // New user account in Firebase: seed with initial state
            await saveUserDataToCloud(authUser.uid, state);
            setCloudSyncStatus('synced');
          }
        } catch (err) {
          console.warn('Failed to load cloud user data:', err);
          setCloudSyncStatus('error');
        }
      } else {
        setCloudSyncStatus('offline');
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state changes to storage & Firebase Realtime Database
  useEffect(() => {
    storage.saveState(state);

    if (firebaseUser && !isInitialLoad.current) {
      setCloudSyncStatus('syncing');
      if (cloudDebounceTimer.current) clearTimeout(cloudDebounceTimer.current);
      cloudDebounceTimer.current = setTimeout(async () => {
        const success = await saveUserDataToCloud(firebaseUser.uid, state);
        setCloudSyncStatus(success ? 'synced' : 'error');
      }, 1200);
    } else {
      isInitialLoad.current = false;
    }
  }, [state, firebaseUser]);

  // Sync sidebar collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('apex_sidebar_collapsed', String(isSidebarCollapsed));
    } catch {}
  }, [isSidebarCollapsed]);

  // Sync theme to root class
  useEffect(() => {
    if (state.user.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  }, [state.user.theme]);

  const setActiveView = (tab: NavigationTab) => {
    setState(prev => ({ ...prev, activeView: tab }));
    setIsSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const toggleSidebarCollapse = () => setIsSidebarCollapsed(prev => !prev);
  const toggleRightRail = () => setIsRightRailOpen(prev => !prev);

  // -------------------------------------------------------------
  // AUTHENTICATION METHODS
  // -------------------------------------------------------------
  const openAuthModal = (mode: 'signin' | 'signup' | 'reset' = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const loginWithEmailPassword = async (email: string, pass: string) => {
    await loginWithEmail(email, pass);
  };

  const signupWithEmailPassword = async (email: string, pass: string, name: string, classGrade: string) => {
    await registerWithEmail(email, pass, name, classGrade);
    switchClassGrade(classGrade, name);
  };

  const loginGoogle = async () => {
    const loggedUser = await loginWithGoogle();
    if (loggedUser?.displayName) {
      updateUser({ name: loggedUser.displayName, completedOnboarding: true });
    }
  };

  const logout = async () => {
    await logoutUser();
    setFirebaseUser(null);
    setCloudSyncStatus('offline');
  };

  const resetPassword = async (email: string) => {
    await sendPasswordReset(email);
  };

  // -------------------------------------------------------------
  // MULTI-CLASS SWITCHING ENGINE (Class 7th to 10th)
  // -------------------------------------------------------------
  const switchClassGrade = (classGrade: string, newName?: string, newExamName?: string) => {
    const curr = getClassCurriculum(classGrade);

    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        name: newName !== undefined && newName.trim() ? newName.trim() : prev.user.name,
        examName: newExamName !== undefined && newExamName.trim() ? newExamName.trim() : `${classGrade} Half-Yearly Exam 2026`,
        targetExamDate: curr.exams[0]?.date || '2026-09-18',
        classGrade,
        completedOnboarding: true,
      },
      subjects: curr.subjects,
      chapters: curr.chapters,
      exams: curr.exams,
      tasks: curr.tasks,
      revisions: curr.revisions,
      books: curr.books,
    }));
  };

  const triggerAiConfiguration = (targetClass?: string) => {
    const activeClass = targetClass || state.user.classGrade || 'Class 9';
    setIsAiConfiguring(true);
    switchClassGrade(activeClass);
  };

  // -------------------------------------------------------------
  // TASK ACTIONS
  // -------------------------------------------------------------
  const addTask = (taskData: Omit<StudyTask, 'id' | 'priorityScore' | 'orderIndex'>) => {
    const subject = state.subjects.find(s => s.id === taskData.subjectId);
    const chapter = state.chapters.find(c => c.id === taskData.chapterId);
    const priorityBreakdown = calculateTaskPriorityScore(taskData, subject, chapter, state.exams, state.currentDate);

    const newTask: StudyTask = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      priorityScore: priorityBreakdown.totalScore,
      orderIndex: state.tasks.length,
    };

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, newTask],
    }));

    if (state.user.soundEnabled) soundSynth.playChime('click');
  };

  const updateTask = (id: string, updates: Partial<StudyTask>) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => (t.id === id ? { ...t, ...updates } : t)),
    }));
  };

  const deleteTask = (id: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.filter(t => t.id !== id),
    }));
    if (state.user.soundEnabled) soundSynth.playChime('click');
  };

  const completeTask = (id: string, actualMinutes?: number) => {
    const task = state.tasks.find(t => t.id === id);
    if (!task) return;

    const timeSpent = actualMinutes ?? task.estimatedMinutes;
    const completedAt = new Date().toISOString();

    const newLog: StudySessionLog = {
      id: `sess-${Date.now()}`,
      taskId: task.id,
      subjectId: task.subjectId,
      chapterId: task.chapterId,
      durationMinutes: timeSpent,
      date: state.currentDate,
      timestamp: Date.now(),
      confidenceRating: 4,
      taskType: task.taskType,
      notes: `Completed task: ${task.title}`,
    };

    setState(prev => {
      const updatedTasks = prev.tasks.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'completed' as const,
              completedAt,
              actualMinutes: timeSpent,
            }
          : t
      );

      const updatedSubjects = prev.subjects.map(s =>
        s.id === task.subjectId
          ? {
              ...s,
              completedStudyHours: Number((s.completedStudyHours + timeSpent / 60).toFixed(1)),
            }
          : s
      );

      return {
        ...prev,
        tasks: updatedTasks,
        subjects: updatedSubjects,
        sessionLogs: [newLog, ...prev.sessionLogs],
      };
    });

    if (state.user.soundEnabled) soundSynth.playChime('complete');
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}
  };

  const skipTask = (id: string, reason?: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id ? { ...t, status: 'skipped', skippedReason: reason } : t
      ),
    }));
  };

  const rescheduleTask = (id: string, newDate: string, newTime?: string) => {
    setState(prev => ({
      ...prev,
      tasks: prev.tasks.map(t =>
        t.id === id
          ? {
              ...t,
              scheduledDate: newDate,
              scheduledTime: newTime ?? t.scheduledTime,
              status: 'pending',
            }
          : t
      ),
    }));
  };

  const reorderTasks = (newTasks: StudyTask[]) => {
    setState(prev => ({
      ...prev,
      tasks: newTasks.map((t, idx) => ({ ...t, orderIndex: idx })),
    }));
  };

  const generateAutoPlan = () => {
    const suggestedProposals = generateSuggestedPlan(
      state.subjects,
      state.chapters,
      state.exams,
      state.user,
      state.currentDate
    );

    const convertedTasks: StudyTask[] = suggestedProposals.map((prop, idx) => ({
      id: `task-auto-${Date.now()}-${idx}`,
      title: prop.title,
      subjectId: prop.subjectId,
      chapterId: prop.chapterId,
      taskType: prop.taskType,
      estimatedMinutes: prop.estimatedMinutes,
      priority: prop.priority,
      priorityScore: prop.priorityScore,
      scheduledDate: state.currentDate,
      status: 'pending',
      isAutoGenerated: true,
      notes: prop.notes,
      orderIndex: state.tasks.length + idx,
    }));

    setState(prev => ({
      ...prev,
      tasks: [...prev.tasks, ...convertedTasks],
    }));

    if (state.user.soundEnabled) soundSynth.playChime('complete');
  };

  // -------------------------------------------------------------
  // FOCUS SESSION ACTIONS
  // -------------------------------------------------------------
  const startFocusSession = (task?: StudyTask) => {
    setActiveFocusTask(task || null);
    setActiveView('focus');
  };

  const completeFocusSession = (
    sessionLog: Omit<StudySessionLog, 'id' | 'timestamp'>,
    confidenceRating: 1 | 2 | 3 | 4 | 5
  ) => {
    const newLog: StudySessionLog = {
      ...sessionLog,
      id: `sess-${Date.now()}`,
      timestamp: Date.now(),
      confidenceRating,
    };

    setState(prev => {
      const updatedSubjects = prev.subjects.map(s =>
        s.id === sessionLog.subjectId
          ? {
              ...s,
              completedStudyHours: Number(
                (s.completedStudyHours + sessionLog.durationMinutes / 60).toFixed(1)
              ),
            }
          : s
      );

      let updatedChapters = prev.chapters;
      let updatedRevisions = prev.revisions;

      if (sessionLog.chapterId) {
        const targetChapter = prev.chapters.find(c => c.id === sessionLog.chapterId);
        if (targetChapter) {
          const revResult = createOrUpdateRevisionItem(
            targetChapter,
            confidenceRating,
            sessionLog.date
          );

          updatedChapters = prev.chapters.map(c =>
            c.id === targetChapter.id ? revResult.updatedChapter : c
          );

          const existingRevIndex = prev.revisions.findIndex(r => r.chapterId === targetChapter.id);
          if (existingRevIndex >= 0) {
            updatedRevisions = prev.revisions.map((r, i) =>
              i === existingRevIndex ? revResult.newRevision : r
            );
          } else {
            updatedRevisions = [...prev.revisions, revResult.newRevision];
          }
        }
      }

      return {
        ...prev,
        sessionLogs: [newLog, ...prev.sessionLogs],
        subjects: updatedSubjects,
        chapters: updatedChapters,
        revisions: updatedRevisions,
      };
    });

    setActiveFocusTask(null);
    if (state.user.soundEnabled) soundSynth.playChime('complete');
    try {
      confetti({ particleCount: 80, spread: 70 });
    } catch {}
  };

  // -------------------------------------------------------------
  // CHAPTER ACTIONS
  // -------------------------------------------------------------
  const addChapter = (chapterData: Omit<Chapter, 'id'>) => {
    const newChapter: Chapter = {
      ...chapterData,
      id: `ch-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      chapters: [...prev.chapters, newChapter],
    }));
  };

  const updateChapter = (id: string, updates: Partial<Chapter>) => {
    setState(prev => ({
      ...prev,
      chapters: prev.chapters.map(c => (c.id === id ? { ...c, ...updates } : c)),
    }));
  };

  const setAllChapters = (newChapters: Chapter[]) => {
    setState(prev => ({
      ...prev,
      chapters: newChapters,
    }));
    if (state.user.soundEnabled) soundSynth.playChime('complete');
  };

  const deleteChapter = (id: string) => {
    setState(prev => ({
      ...prev,
      chapters: prev.chapters.filter(c => c.id !== id),
      tasks: prev.tasks.filter(t => t.chapterId !== id),
      revisions: prev.revisions.filter(r => r.chapterId !== id),
    }));
  };

  const updateChapterConfidence = (id: string, confidence: 1 | 2 | 3 | 4 | 5) => {
    const chapter = state.chapters.find(c => c.id === id);
    if (!chapter) return;

    setState(prev => {
      const revResult = createOrUpdateRevisionItem(chapter, confidence, state.currentDate);

      const updatedChapters = prev.chapters.map(c =>
        c.id === id ? revResult.updatedChapter : c
      );

      const existingRevIndex = prev.revisions.findIndex(r => r.chapterId === id);
      const updatedRevisions =
        existingRevIndex >= 0
          ? prev.revisions.map((r, i) => (i === existingRevIndex ? revResult.newRevision : r))
          : [...prev.revisions, revResult.newRevision];

      return {
        ...prev,
        chapters: updatedChapters,
        revisions: updatedRevisions,
      };
    });
  };

  const incrementQuestionsSolved = (id: string, count = 1) => {
    setState(prev => ({
      ...prev,
      chapters: prev.chapters.map(c =>
        c.id === id ? { ...c, questionsSolved: c.questionsSolved + count } : c
      ),
    }));
  };

  // -------------------------------------------------------------
  // SUBJECT ACTIONS
  // -------------------------------------------------------------
  const addSubject = (subjectData: Omit<Subject, 'id' | 'completedStudyHours'>) => {
    const newSubject: Subject = {
      ...subjectData,
      id: `sub-${Date.now()}`,
      completedStudyHours: 0,
    };
    setState(prev => ({
      ...prev,
      subjects: [...prev.subjects, newSubject],
    }));
  };

  const updateSubject = (id: string, updates: Partial<Subject>) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.map(s => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const deleteSubject = (id: string) => {
    setState(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== id),
      chapters: prev.chapters.filter(c => c.subjectId !== id),
      tasks: prev.tasks.filter(t => t.subjectId !== id),
      exams: prev.exams.filter(e => e.subjectId !== id),
    }));
  };

  const updateSubjectAllocations = (allocations: Record<string, number>) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        studyPreference: {
          ...prev.user.studyPreference,
          subjectAllocation: allocations,
        },
      },
    }));
  };

  // -------------------------------------------------------------
  // EXAM ACTIONS
  // -------------------------------------------------------------
  const addExam = (examData: Omit<Exam, 'id'>) => {
    const newExam: Exam = {
      ...examData,
      id: `exam-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      exams: [...prev.exams, newExam],
    }));
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteExam = (id: string) => {
    setState(prev => ({
      ...prev,
      exams: prev.exams.filter(e => e.id !== id),
    }));
  };

  // -------------------------------------------------------------
  // REVISION ACTIONS
  // -------------------------------------------------------------
  const completeRevision = (revisionId: string, confidenceRating: 1 | 2 | 3 | 4 | 5) => {
    const rev = state.revisions.find(r => r.id === revisionId);
    if (!rev) return;

    const chapter = state.chapters.find(c => c.id === rev.chapterId);
    if (!chapter) return;

    setState(prev => {
      const revResult = createOrUpdateRevisionItem(chapter, confidenceRating, state.currentDate);

      return {
        ...prev,
        revisions: prev.revisions.map(r => (r.id === revisionId ? revResult.newRevision : r)),
        chapters: prev.chapters.map(c =>
          c.id === rev.chapterId ? revResult.updatedChapter : c
        ),
      };
    });

    if (state.user.soundEnabled) soundSynth.playChime('complete');
  };

  // -------------------------------------------------------------
  // ERROR NOTEBOOK ACTIONS
  // -------------------------------------------------------------
  const addErrorLog = (errorData: Omit<ErrorLog, 'id'>) => {
    const newError: ErrorLog = {
      ...errorData,
      id: `err-${Date.now()}`,
    };
    setState(prev => ({
      ...prev,
      errorLogs: [newError, ...prev.errorLogs],
    }));
    if (state.user.soundEnabled) soundSynth.playChime('click');
  };

  const updateErrorLog = (id: string, updates: Partial<ErrorLog>) => {
    setState(prev => ({
      ...prev,
      errorLogs: prev.errorLogs.map(e => (e.id === id ? { ...e, ...updates } : e)),
    }));
  };

  const deleteErrorLog = (id: string) => {
    setState(prev => ({
      ...prev,
      errorLogs: prev.errorLogs.filter(e => e.id !== id),
    }));
  };

  const incrementErrorOccurrence = (id: string) => {
    setState(prev => ({
      ...prev,
      errorLogs: prev.errorLogs.map(e =>
        e.id === id ? { ...e, occurrenceCount: (e.occurrenceCount || 1) + 1 } : e
      ),
    }));
  };

  // -------------------------------------------------------------
  // MOCK TEST ACTIONS
  // -------------------------------------------------------------
  const addMockTest = (mockData: Omit<MockTest, 'id' | 'percentage'>) => {
    const percentage = Math.round((mockData.score / mockData.totalMarks) * 100);
    const newMock: MockTest = {
      ...mockData,
      id: `mock-${Date.now()}`,
      percentage,
    };
    setState(prev => ({
      ...prev,
      mockTests: [newMock, ...prev.mockTests],
    }));
    if (state.user.soundEnabled) soundSynth.playChime('complete');
  };

  const deleteMockTest = (id: string) => {
    setState(prev => ({
      ...prev,
      mockTests: prev.mockTests.filter(m => m.id !== id),
    }));
  };

  // -------------------------------------------------------------
  // BOOK READER ACTIONS
  // -------------------------------------------------------------
  const addBook = (bookData: Omit<BookDocument, 'id' | 'uploadedAt'>) => {
    const newBook: BookDocument = {
      ...bookData,
      id: `book-${Date.now()}`,
      classGrade: bookData.classGrade || state.user.classGrade || 'Class 9',
      uploadedAt: state.currentDate,
    };
    setState(prev => ({
      ...prev,
      books: [newBook, ...(prev.books || [])],
    }));
    if (state.user.soundEnabled) soundSynth.playChime('click');
  };

  const updateBook = (id: string, updates: Partial<BookDocument>) => {
    setState(prev => ({
      ...prev,
      books: (prev.books || []).map(b => (b.id === id ? { ...b, ...updates } : b)),
    }));
  };

  const deleteBook = (id: string) => {
    setState(prev => {
      const targetBook = (prev.books || []).find(b => b.id === id);
      if (targetBook?.chapterFiles) {
        targetBook.chapterFiles.forEach(ch => {
          if (ch.pdfPath?.startsWith('idb://')) {
            deletePdfFromStorage(ch.pdfPath);
          }
        });
      }
      return {
        ...prev,
        books: (prev.books || []).filter(b => b.id !== id),
      };
    });
    if (state.user.soundEnabled) soundSynth.playChime('click');
  };

  const deleteBooksByClass = (classGrade: string) => {
    setState(prev => {
      const remainingBooks = (prev.books || []).filter(b => {
        const isMatch = classGrade === 'all' || b.classGrade === classGrade;
        if (isMatch) {
          if (b.chapterFiles) {
            b.chapterFiles.forEach(ch => {
              if (ch.pdfPath?.startsWith('idb://')) {
                deletePdfFromStorage(ch.pdfPath);
              }
            });
          }
          return false;
        }
        return true;
      });
      return {
        ...prev,
        books: remainingBooks,
      };
    });
    if (state.user.soundEnabled) soundSynth.playChime('complete');
  };

  const deleteChapterFromBook = (bookId: string, chapterIndex: number) => {
    setState(prev => ({
      ...prev,
      books: (prev.books || []).map(b => {
        if (b.id !== bookId) return b;
        const targetCh = b.chapterFiles?.[chapterIndex];
        if (targetCh?.pdfPath?.startsWith('idb://')) {
          deletePdfFromStorage(targetCh.pdfPath);
        }
        const newChapters = (b.chapterFiles || []).filter((_, idx) => idx !== chapterIndex);
        return {
          ...b,
          chapterFiles: newChapters,
          fileUrl: newChapters[0]?.pdfPath || b.fileUrl,
        };
      }),
    }));
    if (state.user.soundEnabled) soundSynth.playChime('click');
  };

  const restoreDefaultBooks = (classGrade?: string) => {
    setState(prev => {
      const defaultsToAdd = classGrade && classGrade !== 'all'
        ? DEFAULT_BOOKS.filter(db => db.classGrade === classGrade)
        : DEFAULT_BOOKS;
      const existingIds = new Set((prev.books || []).map(b => b.id));
      const newItems = defaultsToAdd.filter(db => !existingIds.has(db.id));
      return {
        ...prev,
        books: [...(prev.books || []), ...newItems],
      };
    });
    if (state.user.soundEnabled) soundSynth.playChime('complete');
  };

  // -------------------------------------------------------------
  // INTERACTIVE MOCK EXAM ACTIONS
  // -------------------------------------------------------------
  const addInteractiveMock = (mock: InteractiveMockExam) => {
    setState(prev => ({
      ...prev,
      interactiveMocks: [mock, ...(prev.interactiveMocks || [])],
    }));
  };

  const updateInteractiveMock = (id: string, updates: Partial<InteractiveMockExam>) => {
    setState(prev => ({
      ...prev,
      interactiveMocks: (prev.interactiveMocks || []).map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  };

  const deleteInteractiveMock = (id: string) => {
    setState(prev => ({
      ...prev,
      interactiveMocks: (prev.interactiveMocks || []).filter(m => m.id !== id),
    }));
  };

  // -------------------------------------------------------------
  // USER & SYSTEM SETTINGS
  // -------------------------------------------------------------
  const updateUser = (updates: Partial<UserProfile>) => {
    setState(prev => ({
      ...prev,
      user: { ...prev.user, ...updates },
    }));
  };

  const updateNvidiaConfig = (apiKey: string, model: string, baseUrl?: string) => {
    setState(prev => ({
      ...prev,
      user: {
        ...prev.user,
        nvidiaApiKey: apiKey.trim(),
        nvidiaModel: model.trim(),
        nvidiaBaseUrl: baseUrl?.trim(),
      },
    }));
  };

  const resetToDefaultData = () => {
    const fresh = storage.resetState();
    setState(fresh);
  };

  const exportDataJSON = () => {
    return storage.exportBackup(state);
  };

  const importDataJSON = (jsonString: string): boolean => {
    try {
      const imported = storage.importBackup(jsonString);
      setState(imported);
      if (firebaseUser) {
        saveUserDataToCloud(firebaseUser.uid, imported);
      }
      return true;
    } catch {
      return false;
    }
  };

  const toggleTheme = () => {
    const newTheme = state.user.theme === 'dark' ? 'light' : 'dark';
    updateUser({ theme: newTheme });
  };

  const toggleSound = () => {
    updateUser({ soundEnabled: !state.user.soundEnabled });
  };

  return (
    <AppContext.Provider
      value={{
        state,
        user: state.user,
        exams: state.exams,
        subjects: state.subjects,
        chapters: state.chapters,
        tasks: state.tasks,
        revisions: state.revisions,
        errorLogs: state.errorLogs,
        mockTests: state.mockTests,
        sessionLogs: state.sessionLogs,
        books: state.books || [],
        interactiveMocks: state.interactiveMocks || [],
        activeView: state.activeView,
        currentDate: state.currentDate,
        activeFocusTask,
        isSidebarOpen,
        isSidebarCollapsed,
        isRightRailOpen,
        isAiConfiguring,
        setIsAiConfiguring,
        triggerAiConfiguration,
        firebaseUser,
        cloudSyncStatus,
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        loginWithEmailPassword,
        signupWithEmailPassword,
        loginGoogle,
        logout,
        resetPassword,
        switchClassGrade,
        setActiveView,
        toggleSidebar,
        toggleSidebarCollapse,
        toggleRightRail,
        addTask,
        updateTask,
        deleteTask,
        completeTask,
        skipTask,
        rescheduleTask,
        reorderTasks,
        generateAutoPlan,
        startFocusSession,
        completeFocusSession,
        addChapter,
        updateChapter,
        deleteChapter,
        setAllChapters,
        updateChapterConfidence,
        incrementQuestionsSolved,
        addSubject,
        updateSubject,
        deleteSubject,
        updateSubjectAllocations,
        addExam,
        updateExam,
        deleteExam,
        completeRevision,
        addErrorLog,
        updateErrorLog,
        deleteErrorLog,
        incrementErrorOccurrence,
        addMockTest,
        deleteMockTest,
        addBook,
        updateBook,
        deleteBook,
        deleteBooksByClass,
        deleteChapterFromBook,
        restoreDefaultBooks,
        addInteractiveMock,
        updateInteractiveMock,
        deleteInteractiveMock,
        updateUser,
        updateNvidiaConfig,
        resetToDefaultData,
        exportDataJSON,
        importDataJSON,
        toggleTheme,
        toggleSound,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
