import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Power, Trash2, Layers } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { SectionFormModal } from './SectionFormModal';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import { SectionItem, EntityStatus } from '../../types/database.types';

export const SectionsPage: React.FC = () => {
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionItem | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<SectionItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const toast = useToast();

  const loadSections = async () => {
    try {
      setIsLoading(true);
      const data = await databaseService.getSections();
      setSections(data);
    } catch (e: any) {
      toast.error('Failed to load sections', e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSections();
  }, []);

  const handleOpenCreate = () => {
    setEditingSection(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (s: SectionItem) => {
    setEditingSection(s);
    setModalOpen(true);
  };

  const handleFormSubmit = async (data: {
    name: string;
    code: string;
    display_order: number;
    status: EntityStatus;
  }) => {
    if (editingSection) {
      await databaseService.updateSection(editingSection.id, data);
      toast.success('Section Updated', `"${data.name}" was updated successfully.`);
    } else {
      await databaseService.createSection(data);
      toast.success('Section Created', `"${data.name}" was created successfully.`);
    }
    await loadSections();
  };

  const handleToggleStatus = async (item: SectionItem) => {
    const nextStatus: EntityStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await databaseService.updateSection(item.id, { status: nextStatus });
      await loadSections();
      toast.info('Status Updated', `Section "${item.name}" is now ${nextStatus}.`);
    } catch (e: any) {
      toast.error('Failed to update status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteSection(deleteTarget.id);
      await loadSections();
      toast.success('Deleted', `Section "${deleteTarget.name}" was deleted.`);
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Deletion Prevented', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSections = sections.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<SectionItem>[] = [
    {
      header: 'Section',
      accessorKey: 'name',
      cell: (row) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-3.5 h-3.5" />
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
            title="Edit Section"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Deactivate Section' : 'Activate Section'}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Delete Section"
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
          { label: 'Sections Master' },
        ]}
        title="Section Master Management"
        subtitle="Manage reusable sections. Sections are decoupled master records that get assigned to classes per academic cycle."
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Add Section</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search sections by name or code..."
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
        data={filteredSections}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No sections found."
      />

      {/* Form Modal */}
      <SectionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={editingSection}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Section Master"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? Sections assigned to classes in active or historical years are protected from deletion.`}
        confirmText="Confirm Delete"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
