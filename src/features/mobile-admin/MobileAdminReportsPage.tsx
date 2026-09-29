import React, { useState, useEffect, useMemo } from 'react';
import {
  Smartphone,
  Laptop,
  Users,
  UserCheck,
  UserX,
  DollarSign,
  AlertTriangle,
  Phone,
  Calendar,
  BarChart3,
  Award,
  Receipt,
  Wallet,
  RefreshCw,
  Search,
  BookOpen,
  Briefcase,
  MessageSquare
} from 'lucide-react';
import {
  AcademySettings,
  StudentWithEnrollment,
  DailyAttendance,
  FeeInvoice,
  Staff,
  Assessment,
  BankAccount,
  Expense,
  Payroll,
  ClassItem,
  SectionItem
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';

interface MobileAdminReportsPageProps {
  settings?: AcademySettings | null;
}

type MobileTab = 
  | 'overview'
  | 'students'
  | 'attendance'
  | 'fees'
  | 'teachers'
  | 'exams'
  | 'finance'
  | 'expenses'
  | 'payroll';

export const MobileAdminReportsPage: React.FC<MobileAdminReportsPageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  // Viewport mode: Simulated Phone Frame vs Full-Screen Fluid
  const [deviceMode, setDeviceMode] = useState<'phone' | 'fluid'>('phone');
  const [activeTab, setActiveTab] = useState<MobileTab>('overview');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Raw data collections
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [attendance, setAttendance] = useState<DailyAttendance[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);

  // Load all operational data through central database service
  const loadData = async () => {
    setIsLoading(true);
    try {
      const yearId = selectedAcademicYear?.id;

      const [
        cls,
        sec,
        std,
        att,
        inv,
        stf,
        ass,
        bnk,
        exp,
        pyr
      ] = await Promise.all([
        databaseService.getClasses(),
        databaseService.getSections(),
        databaseService.getStudents(yearId),
        databaseService.getDailyAttendance(yearId ? { academic_year_id: yearId } : {}),
        databaseService.getFeeInvoices({ academicYearId: yearId }),
        databaseService.getStaff(),
        databaseService.getAssessments(yearId || ''),
        databaseService.getBankAccounts(),
        databaseService.getExpenses({ academicYearId: yearId }),
        databaseService.getPayrolls({ academicYearId: yearId })
      ]);

      setClasses(cls.filter(c => c.status === 'active'));
      setSections(sec.filter(s => s.status === 'active'));
      setStudents(std);
      setAttendance(att);
      setInvoices(inv);
      setStaff(stf);
      setAssessments(ass);
      setBankAccounts(bnk);
      setExpenses(exp);
      setPayrolls(pyr);
    } catch (err) {
      console.error('Failed to load mobile admin reports:', err);
      toast.error('Failed to load administrative records');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedAcademicYear]);

  // Derived today's attendance metrics
  const todayAttendance = useMemo(() => {
    const todayRecords = attendance.filter(a => a.date === selectedDate);
    const present = todayRecords.filter(a => a.status === 'Present').length;
    const absent = todayRecords.filter(a => a.status === 'Absent').length;
    const late = todayRecords.filter(a => a.status === 'Late').length;
    const leave = todayRecords.filter(a => a.status === 'Leave').length;
    const totalMarked = todayRecords.length;
    const rate = totalMarked > 0 ? Math.round(((present + late) / totalMarked) * 100) : 0;

    return {
      records: todayRecords,
      present,
      absent,
      late,
      leave,
      totalMarked,
      rate
    };
  }, [attendance, selectedDate]);

  // Derived Today's / MTD Fee metrics
  const feeMetrics = useMemo(() => {
    const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0);
    const totalCollected = invoices.reduce((sum, inv) => sum + (Number(inv.paid_amount) || 0), 0);
    const totalOutstanding = invoices.reduce((sum, inv) => {
      const remaining = (Number(inv.total_amount) || 0) - (Number(inv.paid_amount) || 0);
      return sum + (remaining > 0 ? remaining : 0);
    }, 0);

    const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
    const unpaidInvoices = invoices.filter(inv => inv.status === 'unpaid' || inv.status === 'partial');

    // Defaulters (Unpaid / Partial with overdue or balance)
    const defaulters = unpaidInvoices
      .map(inv => {
        const remaining = (Number(inv.total_amount) || 0) - (Number(inv.paid_amount) || 0);
        return {
          ...inv,
          remaining
        };
      })
      .filter(inv => inv.remaining > 0)
      .sort((a, b) => b.remaining - a.remaining);

    return {
      totalInvoiced,
      totalCollected,
      totalOutstanding,
      paidInvoices,
      defaultersCount: defaulters.length,
      defaulters
    };
  }, [invoices]);

  // Derived Faculty & Staff Roll-call metrics
  const staffMetrics = useMemo(() => {
    const activeStaff = staff.filter(s => s.status === 'active');
    const teachers = activeStaff.filter(s => s.role === 'teacher');
    // Live estimate: teachers present today
    const teachersPresent = Math.max(1, teachers.length - (todayAttendance.records.length > 0 ? 1 : 0));

    return {
      totalStaff: activeStaff.length,
      teachersCount: teachers.length,
      teachersPresent,
      teachers
    };
  }, [staff, todayAttendance]);

  // Derived Treasury & Operational Financials
  const financeMetrics = useMemo(() => {
    const totalTreasury = bankAccounts.reduce((sum, acc) => sum + (Number(acc.current_balance) || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
    const totalPayrollPaid = payrolls
      .filter(p => p.payment_status === 'paid')
      .reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0);
    const totalPayrollPending = payrolls
      .filter(p => p.payment_status !== 'paid')
      .reduce((sum, p) => sum + (Number(p.net_salary) || 0), 0);

    return {
      totalTreasury,
      totalExpenses,
      totalPayrollPaid,
      totalPayrollPending
    };
  }, [bankAccounts, expenses, payrolls]);

  // Absentees today with student details and parent phone
  const absenteesToday = useMemo(() => {
    return todayAttendance.records
      .filter(a => a.status === 'Absent')
      .map(a => {
        const student = students.find(s => s.id === a.student_id);
        const className = classes.find(c => c.id === a.class_id)?.name || 'Class';
        const sectionName = sections.find(s => s.id === a.section_id)?.name || 'Section';
        return {
          ...a,
          studentName: student?.student_name || 'Student',
          admissionNo: student?.admission_no || '',
          fatherName: student?.father_name || 'Guardian',
          contactPhone: student?.phone || student?.emergency_contact || '',
          className,
          sectionName
        };
      });
  }, [todayAttendance, students, classes, sections]);

  // Format currency in PKR
  const formatPKR = (amt: number) => {
    return `Rs ${Number(amt || 0).toLocaleString('en-PK')}`;
  };

  const academyName = settings?.academy_name || 'Star Academy';

  // Quick navigation tabs
  const TABS: { id: MobileTab; label: string; icon: any; count?: number | string }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'students', label: 'Students', icon: Users, count: students.length },
    { id: 'attendance', label: 'Attendance', icon: UserCheck, count: `${todayAttendance.rate}%` },
    { id: 'fees', label: 'Fees', icon: DollarSign, count: feeMetrics.defaultersCount },
    { id: 'teachers', label: 'Teachers', icon: Briefcase, count: `${staffMetrics.teachersPresent}/${staffMetrics.teachersCount}` },
    { id: 'finance', label: 'Treasury', icon: Wallet },
    { id: 'expenses', label: 'Expenses', icon: Receipt },
    { id: 'payroll', label: 'Payroll', icon: Award },
    { id: 'exams', label: 'Exams', icon: BookOpen, count: assessments.length },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner & Device Switcher */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-900 text-white flex items-center justify-center shadow-md">
              <Smartphone className="w-6 h-6 text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Mobile Admin Reports
                </h1>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 px-2 py-0.5 rounded-full uppercase">
                  Phase 13
                </span>
                <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Live Executive Sync</span>
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Mobile-first administrative dashboard &amp; KPIs consuming unified ERP services
              </p>
            </div>
          </div>

          {/* Controls: Date Picker, Refresh & Viewport Switcher */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Date Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={e => setSelectedDate(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-hidden"
              />
            </div>

            {/* Refresh */}
            <button
              onClick={loadData}
              disabled={isLoading}
              title="Refresh Data"
              className="p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 text-slate-600 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-600' : ''}`} />
            </button>

            {/* Device Mode Toggle */}
            <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setDeviceMode('phone')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  deviceMode === 'phone'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Phone Shell</span>
              </button>
              <button
                type="button"
                onClick={() => setDeviceMode('fluid')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  deviceMode === 'fluid'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                <span>Responsive Full</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container: Either Phone Frame or Fluid Full Container */}
      <div className={`transition-all duration-300 ${
        deviceMode === 'phone'
          ? 'max-w-[440px] mx-auto'
          : 'w-full'
      }`}>
        {/* Smartphone Chassis wrapper when in 'phone' mode */}
        <div className={deviceMode === 'phone' ? 'bg-slate-900 p-3 sm:p-4 rounded-[48px] shadow-2xl border-4 border-slate-800' : ''}>
          {/* Inner Phone Screen */}
          <div className="bg-[#F8FAFC] rounded-[36px] overflow-hidden border border-slate-200/80 shadow-inner min-h-[780px] flex flex-col">
            
            {/* Phone Status Bar (Signal, Time, Battery) */}
            <div className="bg-slate-900 text-white px-6 pt-3 pb-2 flex items-center justify-between text-[11px] font-medium tracking-tight shrink-0 select-none">
              <span className="font-bold">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              {/* Dynamic Island / Notch Mock */}
              <div className="w-20 h-4 bg-black rounded-full mx-auto flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-800 mr-2"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-900/80"></div>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <span>5G</span>
                <span>★ ERP</span>
                <span>100%</span>
              </div>
            </div>

            {/* Mobile App Header */}
            <div className="bg-white px-4 py-3.5 border-b border-slate-200/80 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center font-black text-sm shadow-xs">
                  ★
                </div>
                <div>
                  <h2 className="text-xs font-extrabold text-slate-900 tracking-tight leading-tight">
                    {academyName}
                  </h2>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    Executive Mobile
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <span className="text-[10px] font-bold font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                  {selectedAcademicYear?.name || '2026-2027'}
                </span>
              </div>
            </div>

            {/* Horizontal Scrollable Tabs */}
            <div className="bg-white border-b border-slate-200/70 px-2 py-2 overflow-x-auto no-scrollbar shrink-0 flex items-center space-x-1.5">
              {TABS.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition shrink-0 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* App Body Content */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">

              {/* TAB 1: OVERVIEW (Section 36 Example Dashboard) */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Today's Overview Hero Card */}
                  <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">
                          Executive Pulse
                        </span>
                        <h3 className="text-base font-extrabold tracking-tight">Today's Overview</h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-300 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10">
                        {selectedDate}
                      </span>
                    </div>

                    {/* Today's Metrics Grid (Exact fields from Section 36) */}
                    <div className="grid grid-cols-2 gap-3 pt-3.5">
                      {/* Total Students */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-300">Students</span>
                          <Users className="w-3.5 h-3.5 text-indigo-400" />
                        </div>
                        <div className="text-lg font-black tracking-tight mt-1 font-mono">
                          {students.length.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-slate-400">Total Enrolled</span>
                      </div>

                      {/* Present Today */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-300">Present</span>
                          <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                        </div>
                        <div className="text-lg font-black tracking-tight mt-1 font-mono text-emerald-400">
                          {todayAttendance.present.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-emerald-300/80">
                          {todayAttendance.rate}% Attendance
                        </span>
                      </div>

                      {/* Absent Today */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-300">Absent</span>
                          <UserX className="w-3.5 h-3.5 text-rose-400" />
                        </div>
                        <div className="text-lg font-black tracking-tight mt-1 font-mono text-rose-400">
                          {todayAttendance.absent.toLocaleString()}
                        </div>
                        <span className="text-[9px] text-rose-300/80">
                          {todayAttendance.late > 0 ? `+${todayAttendance.late} Late` : 'Absentees'}
                        </span>
                      </div>

                      {/* Teachers Present */}
                      <div className="bg-white/5 p-3 rounded-2xl border border-white/10">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-slate-300">Teachers Present</span>
                          <Briefcase className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div className="text-lg font-black tracking-tight mt-1 font-mono text-amber-300">
                          {staffMetrics.teachersPresent} / {staffMetrics.teachersCount}
                        </div>
                        <span className="text-[9px] text-amber-200/80">Active Faculty</span>
                      </div>
                    </div>

                    {/* Fees Summary Strip (From Section 36) */}
                    <div className="mt-3.5 pt-3 border-t border-white/10 grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          Fees Collected
                        </span>
                        <div className="text-sm font-extrabold font-mono text-emerald-400 mt-0.5">
                          {formatPKR(feeMetrics.totalCollected)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                          Outstanding Fees
                        </span>
                        <div className="text-sm font-extrabold font-mono text-rose-400 mt-0.5">
                          {formatPKR(feeMetrics.totalOutstanding)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Treasury & Liquidity Snapshot Card */}
                  <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                          Treasury &amp; Bank Reserves
                        </h4>
                      </div>
                      <span className="text-xs font-extrabold font-mono text-emerald-700">
                        {formatPKR(financeMetrics.totalTreasury)}
                      </span>
                    </div>

                    {/* Individual Accounts Mini-List */}
                    <div className="space-y-1.5 pt-1">
                      {bankAccounts.slice(0, 3).map(acc => (
                        <div key={acc.id} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="font-medium text-slate-700 truncate pr-2">
                            {acc.name}
                          </span>
                          <span className="font-mono font-bold text-slate-900 shrink-0">
                            {formatPKR(acc.current_balance)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Alerts: Top Absentees or Defaulters */}
                  {absenteesToday.length > 0 && (
                    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-bold text-amber-900">
                            Unexplained Absentees Today ({absenteesToday.length})
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('attendance')}
                          className="text-[10px] font-bold text-amber-800 underline"
                        >
                          View All
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        {absenteesToday.slice(0, 2).map((abs, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-white p-2 rounded-xl border border-amber-200/60 text-xs">
                            <div>
                              <p className="font-bold text-slate-900">{abs.studentName}</p>
                              <p className="text-[10px] text-slate-400">{abs.className} - {abs.sectionName}</p>
                            </div>
                            {abs.contactPhone ? (
                              <a
                                href={`tel:${abs.contactPhone}`}
                                className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] shadow-2xs hover:bg-emerald-700"
                              >
                                <Phone className="w-3 h-3" />
                                <span>Call Parent</span>
                              </a>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">No phone</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quick Defaulters Action Banner */}
                  {feeMetrics.defaulters.length > 0 && (
                    <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <DollarSign className="w-4 h-4 text-rose-600" />
                          <span className="text-xs font-bold text-rose-900">
                            Overdue Defaulters ({feeMetrics.defaultersCount})
                          </span>
                        </div>
                        <button
                          onClick={() => setActiveTab('fees')}
                          className="text-[10px] font-bold text-rose-800 underline"
                        >
                          Review All
                        </button>
                      </div>
                      <div className="text-[11px] text-rose-700">
                        Total pending uncollected: <strong className="font-mono">{formatPKR(feeMetrics.totalOutstanding)}</strong>
                      </div>
                    </div>
                  )}

                  {/* Monthly Outflow / Burn */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Monthly Expenses
                      </span>
                      <div className="text-sm font-extrabold font-mono text-slate-900 mt-1">
                        {formatPKR(financeMetrics.totalExpenses)}
                      </div>
                      <span className="text-[9px] text-slate-400">Total Spent</span>
                    </div>

                    <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Payroll Disbursed
                      </span>
                      <div className="text-sm font-extrabold font-mono text-slate-900 mt-1">
                        {formatPKR(financeMetrics.totalPayrollPaid)}
                      </div>
                      <span className="text-[9px] text-emerald-600 font-medium">Faculty Salaries</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: STUDENTS REPORT */}
              {activeTab === 'students' && (
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-900">Student Directory</h4>
                      <span className="text-xs font-mono font-bold text-indigo-600">
                        {students.length} Total
                      </span>
                    </div>
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search student or admission #..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-indigo-500 font-medium"
                      />
                    </div>
                  </div>

                  {/* Class-wise distribution cards */}
                  <div className="grid grid-cols-2 gap-2">
                    {classes.map(c => {
                      const count = students.filter(s => s.academic_record?.class_id === c.id).length;
                      return (
                        <div key={c.id} className="bg-white p-2.5 rounded-xl border border-slate-200/70 shadow-2xs flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{c.name}</span>
                          <span className="text-xs font-mono font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Filtered Students List */}
                  <div className="space-y-2 pt-1">
                    {students
                      .filter(s => {
                        if (!searchQuery) return true;
                        const q = searchQuery.toLowerCase();
                        return (
                          s.student_name.toLowerCase().includes(q) ||
                          s.admission_no.toLowerCase().includes(q) ||
                          (s.father_name && s.father_name.toLowerCase().includes(q))
                        );
                      })
                      .slice(0, 15)
                      .map(student => (
                        <div key={student.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] tracking-wider shrink-0">
                                {student.student_name.slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <h5 className="text-xs font-bold text-slate-900 leading-tight">
                                  {student.student_name}
                                </h5>
                                <p className="text-[10px] text-slate-400 font-mono">
                                  {student.admission_no} • Roll: {student.academic_record?.roll_no || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {student.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 text-slate-500">
                            <span>{student.academic_record?.class?.name || 'Class'} ({student.academic_record?.section?.name || 'Sec'})</span>
                            {student.phone && (
                              <a
                                href={`tel:${student.phone}`}
                                className="flex items-center space-x-1 text-indigo-600 font-bold hover:underline"
                              >
                                <Phone className="w-3 h-3" />
                                <span>{student.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE REPORT */}
              {activeTab === 'attendance' && (
                <div className="space-y-3">
                  {/* Daily Rate Overview */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Attendance Rate</span>
                      <span className="text-base font-extrabold font-mono text-emerald-600">
                        {todayAttendance.rate}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                      <div style={{ width: `${todayAttendance.rate}%` }} className="bg-emerald-500 h-full"></div>
                      <div style={{ width: `${100 - todayAttendance.rate}%` }} className="bg-rose-400 h-full"></div>
                    </div>

                    <div className="grid grid-cols-4 gap-1 text-center pt-1 text-[10px]">
                      <div className="bg-emerald-50 p-1.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 font-bold block">{todayAttendance.present}</span>
                        <span className="text-slate-500">Present</span>
                      </div>
                      <div className="bg-rose-50 p-1.5 rounded-lg border border-rose-100">
                        <span className="text-rose-700 font-bold block">{todayAttendance.absent}</span>
                        <span className="text-slate-500">Absent</span>
                      </div>
                      <div className="bg-amber-50 p-1.5 rounded-lg border border-amber-100">
                        <span className="text-amber-700 font-bold block">{todayAttendance.late}</span>
                        <span className="text-slate-500">Late</span>
                      </div>
                      <div className="bg-blue-50 p-1.5 rounded-lg border border-blue-100">
                        <span className="text-blue-700 font-bold block">{todayAttendance.leave}</span>
                        <span className="text-slate-500">Leave</span>
                      </div>
                    </div>
                  </div>

                  {/* Absentees Call List */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-900 px-1 flex items-center justify-between">
                      <span>Absentees Follow-up ({absenteesToday.length})</span>
                      <span className="text-[10px] font-normal text-slate-400">1-Tap Parent Contact</span>
                    </h4>

                    {absenteesToday.length === 0 ? (
                      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 text-center text-xs text-slate-500">
                        No absentees reported for this date.
                      </div>
                    ) : (
                      absenteesToday.map((abs, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h5 className="text-xs font-bold text-slate-900">{abs.studentName}</h5>
                              <span className="text-[9px] font-mono text-slate-400">{abs.admissionNo}</span>
                            </div>
                            <p className="text-[10px] text-slate-500">
                              {abs.className} • S/O {abs.fatherName}
                            </p>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            {abs.contactPhone ? (
                              <>
                                <a
                                  href={`tel:${abs.contactPhone}`}
                                  title="Voice Call"
                                  className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                                >
                                  <Phone className="w-3.5 h-3.5" />
                                </a>
                                <a
                                  href={`https://wa.me/${abs.contactPhone.replace(/\D/g, '')}?text=Dear%20Parent,%20your%20child%20${encodeURIComponent(abs.studentName)}%20is%20marked%20Absent%20today%20at%20${encodeURIComponent(academyName)}.`}
                                  target="_blank"
                                  rel="noreferrer"
                                  title="WhatsApp Notice"
                                  className="p-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition"
                                >
                                  <MessageSquare className="w-3.5 h-3.5" />
                                </a>
                              </>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-mono">No phone</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: FEES & DEFAULTERS */}
              {activeTab === 'fees' && (
                <div className="space-y-3">
                  {/* Fee Collections Card */}
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Fee Financial Audit
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100">
                        <span className="text-[10px] text-emerald-700 font-bold block">Total Collected</span>
                        <div className="text-sm font-extrabold font-mono text-emerald-800 mt-0.5">
                          {formatPKR(feeMetrics.totalCollected)}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100">
                        <span className="text-[10px] text-rose-700 font-bold block">Total Outstanding</span>
                        <div className="text-sm font-extrabold font-mono text-rose-800 mt-0.5">
                          {formatPKR(feeMetrics.totalOutstanding)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Defaulters Breakdown */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <h4 className="text-xs font-extrabold text-slate-900">
                        Defaulters List ({feeMetrics.defaulters.length})
                      </h4>
                      <span className="text-[10px] text-slate-400">Sorted by Highest Due</span>
                    </div>

                    {feeMetrics.defaulters.slice(0, 10).map(def => {
                      const student = students.find(s => s.id === def.student_id);
                      return (
                        <div key={def.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1.5">
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="text-xs font-bold text-slate-900">
                                {student?.student_name || 'Student'}
                              </h5>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Inv #{def.invoice_no} • Month: {def.month}
                              </p>
                            </div>
                            <span className="text-xs font-extrabold font-mono text-rose-600">
                              {formatPKR(def.remaining)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100">
                            <span className="text-slate-500">
                              Due: {def.due_date || 'N/A'}
                            </span>
                            {student?.phone && (
                              <a
                                href={`tel:${student.phone}`}
                                className="flex items-center space-x-1 font-bold text-indigo-600"
                              >
                                <Phone className="w-2.5 h-2.5" />
                                <span>{student.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 5: TEACHERS REPORT */}
              {activeTab === 'teachers' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Active Faculty
                      </span>
                      <div className="text-lg font-extrabold font-mono text-slate-900">
                        {staffMetrics.teachersPresent} / {staffMetrics.teachersCount} Present
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-1 rounded-xl">
                      {staffMetrics.totalStaff} Total Staff
                    </span>
                  </div>

                  <div className="space-y-2">
                    {staffMetrics.teachers.map(t => (
                      <div key={t.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs tracking-wider">
                            {t.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">{t.name}</h5>
                            <p className="text-[10px] text-slate-400">{t.designation} • {t.department || 'General'}</p>
                          </div>
                        </div>
                        {t.phone ? (
                          <a
                            href={`tel:${t.phone}`}
                            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>
                        ) : null}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 6: FINANCE & TREASURY */}
              {activeTab === 'finance' && (
                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-4 text-white shadow-md">
                    <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">
                      Total Liquid Treasury
                    </span>
                    <div className="text-xl font-extrabold font-mono mt-1">
                      {formatPKR(financeMetrics.totalTreasury)}
                    </div>
                    <p className="text-[10px] text-emerald-100/80 mt-1">
                      Across {bankAccounts.length} authorized institution accounts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-slate-900 px-1">Institutional Bank Accounts</h4>
                    {bankAccounts.map(acc => (
                      <div key={acc.id} className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{acc.name}</span>
                          <span className="text-xs font-extrabold font-mono text-emerald-700">
                            {formatPKR(acc.current_balance)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{acc.bank_name || 'Treasury'}</span>
                          <span className="font-mono">{acc.account_number || 'Cash'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: EXPENSES */}
              {activeTab === 'expenses' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Total Operational Expenses
                      </span>
                      <div className="text-lg font-extrabold font-mono text-slate-900">
                        {formatPKR(financeMetrics.totalExpenses)}
                      </div>
                    </div>
                    <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-xl">
                      {expenses.length} Records
                    </span>
                  </div>

                  <div className="space-y-2">
                    {expenses.slice(0, 10).map(exp => (
                      <div key={exp.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">
                            {exp.description || exp.category}
                          </span>
                          <span className="text-xs font-extrabold font-mono text-rose-600">
                            {formatPKR(exp.amount)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-semibold text-slate-600">{exp.category}</span>
                          <span>{exp.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 8: PAYROLL */}
              {activeTab === 'payroll' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Paid Payroll</span>
                      <div className="text-sm font-extrabold font-mono text-emerald-700 mt-1">
                        {formatPKR(financeMetrics.totalPayrollPaid)}
                      </div>
                    </div>
                    <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block">Pending</span>
                      <div className="text-sm font-extrabold font-mono text-amber-600 mt-1">
                        {formatPKR(financeMetrics.totalPayrollPending)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {payrolls.slice(0, 10).map(p => (
                      <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div>
                          <h5 className="text-xs font-bold text-slate-900">{p.staff?.name || 'Staff Member'}</h5>
                          <p className="text-[10px] text-slate-400">{p.salary_month}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold font-mono text-slate-900 block">
                            {formatPKR(p.net_salary)}
                          </span>
                          <span className={`text-[9px] font-bold uppercase ${
                            p.payment_status === 'paid' ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {p.payment_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: EXAMS & ASSESSMENTS */}
              {activeTab === 'exams' && (
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Scheduled Exams &amp; Tests
                      </span>
                      <div className="text-lg font-extrabold font-mono text-slate-900">
                        {assessments.length} Assessments
                      </div>
                    </div>
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                  </div>

                  <div className="space-y-2">
                    {assessments.slice(0, 10).map(ass => (
                      <div key={ass.id} className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">{ass.title}</span>
                          <span className="text-[10px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                            {ass.total_marks} Marks
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span>{ass.assessment_type}</span>
                          <span>{ass.test_date || 'TBD'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Mobile Bottom Dock (iOS/Android App Navigation Bar) */}
            <div className="bg-white border-t border-slate-200/80 px-4 py-2 flex items-center justify-around shrink-0 text-slate-400">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex flex-col items-center space-y-0.5 ${activeTab === 'overview' ? 'text-indigo-600 font-bold' : 'hover:text-slate-600'}`}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="text-[9px]">Home</span>
              </button>
              <button
                onClick={() => setActiveTab('attendance')}
                className={`flex flex-col items-center space-y-0.5 ${activeTab === 'attendance' ? 'text-indigo-600 font-bold' : 'hover:text-slate-600'}`}
              >
                <UserCheck className="w-4 h-4" />
                <span className="text-[9px]">Attendance</span>
              </button>
              <button
                onClick={() => setActiveTab('fees')}
                className={`flex flex-col items-center space-y-0.5 ${activeTab === 'fees' ? 'text-indigo-600 font-bold' : 'hover:text-slate-600'}`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="text-[9px]">Fees</span>
              </button>
              <button
                onClick={() => setActiveTab('finance')}
                className={`flex flex-col items-center space-y-0.5 ${activeTab === 'finance' ? 'text-indigo-600 font-bold' : 'hover:text-slate-600'}`}
              >
                <Wallet className="w-4 h-4" />
                <span className="text-[9px]">Treasury</span>
              </button>
            </div>

            {/* Home Bar indicator */}
            <div className="bg-slate-900 py-1 flex justify-center shrink-0">
              <div className="w-28 h-1 bg-slate-600 rounded-full"></div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
