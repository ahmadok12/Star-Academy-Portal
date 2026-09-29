import React, { useState } from 'react';
import { X, DollarSign } from 'lucide-react';
import { FeeInvoice, PaymentMethod } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface FeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  invoice: FeeInvoice;
  academicYearId: string;
}

export const FeePaymentModal: React.FC<FeePaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  invoice,
  academicYearId
}) => {
  const toast = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [amount, setAmount] = useState<number>(Number(invoice.balance_amount) || 0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [collectedBy, setCollectedBy] = useState<string>('Accounts Desk');
  const [remarks, setRemarks] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      toast.error('Payment amount must be greater than zero');
      return;
    }
    if (amount > Number(invoice.balance_amount)) {
      toast.error(`Amount cannot exceed remaining balance of Rs ${Number(invoice.balance_amount).toLocaleString()}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await databaseService.recordFeePayment({
        invoice_id: invoice.id,
        student_id: invoice.student_id,
        academic_year_id: academicYearId,
        amount,
        payment_date: paymentDate,
        payment_method: paymentMethod,
        transaction_reference: transactionRef || null,
        collected_by: collectedBy || null,
        remarks: remarks || null
      });

      toast.success(`Payment of Rs ${amount.toLocaleString()} recorded successfully!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Payment recording failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newBalance = Math.max(0, Number(invoice.balance_amount) - amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Collect Fee Payment</h3>
              <p className="text-[11px] text-slate-500 font-mono">{invoice.invoice_no} • {invoice.month}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary Pill */}
        <div className="px-6 pt-4 pb-1">
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Student</span>
                <span className="text-xs font-bold text-slate-900">{invoice.student?.student_name || 'Enrolled Student'}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Due</span>
                <span className="text-xs font-mono font-bold text-slate-700">Rs {Number(invoice.total_amount).toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-500">Already Paid:</span>{' '}
                <span className="font-mono font-bold text-emerald-700">Rs {Number(invoice.paid_amount).toLocaleString()}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500">Remaining Balance:</span>{' '}
                <span className="font-mono font-black text-red-600">Rs {Number(invoice.balance_amount).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 pt-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Payment Amount (PKR) *</label>
              <button
                type="button"
                onClick={() => setAmount(Number(invoice.balance_amount))}
                className="text-[11px] text-emerald-600 font-bold hover:underline"
              >
                Pay Full Balance
              </button>
            </div>
            <input
              type="number"
              min="1"
              max={Number(invoice.balance_amount)}
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full text-base font-black font-mono rounded-xl border border-slate-300 px-3.5 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 bg-white"
            />
            <div className="flex items-center justify-between text-[11px] mt-1 text-slate-500">
              <span>Remaining After Payment:</span>
              <span className={`font-mono font-bold ${newBalance === 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                Rs {newBalance.toLocaleString()} {newBalance === 0 && '(Fully Cleared)'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Online / Mobile Wallet">Online / EasyPaisa / JazzCash</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={e => setPaymentDate(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Transaction Ref / Cheque #</label>
              <input
                type="text"
                placeholder="e.g. TRX-99214"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                className="w-full text-xs font-mono rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Collected By</label>
              <input
                type="text"
                value={collectedBy}
                onChange={e => setCollectedBy(e.target.value)}
                className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Note</label>
            <input
              type="text"
              placeholder="e.g. 1st installment paid in cash"
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 px-3 py-2 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
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
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Recording...' : `Confirm & Pay Rs ${amount.toLocaleString()}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
