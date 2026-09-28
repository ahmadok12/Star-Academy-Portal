import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { FormDialog } from '../../components/common/FormDialog';
import { AcademicYear, EntityStatus } from '../../types/database.types';

interface AcademicYearFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    start_date: string;
    end_date: string;
    status: EntityStatus;
    is_current: boolean;
  }) => Promise<void>;
  initialData?: AcademicYear | null;
}

export const AcademicYearFormModal: React.FC<AcademicYearFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState<EntityStatus>('active');
  const [isCurrent, setIsCurrent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setStartDate(initialData.start_date);
      setEndDate(initialData.end_date);
      setStatus(initialData.status);
      setIsCurrent(initialData.is_current);
    } else {
      setName('');
      setStartDate('2026-05-01');
      setEndDate('2027-04-30');
      setStatus('active');
      setIsCurrent(false);
    }
    setError(null);
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Academic year name is required (e.g., 2026-27).');
      return;
    }
    if (!startDate || !endDate) {
      setError('Both start and end dates are required.');
      return;
    }
    if (new Date(startDate) >= new Date(endDate)) {
      setError('Start date must be strictly earlier than end date.');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit({
        name: name.trim(),
        start_date: startDate,
        end_date: endDate,
        status,
        is_current: isCurrent,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save academic year');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormDialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Academic Year' : 'Add Academic Year'}
      subtitle="Define the chronological bounds and active state for the academic cycle."
      icon={Calendar}
      badge={initialData ? `#${initialData.name}` : 'New'}
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
            {isSubmitting ? 'Saving...' : initialData ? 'Update Year' : 'Create Year'}
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
            Academic Year Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. 2026-27"
            className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
          />
          <p className="text-[11px] text-slate-400 mt-1">Standard format: YYYY-YY (e.g. 2026-27)</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
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

          <div className="flex items-center pt-5">
            <label className="relative flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isCurrent}
                onChange={(e) => setIsCurrent(e.target.checked)}
                className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300"
              />
              <span className="text-xs font-semibold text-slate-800">
                Set as Current Academic Year
              </span>
            </label>
          </div>
        </div>
      </form>
    </FormDialog>
  );
};
