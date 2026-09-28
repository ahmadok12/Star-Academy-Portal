import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Trash2,
  GraduationCap,
  Calendar,
  Users
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { FormDialog } from '../../components/common/FormDialog';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  TeacherSubjectAssignment,
  Staff,
  ClassItem,
  ClassSection,
  ClassSubject
} from '../../types/database.types';

export const TeacherAssignmentsPage: React.FC = () => {
  const { academicYears, selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [assignments, setAssignments] = useState<TeacherSubjectAssignment[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [availableClassSections, setAvailableClassSections] = useState<ClassSection[]>([]);
  const [availableClassSubjects, setAvailableClassSubjects] = useState<ClassSubject[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedYearId, setSelectedYearId] = useState<string>('');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [teacherFilter, setTeacherFilter] = useState<string>('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState<TeacherSubjectAssignment | null>(null);

  // Form Fields
  const [formYearId, setFormYearId] = useState<string>('');
  const [formTeacherId, setFormTeacherId] = useState<string>('');
  const [formClassId, setFormClassId] = useState<string>('');
  const [formSectionId, setFormSectionId] = useState<string>('');
  const [formSubjectId, setFormSubjectId] = useState<string>('');
  const [isClassTeacher, setIsClassTeacher] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Set default academic year
  useEffect(() => {
    if (selectedAcademicYear && !selectedYearId) {
      setSelectedYearId(selectedAcademicYear.id);
      setFormYearId(selectedAcademicYear.id);
    }
  }, [selectedAcademicYear, selectedYearId]);

  // Load teachers, classes
  useEffect(() => {
    const loadMasters = async () => {
      try {
        const [staffData, classData] = await Promise.all([
          databaseService.getStaff(),
          databaseService.getClasses(),
        ]);
        setTeachers(staffData.filter((s) => s.role === 'teacher' && s.status === 'active'));
        setClasses(classData.filter((c) => c.status === 'active'));
      } catch (err: any) {
        toast.error('Failed to load masters', err.message);
      }
    };
    loadMasters();
  }, [toast]);

  // Load assignments when filter changes
  const loadAssignments = useCallback(async () => {
    if (!selectedYearId) return;
    try {
      setIsLoading(true);
      const data = await databaseService.getTeacherAssignments({
        academicYearId: selectedYearId,
        classId: classFilter === 'all' ? undefined : classFilter,
        teacherId: teacherFilter === 'all' ? undefined : teacherFilter,
      });
      setAssignments(data);
    } catch (err: any) {
      toast.error('Failed to load teacher assignments', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedYearId, classFilter, teacherFilter, toast]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  // Dynamic sections and subjects when form class changes
  useEffect(() => {
    if (!formClassId || !formYearId) {
      setAvailableClassSections([]);
      setAvailableClassSubjects([]);
      return;
    }

    const loadClassRelations = async () => {
      try {
        const [csList, subjList] = await Promise.all([
          databaseService.getClassSections(formYearId, formClassId),
          databaseService.getClassSubjects(formYearId, formClassId),
        ]);
        setAvailableClassSections(csList.filter((cs) => cs.status === 'active'));
        setAvailableClassSubjects(subjList);

        if (csList.length > 0) {
          setFormSectionId(csList[0].section_id);
        } else {
          setFormSectionId('');
        }

        if (subjList.length > 0) {
          setFormSubjectId(subjList[0].subject_id);
        } else {
          setFormSubjectId('');
        }
      } catch (err: any) {
        console.warn('Error loading class sections/subjects', err);
      }
    };

    loadClassRelations();
  }, [formClassId, formYearId]);

  const handleOpenAdd = () => {
    setFormYearId(selectedYearId || academicYears[0]?.id || '');
    if (teachers.length > 0) setFormTeacherId(teachers[0].id);
    if (classes.length > 0) setFormClassId(classes[0].id);
    setIsClassTeacher(false);
    setFormError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formYearId || !formTeacherId || !formClassId || !formSectionId || !formSubjectId) {
      setFormError('Please select all required academic fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      await databaseService.createTeacherAssignment({
        academic_year_id: formYearId,
        teacher_id: formTeacherId,
        class_id: formClassId,
        section_id: formSectionId,
        subject_id: formSubjectId,
        is_class_teacher: isClassTeacher,
        status: 'active',
      });

      toast.success(
        'Assignment Created',
        'Teacher has been successfully allocated to the subject slot.'
      );
      setModalOpen(false);
      loadAssignments();
    } catch (err: any) {
      setFormError(err.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAssignment) return;
    try {
      await databaseService.deleteTeacherAssignment(deletingAssignment.id);
      toast.success('Assignment Removed', 'Teacher assignment removed from schedule.');
      setDeleteConfirmOpen(false);
      loadAssignments();
    } catch (err: any) {
      toast.error('Deletion failed', err.message);
    }
  };

  const columns: Column<TeacherSubjectAssignment>[] = [
    {
      header: 'Assigned Teacher',
      cell: (item: TeacherSubjectAssignment) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
            {item.teacher?.name.charAt(0) || 'T'}
          </div>
          <div>
            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span>{item.teacher?.name}</span>
              {item.is_class_teacher && (
                <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                  Class Teacher
                </span>
              )}
            </div>
            <div className="text-xs text-slate-500">
              {item.teacher?.designation} • {item.teacher?.department || 'Department'}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Class & Section',
      cell: (item: TeacherSubjectAssignment) => (
        <div>
          <span className="font-semibold text-slate-800 text-xs">
            {item.class?.name || 'Class'}
          </span>
          <p className="text-xs text-slate-500">
            Section: <span className="font-medium text-slate-700">{item.section?.name}</span>
          </p>
        </div>
      ),
    },
    {
      header: 'Subject Allocated',
      cell: (item: TeacherSubjectAssignment) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-mono font-bold text-[11px]">
            {item.subject?.code.slice(0, 3)}
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-xs">{item.subject?.name}</p>
            <p className="text-[11px] text-slate-400">{item.subject?.short_name || 'Subject'}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Academic Year',
      cell: (item: TeacherSubjectAssignment) => (
        <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md">
          {item.academic_year?.name}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: TeacherSubjectAssignment) => (
        <button
          onClick={() => {
            setDeletingAssignment(item);
            setDeleteConfirmOpen(true);
          }}
          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
          title="Remove Assignment"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Staff & Teachers' },
          { label: 'Teaching Assignments' },
        ]}
        title="Teacher Subject &amp; Class Allocations"
        subtitle="Allocate qualified teachers to specific classes, sections, and subjects for the academic year."
        action={
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>New Subject Assignment</span>
          </button>
        }
      />

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/70 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>Academic Year:</span>
          </div>
          <select
            value={selectedYearId}
            onChange={(e) => setSelectedYearId(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            {academicYears.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name} {y.is_current ? '(Current)' : ''}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Class:</span>
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Users className="w-3.5 h-3.5" />
            <span>Teacher:</span>
          </div>
          <select
            value={teacherFilter}
            onChange={(e) => setTeacherFilter(e.target.value)}
            className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">All Teachers</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Total Assigned Slots: <span className="font-bold text-slate-900">{assignments.length}</span>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={assignments}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        emptyMessage="No teaching allocations found for the selected year and filters."
      />

      {/* Assign Teacher Modal */}
      <FormDialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Assign Teacher to Subject Slot"
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Academic Year <span className="text-red-500">*</span>
            </label>
            <select
              value={formYearId}
              onChange={(e) => setFormYearId(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              {academicYears.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name} {y.is_current ? '(Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Faculty / Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={formTeacherId}
              onChange={(e) => setFormTeacherId(e.target.value)}
              required
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.designation} - {t.department || 'General'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Class <span className="text-red-500">*</span>
              </label>
              <select
                value={formClassId}
                onChange={(e) => setFormClassId(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Section <span className="text-red-500">*</span>
              </label>
              <select
                value={formSectionId}
                onChange={(e) => setFormSectionId(e.target.value)}
                required
                className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
              >
                {availableClassSections.length === 0 ? (
                  <option value="">No sections mapped</option>
                ) : (
                  availableClassSections.map((cs) => (
                    <option key={cs.section_id} value={cs.section_id}>
                      Section {cs.section?.name || 'Section'}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={formSubjectId}
              onChange={(e) => setFormSubjectId(e.target.value)}
              required
              className="w-full text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              {availableClassSubjects.length === 0 ? (
                <option value="">No subjects mapped to this class</option>
              ) : (
                availableClassSubjects.map((cs) => (
                  <option key={cs.subject_id} value={cs.subject_id}>
                    {cs.subject?.name} ({cs.subject?.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center space-x-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isClassTeacher}
                onChange={(e) => setIsClassTeacher(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Designate as Section Class Teacher
              </span>
            </label>
            <p className="text-[11px] text-slate-500 ml-6.5 mt-0.5">
              Class teachers have primary supervisory responsibilities for student pastoral care and report cards.
            </p>
          </div>

          <div className="pt-4 border-t flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </FormDialog>

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Remove Teaching Allocation"
        message={`Are you sure you want to remove ${deletingAssignment?.teacher?.name}'s assignment for ${deletingAssignment?.subject?.name}?`}
        confirmText="Confirm Remove"
        type="danger"
      />
    </div>
  );
};
