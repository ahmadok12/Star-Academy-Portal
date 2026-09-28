import React, { useState, useEffect } from 'react';
import { Link2 } from 'lucide-react';
import { FormDialog } from '../../components/common/FormDialog';
import { AcademicYear, ClassItem, SectionItem } from '../../types/database.types';

interface ClassSectionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    academicYearId: string;
    classId: string;
    sectionId: string;
  }) => Promise<void>;
  academicYears: AcademicYear[];
  classes: ClassItem[];
  sections: SectionItem[];
  defaultAcademicYearId?: string;
  defaultClassId?: string;
}

export const ClassSectionFormModal: React.FC<ClassSectionFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  academicYears,
  classes,
  sections,
  defaultAcademicYearId,
  defaultClassId,
}) => {
  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [sectionId, setSectionId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter only active items for new selection
  const activeClasses = classes.filter(c => c.status === 'active');
  const activeSections = sections.filter(s => s.status === 'active');

  useEffect(() => {
    if (isOpen) {
      setAcademicYearId(defaultAcademicYearId || academicYears[0]?.id || '');
      setClassId(defaultClassId || activeClasses[0]?.id || '');
      setSectionId(activeSections[0]?.id || '');
      setError(null);
    }
  }, [isOpen, defaultAcademicYearId, defaultClassId, academicYears, classes, sections]);

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
    if (!sectionId) {
      setError('Please select a Section.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        academicYearId,
        classId,
        sectionId,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign section to class');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Assign Section to Class"
      subtitle="Configure section availability for a specific class standard within the selected academic year."
      icon={Link2}
      badge="Academic Relationship"
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
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
          >
            {isSubmitting ? 'Assigning...' : 'Assign Section'}
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
            <p className="text-[11px] text-amber-600 mt-1">No active classes found. Please create or activate classes first.</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Section Master <span className="text-red-500">*</span>
          </label>
          <select
            value={sectionId}
            onChange={(e) => setSectionId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {activeSections.map((s) => (
              <option key={s.id} value={s.id}>
                Section {s.name} ({s.code})
              </option>
            ))}
          </select>
          {activeSections.length === 0 && (
            <p className="text-[11px] text-amber-600 mt-1">No active sections found. Please create or activate sections first.</p>
          )}
        </div>
      </form>
    </FormDialog>
  );
};
