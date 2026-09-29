import React, { useState, useEffect, useRef } from 'react';
import { X, Printer, Award } from 'lucide-react';
import { StudentReportCard, AcademySettings } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';

interface StudentReportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  academicYearId: string;
  settings?: AcademySettings | null;
}

export const StudentReportCardModal: React.FC<StudentReportCardModalProps> = ({
  isOpen,
  onClose,
  studentId,
  academicYearId,
  settings,
}) => {
  const [report, setReport] = useState<StudentReportCard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !studentId) return;

    const loadReport = async () => {
      setIsLoading(true);
      try {
        const data = await databaseService.getStudentReportCard(academicYearId, studentId);
        setReport(data);
      } catch (err) {
        console.error('Failed to load report card:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadReport();
  }, [isOpen, studentId, academicYearId]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Action Bar (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/70 shrink-0 print:hidden">
          <div className="flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Student Academic Marksheet / Report Card
            </h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              type="button"
              className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Marksheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Card Content (printable) */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scroll" ref={reportRef}>
          {isLoading ? (
            <div className="py-20 text-center text-xs text-slate-400">Loading student academic record...</div>
          ) : !report ? (
            <div className="py-20 text-center text-xs text-slate-400">
              No report card data found for this student in the selected academic year.
            </div>
          ) : (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Official Academy Header */}
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-5">
                <div className="flex items-center space-x-4">
                  {settings?.logo_url ? (
                    <img
                      src={settings.logo_url}
                      alt={settings.academy_name}
                      className="w-16 h-16 rounded-xl object-contain border border-slate-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-2xl">
                      ★
                    </div>
                  )}
                  <div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
                      {settings?.academy_name || 'Star Academy'}
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      {settings?.address || 'Main Campus, Lahore, Pakistan'} • Ph: {settings?.phone || '+92 42 35870000'}
                    </p>
                    <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">
                      Official Student Performance &amp; Evaluation Marksheet
                    </p>
                  </div>
                </div>
                <div className="text-right hidden sm:block">
                  <span className="inline-block bg-slate-100 border border-slate-200 px-3 py-1 rounded-lg text-xs font-mono font-bold text-slate-700">
                    Session {report.academic_year?.name || '2026-27'}
                  </span>
                </div>
              </div>

              {/* Student Bio Grid */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Student Name</span>
                  <span className="font-bold text-slate-900 text-sm block">{report.student.student_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Admission No</span>
                  <span className="font-mono font-bold text-slate-800 block">{report.student.admission_no}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Father Name</span>
                  <span className="font-semibold text-slate-800 block">{report.student.father_name}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Roll Number</span>
                  <span className="font-mono font-bold text-slate-800 block">
                    {(report.student as any).roll_no || (report.student as any).academic_record?.roll_no || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Class &amp; Section</span>
                  <span className="font-bold text-slate-800 block">
                    {report.class?.name} {report.section ? `(${report.section.name})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Batch</span>
                  <span className="font-semibold text-slate-700 block">{report.batch?.name || 'Regular'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Gender</span>
                  <span className="font-semibold text-slate-700 block capitalize">{report.student.gender}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date of Issue</span>
                  <span className="font-mono text-slate-700 block">{new Date().toISOString().split('T')[0]}</span>
                </div>
              </div>

              {/* Subject Results Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold">
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-3">Subject / Paper</th>
                      <th className="py-2.5 px-3">Exam / Assessment</th>
                      <th className="py-2.5 px-3 w-20 text-center">Max</th>
                      <th className="py-2.5 px-3 w-20 text-center">Pass</th>
                      <th className="py-2.5 px-3 w-24 text-center font-bold">Obtained</th>
                      <th className="py-2.5 px-3 w-20 text-center">%</th>
                      <th className="py-2.5 px-3 w-16 text-center">Grade</th>
                      <th className="py-2.5 px-3 w-20 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.results.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-8 text-center text-slate-400">
                          No assessment marks evaluated yet for this student.
                        </td>
                      </tr>
                    ) : (
                      report.results.map((res, i) => (
                        <tr key={res.assessment_id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}>
                          <td className="py-2.5 px-3 text-center text-slate-400 font-mono text-[11px]">{i + 1}</td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900">
                            {res.subject_name}
                            <span className="text-[10px] font-mono text-slate-400 block">{res.subject_code}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {res.assessment_title}
                            <span className="text-[10px] text-slate-400 block">{res.test_date}</span>
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-600">{res.total_marks}</td>
                          <td className="py-2.5 px-3 text-center font-mono text-slate-500">{res.passing_marks}</td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                            {res.is_absent ? (
                              <span className="text-rose-600 font-semibold">ABS</span>
                            ) : res.obtained_marks !== null ? (
                              res.obtained_marks
                            ) : (
                              <span className="text-slate-300">-</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-semibold">
                            {res.percentage !== null ? `${res.percentage}%` : '-'}
                          </td>
                          <td className="py-2.5 px-3 text-center font-mono font-bold">
                            <span
                              className={`inline-block px-1.5 py-0.5 rounded text-[10px] ${
                                res.grade === 'A+' || res.grade === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : res.grade === 'B' || res.grade === 'C'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {res.grade}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-center">
                            {res.is_absent ? (
                              <span className="text-rose-600 font-bold text-[11px]">ABSENT</span>
                            ) : res.is_passed ? (
                              <span className="text-emerald-700 font-bold text-[11px]">PASS</span>
                            ) : (
                              <span className="text-rose-600 font-bold text-[11px]">FAIL</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {/* Totals row */}
                  {report.results.length > 0 && (
                    <tfoot>
                      <tr className="bg-slate-100/80 font-bold text-slate-900 border-t-2 border-slate-300">
                        <td colSpan={3} className="py-3 px-3.5 text-right font-extrabold uppercase text-xs">
                          Grand Total:
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-extrabold">{report.total_maximum_marks}</td>
                        <td className="py-3 px-3 text-center text-slate-400 font-mono">-</td>
                        <td className="py-3 px-3 text-center font-mono font-black text-sm text-slate-900">
                          {report.total_obtained_marks}
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-sm text-blue-700">
                          {report.overall_percentage}%
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-black text-base text-emerald-700">
                          {report.overall_grade}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded text-xs font-black tracking-wider uppercase ${
                              report.overall_result === 'PASS'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-rose-600 text-white'
                            }`}
                          >
                            {report.overall_result}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Grading Matrix & Signatures */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                  <p className="font-bold text-slate-800 text-xs mb-1">Grading Scale Reference:</p>
                  <p><span className="font-bold text-emerald-700 font-mono">A+ (80% - 100%)</span>: Outstanding Distinction</p>
                  <p><span className="font-bold text-emerald-600 font-mono">A (70% - 79%)</span>: Excellent Performance</p>
                  <p><span className="font-bold text-blue-600 font-mono">B (60% - 69%)</span>: Very Good / Above Average</p>
                  <p><span className="font-bold text-blue-500 font-mono">C (50% - 59%)</span>: Good Standing</p>
                  <p><span className="font-bold text-amber-600 font-mono">D (40% - 49%)</span>: Fair / Passing Level</p>
                  <p><span className="font-bold text-rose-600 font-mono">F (&lt; 40%)</span>: Unsatisfactory / Failed</p>
                </div>

                <div className="flex flex-col justify-end space-y-6 pt-4 sm:pt-0">
                  <div className="flex items-center justify-between px-4 text-xs font-semibold text-slate-700">
                    <div className="text-center">
                      <div className="w-28 border-b border-slate-400 mb-1"></div>
                      <span>Class Teacher</span>
                    </div>
                    <div className="text-center">
                      <div className="w-28 border-b border-slate-400 mb-1"></div>
                      <span>Academic Controller</span>
                    </div>
                    <div className="text-center">
                      <div className="w-28 border-b border-slate-400 mb-1"></div>
                      <span>Principal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
