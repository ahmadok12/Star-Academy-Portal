import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Trash2, GraduationCap } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ClassFormModal } from './ClassFormModal';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import { ClassItem, EntityStatus } from '../../types/database.types';

export const ClassesPage: React.FC = () => {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ClassItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadClasses = async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getClasses();
      setClasses(data);
    } catch (e: any) {
      toast.error('Failed to load classes', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleOpenCreate = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (c: ClassItem) => {
    setEditingClass(c);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    code: string;
    display_order: number;
    status: EntityStatus;
  }) => {
    if (editingClass) {
      await databaseService.updateClass(editingClass.id, data);
      toast.success('Class Updated', `"${data.name}" was updated successfully.`);
    } else {
      await databaseService.createClass(data);
      toast.success('Class Created', `"${data.name}" was created successfully.`);
    }
    await loadClasses();
  };

  const handleToggleStatus = async (item: ClassItem) => {
    const nextStatus: EntityStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await databaseService.updateClass(item.id, { status: nextStatus });
      await loadClasses();
      toast.info('Status Updated', `Class "${item.name}" is now ${nextStatus}.`);
    } catch (e: any) {
      toast.error('Failed to update status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteClass(deleteTarget.id);
      await loadClasses();
      toast.success('Deleted', `Class "${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Deletion Prevented', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<ClassItem>[] = [
    {
      header: 'Class',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <GraduationCap className="w-3.5 h-3.5" />
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
      header: 'Code',
      accessorKey: 'code',
      cell: (row) => (
        <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-semibold border border-slate-200">
          {row.code}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Order',
      accessorKey: 'display_order',
      cell: (row) => (
        <span className="font-mono text-xs text-slate-600 font-bold bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
          #{row.display_order}
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => handleOpenEdit(row)}
            title="Edit Class"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Deactivate Class' : 'Activate Class'}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Class"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
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
          { label: 'Classes Master' },
        ]}
        title="Class Master Management"
        subtitle="Manage reusable educational standards. Referenced classes cannot be deleted to preserve academic history."
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Class</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search classes by name or code..."
          className="w-full sm:w-80"
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
        data={filteredClasses}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No classes found."
      />

      {/* Form Modal */}
      <ClassFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingClass}
      />

      {/* Referential Integrity Protected Delete Modal */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Class Master"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Important: Classes referenced in any historical academic year cannot be deleted and must be deactivated instead.`}
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
