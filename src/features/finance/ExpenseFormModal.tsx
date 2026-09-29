import React, { useState, useEffect } from 'react';
import { X, Receipt } from 'lucide-react';
import { Expense, BankAccount, ExpenseCategory } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  expenseToEdit?: Expense | null;
  accounts: BankAccount[];
  academicYearId?: string;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Electricity',
  'Rent',
  'Salary',
  'Stationery',
  'Maintenance',
  'Transport',
  'Marketing',
  'Utilities',
  'Lab Supplies',
  'Other'
];

export const ExpenseFormModal: React.FC<ExpenseFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  expenseToEdit,
  accounts,
  academicYearId
}) => {
  const toast = useToast();
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<string>('Electricity');
  const [amount, setAmount] = useState<number>(0);
  const [paymentAccountId, setPaymentAccountId] = useState<string>('');
  const [payeeName, setPayeeName] = useState<string>('');
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expenseToEdit) {
      setDate(expenseToEdit.date);
      setCategory(expenseToEdit.category);
      setAmount(Number(expenseToEdit.amount));
      setPaymentAccountId(expenseToEdit.payment_account_id || '');
      setPayeeName(expenseToEdit.payee_name || '');
      setReferenceNo(expenseToEdit.reference_no || '');
      setDescription(expenseToEdit.description || '');
      setReceiptUrl(expenseToEdit.receipt_url || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setCategory('Electricity');
      setAmount(0);
      setPaymentAccountId(accounts[0]?.id || '');
      setPayeeName('');
      setReferenceNo('');
      setDescription('');
      setReceiptUrl('');
    }
  }, [expenseToEdit, isOpen, accounts]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      toast.error('Please select an expense category');
      return;
    }
    if (amount <= 0) {
      toast.error('Amount must be greater than zero');
      return;
    }

    try {
      setIsSubmitting(true);
      if (expenseToEdit) {
        await databaseService.updateExpense(expenseToEdit.id, {
          date,
          category,
          amount: Number(amount),
          payment_account_id: paymentAccountId || null,
          payee_name: payeeName.trim() || null,
          reference_no: referenceNo.trim() || null,
          description: description.trim() || null,
          receipt_url: receiptUrl.trim() || null
        });
        toast.success('Expense record updated');
      } else {
        await databaseService.createExpense({
          date,
          category,
          amount: Number(amount),
          payment_account_id: paymentAccountId || null,
          payee_name: payeeName.trim() || null,
          reference_no: referenceNo.trim() || `EXP-${Date.now().toString().slice(-6)}`,
          description: description.trim() || null,
          receipt_url: receiptUrl.trim() || null,
          academic_year_id: academicYearId || null
        });
        toast.success('Expense recorded successfully');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {expenseToEdit ? 'Edit Expense Record' : 'Record New Expense'}
              </h2>
              <p className="text-[11px] text-slate-500">Academy operational expense entry</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <select
                required
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Amount (PKR) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                placeholder="e.g. 15000"
                value={amount || ''}
                onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-bold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono text-base text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Account
              </label>
              <select
                value={paymentAccountId}
                onChange={e => setPaymentAccountId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- No Account / Direct Cash --</option>
                {accounts.filter(a => a.status === 'active').map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Bal: Rs. {Number(a.current_balance).toLocaleString()})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payee / Vendor Name
              </label>
              <input
                type="text"
                placeholder="e.g. IESCO / Al-Rehman Book Depot"
                value={payeeName}
                onChange={e => setPayeeName(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Invoice / Reference #
              </label>
              <input
                type="text"
                placeholder="e.g. BILL-9921 / STAT-04"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Monthly electricity bill for ground floor air conditioners"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Receipt URL / Image Link
            </label>
            <input
              type="url"
              placeholder="https://... (Optional receipt photo or document link)"
              value={receiptUrl}
              onChange={e => setReceiptUrl(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : expenseToEdit ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
