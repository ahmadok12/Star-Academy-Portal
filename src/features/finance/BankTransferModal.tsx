import React, { useState } from 'react';
import { X, ArrowRightLeft } from 'lucide-react';
import { BankAccount } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: BankAccount[];
}

export const BankTransferModal: React.FC<BankTransferModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts
}) => {
  const toast = useToast();
  const [fromAccountId, setFromAccountId] = useState<string>('');
  const [toAccountId, setToAccountId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [transferDate, setTransferDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [referenceNo, setReferenceNo] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [createdBy, setCreatedBy] = useState<string>('Accounts Dept');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const activeAccounts = accounts.filter(a => a.status === 'active');
  const selectedFromAccount = accounts.find(a => a.id === fromAccountId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromAccountId) {
      toast.error('Please select the source account');
      return;
    }
    if (!toAccountId) {
      toast.error('Please select the destination account');
      return;
    }
    if (fromAccountId === toAccountId) {
      toast.error('Source and destination accounts must be different');
      return;
    }
    if (amount <= 0) {
      toast.error('Please enter a valid transfer amount greater than zero');
      return;
    }

    if (selectedFromAccount && Number(selectedFromAccount.current_balance) < amount) {
      toast.error(`Insufficient balance in ${selectedFromAccount.name}. Available: Rs. ${Number(selectedFromAccount.current_balance).toLocaleString()}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await databaseService.createBankTransfer({
        transfer_date: transferDate,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount: Number(amount),
        reference_no: referenceNo.trim() || `TRF-${Date.now().toString().slice(-6)}`,
        description: description.trim() || 'Internal inter-account fund transfer',
        created_by: createdBy.trim() || 'Admin Office'
      });

      toast.success('Funds transferred successfully!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Transfer failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Transfer Funds</h2>
              <p className="text-[11px] text-slate-500">Internal inter-account bank transfer</p>
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
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Transfer Date *
            </label>
            <input
              type="date"
              required
              value={transferDate}
              onChange={e => setTransferDate(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                From Account (Source) *
              </label>
              <select
                required
                value={fromAccountId}
                onChange={e => setFromAccountId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Select Source Account --</option>
                {activeAccounts.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name} (Bal: Rs. {Number(a.current_balance).toLocaleString()})
                  </option>
                ))}
              </select>
              {selectedFromAccount && (
                <p className="text-[11px] text-slate-500 mt-1">
                  Available: <span className="font-bold text-emerald-600">Rs. {Number(selectedFromAccount.current_balance).toLocaleString()}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                To Account (Destination) *
              </label>
              <select
                required
                value={toAccountId}
                onChange={e => setToAccountId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Select Destination Account --</option>
                {activeAccounts
                  .filter(a => a.id !== fromAccountId)
                  .map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} (Bal: Rs. {Number(a.current_balance).toLocaleString()})
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Amount (PKR) *
            </label>
            <input
              type="number"
              required
              min="1"
              step="1"
              placeholder="e.g. 50000"
              value={amount || ''}
              onChange={e => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono text-base font-bold text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Reference / Cheque #
              </label>
              <input
                type="text"
                placeholder="e.g. CHQ-481290 / TRF-01"
                value={referenceNo}
                onChange={e => setReferenceNo(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Initiated By
              </label>
              <input
                type="text"
                placeholder="e.g. Accounts Dept"
                value={createdBy}
                onChange={e => setCreatedBy(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Reason
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Daily front desk cash deposit to corporate current account"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full text-xs font-medium rounded-xl border border-slate-200 p-3 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 resize-none"
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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Transferring...' : 'Execute Transfer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
