import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle } from 'lucide-react';
import { FormDialog } from '../../components/common/FormDialog';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  StudentWithEnrollment,
  BatchItem,
  SubjectItem,
  EnrollmentType
} from '../../types/database.types';

interface ManageEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithEnrollment | null;
  batches: BatchItem[];
  subjects: SubjectItem[];
  onEnrollmentUpdated: () => void;
}

export const ManageEnrollmentModal: React.FC<ManageEnrollmentModalProps> = ({
  isOpen,
  onClose,
  student,
  batches,
  subjects,
  onEnrollmentUpdated,
}) => {
  const toast = useToast();
  const currentRec = student?.currentEnrollment;

  const [batchId, setBatchId] = useState('');
  const [enrollmentType, setEnrollmentType] = useState<EnrollmentType>('regular');
  const [supplementarySubjectIds, setSupplementarySubjectIds] = useState<string[]>([]);
  const [supplementaryNotes, setSupplementaryNotes] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (currentRec) {
      setBatchId(currentRec.batch_id || batches[0]?.id || '');
      setEnrollmentType(currentRec.enrollment_type || 'regular');
      setSupplementarySubjectIds(currentRec.supplementary_subject_ids || []);
      setSupplementaryNotes(currentRec.supplementary_notes || '');
      setRollNo(currentRec.roll_no || '');
    } else {
      setBatchId(batches[0]?.id || '');
      setEnrollmentType('regular');
      setSupplementarySubjectIds([]);
      setSupplementaryNotes('');
      setRollNo('');
    }
    setError(null);
  }, [currentRec, batches, isOpen]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRec) return;
    setError(null);

    if (enrollmentType === 'supplementary' && supplementarySubjectIds.length === 0) {
      setError('Please select at least one supplementary subject.');
      return;
    }

    try {
      setIsSaving(true);
      await databaseService.updateStudentEnrollment(currentRec.id, {
        batch_id: batchId || null,
        enrollment_type: enrollmentType,
        supplementary_subject_ids: enrollmentType === 'supplementary' ? supplementarySubjectIds : [],
        supplementary_notes: enrollmentType === 'supplementary' ? (supplementaryNotes.trim() || null) : null,
        roll_no: rollNo.trim() || null,
      });

      toast.success(
        'Enrollment Updated',
        `Updated batch and enrollment status for ${student?.student_name}.`
      );
      onEnrollmentUpdated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update enrollment');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Manage Student Batch &amp; Category"
      subtitle={`Configure batch allocation (Advance/Regular/ICU) and supplementary status for ${student?.student_name || 'student'}.`}
      icon={Sparkles}
      badge={student?.admission_no}
      maxWidth="lg"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition"
          >
            {isSaving ? 'Saving Changes...' : 'Save Placement'}
          </button>
        </>
      }
    >
      <form onSubmit={handleSave} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            {error}
          </div>
        )}

        {/* Current Placement Summary */}
        <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-500 block text-[11px]">Active Academic Placement:</span>
            <span className="font-bold text-slate-900">
              {currentRec?.class?.name || 'Class'} • Section {currentRec?.section?.name || 'Section'}
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
            Year: {currentRec?.academic_year?.name}
          </span>
        </div>

        {/* Batch Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Batch Allocation <span className="text-red-500">*</span>
          </label>
          <select
            value={batchId}
            onChange={(e) => setBatchId(e.target.value)}
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          >
            {batches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.code}) — {b.description || 'Dynamic batch'}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            Choose whether the student is in Advance, Regular, or ICU batch for their class and section.
          </p>
        </div>

        {/* Roll No */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Roll Number
          </label>
          <input
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="e.g. 01, 102"
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        {/* Enrollment Category */}
        <div className="pt-2 border-t border-slate-100 space-y-3">
          <label className="block text-xs font-bold text-slate-900">
            Enrollment Category
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label
              onClick={() => setEnrollmentType('regular')}
              className={`cursor-pointer p-3 rounded-xl border transition ${
                enrollmentType === 'regular'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50/70 text-slate-700 border-slate-200 hover:bg-slate-100/70'
              }`}
            >
              <input
                type="radio"
                name="modalEnrollmentType"
                checked={enrollmentType === 'regular'}
                onChange={() => setEnrollmentType('regular')}
                className="sr-only"
              />
              <span className="font-bold text-xs block">Regular Student</span>
              <span className={`text-[10px] block mt-0.5 ${enrollmentType === 'regular' ? 'text-slate-300' : 'text-slate-400'}`}>
                Standard annual syllabus track
              </span>
            </label>

            <label
              onClick={() => setEnrollmentType('supplementary')}
              className={`cursor-pointer p-3 rounded-xl border transition ${
                enrollmentType === 'supplementary'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                  : 'bg-amber-50/60 text-amber-900 border-amber-200 hover:bg-amber-100/60'
              }`}
            >
              <input
                type="radio"
                name="modalEnrollmentType"
                checked={enrollmentType === 'supplementary'}
                onChange={() => setEnrollmentType('supplementary')}
                className="sr-only"
              />
              <span className="font-bold text-xs block">Supplementary Student</span>
              <span className={`text-[10px] block mt-0.5 ${enrollmentType === 'supplementary' ? 'text-amber-100' : 'text-amber-700'}`}>
                Taking supplementary exams for failed subjects
              </span>
            </label>
          </div>

          {/* Supplementary Subjects Picker */}
          {enrollmentType === 'supplementary' && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl space-y-3 animate-fadeIn">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800">
                  Select failed subjects from previous academic year that the student is retaking:
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {subjects.map((sub) => {
                  const isSelected = supplementarySubjectIds.includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          setSupplementarySubjectIds(supplementarySubjectIds.filter((id) => id !== sub.id));
                        } else {
                          setSupplementarySubjectIds([...supplementarySubjectIds, sub.id]);
                        }
                      }}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        isSelected
                          ? 'bg-amber-600 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-amber-300'
                      }`}
                    >
                      <span className="truncate mr-1">{sub.name}</span>
                      <span className={`text-[9px] font-mono shrink-0 ${isSelected ? 'text-amber-100' : 'text-slate-400'}`}>
                        {sub.code}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                  Supplementary Exam Reference / Notes
                </label>
                <input
                  type="text"
                  value={supplementaryNotes}
                  onChange={(e) => setSupplementaryNotes(e.target.value)}
                  placeholder="e.g. 2nd Annual Supplementary, Previous Roll # 54102"
                  className="w-full text-xs font-medium bg-white border border-amber-300 rounded-xl px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-600"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </FormDialog>
  );
};
