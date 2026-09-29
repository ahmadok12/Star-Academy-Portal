import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Users,
  Clock,
  DollarSign,
  Briefcase,
  Award,
  Wallet,
  Receipt,
  Download,
  Printer,
  Search
} from 'lucide-react';
import {
  ClassItem,
  SectionItem,
  StudentWithEnrollment,
  DailyAttendance,
  FeeInvoice,
  Staff,
  Assessment,
  BankAccount,
  Expense,
  Payroll,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { PageHeader } from '../../components/common/PageHeader';

interface ReportsPageProps {
  settings?: AcademySettings | null;
}

type ReportType =
  | 'students'
  | 'attendance'
  | 'fees'
  | 'faculty'
  | 'exams'
  | 'finance'
  | 'expenses'
  | 'payroll';

export const ReportsPage: React.FC<ReportsPageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();

  // Active Report Category
  const [activeReport, setActiveReport] = useState<ReportType>('students');

  // Master Data
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [attendance, setAttendance] = useState<DailyAttendance[]>([]);
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);

  // Filter Bar
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  useEffect(() => {
    const loadAllReportData = async () => {
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
          acc,
          exp,
          pyr
        ] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSections(),
          databaseService.getStudents(yearId),
          yearId
            ? databaseService.getDailyAttendance({ academic_year_id: yearId })
            : databaseService.getDailyAttendance(),
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
        setAccounts(acc);
        setExpenses(exp);
        setPayrolls(pyr);
      } catch (err) {
        console.error('Error loading report datasets:', err);
      }
    };

    loadAllReportData();
  }, [selectedAcademicYear]);

  // CSV Export utility
  const exportToCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(row =>
        row
          .map(cell => {
            const str = String(cell ?? '').replace(/"/g, '""');
            return str.includes(',') || str.includes('\n') || str.includes('"')
              ? `"${str}"`
              : str;
          })
          .join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered Students Report
  const filteredStudents = students.filter(s => {
    const enroll = s.currentEnrollment || s.academic_record;
    if (selectedClassId && enroll?.class_id !== selectedClassId) return false;
    if (selectedSectionId && enroll?.section_id !== selectedSectionId) return false;
    if (selectedStatus && enroll?.status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = (s.student_name || '').toLowerCase().includes(q);
      const matchRoll = (enroll?.roll_no || '').toLowerCase().includes(q);
      const matchAdm = s.admission_no.toLowerCase().includes(q);
      const matchPhone = (s.phone || '').includes(q);
      if (!matchName && !matchRoll && !matchAdm && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Fee Invoices Report
  const filteredInvoices = invoices.filter(inv => {
    if (selectedClassId && inv.class_id !== selectedClassId) return false;
    if (selectedStatus && inv.status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchInv = inv.invoice_no.toLowerCase().includes(q);
      const matchStd = (inv.student?.student_name || '').toLowerCase().includes(q);
      if (!matchInv && !matchStd) return false;
    }
    return true;
  });

  // Filtered Expenses Report
  const filteredExpenses = expenses.filter(e => {
    if (selectedStatus && e.category.toLowerCase() !== selectedStatus.toLowerCase()) return false;
    if (dateFrom && e.date < dateFrom) return false;
    if (dateTo && e.date > dateTo) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchPayee = (e.payee_name || '').toLowerCase().includes(q);
      const matchRef = (e.reference_no || '').toLowerCase().includes(q);
      const matchDesc = (e.description || '').toLowerCase().includes(q);
      if (!matchPayee && !matchRef && !matchDesc) return false;
    }
    return true;
  });

  // Filtered Payroll Report
  const filteredPayrolls = payrolls.filter(p => {
    if (selectedStatus && p.payment_status !== selectedStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchTeacher = (p.staff?.name || '').toLowerCase().includes(q);
      const matchMonth = p.salary_month.toLowerCase().includes(q);
      if (!matchTeacher && !matchMonth) return false;
    }
    return true;
  });

  // Export handlers
  const handleExport = () => {
    if (activeReport === 'students') {
      const headers = ['Admission No', 'Roll No', 'Student Name', 'Father Name', 'Class', 'Section', 'Phone', 'Status'];
      const rows = filteredStudents.map(s => {
        const enroll = s.currentEnrollment || s.academic_record;
        return [
          s.admission_no,
          enroll?.roll_no || '—',
          s.student_name,
          s.father_name,
          classes.find(c => c.id === enroll?.class_id)?.name || '—',
          sections.find(sec => sec.id === enroll?.section_id)?.name || '—',
          s.phone || '—',
          enroll?.status || s.status
        ];
      });
      exportToCSV('star-academy-students-report', headers, rows);
    } else if (activeReport === 'fees') {
      const headers = ['Invoice No', 'Student', 'Class', 'Month', 'Total Amount', 'Paid', 'Balance', 'Status', 'Due Date'];
      const rows = filteredInvoices.map(i => [
        i.invoice_no,
        i.student?.student_name || '—',
        i.class?.name || '—',
        i.month,
        i.total_amount,
        i.paid_amount,
        i.balance_amount,
        i.status,
        i.due_date
      ]);
      exportToCSV('star-academy-fees-report', headers, rows);
    } else if (activeReport === 'expenses') {
      const headers = ['Date', 'Category', 'Payee', 'Description', 'Account', 'Reference', 'Amount'];
      const rows = filteredExpenses.map(e => [
        e.date,
        e.category,
        e.payee_name || '—',
        e.description || '—',
        e.payment_account?.name || 'Cash',
        e.reference_no || '—',
        e.amount
      ]);
      exportToCSV('star-academy-expenses-report', headers, rows);
    } else if (activeReport === 'payroll') {
      const headers = ['Employee ID', 'Faculty Name', 'Cycle', 'Basic Salary', 'Allowances', 'Deductions', 'Advance Recovery', 'Net Salary', 'Status'];
      const rows = filteredPayrolls.map(p => [
        p.staff?.employee_id || '—',
        p.staff?.name || '—',
        p.salary_month,
        p.basic_salary,
        p.allowances,
        p.deductions,
        p.advance_salary_deducted,
        p.net_salary,
        p.payment_status
      ]);
      exportToCSV('star-academy-payroll-report', headers, rows);
    }
  };

  const academyName = settings?.academy_name || 'STAR ACADEMY';
  const campusAddress = settings?.address || 'Main Campus, Lahore, Pakistan';

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Centralized Academic &amp; Financial Reports"
        subtitle="Cross-module data analytics, compliance audit logs, and printable reporting"
        action={
          <div className="flex items-center space-x-2.5 print:hidden">
            <button
              onClick={handleExport}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Official Report</span>
            </button>
          </div>
        }
      />

      {/* Official Print Header (Only visible when printing) */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">{academyName}</h1>
        <p className="text-xs text-slate-600">{campusAddress}</p>
        <div className="inline-block mt-2 px-3 py-1 bg-slate-100 font-bold text-xs uppercase tracking-wider rounded">
          Executive ERP Report: {activeReport.toUpperCase()} • Academic Session {selectedAcademicYear?.name || '2026-27'}
        </div>
      </div>

      {/* Reports Navigation Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 print:hidden">
        {[
          { id: 'students', label: 'Students', icon: Users, count: students.length },
          { id: 'attendance', label: 'Attendance', icon: Clock, count: attendance.length },
          { id: 'fees', label: 'Fees & Invoices', icon: DollarSign, count: invoices.length },
          { id: 'faculty', label: 'Faculty & Staff', icon: Briefcase, count: staff.length },
          { id: 'exams', label: 'Exams & Marks', icon: Award, count: assessments.length },
          { id: 'finance', label: 'Treasury Accounts', icon: Wallet, count: accounts.length },
          { id: 'expenses', label: 'Expenditures', icon: Receipt, count: expenses.length },
          { id: 'payroll', label: 'Faculty Payroll', icon: BarChart3, count: payrolls.length }
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeReport === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveReport(item.id as ReportType);
                setSelectedClassId('');
                setSelectedSectionId('');
                setSelectedStatus('');
                setSearchTerm('');
              }}
              className={`p-3 rounded-2xl border transition flex flex-col justify-between items-start text-left cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900/10'
                  : 'bg-white text-slate-600 border-slate-200/70 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.count}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight">{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar (Hidden during print) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-wrap items-center justify-between gap-3 print:hidden">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Universal Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search in report..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Class Filter (for student & fee reports) */}
          {(activeReport === 'students' || activeReport === 'fees' || activeReport === 'attendance') && (
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          )}

          {/* Section Filter */}
          {activeReport === 'students' && (
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Sections</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          {activeReport === 'students' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Enrollments</option>
              <option value="active">Active</option>
              <option value="promoted">Promoted</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          )}

          {activeReport === 'fees' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="partial">Partial</option>
              <option value="unpaid">Unpaid / Defaulter</option>
              <option value="overdue">Overdue</option>
            </select>
          )}

          {activeReport === 'expenses' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Categories</option>
              <option value="Electricity">Electricity</option>
              <option value="Rent">Rent</option>
              <option value="Salary">Salary</option>
              <option value="Stationery">Stationery</option>
              <option value="Marketing">Marketing</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          )}

          {activeReport === 'payroll' && (
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">All Payroll Statuses</option>
              <option value="paid">Paid</option>
              <option value="approved">Approved</option>
              <option value="draft">Draft</option>
            </select>
          )}

          {/* Date range for expenses */}
          {activeReport === 'expenses' && (
            <div className="flex items-center space-x-1.5 text-xs text-slate-500">
              <input
                type="date"
                value={dateFrom}
                onChange={e => setDateFrom(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-mono"
              />
              <span>to</span>
              <input
                type="date"
                value={dateTo}
                onChange={e => setDateTo(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-mono"
              />
            </div>
          )}
        </div>
      </div>

      {/* REPORT CONTENT VIEW */}

      {/* 1. STUDENT ENROLLMENT REPORT */}
      {activeReport === 'students' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Student Master Enrollment Directory ({filteredStudents.length} Students)
            </h3>
            <span className="text-[11px] text-slate-500">
              Academic Cycle: {selectedAcademicYear?.name || '2026-27'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Adm #</th>
                  <th className="px-4 py-3">Roll #</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Father Name</th>
                  <th className="px-4 py-3">Class &amp; Section</th>
                  <th className="px-4 py-3">Enrollment Type</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map(s => {
                  const enroll = s.currentEnrollment || s.academic_record;
                  const cls = classes.find(c => c.id === enroll?.class_id);
                  const sec = sections.find(sc => sc.id === enroll?.section_id);
                  return (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{s.admission_no}</td>
                      <td className="px-4 py-3 font-mono text-slate-600">{enroll?.roll_no || '—'}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{s.student_name}</td>
                      <td className="px-4 py-3 text-slate-600">{s.father_name}</td>
                      <td className="px-4 py-3 text-slate-800 font-semibold">{cls?.name || '—'} {sec ? `(${sec.name})` : ''}</td>
                      <td className="px-4 py-3">
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 capitalize">
                          {enroll?.enrollment_type || 'regular'}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{s.phone || '—'}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/50">
                          {enroll?.status || s.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 2. ATTENDANCE REPORT */}
      {activeReport === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Student Attendance Register Log ({attendance.length} Total Attendance Sessions)
            </h3>
            <span className="text-[11px] text-slate-500">Official Campus Register</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3 text-center">Attendance Status</th>
                  <th className="px-4 py-3">Remarks / Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.slice(0, 50).map(att => {
                  const isPresent = att.status === 'Present';
                  const isLate = att.status === 'Late';
                  return (
                    <tr key={att.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{att.date}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{att.student?.student_name || 'Student'}</td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{att.class?.name || 'Class'}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isPresent
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                              : isLate
                              ? 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              : 'bg-rose-50 text-rose-700 border border-rose-200/50'
                          }`}
                        >
                          {att.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500">{att.remarks || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. FEE COLLECTION & INVOICES REPORT */}
      {activeReport === 'fees' && (
        <div className="space-y-4">
          {/* Fee KPI Summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Invoiced</span>
              <span className="text-base font-black font-mono text-slate-900">
                Rs. {filteredInvoices.reduce((sum, i) => sum + Number(i.total_amount), 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Collected</span>
              <span className="text-base font-black font-mono text-emerald-600">
                Rs. {filteredInvoices.reduce((sum, i) => sum + Number(i.paid_amount), 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Outstanding</span>
              <span className="text-base font-black font-mono text-rose-600">
                Rs. {filteredInvoices.reduce((sum, i) => sum + Number(i.balance_amount), 0).toLocaleString()}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200/70">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Defaulters</span>
              <span className="text-base font-black font-mono text-amber-600">
                {filteredInvoices.filter(i => Number(i.balance_amount) > 0).length} Learners
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3">Due Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map(i => (
                    <tr key={i.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">{i.invoice_no}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{i.student?.student_name || 'Student'}</td>
                      <td className="px-4 py-3 text-slate-700">{i.class?.name || 'Class'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-800">{i.month}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">Rs. {Number(i.total_amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-emerald-600">Rs. {Number(i.paid_amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-rose-600">Rs. {Number(i.balance_amount).toLocaleString()}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          i.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-600">{i.due_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. FACULTY DIRECTORY & COMPENSATION */}
      {activeReport === 'faculty' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Faculty &amp; Staff Compensation Report ({staff.length} Faculty Members)
            </h3>
            <span className="text-[11px] text-slate-500">Human Resources &amp; Academics</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Emp ID</th>
                  <th className="px-4 py-3">Faculty Name</th>
                  <th className="px-4 py-3">Designation</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Qualification</th>
                  <th className="px-4 py-3 text-right">Contract Salary</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{s.employee_id}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{s.name}</td>
                    <td className="px-4 py-3 text-slate-800 font-medium">{s.designation || s.role}</td>
                    <td className="px-4 py-3 text-slate-600">{s.department || 'Academics'}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{s.phone || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{s.qualification || '—'}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      Rs. {Number(s.salary || 0).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-emerald-50 text-emerald-700">
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. EXAMS & MARKS REPORT */}
      {activeReport === 'exams' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Examination Assessments &amp; Evaluations ({assessments.length} Assessments)
            </h3>
            <span className="text-[11px] text-slate-500">Board &amp; Academy Examination</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Assessment Title</th>
                  <th className="px-4 py-3">Class</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Exam Type</th>
                  <th className="px-4 py-3 text-right">Total Marks</th>
                  <th className="px-4 py-3 text-right">Passing Marks</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assessments.map(a => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-bold text-slate-900">{a.title}</td>
                    <td className="px-4 py-3 text-slate-800 font-semibold">{a.class?.name || 'Class'}</td>
                    <td className="px-4 py-3 text-slate-700">{a.subject?.name || 'Subject'}</td>
                    <td className="px-4 py-3 capitalize">{a.assessment_type}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{a.total_marks}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-600">{a.passing_marks}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider bg-blue-50 text-blue-700">
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. TREASURY ACCOUNTS REPORT */}
      {activeReport === 'finance' && (
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            {accounts.map(acc => (
              <div key={acc.id} className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">{acc.bank_name}</span>
                <p className="text-xs font-bold text-slate-900 mt-0.5 truncate">{acc.name}</p>
                <p className="text-[11px] font-mono text-slate-400">{acc.account_number}</p>
                <div className="mt-3 pt-2 border-t border-slate-100 flex items-baseline justify-between">
                  <span className="text-xs text-slate-500">Balance:</span>
                  <span className="text-base font-black font-mono text-emerald-700">
                    Rs. {Number(acc.current_balance).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. OPERATIONAL EXPENSES REPORT */}
      {activeReport === 'expenses' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Operational Expenditures ({filteredExpenses.length} Records — Total: Rs. {filteredExpenses.reduce((s, e) => s + Number(e.amount), 0).toLocaleString()})
            </h3>
            <span className="text-[11px] text-slate-500">Finance &amp; Audit Trail</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Payee / Vendor</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Payment Account</th>
                  <th className="px-4 py-3">Ref #</th>
                  <th className="px-4 py-3 text-right">Amount (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">{e.date}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        {e.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900">{e.payee_name || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{e.description || '—'}</td>
                    <td className="px-4 py-3 text-slate-700 font-medium">{e.payment_account?.name || 'Cash'}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{e.reference_no || '—'}</td>
                    <td className="px-4 py-3 text-right font-black font-mono text-rose-600">
                      Rs. {Number(e.amount).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 8. FACULTY PAYROLL REPORT */}
      {activeReport === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Faculty Payroll Disbursements ({filteredPayrolls.length} Records — Disbursed: Rs. {filteredPayrolls.filter(p => p.payment_status === 'paid').reduce((s, p) => s + Number(p.net_salary), 0).toLocaleString()})
            </h3>
            <span className="text-[11px] text-slate-500">Teacher Salaries Ledger</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Teacher</th>
                  <th className="px-4 py-3">Cycle</th>
                  <th className="px-4 py-3 text-right">Basic Salary</th>
                  <th className="px-4 py-3 text-right">Allowances</th>
                  <th className="px-4 py-3 text-right">Deductions</th>
                  <th className="px-4 py-3 text-right">Advance Rec.</th>
                  <th className="px-4 py-3 text-right">Net Payable</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayrolls.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{p.staff?.name || 'Teacher'}</div>
                      <div className="text-[10px] text-slate-400">{p.staff?.designation || p.staff?.employee_id}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{p.salary_month}</td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700">Rs. {Number(p.basic_salary).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-emerald-700">+{Number(p.allowances || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-700">-{Number(p.deductions || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono text-rose-700">-{Number(p.advance_salary_deducted || 0).toLocaleString()}</td>
                    <td className="px-4 py-3 text-right font-mono font-black text-slate-900 text-sm">
                      Rs. {Number(p.net_salary).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        p.payment_status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.payment_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
