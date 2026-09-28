import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Trash2, Sparkles, Users } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { BatchFormModal } from './BatchFormModal';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import { BatchItem, EntityStatus } from '../../types/database.types';

export const BatchesPage: React.FC = () => {
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<BatchItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadBatches = async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getBatches();
      setBatches(data);
    } catch (e: any) {
      toast.error('Failed to load batches', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const handleOpenCreate = () => {
    setEditingBatch(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (b: BatchItem) => {
    setEditingBatch(b);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    code: string;
    description?: string;
    display_order: number;
    status: EntityStatus;
  }) => {
    if (editingBatch) {
      await databaseService.updateBatch(editingBatch.id, data);
      toast.success('Batch Updated', `"${data.name}" was updated successfully.`);
    } else {
      await databaseService.createBatch(data);
      toast.success('Batch Created', `"${data.name}" was created successfully.`);
    }
    await loadBatches();
  };

  const handleToggleStatus = async (item: BatchItem) => {
    const nextStatus: EntityStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await databaseService.updateBatchStatus(item.id, nextStatus);
      await loadBatches();
      toast.info('Status Updated', `Batch "${item.name}" is now ${nextStatus}.`);
    } catch (e: any) {
      toast.error('Failed to update status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteBatch(deleteTarget.id);
      await loadBatches();
      toast.success('Deleted', `Batch "${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Deletion Prevented', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getBatchTheme = (code: string) => {
    switch (code) {
      case 'ADV':
        return {
          pill: 'bg-purple-100 text-purple-800 border-purple-200',
          avatar: 'bg-purple-900 text-purple-100',
          desc: 'High-performance / Advanced curriculum',
        };
      case 'ICU':
        return {
          pill: 'bg-rose-100 text-rose-800 border-rose-200',
          avatar: 'bg-rose-900 text-rose-100',
          desc: 'Academic rescue / intensive care unit',
        };
      case 'REG':
      default:
        return {
          pill: 'bg-blue-100 text-blue-800 border-blue-200',
          avatar: 'bg-slate-900 text-white',
          desc: 'Standard curriculum',
        };
    }
  };

  const columns: Column<BatchItem>[] = [
    {
      header: 'Seq',
      accessorKey: 'display_order',
      className: 'w-16 font-mono text-slate-500 font-bold',
      cell: (row) => `#${row.display_order}`,
    },
    {
      header: 'Batch Details',
      cell: (row) => {
        const theme = getBatchTheme(row.code);
        return (
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${theme.avatar}`}>
              {row.code}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900">{row.name}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${theme.pill}`}>
                  {row.code}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
                {row.description || theme.desc}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      header: 'Scope & Application',
      cell: (row) => (
        <div className="text-xs text-slate-600">
          <span className="inline-flex items-center gap-1 font-medium bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
            <Users className="w-3 h-3 text-slate-500" />
            Class + Section Placement
          </span>
          <p className="text-[11px] text-slate-400 mt-0.5">
            E.g. 9th Science ({row.name})
          </p>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1">
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Deactivate Batch' : 'Activate Batch'}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Power className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Batch"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Batch"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Academic Setup' },
          { label: 'Batches Master' },
        ]}
        title="Student Batches Configuration"
        subtitle="Manage dynamic batches (Advance, Regular, ICU) used to group students within any class and section."
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Batch</span>
          </button>
        }
      />

      {/* Information Alert */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs flex items-start space-x-3.5">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="text-xs">
          <h4 className="font-bold text-slate-900">Dynamic Multi-Batch Architecture</h4>
          <p className="text-slate-500 mt-0.5 leading-relaxed">
            Batches are dynamic master records. A single class and section can have multiple batches simultaneously.
            For example, <strong>Class 9th (Section Science)</strong> can have both an <strong>Advance Batch</strong> for top performers and a <strong>Regular Batch</strong> (or <strong>ICU Batch</strong> for focused academic support).
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search batches by name or code..."
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500 font-semibold">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
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
        data={filteredBatches}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No batches defined yet. Click 'Add Batch' to create your first batch."
      />

      {/* Create / Edit Modal */}
      <BatchFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingBatch}
      />

      {/* Delete Confirmation */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Batch Master"
        message={`Are you sure you want to permanently delete batch "${deleteTarget?.name}" (${deleteTarget?.code})? This action cannot be undone.`}
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
