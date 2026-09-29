import React, { useState, useEffect } from 'react';
import { X, Award, Save } from 'lucide-react';
import { Assessment } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface MarksEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment: Assessment | null;
  onSuccess: () => void;
}

interface StudentMarkInputRow {
  student_id: string;
  student_name: string;
  admission_no: string;
  roll_no?: string | null;
  father_name?: string | null;
  obtained_marks: string; // string for controlled input
  is_absent: boolean;
  remarks: string;
}

export const MarksEntryModal: React.FC<MarksEntryModalProps> = ({
  isOpen,
  onClose,
  assessment,
  onSuccess,
}) => {
  const toast = useToast();
  const [rows, setRows] = useState<StudentMarkInputRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !assessment) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [allStudents, existingMarks] = await Promise.all([
          databaseService.getStudents(assessment.academic_year_id),
          databaseService.getStudentMarks(assessment.id),
        ]);

        // Filter students for this assessment's class and optional section
        const relevantStudents = allStudents.filter(s => {
          if (!s.academic_record) return false;
          if (s.academic_record.class_id !== assessment.class_id) return false;
          if (assessment.section_id && s.academic_record.section_id !== assessment.section_id) return false;
          return true;
        });

        const initialRows: StudentMarkInputRow[] = relevantStudents.map(st => {
          const mark = existingMarks.find(m => m.student_id === st.id);
          return {
            student_id: st.id,
            student_name: st.student_name,
            admission_no: st.admission_no,
            roll_no: st.academic_record?.roll_no,
            father_name: st.father_name,
            obtained_marks: mark && mark.obtained_marks !== null && mark.obtained_marks !== undefined ? String(mark.obtained_marks) : '',
            is_absent: mark?.is_absent || false,
            remarks: mark?.remarks || '',
          };
        });

        setRows(initialRows);
      } catch (err: any) {
        toast.error('Failed to load students for marks entry');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, assessment]);

  if (!isOpen || !assessment) return null;

  const totalMarks = Number(assessment.total_marks);
  const passingMarks = Number(assessment.passing_marks);

  const calculateRowStats = (obtainedStr: string, isAbsent: boolean) => {
    if (isAbsent) return { percentage: 0, grade: 'ABS', isPass: false };
    if (!obtainedStr || isNaN(Number(obtainedStr))) return { percentage: null, grade: '-', isPass: false };
    const obt = Number(obtainedStr);
    const pct = Math.round((obt / totalMarks) * 100 * 100) / 100;
    let gr = 'F';
    if (pct >= 80) gr = 'A+';
    else if (pct >= 70) gr = 'A';
    else if (pct >= 60) gr = 'B';
    else if (pct >= 50) gr = 'C';
    else if (pct >= 40) gr = 'D';
    return { percentage: pct, grade: gr, isPass: obt >= passingMarks };
  };

  const handleMarksChange = (idx: number, val: string) => {
    const num = Number(val);
    if (val !== '' && !isNaN(num) && num > totalMarks) {
      toast.error(`Marks cannot exceed maximum marks (${totalMarks})`);
      return;
    }
    const updated = [...rows];
    updated[idx].obtained_marks = val;
    setRows(updated);
  };

  const handleAbsentToggle = (idx: number, isAbsent: boolean) => {
    const updated = [...rows];
    updated[idx].is_absent = isAbsent;
    if (isAbsent) {
      updated[idx].obtained_marks = '0';
    }
    setRows(updated);
  };

  const handleRemarksChange = (idx: number, val: string) => {
    const updated = [...rows];
    updated[idx].remarks = val;
    setRows(updated);
  };

  // Bulk shortcuts
  const fillAllFullMarks = () => {
    setRows(rows.map(r => ({ ...r, obtained_marks: String(totalMarks), is_absent: false })));
  };

  const fillAllPassingMarks = () => {
    setRows(rows.map(r => ({ ...r, obtained_marks: String(passingMarks), is_absent: false })));
  };

  const clearAllMarks = () => {
    setRows(rows.map(r => ({ ...r, obtained_marks: '', is_absent: false, remarks: '' })));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = rows.map(r => ({
        student_id: r.student_id,
        obtained_marks: r.is_absent ? 0 : r.obtained_marks !== '' ? Number(r.obtained_marks) : null,
        is_absent: r.is_absent,
        remarks: r.remarks.trim() || null,
      }));

      await databaseService.saveStudentMarksBatch(assessment.id, totalMarks, payload);
      // Mark assessment as completed/graded if all entered
      if (rows.length > 0 && rows.every(r => r.obtained_marks !== '' || r.is_absent)) {
        await databaseService.updateAssessment(assessment.id, { status: 'completed' });
      }

      toast.success(`Marks recorded successfully for ${rows.length} students!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save marks');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const enteredCount = rows.filter(r => r.obtained_marks !== '' || r.is_absent).length;
  const passedCount = rows.filter(r => {
    if (r.is_absent || !r.obtained_marks) return false;
    return Number(r.obtained_marks) >= passingMarks;
  }).length;
  const absentCount = rows.filter(r => r.is_absent).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-base">{assessment.title}</h3>
                <span className="text-[10px] font-mono font-bold bg-slate-200 text-slate-800 px-2 py-0.5 rounded uppercase">
                  {assessment.assessment_type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {assessment.class?.name} {assessment.section ? `• Sec ${assessment.section.name}` : '• All Sections'} • {assessment.subject?.name} • Total Marks: <span className="font-semibold text-slate-700 font-mono">{totalMarks}</span> (Passing: <span className="font-semibold text-slate-700 font-mono">{passingMarks}</span>)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar & Stats */}
        <div className="px-6 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1 font-semibold text-slate-600">
              <span>Total Students:</span>
              <span className="bg-slate-100 text-slate-900 px-2 py-0.5 rounded font-mono font-bold">{rows.length}</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold text-slate-600">
              <span>Entered:</span>
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-mono font-bold">{enteredCount}/{rows.length}</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold text-emerald-700">
              <span>Passed:</span>
              <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">{passedCount}</span>
            </div>
            <div className="flex items-center space-x-1 font-semibold text-rose-700">
              <span>Absent:</span>
              <span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">{absentCount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={fillAllFullMarks}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
            >
              Fill Full Marks
            </button>
            <button
              type="button"
              onClick={fillAllPassingMarks}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg transition"
            >
              Fill Passing
            </button>
            <button
              type="button"
              onClick={clearAllMarks}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-2.5 py-1.5 rounded-lg transition"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Students Marks Sheet Table */}
        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {isLoading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading student roster...</div>
          ) : rows.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No students enrolled in this class and section.
            </div>
          ) : (
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-3.5 w-12 text-center">#</th>
                    <th className="py-3 px-3.5">Student Details</th>
                    <th className="py-3 px-3.5 w-32 text-center">Absent?</th>
                    <th className="py-3 px-3.5 w-36">Obtained Marks (/{totalMarks})</th>
                    <th className="py-3 px-3.5 w-24 text-center">Percentage</th>
                    <th className="py-3 px-3.5 w-20 text-center">Grade</th>
                    <th className="py-3 px-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((row, idx) => {
                    const stats = calculateRowStats(row.obtained_marks, row.is_absent);
                    return (
                      <tr key={row.student_id} className={`hover:bg-slate-50/60 transition ${row.is_absent ? 'bg-rose-50/20' : ''}`}>
                        <td className="py-2.5 px-3.5 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <p className="font-bold text-slate-900">{row.student_name}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {row.admission_no} {row.father_name ? `• S/O ${row.father_name}` : ''}
                          </p>
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          <label className="inline-flex items-center space-x-1.5 cursor-pointer text-slate-600">
                            <input
                              type="checkbox"
                              checked={row.is_absent}
                              onChange={e => handleAbsentToggle(idx, e.target.checked)}
                              className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                            />
                            <span className="text-[11px] font-semibold">Absent</span>
                          </label>
                        </td>
                        <td className="py-2.5 px-3.5">
                          <input
                            type="number"
                            step="0.5"
                            min="0"
                            max={totalMarks}
                            disabled={row.is_absent}
                            placeholder="Marks"
                            value={row.obtained_marks}
                            onChange={e => handleMarksChange(idx, e.target.value)}
                            className={`w-28 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-slate-900/10 ${
                              row.is_absent
                                ? 'bg-slate-100 text-slate-400 border-slate-200'
                                : stats.percentage !== null && stats.isPass
                                ? 'border-emerald-300 bg-emerald-50/30 text-emerald-900'
                                : stats.percentage !== null && !stats.isPass
                                ? 'border-rose-300 bg-rose-50/30 text-rose-900'
                                : 'border-slate-200 text-slate-900'
                            }`}
                          />
                        </td>
                        <td className="py-2.5 px-3.5 text-center font-mono font-bold text-[11px]">
                          {stats.percentage !== null ? (
                            <span className={stats.isPass ? 'text-emerald-700' : 'text-rose-600'}>
                              {stats.percentage}%
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5 text-center">
                          {stats.grade !== '-' ? (
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                stats.grade === 'ABS'
                                  ? 'bg-rose-100 text-rose-800'
                                  : stats.grade === 'A+' || stats.grade === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : stats.grade === 'B' || stats.grade === 'C'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {stats.grade}
                            </span>
                          ) : (
                            <span className="text-slate-300">-</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3.5">
                          <input
                            type="text"
                            placeholder="Optional remarks..."
                            value={row.remarks}
                            onChange={e => handleRemarksChange(idx, e.target.value)}
                            className="w-full text-[11px] px-2.5 py-1.5 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Grades and percentages are computed instantly using the Star Academy grading matrix.
          </p>
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || rows.length === 0}
              className="flex items-center space-x-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving Marks...' : 'Save All Marks'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
