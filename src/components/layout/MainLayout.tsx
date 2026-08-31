import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopRightRail } from './DesktopRightRail';
import { MobileHeader } from './MobileHeader';
import { MobileBottomNav } from './MobileBottomNav';

// Views
import { DashboardView } from '../views/DashboardView';
import { PlanView } from '../views/PlanView';
import { CalendarView } from '../views/CalendarView';
import { SubjectsView } from '../views/SubjectsView';
import { ChaptersView } from '../views/ChaptersView';
import { RevisionView } from '../views/RevisionView';
import { ErrorNotebookView } from '../views/ErrorNotebookView';
import { MockTestsView } from '../views/MockTestsView';
import { AnalyticsView } from '../views/AnalyticsView';
import { FocusModeView } from '../views/FocusModeView';
import { ExamScheduleView } from '../views/ExamScheduleView';
import { BookReaderView } from '../views/BookReaderView';
import { AiTutorView } from '../views/AiTutorView';

// Modals
import { AddTaskModal } from '../modals/AddTaskModal';
import { AddErrorModal } from '../modals/AddErrorModal';
import { LogMockModal } from '../modals/LogMockModal';
import { ChapterDetailModal } from '../modals/ChapterDetailModal';
import { SubjectDetailModal } from '../modals/SubjectDetailModal';
import { ActiveRecallModal } from '../modals/ActiveRecallModal';
import { SettingsModal } from '../modals/SettingsModal';
import { OnboardingWizard } from '../modals/OnboardingWizard';
import { AuthModal } from '../modals/AuthModal';
import { AiConfigLoader } from '../modals/AiConfigLoader';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Subject } from '../../types';

export const MainLayout: React.FC = () => {
  const {
    activeView,
    setActiveView,
    chapters,
    isSidebarOpen,
    toggleSidebar,
    toggleSidebarCollapse,
    isAuthModalOpen,
    closeAuthModal,
    isAiConfiguring,
    setIsAiConfiguring,
    user,
  } = useApp();

  // Global Modals State
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddErrorOpen, setIsAddErrorOpen] = useState(false);
  const [isLogMockOpen, setIsLogMockOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const [activeRecallChapterId, setActiveRecallChapterId] = useState<string | null>(null);
  const [activeDetailChapterId, setActiveDetailChapterId] = useState<string | null>(null);
  const [activeDetailSubject, setActiveDetailSubject] = useState<Subject | null>(null);

  // Initialize Native Android Status Bar & Splash Screen
  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
      StatusBar.setBackgroundColor({ color: '#030712' }).catch(() => {});
      SplashScreen.hide().catch(() => {});
    }
  }, []);

  // Native Android Hardware Back Button Handling
  React.useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const backListenerPromise = CapacitorApp.addListener('backButton', () => {
      if (isAddTaskOpen) {
        setIsAddTaskOpen(false);
      } else if (isAddErrorOpen) {
        setIsAddErrorOpen(false);
      } else if (isLogMockOpen) {
        setIsLogMockOpen(false);
      } else if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (isOnboardingOpen) {
        setIsOnboardingOpen(false);
      } else if (isAuthModalOpen) {
        closeAuthModal();
      } else if (activeRecallChapterId) {
        setActiveRecallChapterId(null);
      } else if (activeDetailChapterId) {
        setActiveDetailChapterId(null);
      } else if (activeDetailSubject) {
        setActiveDetailSubject(null);
      } else if (isSidebarOpen) {
        toggleSidebar();
      } else if (activeView !== 'dashboard') {
        setActiveView('dashboard');
      } else {
        CapacitorApp.exitApp();
      }
    });

    return () => {
      backListenerPromise.then(handle => handle.remove()).catch(() => {});
    };
  }, [
    isAddTaskOpen,
    isAddErrorOpen,
    isLogMockOpen,
    isSettingsOpen,
    isOnboardingOpen,
    isAuthModalOpen,
    closeAuthModal,
    activeRecallChapterId,
    activeDetailChapterId,
    activeDetailSubject,
    isSidebarOpen,
    toggleSidebar,
    activeView,
    setActiveView,
  ]);

  // Keyboard shortcut Ctrl+B / Cmd+B to toggle sidebar collapse
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
        e.preventDefault();
        toggleSidebarCollapse();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebarCollapse]);

  const selectedChapter = activeDetailChapterId
    ? chapters.find(c => c.id === activeDetailChapterId) || null
    : null;

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Mobile Top Navigation Header */}
      <MobileHeader />

      {/* Desktop App Shell Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Desktop permanent, Mobile Drawer) */}
        <div
          className={`fixed inset-y-0 left-0 z-50 lg:static lg:z-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <DesktopSidebar />
        </div>

        {/* Mobile Sidebar Overlay Backdrop */}
        {isSidebarOpen && (
          <div
            onClick={toggleSidebar}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}

        {/* Center Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar h-[calc(100vh-3.5rem)] lg:h-screen p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
          {activeView === 'dashboard' && (
            <DashboardView
              onOpenAddTask={() => setIsAddTaskOpen(true)}
              onOpenAddError={() => setIsAddErrorOpen(true)}
              onOpenActiveRecall={id => setActiveRecallChapterId(id)}
              onOpenChapterDetail={id => setActiveDetailChapterId(id)}
            />
          )}

          {activeView === 'plan' && (
            <PlanView onOpenAddTask={() => setIsAddTaskOpen(true)} />
          )}

          {activeView === 'ai-tutor' && <AiTutorView />}

          {activeView === 'books' && <BookReaderView />}

          {activeView === 'calendar' && (
            <CalendarView onOpenAddTask={() => setIsAddTaskOpen(true)} />
          )}

          {activeView === 'subjects' && (
            <SubjectsView
              onOpenAddSubject={() => {
                setActiveDetailSubject(null);
                setIsSettingsOpen(true);
              }}
              onOpenSubjectDetail={sub => setActiveDetailSubject(sub)}
              onOpenChapterDetail={id => setActiveDetailChapterId(id)}
            />
          )}

          {activeView === 'chapters' && (
            <ChaptersView
              onOpenChapterDetail={id => setActiveDetailChapterId(id)}
              onOpenActiveRecall={id => setActiveRecallChapterId(id)}
            />
          )}

          {activeView === 'revision' && (
            <RevisionView onOpenActiveRecall={id => setActiveRecallChapterId(id)} />
          )}

          {activeView === 'errors' && (
            <ErrorNotebookView onOpenAddError={() => setIsAddErrorOpen(true)} />
          )}

          {activeView === 'mocks' && (
            <MockTestsView onOpenLogMock={() => setIsLogMockOpen(true)} />
          )}

          {activeView === 'analytics' && <AnalyticsView />}

          {activeView === 'focus' && <FocusModeView />}

          {activeView === 'exams' && <ExamScheduleView />}

          {activeView === 'settings' && (
            <SettingsModal
              isOpen={true}
              onClose={() => setActiveView('dashboard')}
              onOpenOnboarding={() => {
                setActiveView('dashboard');
                setIsOnboardingOpen(true);
              }}
            />
          )}
        </main>

        {/* Right Contextual Rail (Desktop Only) */}
        <DesktopRightRail
          onOpenAddErrorModal={() => setIsAddErrorOpen(true)}
          onOpenActiveRecallModal={(id: string) => setActiveRecallChapterId(id)}
        />
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav />

      {/* Global Interactive Modals */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
      />

      <AddErrorModal
        isOpen={isAddErrorOpen}
        onClose={() => setIsAddErrorOpen(false)}
      />

      <LogMockModal
        isOpen={isLogMockOpen}
        onClose={() => setIsLogMockOpen(false)}
      />

      <ChapterDetailModal
        chapter={selectedChapter}
        isOpen={!!selectedChapter}
        onClose={() => setActiveDetailChapterId(null)}
        onOpenActiveRecall={id => {
          setActiveDetailChapterId(null);
          setActiveRecallChapterId(id);
        }}
      />

      <SubjectDetailModal
        subject={activeDetailSubject}
        isOpen={!!activeDetailSubject}
        onClose={() => setActiveDetailSubject(null)}
      />

      <ActiveRecallModal
        chapterId={activeRecallChapterId}
        isOpen={!!activeRecallChapterId}
        onClose={() => setActiveRecallChapterId(null)}
      />

      {activeView !== 'settings' && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onOpenOnboarding={() => {
            setIsSettingsOpen(false);
            setIsOnboardingOpen(true);
          }}
        />
      )}

      <OnboardingWizard
        isOpen={isOnboardingOpen || !user.completedOnboarding}
        onClose={() => setIsOnboardingOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
      />

      <AiConfigLoader
        isOpen={isAiConfiguring}
        classGrade={user.classGrade || 'Class 9'}
        studentName={user.name}
        onComplete={() => setIsAiConfiguring(false)}
      />
    </div>
  );
};
