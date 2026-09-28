import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Power, Trash2, Link2, Calendar, Filter } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { ClassSectionFormModal } from './ClassSectionFormModal';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { databaseService } from '../../lib/database-service';
import { ClassSection, ClassItem, SectionItem, EntityStatus } from '../../types/database.types';

export const ClassSectionsPage: React.FC = () => {
  const { academicYears, selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [classSections, setClassSections] = useState<ClassSection[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ClassSection | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = useCallback(async () => {
    if (!selectedAcademicYear) return;
    try {
      setIsLoading(true);
      const [csList, cList, sList] = await Promise.all([
        databaseService.getClassSections(selectedAcademicYear.id),
        databaseService.getClasses(),
        databaseService.getSections(),
      ]);
      setClassSections(csList);
      setClasses(cList);
      setSections(sList);
    } catch (e: any) {
      toast.error('Failed to load class sections', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateAssignment = async ({
    academicYearId,
    classId,
    sectionId,
  }: {
    academicYearId: string;
    classId: string;
    sectionId: string;
  }) => {
    await databaseService.createClassSection(academicYearId, classId, sectionId);
    toast.success('Section Assigned', 'Section successfully linked to class for the academic year.');
    await loadData();
  };

  const handleToggleStatus = async (item: ClassSection) => {
    const nextStatus: EntityStatus = item.status === 'active' ? 'inactive' : 'active';
    try {
      await databaseService.updateClassSectionStatus(item.id, nextStatus);
      await loadData();
      toast.info('Status Updated', `Class section status set to ${nextStatus}.`);
    } catch (e: any) {
      toast.error('Failed to update status', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await databaseService.deleteClassSection(deleteTarget.id);
      await loadData();
      toast.success('Unlinked', 'Class section relationship removed.');
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error('Cannot Remove', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredItems = classSections.filter((item) => {
    const matchesClass = selectedClassFilter === 'all' || item.class_id === selectedClassFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesClass && matchesStatus;
  });

  const columns: Column<ClassSection>[] = [
    {
      header: 'Class',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-900">{row.class?.name || 'Unknown Class'}</span>
          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-mono font-semibold">
            {row.class?.code}
          </span>
        </div>
      ),
    },
    {
      header: 'Assigned Section',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span className="w-6 h-6 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            {row.section?.name || '?'}
          </span>
          <span className="text-xs font-semibold text-slate-700">
            Section {row.section?.name}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            ({row.section?.code})
          </span>
        </div>
      ),
    },
    {
      header: 'Academic Cycle',
      cell: (row) => (
        <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
          <Calendar className="w-3 h-3 text-slate-400" />
          {row.academic_year?.name || selectedAcademicYear?.name}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => handleToggleStatus(row)}
            title={row.status === 'active' ? 'Deactivate Section for this Class' : 'Activate Section'}
            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-slate-100 rounded-lg transition"
            type="button"
          >
            <Power className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setDeleteTarget(row)}
            title="Unlink Section"
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
          { label: 'Class Sections' },
        ]}
        title="Class Sections Configuration"
        subtitle="Associate reusable sections with specific classes for each academic year. Section offerings adapt per academic cycle."
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            type="button"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Class Section</span>
          </button>
        }
      />

      {/* Active Academic Year Context Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <Link2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Current Academic Scope:</span>
              <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {selectedAcademicYear?.name || 'None Selected'}
              </span>
              {selectedAcademicYear?.is_current && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200/60">
                  Current Year
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Showing active class-section relationships configured specifically for this cycle.
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          Total Configurations: {classSections.length}
        </span>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-600 font-semibold">Filter Class:</span>
            <select
              value={selectedClassFilter}
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Classes</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-600 font-semibold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage={`No sections configured for this class/academic cycle.`}
      />

      {/* Form Modal */}
      <ClassSectionFormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateAssignment}
        academicYears={academicYears}
        classes={classes}
        sections={sections}
        defaultAcademicYearId={selectedAcademicYear?.id}
        defaultClassId={selectedClassFilter !== 'all' ? selectedClassFilter : undefined}
      />

      {/* Delete/Unlink Modal */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Unlink Section from Class"
        message={`Are you sure you want to remove Section "${deleteTarget?.section?.name}" from "${deleteTarget?.class?.name}" for academic cycle "${deleteTarget?.academic_year?.name || selectedAcademicYear?.name}"?`}
        confirmText="Confirm Unlink"
        type="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};
