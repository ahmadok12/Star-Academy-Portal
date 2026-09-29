import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { Payroll, BankAccount } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface PayrollPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payroll: Payroll;
  accounts: BankAccount[];
}

export const PayrollPaymentModal: React.FC<PayrollPaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  payroll,
  accounts
}) => {
  const toast = useToast();
  const [paymentAccountId, setPaymentAccountId] = useState<string>(
    accounts[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    payroll.payment_method || 'Bank Transfer'
  );
  const [paymentDate, setPaymentDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transactionReference, setTransactionReference] = useState<string>(
    `SAL-${payroll.salary_month.replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const selectedAccount = accounts.find(a => a.id === paymentAccountId);
  const netSalary = Number(payroll.net_salary || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!paymentAccountId) {
      toast.error('Please select the payment disbursement account');
      return;
    }

    if (selectedAccount && Number(selectedAccount.current_balance) < netSalary) {
      toast.error(
        `Insufficient funds in ${selectedAccount.name}. Balance: Rs. ${Number(selectedAccount.current_balance).toLocaleString()}, Net Salary: Rs. ${netSalary.toLocaleString()}`
      );
      return;
    }

    try {
      setIsSubmitting(true);
      await databaseService.payPayroll(payroll.id, {
        payment_account_id: paymentAccountId,
        payment_method: paymentMethod,
        payment_date: paymentDate,
        transaction_reference: transactionReference.trim()
      });

      toast.success(`Disbursed Rs. ${netSalary.toLocaleString()} to ${payroll.staff?.name || 'Staff'}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Disbursement failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-emerald-50/60">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Disburse Salary</h2>
              <p className="text-[11px] text-slate-500">Pay approved faculty payroll</p>
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
          {/* Summary Banner */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {payroll.staff?.name || 'Teacher'}
                </p>
                <p className="text-[11px] text-slate-500">
                  {payroll.staff?.designation || 'Faculty'} • {payroll.salary_month}
                </p>
              </div>
              <span className="text-base font-black font-mono text-emerald-600">
                Rs. {netSalary.toLocaleString()}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-200/60 pt-2">
              <span>Basic: Rs. {Number(payroll.basic_salary).toLocaleString()}</span>
              <span>Allowances: +{Number(payroll.allowances || 0).toLocaleString()}</span>
              <span>Deductions: -{(Number(payroll.deductions || 0) + Number(payroll.advance_salary_deducted || 0)).toLocaleString()}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Disburse From Account *
            </label>
            <select
              required
              value={paymentAccountId}
              onChange={e => setPaymentAccountId(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            >
              <option value="">-- Select Treasury Account --</option>
              {activeAccounts.map(a => (
                <option key={a.id} value={a.id}>
                  {a.name} (Bal: Rs. {Number(a.current_balance).toLocaleString()})
                </option>
              ))}
            </select>
            {selectedAccount && (
              <p className="text-[11px] text-slate-500 mt-1">
                Account Balance: <span className="font-bold text-slate-800">Rs. {Number(selectedAccount.current_balance).toLocaleString()}</span>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="Bank Transfer">Bank Transfer (Online)</option>
                <option value="Cash">Cash in Hand</option>
                <option value="Cheque">Crossed Cheque</option>
                <option value="Easypaisa">Easypaisa / JazzCash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Disbursement Date *
              </label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Transaction / Voucher Reference *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. TRX-MEEZAN-88912"
              value={transactionReference}
              onChange={e => setTransactionReference(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Disbursing...' : 'Confirm & Disburse'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
