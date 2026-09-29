import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import { SubjectContent, ContentType, ClassItem, SubjectItem, Staff } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface SubjectContentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contentToEdit?: SubjectContent | null;
  academicYearId: string;
}

export const SubjectContentFormModal: React.FC<SubjectContentFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  contentToEdit,
  academicYearId,
}) => {
  const toast = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content_type: 'notes' as ContentType,
    class_id: '',
    subject_id: '',
    chapter_ref: '',
    description: '',
    file_url: '',
    is_published: true,
    created_by: '',
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [cls, sub, stf] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSubjects(),
          databaseService.getStaff(),
        ]);
        setClasses(cls.filter(c => c.status === 'active'));
        setSubjects(sub.filter(s => s.status === 'active'));
        setTeachers(stf.filter(s => s.role === 'teacher' && s.status === 'active'));

        if (!contentToEdit && cls.length > 0) {
          setFormData(prev => ({
            ...prev,
            class_id: prev.class_id || cls[0].id,
            subject_id: prev.subject_id || sub[0]?.id || '',
          }));
        }
      } catch (err) {
        console.error('Failed to load classes/subjects/staff:', err);
      }
    };
    if (isOpen) {
      loadData();
    }
  }, [isOpen, contentToEdit]);

  useEffect(() => {
    if (contentToEdit) {
      setFormData({
        title: contentToEdit.title,
        content_type: contentToEdit.content_type,
        class_id: contentToEdit.class_id,
        subject_id: contentToEdit.subject_id,
        chapter_ref: contentToEdit.chapter_ref || '',
        description: contentToEdit.description || '',
        file_url: contentToEdit.file_url || '',
        is_published: contentToEdit.is_published,
        created_by: contentToEdit.created_by || '',
      });
    } else {
      setFormData({
        title: '',
        content_type: 'notes',
        class_id: classes[0]?.id || '',
        subject_id: subjects[0]?.id || '',
        chapter_ref: '',
        description: '',
        file_url: '',
        is_published: true,
        created_by: teachers[0]?.id || '',
      });
    }
  }, [contentToEdit, isOpen, classes, subjects, teachers]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Please enter a content title');
      return;
    }

    setIsSubmitting(true);
    try {
      if (contentToEdit) {
        await databaseService.updateSubjectContent(contentToEdit.id, {
          title: formData.title.trim(),
          content_type: formData.content_type,
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          chapter_ref: formData.chapter_ref.trim() || null,
          description: formData.description.trim() || null,
          file_url: formData.file_url.trim() || null,
          is_published: formData.is_published,
          created_by: formData.created_by || null,
        });
        toast.success('Study material updated successfully');
      } else {
        await databaseService.createSubjectContent({
          academic_year_id: academicYearId,
          title: formData.title.trim(),
          content_type: formData.content_type,
          class_id: formData.class_id,
          subject_id: formData.subject_id,
          chapter_ref: formData.chapter_ref.trim() || null,
          description: formData.description.trim() || null,
          file_url: formData.file_url.trim() || null,
          is_published: formData.is_published,
          created_by: formData.created_by || null,
        });
        toast.success('Study material published successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save study material');
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
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {contentToEdit ? 'Edit Subject Content' : 'Upload / Add Study Material'}
              </h3>
              <p className="text-xs text-slate-500">
                Distribute lecture handouts, worksheets, syllabus documents, or assignments
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Material Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Unit 2 Kinematics Solved Numericals Handout"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Content Type *
              </label>
              <select
                value={formData.content_type}
                onChange={e => setFormData({ ...formData, content_type: e.target.value as ContentType })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 capitalize"
              >
                <option value="notes">Lecture Notes / Handouts</option>
                <option value="syllabus">Syllabus Breakdown</option>
                <option value="worksheet">Practice Worksheet</option>
                <option value="assignment">Assignment Task</option>
                <option value="past_paper">Past Board Papers</option>
                <option value="reference">Reference Material</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chapter / Unit Ref
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 3, Unit 1"
                value={formData.chapter_ref}
                onChange={e => setFormData({ ...formData, chapter_ref: e.target.value })}
                className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              />
            </div>
          </div>

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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Resource Link / File URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or storage link"
              value={formData.file_url}
              onChange={e => setFormData({ ...formData, file_url: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Summary / Instructions
            </label>
            <textarea
              rows={3}
              placeholder="Brief description or guidance for students and teachers..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-xs rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <label className="inline-flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_published}
                onChange={e => setFormData({ ...formData, is_published: e.target.checked })}
                className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
              />
              <span className="text-xs font-semibold text-slate-800">Publish immediately to Student &amp; Teacher Portals</span>
            </label>
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
              {isSubmitting ? 'Saving...' : contentToEdit ? 'Update Material' : 'Save Material'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
