import React, { useState, useEffect } from 'react';
import {
  Building2,
  ArrowRightLeft,
  Receipt,
  Award,
  Plus,
  Search,
  Printer,
  CreditCard,
  Wallet,
  TrendingDown,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  ExternalLink,
  Users
} from 'lucide-react';
import {
  BankAccount,
  BankTransfer,
  Expense,
  Payroll,
  FinanceKPIStats,
  Staff,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { BankAccountFormModal } from './BankAccountFormModal';
import { BankTransferModal } from './BankTransferModal';
import { ExpenseFormModal } from './ExpenseFormModal';
import { PayrollFormModal } from './PayrollFormModal';
import { PayrollPaymentModal } from './PayrollPaymentModal';
import { PayslipModal } from './PayslipModal';

interface FinancePageProps {
  settings?: AcademySettings | null;
}

type FinanceTab = 'accounts' | 'expenses' | 'transfers' | 'payroll';

export const FinancePage: React.FC<FinancePageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<FinanceTab>('accounts');

  // Core Data States
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [transfers, setTransfers] = useState<BankTransfer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [kpiStats, setKpiStats] = useState<FinanceKPIStats>({
    totalLiquidBalance: 0,
    totalExpenses: 0,
    totalPayrollPaid: 0,
    pendingPayrollLiability: 0,
    netCashFlow: 0
  });

  // Filter States
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('');
  const [expenseSearch, setExpenseSearch] = useState<string>('');
  const [payrollMonthFilter, setPayrollMonthFilter] = useState<string>('');
  const [payrollStatusFilter, setPayrollStatusFilter] = useState<string>('');

  // Modals
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<BankAccount | null>(null);

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState<Expense | null>(null);

  const [isPayrollModalOpen, setIsPayrollModalOpen] = useState(false);
  const [payrollToEdit, setPayrollToEdit] = useState<Payroll | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payrollForPayment, setPayrollForPayment] = useState<Payroll | null>(null);

  const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
  const [payrollForPayslip, setPayrollForPayslip] = useState<Payroll | null>(null);

  // Confirm delete dialogs
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'account' | 'expense' | 'payroll';
    id: string;
    name: string;
  } | null>(null);

  const fetchData = async () => {
    try {
      const [accs, trfs, exps, pyrs, stf, kpi] = await Promise.all([
        databaseService.getBankAccounts(),
        databaseService.getBankTransfers(),
        databaseService.getExpenses({ academicYearId: selectedAcademicYear?.id }),
        databaseService.getPayrolls({ academicYearId: selectedAcademicYear?.id }),
        databaseService.getStaff(),
        databaseService.getFinanceKPIStats(selectedAcademicYear?.id)
      ]);

      setAccounts(accs);
      setTransfers(trfs);
      setExpenses(exps);
      setPayrolls(pyrs);
      setStaffList(stf);
      setKpiStats(kpi);
    } catch (err) {
      console.error('Failed to load finance data:', err);
      toast.error('Failed to load finance records');
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAcademicYear]);

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      if (itemToDelete.type === 'account') {
        await databaseService.deleteBankAccount(itemToDelete.id);
        toast.success('Account deleted successfully');
      } else if (itemToDelete.type === 'expense') {
        await databaseService.deleteExpense(itemToDelete.id);
        toast.success('Expense record deleted');
      } else if (itemToDelete.type === 'payroll') {
        await databaseService.deletePayroll(itemToDelete.id);
        toast.success('Payroll record deleted');
      }
      setItemToDelete(null);
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Deletion failed');
    }
  };

  // Filtered Expenses
  const filteredExpenses = expenses.filter(e => {
    if (expenseCategoryFilter && e.category.toLowerCase() !== expenseCategoryFilter.toLowerCase()) {
      return false;
    }
    if (expenseSearch) {
      const q = expenseSearch.toLowerCase();
      const matchPayee = (e.payee_name || '').toLowerCase().includes(q);
      const matchRef = (e.reference_no || '').toLowerCase().includes(q);
      const matchDesc = (e.description || '').toLowerCase().includes(q);
      const matchCat = (e.category || '').toLowerCase().includes(q);
      if (!matchPayee && !matchRef && !matchDesc && !matchCat) return false;
    }
    return true;
  });

  // Filtered Payrolls
  const filteredPayrolls = payrolls.filter(p => {
    if (payrollMonthFilter && p.salary_month.toLowerCase() !== payrollMonthFilter.toLowerCase()) {
      return false;
    }
    if (payrollStatusFilter && p.payment_status !== payrollStatusFilter) {
      return false;
    }
    return true;
  });

  // Unique months in payrolls
  const availableMonths = Array.from(new Set(payrolls.map(p => p.salary_month)));

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Finance & Accounts Management"
        subtitle="Bank accounts, internal transfers, operational expenditure, and faculty payroll"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-blue-600" />
              <span>Transfer Funds</span>
            </button>

            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <Receipt className="w-3.5 h-3.5 text-rose-600" />
              <span>Record Expense</span>
            </button>

            <button
              onClick={() => {
                setPayrollToEdit(null);
                setIsPayrollModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-2 bg-white text-slate-700 hover:text-slate-900 border border-slate-200/80 rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-2xs"
            >
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>Faculty Payroll</span>
            </button>

            <button
              onClick={() => {
                setAccountToEdit(null);
                setIsAccountModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </div>
        }
      />

      {/* 5 Master KPI Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Liquid Reserves */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Liquid Reserves
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-slate-900 tracking-tight">
              Rs. {kpiStats.totalLiquidBalance.toLocaleString()}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Across {accounts.length} active treasury accounts</p>
          </div>
        </div>

        {/* Total Operational Expenses */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Expenses
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-rose-600 tracking-tight">
              Rs. {kpiStats.totalExpenses.toLocaleString()}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">{expenses.length} operational records</p>
          </div>
        </div>

        {/* Disbursed Faculty Payroll */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Payroll Paid
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-blue-700 tracking-tight">
              Rs. {kpiStats.totalPayrollPaid.toLocaleString()}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Disbursed to teachers</p>
          </div>
        </div>

        {/* Pending Payroll Liability */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Payroll
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-amber-600 tracking-tight">
              Rs. {kpiStats.pendingPayrollLiability.toLocaleString()}
            </span>
            <p className="text-[10px] text-slate-400 mt-0.5">Awaiting disbursement</p>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="col-span-2 md:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/70 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Net Treasury
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl font-black font-mono text-indigo-700 tracking-tight">
              Rs. {kpiStats.netCashFlow.toLocaleString()}
            </span>
            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Liquid solvency index</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200/80 space-x-1">
        {[
          { id: 'accounts', label: 'Treasury & Bank Accounts', count: accounts.length, icon: Building2 },
          { id: 'expenses', label: 'Operational Expenses', count: expenses.length, icon: Receipt },
          { id: 'transfers', label: 'Internal Transfers', count: transfers.length, icon: ArrowRightLeft },
          { id: 'payroll', label: 'Teacher & Staff Payroll', count: payrolls.length, icon: Award }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FinanceTab)}
              className={`flex items-center space-x-2 px-4 py-3 text-xs font-bold border-b-2 -mb-px transition cursor-pointer ${
                isActive
                  ? 'border-slate-900 text-slate-900 bg-white/60 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ACCOUNTS & RESERVES */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {accounts.map(acc => {
              const isCash = acc.account_type === 'cash';
              const isWallet = acc.account_type === 'mobile_wallet';
              return (
                <div
                  key={acc.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/70 shadow-xs hover:border-slate-300 transition flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                          isCash
                            ? 'bg-emerald-100 text-emerald-800'
                            : isWallet
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {isCash ? (
                          <Wallet className="w-5 h-5" />
                        ) : (
                          <CreditCard className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${
                          acc.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {acc.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">
                      {acc.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">{acc.bank_name}</p>
                    <p className="text-[11px] font-mono text-slate-400 mt-1 bg-slate-50 px-2 py-1 rounded-md inline-block">
                      {acc.account_number}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
                      Available Balance
                    </span>
                    <span className="text-xl font-black font-mono text-slate-900 tracking-tight block">
                      Rs. {Number(acc.current_balance).toLocaleString()}
                    </span>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                      <span>Opening: Rs. {Number(acc.opening_balance).toLocaleString()}</span>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => {
                            setAccountToEdit(acc);
                            setIsAccountModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                          title="Edit Account"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setItemToDelete({
                              type: 'account',
                              id: acc.id,
                              name: acc.name
                            })
                          }
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: OPERATIONAL EXPENSES */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search payee, bill #, description..."
                  value={expenseSearch}
                  onChange={e => setExpenseSearch(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={expenseCategoryFilter}
                onChange={e => setExpenseCategoryFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">All Expense Categories</option>
                <option value="Electricity">Electricity</option>
                <option value="Rent">Rent</option>
                <option value="Salary">Salary</option>
                <option value="Stationery">Stationery</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Marketing">Marketing</option>
                <option value="Transport">Transport</option>
                <option value="Utilities">Utilities</option>
                <option value="Lab Supplies">Lab Supplies</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              onClick={() => {
                setExpenseToEdit(null);
                setIsExpenseModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Expense</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Payee / Vendor</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Payment Account</th>
                    <th className="px-4 py-3">Ref #</th>
                    <th className="px-4 py-3 text-right">Amount (PKR)</th>
                    <th className="px-4 py-3 text-center">Receipt</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                        No expense records match the search filter.
                      </td>
                    </tr>
                  ) : (
                    filteredExpenses.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                          {e.date}
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {e.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900">
                          {e.payee_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-xs truncate">
                          {e.description || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-700 font-medium">
                          {e.payment_account?.name || 'Direct Cash'}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {e.reference_no || '—'}
                        </td>
                        <td className="px-4 py-3 text-right font-black font-mono text-rose-600">
                          Rs. {Number(e.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {e.receipt_url ? (
                            <a
                              href={e.receipt_url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-indigo-600 hover:text-indigo-800 inline-flex items-center"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => {
                                setExpenseToEdit(e);
                                setIsExpenseModalOpen(true);
                              }}
                              className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded"
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() =>
                                setItemToDelete({
                                  type: 'expense',
                                  id: e.id,
                                  name: `${e.category} (Rs. ${e.amount})`
                                })
                              }
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERNAL TRANSFERS */}
      {activeTab === 'transfers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>Initiate Fund Transfer</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">From Account</th>
                    <th className="px-4 py-3">Destination Account</th>
                    <th className="px-4 py-3 text-right">Amount (PKR)</th>
                    <th className="px-4 py-3">Reference / Slip</th>
                    <th className="px-4 py-3">Description / Reason</th>
                    <th className="px-4 py-3">Initiated By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 text-xs">
                        No inter-account transfers recorded yet.
                      </td>
                    </tr>
                  ) : (
                    transfers.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="px-4 py-3 font-mono text-slate-600 whitespace-nowrap">
                          {t.transfer_date}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-900">
                          {t.from_account?.name || 'Source Account'}
                        </td>
                        <td className="px-4 py-3 font-semibold text-emerald-800">
                          {t.to_account?.name || 'Destination Account'}
                        </td>
                        <td className="px-4 py-3 text-right font-black font-mono text-slate-900">
                          Rs. {Number(t.amount).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                          {t.reference_no || '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-600 max-w-sm truncate">
                          {t.description || 'Inter-account fund transfer'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {t.created_by || 'Admin'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TEACHER & STAFF PAYROLL */}
      {activeTab === 'payroll' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/70 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <select
                value={payrollMonthFilter}
                onChange={e => setPayrollMonthFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">All Salary Cycles</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              <select
                value={payrollStatusFilter}
                onChange={e => setPayrollStatusFilter(e.target.value)}
                className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              >
                <option value="">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="approved">Approved</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  setPayrollToEdit(null);
                  setIsPayrollModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition border border-indigo-200/60"
              >
                <Users className="w-3.5 h-3.5" />
                <span>Bulk Faculty Payroll</span>
              </button>

              <button
                onClick={() => {
                  setPayrollToEdit(null);
                  setIsPayrollModalOpen(true);
                }}
                className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Payroll</span>
              </button>
            </div>
          </div>

          {/* Payroll List */}
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Teacher / Staff</th>
                    <th className="px-4 py-3">Cycle</th>
                    <th className="px-4 py-3 text-right">Basic</th>
                    <th className="px-4 py-3 text-right">Allowances (+)</th>
                    <th className="px-4 py-3 text-right">Deductions (-)</th>
                    <th className="px-4 py-3 text-right">Advance (-)</th>
                    <th className="px-4 py-3 text-right">Net Payable</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayrolls.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 text-xs">
                        No payroll records found for this selection.
                      </td>
                    </tr>
                  ) : (
                    filteredPayrolls.map(p => {
                      const isPaid = p.payment_status === 'paid';
                      const isApproved = p.payment_status === 'approved';
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/70 transition">
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">
                              {p.staff?.name || 'Teacher'}
                            </div>
                            <div className="text-[10px] text-slate-400">
                              {p.staff?.designation || p.staff?.role} • {p.staff?.employee_id}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-700 whitespace-nowrap">
                            {p.salary_month}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-slate-700">
                            Rs. {Number(p.basic_salary).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-emerald-700 font-medium">
                            +{Number(p.allowances || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-rose-700 font-medium">
                            -{Number(p.deductions || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-rose-700 font-medium">
                            -{Number(p.advance_salary_deducted || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono font-black text-slate-900 text-sm">
                            Rs. {Number(p.net_salary).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                                isPaid
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                                  : isApproved
                                  ? 'bg-blue-50 text-blue-700 border border-blue-200/50'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200/50'
                              }`}
                            >
                              {p.payment_status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end space-x-1.5">
                              {!isPaid && (
                                <button
                                  onClick={() => {
                                    setPayrollForPayment(p);
                                    setIsPaymentModalOpen(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-bold hover:bg-emerald-700 transition"
                                >
                                  Disburse / Pay
                                </button>
                              )}

                              <button
                                onClick={() => {
                                  setPayrollForPayslip(p);
                                  setIsPayslipModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                                title="Print Payslip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {!isPaid && (
                                <button
                                  onClick={() => {
                                    setPayrollToEdit(p);
                                    setIsPayrollModalOpen(true);
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  setItemToDelete({
                                    type: 'payroll',
                                    id: p.id,
                                    name: `${p.staff?.name} (${p.salary_month})`
                                  })
                                }
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {isAccountModalOpen && (
        <BankAccountFormModal
          isOpen={isAccountModalOpen}
          onClose={() => setIsAccountModalOpen(false)}
          onSuccess={fetchData}
          accountToEdit={accountToEdit}
        />
      )}

      {isTransferModalOpen && (
        <BankTransferModal
          isOpen={isTransferModalOpen}
          onClose={() => setIsTransferModalOpen(false)}
          onSuccess={fetchData}
          accounts={accounts}
        />
      )}

      {isExpenseModalOpen && (
        <ExpenseFormModal
          isOpen={isExpenseModalOpen}
          onClose={() => setIsExpenseModalOpen(false)}
          onSuccess={fetchData}
          expenseToEdit={expenseToEdit}
          accounts={accounts}
          academicYearId={selectedAcademicYear?.id}
        />
      )}

      {isPayrollModalOpen && (
        <PayrollFormModal
          isOpen={isPayrollModalOpen}
          onClose={() => setIsPayrollModalOpen(false)}
          onSuccess={fetchData}
          payrollToEdit={payrollToEdit}
          staffList={staffList}
          accounts={accounts}
          academicYearId={selectedAcademicYear?.id}
        />
      )}

      {isPaymentModalOpen && payrollForPayment && (
        <PayrollPaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => {
            setIsPaymentModalOpen(false);
            setPayrollForPayment(null);
          }}
          onSuccess={fetchData}
          payroll={payrollForPayment}
          accounts={accounts}
        />
      )}

      {isPayslipModalOpen && payrollForPayslip && (
        <PayslipModal
          isOpen={isPayslipModalOpen}
          onClose={() => {
            setIsPayslipModalOpen(false);
            setPayrollForPayslip(null);
          }}
          payroll={payrollForPayslip}
          settings={settings}
        />
      )}

      {itemToDelete && (
        <ConfirmationDialog
          isOpen={!!itemToDelete}
          title={`Delete ${itemToDelete.type.toUpperCase()}`}
          message={`Are you sure you want to permanently delete "${itemToDelete.name}"? This action cannot be reversed.`}
          confirmText="Delete"
          type="danger"
          onConfirm={handleDelete}
          onClose={() => setItemToDelete(null)}
        />
      )}
    </div>
  );
};
