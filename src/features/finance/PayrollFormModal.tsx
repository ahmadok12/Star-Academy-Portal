import React, { useState, useEffect } from 'react';
import { X, Award, Users } from 'lucide-react';
import { Payroll, Staff, BankAccount, PayrollStatus } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface PayrollFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payrollToEdit?: Payroll | null;
  staffList: Staff[];
  accounts: BankAccount[];
  academicYearId?: string;
}

export const PayrollFormModal: React.FC<PayrollFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  payrollToEdit,
  staffList,
  accounts,
  academicYearId
}) => {
  const toast = useToast();
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [salaryMonth, setSalaryMonth] = useState<string>('June 2026');
  const [basicSalary, setBasicSalary] = useState<number>(65000);
  const [allowances, setAllowances] = useState<number>(0);
  const [allowancesBreakdown, setAllowancesBreakdown] = useState<string>('');
  const [deductions, setDeductions] = useState<number>(0);
  const [deductionsBreakdown, setDeductionsBreakdown] = useState<string>('');
  const [advanceSalaryDeducted, setAdvanceSalaryDeducted] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PayrollStatus>('draft');
  const [paymentMethod, setPaymentMethod] = useState<string>('Bank Transfer');
  const [paymentAccountId, setPaymentAccountId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill salary from staff profile
  useEffect(() => {
    if (payrollToEdit) {
      setMode('single');
      setSelectedStaffId(payrollToEdit.staff_id);
      setSalaryMonth(payrollToEdit.salary_month);
      setBasicSalary(Number(payrollToEdit.basic_salary));
      setAllowances(Number(payrollToEdit.allowances || 0));
      setAllowancesBreakdown(payrollToEdit.allowances_breakdown || '');
      setDeductions(Number(payrollToEdit.deductions || 0));
      setDeductionsBreakdown(payrollToEdit.deductions_breakdown || '');
      setAdvanceSalaryDeducted(Number(payrollToEdit.advance_salary_deducted || 0));
      setPaymentStatus(payrollToEdit.payment_status);
      setPaymentMethod(payrollToEdit.payment_method || 'Bank Transfer');
      setPaymentAccountId(payrollToEdit.payment_account_id || '');
      setNotes(payrollToEdit.notes || '');
    } else {
      setMode('single');
      setSalaryMonth('June 2026');
      setAllowances(0);
      setAllowancesBreakdown('');
      setDeductions(0);
      setDeductionsBreakdown('');
      setAdvanceSalaryDeducted(0);
      setPaymentStatus('draft');
      setPaymentMethod('Bank Transfer');
      setPaymentAccountId(accounts[0]?.id || '');
      setNotes('');
      if (staffList.length > 0) {
        setSelectedStaffId(staffList[0].id);
        setBasicSalary(Number(staffList[0].salary || 65000));
      }
    }
  }, [payrollToEdit, isOpen, staffList, accounts]);

  if (!isOpen) return null;

  const handleStaffChange = (staffId: string) => {
    setSelectedStaffId(staffId);
    const member = staffList.find(s => s.id === staffId);
    if (member && member.salary) {
      setBasicSalary(Number(member.salary));
    }
  };

  const netSalary = Math.max(
    0,
    Number(basicSalary) + Number(allowances) - Number(deductions) - Number(advanceSalaryDeducted)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'batch') {
      try {
        setIsSubmitting(true);
        const activeStaffIds = staffList
          .filter(s => s.status === 'active')
          .map(s => s.id);

        const result = await databaseService.generateBulkPayroll(
          activeStaffIds,
          salaryMonth,
          academicYearId
        );
        toast.success(`Generated payroll drafts for ${result.createdCount} faculty members`);
        onSuccess();
        onClose();
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || 'Batch generation failed');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (!selectedStaffId) {
      toast.error('Please select a teacher/staff member');
      return;
    }
    if (basicSalary <= 0) {
      toast.error('Basic salary must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      if (payrollToEdit) {
        await databaseService.updatePayroll(payrollToEdit.id, {
          staff_id: selectedStaffId,
          salary_month: salaryMonth,
          basic_salary: Number(basicSalary),
          allowances: Number(allowances),
          allowances_breakdown: allowancesBreakdown.trim() || null,
          deductions: Number(deductions),
          deductions_breakdown: deductionsBreakdown.trim() || null,
          advance_salary_deducted: Number(advanceSalaryDeducted),
          net_salary: netSalary,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_account_id: paymentAccountId || null,
          notes: notes.trim() || null
        });
        toast.success('Payroll record updated successfully');
      } else {
        await databaseService.createPayroll({
          staff_id: selectedStaffId,
          academic_year_id: academicYearId || null,
          salary_month: salaryMonth,
          basic_salary: Number(basicSalary),
          allowances: Number(allowances),
          allowances_breakdown: allowancesBreakdown.trim() || null,
          deductions: Number(deductions),
          deductions_breakdown: deductionsBreakdown.trim() || null,
          advance_salary_deducted: Number(advanceSalaryDeducted),
          net_salary: netSalary,
          payment_status: paymentStatus,
          payment_method: paymentMethod,
          payment_account_id: paymentAccountId || null,
          notes: notes.trim() || null
        });
        toast.success('Teacher payroll generated successfully');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save payroll');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {payrollToEdit ? 'Edit Teacher Payroll' : 'Generate Teacher Payroll'}
              </h2>
              <p className="text-[11px] text-slate-500">Calculate monthly compensations &amp; deductions</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Switcher */}
        {!payrollToEdit && (
          <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
            <div className="grid grid-cols-2 gap-2 bg-slate-200/70 p-1 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`py-1.5 rounded-lg transition ${
                  mode === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Individual Teacher
              </button>
              <button
                type="button"
                onClick={() => setMode('batch')}
                className={`py-1.5 rounded-lg flex items-center justify-center space-x-1.5 transition ${
                  mode === 'batch'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bulk All Faculty ({staffList.filter(s => s.status === 'active').length})</span>
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto custom-scroll flex-1">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Salary Month / Cycle *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. June 2026"
              value={salaryMonth}
              onChange={e => setSalaryMonth(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {mode === 'batch' ? (
            <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-100/80 space-y-2">
              <h4 className="text-xs font-bold text-indigo-900 flex items-center space-x-1.5">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Bulk Faculty Payroll Generation</span>
              </h4>
              <p className="text-xs text-indigo-700 leading-relaxed">
                This will create draft payroll slips for all{' '}
                <span className="font-bold">{staffList.filter(s => s.status === 'active').length} active teachers and staff members</span> for the billing cycle of{' '}
                <span className="font-bold">{salaryMonth}</span> using their contract basic salaries.
              </p>
              <p className="text-[11px] text-slate-500">
                You can subsequently customize allowances, bonuses, and tax deductions for individual teachers before final disbursement.
              </p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Teacher / Faculty Member *
                </label>
                <select
                  required
                  value={selectedStaffId}
                  onChange={e => handleStaffChange(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                >
                  <option value="">-- Choose Faculty Member --</option>
                  {staffList.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation || s.role}) — Salary: Rs. {Number(s.salary || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Basic Salary (PKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={basicSalary || ''}
                    onChange={e => setBasicSalary(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Bank Transfer">Bank Transfer (Direct)</option>
                    <option value="Cash">Cash in Hand</option>
                    <option value="Cheque">Crossed Cheque</option>
                    <option value="Easypaisa">Easypaisa / Mobile Wallet</option>
                  </select>
                </div>
              </div>

              {/* Allowances breakdown */}
              <div className="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Total Allowances &amp; Bonuses (+)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={allowances || ''}
                    onChange={e => setAllowances(parseFloat(e.target.value) || 0)}
                    className="w-32 text-right text-xs font-bold text-emerald-800 rounded-lg border border-emerald-200 px-2 py-1 bg-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Senior Teacher Allowance: 5000, Fuel: 3000"
                  value={allowancesBreakdown}
                  onChange={e => setAllowancesBreakdown(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg border border-emerald-200 px-3 py-1.5 bg-white"
                />
              </div>

              {/* Deductions breakdown */}
              <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-900">Statutory / Other Deductions (-)</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={deductions || ''}
                    onChange={e => setDeductions(parseFloat(e.target.value) || 0)}
                    className="w-32 text-right text-xs font-bold text-rose-800 rounded-lg border border-rose-200 px-2 py-1 bg-white font-mono"
                  />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Income Tax: 2000, Late arrival: 1000"
                  value={deductionsBreakdown}
                  onChange={e => setDeductionsBreakdown(e.target.value)}
                  className="w-full text-xs font-medium rounded-lg border border-rose-200 px-3 py-1.5 bg-white"
                />
              </div>

              {/* Advance salary deduction */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Advance Salary Recovery (-)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={advanceSalaryDeducted || ''}
                    onChange={e => setAdvanceSalaryDeducted(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Status
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as PayrollStatus)}
                    className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="draft">Draft (Review Pending)</option>
                    <option value="approved">Approved (Ready for Payment)</option>
                    <option value="paid">Paid (Disbursed)</option>
                  </select>
                </div>
              </div>

              {/* Net Salary Summary Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">
                    Net Take-Home Salary
                  </span>
                  <span className="text-xl font-black font-mono tracking-tight text-emerald-400">
                    Rs. {netSalary.toLocaleString()}
                  </span>
                </div>
                <div className="text-right text-[11px] text-slate-300">
                  <p>{salaryMonth}</p>
                  <p className="text-[10px] text-slate-400">Basic {Number(basicSalary).toLocaleString()} + {Number(allowances).toLocaleString()} - {(Number(deductions) + Number(advanceSalaryDeducted)).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Remarks / Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Optional internal payroll remarks"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full text-xs font-medium rounded-xl border border-slate-200 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
                />
              </div>
            </>
          )}

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Processing...' : mode === 'batch' ? 'Generate Bulk Drafts' : payrollToEdit ? 'Save Changes' : 'Create Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
