import React, { useState, useEffect } from 'react';
import { X, Award } from 'lucide-react';
import { Assessment, AssessmentType, AssessmentStatus, ClassItem, SectionItem, SubjectItem } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface AssessmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assessmentToEdit?: Assessment | null;
  academicYearId: string;
}

export const AssessmentFormModal: React.FC<AssessmentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  assessmentToEdit,
  academicYearId,
}) => {
  const toast = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    assessment_type: 'monthly_test' as AssessmentType,
    class_id: '',
    section_id: '',
    subject_id: '',
    total_marks: 50,
    passing_marks: 20,
    test_date: new Date().toISOString().split('T')[0],
    start_time: '09:00',
    end_time: '10:30',
    room_number: '',
    status: 'scheduled' as AssessmentStatus,
  });

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [cls, sec, sub] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSections(),
          databaseService.getSubjects(),
        ]);
        setClasses(cls.filter(c => c.status === 'active'));
        setSections(sec.filter(s => s.status === 'active'));
        setSubjects(sub.filter(s => s.status === 'active'));

        if (!assessmentToEdit && cls.length > 0) {
          setFormData(prev => ({
            ...prev,
            class_id: prev.class_id || cls[0].id,
            subject_id: prev.subject_id || sub[0]?.id || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load prerequisites:', err);
      }
    };
    if (isOpen) {
      loadPrerequisites();
    }
  }, [isOpen, assessmentToEdit]);

  useEffect(() => {
    if (assessmentToEdit) {
      setFormData({
        title: assessmentToEdit.title,
        assessment_type: assessmentToEdit.assessment_type,
        class_id: assessmentToEdit.class_id,
        section_id: assessmentToEdit.section_id || '',
        subject_id: assessmentToEdit.subject_id,
        total_marks: Number(assessmentToEdit.total_marks),
        passing_marks: Number(assessmentToEdit.passing_marks),
        test_date: assessmentToEdit.test_date,
        start_time: assessmentToEdit.start_time?.slice(0, 5) || '09:00',
        end_time: assessmentToEdit.end_time?.slice(0, 5) || '10:30',
        room_number: assessmentToEdit.room_number || '',
        status: assessmentToEdit.status,
      });
    } else {
      setFormData({
        title: '',
        assessment_type: 'monthly_test',
        class_id: classes[0]?.id || '',
        section_id: '',
        subject_id: subjects[0]?.id || '',
        total_marks: 50,
        passing_marks: 20,
        test_date: new Date().toISOString().split('T')[0],
        start_time: '09:00',
        end_time: '10:30',
        room_number: '',
        status: 'scheduled',
      });
    }
  }, [assessmentToEdit, isOpen, classes, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter an assessment title');
      return;
    }
    if (!formData.class_id) {
      toast.error('Please select a class');
      return;
    }
    if (!formData.subject_id) {
      toast.error('Please select a subject');
      return;
    }
    if (Number(formData.passing_marks) > Number(formData.total_marks)) {
      toast.error('Passing marks cannot exceed total marks');
      return;
    }

    setIsSubmitting(true);
    try {
      if (assessmentToEdit) {
        await databaseService.updateAssessment(assessmentToEdit.id, {
          title: formData.title.trim(),
          assessment_type: formData.assessment_type,
          class_id: formData.class_id,
          section_id: formData.section_id || null,
          subject_id: formData.subject_id,
          total_marks: Number(formData.total_marks),
          passing_marks: Number(formData.passing_marks),
          test_date: formData.test_date,
          start_time: formData.start_time ? `${formData.start_time}:00` : null,
          end_time: formData.end_time ? `${formData.end_time}:00` : null,
          room_number: formData.room_number.trim() || null,
          status: formData.status,
        });
        toast.success('Assessment updated successfully');
      } else {
        await databaseService.createAssessment({
          academic_year_id: academicYearId,
          title: formData.title.trim(),
          assessment_type: formData.assessment_type,
          class_id: formData.class_id,
          section_id: formData.section_id || null,
          subject_id: formData.subject_id,
          total_marks: Number(formData.total_marks),
          passing_marks: Number(formData.passing_marks),
          test_date: formData.test_date,
          start_time: formData.start_time ? `${formData.start_time}:00` : null,
          end_time: formData.end_time ? `${formData.end_time}:00` : null,
          room_number: formData.room_number.trim() || null,
          status: formData.status,
        });
        toast.success('Assessment scheduled successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {assessmentToEdit ? 'Edit Assessment / Exam' : 'Schedule New Assessment'}
              </h3>
              <p className="text-xs text-slate-500">
                Define exam title, date, subject, and marks configuration
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assessment Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Monthly Test 1, Midterm Exam 2026, Chapter 2 Quiz"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Assessment Type *
              </label>
              <select
                value={formData.assessment_type}
                onChange={e => setFormData({ ...formData, assessment_type: e.target.value as AssessmentType })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="monthly_test">Monthly Test</option>
                <option value="midterm">Midterm Examination</option>
                <option value="final">Final Examination</option>
                <option value="quiz">Weekly Quiz / Unit Test</option>
                <option value="pre_board">Pre-Board Exam</option>
                <option value="supplementary_exam">Supplementary Exam</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Class *
              </label>
              <select
                required
                value={formData.class_id}
                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Section (Optional)
              </label>
              <select
                value={formData.section_id}
                onChange={e => setFormData({ ...formData, section_id: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="">All Sections</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Subject *
              </label>
              <select
                required
                value={formData.subject_id}
                onChange={e => setFormData({ ...formData, subject_id: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Total Marks *
              </label>
              <input
                type="number"
                min="1"
                max="500"
                required
                value={formData.total_marks}
                onChange={e => setFormData({ ...formData, total_marks: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Passing Marks *
              </label>
              <input
                type="number"
                min="1"
                max={formData.total_marks}
                required
                value={formData.passing_marks}
                onChange={e => setFormData({ ...formData, passing_marks: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Exam Date *
              </label>
              <input
                type="date"
                required
                value={formData.test_date}
                onChange={e => setFormData({ ...formData, test_date: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={formData.start_time}
                onChange={e => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={formData.end_time}
                onChange={e => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Room / Hall
              </label>
              <input
                type="text"
                placeholder="e.g. Hall A, Room 102"
                value={formData.room_number}
                onChange={e => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as AssessmentStatus })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed / Graded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
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
              className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : assessmentToEdit ? 'Update Assessment' : 'Create Assessment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
