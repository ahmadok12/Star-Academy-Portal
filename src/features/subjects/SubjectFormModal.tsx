import React, { useState, useEffect } from 'react';
import { BookOpen } from 'lucide-react';
import { FormDialog } from '../../components/common/FormDialog';
import { SubjectItem, EntityStatus } from '../../types/database.types';

interface SubjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    code: string;
    short_name: string;
    display_order: number;
    status: EntityStatus;
  }) => Promise<void>;
  initialData?: SubjectItem | null;
}

export const SubjectFormModal: React.FC<SubjectFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [shortName, setShortName] = useState('');
  const [displayOrder, setDisplayOrder] = useState<number>(1);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCode(initialData.code);
      setShortName(initialData.short_name);
      setDisplayOrder(initialData.display_order);
      setStatus(initialData.status);
    } else {
      setName('');
      setCode('');
      setShortName('');
      setDisplayOrder(1);
      setStatus('active');
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Subject name is required (e.g. Mathematics, Physics, etc.)');
      return;
    }
    if (!code.trim()) {
      setError('Subject code is required (e.g. MTH-101, PHY, etc.)');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        short_name: shortName.trim() || name.trim(),
        display_order: Number(displayOrder) || 0,
        status,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save subject');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Subject Master' : 'Add Subject Master'}
      subtitle="Define a reusable master subject curriculum entity."
      icon={BookOpen}
      badge={initialData ? `#${initialData.code}` : 'New'}
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
            {isSubmitting ? 'Saving...' : initialData ? 'Update Subject' : 'Create Subject'}
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
            Subject Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!initialData) {
                if (!shortName) setShortName(e.target.value);
                if (!code) setCode(e.target.value.substring(0, 4).toUpperCase());
              }
            }}
            placeholder="e.g. Mathematics, Computer Science"
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. MTH, PHY, CS"
              className="w-full text-xs font-mono font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Short Name
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="e.g. Maths, Comp Sci"
              className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Display / Sort Order
            </label>
            <input
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10) || 0)}
              className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as EntityStatus)}
              className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </form>
    </FormDialog>
  );
};
