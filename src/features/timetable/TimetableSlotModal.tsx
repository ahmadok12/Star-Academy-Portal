import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, AlertCircle } from 'lucide-react';
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

interface TimetableSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: Omit<TimetableSlot, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  editSlot?: TimetableSlot | null;
  academicYearId: string;
  periods: TimetablePeriod[];
  classes: ClassItem[];
  sections: SectionItem[];
  subjects: SubjectItem[];
  teachers: Staff[];
  classSubjects: ClassSubject[];
  teacherAssignments: TeacherSubjectAssignment[];
  defaultClassId?: string;
  defaultSectionId?: string;
  defaultDay?: DayOfWeek;
  defaultPeriodNumber?: number;
}

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const TimetableSlotModal: React.FC<TimetableSlotModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editSlot,
  academicYearId,
  periods,
  classes,
  sections,
  subjects,
  teachers,
  classSubjects,
  teacherAssignments,
  defaultClassId,
  defaultSectionId,
  defaultDay = 'Monday',
  defaultPeriodNumber = 1,
}) => {
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [periodNumber, setPeriodNumber] = useState<number>(defaultPeriodNumber);
  const [classId, setClassId] = useState<string>('');
  const [sectionId, setSectionId] = useState<string>('');
  const [subjectId, setSubjectId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize form
  useEffect(() => {
    if (editSlot) {
      setDayOfWeek(editSlot.day_of_week);
      setPeriodNumber(editSlot.period_number);
      setClassId(editSlot.class_id);
      setSectionId(editSlot.section_id || '');
      setSubjectId(editSlot.subject_id);
      setTeacherId(editSlot.teacher_id);
      setRoom(editSlot.room || '');
    } else {
      setDayOfWeek(defaultDay);
      setPeriodNumber(defaultPeriodNumber);
      setClassId(defaultClassId || (classes[0]?.id ?? ''));
      setSectionId(defaultSectionId || '');
      setRoom('');
      setErrorMessage(null);
    }
  }, [editSlot, isOpen, defaultDay, defaultPeriodNumber, defaultClassId, defaultSectionId, classes]);

  // Current period definition
  const currentPeriod = useMemo(() => {
    return periods.find((p) => p.period_number === periodNumber && !p.is_break) || periods[0];
  }, [periods, periodNumber]);

  // Available subjects for the selected class & section
  const availableSubjects = useMemo(() => {
    if (!classId) return subjects;
    const mappedSubjectIds = classSubjects
      .filter((cs) => cs.class_id === classId && (!sectionId || !cs.section_id || cs.section_id === sectionId))
      .map((cs) => cs.subject_id);

    if (mappedSubjectIds.length > 0) {
      return subjects.filter((s) => mappedSubjectIds.includes(s.id));
    }
    return subjects;
  }, [classId, sectionId, classSubjects, subjects]);

  // Auto-select first subject if current subjectId is not available
  useEffect(() => {
    if (availableSubjects.length > 0 && (!subjectId || !availableSubjects.some((s) => s.id === subjectId))) {
      setSubjectId(availableSubjects[0].id);
    }
  }, [availableSubjects, subjectId]);

  // Recommended teachers based on Phase 4 Teacher Assignments
  const recommendedTeacherIds = useMemo(() => {
    return teacherAssignments
      .filter((ta) => ta.class_id === classId && (!sectionId || ta.section_id === sectionId) && ta.subject_id === subjectId)
      .map((ta) => ta.teacher_id);
  }, [teacherAssignments, classId, sectionId, subjectId]);

  // Auto-select recommended teacher
  useEffect(() => {
    if (recommendedTeacherIds.length > 0 && !editSlot) {
      setTeacherId(recommendedTeacherIds[0]);
    } else if (teachers.length > 0 && !teacherId) {
      setTeacherId(teachers[0].id);
    }
  }, [recommendedTeacherIds, teachers, teacherId, editSlot]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!classId || !subjectId || !teacherId) {
      setErrorMessage('Please select Class, Subject, and Teacher.');
      return;
    }

    try {
      setIsSubmitting(true);
      const startTime = currentPeriod?.start_time || '08:00';
      const endTime = currentPeriod?.end_time || '08:45';

      await onSubmit({
        academic_year_id: academicYearId,
        class_id: classId,
        section_id: sectionId ? sectionId : null,
        period_id: currentPeriod?.id || null,
        day_of_week: dayOfWeek,
        period_number: periodNumber,
        start_time: startTime,
        end_time: endTime,
        subject_id: subjectId,
        teacher_id: teacherId,
        room: room.trim() || null,
        status: 'active',
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save timetable slot.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const academicPeriodsOnly = periods.filter((p) => !p.is_break);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {editSlot ? 'Edit Timetable Slot' : 'Schedule Timetable Slot'}
              </h3>
              <p className="text-xs text-slate-500">
                Assign lecture period, instructor, and classroom
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200/80 rounded-2xl flex items-start space-x-2.5 text-red-800 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {/* Day & Period Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Day of Week <span className="text-red-500">*</span>
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
                required
              >
                {DAYS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Period <span className="text-red-500">*</span>
              </label>
              <select
                value={periodNumber}
                onChange={(e) => setPeriodNumber(parseInt(e.target.value) || 1)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
                required
              >
                {academicPeriodsOnly.map((p) => (
                  <option key={p.id} value={p.period_number}>
                    {p.name} ({p.start_time.substring(0, 5)} - {p.end_time.substring(0, 5)})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Class & Section Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
                required
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">Section</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
              >
                <option value="">All Sections / Combined</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    Section {s.name} ({s.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Curriculum Subject */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Curriculum Subject <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
                required
              >
                {availableSubjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.code})
                  </option>
                ))}
              </select>
            </div>
            {availableSubjects.length === 0 && (
              <p className="text-[11px] text-amber-600 mt-1">
                No subjects assigned specifically to this class in Academic Setup.
              </p>
            )}
          </div>

          {/* Instructor / Teacher */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] font-bold text-slate-600">
                Lecturer / Teacher <span className="text-red-500">*</span>
              </label>
              {recommendedTeacherIds.length > 0 && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                  Assigned Teacher Identified
                </span>
              )}
            </div>
            <select
              value={teacherId}
              onChange={(e) => setTeacherId(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:ring-2 focus:ring-slate-900"
              required
            >
              {teachers.map((t) => {
                const isAssigned = recommendedTeacherIds.includes(t.id);
                return (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.designation} {isAssigned ? '★ (Allocated)' : ''}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Room / Location */}
          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Classroom / Laboratory
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Room 101, Physics Lab, Hall A"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
              />
            </div>
            {/* Quick Room Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['Room 101', 'Room 102', 'Room 201', 'Physics Lab', 'Chem Lab', 'Bio Lab', 'Computer Lab'].map(
                (preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRoom(preset)}
                    className="text-[10px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md transition"
                  >
                    {preset}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Slot Timing Summary Preview */}
          <div className="p-3 bg-indigo-50/60 rounded-2xl border border-indigo-100/80 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>
                <strong>{dayOfWeek}</strong> • Period {periodNumber} ({currentPeriod?.start_time.substring(0, 5)} - {currentPeriod?.end_time.substring(0, 5)})
              </span>
            </div>
            <span className="font-semibold text-[11px] bg-white text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200/60">
              45 min
            </span>
          </div>

          {/* Footer Controls */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
            >
              {isSubmitting ? 'Saving...' : editSlot ? 'Update Slot' : 'Confirm & Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
