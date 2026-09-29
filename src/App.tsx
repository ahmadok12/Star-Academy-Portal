import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import { MainLayout } from './components/layout/MainLayout';
import { NavTab } from './components/layout/Sidebar';
import { StandaloneApp } from './components/layout/Header';
import { LoginPage } from './features/auth/LoginPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { AcademicYearsPage } from './features/academic-years/AcademicYearsPage';
import { ClassesPage } from './features/classes/ClassesPage';
import { SectionsPage } from './features/sections/SectionsPage';
import { BatchesPage } from './features/batches/BatchesPage';
import { ClassSectionsPage } from './features/class-sections/ClassSectionsPage';
import { SubjectsPage } from './features/subjects/SubjectsPage';
import { ClassSubjectsPage } from './features/class-subjects/ClassSubjectsPage';
import { AcademySettingsPage } from './features/settings/AcademySettingsPage';
import { StudentInquiriesPage } from './features/students/StudentInquiriesPage';
import { StudentAdmissionPage } from './features/students/StudentAdmissionPage';
import { StudentsDirectoryPage } from './features/students/StudentsDirectoryPage';
import { StudentPromotionPage } from './features/students/StudentPromotionPage';
import { StaffDirectoryPage } from './features/staff/StaffDirectoryPage';
import { TeacherAssignmentsPage } from './features/staff/TeacherAssignmentsPage';
import { TimetablePage } from './features/timetable/TimetablePage';
import { AttendancePage } from './features/attendance/AttendancePage';
import { TeacherPortalPage } from './features/teacher-portal/TeacherPortalPage';
import { StudentPortalPage } from './features/student-portal/StudentPortalPage';
import { ParentPortalPage } from './features/parent-portal/ParentPortalPage';
import { ExamsAndContentPage } from './features/exams/ExamsAndContentPage';
import { FeesPage } from './features/fees/FeesPage';
import { FinancePage } from './features/finance/FinancePage';
import { ReportsPage } from './features/reports/ReportsPage';
import { MobileAdminReportsPage } from './features/mobile-admin/MobileAdminReportsPage';
import { databaseService } from './lib/database-service';
import { AcademySettings, StudentInquiry } from './types/database.types';

export type ActiveApp = 'admin' | StandaloneApp;

const getInitialApp = (): ActiveApp => {
  const params = new URLSearchParams(window.location.search);
  const app = params.get('app');
  if (app === 'teacher' || app === 'student' || app === 'parent' || app === 'mobile-admin') {
    return app;
  }
  return 'admin';
};

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [activeApp, setActiveApp] = useState<ActiveApp>(getInitialApp);
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<AcademySettings | null>(null);
  const [prefilledInquiry, setPrefilledInquiry] = useState<StudentInquiry | null>(null);

  // Sync with browser URL navigation
  useEffect(() => {
    const onPopState = () => {
      setActiveApp(getInitialApp());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const switchApp = (app: ActiveApp) => {
    setActiveApp(app);
    const url = new URL(window.location.href);
    if (app === 'admin') {
      url.searchParams.delete('app');
    } else {
      url.searchParams.set('app', app);
    }
    window.history.pushState({}, '', url.toString());
  };

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const s = await databaseService.getAcademySettings();
        setSettings(s);
      } catch (e) {
        console.error('Failed to load settings:', e);
      }
    };
    fetchSettings();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#ECEEF2] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg animate-pulse">
            ★
          </div>
          <p className="text-xs font-semibold text-slate-500">Loading Star Academy ERP...</p>
        </div>
      </div>
    );
  }

  // Standalone Mobile Portals (Can be accessed directly or with auth)
  if (activeApp !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F0F2F5] text-slate-800 flex flex-col font-sans antialiased">
        {/* Standalone Top Bar for Mobile App View */}
        <header className="bg-slate-900 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 shadow-sm shrink-0">
          <div className="flex items-center space-x-2.5">
            <button
              onClick={() => switchApp('admin')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition shadow-xs"
            >
              <span>&larr; Admin ERP</span>
            </button>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-white tracking-wide">
                {activeApp === 'teacher' && 'Teacher Mobile Portal'}
                {activeApp === 'student' && 'Student Mobile Portal'}
                {activeApp === 'parent' && 'Parent Mobile Portal'}
                {activeApp === 'mobile-admin' && 'Executive Mobile Reports App'}
              </span>
            </div>
          </div>

          {/* Quick Switcher for Testing/Demoing All Client Apps */}
          <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-xl text-[11px] font-semibold">
            <button
              onClick={() => switchApp('teacher')}
              className={`px-2 py-0.5 rounded-lg transition ${
                activeApp === 'teacher' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Teacher
            </button>
            <button
              onClick={() => switchApp('student')}
              className={`px-2 py-0.5 rounded-lg transition ${
                activeApp === 'student' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Student
            </button>
            <button
              onClick={() => switchApp('parent')}
              className={`px-2 py-0.5 rounded-lg transition ${
                activeApp === 'parent' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Parent
            </button>
            <button
              onClick={() => switchApp('mobile-admin')}
              className={`px-2 py-0.5 rounded-lg transition ${
                activeApp === 'mobile-admin' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
            >
              Executive
            </button>
          </div>
        </header>

        {/* Standalone Client Viewport (Pure Mobile Experience) */}
        <main className="flex-1 p-2 sm:p-5 max-w-4xl mx-auto w-full">
          {activeApp === 'teacher' && <TeacherPortalPage settings={settings} />}
          {activeApp === 'student' && <StudentPortalPage settings={settings} />}
          {activeApp === 'parent' && <ParentPortalPage settings={settings} />}
          {activeApp === 'mobile-admin' && <MobileAdminReportsPage settings={settings} />}
        </main>
      </div>
    );
  }

  // Desktop Admin Login Guard
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      settings={settings}
      onOpenApp={switchApp}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigate={setCurrentTab}
          settings={settings}
          onOpenApp={switchApp}
        />
      )}

      {/* Student Module (Phase 3) */}
      {currentTab === 'students-directory' && (
        <StudentsDirectoryPage
          onOpenAdmission={() => {
            setPrefilledInquiry(null);
            setCurrentTab('student-admission');
          }}
          onOpenPromotion={() => setCurrentTab('student-promotion')}
        />
      )}

      {currentTab === 'student-inquiries' && (
        <StudentInquiriesPage
          onConvertToAdmission={(inquiry) => {
            setPrefilledInquiry(inquiry);
            setCurrentTab('student-admission');
          }}
        />
      )}

      {currentTab === 'student-admission' && (
        <StudentAdmissionPage
          prefilledInquiry={prefilledInquiry}
          onBack={() => {
            setPrefilledInquiry(null);
            setCurrentTab('students-directory');
          }}
          onAdmissionSuccess={() => {
            setPrefilledInquiry(null);
            setCurrentTab('students-directory');
          }}
        />
      )}

      {currentTab === 'student-promotion' && (
        <StudentPromotionPage
          onBack={() => setCurrentTab('students-directory')}
          onPromotionSuccess={() => setCurrentTab('students-directory')}
        />
      )}

      {/* Staff & Faculty Module (Phase 4) */}
      {currentTab === 'staff-directory' && <StaffDirectoryPage />}
      {currentTab === 'teacher-assignments' && <TeacherAssignmentsPage />}

      {/* Academy Operations (Phase 5 & 6) */}
      {currentTab === 'timetable' && <TimetablePage />}
      {currentTab === 'attendance' && <AttendancePage />}

      {/* Academics & Examination (Phase 8) */}
      {currentTab === 'exams-marks' && <ExamsAndContentPage settings={settings} />}

      {/* Fees & Billing (Phase 10) */}
      {currentTab === 'fees' && <FeesPage settings={settings} />}

      {/* Finance & Payroll (Phase 11) */}
      {currentTab === 'finance' && <FinancePage settings={settings} />}

      {/* Central Reports & Analytics (Phase 12) */}
      {currentTab === 'reports' && <ReportsPage settings={settings} />}

      {/* Academic Setup & Settings */}
      {currentTab === 'academic-years' && <AcademicYearsPage />}
      {currentTab === 'classes' && <ClassesPage />}
      {currentTab === 'sections' && <SectionsPage />}
      {currentTab === 'batches' && <BatchesPage />}
      {currentTab === 'class-sections' && <ClassSectionsPage />}
      {currentTab === 'subjects' && <SubjectsPage />}
      {currentTab === 'class-subjects' && <ClassSubjectsPage />}
      {currentTab === 'settings' && (
        <AcademySettingsPage
          onSettingsUpdated={setSettings}
        />
      )}
    </MainLayout>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <AcademicYearProvider>
          <MainAppContent />
        </AcademicYearProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
