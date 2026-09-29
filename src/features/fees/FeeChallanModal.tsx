import React from 'react';
import { X, Printer } from 'lucide-react';
import { FeeInvoice, AcademySettings } from '../../types/database.types';

interface FeeChallanModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: FeeInvoice;
  settings?: AcademySettings | null;
}

export const FeeChallanModal: React.FC<FeeChallanModalProps> = ({
  isOpen,
  onClose,
  invoice,
  settings
}) => {
  if (!isOpen) return null;

  const academyName = settings?.academy_name || 'STAR ACADEMY';
  const academyAddress = settings?.address || 'Main Campus, Education Hub, Lahore, Pakistan';
  const academyPhone = settings?.phone || '+92 42 35870000';

  const handlePrint = () => {
    window.print();
  };

  const renderChallanCopy = (copyTitle: string) => (
    <div className="border border-slate-300 rounded-xl p-4 bg-white flex flex-col justify-between text-slate-800 text-[11px] leading-tight space-y-3 print:border-slate-800 print:text-[10px]">
      {/* Header */}
      <div className="text-center pb-2 border-b border-dashed border-slate-300">
        <div className="flex items-center justify-center space-x-1.5">
          <div className="w-5 h-5 rounded-md bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
            ★
          </div>
          <span className="font-extrabold text-xs uppercase tracking-tight text-slate-900">{academyName}</span>
        </div>
        <p className="text-[9px] text-slate-500 mt-0.5">{academyAddress}</p>
        <p className="text-[9px] text-slate-500 font-mono">Ph: {academyPhone}</p>
        <div className="mt-1.5 inline-block bg-slate-100 text-slate-800 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wider border border-slate-200">
          {copyTitle}
        </div>
      </div>

      {/* Invoice & Student Meta */}
      <div className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-mono text-[10px]">
        <div className="flex justify-between">
          <span className="text-slate-500">Challan #:</span>
          <span className="font-bold text-slate-900">{invoice.invoice_no}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Billing Month:</span>
          <span className="font-bold text-slate-900">{invoice.month}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Issue Date:</span>
          <span>{invoice.issue_date}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Due Date:</span>
          <span className="font-bold text-red-600">{invoice.due_date}</span>
        </div>
      </div>

      {/* Student Details */}
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between border-b border-slate-100 pb-0.5">
          <span className="text-slate-500">Student Name:</span>
          <span className="font-bold text-slate-900">{invoice.student?.student_name || 'Enrolled Student'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-0.5">
          <span className="text-slate-500">Father's Name:</span>
          <span className="font-medium text-slate-800">{invoice.student?.father_name || '—'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-0.5">
          <span className="text-slate-500">Admission No:</span>
          <span className="font-mono font-bold text-slate-800">{invoice.student?.admission_no || 'ADM-0001'}</span>
        </div>
        <div className="flex justify-between border-b border-slate-100 pb-0.5">
          <span className="text-slate-500">Class &amp; Section:</span>
          <span className="font-bold text-slate-800">
            {invoice.class?.name || 'Class 9'} - Section {invoice.section?.name || 'Science'}
          </span>
        </div>
      </div>

      {/* Fee Breakdown Table */}
      <table className="w-full text-[10px] border border-slate-200">
        <thead className="bg-slate-100 font-bold text-slate-600">
          <tr>
            <th className="p-1 text-left border-b border-slate-200">Particulars</th>
            <th className="p-1 text-right border-b border-slate-200">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-mono">
          <tr>
            <td className="p-1 font-sans">Tuition &amp; Academic Fee</td>
            <td className="p-1 text-right">Rs {Number(invoice.subtotal).toLocaleString()}</td>
          </tr>
          {Number(invoice.discount) > 0 && (
            <tr className="text-emerald-700 bg-emerald-50/50">
              <td className="p-1 font-sans">Less: Concession / Scholarship</td>
              <td className="p-1 text-right">- Rs {Number(invoice.discount).toLocaleString()}</td>
            </tr>
          )}
          {Number(invoice.fine) > 0 && (
            <tr className="text-red-700 bg-red-50/50">
              <td className="p-1 font-sans">Late Fee Fine</td>
              <td className="p-1 text-right">+ Rs {Number(invoice.fine).toLocaleString()}</td>
            </tr>
          )}
          <tr className="bg-slate-100 font-black text-slate-900 border-t border-slate-300">
            <td className="p-1.5 font-sans font-bold">Total Net Payable:</td>
            <td className="p-1.5 text-right font-mono text-xs">Rs {Number(invoice.total_amount).toLocaleString()}</td>
          </tr>
          <tr>
            <td className="p-1 text-slate-500 font-sans">Amount Paid:</td>
            <td className="p-1 text-right font-bold text-emerald-700">Rs {Number(invoice.paid_amount).toLocaleString()}</td>
          </tr>
          <tr className="font-bold">
            <td className="p-1 text-slate-700 font-sans">Remaining Balance:</td>
            <td className="p-1 text-right text-red-600">Rs {Number(invoice.balance_amount).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      {/* Payment Status & Instructions */}
      <div className="flex items-center justify-between text-[9px] pt-1">
        <span className="font-semibold text-slate-400">Payment Status:</span>
        <span className={`px-2 py-0.5 rounded font-black font-mono uppercase ${
          invoice.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
          invoice.status === 'partial' ? 'bg-amber-100 text-amber-800' :
          invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
          'bg-slate-200 text-slate-800'
        }`}>
          {invoice.status}
        </span>
      </div>

      <p className="text-[8px] text-slate-400 italic text-center">
        Fees once paid are non-refundable. Late fee of Rs 200 applies after due date.
      </p>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-3 pt-6 text-[8px] text-center border-t border-dashed border-slate-200">
        <div>
          <div className="border-t border-slate-400 w-3/4 mx-auto mb-0.5"></div>
          <span className="text-slate-400 uppercase font-semibold">Cashier / Bank Stamp</span>
        </div>
        <div>
          <div className="border-t border-slate-400 w-3/4 mx-auto mb-0.5"></div>
          <span className="text-slate-400 uppercase font-semibold">Authorized Officer</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Top Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              ★
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Official Fee Challan Voucher</h3>
              <p className="text-[11px] text-slate-500 font-mono">
                {invoice.invoice_no} • {invoice.student?.student_name}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print 3-Part Challan</span>
            </button>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3-Part Voucher Container */}
        <div className="p-6 bg-slate-100/50 print:p-0 print:bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            {renderChallanCopy('Bank Copy')}
            {renderChallanCopy('Academy Office Copy')}
            {renderChallanCopy('Student / Parent Copy')}
          </div>
        </div>
      </div>
    </div>
  );
};
