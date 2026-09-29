import React, { useEffect, useState } from 'react';
import {
  Calendar,
  GraduationCap,
  Layers,
  BookOpen,
  Link2,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  CalendarRange,
  Users,
  ClipboardList,
  UserPlus,
  Briefcase,
  Clock,
  Award,
  Smartphone,
  ShieldCheck,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { databaseService } from '../../lib/database-service';
import { AcademySettings } from '../../types/database.types';
import { NavTab } from '../../components/layout/Sidebar';
import { StandaloneApp } from '../../components/layout/Header';

interface DashboardPageProps {
  onNavigate: (tab: NavTab) => void;
  settings: AcademySettings | null;
  onOpenApp?: (app: StandaloneApp) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate, settings, onOpenApp }) => {
  const { currentAcademicYear, selectedAcademicYear } = useAcademicYear();

  const [stats, setStats] = useState({
    classesCount: 0,
    sectionsCount: 0,
    subjectsCount: 0,
    classSectionsCount: 0,
    classSubjectsCount: 0,
    studentsCount: 0,
    inquiriesCount: 0,
    teachersCount: 0,
    staffCount: 0,
    assignmentsCount: 0,
    timetableSlotsCount: 0,
    periodsCount: 0,
    assessmentsCount: 0,
    sosUnitsCount: 0,
    feeInvoicesCount: 0,
    pendingFeesAmount: 0,
    liquidReserves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setLoading(true);
        const [
          classes,
          sections,
          subjects,
          classSections,
          classSubjects,
          students,
          inquiries,
          staffList,
          assignmentsList,
        ] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSections(),
          databaseService.getSubjects(),
          databaseService.getClassSections(selectedAcademicYear?.id),
          databaseService.getClassSubjects(selectedAcademicYear?.id),
          databaseService.getStudents(selectedAcademicYear?.id),
          databaseService.getStudentInquiries(),
          databaseService.getStaff(),
          databaseService.getTeacherAssignments({ academicYearId: selectedAcademicYear?.id }),
        ]);

        const [slotsList, periodsList, assessmentsList, sosList, feeKPIs, financeKPIs] = await Promise.all([
          databaseService.getTimetableSlots({ academicYearId: selectedAcademicYear?.id }),
          databaseService.getTimetablePeriods(),
          databaseService.getAssessments(selectedAcademicYear?.id || ''),
          databaseService.getSchemeOfStudies(selectedAcademicYear?.id || ''),
          databaseService.getFeeKPIStats(selectedAcademicYear?.id).catch(() => ({ totalInvoices: 0, pendingAmount: 0 } as any)),
          databaseService.getFinanceKPIStats(selectedAcademicYear?.id).catch(() => ({ totalLiquidBalance: 0 } as any)),
        ]);

        setStats({
          classesCount: classes.filter(c => c.status === 'active').length,
          sectionsCount: sections.filter(s => s.status === 'active').length,
          subjectsCount: subjects.filter(s => s.status === 'active').length,
          classSectionsCount: classSections.filter(cs => cs.status === 'active').length,
          classSubjectsCount: classSubjects.filter(cs => cs.status === 'active').length,
          studentsCount: students.length,
          inquiriesCount: inquiries.filter(i => i.status !== 'Enrolled' && i.status !== 'Lost').length,
          teachersCount: staffList.filter(s => s.role === 'teacher' && s.status === 'active').length,
          staffCount: staffList.filter(s => s.status === 'active').length,
          assignmentsCount: assignmentsList.length,
          timetableSlotsCount: slotsList.length,
          periodsCount: periodsList.filter(p => !p.is_break).length,
          assessmentsCount: assessmentsList.length,
          sosUnitsCount: sosList.length,
          feeInvoicesCount: feeKPIs?.totalInvoices || 0,
          pendingFeesAmount: feeKPIs?.pendingAmount || 0,
          liquidReserves: financeKPIs?.totalLiquidBalance || 0,
        });
      } catch (e) {
        console.error('Error loading dashboard stats:', e);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, [selectedAcademicYear]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-7 border border-slate-200/70 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            System Online &amp; Verified
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Star Academy ERP
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
            Foundation phase configuration. Manage academic years, class structures, section assignments, and curriculum subjects dynamically.
          </p>
        </div>

        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center space-x-4 shrink-0">
          <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Current Academic Year
            </span>
            <span className="text-lg font-black text-slate-900 tracking-tight block">
              {currentAcademicYear ? currentAcademicYear.name : 'Not Designated'}
            </span>
            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" />
              Active System Default
            </span>
          </div>
        </div>
      </div>

      {/* Operations, Portals & Examination Highlights (Phase 5, 6, 7 & 8) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Operations, Portals &amp; Academics
            </h2>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200/60">
              Phases 5 to 9 Live
            </span>
          </div>
          <span className="text-xs text-slate-400">Classroom, Schedules, Portals &amp; Exams</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* Phase 5: Timetable Card */}
          <div
            onClick={() => onNavigate('timetable')}
            className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Calendar className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">P5</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mt-3">Timetable &amp; Schedule</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Master lecture engine</p>
            </div>
            <div className="mt-4 flex items-end justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {loading ? '...' : stats.timetableSlotsCount}
                </p>
                <p className="text-[10px] text-slate-400">{stats.periodsCount} periods/day</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          {/* Phase 6: Attendance Card */}
          <div
            onClick={() => onNavigate('attendance')}
            className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Clock className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">P6</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mt-3">Attendance &amp; Registers</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Daily &amp; lecture tracking</p>
            </div>
            <div className="mt-4 flex items-end justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {loading ? '...' : stats.studentsCount}
                </p>
                <p className="text-[10px] text-slate-400">&lt;75% alert system</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>


          {/* Phase 8: Exams & Marksheets Card */}
          <div
            onClick={() => onNavigate('exams-marks')}
            className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Award className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded">P8</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mt-3">Exams &amp; Marksheets</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Datesheet, Marks &amp; Report cards</p>
            </div>
            <div className="mt-4 flex items-end justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {loading ? '...' : stats.assessmentsCount}
                </p>
                <p className="text-[10px] text-slate-400">{stats.sosUnitsCount} SOS units</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>


          {/* Phase 10: Fee Management Card */}
          <div
            onClick={() => onNavigate('fees')}
            className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">P10</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mt-3">Fees &amp; Invoices</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Vouchers, challans &amp; receipts</p>
            </div>
            <div className="mt-4 flex items-end justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {loading ? '...' : stats.feeInvoicesCount}
                </p>
                <p className="text-[10px] text-emerald-600 font-medium">
                  {stats.pendingFeesAmount > 0 ? `Rs. ${stats.pendingFeesAmount.toLocaleString()} pending` : 'All cleared'}
                </p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          {/* Phase 11: Finance & Accounts Card */}
          <div
            onClick={() => onNavigate('finance')}
            className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/50">P11</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mt-3">Finance &amp; Payroll</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Banks, expenses &amp; salaries</p>
            </div>
            <div className="mt-4 flex items-end justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  {loading ? '...' : `Rs. ${(stats.liquidReserves / 1000).toFixed(0)}k`}
                </p>
                <p className="text-[10px] text-blue-600 font-medium">Liquid reserves</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>

          {/* Phase 12: Central Reports & Analytics */}
          <div
            onClick={() => onNavigate('reports')}
            className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-700 group-hover:bg-indigo-600 group-hover:text-white transition">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/50">P12</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xs mt-3">Central Reports</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">8 Modules, CSV export &amp; print</p>
            </div>
            <div className="mt-4 flex items-end justify-between pt-2 border-t border-slate-100">
              <div>
                <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                  8
                </p>
                <p className="text-[10px] text-indigo-600 font-medium">Audit report suites</p>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Portals Ecosystem (Separate Client Mobile Apps) */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-sm font-bold tracking-tight uppercase">
                Mobile Portals Ecosystem
              </h2>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full border border-white/10 text-indigo-200">
                Independent Apps • Shared DB
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Client mobile web applications for teachers, students, parents, and executives connected to the same Supabase database.
            </p>
          </div>
          <span className="text-xs text-indigo-300 font-mono">
            4 Standalone Apps
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-4">
          {/* Teacher Portal App */}
          <div
            onClick={() => onOpenApp ? onOpenApp('teacher') : (window.location.search = '?app=teacher')}
            className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-amber-300 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">Phase 7</span>
              </div>
              <h3 className="font-bold text-white text-xs mt-3">Teacher Mobile App</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Schedule, lecture roll-call &amp; test marks</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-amber-300 group-hover:underline">
              <span>Launch Standalone &rarr;</span>
            </div>
          </div>

          {/* Student Portal App */}
          <div
            onClick={() => onOpenApp ? onOpenApp('student') : (window.location.search = '?app=student')}
            className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-300 flex items-center justify-center group-hover:scale-105 transition">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-indigo-300 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">Phase 9</span>
              </div>
              <h3 className="font-bold text-white text-xs mt-3">Student Mobile App</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Timetable, attendance &amp; report cards</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-indigo-300 group-hover:underline">
              <span>Launch Standalone &rarr;</span>
            </div>
          </div>

          {/* Parent Portal App */}
          <div
            onClick={() => onOpenApp ? onOpenApp('parent') : (window.location.search = '?app=parent')}
            className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center group-hover:scale-105 transition">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-teal-300 font-bold bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">Phase 9</span>
              </div>
              <h3 className="font-bold text-white text-xs mt-3">Parent Mobile App</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Multi-child switcher, fees &amp; results</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-teal-300 group-hover:underline">
              <span>Launch Standalone &rarr;</span>
            </div>
          </div>

          {/* Executive Mobile Reports */}
          <div
            onClick={() => onOpenApp ? onOpenApp('mobile-admin') : (window.location.search = '?app=mobile-admin')}
            className="bg-white/5 hover:bg-white/10 p-4 rounded-2xl border border-white/10 transition cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center group-hover:scale-105 transition">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span className="text-[9px] font-mono text-purple-300 font-bold bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/20">Phase 13</span>
              </div>
              <h3 className="font-bold text-white text-xs mt-3">Executive Mobile Reports</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Daily pulse, defaulters &amp; liquid reserves</p>
            </div>
            <div className="mt-4 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold text-purple-300 group-hover:underline">
              <span>Launch Standalone &rarr;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Student Module Highlights (Phase 3) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Student Admissions &amp; Enrollment ({selectedAcademicYear?.name || 'Cycle'})
          </h2>
          <button
            onClick={() => onNavigate('students-directory')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
          >
            Directory &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('students-directory')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Users className="w-4 h-4" />
                </div>
                <span>Enrolled Students</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.studentsCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Active in {selectedAcademicYear?.name}</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                View &rarr;
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('student-inquiries')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <span>Active Inquiries</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.inquiriesCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Pending admission follow-ups</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                Pipeline &rarr;
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('student-admission')}
            className="bg-white rounded-2xl p-5 border border-dashed border-slate-300 hover:border-slate-900 shadow-xs transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Quick Admission</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-900">Register New Student</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Direct entry into current cycle</p>
            </div>
          </div>
        </div>
      </div>

      {/* Staff & Faculty (Phase 4) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Faculty &amp; Staff Administration
          </h2>
          <span className="text-xs text-slate-400">Phase 4 Active</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div
            onClick={() => onNavigate('staff-directory')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Briefcase className="w-4 h-4" />
                </div>
                <span>Faculty &amp; Staff</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.teachersCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Active teachers ({stats.staffCount} total employees)
                </p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                Directory &rarr;
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('teacher-assignments')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 group-hover:bg-slate-900 group-hover:text-white transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Teaching Allocations</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.assignmentsCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Subject slots assigned to faculty</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                Allocations &rarr;
              </span>
            </div>
          </div>

          <div
            onClick={() => onNavigate('staff-directory')}
            className="bg-white rounded-2xl p-5 border border-dashed border-slate-300 hover:border-slate-900 shadow-xs transition cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <span>Faculty Onboarding</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>
            <div className="mt-4">
              <p className="text-xs font-bold text-slate-900">Add Staff Member</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Faculty profiles &amp; contracts</p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards: Academic Structure */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Academic Master Structure
          </h2>
          <span className="text-xs text-slate-400">Master Entities</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Card 1: Classes */}
          <div
            onClick={() => onNavigate('classes')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <span>Classes Master</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.classesCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Active class standards</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                Manage &rarr;
              </span>
            </div>
          </div>

          {/* Card 2: Sections */}
          <div
            onClick={() => onNavigate('sections')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Sections Master</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.sectionsCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Reusable section codes</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                Manage &rarr;
              </span>
            </div>
          </div>

          {/* Card 3: Subjects */}
          <div
            onClick={() => onNavigate('subjects')}
            className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5 text-slate-700 font-semibold text-xs">
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition">
                  <BookOpen className="w-4 h-4" />
                </div>
                <span>Subjects Master</span>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition" />
            </div>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <p className="text-3xl font-black text-slate-900 tracking-tight">
                  {loading ? '...' : stats.subjectsCount}
                </p>
                <p className="text-[11px] text-slate-400 mt-1">Curriculum subject repository</p>
              </div>
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg">
                Manage &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Year Academic Structure Relationships */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Class Sections configured */}
        <div
          onClick={() => onNavigate('class-sections')}
          className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Configured Class Sections ({selectedAcademicYear?.name || 'Year'})
                </h3>
                <p className="text-[11px] text-slate-400">Class + Section mappings for active year</p>
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {loading ? '...' : stats.classSectionsCount}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Section assignments available for enrollment</span>
            <span className="font-semibold text-slate-800 group-hover:translate-x-0.5 transition-transform">
              Configure &rarr;
            </span>
          </div>
        </div>

        {/* Class Subjects configured */}
        <div
          onClick={() => onNavigate('class-subjects')}
          className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                <CalendarRange className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900">
                  Configured Class Subjects ({selectedAcademicYear?.name || 'Year'})
                </h3>
                <p className="text-[11px] text-slate-400">Class + Subject mappings for active year</p>
              </div>
            </div>
            <span className="text-2xl font-black text-slate-900">
              {loading ? '...' : stats.classSubjectsCount}
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Syllabus items assigned to classes</span>
            <span className="font-semibold text-slate-800 group-hover:translate-x-0.5 transition-transform">
              Configure &rarr;
            </span>
          </div>
        </div>
      </div>

      {/* System Status & Academy Profile Summary */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/70 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-700">
            <Building2 className="w-4 h-4 text-slate-500" />
            <span>Academy Information &amp; System Status</span>
          </div>
          <button
            onClick={() => onNavigate('settings')}
            className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline"
          >
            Edit Settings &rarr;
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Academy Name
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
              {settings?.academy_name || 'Star Academy'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Default Currency
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {settings?.currency || 'PKR'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Default Timezone
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5 truncate">
              {settings?.timezone || 'Asia/Karachi'}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50/70 rounded-xl border border-slate-100">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
              Active Context Year
            </span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {selectedAcademicYear?.name || 'None'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
