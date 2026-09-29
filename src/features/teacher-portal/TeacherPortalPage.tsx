import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  BookOpen,
  Users,
  Award,
  UserCheck,
  Save,
  X,
  Smartphone,
  CalendarDays
} from 'lucide-react';
import {
  Staff,
  TimetableSlot,
  AttendanceStatus,
  DayOfWeek,
  StudentWithEnrollment,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { MarksEntryModal } from '../exams/MarksEntryModal';

interface TeacherPortalPageProps {
  settings?: AcademySettings | null;
}

export const TeacherPortalPage: React.FC<TeacherPortalPageProps> = ({ settings: _settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('Monday');
  const [isLoading, setIsLoading] = useState(false);

  // Portal data
  const [overview, setOverview] = useState<any>(null);

  // Quick Attendance modal for lecture
  const [activeAttendanceSlot, setActiveAttendanceSlot] = useState<TimetableSlot | null>(null);
  const [slotStudents, setSlotStudents] = useState<StudentWithEnrollment[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [isSavingAttendance, setIsSavingAttendance] = useState(false);

  // Marks modal for teacher tests
  const [activeTestForMarks, setActiveTestForMarks] = useState<any | null>(null);

  // Days list
  const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Detect current day
  useEffect(() => {
    const dayNames: DayOfWeek[] = ['Sunday' as any, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = dayNames[new Date().getDay()];
    if (DAYS.includes(today)) {
      setSelectedDay(today);
    }
  }, []);

  // Load teachers
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staff = await databaseService.getStaff();
        const teacherList = staff.filter(s => s.role === 'teacher' && s.status === 'active');
        setTeachers(teacherList);
        if (teacherList.length > 0 && !selectedTeacherId) {
          setSelectedTeacherId(teacherList[0].id);
        }
      } catch (err) {
        console.error('Failed to load teachers:', err);
      }
    };
    loadStaff();
  }, []);

  // Fetch overview when teacher changes
  const fetchTeacherOverview = async () => {
    if (!selectedAcademicYear || !selectedTeacherId) return;
    setIsLoading(true);
    try {
      const data = await databaseService.getTeacherPortalOverview(selectedTeacherId, selectedAcademicYear.id);
      setOverview(data);
    } catch (err) {
      console.error('Failed to fetch teacher portal data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeacherOverview();
  }, [selectedTeacherId, selectedAcademicYear]);

  // Open lecture attendance drawer
  const handleOpenAttendance = async (slot: TimetableSlot) => {
    if (!selectedAcademicYear) return;
    setActiveAttendanceSlot(slot);
    try {
      const allStudents = await databaseService.getStudents(selectedAcademicYear.id);
      const relevant = allStudents.filter(s => {
        if (!s.academic_record) return false;
        if (s.academic_record.class_id !== slot.class_id) return false;
        if (slot.section_id && s.academic_record.section_id !== slot.section_id) return false;
        return true;
      });
      setSlotStudents(relevant);

      // Check existing attendance for this slot today
      const todayDate = new Date().toISOString().split('T')[0];
      const existing = await databaseService.getLectureAttendance({
        academic_year_id: selectedAcademicYear.id,
        timetable_slot_id: slot.id,
        date: todayDate,
      });

      const statusMap: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      relevant.forEach(st => {
        const match = existing.find(e => e.student_id === st.id);
        statusMap[st.id] = {
          status: match ? match.status : 'Present', // default to Present for convenience
          remarks: match?.remarks || '',
        };
      });
      setStudentStatuses(statusMap);
    } catch (err) {
      toast.error('Failed to load students for lecture attendance');
    }
  };

  // Mark all present shortcut
  const handleMarkAllPresent = () => {
    const updated = { ...studentStatuses };
    slotStudents.forEach(st => {
      updated[st.id] = { ...updated[st.id], status: 'Present' };
    });
    setStudentStatuses(updated);
  };

  // Save lecture attendance
  const handleSaveLectureAttendance = async () => {
    if (!activeAttendanceSlot || !selectedAcademicYear || !selectedTeacherId) return;
    setIsSavingAttendance(true);
    try {
      const todayDate = new Date().toISOString().split('T')[0];
      const records = slotStudents.map(st => ({
        academic_year_id: selectedAcademicYear.id,
        timetable_slot_id: activeAttendanceSlot.id,
        student_id: st.id,
        subject_id: activeAttendanceSlot.subject_id,
        teacher_id: selectedTeacherId,
        class_id: activeAttendanceSlot.class_id,
        section_id: activeAttendanceSlot.section_id || null,
        date: todayDate,
        status: studentStatuses[st.id]?.status || 'Present',
        remarks: studentStatuses[st.id]?.remarks || null,
        recorded_by: selectedTeacherId,
      }));

      await databaseService.recordLectureAttendanceBatch(records);
      toast.success(`Lecture attendance recorded for ${records.length} students!`);
      setActiveAttendanceSlot(null);
      fetchTeacherOverview();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save attendance');
    } finally {
      setIsSavingAttendance(false);
    }
  };

  // Filter slots by selectedDay
  const daySlots: any[] = overview?.weeklySlots?.filter((s: any) => s.day_of_week === selectedDay) || [];

  return (
    <div className="space-y-6">
      {/* Mobile Portal Announcement Banner */}
      <div className="bg-slate-900 text-white p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm border border-slate-800">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded uppercase">
                Phase 7 Mobile-First Module
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                {selectedAcademicYear?.name || '2026-27'}
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white mt-1">
              Teacher Classroom &amp; Lecture Portal
            </h1>
            <p className="text-xs text-slate-400">
              Personalized teacher dashboard for lecture attendance, assigned subject SOS, and classroom tests.
            </p>
          </div>
        </div>

        {/* Teacher Switcher (Admins/Teachers can switch) */}
        <div className="flex items-center space-x-2 bg-slate-800/80 p-2 rounded-xl border border-slate-700/80">
          <span className="text-xs text-slate-300 font-semibold pl-1 whitespace-nowrap">Viewing Teacher:</span>
          <select
            value={selectedTeacherId}
            onChange={e => setSelectedTeacherId(e.target.value)}
            className="text-xs font-bold bg-slate-900 text-white rounded-lg px-3 py-1.5 border border-slate-600 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
          >
            {teachers.map(t => (
              <option key={t.id} value={t.id}>{t.name} ({t.designation})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-xs font-semibold text-slate-500">Loading teacher schedule &amp; classes...</span>
        </div>
      )}

      {/* Teacher Profile Summary Bar */}
      {!isLoading && overview?.teacher && (
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-base shrink-0 tracking-wider">
              {overview.teacher.name.split(' ').slice(0, 2).map((n: string) => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-extrabold text-slate-900 text-base">{overview.teacher.name}</h3>
                <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-bold uppercase">
                  {overview.teacher.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {overview.teacher.designation} • {overview.teacher.department || 'Academic Department'} • {overview.teacher.email}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Classes</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{overview.teacherAssignments?.length || 0} Batches</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Today's Lectures</span>
              <span className="font-mono font-bold text-slate-900 text-sm">{overview.todaySlots?.length || 0} Periods</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance Pending</span>
              <span className={`font-mono font-bold text-sm ${overview.pendingAttendanceCount > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
                {overview.pendingAttendanceCount} Pending
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Left Today's Classes & Timetable, Right Assigned Subjects & SOS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Timetable & Lecture Attendance */}
        <div className="lg:col-span-2 space-y-4">
          {/* Day of Week Selector */}
          <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80 shadow-2xs overflow-x-auto custom-scroll">
            <div className="flex items-center space-x-1.5">
              <CalendarDays className="w-4 h-4 text-slate-400 ml-1 mr-1" />
              {DAYS.map(day => {
                const isSelected = selectedDay === day;
                const isToday = overview?.todayDayName === day;
                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 whitespace-nowrap ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{day}</span>
                    {isToday && (
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-amber-400' : 'bg-slate-900'}`} />
                    )}
                  </button>
                );
              })}
            </div>
            {selectedDay === overview?.todayDayName && (
              <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 hidden sm:inline-block">
                ★ Live Today
              </span>
            )}
          </div>

          {/* Today's Lectures Card Header */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedDay}'s Scheduled Lectures
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tap &ldquo;Mark Attendance&rdquo; to record student roll call for that period
                </p>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg">
                {daySlots.length} Classes
              </span>
            </div>

            <div className="p-4 space-y-3">
              {daySlots.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No lectures scheduled for {selectedDay}. Enjoy your preparation time!
                </div>
              ) : (
                daySlots.map((slot: any) => {
                  const isToday = selectedDay === overview?.todayDayName;
                  const isMarked = slot.isAttendanceMarked;

                  return (
                    <div
                      key={slot.id}
                      className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isMarked
                          ? 'bg-emerald-50/20 border-emerald-200/80'
                          : 'bg-white border-slate-200/80 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3.5">
                        <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex flex-col items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold uppercase text-slate-400">P{slot.period_number}</span>
                          <Clock className="w-4 h-4 text-amber-400 mt-0.5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h4 className="font-extrabold text-slate-900 text-sm">
                              {slot.subject?.name}
                            </h4>
                            <span className="text-[10px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold">
                              {slot.subject?.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 font-semibold mt-0.5">
                            {slot.class?.name} {slot.section ? `• Section ${slot.section.name}` : ''}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                            {slot.start_time?.slice(0, 5)} - {slot.end_time?.slice(0, 5)} {slot.room ? `• Room ${slot.room}` : ''}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {isToday && isMarked ? (
                          <button
                            type="button"
                            onClick={() => handleOpenAttendance(slot)}
                            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold transition"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Attendance Done</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenAttendance(slot)}
                            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                          >
                            <UserCheck className="w-4 h-4 text-amber-400" />
                            <span>Mark Attendance</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Scheme of Study / Curriculum Progress */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Scheme of Study (SOS) Roadmap</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {overview?.teacherSOS?.length || 0} Units Assigned
              </span>
            </div>

            <div className="space-y-2.5">
              {overview?.teacherSOS?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No SOS roadmap units defined for your allocated subjects.
                </p>
              ) : (
                overview?.teacherSOS?.map((sos: any) => (
                  <div key={sos.id} className="p-3 bg-slate-50 border border-slate-200/70 rounded-xl flex items-start justify-between gap-3 text-xs">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                          {sos.month_name}
                        </span>
                        <span className="font-bold text-slate-800">{sos.chapter_title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">{sos.topics_covered}</p>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                        sos.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sos.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {sos.status.replace('_', ' ')}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: My Classes & Tests */}
        <div className="space-y-4">
          {/* Assigned Classes */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">My Allocated Classes</h3>
              </div>
              <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                {overview?.teacherAssignments?.length || 0}
              </span>
            </div>

            <div className="space-y-2">
              {overview?.teacherAssignments?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No class assignments recorded for this teacher.
                </p>
              ) : (
                overview?.teacherAssignments?.map((ta: any) => (
                  <div key={ta.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-100/50 transition">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{ta.subject?.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{ta.subject?.code}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      {ta.class?.name} {ta.section ? `• Sec ${ta.section.name}` : ''}
                    </p>
                    {ta.is_class_teacher && (
                      <span className="inline-block mt-1 text-[9px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                        Class Incharge
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Teacher Assessments / Marks */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-slate-700" />
                <h3 className="font-bold text-slate-900 text-sm">Assessments &amp; Marks Entry</h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">
                {overview?.teacherAssessments?.length || 0} Tests
              </span>
            </div>

            <div className="space-y-2.5">
              {overview?.teacherAssessments?.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No tests scheduled yet for your subjects.
                </p>
              ) : (
                overview?.teacherAssessments?.map((test: any) => (
                  <div key={test.id} className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs">{test.title}</span>
                      <span className="text-[10px] font-mono bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-bold uppercase">
                        {test.total_marks} Marks
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium">
                      {test.class?.name} • {test.subject?.name} • {test.test_date}
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTestForMarks(test)}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-400" />
                      <span>Enter / Edit Marks</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK LECTURE ATTENDANCE MODAL */}
      {activeAttendanceSlot && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Lecture Attendance Register
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeAttendanceSlot.subject?.name} • {activeAttendanceSlot.class?.name} {activeAttendanceSlot.section ? `(${activeAttendanceSlot.section.name})` : ''} • Period {activeAttendanceSlot.period_number}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveAttendanceSlot(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="px-6 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between text-xs shrink-0">
              <span className="font-semibold text-slate-600">
                {slotStudents.length} Students in Roster
              </span>
              <button
                type="button"
                onClick={handleMarkAllPresent}
                className="text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
              >
                ✓ Mark All Present
              </button>
            </div>

            {/* Students List */}
            <div className="flex-1 overflow-y-auto p-4 custom-scroll space-y-2">
              {slotStudents.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No students enrolled in this section.
                </div>
              ) : (
                slotStudents.map(student => {
                  const state = studentStatuses[student.id] || { status: 'Present', remarks: '' };
                  return (
                    <div
                      key={student.id}
                      className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{student.student_name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {student.admission_no} {student.father_name ? `• S/O ${student.father_name}` : ''}
                        </p>
                      </div>

                      {/* Status toggle buttons */}
                      <div className="flex items-center space-x-1.5">
                        {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map(st => {
                          const isSelected = state.status === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => {
                                setStudentStatuses({
                                  ...studentStatuses,
                                  [student.id]: { ...state, status: st },
                                });
                              }}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                isSelected
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white'
                                    : st === 'Late'
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-blue-600 text-white'
                                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setActiveAttendanceSlot(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveLectureAttendance}
                disabled={isSavingAttendance || slotStudents.length === 0}
                className="flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingAttendance ? 'Saving Attendance...' : 'Submit Attendance'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Marks Entry Modal */}
      {activeTestForMarks && (
        <MarksEntryModal
          isOpen={!!activeTestForMarks}
          onClose={() => setActiveTestForMarks(null)}
          assessment={activeTestForMarks}
          onSuccess={fetchTeacherOverview}
        />
      )}
    </div>
  );
};
