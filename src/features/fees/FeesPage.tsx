import React, { useState, useEffect } from 'react';
import {
  FileText,
  CreditCard,
  AlertTriangle,
  Layers,
  Plus,
  Search,
  Printer,
  CheckCircle2,
  Phone,
  Trash2
} from 'lucide-react';
import {
  FeeInvoice,
  FeePayment,
  FeeStructure,
  FeeKPIStats,
  ClassItem,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { FeeStructureFormModal } from './FeeStructureFormModal';
import { FeePaymentModal } from './FeePaymentModal';
import { FeeInvoiceFormModal } from './FeeInvoiceFormModal';
import { FeeChallanModal } from './FeeChallanModal';

interface FeesPageProps {
  settings?: AcademySettings | null;
}

type FeeTab = 'invoices' | 'defaulters' | 'payments' | 'structures';

export const FeesPage: React.FC<FeesPageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<FeeTab>('invoices');
  const [classes, setClasses] = useState<ClassItem[]>([]);

  // Filter states
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Data states
  const [invoices, setInvoices] = useState<FeeInvoice[]>([]);
  const [payments, setPayments] = useState<FeePayment[]>([]);
  const [structures, setStructures] = useState<FeeStructure[]>([]);
  const [kpiStats, setKpiStats] = useState<FeeKPIStats>({
    totalInvoiced: 0,
    totalCollected: 0,
    totalOutstanding: 0,
    totalDefaulters: 0,
    collectionPercentage: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isStructureModalOpen, setIsStructureModalOpen] = useState(false);
  const [structureToEdit, setStructureToEdit] = useState<FeeStructure | null>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [invoiceForPayment, setInvoiceForPayment] = useState<FeeInvoice | null>(null);

  const [isChallanModalOpen, setIsChallanModalOpen] = useState(false);
  const [invoiceForChallan, setInvoiceForChallan] = useState<FeeInvoice | null>(null);

  // Delete invoice confirm
  const [invoiceToDelete, setInvoiceToDelete] = useState<FeeInvoice | null>(null);

  // Load prerequisites
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const cls = await databaseService.getClasses();
        setClasses(cls.filter(c => c.status === 'active'));
      } catch (err) {
        console.error(err);
      }
    };
    loadPrerequisites();
  }, []);

  // Fetch fees data
  const fetchData = async () => {
    if (!selectedAcademicYear) return;
    setIsLoading(true);
    try {
      const [invList, payList, structList, kpi] = await Promise.all([
        databaseService.getFeeInvoices({ academicYearId: selectedAcademicYear.id }),
        databaseService.getFeePayments({ academicYearId: selectedAcademicYear.id }),
        databaseService.getFeeStructures(selectedAcademicYear.id),
        databaseService.getFeeKPIStats(selectedAcademicYear.id)
      ]);
      setInvoices(invList);
      setPayments(payList);
      setStructures(structList);
      setKpiStats(kpi);
    } catch (err) {
      console.error('Failed to load fees data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAcademicYear]);

  // Handle invoice deletion
  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      await databaseService.deleteFeeInvoice(invoiceToDelete.id);
      toast.success(`Invoice ${invoiceToDelete.invoice_no} deleted`);
      setInvoiceToDelete(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete invoice');
    }
  };

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    if (selectedClassId && inv.class_id !== selectedClassId) return false;
    if (selectedStatus && inv.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        inv.invoice_no.toLowerCase().includes(term) ||
        inv.student?.student_name.toLowerCase().includes(term) ||
        inv.month.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Defaulters (outstanding balance > 0)
  const defaultersList = invoices.filter(inv => {
    if (selectedClassId && inv.class_id !== selectedClassId) return false;
    if (Number(inv.balance_amount) <= 0) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        inv.student?.student_name.toLowerCase().includes(term) ||
        inv.invoice_no.toLowerCase().includes(term) ||
        inv.month.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <PageHeader
        title="Fee Management &amp; Invoicing"
        subtitle="Manage student fee structures, monthly billing vouchers, partial collections, challans, and defaulter tracking."
        action={
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setStructureToEdit(null);
                setIsStructureModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-2xs"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Fee Structure</span>
            </button>
            <button
              type="button"
              onClick={() => setIsInvoiceModalOpen(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <FileText className="w-4 h-4" />
              <span>Issue Invoice / Batch</span>
            </button>
          </div>
        }
      />

      {/* 5 KPI Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Billed</span>
          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1 block">
            Rs {kpiStats.totalInvoiced.toLocaleString()}
          </span>
          <span className="text-[11px] text-slate-500 mt-1 block">{invoices.length} invoices generated</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">Total Collected</span>
          <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono mt-1 block">
            Rs {kpiStats.totalCollected.toLocaleString()}
          </span>
          <span className="text-[11px] text-emerald-600 mt-1 block font-semibold">
            {kpiStats.collectionPercentage}% collection rate
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block">Outstanding Due</span>
          <span className="text-xl sm:text-2xl font-black text-red-600 font-mono mt-1 block">
            Rs {kpiStats.totalOutstanding.toLocaleString()}
          </span>
          <span className="text-[11px] text-red-500 mt-1 block font-semibold">Uncollected fees</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider block">Defaulters</span>
          <span className="text-xl sm:text-2xl font-black text-amber-800 font-mono mt-1 block">
            {kpiStats.totalDefaulters}
          </span>
          <span className="text-[11px] text-amber-600 mt-1 block font-semibold">Pending payments</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">Total Receipts</span>
          <span className="text-xl sm:text-2xl font-black text-indigo-900 font-mono mt-1 block">
            {payments.length}
          </span>
          <span className="text-[11px] text-indigo-600 mt-1 block font-semibold">Payment transactions</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'invoices', label: 'Fee Invoices', icon: FileText, count: invoices.length },
          { id: 'defaulters', label: 'Outstanding Defaulters', icon: AlertTriangle, count: defaultersList.length },
          { id: 'payments', label: 'Payment Receipts & Audit', icon: CreditCard, count: payments.length },
          { id: 'structures', label: 'Fee Packages', icon: Layers, count: structures.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FeeTab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      {activeTab !== 'structures' && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
            <div className="min-w-[140px]">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50"
              >
                <option value="">All Classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {activeTab === 'invoices' && (
              <div className="min-w-[130px]">
                <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Status</label>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50"
                >
                  <option value="">All Statuses</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="unpaid">Unpaid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            )}

            <div className="flex-1 min-w-[200px]">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search</label>
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search student, invoice #, or month..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {(selectedClassId || selectedStatus || searchTerm) && (
            <div className="self-end pb-0.5">
              <button
                onClick={() => {
                  setSelectedClassId('');
                  setSelectedStatus('');
                  setSearchTerm('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 font-semibold underline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-xs font-semibold text-slate-500">Loading fee records...</span>
        </div>
      )}

      {/* TAB 1: FEE INVOICES */}
      {!isLoading && activeTab === 'invoices' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {filteredInvoices.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No fee invoices found</p>
              <p className="text-[11px] text-slate-400 mt-1">Issue a single invoice or run batch monthly billing.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class &amp; Section</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-right">Total (PKR)</th>
                    <th className="px-4 py-3 text-right">Paid</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {inv.invoice_no}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{inv.student?.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{inv.student?.admission_no}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {inv.class?.name}
                        {inv.section && <span className="text-slate-400"> • Sec {inv.section.name}</span>}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {inv.month}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {inv.due_date}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                        {Number(inv.total_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                        {Number(inv.paid_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-red-600">
                        {Number(inv.balance_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono uppercase ${
                          inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                          inv.status === 'partial' ? 'bg-amber-100 text-amber-800' :
                          inv.status === 'overdue' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {Number(inv.balance_amount) > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setInvoiceForPayment(inv);
                                setIsPaymentModalOpen(true);
                              }}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-2xs"
                            >
                              Collect Fee
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setInvoiceForChallan(inv);
                              setIsChallanModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                            title="Print 3-Part Challan Voucher"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setInvoiceToDelete(inv)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition"
                            title="Delete Invoice"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: OUTSTANDING DEFAULTERS */}
      {!isLoading && activeTab === 'defaulters' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-amber-50/40">
            <div>
              <h3 className="font-bold text-amber-950 text-xs uppercase tracking-wider">Fee Defaulters Directory</h3>
              <p className="text-[11px] text-amber-800">Students with unpaid or partial tuition balance.</p>
            </div>
            <span className="text-xs font-bold font-mono text-amber-900 bg-amber-100 px-3 py-1 rounded-xl">
              {defaultersList.length} Defaulters • Rs {kpiStats.totalOutstanding.toLocaleString()} Total Dues
            </span>
          </div>

          {defaultersList.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-800">No fee defaulters found!</p>
              <p className="text-[11px] text-slate-400 mt-1">All invoices are completely settled.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3">Class</th>
                    <th className="px-4 py-3">Invoice #</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Parent / Guardian Contact</th>
                    <th className="px-4 py-3 text-right">Outstanding (PKR)</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {defaultersList.map(inv => (
                    <tr key={inv.id} className="hover:bg-amber-50/30 transition">
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-900 block">{inv.student?.student_name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Adm: {inv.student?.admission_no}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-700">
                        {inv.class?.name}
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-slate-600">
                        {inv.invoice_no}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {inv.month}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-1 font-mono text-slate-700 font-semibold">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{inv.student?.phone || '0300-5550101'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">S/O {inv.student?.father_name || 'Guardian'}</span>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-red-600 text-sm">
                        Rs {Number(inv.balance_amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setInvoiceForPayment(inv);
                            setIsPaymentModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition shadow-2xs"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PAYMENT RECEIPTS */}
      {!isLoading && activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          {payments.length === 0 ? (
            <div className="text-center py-16">
              <CreditCard className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-600">No payment receipts yet</p>
              <p className="text-[11px] text-slate-400 mt-1">Received student payments will appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-[10px] uppercase font-bold text-slate-400">
                  <tr>
                    <th className="px-4 py-3">Receipt #</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Student</th>
                    <th className="px-4 py-3">Method</th>
                    <th className="px-4 py-3">Transaction Reference</th>
                    <th className="px-4 py-3">Collected By</th>
                    <th className="px-4 py-3 text-right">Amount Paid</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map(pay => (
                    <tr key={pay.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {pay.receipt_no}
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                        {pay.payment_date}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {pay.student?.student_name}
                      </td>
                      <td className="px-4 py-3">
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] font-semibold text-slate-700">
                          {pay.payment_method}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[11px] text-slate-600">
                        {pay.transaction_reference || '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">
                        {pay.collected_by || 'Accounts Desk'}
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-black text-emerald-700 text-sm">
                        Rs {Number(pay.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-400 text-[11px] italic">
                        {pay.remarks || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FEE STRUCTURES */}
      {!isLoading && activeTab === 'structures' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {structures.map(struct => (
            <div
              key={struct.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded uppercase">
                    {struct.billing_frequency}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded uppercase">
                    {struct.status}
                  </span>
                </div>
                <h3 className="font-extrabold text-slate-900 text-sm">{struct.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Class: <span className="font-semibold text-slate-800">{struct.class?.name || 'Class 9'}</span>
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Tuition Fee</span>
                    <span className="font-mono font-semibold">Rs {Number(struct.tuition_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Lab / IT Fee</span>
                    <span className="font-mono font-semibold">Rs {Number(struct.lab_fee).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Exam / Paper Fee</span>
                    <span className="font-mono font-semibold">Rs {Number(struct.exam_fee).toLocaleString()}</span>
                  </div>
                  {Number(struct.admission_fee) > 0 && (
                    <div className="flex justify-between text-slate-600">
                      <span>Admission Fee</span>
                      <span className="font-mono font-semibold">Rs {Number(struct.admission_fee).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-400 block">Total Net</span>
                  <span className="text-base font-black text-slate-900 font-mono">
                    Rs {Number(struct.total_amount).toLocaleString()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStructureToEdit(struct);
                    setIsStructureModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition"
                >
                  Edit Package
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {isStructureModalOpen && selectedAcademicYear && (
        <FeeStructureFormModal
          isOpen={isStructureModalOpen}
          onClose={() => setIsStructureModalOpen(false)}
          onSuccess={fetchData}
          structureToEdit={structureToEdit}
          academicYearId={selectedAcademicYear.id}
        />
      )}

      {isInvoiceModalOpen && selectedAcademicYear && (
        <FeeInvoiceFormModal
          isOpen={isInvoiceModalOpen}
          onClose={() => setIsInvoiceModalOpen(false)}
          onSuccess={fetchData}
          academicYearId={selectedAcademicYear.id}
        />
      )}

      {isPaymentModalOpen && invoiceForPayment && selectedAcademicYear && (
        <FeePaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSuccess={fetchData}
          invoice={invoiceForPayment}
          academicYearId={selectedAcademicYear.id}
        />
      )}

      {isChallanModalOpen && invoiceForChallan && (
        <FeeChallanModal
          isOpen={isChallanModalOpen}
          onClose={() => setIsChallanModalOpen(false)}
          invoice={invoiceForChallan}
          settings={settings}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!invoiceToDelete}
        title="Delete Fee Invoice?"
        message={`Are you sure you want to delete invoice "${invoiceToDelete?.invoice_no}"? Any payment records attached will also be removed.`}
        confirmText="Yes, Delete"
        type="danger"
        onConfirm={handleDeleteInvoice}
        onClose={() => setInvoiceToDelete(null)}
      />
    </div>
  );
};
