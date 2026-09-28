import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  Plus,
  User,
  BookOpen,
  MapPin,
  Printer,
  Edit2,
  Trash2,
  CalendarRange,
  Coffee,
  LayoutGrid,
  List,
  Loader2
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { TimetablePeriodModal } from './TimetablePeriodModal';
import { TimetableSlotModal } from './TimetableSlotModal';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { databaseService } from '../../lib/database-service';
import {
  TimetableSlot,
  TimetablePeriod,
  ClassItem,
  SectionItem,
  SubjectItem,
  Staff,
  DayOfWeek,
  ClassSubject,
  TeacherSubjectAssignment
} from '../../types/database.types';

type TimetableMode = 'class' | 'teacher' | 'list';

const DAYS_OF_WEEK: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const TimetablePage: React.FC = () => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [mode, setMode] = useState<TimetableMode>('class');
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [periods, setPeriods] = useState<TimetablePeriod[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [classSubjects, setClassSubjects] = useState<ClassSubject[]>([]);
  const [teacherAssignments, setTeacherAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>('');
  const [dayFilter, setDayFilter] = useState<string>('all');

  // Modals
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false);
  const [isPeriodModalOpen, setIsPeriodModalOpen] = useState(false);
  const [editSlot, setEditSlot] = useState<TimetableSlot | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TimetableSlot | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Quick slot creation coordinates
  const [slotDefaults, setSlotDefaults] = useState<{
    day?: DayOfWeek;
    periodNumber?: number;
  }>({});

  const loadData = useCallback(async () => {
    if (!selectedAcademicYear) return;
    try {
      setIsLoading(true);
      const [
        slotsData,
        periodsData,
        classesData,
        sectionsData,
        subjectsData,
        staffData,
        csData,
        taData
      ] = await Promise.all([
        databaseService.getTimetableSlots({ academicYearId: selectedAcademicYear.id }),
        databaseService.getTimetablePeriods(),
        databaseService.getClasses(),
        databaseService.getSections(),
        databaseService.getSubjects(),
        databaseService.getStaff(),
        databaseService.getClassSubjects(selectedAcademicYear.id),
        databaseService.getTeacherAssignments({ academicYearId: selectedAcademicYear.id })
      ]);

      setSlots(slotsData);
      setPeriods(periodsData);
      setClasses(classesData);
      setSections(sectionsData);
      setSubjects(subjectsData);
      setStaff(staffData.filter(s => s.role === 'teacher'));
      setClassSubjects(csData);
      setTeacherAssignments(taData);

      // Default selection
      if (!selectedClassId && classesData.length > 0) {
        setSelectedClassId(classesData[0].id);
      }
      if (!selectedTeacherId && staffData.filter(s => s.role === 'teacher').length > 0) {
        setSelectedTeacherId(staffData.filter(s => s.role === 'teacher')[0].id);
      }
    } catch (e: any) {
      toast.error('Failed to load timetable', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear, toast, selectedClassId, selectedTeacherId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle slot submit
  const handleSaveSlot = async (payload: Omit<TimetableSlot, 'id' | 'created_at' | 'updated_at'>) => {
    if (editSlot) {
      await databaseService.updateTimetableSlot(editSlot.id, payload);
      toast.success('Slot Updated', 'Timetable lecture slot successfully updated.');
    } else {
      await databaseService.createTimetableSlot(payload);
      toast.success('Lecture Scheduled', 'Timetable slot created successfully.');
    }
    await loadData();
    setEditSlot(null);
  };

  // Handle slot delete
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteTimetableSlot(deleteTarget.id);
      toast.success('Slot Removed', 'Timetable slot was unlinked.');
      await loadData();
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Cannot remove slot', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenQuickSlot = (day: DayOfWeek, periodNum: number) => {
    setEditSlot(null);
    setSlotDefaults({ day, periodNumber: periodNum });
    setIsSlotModalOpen(true);
  };

  // Filtered slots for active view
  const activeClassSlots = useMemo(() => {
    return slots.filter(s => {
      const matchClass = s.class_id === selectedClassId;
      const matchSection = !selectedSectionId || s.section_id === selectedSectionId;
      return matchClass && matchSection;
    });
  }, [slots, selectedClassId, selectedSectionId]);

  const activeTeacherSlots = useMemo(() => {
    return slots.filter(s => s.teacher_id === selectedTeacherId);
  }, [slots, selectedTeacherId]);

  const currentClass = classes.find(c => c.id === selectedClassId);
  const currentTeacher = staff.find(t => t.id === selectedTeacherId);

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Academic Setup' },
          { label: 'Timetable & Schedules' },
        ]}
        title="Class & Teacher Timetable"
        subtitle="Manage master period schedules, class lecture timetables, and teacher allocations with conflict prevention."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPeriodModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 rounded-xl text-xs font-semibold shadow-xs transition"
              type="button"
            >
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Period Timings</span>
            </button>
            <button
              onClick={() => {
                setEditSlot(null);
                setSlotDefaults({});
                setIsSlotModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Lecture Slot</span>
            </button>
          </div>
        }
      />

      {/* Cycle Scope & View Mode Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <CalendarRange className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Academic Cycle:</span>
              <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {selectedAcademicYear?.name || 'None Selected'}
              </span>
              {selectedAcademicYear?.is_current && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200/60">
                  Active
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Weekly schedule templates repeat during the academic semester.
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start md:self-auto">
          <button
            onClick={() => setMode('class')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'class'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Class Timetable</span>
          </button>
          <button
            onClick={() => setMode('teacher')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'teacher'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            <User className="w-3.5 h-3.5" />
            <span>Teacher Schedule</span>
          </button>
          <button
            onClick={() => setMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              mode === 'list'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            type="button"
          >
            <List className="w-3.5 h-3.5" />
            <span>All Slots List</span>
          </button>
        </div>
      </div>

      {/* Mode Filters Toolbar */}
      <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/60 flex flex-wrap items-center justify-between gap-3">
        {mode === 'class' && (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600 font-bold">Class:</span>
              <select
                value={selectedClassId}
                onChange={(e) => setSelectedClassId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:ring-slate-900"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-600 font-bold">Section:</span>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-medium focus:ring-slate-900"
              >
                <option value="">All Sections / Combined</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {mode === 'teacher' && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-600 font-bold">Select Teacher:</span>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-bold focus:ring-slate-900 min-w-56"
            >
              {staff.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} — {t.designation}
                </option>
              ))}
            </select>
          </div>
        )}

        {mode === 'list' && (
          <div className="flex items-center space-x-3">
            <span className="text-xs text-slate-600 font-bold">Day:</span>
            <select
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-medium focus:ring-slate-900"
            >
              <option value="all">All Days</option>
              {DAYS_OF_WEEK.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Print Button */}
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 shadow-xs transition"
          type="button"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Timetable</span>
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center flex flex-col items-center justify-center space-y-3 shadow-xs">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading schedule matrix...</p>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* CLASS TIMETABLE GRID                                                      */}
          {/* ========================================================================= */}
          {mode === 'class' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          {/* Grid Title Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {currentClass?.name || 'Class Schedule'} —{' '}
                {selectedSectionId
                  ? `Section ${sections.find((s) => s.id === selectedSectionId)?.name}`
                  : 'All Sections'}
              </h3>
              <p className="text-xs text-slate-500">
                Weekly master lecture schedule. Click any slot to edit or unassigned cells to schedule.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200/60">
              {activeClassSlots.length} Weekly Lectures
            </span>
          </div>

          {/* Timetable Table Grid */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-32 border-r border-slate-200/60">
                    Day / Period
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.id}
                      className={`py-3 px-3 text-center text-xs font-bold border-r border-slate-200/60 min-w-44 ${
                        p.is_break ? 'bg-amber-50/60 text-amber-800' : 'text-slate-800'
                      }`}
                    >
                      <div className="font-extrabold">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal mt-0.5">
                        {p.start_time.substring(0, 5)} – {p.end_time.substring(0, 5)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS_OF_WEEK.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 px-4 text-xs font-extrabold text-slate-800 bg-slate-50/50 border-r border-slate-200/60">
                      {day}
                    </td>

                    {periods.map((period) => {
                      if (period.is_break) {
                        return (
                          <td
                            key={period.id}
                            className="p-2 text-center bg-amber-50/30 border-r border-slate-200/60"
                          >
                            <div className="flex flex-col items-center justify-center py-4 text-amber-600">
                              <Coffee className="w-4 h-4" />
                              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                                Break
                              </span>
                            </div>
                          </td>
                        );
                      }

                      // Find matching slot
                      const slot = activeClassSlots.find(
                        (s) => s.day_of_week === day && s.period_number === period.period_number
                      );

                      if (slot) {
                        return (
                          <td
                            key={period.id}
                            className="p-2 border-r border-slate-200/60 align-top"
                          >
                            <div className="group relative bg-white hover:bg-indigo-50/30 p-2.5 rounded-2xl border border-indigo-100/90 shadow-2xs transition">
                              <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-slate-900 block truncate">
                                  {slot.subject?.name}
                                </span>
                                <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-1 py-0.5 rounded">
                                  {slot.subject?.code}
                                </span>
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-slate-600 font-medium mt-1 truncate">
                                <User className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{slot.teacher?.name}</span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-100">
                                <span className="flex items-center gap-0.5 font-mono text-slate-600">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                  {slot.room || 'No Room'}
                                </span>
                                {slot.section && (
                                  <span className="font-semibold text-blue-700 bg-blue-50 px-1 py-0.5 rounded text-[9px]">
                                    Sec {slot.section.name}
                                  </span>
                                )}
                              </div>

                              {/* Hover action overlay */}
                              <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 flex items-center space-x-1 bg-white/95 px-1 py-0.5 rounded-lg shadow-xs transition">
                                <button
                                  onClick={() => {
                                    setEditSlot(slot);
                                    setIsSlotModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-indigo-600 rounded transition"
                                  title="Edit slot"
                                  type="button"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={() => setDeleteTarget(slot)}
                                  className="p-1 text-slate-500 hover:text-red-600 rounded transition"
                                  title="Unlink slot"
                                  type="button"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      // Empty period cell
                      return (
                        <td
                          key={period.id}
                          className="p-2 border-r border-slate-200/60 align-middle text-center"
                        >
                          <button
                            onClick={() => handleOpenQuickSlot(day, period.period_number)}
                            className="w-full h-18 rounded-2xl border border-dashed border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 text-slate-300 hover:text-indigo-600 flex flex-col items-center justify-center text-xs transition group"
                            type="button"
                            title={`Assign ${day} Period ${period.period_number}`}
                          >
                            <Plus className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] mt-0.5 opacity-0 group-hover:opacity-100 font-semibold">
                              Schedule
                            </span>
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TEACHER TIMETABLE GRID                                                    */}
      {/* ========================================================================= */}
      {mode === 'teacher' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-sm">
                {currentTeacher?.name?.substring(0, 2).toUpperCase() || 'TR'}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {currentTeacher?.name} — Lecture Commitments
                </h3>
                <p className="text-xs text-slate-500">
                  {currentTeacher?.designation} • {currentTeacher?.department || 'Faculty'}
                </p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200/60">
              {activeTeacherSlots.length} Total Weekly Lectures
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                  <th className="py-3 px-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500 w-32 border-r border-slate-200/60">
                    Day / Period
                  </th>
                  {periods.map((p) => (
                    <th
                      key={p.id}
                      className={`py-3 px-3 text-center text-xs font-bold border-r border-slate-200/60 min-w-44 ${
                        p.is_break ? 'bg-amber-50/60 text-amber-800' : 'text-slate-800'
                      }`}
                    >
                      <div className="font-extrabold">{p.name}</div>
                      <div className="text-[10px] font-mono text-slate-400 font-normal mt-0.5">
                        {p.start_time.substring(0, 5)} – {p.end_time.substring(0, 5)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {DAYS_OF_WEEK.map((day) => (
                  <tr key={day} className="hover:bg-slate-50/40 transition">
                    <td className="py-3 px-4 text-xs font-extrabold text-slate-800 bg-slate-50/50 border-r border-slate-200/60">
                      {day}
                    </td>

                    {periods.map((period) => {
                      if (period.is_break) {
                        return (
                          <td
                            key={period.id}
                            className="p-2 text-center bg-amber-50/30 border-r border-slate-200/60"
                          >
                            <div className="flex flex-col items-center justify-center py-4 text-amber-600">
                              <Coffee className="w-4 h-4" />
                              <span className="text-[10px] font-bold mt-1 uppercase tracking-wider">
                                Break
                              </span>
                            </div>
                          </td>
                        );
                      }

                      const slot = activeTeacherSlots.find(
                        (s) => s.day_of_week === day && s.period_number === period.period_number
                      );

                      if (slot) {
                        return (
                          <td
                            key={period.id}
                            className="p-2 border-r border-slate-200/60 align-top"
                          >
                            <div className="bg-emerald-50/70 p-2.5 rounded-2xl border border-emerald-200/80 shadow-2xs">
                              <div className="flex items-start justify-between">
                                <span className="text-xs font-bold text-slate-900 block truncate">
                                  {slot.class?.name}
                                </span>
                                {slot.section && (
                                  <span className="text-[9px] font-bold bg-white text-emerald-800 border border-emerald-200 px-1 py-0.5 rounded">
                                    Sec {slot.section.name}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1 text-[11px] text-slate-700 font-semibold mt-1 truncate">
                                <BookOpen className="w-3 h-3 text-emerald-600 shrink-0" />
                                <span className="truncate">{slot.subject?.name}</span>
                              </div>

                              <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-emerald-100">
                                <span className="flex items-center gap-0.5 font-mono text-slate-600">
                                  <MapPin className="w-2.5 h-2.5 text-slate-400" />
                                  {slot.room || 'Room TBA'}
                                </span>
                                <span className="text-[10px] font-bold text-emerald-700">
                                  Teaching
                                </span>
                              </div>
                            </div>
                          </td>
                        );
                      }

                      return (
                        <td
                          key={period.id}
                          className="p-2 border-r border-slate-200/60 align-middle text-center text-slate-300 text-xs font-mono"
                        >
                          — Free —
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ALL SLOTS LIST VIEW                                                       */}
      {/* ========================================================================= */}
      {mode === 'list' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="divide-y divide-slate-100">
            {slots
              .filter((s) => dayFilter === 'all' || s.day_of_week === dayFilter)
              .map((slot) => (
                <div
                  key={slot.id}
                  className="p-4 hover:bg-slate-50/70 transition flex items-center justify-between gap-4"
                >
                  <div className="flex items-center space-x-4">
                    <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                      P{slot.period_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded">
                          {slot.day_of_week}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{slot.subject?.name}</span>
                        <span className="text-xs text-slate-400">({slot.subject?.code})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>
                          Class: <strong>{slot.class?.name}</strong>{' '}
                          {slot.section && `(Sec ${slot.section.name})`}
                        </span>
                        <span>•</span>
                        <span>
                          Teacher: <strong>{slot.teacher?.name}</strong>
                        </span>
                        <span>•</span>
                        <span>
                          Room: <strong>{slot.room || 'TBA'}</strong>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-slate-400">
                          {slot.start_time.substring(0, 5)} – {slot.end_time.substring(0, 5)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => {
                        setEditSlot(slot);
                        setIsSlotModalOpen(true);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition"
                      title="Edit slot"
                      type="button"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(slot)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-xl transition"
                      title="Delete slot"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
      </>
      )}

      {/* Modals */}
      <TimetableSlotModal
        isOpen={isSlotModalOpen}
        onClose={() => {
          setIsSlotModalOpen(false);
          setEditSlot(null);
        }}
        onSubmit={handleSaveSlot}
        editSlot={editSlot}
        academicYearId={selectedAcademicYear?.id || ''}
        periods={periods}
        classes={classes}
        sections={sections}
        subjects={subjects}
        teachers={staff}
        classSubjects={classSubjects}
        teacherAssignments={teacherAssignments}
        defaultClassId={selectedClassId}
        defaultSectionId={selectedSectionId}
        defaultDay={slotDefaults.day}
        defaultPeriodNumber={slotDefaults.periodNumber}
      />

      <TimetablePeriodModal
        isOpen={isPeriodModalOpen}
        onClose={() => setIsPeriodModalOpen(false)}
        periods={periods}
        onPeriodsUpdated={loadData}
      />

      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Unlink Timetable Slot"
        message={`Remove ${deleteTarget?.subject?.name} lecture for ${deleteTarget?.class?.name} on ${deleteTarget?.day_of_week} Period ${deleteTarget?.period_number}?`}
        confirmText="Confirm Remove"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
