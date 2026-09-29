import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import { BankAccount, AccountType, EntityStatus } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface BankAccountFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accountToEdit?: BankAccount | null;
}

export const BankAccountFormModal: React.FC<BankAccountFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accountToEdit
}) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountType, setAccountType] = useState<AccountType>('bank');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [status, setStatus] = useState<EntityStatus>('active');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accountToEdit) {
      setName(accountToEdit.name);
      setBankName(accountToEdit.bank_name);
      setAccountNumber(accountToEdit.account_number);
      setAccountType(accountToEdit.account_type);
      setOpeningBalance(Number(accountToEdit.opening_balance || 0));
      setStatus(accountToEdit.status);
      setNotes(accountToEdit.notes || '');
    } else {
      setName('');
      setBankName('');
      setAccountNumber('');
      setAccountType('bank');
      setOpeningBalance(0);
      setStatus('active');
      setNotes('');
    }
  }, [accountToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Please enter account title/name');
      return;
    }
    if (!bankName.trim()) {
      toast.error('Please enter bank or desk name');
      return;
    }
    if (!accountNumber.trim()) {
      toast.error('Please enter account or desk identification number');
      return;
    }

    try {
      setIsSubmitting(true);
      if (accountToEdit) {
        await databaseService.updateBankAccount(accountToEdit.id, {
          name: name.trim(),
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_type: accountType,
          status,
          notes: notes.trim() || null
        });
        toast.success('Account updated successfully');
      } else {
        await databaseService.createBankAccount({
          name: name.trim(),
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_type: accountType,
          opening_balance: Number(openingBalance) || 0,
          current_balance: Number(openingBalance) || 0,
          status,
          notes: notes.trim() || null
        });
        toast.success('Bank account registered successfully');
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to save account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                {accountToEdit ? 'Edit Account' : 'Add Bank or Cash Account'}
              </h2>
              <p className="text-[11px] text-slate-500">Configure financial treasury account</p>
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
              Account Display Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meezan Bank - Main Operational"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Bank / Entity Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Meezan Bank / Cash Desk"
                value={bankName}
                onChange={e => setBankName(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account Type *
              </label>
              <select
                value={accountType}
                onChange={e => setAccountType(e.target.value as AccountType)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="bank">Commercial Bank</option>
                <option value="cash">Cash in Hand / Desk</option>
                <option value="mobile_wallet">Mobile Wallet (Easypaisa/JazzCash)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Account / IBAN Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 01020109876543 / CASH-01"
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Opening Balance (PKR)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                disabled={!!accountToEdit}
                value={openingBalance}
                onChange={e => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50 disabled:text-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as EntityStatus)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Remarks / Branch</label>
              <input
                type="text"
                placeholder="e.g. Main Branch Lahore"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3.5 py-2.5 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>
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
              className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : accountToEdit ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
