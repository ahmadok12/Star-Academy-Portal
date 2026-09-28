import React, { useState, useEffect, useCallback } from 'react';
import {
  UserPlus,
  Eye,
  Filter,
  GraduationCap,
  ArrowRightLeft,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  Sparkles,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchInput } from '../../components/common/SearchInput';
import { StatusBadge } from '../../components/common/StatusBadge';
import { FormDialog } from '../../components/common/FormDialog';
import { ManageEnrollmentModal } from './ManageEnrollmentModal';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  StudentWithEnrollment,
  ClassItem,
  SectionItem,
  BatchItem,
  SubjectItem
} from '../../types/database.types';

interface StudentsDirectoryPageProps {
  onOpenAdmission: () => void;
  onOpenPromotion: () => void;
}

export const StudentsDirectoryPage: React.FC<StudentsDirectoryPageProps> = ({
  onOpenAdmission,
  onOpenPromotion,
}) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('all');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [batchFilter, setBatchFilter] = useState('all');
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Selected student for Profile modal
  const [viewStudent, setViewStudent] = useState<StudentWithEnrollment | null>(null);
  // Selected student for Quick Batch/Enrollment edit modal
  const [manageStudent, setManageStudent] = useState<StudentWithEnrollment | null>(null);

  const loadData = useCallback(async () => {
    if (!selectedAcademicYear) return;
    try {
      setIsLoading(true);
      const [sList, cList, secList, bList, subList] = await Promise.all([
        databaseService.getStudents(
          selectedAcademicYear.id,
          classFilter,
          sectionFilter,
          search,
          batchFilter,
          enrollmentTypeFilter
        ),
        databaseService.getClasses(),
        databaseService.getSections(),
        databaseService.getBatches(),
        databaseService.getSubjects(),
      ]);
      setStudents(sList);
      setClasses(cList);
      setSections(secList);
      setBatches(bList);
      setSubjects(subList);
    } catch (e: any) {
      toast.error('Failed to load students', e.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYear, classFilter, sectionFilter, search, batchFilter, enrollmentTypeFilter, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenProfile = async (s: StudentWithEnrollment) => {
    try {
      const full = await databaseService.getStudentById(s.id);
      setViewStudent(full || s);
    } catch {
      setViewStudent(s);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    return matchesStatus;
  });

  const getBatchBadge = (batch?: BatchItem) => {
    if (!batch) {
      return (
        <span className="text-[10px] font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full border border-slate-200">
          Unassigned
        </span>
      );
    }
    switch (batch.code) {
      case 'ADV':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-lg border border-purple-200">
            <Sparkles className="w-3 h-3 text-purple-600" />
            <span>{batch.name}</span>
          </span>
        );
      case 'ICU':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-lg border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
            <span>{batch.name}</span>
          </span>
        );
      case 'REG':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-lg border border-blue-200">
            <span>{batch.name}</span>
          </span>
        );
    }
  };

  const columns: Column<StudentWithEnrollment>[] = [
    {
      header: 'Admission #',
      accessorKey: 'admission_no',
      cell: (row) => (
        <div>
          <span className="font-mono text-xs font-bold text-slate-900 block">
            {row.admission_no}
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            Roll: {row.currentEnrollment?.roll_no || '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Student Name',
      cell: (row) => (
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 overflow-hidden">
            {row.photo_url ? (
              <img src={row.photo_url} alt="" className="w-full h-full object-cover" />
            ) : (
              row.student_name.charAt(0)
            )}
          </div>
          <div>
            <span className="font-bold text-slate-900 block">{row.student_name}</span>
            <span className="text-[11px] text-slate-500">Father: {row.father_name}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Class & Section',
      cell: (row) => (
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {row.currentEnrollment?.class?.name || 'Unassigned'}
          </span>
          {row.currentEnrollment?.section && (
            <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200">
              Sec {row.currentEnrollment.section.name}
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Batch',
      cell: (row) => getBatchBadge(row.currentEnrollment?.batch),
    },
    {
      header: 'Category',
      cell: (row) => {
        const isSupple = row.currentEnrollment?.enrollment_type === 'supplementary';
        if (isSupple) {
          const subs = row.currentEnrollment?.supplementary_subjects || [];
          return (
            <div>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200">
                <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                <span>Supplementary</span>
              </span>
              {subs.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {subs.map(s => (
                    <span key={s.id} className="text-[9px] font-semibold bg-amber-100/70 text-amber-900 px-1.5 py-0.2 rounded font-mono">
                      {s.code}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
            Regular
          </span>
        );
      },
    },
    {
      header: 'Contact',
      cell: (row) => (
        <div className="flex items-center space-x-1 text-slate-600 font-mono text-xs">
          <Phone className="w-3 h-3 text-slate-400" />
          <span>{row.phone}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      cell: (row) => <StatusBadge status={row.status === 'active' ? 'active' : 'inactive'} />,
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end space-x-1.5">
          <button
            onClick={() => setManageStudent(row)}
            title="Manage Batch Placement & Supplementary Category"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
            type="button"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-500" />
            <span>Placement</span>
          </button>
          <button
            onClick={() => handleOpenProfile(row)}
            title="View Full Student Profile & Academic History"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-2xs transition"
            type="button"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Profile</span>
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
          { label: 'Students' },
          { label: 'Directory' },
        ]}
        title="Student Directory &amp; Records"
        subtitle="Manage student master identity, academic year placements, and view continuous academic history."
        action={
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPromotion}
              className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-2xs transition"
              type="button"
            >
              <ArrowRightLeft className="w-3.5 h-3.5 text-slate-500" />
              <span>Enroll / Promote</span>
            </button>
            <button
              onClick={onOpenAdmission}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              type="button"
            >
              <UserPlus className="w-4 h-4" />
              <span>New Admission</span>
            </button>
          </div>
        }
      />

      {/* Scope Ribbon */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-900">Enrolled In Cycle:</span>
              <span className="text-xs font-black text-slate-900 font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                {selectedAcademicYear?.name || 'All'}
              </span>
              {selectedAcademicYear?.is_current && (
                <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold border border-emerald-200/60">
                  Current Year
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Active student view is strictly governed by enrollment in the selected cycle.
            </p>
          </div>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Total Enrolled: <strong className="text-slate-900">{students.length} students</strong>
        </span>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/60">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by student, father, admission #, phone..."
          className="w-full sm:w-80"
        />

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center space-x-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Sections</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>Section {s.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Batches</option>
              {batches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <select
              value={enrollmentTypeFilter}
              onChange={(e) => setEnrollmentTypeFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Categories</option>
              <option value="regular">Regular Only</option>
              <option value="supplementary">Supplementary Only</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-slate-800 font-medium focus:ring-slate-900"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        keyExtractor={(row) => row.id}
        isLoading={isLoading}
        emptyMessage="No students found enrolled in this cycle matching filters."
      />

      {/* Manage Placement & Supplementary Modal */}
      <ManageEnrollmentModal
        isOpen={!!manageStudent}
        onClose={() => setManageStudent(null)}
        student={manageStudent}
        batches={batches}
        subjects={subjects}
        onEnrollmentUpdated={loadData}
      />

      {/* Student Profile Dialog with Academic History Timeline */}
      <FormDialog
        isOpen={!!viewStudent}
        onClose={() => setViewStudent(null)}
        title={viewStudent?.student_name || 'Student Profile'}
        subtitle={`Admission #${viewStudent?.admission_no} • Permanent Identity & Enrollment History`}
        icon={UserCheck}
        badge={viewStudent?.status}
        maxWidth="xl"
        footer={
          <button
            type="button"
            onClick={() => setViewStudent(null)}
            className="px-5 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
          >
            Close Profile
          </button>
        }
      >
        {viewStudent && (
          <div className="space-y-6">
            {/* Header Identity Card */}
            <div className="flex items-start space-x-4 p-4 bg-slate-50/70 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center font-bold text-xl text-slate-700 overflow-hidden shrink-0">
                {viewStudent.photo_url ? (
                  <img src={viewStudent.photo_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  viewStudent.student_name.charAt(0)
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900">{viewStudent.student_name}</h3>
                  <span className="text-xs font-mono font-bold bg-slate-200 px-2 py-0.5 rounded text-slate-800">
                    {viewStudent.admission_no}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Father: <strong className="text-slate-800">{viewStudent.father_name}</strong> | Gender: {viewStudent.gender} | Blood: {viewStudent.blood_group || 'N/A'}
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                  <span className="flex items-center gap-1 font-mono">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {viewStudent.phone}
                  </span>
                  {viewStudent.address && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {viewStudent.address}
                    </span>
                  )}
                </div>

                {/* Batch & Category Highlights */}
                <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-200/60">
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400 font-semibold text-[11px]">Batch:</span>
                    {getBatchBadge(viewStudent.currentEnrollment?.batch)}
                  </div>

                  <div className="flex items-center gap-1 text-xs ml-2">
                    <span className="text-slate-400 font-semibold text-[11px]">Category:</span>
                    {viewStudent.currentEnrollment?.enrollment_type === 'supplementary' ? (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-lg border border-amber-300">
                        ⚡ Supplementary Student
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">
                        Regular Student
                      </span>
                    )}
                  </div>
                </div>

                {/* Supplementary Subjects Details in Profile */}
                {viewStudent.currentEnrollment?.enrollment_type === 'supplementary' && (
                  <div className="mt-3 p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1 text-xs text-amber-950">
                    <div className="font-bold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                      <span>Supplementary Retake Subjects (Previous Academic Cycle):</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(viewStudent.currentEnrollment?.supplementary_subjects || []).map(s => (
                        <span key={s.id} className="bg-amber-600 text-white font-bold text-[11px] px-2 py-0.5 rounded-md">
                          {s.name} ({s.code})
                        </span>
                      ))}
                    </div>
                    {viewStudent.currentEnrollment?.supplementary_notes && (
                      <p className="text-[11px] text-amber-800 mt-1 italic">
                        Exam Note: {viewStudent.currentEnrollment.supplementary_notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Academic History Timeline (Preserves Historical Data) */}
            <div>
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                  Continuous Academic Enrollment History
                </h4>
              </div>

              <div className="space-y-2.5">
                {(viewStudent.allEnrollments || [viewStudent.currentEnrollment]).map((rec, idx) => (
                  <div
                    key={rec?.id || idx}
                    className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center font-mono font-bold text-xs text-slate-700">
                        {idx + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900">
                            Academic Year {rec?.academic_year?.name || 'Cycle'}
                          </span>
                          <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">
                            Enrolled: {rec?.enrollment_date}
                          </span>
                          {rec?.batch && (
                            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                              {rec.batch.name}
                            </span>
                          )}
                          {rec?.enrollment_type === 'supplementary' && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded border border-amber-200">
                              Supple
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5">
                          Class: <strong>{rec?.class?.name}</strong> • Section: <strong>{rec?.section?.name}</strong> • Roll #: <strong>{rec?.roll_no || '—'}</strong>
                        </p>
                      </div>
                    </div>

                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      rec?.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : rec?.status === 'promoted'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      ● {rec?.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </FormDialog>
    </div>
  );
};
