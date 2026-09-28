import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Trash2, BookOpen } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SubjectFormModal } from './SubjectFormModal';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import { SubjectItem, EntityStatus } from '../../types/database.types';

export const SubjectsPage: React.FC = () => {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SubjectItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadSubjects = async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getSubjects();
      setSubjects(data);
    } catch (e: any) {
      toast.error('Failed to load subjects', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleOpenCreate = () => {
    setEditingSubject(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: SubjectItem) => {
    setEditingSubject(s);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    code: string;
    short_name: string;
    display_order: number;
    status: EntityStatus;
  }) => {
    if (editingSubject) {
      await databaseService.updateSubject(editingSubject.id, data);
      toast.success('Subject Updated', `"${data.name}" was updated successfully.`);
    } else {
      await databaseService.createSubject(data);
      toast.success('Subject Created', `"${data.name}" was created successfully.`);
    }
    await loadSubjects();
  };

  const handleToggleStatus = async (item: SubjectItem) => {
    const nextStatus: EntityStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await databaseService.updateSubject(item.id, { status: nextStatus });
      await loadSubjects();
      toast.info('Status Updated', `Subject "${item.name}" is now ${nextStatus}.`);
    } catch (e: any) {
      toast.error('Failed to update status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteSubject(deleteTarget.id);
      await loadSubjects();
      toast.success('Deleted', `Subject "${deleteTarget.name}" was removed.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Deletion Blocked', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.short_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<SubjectItem>[] = [
    {
      header: 'Subject Name',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <BookOpen className="w-3.5 h-3.5" />
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
      header: 'Short Name',
      accessorKey: 'short_name',
      cell: (row) => <span className="text-slate-600 font-medium">{row.short_name}</span>,
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
            title="Edit Subject"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Deactivate Subject' : 'Activate Subject'}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Subject"
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
          { label: 'Subjects Master' },
        ]}
        title="Subject Master Management"
        subtitle="Manage the global subject catalogue. Reusable across classes and academic years."
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search subjects by name, code, or short name..."
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
        data={filteredSubjects}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No subjects found matching your filters."
      />

      {/* Form Modal */}
      <SubjectFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSubject}
      />

      {/* Referential Integrity Delete Modal */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Subject Master"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Subjects assigned to any class curriculum across any academic year cannot be deleted and must be deactivated instead.`}
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
