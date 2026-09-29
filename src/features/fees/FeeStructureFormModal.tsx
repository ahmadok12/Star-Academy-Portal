import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';
import { FeeStructure, ClassItem, FeeBillingFrequency, EntityStatus } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface FeeStructureFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  structureToEdit?: FeeStructure | null;
  academicYearId: string;
}

export const FeeStructureFormModal: React.FC<FeeStructureFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  structureToEdit,
  academicYearId
}) => {
  const toast = useToast();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    class_id: '',
    tuition_fee: 5000,
    admission_fee: 0,
    exam_fee: 500,
    lab_fee: 500,
    other_fee: 0,
    billing_frequency: 'monthly' as FeeBillingFrequency,
    status: 'active' as EntityStatus
  });

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const cls = await databaseService.getClasses();
        setClasses(cls.filter(c => c.status === 'active'));
        if (cls.length > 0 && !formData.class_id && !structureToEdit) {
          setFormData(prev => ({ ...prev, class_id: cls[0].id }));
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) loadPrerequisites();
  }, [isOpen]);

  useEffect(() => {
    if (structureToEdit) {
      setFormData({
        title: structureToEdit.title,
        class_id: structureToEdit.class_id,
        tuition_fee: Number(structureToEdit.tuition_fee),
        admission_fee: Number(structureToEdit.admission_fee),
        exam_fee: Number(structureToEdit.exam_fee),
        lab_fee: Number(structureToEdit.lab_fee),
        other_fee: Number(structureToEdit.other_fee),
        billing_frequency: structureToEdit.billing_frequency,
        status: structureToEdit.status
      });
    } else {
      setFormData({
        title: '',
        class_id: classes[0]?.id || '',
        tuition_fee: 5000,
        admission_fee: 0,
        exam_fee: 500,
        lab_fee: 500,
        other_fee: 0,
        billing_frequency: 'monthly',
        status: 'active'
      });
    }
  }, [structureToEdit, isOpen]);

  if (!isOpen) return null;

  const totalCalculated =
    Number(formData.tuition_fee || 0) +
    Number(formData.admission_fee || 0) +
    Number(formData.exam_fee || 0) +
    Number(formData.lab_fee || 0) +
    Number(formData.other_fee || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!formData.class_id) {
      toast.error('Please select a class');
      return;
    }

    setIsSubmitting(true);
    try {
      if (structureToEdit) {
        await databaseService.updateFeeStructure(structureToEdit.id, formData);
        toast.success('Fee structure updated successfully');
      } else {
        await databaseService.createFeeStructure({
          ...formData,
          academic_year_id: academicYearId,
          total_amount: totalCalculated
        });
        toast.success('New fee structure configured');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">
                {structureToEdit ? 'Edit Fee Structure' : 'New Fee Structure'}
              </h3>
              <p className="text-[11px] text-slate-500">Configure class fee breakdown and total amount</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Structure Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Matric Science Standard Fee"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Applicable Class *</label>
              <select
                required
                value={formData.class_id}
                onChange={e => setFormData({ ...formData, class_id: e.target.value })}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Frequency</label>
              <select
                value={formData.billing_frequency}
                onChange={e => setFormData({ ...formData, billing_frequency: e.target.value as any })}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="monthly">Monthly</option>
                <option value="term">Per Term / Quarter</option>
                <option value="annual">Annual</option>
                <option value="one_time">One Time</option>
              </select>
            </div>
          </div>

          {/* Fee Components */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Fee Heads Breakdown (PKR)
            </span>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Tuition Fee</label>
                <input
                  type="number"
                  min="0"
                  value={formData.tuition_fee}
                  onChange={e => setFormData({ ...formData, tuition_fee: Number(e.target.value) })}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Admission Fee</label>
                <input
                  type="number"
                  min="0"
                  value={formData.admission_fee}
                  onChange={e => setFormData({ ...formData, admission_fee: Number(e.target.value) })}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Exam / Test Fee</label>
                <input
                  type="number"
                  min="0"
                  value={formData.exam_fee}
                  onChange={e => setFormData({ ...formData, exam_fee: Number(e.target.value) })}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Laboratory / IT Fee</label>
                <input
                  type="number"
                  min="0"
                  value={formData.lab_fee}
                  onChange={e => setFormData({ ...formData, lab_fee: Number(e.target.value) })}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Other / Misc Fee</label>
                <input
                  type="number"
                  min="0"
                  value={formData.other_fee}
                  onChange={e => setFormData({ ...formData, other_fee: Number(e.target.value) })}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="bg-emerald-50/70 p-2 rounded-lg border border-emerald-200/60 flex flex-col justify-center">
                <span className="text-[10px] uppercase font-bold text-emerald-700">Total Net Amount</span>
                <span className="text-base font-black text-emerald-900 font-mono">
                  Rs {totalCalculated.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : structureToEdit ? 'Save Changes' : 'Create Structure'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
