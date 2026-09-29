import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AcademicYearProvider } from './context/AcademicYearContext';
import { MainLayout } from './components/layout/MainLayout';
import { NavTab } from './components/layout/Sidebar';
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
import { databaseService } from './lib/database-service';
import { AcademySettings, StudentInquiry } from './types/database.types';

const MainAppContent: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [settings, setSettings] = useState<AcademySettings | null>(null);
  const [prefilledInquiry, setPrefilledInquiry] = useState<StudentInquiry | null>(null);

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

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      settings={settings}
    >
      {currentTab === 'dashboard' && (
        <DashboardPage
          onNavigate={setCurrentTab}
          settings={settings}
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

      {/* Operations & Portals (Phase 5, 6, 7 & 9) */}
      {currentTab === 'timetable' && <TimetablePage />}
      {currentTab === 'attendance' && <AttendancePage />}
      {currentTab === 'teacher-portal' && <TeacherPortalPage settings={settings} />}
      {currentTab === 'student-portal' && <StudentPortalPage settings={settings} />}
      {currentTab === 'parent-portal' && <ParentPortalPage settings={settings} />}

      {/* Academics & Examination (Phase 8) */}
      {currentTab === 'exams-marks' && <ExamsAndContentPage settings={settings} />}

      {/* Fees & Billing (Phase 10) */}
      {currentTab === 'fees' && <FeesPage settings={settings} />}

      {/* Finance & Payroll (Phase 11) */}
      {currentTab === 'finance' && <FinancePage settings={settings} />}

      {/* Academic Setup */}
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
