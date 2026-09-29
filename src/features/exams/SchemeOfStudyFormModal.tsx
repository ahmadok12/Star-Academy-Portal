import React, { useState, useEffect } from 'react';
import { X, BookOpen } from 'lucide-react';
import { SchemeOfStudy, SOSStatus, ClassItem, SubjectItem } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface SchemeOfStudyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  sosToEdit?: SchemeOfStudy | null;
  academicYearId: string;
}

const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
];

export const SchemeOfStudyFormModal: React.FC<SchemeOfStudyFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  sosToEdit,
  academicYearId,
}) => {
  const toast = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    class_id: '',
    subject_id: '',
    month_name: 'April',
    order_index: 1,
    chapter_title: '',
    topics_covered: '',
    learning_objectives: '',
    status: 'planned' as SOSStatus,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cls, sub] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSubjects(),
        ]);
        setClasses(cls.filter(c => c.status === 'active'));
        setSubjects(sub.filter(s => s.status === 'active'));

        if (!sosToEdit && cls.length > 0) {
          setFormData(prev => ({
            ...prev,
            class_id: prev.class_id || cls[0].id,
            subject_id: prev.subject_id || sub[0]?.id || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load classes/subjects:', err);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen, sosToEdit]);

  useEffect(() => {
    if (sosToEdit) {
      setFormData({
        class_id: sosToEdit.class_id,
        subject_id: sosToEdit.subject_id,
        month_name: sosToEdit.month_name,
        order_index: sosToEdit.order_index,
        chapter_title: sosToEdit.chapter_title,
        topics_covered: sosToEdit.topics_covered,
        learning_objectives: sosToEdit.learning_objectives || '',
        status: sosToEdit.status,
      });
    } else {
      setFormData({
        class_id: classes[0]?.id || '',
        subject_id: subjects[0]?.id || '',
        month_name: 'April',
        order_index: 1,
        chapter_title: '',
        topics_covered: '',
        learning_objectives: '',
        status: 'planned',
      });
    }
  }, [sosToEdit, isOpen, classes, subjects]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.chapter_title.trim()) {
      toast.error('Please enter a chapter title');
      return;
    }
    if (!formData.topics_covered.trim()) {
      toast.error('Please list the topics covered');
      return;
    }

    setIsSubmitting(true);
    try {
      if (sosToEdit) {
        await databaseService.updateSchemeOfStudy(sosToEdit.id, {
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          month_name: formData.month_name,
          order_index: Number(formData.order_index),
          chapter_title: formData.chapter_title.trim(),
          topics_covered: formData.topics_covered.trim(),
          learning_objectives: formData.learning_objectives.trim() || null,
          status: formData.status,
        });
        toast.success('Scheme of Study updated successfully');
      } else {
        await databaseService.createSchemeOfStudy({
          academic_year_id: academicYearId,
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          month_name: formData.month_name,
          order_index: Number(formData.order_index),
          chapter_title: formData.chapter_title.trim(),
          topics_covered: formData.topics_covered.trim(),
          learning_objectives: formData.learning_objectives.trim() || null,
          status: formData.status,
        });
        toast.success('Scheme of Study added successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save Scheme of Study');
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
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {sosToEdit ? 'Edit Scheme of Study Unit' : 'Add Scheme of Study Unit'}
              </h3>
              <p className="text-xs text-slate-500">
                Plan curriculum delivery, syllabus topics, and milestones by month
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
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
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Month *
              </label>
              <select
                value={formData.month_name}
                onChange={e => setFormData({ ...formData, month_name: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              >
                {MONTHS.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sequence Order
              </label>
              <input
                type="number"
                min="1"
                max="24"
                value={formData.order_index}
                onChange={e => setFormData({ ...formData, order_index: Number(e.target.value) })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as SOSStatus })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 font-semibold"
              >
                <option value="planned">Planned</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Chapter / Unit Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 1: Matrices and Determinants"
              value={formData.chapter_title}
              onChange={e => setFormData({ ...formData, chapter_title: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topics Covered *
            </label>
            <textarea
              rows={3}
              required
              placeholder="List core topics, exercises, theorems, or board syllabus references..."
              value={formData.topics_covered}
              onChange={e => setFormData({ ...formData, topics_covered: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Learning Objectives (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="Expected student understanding, learning outcomes, or practical tasks..."
              value={formData.learning_objectives}
              onChange={e => setFormData({ ...formData, learning_objectives: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
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
              {isSubmitting ? 'Saving...' : sosToEdit ? 'Update SOS Unit' : 'Add to Scheme of Study'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
