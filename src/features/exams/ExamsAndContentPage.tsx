import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Award,
  Calendar,
  BookOpen,
  FileText,
  Plus,
  Search,
  Printer,
  ExternalLink,
  Edit2,
  Trash2,
  Check
} from 'lucide-react';
import {
  Assessment,
  SchemeOfStudy,
  SubjectContent,
  ClassItem,
  SectionItem,
  SubjectItem,
  StudentWithEnrollment,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { PageHeader } from '../../components/common/PageHeader';
import { ConfirmationDialog } from '../../components/common/ConfirmationDialog';
import { AssessmentFormModal } from './AssessmentFormModal';
import { MarksEntryModal } from './MarksEntryModal';
import { SchemeOfStudyFormModal } from './SchemeOfStudyFormModal';
import { SubjectContentFormModal } from './SubjectContentFormModal';
import { StudentReportCardModal } from './StudentReportCardModal';

type ActiveTab = 'assessments' | 'datesheet' | 'marksheets' | 'sos' | 'content';

interface ExamsAndContentPageProps {
  settings?: AcademySettings | null;
}

export const ExamsAndContentPage: React.FC<ExamsAndContentPageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<ActiveTab>('assessments');
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [sections, setSections] = useState<SectionItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [students, setStudents] = useState<StudentWithEnrollment[]>([]);

  // Selected filters
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Data states
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [schemeOfStudies, setSchemeOfStudies] = useState<SchemeOfStudy[]>([]);
  const [subjectContents, setSubjectContents] = useState<SubjectContent[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [assessmentToEdit, setAssessmentToEdit] = useState<Assessment | null>(null);

  const [isMarksModalOpen, setIsMarksModalOpen] = useState(false);
  const [assessmentForMarks, setAssessmentForMarks] = useState<Assessment | null>(null);

  const [isSOSModalOpen, setIsSOSModalOpen] = useState(false);
  const [sosToEdit, setSosToEdit] = useState<SchemeOfStudy | null>(null);

  const [isContentModalOpen, setIsContentModalOpen] = useState(false);
  const [contentToEdit, setContentToEdit] = useState<SubjectContent | null>(null);

  const [isReportCardOpen, setIsReportCardOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // Deletion confirm
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    type: 'assessment' | 'sos' | 'content';
    id: string;
    title: string;
  }>({ isOpen: false, type: 'assessment', id: '', title: '' });

  // Initial load
  useEffect(() => {
    const loadPrerequisites = async () => {
      try {
        const [cls, sec, sub] = await Promise.all([
          databaseService.getClasses(),
          databaseService.getSections(),
          databaseService.getSubjects(),
        ]);
        setClasses(cls.filter(c => c.status === 'active'));
        setSections(sec.filter(s => s.status === 'active'));
        setSubjects(sub.filter(s => s.status === 'active'));

        if (cls.length > 0 && !selectedClassId) {
          setSelectedClassId(cls[1]?.id || cls[0].id); // default to Class 9 or first
        }
      } catch (err) {
        console.error('Failed to load prerequisites:', err);
      }
    };
    loadPrerequisites();
  }, []);

  // Fetch module data
  const fetchData = async () => {
    if (!selectedAcademicYear) return;
    setIsLoading(true);
    try {
      const [assList, sosList, cntList, stdList] = await Promise.all([
        databaseService.getAssessments(selectedAcademicYear.id),
        databaseService.getSchemeOfStudies(selectedAcademicYear.id),
        databaseService.getSubjectContents(selectedAcademicYear.id),
        databaseService.getStudents(selectedAcademicYear.id),
      ]);
      setAssessments(assList);
      setSchemeOfStudies(sosList);
      setSubjectContents(cntList);
      setStudents(stdList);
    } catch (err) {
      console.error('Failed to fetch exams and content data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedAcademicYear]);

  // Handle deletions
  const handleExecuteDelete = async () => {
    try {
      if (deleteConfirm.type === 'assessment') {
        await databaseService.deleteAssessment(deleteConfirm.id);
        toast.success('Assessment deleted successfully');
      } else if (deleteConfirm.type === 'sos') {
        await databaseService.deleteSchemeOfStudy(deleteConfirm.id);
        toast.success('Scheme of Study unit deleted');
      } else if (deleteConfirm.type === 'content') {
        await databaseService.deleteSubjectContent(deleteConfirm.id);
        toast.success('Study material removed');
      }
      setDeleteConfirm({ isOpen: false, type: 'assessment', id: '', title: '' });
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Deletion failed');
    }
  };

  // Filtered views
  const filteredAssessments = assessments.filter(a => {
    if (selectedClassId && a.class_id !== selectedClassId) return false;
    if (selectedSectionId && a.section_id && a.section_id !== selectedSectionId) return false;
    if (selectedSubjectId && a.subject_id !== selectedSubjectId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        a.title.toLowerCase().includes(term) ||
        a.subject?.name.toLowerCase().includes(term) ||
        a.room_number?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredSOS = schemeOfStudies.filter(s => {
    if (selectedClassId && s.class_id !== selectedClassId) return false;
    if (selectedSubjectId && s.subject_id !== selectedSubjectId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        s.chapter_title.toLowerCase().includes(term) ||
        s.topics_covered.toLowerCase().includes(term) ||
        s.month_name.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredContents = subjectContents.filter(c => {
    if (selectedClassId && c.class_id !== selectedClassId) return false;
    if (selectedSubjectId && c.subject_id !== selectedSubjectId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        c.title.toLowerCase().includes(term) ||
        c.chapter_ref?.toLowerCase().includes(term) ||
        c.description?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const filteredStudents = students.filter(st => {
    if (selectedClassId && st.academic_record?.class_id !== selectedClassId) return false;
    if (selectedSectionId && st.academic_record?.section_id !== selectedSectionId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        st.student_name.toLowerCase().includes(term) ||
        st.admission_no.toLowerCase().includes(term) ||
        st.father_name.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // Datesheet helper
  const datesheetItems = filteredAssessments.sort(
    (a, b) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <PageHeader
        title="Exams, Content & Marksheets"
        subtitle="Manage academic assessments, examination datesheets, student marksheets, Scheme of Study (SOS), and digital curriculum resources."
        action={
          <div className="flex items-center space-x-2">
            {activeTab === 'assessments' && (
              <button
                type="button"
                onClick={() => {
                  setAssessmentToEdit(null);
                  setIsAssessmentModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule Assessment</span>
              </button>
            )}
            {activeTab === 'sos' && (
              <button
                type="button"
                onClick={() => {
                  setSosToEdit(null);
                  setIsSOSModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add SOS Unit</span>
              </button>
            )}
            {activeTab === 'content' && (
              <button
                type="button"
                onClick={() => {
                  setContentToEdit(null);
                  setIsContentModalOpen(true);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Upload Material</span>
              </button>
            )}
            {activeTab === 'datesheet' && (
              <button
                type="button"
                onClick={() => window.print()}
                className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Datesheet</span>
              </button>
            )}
          </div>
        }
      />

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto custom-scroll pb-1">
        {[
          { id: 'assessments', label: 'Assessments & Tests', icon: Award, count: assessments.length },
          { id: 'datesheet', label: 'Exam Datesheet', icon: Calendar, count: datesheetItems.length },
          { id: 'marksheets', label: 'Student Marksheets & Cards', icon: FileSpreadsheet, count: students.length },
          { id: 'sos', label: 'Scheme of Study (SOS)', icon: BookOpen, count: schemeOfStudies.length },
          { id: 'content', label: 'Subject Study Materials', icon: FileText, count: subjectContents.length },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as ActiveTab)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                isActive
                  ? 'border-slate-900 text-slate-900 bg-white shadow-2xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[300px]">
          {/* Class Filter */}
          <div className="min-w-[140px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Class</label>
            <select
              value={selectedClassId}
              onChange={e => setSelectedClassId(e.target.value)}
              className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50"
            >
              <option value="">All Classes</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Section Filter (Only for relevant tabs) */}
          {(activeTab === 'assessments' || activeTab === 'marksheets' || activeTab === 'datesheet') && (
            <div className="min-w-[130px]">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Section</label>
              <select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50"
              >
                <option value="">All Sections</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Subject Filter */}
          {activeTab !== 'marksheets' && (
            <div className="min-w-[150px]">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject</label>
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="w-full text-xs font-semibold rounded-xl border border-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-slate-900 bg-slate-50"
              >
                <option value="">All Subjects</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                ))}
              </select>
            </div>
          )}

          {/* Search Box */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Search</label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={
                  activeTab === 'marksheets'
                    ? 'Search student name or admission...'
                    : activeTab === 'sos'
                    ? 'Search chapter, topics, month...'
                    : 'Search test title, subject, room...'
                }
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedClassId || selectedSectionId || selectedSubjectId || searchTerm) && (
          <div className="self-end pb-0.5">
            <button
              onClick={() => {
                setSelectedClassId('');
                setSelectedSectionId('');
                setSelectedSubjectId('');
                setSearchTerm('');
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-6 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
          <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-xs font-semibold text-slate-500">Loading academic data...</span>
        </div>
      )}

      {/* TAB 1: ASSESSMENTS & TESTS */}
      {!isLoading && activeTab === 'assessments' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Total Scheduled</span>
              <span className="text-2xl font-black text-slate-900 mt-1 block font-mono">
                {filteredAssessments.filter(a => a.status === 'scheduled').length}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Exams upcoming on calendar</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Graded / Completed</span>
              <span className="text-2xl font-black text-emerald-800 mt-1 block font-mono">
                {filteredAssessments.filter(a => a.status === 'completed').length}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Marks evaluated and finalized</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Total Papers</span>
              <span className="text-2xl font-black text-blue-900 mt-1 block font-mono">
                {filteredAssessments.length}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">Across enrolled subjects</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Exam / Test Title</th>
                    <th className="py-3 px-4">Class &amp; Section</th>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Exam Date &amp; Time</th>
                    <th className="py-3 px-4 text-center">Marks (Max / Pass)</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No assessments found matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map(assessment => (
                      <tr key={assessment.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {assessment.title}
                          <div className="flex items-center space-x-1.5 mt-0.5">
                            <span className="text-[10px] uppercase font-mono font-bold bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded">
                              {assessment.assessment_type.replace('_', ' ')}
                            </span>
                            {assessment.room_number && (
                              <span className="text-[10px] text-slate-400">
                                • Room: {assessment.room_number}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          <span className="font-semibold block">{assessment.class?.name}</span>
                          <span className="text-[11px] text-slate-400">
                            {assessment.section ? `Section: ${assessment.section.name}` : 'All Sections'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-slate-800">
                          {assessment.subject?.name}
                          <span className="text-[10px] font-mono text-slate-400 block">{assessment.subject?.code}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-mono">
                          <span className="font-bold block">{assessment.test_date}</span>
                          <span className="text-[11px] text-slate-400">
                            {assessment.start_time?.slice(0, 5) || '09:00'} - {assessment.end_time?.slice(0, 5) || '10:30'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className="font-bold text-slate-900">{assessment.total_marks}</span>
                          <span className="text-slate-400 text-[11px]"> / {assessment.passing_marks}</span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              assessment.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                : assessment.status === 'scheduled'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-200'
                            }`}
                          >
                            {assessment.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setAssessmentForMarks(assessment);
                                setIsMarksModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1"
                            >
                              <Award className="w-3.5 h-3.5 text-amber-400" />
                              <span>Enter Marks</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setAssessmentToEdit(assessment);
                                setIsAssessmentModalOpen(true);
                              }}
                              title="Edit Assessment"
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setDeleteConfirm({
                                  isOpen: true,
                                  type: 'assessment',
                                  id: assessment.id,
                                  title: assessment.title,
                                });
                              }}
                              title="Delete Assessment"
                              className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DATESHEET */}
      {activeTab === 'datesheet' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Official Examination Schedule</span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                Datesheet — {classes.find(c => c.id === selectedClassId)?.name || 'All Classes'} ({selectedAcademicYear?.name || '2026-27'})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Star Academy centralized exam schedules and paper distribution timings.
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition flex items-center space-x-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Sheet</span>
              </button>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 w-36">Exam Date</th>
                  <th className="py-3 px-4 w-28">Timing</th>
                  <th className="py-3 px-4">Subject &amp; Code</th>
                  <th className="py-3 px-4">Class &amp; Section</th>
                  <th className="py-3 px-4 text-center">Max Marks</th>
                  <th className="py-3 px-4">Hall / Room</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {datesheetItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No examinations scheduled for this class.
                    </td>
                  </tr>
                ) : (
                  datesheetItems.map((item, index) => {
                    const d = new Date(item.test_date);
                    const dayName = d.toLocaleDateString('en-US', { weekday: 'long' });
                    return (
                      <tr key={item.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{index + 1}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block font-mono">{item.test_date}</span>
                          <span className="text-[11px] text-slate-500 font-semibold">{dayName}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                          {item.start_time?.slice(0, 5) || '09:00'} - {item.end_time?.slice(0, 5) || '10:30'}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {item.subject?.name}
                          <span className="text-[10px] font-mono text-slate-400 block">{item.subject?.code}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold">
                          {item.class?.name} {item.section ? `• ${item.section.name}` : ''}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                          {item.total_marks}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {item.room_number || 'Main Examination Hall'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT MARKSHEETS & REPORT CARDS */}
      {activeTab === 'marksheets' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base">Student Marksheets &amp; Individual Report Cards</h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                Automatically consolidated grade sheets from all scheduled term exams and monthly assessments.
                Generate official printable report cards with ranks, percentages, and teacher remarks.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-300 block">Enrolled in Selected Filter:</span>
              <span className="text-2xl font-black font-mono text-white">{filteredStudents.length} Students</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4 w-12 text-center">#</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Father Name</th>
                    <th className="py-3 px-4">Class &amp; Section</th>
                    <th className="py-3 px-4">Batch</th>
                    <th className="py-3 px-4 text-right">Official Marksheet</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        No students found matching current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 text-center text-slate-400 font-mono">{idx + 1}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {student.admission_no}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {student.student_name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {student.father_name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {student.academic_record?.class?.name} {student.academic_record?.section ? `(${student.academic_record.section.name})` : ''}
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-[11px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {student.academic_record?.batch?.name || 'Regular'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setIsReportCardOpen(true);
                            }}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold transition shadow-2xs"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                            <span>View Report Card</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEME OF STUDY (SOS) */}
      {activeTab === 'sos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Scheme of Study (SOS) Curriculum Matrix</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Month-by-month syllabus breakdown for academic session {selectedAcademicYear?.name || '2026-27'}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSosToEdit(null);
                setIsSOSModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add SOS Unit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSOS.length === 0 ? (
              <div className="col-span-2 py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No Scheme of Study units found for the selected subject and class.
              </div>
            ) : (
              filteredSOS.map(sos => (
                <div
                  key={sos.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold bg-slate-900 text-white px-2.5 py-1 rounded-lg">
                          {sos.month_name}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          Unit #{sos.order_index}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            sos.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : sos.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {sos.status.replace('_', ' ')}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSosToEdit(sos);
                            setIsSOSModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 transition rounded"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              type: 'sos',
                              id: sos.id,
                              title: `${sos.month_name} - ${sos.chapter_title}`,
                            });
                          }}
                          className="p-1 text-rose-400 hover:text-rose-700 transition rounded"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm">{sos.chapter_title}</h4>
                      <p className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        {sos.class?.name} • {sos.subject?.name}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-700 space-y-1">
                      <p className="font-bold text-[10px] uppercase text-slate-400">Topics &amp; Exercises:</p>
                      <p className="leading-relaxed">{sos.topics_covered}</p>
                    </div>

                    {sos.learning_objectives && (
                      <div className="text-xs text-slate-600">
                        <span className="font-bold text-[10px] uppercase text-slate-400 block">Outcomes:</span>
                        <p className="text-[11px] text-slate-500 italic mt-0.5">{sos.learning_objectives}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 5: SUBJECT CONTENT / STUDY MATERIALS */}
      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Subject Study Materials &amp; Resources</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Digital curriculum repository for student handouts, past papers, and syllabi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setContentToEdit(null);
                setIsContentModalOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Material</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredContents.length === 0 ? (
              <div className="col-span-3 py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
                No study materials uploaded for this selection yet.
              </div>
            ) : (
              filteredContents.map(cnt => (
                <div
                  key={cnt.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:border-slate-300 transition flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded uppercase">
                        {cnt.content_type.replace('_', ' ')}
                      </span>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={() => {
                            setContentToEdit(cnt);
                            setIsContentModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              type: 'content',
                              id: cnt.id,
                              title: cnt.title,
                            });
                          }}
                          className="p-1 text-rose-400 hover:text-rose-700 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{cnt.title}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">
                      {cnt.class?.name} • {cnt.subject?.name} {cnt.chapter_ref ? `• ${cnt.chapter_ref}` : ''}
                    </p>

                    {cnt.description && (
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {cnt.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] text-slate-400">
                      {cnt.is_published ? (
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Published</span>
                        </span>
                      ) : (
                        <span>Draft</span>
                      )}
                    </span>

                    {cnt.file_url ? (
                      <a
                        href={cnt.file_url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center space-x-1 text-xs font-bold text-slate-900 hover:text-blue-600 transition"
                      >
                        <span>Access Resource</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No external link</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Assessment Form Modal */}
      {isAssessmentModalOpen && selectedAcademicYear && (
        <AssessmentFormModal
          isOpen={isAssessmentModalOpen}
          onClose={() => setIsAssessmentModalOpen(false)}
          onSuccess={fetchData}
          assessmentToEdit={assessmentToEdit}
          academicYearId={selectedAcademicYear.id}
        />
      )}

      {/* Marks Entry Modal */}
      {isMarksModalOpen && assessmentForMarks && (
        <MarksEntryModal
          isOpen={isMarksModalOpen}
          onClose={() => setIsMarksModalOpen(false)}
          assessment={assessmentForMarks}
          onSuccess={fetchData}
        />
      )}

      {/* Scheme of Study Form Modal */}
      {isSOSModalOpen && selectedAcademicYear && (
        <SchemeOfStudyFormModal
          isOpen={isSOSModalOpen}
          onClose={() => setIsSOSModalOpen(false)}
          onSuccess={fetchData}
          sosToEdit={sosToEdit}
          academicYearId={selectedAcademicYear.id}
        />
      )}

      {/* Subject Content Form Modal */}
      {isContentModalOpen && selectedAcademicYear && (
        <SubjectContentFormModal
          isOpen={isContentModalOpen}
          onClose={() => setIsContentModalOpen(false)}
          onSuccess={fetchData}
          contentToEdit={contentToEdit}
          academicYearId={selectedAcademicYear.id}
        />
      )}

      {/* Student Report Card Modal */}
      {isReportCardOpen && selectedStudentId && selectedAcademicYear && (
        <StudentReportCardModal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          studentId={selectedStudentId}
          academicYearId={selectedAcademicYear.id}
          settings={settings}
        />
      )}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={deleteConfirm.isOpen}
        title={`Delete ${deleteConfirm.type === 'assessment' ? 'Assessment' : deleteConfirm.type === 'sos' ? 'SOS Unit' : 'Material'}?`}
        message={`Are you sure you want to remove "${deleteConfirm.title}"? This action cannot be undone.`}
        confirmText="Yes, Delete"
        type="danger"
        onConfirm={handleExecuteDelete}
        onClose={() => setDeleteConfirm({ isOpen: false, type: 'assessment', id: '', title: '' })}
      />
    </div>
  );
};
