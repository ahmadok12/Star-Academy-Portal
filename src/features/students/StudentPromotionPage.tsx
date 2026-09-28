import React, { useState, useEffect } from 'react';
import {
  ArrowRightLeft,
  ArrowLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';
import {
  ClassItem,
  ClassSection,
  StudentWithEnrollment
} from '../../types/database.types';

interface StudentPromotionPageProps {
  onBack: () => void;
  onPromotionSuccess: () => void;
}

export const StudentPromotionPage: React.FC<StudentPromotionPageProps> = ({
  onBack,
  onPromotionSuccess,
}) => {
  const { academicYears, currentAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sourceYearId, setSourceYearId] = useState('');
  const [sourceClassId, setSourceClassId] = useState('');
  const [sourceStudents, setSourceStudents] = useState<StudentWithEnrollment[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());

  // Target Configuration
  const [targetYearId, setTargetYearId] = useState('');
  const [targetClassId, setTargetClassId] = useState('');
  const [targetSectionId, setTargetSectionId] = useState('');
  const [targetClassSections, setTargetClassSections] = useState<ClassSection[]>([]);

  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);

  // Initialize Source & Target Years
  useEffect(() => {
    const init = async () => {
      const cList = await databaseService.getClasses();
      const activeClasses = cList.filter(c => c.status === 'active');
      setClasses(activeClasses);

      if (academicYears.length > 1) {
        // Pick previous year as source if available, or first
        const prev = academicYears.find(y => !y.is_current) || academicYears[1];
        setSourceYearId(prev?.id || academicYears[0]?.id || '');
        setTargetYearId(currentAcademicYear?.id || academicYears[0]?.id || '');
      } else if (academicYears[0]) {
        setSourceYearId(academicYears[0].id);
        setTargetYearId(academicYears[0].id);
      }

      if (activeClasses[0]) {
        setSourceClassId(activeClasses[0].id);
        setTargetClassId(activeClasses[1]?.id || activeClasses[0].id);
      }
    };
    init();
  }, [academicYears, currentAcademicYear]);

  // Load Source Students whenever Source Year or Source Class changes
  useEffect(() => {
    const fetchSourceStudents = async () => {
      if (!sourceYearId || !sourceClassId) return;
      try {
        setIsLoadingStudents(true);
        const list = await databaseService.getStudents(sourceYearId, sourceClassId);
        setSourceStudents(list);
        // Default: select all students
        setSelectedStudentIds(new Set(list.map(s => s.id)));
      } catch (e: any) {
        toast.error('Failed to load source students', e.message);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchSourceStudents();
  }, [sourceYearId, sourceClassId, toast]);

  // Load Target Sections whenever Target Year or Target Class changes
  useEffect(() => {
    const fetchTargetSections = async () => {
      if (!targetYearId || !targetClassId) return;
      try {
        const csList = await databaseService.getClassSections(targetYearId, targetClassId);
        const activeCS = csList.filter(cs => cs.status === 'active');
        setTargetClassSections(activeCS);
        if (activeCS.length > 0) {
          setTargetSectionId(activeCS[0].section_id);
        } else {
          setTargetSectionId('');
        }
      } catch (e) {
        console.error('Error fetching target sections:', e);
      }
    };

    fetchTargetSections();
  }, [targetYearId, targetClassId]);

  const handleToggleStudent = (id: string) => {
    const next = new Set(selectedStudentIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedStudentIds(next);
  };

  const handleToggleAll = () => {
    if (selectedStudentIds.size === sourceStudents.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(sourceStudents.map(s => s.id)));
    }
  };

  const handleExecutePromotion = async () => {
    if (selectedStudentIds.size === 0) {
      toast.error('No Students Selected', 'Please check at least one student to promote.');
      return;
    }
    if (!targetYearId || !targetClassId || !targetSectionId) {
      toast.error('Missing Target Configuration', 'Please select a Target Year, Class, and Section.');
      return;
    }

    try {
      setIsPromoting(true);
      const res = await databaseService.promoteOrEnrollStudents({
        sourceAcademicYearId: sourceYearId,
        targetAcademicYearId: targetYearId,
        targetClassId,
        targetSectionId,
        studentIds: Array.from(selectedStudentIds),
      });

      toast.success(
        'Promotion Completed!',
        `Successfully enrolled/promoted ${res.promotedCount} students into the target academic cycle.`
      );
      onPromotionSuccess();
    } catch (err: any) {
      toast.error('Promotion Failed', err.message);
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition"
          type="button"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Students Directory</span>
        </button>
      </div>

      <PageHeader
        breadcrumbs={[
          { label: 'Admin ERP' },
          { label: 'Students' },
          { label: 'Enrollment & Promotion' },
        ]}
        title="Student Annual Promotion &amp; Re-enrollment"
        subtitle="Batch promote students into the next academic year. Creates fresh academic enrollment records without modifying historical records."
      />

      {/* Promotion Mapping Configuration Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Source Configuration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-xs">
              FROM
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Source Academic Year &amp; Class
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Year
              </label>
              <select
                value={sourceYearId}
                onChange={(e) => setSourceYearId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-slate-900"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.is_current ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source Class
              </label>
              <select
                value={sourceClassId}
                onChange={(e) => setSourceClassId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-slate-900"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Target Configuration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
              TO
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Target Academic Year &amp; Class
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Year
              </label>
              <select
                value={targetYearId}
                onChange={(e) => setTargetYearId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-slate-900"
              >
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.name} {y.is_current ? '(Current)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Promoted Class
              </label>
              <select
                value={targetClassId}
                onChange={(e) => setTargetClassId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-slate-900"
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Section
              </label>
              <select
                value={targetSectionId}
                onChange={(e) => setTargetSectionId(e.target.value)}
                className="w-full text-xs font-medium bg-slate-50/70 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:ring-slate-900"
              >
                {targetClassSections.length === 0 ? (
                  <option value="">No sections active</option>
                ) : (
                  targetClassSections.map((cs) => (
                    <option key={cs.section_id} value={cs.section_id}>
                      Section {cs.section?.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Student Selection List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleToggleAll}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 flex items-center gap-1.5"
              type="button"
            >
              {selectedStudentIds.size === sourceStudents.length && sourceStudents.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-slate-900" />
              ) : (
                <Square className="w-4 h-4 text-slate-400" />
              )}
              <span>
                {selectedStudentIds.size === sourceStudents.length ? 'Deselect All' : 'Select All'}
              </span>
            </button>
            <span className="text-xs text-slate-400">
              ({selectedStudentIds.size} of {sourceStudents.length} selected)
            </span>
          </div>

          <button
            onClick={handleExecutePromotion}
            disabled={isPromoting || selectedStudentIds.size === 0 || !targetSectionId}
            className="flex items-center gap-2 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-50"
            type="button"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isPromoting ? 'Promoting...' : `Promote ${selectedStudentIds.size} Students`}</span>
          </button>
        </div>

        {isLoadingStudents ? (
          <div className="p-10 text-center text-xs text-slate-400">Loading source students...</div>
        ) : sourceStudents.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            No students found enrolled in the selected source class and academic cycle.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto custom-scroll">
            {sourceStudents.map((s) => {
              const isChecked = selectedStudentIds.has(s.id);
              return (
                <div
                  key={s.id}
                  onClick={() => handleToggleStudent(s.id)}
                  className={`p-3.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition ${
                    isChecked ? 'bg-slate-50/80' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 rounded text-slate-900 focus:ring-slate-800 border-slate-300 pointer-events-none"
                    />
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        {s.student_name}
                      </span>
                      <span className="text-[10px] text-slate-500">
                        Father: {s.father_name} • Roll: {s.currentEnrollment?.roll_no || '—'}
                      </span>
                    </div>
                  </div>

                  <span className="font-mono text-xs text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {s.admission_no}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
