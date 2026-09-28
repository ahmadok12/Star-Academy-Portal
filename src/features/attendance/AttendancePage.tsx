import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSpreadsheet,
  Users,
  Search,
  Save,
  Printer,
  BookOpen,
  Phone,
  RefreshCw,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { databaseService } from '../../lib/database-service';
import {
  AttendanceStatus,
  AttendanceKPIStats,
  StudentAttendanceSummary,
  ClassItem,
  SectionItem,
  BatchItem,
  StudentWithEnrollment,
  TimetableSlot,
  DayOfWeek
} from '../../types/database.types';

type AttendanceTab = 'daily' | 'lecture' | 'register' | 'defaulters';

const DAYS_MAP: Record<number, DayOfWeek> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday'
};

export const AttendancePage: React.FC = () => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<AttendanceTab>('daily');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Masters
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);

  // Filter States
  const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Attendance State
  const [enrolledStudents, setEnrolledStudents] = useState<StudentWithEnrollment[]>([]);
  const [dailyAttendanceMap, setDailyAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});
  const [dailyKPIs, setDailyKPIs] = useState<AttendanceKPIStats>({
    total: 0,
    present: 0,
    absent: 0,
    late: 0,
    leave: 0,
    percentage: 100
  });

  // Lecture Attendance State
  const [timetableSlots, setTimetableSlots] = useState<TimetableSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<string>('');
  const [lectureAttendanceMap, setLectureAttendanceMap] = useState<Record<string, { status: AttendanceStatus; remarks: string }>>({});

  // Monthly Register State
  const [registerMonth, setRegisterMonth] = useState<number>(new Date().getMonth() + 1);
  const [registerYear, setRegisterYear] = useState<number>(new Date().getFullYear());
  const [monthlySummaries, setMonthlySummaries] = useState<StudentAttendanceSummary[]>([]);
  const [isLoadingRegister, setIsLoadingRegister] = useState(false);

  // Defaulters State
  const [defaulterThreshold, setDefaulterThreshold] = useState<number>(75);
  const [defaultersList, setDefaultersList] = useState<StudentAttendanceSummary[]>([]);
  const [isLoadingDefaulters, setIsLoadingDefaulters] = useState(false);

  // Quick Date Helpers
  const handleSetToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleDateShift = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  // 1. Initial Load of Reference Data
  useEffect(() => {
    const loadMasters = async () => {
      try {
        setIsLoading(true);
        const [cList, sList, bList] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSections(),
          databaseService.getBatches()
        ]);
        setClasses(cList);
        setSections(sList);
        setBatches(bList);

        if (cList.length > 0 && !selectedClassId) {
          // Default to Class 9 or first class
          const preferred = cList.find(c => c.name.includes('9') || c.code === 'CL-9') || cList[0];
          setSelectedClassId(preferred.id);
        }
      } catch (e) {
        console.error('Failed to load masters:', e);
        toast.error('Failed to load classes and sections');
      } finally {
        setIsLoading(false);
      }
    };
    loadMasters();
  }, [selectedAcademicYear]);

  // 2. Load Daily Attendance & Students for Selected Class, Section, and Date
  const loadDailyAttendanceData = useCallback(async () => {
    if (!selectedAcademicYear || !selectedClassId) return;

    try {
      setIsLoading(true);
      // Fetch students enrolled in this academic year and class
      const students = await databaseService.getStudents(
        selectedAcademicYear.id,
        selectedClassId,
        selectedSectionId || undefined,
        undefined,
        selectedBatchId !== 'all' ? selectedBatchId : undefined
      );
      setEnrolledStudents(students);

      // Fetch existing daily attendance records for this date
      const records = await databaseService.getDailyAttendance({
        academic_year_id: selectedAcademicYear.id,
        date: selectedDate,
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
        batch_id: selectedBatchId !== 'all' ? selectedBatchId : undefined
      });

      // Populate local editing map
      const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      students.forEach(st => {
        const found = records.find(r => r.student_id === st.id);
        if (found) {
          map[st.id] = { status: found.status, remarks: found.remarks || '' };
        } else {
          // Default to Present if not yet marked
          map[st.id] = { status: 'Present', remarks: '' };
        }
      });
      setDailyAttendanceMap(map);

      // Compute KPIs
      const kpis = await databaseService.getAttendanceKPIs(
        selectedAcademicYear.id,
        selectedDate,
        selectedClassId,
        selectedSectionId || undefined
      );
      setDailyKPIs(kpis);
    } catch (e) {
      console.error('Failed to load daily attendance data:', e);
      toast.error('Failed to load attendance records');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear, selectedClassId, selectedSectionId, selectedBatchId, selectedDate, toast]);

  useEffect(() => {
    if (activeTab === 'daily') {
      loadDailyAttendanceData();
    }
  }, [activeTab, loadDailyAttendanceData]);

  // 3. Load Timetable Slots for Lecture Attendance
  const loadLectureSlots = useCallback(async () => {
    if (!selectedAcademicYear || !selectedClassId) return;

    try {
      const selectedDayOfWeek = DAYS_MAP[new Date(selectedDate).getDay()] || 'Monday';
      const allSlots = await databaseService.getTimetableSlots({
        academicYearId: selectedAcademicYear.id,
        classId: selectedClassId,
        sectionId: selectedSectionId || undefined,
        dayOfWeek: selectedDayOfWeek
      });

      setTimetableSlots(allSlots);
      if (allSlots.length > 0 && !selectedSlotId) {
        setSelectedSlotId(allSlots[0].id);
      }
    } catch (e) {
      console.error('Failed to load timetable slots for lecture attendance:', e);
    }
  }, [selectedAcademicYear, selectedClassId, selectedSectionId, selectedDate, selectedSlotId]);

  useEffect(() => {
    if (activeTab === 'lecture') {
      loadLectureSlots();
    }
  }, [activeTab, loadLectureSlots]);

  // 4. Load Lecture Attendance Records for Selected Slot
  const loadSlotAttendance = useCallback(async () => {
    if (!selectedAcademicYear || !selectedSlotId) return;

    try {
      setIsLoading(true);
      const slot = timetableSlots.find(s => s.id === selectedSlotId);
      if (!slot) return;

      const students = await databaseService.getStudents(
        selectedAcademicYear.id,
        slot.class_id,
        slot.section_id || undefined
      );
      setEnrolledStudents(students);

      const records = await databaseService.getLectureAttendance({
        academic_year_id: selectedAcademicYear.id,
        timetable_slot_id: selectedSlotId,
        date: selectedDate
      });

      const map: Record<string, { status: AttendanceStatus; remarks: string }> = {};
      students.forEach(st => {
        const found = records.find(r => r.student_id === st.id);
        if (found) {
          map[st.id] = { status: found.status, remarks: found.remarks || '' };
        } else {
          map[st.id] = { status: 'Present', remarks: '' };
        }
      });
      setLectureAttendanceMap(map);
    } catch (e) {
      console.error('Failed to load slot attendance:', e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear, selectedSlotId, selectedDate, timetableSlots]);

  useEffect(() => {
    if (activeTab === 'lecture' && selectedSlotId) {
      loadSlotAttendance();
    }
  }, [activeTab, selectedSlotId, loadSlotAttendance]);

  // 5. Load Monthly Register Matrix
  const loadMonthlyRegister = useCallback(async () => {
    if (!selectedAcademicYear || !selectedClassId) return;

    try {
      setIsLoadingRegister(true);
      const summaries = await databaseService.getStudentMonthlyRegister({
        academic_year_id: selectedAcademicYear.id,
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
        month: registerMonth,
        year: registerYear
      });
      setMonthlySummaries(summaries);
    } catch (e) {
      console.error('Failed to load monthly register:', e);
      toast.error('Failed to load monthly register');
    } finally {
      setIsLoadingRegister(false);
    }
  }, [selectedAcademicYear, selectedClassId, selectedSectionId, registerMonth, registerYear, toast]);

  useEffect(() => {
    if (activeTab === 'register') {
      loadMonthlyRegister();
    }
  }, [activeTab, loadMonthlyRegister]);

  // 6. Load Defaulters List
  const loadDefaulters = useCallback(async () => {
    if (!selectedAcademicYear) return;

    try {
      setIsLoadingDefaulters(true);
      const defs = await databaseService.getAttendanceDefaulters(
        selectedAcademicYear.id,
        defaulterThreshold,
        selectedClassId || undefined
      );
      setDefaultersList(defs);
    } catch (e) {
      console.error('Failed to load defaulters:', e);
      toast.error('Failed to load defaulters list');
    } finally {
      setIsLoadingDefaulters(false);
    }
  }, [selectedAcademicYear, selectedClassId, defaulterThreshold, toast]);

  useEffect(() => {
    if (activeTab === 'defaulters') {
      loadDefaulters();
    }
  }, [activeTab, loadDefaulters]);

  // Bulk Status Updaters for Daily Attendance
  const handleSetAllDailyStatus = (status: AttendanceStatus) => {
    setDailyAttendanceMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(stId => {
        next[stId] = { ...next[stId], status };
      });
      return next;
    });
  };

  const handleUpdateStudentDailyStatus = (studentId: string, status: AttendanceStatus) => {
    setDailyAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status,
        remarks: prev[studentId]?.remarks || ''
      }
    }));
  };

  const handleUpdateStudentDailyRemarks = (studentId: string, remarks: string) => {
    setDailyAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Present',
        remarks
      }
    }));
  };

  // Save Daily Attendance
  const handleSaveDailyAttendance = async () => {
    if (!selectedAcademicYear || !selectedClassId) return;

    try {
      setIsSaving(true);
      const recordsToSave = enrolledStudents.map(st => {
        const entry = dailyAttendanceMap[st.id] || { status: 'Present' as AttendanceStatus, remarks: '' };
        return {
          academic_year_id: selectedAcademicYear.id,
          student_id: st.id,
          class_id: selectedClassId,
          section_id: st.academic_record?.section_id || selectedSectionId || null,
          batch_id: st.academic_record?.batch_id || null,
          date: selectedDate,
          status: entry.status,
          remarks: entry.remarks || null,
          recorded_by: null
        };
      });

      await databaseService.recordDailyAttendanceBatch(recordsToSave);
      toast.success(`Daily attendance saved successfully for ${recordsToSave.length} students!`);
      loadDailyAttendanceData();
    } catch (e) {
      console.error('Failed to save daily attendance:', e);
      toast.error('Failed to save attendance register');
    } finally {
      setIsSaving(false);
    }
  };

  // Bulk Status Updaters for Lecture Attendance
  const handleSetAllLectureStatus = (status: AttendanceStatus) => {
    setLectureAttendanceMap(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(stId => {
        next[stId] = { ...next[stId], status };
      });
      return next;
    });
  };

  const handleUpdateStudentLectureStatus = (studentId: string, status: AttendanceStatus) => {
    setLectureAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status,
        remarks: prev[studentId]?.remarks || ''
      }
    }));
  };

  const handleUpdateStudentLectureRemarks = (studentId: string, remarks: string) => {
    setLectureAttendanceMap(prev => ({
      ...prev,
      [studentId]: {
        status: prev[studentId]?.status || 'Present',
        remarks
      }
    }));
  };

  // Save Lecture Attendance
  const handleSaveLectureAttendance = async () => {
    if (!selectedAcademicYear || !selectedSlotId) return;
    const slot = timetableSlots.find(s => s.id === selectedSlotId);
    if (!slot) return;

    try {
      setIsSaving(true);
      const recordsToSave = enrolledStudents.map(st => {
        const entry = lectureAttendanceMap[st.id] || { status: 'Present' as AttendanceStatus, remarks: '' };
        return {
          academic_year_id: selectedAcademicYear.id,
          timetable_slot_id: slot.id,
          student_id: st.id,
          subject_id: slot.subject_id,
          teacher_id: slot.teacher_id,
          class_id: slot.class_id,
          section_id: slot.section_id || null,
          date: selectedDate,
          status: entry.status,
          remarks: entry.remarks || null,
          recorded_by: slot.teacher_id
        };
      });

      await databaseService.recordLectureAttendanceBatch(recordsToSave);
      toast.success(`Lecture attendance for Period ${slot.period_number} saved!`);
      loadSlotAttendance();
    } catch (e) {
      console.error('Failed to save lecture attendance:', e);
      toast.error('Failed to save lecture attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // Filtered Students for UI search
  const filteredStudents = useMemo(() => {
    if (!searchQuery) return enrolledStudents;
    const q = searchQuery.toLowerCase();
    return enrolledStudents.filter(s =>
      s.student_name.toLowerCase().includes(q) ||
      s.admission_no.toLowerCase().includes(q) ||
      s.father_name.toLowerCase().includes(q)
    );
  }, [enrolledStudents, searchQuery]);

  // Days in month calculation for register matrix
  const daysInMonth = useMemo(() => {
    return new Date(registerYear, registerMonth, 0).getDate();
  }, [registerYear, registerMonth]);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentSection = sections.find(s => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Attendance & Registers"
        subtitle="Daily class roll calls, timetable lecture attendance, monthly registers, and low-attendance tracking."
        action={
          <div className="flex items-center space-x-2">
            {activeTab === 'daily' && (
              <button
                onClick={handleSaveDailyAttendance}
                disabled={isSaving || filteredStudents.length === 0}
                className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
                type="button"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 text-emerald-400" />
                )}
                <span>Save Daily Register</span>
              </button>
            )}

            {activeTab === 'lecture' && (
              <button
                onClick={handleSaveLectureAttendance}
                disabled={isSaving || !selectedSlotId}
                className="flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
                type="button"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Lecture Attendance</span>
              </button>
            )}

            {activeTab === 'register' && (
              <button
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 transition shadow-xs"
                type="button"
              >
                <Printer className="w-4 h-4" />
                <span>Print Register</span>
              </button>
            )}
          </div>
        }
      />

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-200/80 space-x-4">
        <button
          onClick={() => setActiveTab('daily')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'daily'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          type="button"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Daily Class Register</span>
        </button>

        <button
          onClick={() => setActiveTab('lecture')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'lecture'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          type="button"
        >
          <Clock className="w-4 h-4" />
          <span>Lecture / Period Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'register'
              ? 'border-slate-900 text-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          type="button"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Monthly Register & Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('defaulters')}
          className={`pb-3 text-xs font-bold border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'defaulters'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-slate-400 hover:text-slate-700'
          }`}
          type="button"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Defaulter Alerts (&lt; 75%)</span>
        </button>
      </div>

      {/* Global Class & Date Selector Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Date Selector with quick shortcuts */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-600">Date:</span>
          <div className="flex items-center space-x-1 bg-slate-50 border border-slate-200 rounded-xl p-1">
            <button
              onClick={() => handleDateShift(-1)}
              title="Previous Day"
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition"
              type="button"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-xs font-bold bg-transparent text-slate-900 px-2 py-0.5 border-none focus:outline-none focus:ring-0"
            />
            <button
              onClick={() => handleDateShift(1)}
              title="Next Day"
              className="p-1 hover:bg-slate-200 rounded-lg text-slate-600 transition"
              type="button"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={handleSetToday}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            type="button"
          >
            Today
          </button>
          <button
            onClick={handleSetYesterday}
            className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
            type="button"
          >
            Yesterday
          </button>
        </div>

        {/* Academic Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600">Class:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:ring-slate-900"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600">Section:</span>
            <select
              value={selectedSectionId}
              onChange={(e) => setSelectedSectionId(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-medium focus:ring-slate-900"
            >
              <option value="">All Sections</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>

          {activeTab === 'daily' && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-600">Batch:</span>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-medium focus:ring-slate-900"
              >
                <option value="all">All Batches</option>
                {batches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DAILY CLASS ATTENDANCE REGISTER                                    */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          {/* Daily Attendance KPIs Card */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Enrolled</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{dailyKPIs.total}</p>
            </div>

            <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Present (P)</span>
              <p className="text-2xl font-black text-emerald-800 mt-1">{dailyKPIs.present}</p>
            </div>

            <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">Absent (A)</span>
              <p className="text-2xl font-black text-rose-800 mt-1">{dailyKPIs.absent}</p>
            </div>

            <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">Late (L)</span>
              <p className="text-2xl font-black text-amber-800 mt-1">{dailyKPIs.late}</p>
            </div>

            <div className="bg-indigo-50/70 p-4 rounded-2xl border border-indigo-200/60 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">Leave (LV)</span>
              <p className="text-2xl font-black text-indigo-800 mt-1">{dailyKPIs.leave}</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl text-white shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Attendance Rate</span>
              <p className="text-2xl font-black text-emerald-400 mt-1">{dailyKPIs.percentage}%</p>
            </div>
          </div>

          {/* Quick Actions & Student Search Bar */}
          <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
            {/* Search Filter */}
            <div className="relative min-w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search student by name, roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {/* Quick Bulk Markers */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-500 mr-1">Bulk Mark:</span>
              <button
                onClick={() => handleSetAllDailyStatus('Present')}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                type="button"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Present</span>
              </button>

              <button
                onClick={() => handleSetAllDailyStatus('Absent')}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                type="button"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>All Absent</span>
              </button>

              <button
                onClick={() => handleSetAllDailyStatus('Late')}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition"
                type="button"
              >
                All Late
              </button>
            </div>
          </div>

          {/* Students Roll Call Grid / Table */}
          {isLoading ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Loading student class roster...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-2">
              <Users className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Students Found</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                No active enrollments match {currentClass?.name}{' '}
                {selectedSectionId ? `Section ${currentSection?.name}` : ''}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {currentClass?.name} Attendance Roll — {new Date(selectedDate).toLocaleDateString('en-PK', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mark each student&apos;s daily attendance. Click pills to toggle status.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-xl">
                  {filteredStudents.length} Students
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {filteredStudents.map((st, index) => {
                  const currentStatus = dailyAttendanceMap[st.id]?.status || 'Present';
                  const currentRemarks = dailyAttendanceMap[st.id]?.remarks || '';
                  const isSupplementary = st.academic_record?.enrollment_type === 'supplementary';

                  return (
                    <div
                      key={st.id}
                      className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                    >
                      {/* Student Info */}
                      <div className="flex items-center space-x-3 min-w-64">
                        <span className="text-xs font-mono font-bold text-slate-400 w-6">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {st.student_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="text-xs font-bold text-slate-900">{st.student_name}</p>
                            {isSupplementary && (
                              <span className="text-[9px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                                Supplementary
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {st.admission_no} • S/D of {st.father_name}
                          </p>
                        </div>
                      </div>

                      {/* Status Selector Pills & Remarks */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Status Buttons */}
                        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => handleUpdateStudentDailyStatus(st.id, 'Present')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              currentStatus === 'Present'
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStudentDailyStatus(st.id, 'Absent')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              currentStatus === 'Absent'
                                ? 'bg-rose-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStudentDailyStatus(st.id, 'Late')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              currentStatus === 'Late'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'text-slate-600 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateStudentDailyStatus(st.id, 'Leave')}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                              currentStatus === 'Leave'
                                ? 'bg-indigo-600 text-white shadow-xs'
                                : 'text-slate-600 hover:text-indigo-700'
                            }`}
                          >
                            Leave
                          </button>
                        </div>

                        {/* Optional Remarks input */}
                        <input
                          type="text"
                          placeholder="Note / remark..."
                          value={currentRemarks}
                          onChange={(e) => handleUpdateStudentDailyRemarks(st.id, e.target.value)}
                          className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-40"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Sticky Action Footer */}
              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Ready to commit roll call records for {new Date(selectedDate).toDateString()}
                </span>
                <button
                  onClick={handleSaveDailyAttendance}
                  disabled={isSaving}
                  className="flex items-center space-x-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-xs"
                  type="button"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 text-emerald-400" />
                  )}
                  <span>Commit Daily Attendance</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LECTURE / PERIOD ATTENDANCE (TIMETABLE LINKED)                     */}
      {/* ========================================================================= */}
      {activeTab === 'lecture' && (
        <div className="space-y-6">
          {/* Lecture Slot Picker */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Timetable Lectures for {DAYS_MAP[new Date(selectedDate).getDay()]}
                </h3>
                <p className="text-xs text-slate-500">
                  Select an assigned timetable slot to take period-specific attendance.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl">
                {timetableSlots.length} Scheduled
              </span>
            </div>

            {timetableSlots.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-600">
                  No lectures scheduled for {DAYS_MAP[new Date(selectedDate).getDay()]} in {currentClass?.name}.
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Configure slots in the Timetable module to enable lecture attendance.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {timetableSlots.map((slot) => {
                  const isSelected = slot.id === selectedSlotId;
                  return (
                    <button
                      key={slot.id}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={`text-left p-3.5 rounded-2xl border transition relative ${
                        isSelected
                          ? 'bg-indigo-50/80 border-indigo-500 shadow-xs ring-2 ring-indigo-500/20'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                      }`}
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-100/60 px-2 py-0.5 rounded-md">
                          Period {slot.period_number}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-slate-500">
                          {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {slot.subject?.name || 'Subject'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {slot.teacher?.name || 'Teacher'} {slot.room ? `• ${slot.room}` : ''}
                      </p>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Active Lecture Slot Roll Call */}
          {selectedSlotId && (
            <div className="space-y-4">
              {/* Slot Header Toolbar */}
              <div className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">
                    Period {timetableSlots.find(s => s.id === selectedSlotId)?.period_number} —{' '}
                    {timetableSlots.find(s => s.id === selectedSlotId)?.subject?.name}
                  </span>
                  <span className="text-xs text-slate-500">
                    ({timetableSlots.find(s => s.id === selectedSlotId)?.teacher?.name})
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-500">Bulk Mark:</span>
                  <button
                    onClick={() => handleSetAllLectureStatus('Present')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                    type="button"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>All Present</span>
                  </button>
                  <button
                    onClick={() => handleSetAllLectureStatus('Absent')}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition"
                    type="button"
                  >
                    All Absent
                  </button>
                </div>
              </div>

              {/* Lecture Roster List */}
              <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {enrolledStudents.map((st, idx) => {
                    const status = lectureAttendanceMap[st.id]?.status || 'Present';
                    const remarks = lectureAttendanceMap[st.id]?.remarks || '';

                    return (
                      <div
                        key={st.id}
                        className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                      >
                        <div className="flex items-center space-x-3 min-w-64">
                          <span className="text-xs font-mono font-bold text-slate-400 w-6">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{st.student_name}</p>
                            <p className="text-[11px] text-slate-400">{st.admission_no}</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl">
                            {(['Present', 'Absent', 'Late', 'Leave'] as AttendanceStatus[]).map((stKey) => (
                              <button
                                key={stKey}
                                type="button"
                                onClick={() => handleUpdateStudentLectureStatus(st.id, stKey)}
                                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                                  status === stKey
                                    ? stKey === 'Present'
                                      ? 'bg-emerald-600 text-white'
                                      : stKey === 'Absent'
                                      ? 'bg-rose-600 text-white'
                                      : stKey === 'Late'
                                      ? 'bg-amber-500 text-white'
                                      : 'bg-indigo-600 text-white'
                                    : 'text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {stKey}
                              </button>
                            ))}
                          </div>

                          <input
                            type="text"
                            placeholder="Lecture notes..."
                            value={remarks}
                            onChange={(e) => handleUpdateStudentLectureRemarks(st.id, e.target.value)}
                            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 w-44"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: MONTHLY REGISTER & MATRIX                                         */}
      {/* ========================================================================= */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* Month & Year Selection Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-slate-600">Month:</span>
              <select
                value={registerMonth}
                onChange={(e) => setRegisterMonth(Number(e.target.value))}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:ring-slate-900"
              >
                {[
                  'January', 'February', 'March', 'April', 'May', 'June',
                  'July', 'August', 'September', 'October', 'November', 'December'
                ].map((name, i) => (
                  <option key={i + 1} value={i + 1}>
                    {name}
                  </option>
                ))}
              </select>

              <select
                value={registerYear}
                onChange={(e) => setRegisterYear(Number(e.target.value))}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:ring-slate-900"
              >
                {[2025, 2026, 2027].map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={loadMonthlyRegister}
              disabled={isLoadingRegister}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              type="button"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingRegister ? 'animate-spin' : ''}`} />
              <span>Refresh Matrix</span>
            </button>
          </div>

          {/* Matrix Table */}
          {isLoadingRegister ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Generating monthly register matrix...</p>
            </div>
          ) : monthlySummaries.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-2">
              <FileSpreadsheet className="w-10 h-10 text-slate-300" />
              <h3 className="text-sm font-bold text-slate-800">No Monthly Records</h3>
              <p className="text-xs text-slate-400">
                No attendance records found for {currentClass?.name} in {registerMonth}/{registerYear}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Monthly Register — {currentClass?.name} ({registerMonth}/{registerYear})
                  </h3>
                  <p className="text-xs text-slate-500">
                    P = Present, A = Absent, L = Late, LV = Leave.
                  </p>
                </div>
                <div className="flex items-center space-x-2 text-[11px] font-bold">
                  <span className="flex items-center space-x-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>P</span>
                  </span>
                  <span className="flex items-center space-x-1 text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-rose-600"></span>
                    <span>A</span>
                  </span>
                  <span className="flex items-center space-x-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span>L</span>
                  </span>
                  <span className="flex items-center space-x-1 text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>LV</span>
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-2.5 px-3 w-10 text-center border-r border-slate-200/60">#</th>
                      <th className="py-2.5 px-3 min-w-44 border-r border-slate-200/60">Student Name</th>
                      {Array.from({ length: daysInMonth }).map((_, i) => (
                        <th key={i + 1} className="py-2.5 px-1.5 text-center min-w-8 border-r border-slate-200/60 font-mono">
                          {i + 1}
                        </th>
                      ))}
                      <th className="py-2.5 px-2.5 text-center text-emerald-700 bg-emerald-50/50 border-r border-slate-200/60">P</th>
                      <th className="py-2.5 px-2.5 text-center text-rose-700 bg-rose-50/50 border-r border-slate-200/60">A</th>
                      <th className="py-2.5 px-2.5 text-center text-slate-900 bg-slate-100/50">Att %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {monthlySummaries.map((summary, idx) => (
                      <tr key={summary.student_id} className="hover:bg-slate-50/60 transition">
                        <td className="py-2 px-3 text-center text-slate-400 font-mono border-r border-slate-100">
                          {idx + 1}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900 border-r border-slate-100">
                          <p className="truncate font-bold">{summary.student_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{summary.admission_no}</p>
                        </td>

                        {/* 1..31 Day Cells */}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const dateKey = `${registerYear}-${String(registerMonth).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                          const status = summary.records[dateKey];

                          return (
                            <td key={dayNum} className="py-1.5 px-1 text-center border-r border-slate-100">
                              {status === 'Present' && (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                  P
                                </span>
                              )}
                              {status === 'Absent' && (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                                  A
                                </span>
                              )}
                              {status === 'Late' && (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                                  L
                                </span>
                              )}
                              {status === 'Leave' && (
                                <span className="inline-block w-5 h-5 leading-5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                  LV
                                </span>
                              )}
                              {!status && <span className="text-slate-200">•</span>}
                            </td>
                          );
                        })}

                        <td className="py-2 px-2.5 text-center font-bold text-emerald-700 bg-emerald-50/30 border-r border-slate-100">
                          {summary.present_days}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-rose-700 bg-rose-50/30 border-r border-slate-100">
                          {summary.absent_days}
                        </td>
                        <td className="py-2 px-2.5 text-center font-bold text-slate-900 bg-slate-50/40 font-mono">
                          <span className={`px-2 py-0.5 rounded ${
                            summary.attendance_percentage >= 75
                              ? 'text-emerald-700 bg-emerald-100/60'
                              : 'text-rose-700 bg-rose-100/60'
                          }`}>
                            {summary.attendance_percentage}%
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
      )}

      {/* ========================================================================= */}
      {/* TAB 4: DEFAULTER ALERTS & ANALYTICS                                       */}
      {/* ========================================================================= */}
      {activeTab === 'defaulters' && (
        <div className="space-y-6">
          {/* Threshold Filter Bar */}
          <div className="bg-red-50/50 p-4 rounded-2xl border border-red-200/60 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div>
                <h4 className="text-xs font-bold text-red-900">Attendance Defaulter Warning Rule</h4>
                <p className="text-[11px] text-red-700">
                  Students below the required attendance threshold require parent notification and counseling.
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-red-900">Warning Cutoff:</span>
              <select
                value={defaulterThreshold}
                onChange={(e) => setDefaulterThreshold(Number(e.target.value))}
                className="text-xs bg-white border border-red-200 rounded-xl px-3 py-1.5 text-red-900 font-bold focus:ring-red-500"
              >
                <option value={85}>Below 85%</option>
                <option value={80}>Below 80%</option>
                <option value={75}>Below 75% (Standard)</option>
                <option value={70}>Below 70% (Critical)</option>
                <option value={60}>Below 60% (Severe)</option>
              </select>
            </div>
          </div>

          {/* Defaulters Roster */}
          {isLoadingDefaulters ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
              <p className="text-xs font-semibold text-slate-500">Scanning attendance logs...</p>
            </div>
          ) : defaultersList.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">Excellent Attendance!</h3>
              <p className="text-xs text-slate-400">
                No students currently fall below the {defaulterThreshold}% attendance threshold in {currentClass?.name}.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-red-50/30">
                <div>
                  <h3 className="text-sm font-bold text-red-900">
                    Defaulter List — {defaultersList.length} Student(s) Below {defaulterThreshold}%
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review and contact guardians to resolve persistent absences.
                  </p>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {defaultersList.map((st) => (
                  <div
                    key={st.student_id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {st.attendance_percentage}%
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs font-bold text-slate-900">{st.student_name}</p>
                          <span className="text-[10px] font-mono text-slate-400">({st.admission_no})</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {st.class_name} {st.section_name ? `• Section ${st.section_name}` : ''} • Father: {st.father_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-900">
                          {st.present_days} attended / {st.total_days} days
                        </p>
                        <p className="text-[11px] text-rose-600 font-medium">
                          {st.absent_days} unexcused absences
                        </p>
                      </div>

                      {st.phone ? (
                        <a
                          href={`tel:${st.phone}`}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
                        >
                          <Phone className="w-3.5 h-3.5 text-slate-500" />
                          <span>{st.phone}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No phone recorded</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
