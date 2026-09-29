import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Calendar,
  Clock,
  BookOpen,
  Award,
  FileText,
  ExternalLink,
  Printer,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import {
  StudentPortalOverview,
  StudentWithEnrollment,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { StudentReportCardModal } from '../exams/StudentReportCardModal';

interface StudentPortalPageProps {
  settings?: AcademySettings | null;
}

type StudentPortalTab = 'timetable' | 'attendance' | 'results' | 'sos' | 'materials' | 'profile';

export const StudentPortalPage: React.FC<StudentPortalPageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<StudentPortalTab>('timetable');
  const [overview, setOverview] = useState<StudentPortalOverview | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Load students list
  useEffect(() => {
    const loadStudents = async () => {
      if (!selectedAcademicYear) return;
      try {
        const list = await databaseService.getStudents(selectedAcademicYear.id);
        const activeList = list.filter(s => s.status === 'active');
        setStudents(activeList);
        if (activeList.length > 0 && !selectedStudentId) {
          setSelectedStudentId(activeList[0].id);
        }
      } catch (err) {
        console.error('Failed to load students for portal:', err);
      }
    };
    loadStudents();
  }, [selectedAcademicYear]);

  // Load overview for selected student
  const fetchOverview = async () => {
    if (!selectedStudentId || !selectedAcademicYear) return;
    setIsLoading(true);
    try {
      const data = await databaseService.getStudentPortalOverview(selectedStudentId, selectedAcademicYear.id);
      setOverview(data);
    } catch (err: any) {
      toast.error('Failed to load student dashboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedStudentId, selectedAcademicYear]);

  const student = overview?.student;
  const attendance = overview?.attendanceSummary;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Mobile-First Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-indigo-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-400/30 uppercase tracking-wider">
                Phase 9 • Student Portal
              </span>
              <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded font-mono">
                {selectedAcademicYear?.name || '2026-27'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
              Student Learning &amp; Records Dashboard
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Real-time academic portal for lectures, attendance, marks, official marksheets, and digital curriculum notes.
            </p>
          </div>

          {/* Student Switcher for multi-student navigation / testing */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0 min-w-[240px]">
            <label className="block text-[10px] uppercase font-bold text-slate-300 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Current Student</span>
              <span className="text-[9px] text-indigo-200">Switch Profile</span>
            </label>
            <select
              value={selectedStudentId}
              onChange={e => setSelectedStudentId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.student_name} ({s.admission_no})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-xs font-semibold text-slate-600">Loading student profile &amp; records...</span>
        </div>
      )}

      {/* Student Hero Card & Quick Stats */}
      {!isLoading && student && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0 tracking-wider">
                {student.student_name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{student.student_name}</h2>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full uppercase">
                    {student.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Adm: <span className="font-mono font-semibold text-slate-800">{student.admission_no}</span>
                  {student.academic_record?.roll_no && (
                    <> • Roll No: <span className="font-mono font-semibold text-slate-800">{student.academic_record.roll_no}</span></>
                  )}
                  {student.father_name && <> • S/O {student.father_name}</>}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-[11px] font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-lg border border-slate-200/60">
                    {student.academic_record?.class?.name || 'Class 9'}
                  </span>
                  <span className="text-[11px] font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-lg border border-indigo-200/60">
                    Section {student.academic_record?.section?.name || 'Science'}
                  </span>
                  {student.academic_record?.batch && (
                    <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 px-2.5 py-0.5 rounded-lg border border-amber-200/60">
                      {student.academic_record.batch.name}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action: Printable Report Card */}
            <div className="flex items-center space-x-3 self-end sm:self-center">
              <button
                type="button"
                onClick={() => setIsReportCardOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Marksheet</span>
              </button>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Attendance %</span>
                <Clock className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {attendance?.percentage ?? 100}%
                </span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                  Regular
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                {attendance?.presentDays || 0} Present / {attendance?.totalDays || 0} Recorded Days
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Overall Grade</span>
                <Award className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-indigo-900 font-mono">
                  {overview?.reportCard?.overall_grade || 'A+'}
                </span>
                <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded font-mono">
                  {overview?.reportCard?.overall_percentage || 85}%
                </span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Result: <span className="font-bold text-emerald-700">PASS</span> • {overview?.recentMarks.length || 0} Tests Evaluated
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Today's Lectures</span>
                <Calendar className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {overview?.todaySlots.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Periods</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Classroom schedule for today
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider">Upcoming Exams</span>
                <TrendingUp className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-black text-amber-900 font-mono">
                  {overview?.upcomingAssessments.length || 0}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Scheduled</span>
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                On official datesheet
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'timetable', label: "Today's Schedule", icon: Clock },
          { id: 'attendance', label: 'Attendance Log', icon: UserCheck },
          { id: 'results', label: 'Exam Results', icon: Award },
          { id: 'sos', label: 'Syllabus (SOS)', icon: BookOpen },
          { id: 'materials', label: 'Study Materials', icon: FileText },
          { id: 'profile', label: 'Student Bio', icon: GraduationCap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as StudentPortalTab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-indigo-600 text-indigo-700 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: TODAY'S TIMETABLE */}
      {activeTab === 'timetable' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Today's Class Schedule</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Lectures, assigned teachers, timings, and classrooms.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-200/60">
              {new Date().toLocaleDateString('en-PK', { weekday: 'long', month: 'short', day: 'numeric' })}
            </span>
          </div>

          {overview?.todaySlots.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No scheduled classes for today</p>
              <p className="text-[11px] text-slate-400 mt-1">Enjoy your study break or review syllabus materials.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {overview?.todaySlots.map(slot => (
                <div
                  key={slot.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-slate-200/80 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/20 transition gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center font-bold text-xs shrink-0">
                      <span className="text-[9px] uppercase font-normal text-slate-400">Prd</span>
                      <span>{slot.period_number}</span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{slot.subject_name}</h4>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        Teacher: <span className="text-slate-800 font-semibold">{slot.teacher_name}</span>
                        {slot.room_number && <> • Room: <span className="font-semibold text-slate-800">{slot.room_number}</span></>}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 font-mono text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 self-start sm:self-center">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Attendance Summary</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Attendance records for the current academic session.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present</span>
              <span className="text-2xl font-black text-emerald-900 mt-1 block font-mono">
                {attendance?.presentDays || 0}
              </span>
              <span className="text-[10px] text-emerald-600 mt-0.5 block">Full day attendance</span>
            </div>
            <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/60">
              <span className="text-[10px] uppercase font-bold text-red-700 block">Absent</span>
              <span className="text-2xl font-black text-red-900 mt-1 block font-mono">
                {attendance?.absentDays || 0}
              </span>
              <span className="text-[10px] text-red-600 mt-0.5 block">Unexcused absence</span>
            </div>
            <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
              <span className="text-[10px] uppercase font-bold text-amber-700 block">Leave / Late</span>
              <span className="text-2xl font-black text-amber-900 mt-1 block font-mono">
                {attendance?.leaveDays || 0}
              </span>
              <span className="text-[10px] text-amber-600 mt-0.5 block">Approved applications</span>
            </div>
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200/60">
              <span className="text-[10px] uppercase font-bold text-indigo-700 block">Total Days</span>
              <span className="text-2xl font-black text-indigo-900 mt-1 block font-mono">
                {attendance?.totalDays || 0}
              </span>
              <span className="text-[10px] text-indigo-600 mt-0.5 block">Overall Sessions</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXAM RESULTS & REPORT CARD */}
      {activeTab === 'results' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Examination Scores &amp; Report Card</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Official marks and grades recorded by course instructors.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsReportCardOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Marksheet</span>
            </button>
          </div>

          {overview?.recentMarks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No test results recorded yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Evaluated marks will appear here once tests are conducted.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Test Title</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Max Marks</th>
                      <th className="px-4 py-3 text-right">Obtained</th>
                      <th className="px-4 py-3 text-right">Percentage</th>
                      <th className="px-4 py-3 text-center">Grade</th>
                      <th className="px-4 py-3">Teacher Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {overview?.recentMarks.map((res, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition">
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {res.subject_name}
                          <span className="block text-[10px] font-mono text-slate-400 font-normal">{res.subject_code}</span>
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-700">
                          {res.assessment_title}
                          <span className="block text-[9px] uppercase font-semibold text-indigo-600">{res.assessment_type}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                          {res.test_date}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold text-slate-500">
                          {res.total_marks}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                          {res.is_absent ? (
                            <span className="text-red-600 font-bold">ABS</span>
                          ) : (
                            res.obtained_marks
                          )}
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-semibold">
                          {res.is_absent ? (
                            '0%'
                          ) : (
                            <span className={res.percentage && res.percentage >= 50 ? 'text-emerald-700' : 'text-red-600'}>
                              {res.percentage}%
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                            res.grade === 'A+' ? 'bg-emerald-100 text-emerald-800' :
                            res.grade === 'A' ? 'bg-emerald-50 text-emerald-700' :
                            res.grade === 'B' ? 'bg-blue-50 text-blue-700' :
                            res.grade === 'C' ? 'bg-amber-50 text-amber-700' :
                            'bg-red-50 text-red-700'
                          }`}>
                            {res.grade || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 italic text-[11px]">
                          {res.remarks || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SCHEME OF STUDY (SOS) */}
      {activeTab === 'sos' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Academic Scheme of Study (SOS) Roadmap</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Month-wise syllabus targets and curriculum milestones for your class.
            </p>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
            {[
              { month: 'May 2026', subject: 'Mathematics (9th)', chapter: 'Matrices & Determinants', topics: 'Introduction to Matrices, Types of Matrices, Addition & Subtraction, Cramer Rule', status: 'completed' },
              { month: 'June 2026', subject: 'Mathematics (9th)', chapter: 'Real and Complex Numbers', topics: 'Radicals, Laws of Exponents, Complex numbers, Basic operations', status: 'completed' },
              { month: 'July 2026', subject: 'Mathematics (9th)', chapter: 'Logarithms', topics: 'Scientific notation, Laws of logarithms, Application in computation', status: 'in_progress' },
              { month: 'May 2026', subject: 'Physics (9th)', chapter: 'Physical Quantities & Measurement', topics: 'Introduction to Physics, International System of Units, Vernier Callipers & Screw Gauge', status: 'completed' },
              { month: 'June 2026', subject: 'Physics (9th)', chapter: 'Kinematics', topics: 'Rest and Motion, Scalars & Vectors, Equations of Motion under Gravity', status: 'in_progress' },
            ].map((unit, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {unit.month}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{unit.subject}</span>
                  </div>
                  <h4 className="font-bold text-indigo-950 text-xs mt-1">{unit.chapter}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{unit.topics}</p>
                </div>
                <div className="self-start sm:self-center">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase font-mono ${
                    unit.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {unit.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: STUDY MATERIALS & NOTES */}
      {activeTab === 'materials' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Course Materials &amp; Lecture Slides</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Download lecture notes, practice worksheets, and past papers uploaded by teachers.
            </p>
          </div>

          {overview?.studyMaterials.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No study materials published yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Materials uploaded by teachers will be accessible here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {overview?.studyMaterials.map(mat => (
                <div key={mat.id} className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/40 transition flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60 px-2 py-0.5 rounded uppercase">
                        {mat.content_type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(mat.created_at || '').toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-xs">{mat.title}</h4>
                    {mat.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{mat.description}</p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">Class 9th Material</span>
                    {mat.file_url ? (
                      <a
                        href={mat.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition"
                      >
                        <span>Download Resource</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No attachment link</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: STUDENT BIO & PROFILE */}
      {activeTab === 'profile' && student && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Student Bio &amp; Official Enrollment</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Personal registration profile and parent emergency contacts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Personal Information</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-bold text-slate-900">{student.student_name}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Father's Name</span>
                  <span className="font-semibold text-slate-900">{student.father_name || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mother's Name</span>
                  <span className="font-semibold text-slate-900">{student.mother_name || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">B-Form / CNIC</span>
                  <span className="font-mono font-semibold text-slate-900">{student.cnic_bform || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Date of Birth</span>
                  <span className="font-mono font-semibold text-slate-900">{student.dob || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Gender</span>
                  <span className="font-semibold text-slate-900">{student.gender || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Blood Group</span>
                  <span className="font-mono font-bold text-red-600">{student.blood_group || '—'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">Contact &amp; Academy Details</span>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Student Phone</span>
                  <span className="font-mono font-semibold text-slate-900">{student.phone || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Emergency Contact</span>
                  <span className="font-mono font-semibold text-slate-900">{student.emergency_contact || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Residential Address</span>
                  <span className="font-medium text-slate-900 text-right max-w-xs">{student.address || '—'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Admission Date</span>
                  <span className="font-mono font-semibold text-slate-900">{student.created_at?.slice(0, 10) || '2026-05-01'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Class Enrolled</span>
                  <span className="font-bold text-slate-900">{student.academic_record?.class?.name || 'Class 9'}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Section &amp; Batch</span>
                  <span className="font-bold text-slate-900">
                    {student.academic_record?.section?.name || 'Science'} • {student.academic_record?.batch?.name || 'Advance Batch'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Official Marksheet Modal */}
      {isReportCardOpen && student && selectedAcademicYear && (
        <StudentReportCardModal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          studentId={student.id}
          academicYearId={selectedAcademicYear.id}
          settings={settings}
        />
      )}
    </div>
  );
};
