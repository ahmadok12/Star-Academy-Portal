import React, { useState } from 'react';
import { Plus, Edit2, CheckCircle, Power, Trash2, Calendar } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { AcademicYearFormModal } from './AcademicYearFormModal';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { databaseService } from '../../lib/database-service';
import { AcademicYear } from '../../types/database.types';

export const AcademicYearsPage: React.FC = () => {
  const {
    academicYears,
    currentAcademicYear,
    selectedAcademicYear,
    setCurrentAcademicYear,
    refreshAcademicYears,
    isLoading
  } = useAcademicYear();

  const toast = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);

  // Confirmation state for setting current year
  const [confirmYear, setConfirmYear] = useState<AcademicYear | null>(null);
  const [isSettingCurrent, setIsSettingCurrent] = useState(false);

  // Deletion confirmation
  const [deleteTarget, setDeleteTarget] = useState<AcademicYear | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleOpenCreate = () => {
    setEditingYear(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (year: AcademicYear) => {
    setEditingYear(year);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    start_date: string;
    end_date: string;
    status: 'active' | 'inactive';
    is_current: boolean;
  }) => {
    if (editingYear) {
      await databaseService.updateAcademicYear(editingYear.id, data);
      toast.success('Academic Year Updated', `"${data.name}" was updated successfully.`);
    } else {
      await databaseService.createAcademicYear(data);
      toast.success('Academic Year Created', `"${data.name}" was added to the system.`);
    }
    await refreshAcademicYears();
  };

  const handleConfirmSetCurrent = async () => {
    if (!confirmYear) return;
    try {
      setIsSettingCurrent(true);
      await setCurrentAcademicYear(confirmYear.id);
      setConfirmYear(null);
    } catch (err: any) {
      // Error handled in context
    } finally {
      setIsSettingCurrent(false);
    }
  };

  const handleToggleStatus = async (year: AcademicYear) => {
    if (year.is_current && year.status === 'active') {
      toast.error('Cannot Deactivate', 'The current active academic year cannot be deactivated. Set another year as current first.');
      return;
    }
    const newStatus = year.status === 'active' ? 'inactive' : 'active';
    try {
      await databaseService.updateAcademicYear(year.id, { status: newStatus });
      await refreshAcademicYears();
      toast.info('Status Changed', `Academic year "${year.name}" set to ${newStatus}.`);
    } catch (e: any) {
      toast.error('Failed to change status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteAcademicYear(deleteTarget.id);
      await refreshAcademicYears();
      toast.success('Deleted', `Academic year "${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Deletion Blocked', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredYears = academicYears.filter((y) => {
    const matchesSearch = y.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || y.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<AcademicYear>[] = [
    {
      header: 'Academic Year',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{row.name}</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ID: {row.id.substring(0, 8)}...
            </span>
          </div>
        </div>
      ),
    },
    {
      header: 'Start Date',
      accessorKey: 'start_date',
      cell: (row) => <span className="font-mono text-slate-600">{row.start_date}</span>,
    },
    {
      header: 'End Date',
      accessorKey: 'end_date',
      cell: (row) => <span className="font-mono text-slate-600">{row.end_date}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} isCurrent={row.is_current} />,
    },
    {
      header: 'Current Year Designation',
      cell: (row) => (
        <div>
          {row.is_current ? (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <CheckCircle className="w-3.5 h-3.5" />
              Default Active Year
            </span>
          ) : (
            <button
              onClick={() => setConfirmYear(row)}
              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
              type="button"
            >
              Set as Current
            </button>
          )}
        </div>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Year"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Deactivate Year' : 'Activate Year'}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          {!row.is_current && (
            <button
              onClick={() => setDeleteTarget(row)}
              title="Delete Year"
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
              type="button"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Academic Setup' },
          { label: 'Academic Years' },
        ]}
        title="Academic Year Management"
        subtitle="Manage academic cycles, dates, and define the current year used as default throughout the academy."
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Academic Year</span>
          </button>
        }
      />

      {/* Prominent Current Academic Year Banner */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                Official Current Academic Year:
              </span>
              <span className="text-xs font-extrabold text-emerald-700 font-mono px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200/60">
                {currentAcademicYear?.name || 'None Set'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Dates: {currentAcademicYear?.start_date} &rarr; {currentAcademicYear?.end_date} (All future admissions, exams, and attendance tie to this cycle).
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Context View: <strong className="text-slate-800">{selectedAcademicYear?.name}</strong>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search academic years..."
          className="w-full sm:w-72"
        />

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span className="text-xs text-slate-400 font-semibold">Filter:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium focus:ring-slate-900"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredYears}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No academic years match your filters."
      />

      {/* Add / Edit Modal */}
      <AcademicYearFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingYear}
      />

      {/* Set Current Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!confirmYear}
        onClose={() => setConfirmYear(null)}
        onConfirm={handleConfirmSetCurrent}
        title="Set as Current Academic Year?"
        message={`Are you sure you want to designate "${confirmYear?.name}" as the current academic year? This will automatically remove current status from "${currentAcademicYear?.name}" and immediately update all default workflows.`}
        confirmText="Yes, Set as Current"
        type="primary"
        isLoading={isSettingCurrent}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Academic Year"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Academic years referenced by historical data will be protected by referential integrity.`}
        confirmText="Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
