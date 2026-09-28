import React, { useState, useEffect } from 'react';
import { CalendarRange } from 'lucide-react';
import { FormDialog } from '../../components/common/FormDialog';
import { databaseService } from '../../lib/database-service';
import { AcademicYear, ClassItem, SubjectItem, ClassSection } from '../../types/database.types';

interface ClassSubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    academicYearId: string;
    classId: string;
    sectionId?: string | null;
    subjectId: string;
    displayOrder: number;
  }) => Promise<void>;
  academicYears: AcademicYear[];
  classes: ClassItem[];
  subjects: SubjectItem[];
  defaultAcademicYearId?: string;
  defaultClassId?: string;
}

export const ClassSubjectFormModal: React.FC<ClassSubjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  academicYears,
  classes,
  subjects,
  defaultAcademicYearId,
  defaultClassId,
}) => {
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [availableSections, setAvailableSections] = useState<ClassSection[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Active records only for new assignments
  const activeClasses = classes.filter(c => c.status === 'active');
  const activeSubjects = subjects.filter(s => s.status === 'active');

  useEffect(() => {
    if (isOpen) {
      const yearId = defaultAcademicYearId || academicYears[0]?.id || '';
      const cId = defaultClassId || activeClasses[0]?.id || '';
      setAcademicYearId(yearId);
      setClassId(cId);
      setSectionId('');
      setSubjectId(activeSubjects[0]?.id || '');
      setDisplayOrder(1);
      setError(null);
    }
  }, [isOpen, defaultAcademicYearId, defaultClassId, academicYears, classes, subjects]);

  // Dynamically load sections assigned to selected class and academic year
  useEffect(() => {
    if (!classId || !academicYearId) {
      setAvailableSections([]);
      return;
    }
    let isCancelled = false;
    const fetchSections = async () => {
      try {
        setLoadingSections(true);
        const list = await databaseService.getClassSections(classId, academicYearId);
        if (!isCancelled) {
          const active = list.filter(cs => cs.status === 'active');
          setAvailableSections(active);
        }
      } catch {
        if (!isCancelled) setAvailableSections([]);
      } finally {
        if (!isCancelled) setLoadingSections(false);
      }
    };
    fetchSections();
    return () => {
      isCancelled = true;
    };
  }, [classId, academicYearId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!academicYearId) {
      setError('Please select an Academic Year.');
      return;
    }
    if (!classId) {
      setError('Please select a Class.');
      return;
    }
    if (!subjectId) {
      setError('Please select a Subject.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        academicYearId,
        classId,
        sectionId: sectionId ? sectionId : null,
        subjectId,
        displayOrder: Number(displayOrder) || 1,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign subject to class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Subject to Class Curriculum"
      subtitle="Define which subjects are taught to a class and section during the academic cycle."
      icon={CalendarRange}
      badge="Curriculum Assignment"
      maxWidth="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition disabled:opacity-50"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Subject'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200/80 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Target Academic Year <span className="text-red-500">*</span>
          </label>
          <select
            value={academicYearId}
            onChange={(e) => setAcademicYearId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {academicYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.name} {year.is_current ? '(Current Year)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Class Master <span className="text-red-500">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {activeClasses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.code})
              </option>
            ))}
          </select>
          {activeClasses.length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">No active classes found.</p>
          )}
        </div>

        {/* Section Selector */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Section (Respective Section)
            </label>
            <span className="text-[10px] text-slate-400">Optional: select specific section</span>
          </div>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            <option value="">All Sections (Entire Class)</option>
            {availableSections.map((cs) => (
              <option key={cs.section_id} value={cs.section_id}>
                Section {cs.section?.name || 'Section'}
              </option>
            ))}
          </select>
          {availableSections.length === 0 && !loadingSections ? (
            <p className="text-[11px] text-slate-400 mt-1">
              No sections configured for this class yet. Subject will apply to all students of this class.
            </p>
          ) : (
            <p className="text-[11px] text-slate-500 mt-1">
              Select a section (e.g. Pre-Engineering vs Pre-Medical) to assign specific subjects, or leave as All Sections.
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Subject Master <span className="text-red-500">*</span>
          </label>
          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {activeSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.code})
              </option>
            ))}
          </select>
          {activeSubjects.length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">No active subjects found.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Display / Period Order
          </label>
          <input
            type="number"
            min="1"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 1)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Determines ordering in reports, timetables, and marksheets.</p>
        </div>
      </form>
    </FormDialog>
  );
};
