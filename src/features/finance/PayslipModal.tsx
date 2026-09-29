import React from 'react';
import { X, Printer } from 'lucide-react';
import { Payroll, AcademySettings } from '../../types/database.types';

interface PayslipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: Payroll;
  settings?: AcademySettings | null;
}

export const PayslipModal: React.FC<PayslipModalProps> = ({
  isOpen,
  onClose,
  payroll,
  settings
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const academyName = settings?.academy_name || 'STAR ACADEMY';
  const academyAddress = settings?.address || 'Main Campus, Education Hub, Lahore, Pakistan';
  const academyPhone = settings?.phone || '+92 42 35870000';
  const academyEmail = settings?.email || 'admin@staracademy.edu.pk';

  const basic = Number(payroll.basic_salary || 0);
  const allowances = Number(payroll.allowances || 0);
  const gross = basic + allowances;
  const deductions = Number(payroll.deductions || 0);
  const advance = Number(payroll.advance_salary_deducted || 0);
  const totalDeductions = deductions + advance;
  const net = Number(payroll.net_salary || 0);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6">
        {/* Modal Controls - Hidden during print */}
        <div className="px-6 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-800">Teacher Payslip Voucher</span>
            <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-mono font-bold">
              {payroll.salary_month}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Payslip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Payslip Body */}
        <div className="p-8 print:p-6 text-slate-900 font-sans space-y-6">
          {/* Header */}
          <div className="text-center border-b-2 border-slate-900 pb-5">
            <div className="inline-block px-3 py-1 bg-slate-900 text-white font-black text-xs uppercase tracking-widest rounded-md mb-2">
              Official Salary Disbursement Slip
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">
              {academyName}
            </h1>
            <p className="text-xs text-slate-600 mt-1">{academyAddress}</p>
            <p className="text-[11px] text-slate-500">Tel: {academyPhone} | Email: {academyEmail}</p>
          </div>

          {/* Employee & Payroll Metadata Card */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Employee ID:</span>
                <span className="font-mono font-bold text-slate-900">{payroll.staff?.employee_id || 'TCH-001'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Teacher Name:</span>
                <span className="font-bold text-slate-900">{payroll.staff?.name || 'Faculty Member'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Designation:</span>
                <span className="font-medium text-slate-800">{payroll.staff?.designation || 'Lecturer'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Department:</span>
                <span className="font-medium text-slate-800">{payroll.staff?.department || 'Academics'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Salary Cycle:</span>
                <span className="font-bold text-slate-900">{payroll.salary_month}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Disbursement Date:</span>
                <span className="font-medium text-slate-800">{payroll.payment_date || 'Pending / Draft'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Payment Mode:</span>
                <span className="font-medium text-slate-800">{payroll.payment_method || 'Bank Transfer'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-slate-500 font-semibold">Reference #:</span>
                <span className="font-mono text-slate-800 text-[11px]">{payroll.transaction_reference || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Earnings & Deductions Table */}
          <div className="grid grid-cols-2 gap-6">
            {/* Earnings Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-emerald-50 px-4 py-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                  Gross Earnings (+)
                </h3>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-600 font-medium">Basic Salary</span>
                  <span className="font-mono font-bold text-slate-900">Rs. {basic.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-start pb-2 border-b border-dashed border-slate-200">
                  <div>
                    <span className="text-slate-600 font-medium block">Allowances &amp; Bonuses</span>
                    {payroll.allowances_breakdown && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 italic">{payroll.allowances_breakdown}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-emerald-700">Rs. {allowances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-bold text-slate-900">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono text-sm">Rs. {gross.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Deductions Column */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-rose-50 px-4 py-2 border-b border-slate-200">
                <h3 className="text-xs font-bold text-rose-900 uppercase tracking-wider">
                  Deductions &amp; Recoveries (-)
                </h3>
              </div>
              <div className="p-4 space-y-3 text-xs">
                <div className="flex justify-between items-start pb-2 border-b border-dashed border-slate-200">
                  <div>
                    <span className="text-slate-600 font-medium block">Statutory / Fine Deductions</span>
                    {payroll.deductions_breakdown && (
                      <span className="text-[10px] text-slate-400 block mt-0.5 italic">{payroll.deductions_breakdown}</span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-rose-700">Rs. {deductions.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-200">
                  <span className="text-slate-600 font-medium">Advance Salary Recovery</span>
                  <span className="font-mono font-bold text-rose-700">Rs. {advance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-1 font-bold text-slate-900">
                  <span>Total Deductions</span>
                  <span className="font-mono text-sm text-rose-700">Rs. {totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Net Salary Payable Box */}
          <div className="p-4 bg-slate-900 text-white rounded-xl flex items-center justify-between border-2 border-slate-900">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 block">
                Net Disbursed Take-Home Pay
              </span>
              <span className="text-2xl font-black font-mono text-emerald-400">
                PKR {net.toLocaleString()} /-
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Status: {payroll.payment_status.toUpperCase()}
              </span>
            </div>
          </div>

          {payroll.notes && (
            <p className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
              Note: {payroll.notes}
            </p>
          )}

          {/* Signatures */}
          <div className="pt-10 grid grid-cols-3 gap-6 text-center text-xs">
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                Prepared By (Accounts)
              </div>
              <span className="text-[10px] text-slate-400">Star Academy Accounts Desk</span>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                Approved By (Principal/Director)
              </div>
              <span className="text-[10px] text-slate-400">Authorized Signature &amp; Stamp</span>
            </div>
            <div>
              <div className="border-t border-slate-400 pt-1.5 font-bold text-slate-800">
                Received By (Teacher)
              </div>
              <span className="text-[10px] text-slate-400">Faculty Signature &amp; Date</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
