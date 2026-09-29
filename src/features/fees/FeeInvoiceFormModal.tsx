import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';
import {
  ClassItem,
  SectionItem,
  StudentWithEnrollment,
  FeeStructure
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface FeeInvoiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  academicYearId: string;
}

export const FeeInvoiceFormModal: React.FC<FeeInvoiceFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  academicYearId
}) => {
  const toast = useToast();
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [selectedStructureId, setSelectedStructureId] = useState<string>('');
  const [month, setMonth] = useState<string>('June 2026');
  const [issueDate, setIssueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState<string>('2026-06-15');
  const [subtotal, setSubtotal] = useState<number>(6000);
  const [discount, setDiscount] = useState<number>(0);
  const [discountReason, setDiscountReason] = useState<string>('');
  const [fine, setFine] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [cls, sec, stds, structs] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSections(),
          databaseService.getStudents(academicYearId),
          databaseService.getFeeStructures(academicYearId)
        ]);

        const activeClasses = cls.filter(c => c.status === 'active');
        setClasses(activeClasses);
        setSections(sec.filter(s => s.status === 'active'));
        setStudents(stds.filter(s => s.status === 'active'));
        setFeeStructures(structs.filter(s => s.status === 'active'));

        if (activeClasses.length > 0 && !selectedClassId) {
          setSelectedClassId(activeClasses[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) loadPrerequisites();
  }, [isOpen, academicYearId]);

  // When class or structure changes, update subtotal
  useEffect(() => {
    if (selectedStructureId) {
      const match = feeStructures.find(f => f.id === selectedStructureId);
      if (match) setSubtotal(Number(match.total_amount));
    } else if (selectedClassId) {
      const match = feeStructures.find(f => f.class_id === selectedClassId);
      if (match) {
        setSelectedStructureId(match.id);
        setSubtotal(Number(match.total_amount));
      }
    }
  }, [selectedClassId, selectedStructureId, feeStructures]);

  if (!isOpen) return null;

  // Filter students by selected class and section
  const filteredStudents = students.filter(s => {
    if (!s.academic_record) return false;
    if (selectedClassId && s.academic_record.class_id !== selectedClassId) return false;
    if (selectedSectionId && s.academic_record.section_id !== selectedSectionId) return false;
    return true;
  });

  const totalAmount = Math.max(0, subtotal - discount + fine);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === 'single') {
        if (!selectedStudentId) {
          toast.error('Please select a student');
          setIsSubmitting(false);
          return;
        }

        const targetStudent = students.find(s => s.id === selectedStudentId);
        const clsId = targetStudent?.academic_record?.class_id || selectedClassId;
        const secId = targetStudent?.academic_record?.section_id || selectedSectionId;

        await databaseService.createFeeInvoice({
          academic_year_id: academicYearId,
          student_id: selectedStudentId,
          class_id: clsId,
          section_id: secId || null,
          fee_structure_id: selectedStructureId || null,
          month,
          issue_date: issueDate,
          due_date: dueDate,
          subtotal,
          discount,
          discount_reason: discountReason || null,
          fine,
          notes: notes || null
        });

        toast.success(`Fee invoice generated for ${targetStudent?.student_name}`);
      } else {
        // Batch Mode
        const generated = await databaseService.generateMonthlyInvoicesBatch({
          academicYearId,
          month,
          dueDate,
          classId: selectedClassId || undefined
        });

        toast.success(`Generated ${generated.length} monthly fee invoices for ${month}!`);
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Invoice generation failed');
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
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Issue Fee Invoice</h3>
              <p className="text-[11px] text-slate-500">Generate individual voucher or batch monthly billing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div className="px-6 pt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('single')}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'single' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Single Student Voucher
            </button>
            <button
              type="button"
              onClick={() => setMode('batch')}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                mode === 'batch' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Mass Class Billing (Batch)
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-3">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Billing Month *</label>
              <input
                type="text"
                required
                placeholder="e.g. June 2026"
                value={month}
                onChange={e => setMonth(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Class *</label>
              <select
                required
                value={selectedClassId}
                onChange={e => {
                  setSelectedClassId(e.target.value);
                  setSelectedStudentId('');
                }}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {mode === 'batch' && <option value="">All Active Classes</option>}
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">All Sections</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Student Selector (Only for Single mode) */}
          {mode === 'single' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Student *</label>
              <select
                required
                value={selectedStudentId}
                onChange={e => setSelectedStudentId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Choose Enrolled Student --</option>
                {filteredStudents.map(st => (
                  <option key={st.id} value={st.id}>
                    {st.student_name} ({st.admission_no}) - Section {st.academic_record?.section?.name || 'A'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Pricing Details */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subtotal (PKR)</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={subtotal}
                  onChange={e => setSubtotal(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Concession / Discount</label>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={e => setDiscount(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Late Fine (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={fine}
                  onChange={e => setFine(Number(e.target.value))}
                  className="w-full text-xs font-mono font-bold rounded-lg border border-slate-200 px-3 py-1.5 bg-white"
                />
              </div>
            </div>

            {discount > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Concession Reason</label>
                <input
                  type="text"
                  placeholder="e.g. Merit Scholarship / Sibling Concession"
                  value={discountReason}
                  onChange={e => setDiscountReason(e.target.value)}
                  className="w-full text-xs rounded-lg border border-slate-200 px-3 py-1.5 bg-white"
                />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200/70">
              <span className="text-xs font-bold text-slate-700">Total Net Payable</span>
              <span className="text-base font-black text-slate-900 font-mono">
                Rs {totalAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Instructions</label>
            <input
              type="text"
              placeholder="e.g. Payable at Meezan Bank or Academy Cash Counter"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="w-full text-xs rounded-xl border border-slate-200 px-3 py-2 bg-white"
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
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
              {isSubmitting ? 'Generating...' : mode === 'single' ? 'Create Invoice' : 'Run Batch Generation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
