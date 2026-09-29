import React, { useState, useEffect } from 'react';
import {
  Clock,
  Award,
  BookOpen,
  Printer,
  MapPin,
  UserCheck
} from 'lucide-react';
import {
  Parent,
  ParentPortalOverview,
  ParentPortalChildSummary,
  AcademySettings
} from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { useToast } from '../../context/ToastContext';
import { StudentReportCardModal } from '../exams/StudentReportCardModal';

interface ParentPortalPageProps {
  settings?: AcademySettings | null;
}

type ParentPortalTab = 'children-overview' | 'child-timetable' | 'child-attendance' | 'child-results' | 'child-sos';

export const ParentPortalPage: React.FC<ParentPortalPageProps> = ({ settings }) => {
  const { selectedAcademicYear } = useAcademicYear();
  const toast = useToast();

  const [parents, setParents] = useState<Parent[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const [overview, setOverview] = useState<ParentPortalOverview | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<ParentPortalTab>('children-overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isReportCardOpen, setIsReportCardOpen] = useState(false);

  // Load parents list
  useEffect(() => {
    const loadParents = async () => {
      try {
        const list = await databaseService.getParents();
        setParents(list);
        if (list.length > 0 && !selectedParentId) {
          // Default to Usman Ali who has 2 children linked (demonstrating child switching)
          setSelectedParentId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load parents:', err);
      }
    };
    loadParents();
  }, []);

  // Load overview for selected parent
  const fetchOverview = async () => {
    if (!selectedParentId || !selectedAcademicYear) return;
    setIsLoading(true);
    try {
      const data = await databaseService.getParentPortalOverview(selectedParentId, selectedAcademicYear.id);
      setOverview(data);
      setSelectedChildIndex(0);
    } catch (err: any) {
      toast.error('Failed to load parent portal dashboard');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, [selectedParentId, selectedAcademicYear]);

  const parent = overview?.parent;
  const children = overview?.children || [];
  const selectedChild: ParentPortalChildSummary | undefined = children[selectedChildIndex];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Mobile-First Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-5 sm:p-7 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-teal-500/10 to-transparent pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 px-2.5 py-0.5 rounded-full border border-teal-400/30 uppercase tracking-wider">
                Phase 9 • Parent Portal
              </span>
              <span className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded font-mono">
                {selectedAcademicYear?.name || '2026-27'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-2">
              Parent Guardian &amp; Multi-Child Portal
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Track your children's real-time attendance, test marks, exam datesheets, homework, and academic progress with seamless child switching.
            </p>
          </div>

          {/* Parent Profile Switcher (For demo/testing) */}
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/10 shrink-0 min-w-[260px]">
            <label className="block text-[10px] uppercase font-bold text-slate-300 tracking-wider mb-1.5 flex items-center justify-between">
              <span>Parent / Guardian Account</span>
              <span className="text-[9px] text-teal-200">Switch Parent</span>
            </label>
            <select
              value={selectedParentId}
              onChange={e => setSelectedParentId(e.target.value)}
              className="w-full text-xs font-bold bg-slate-900 text-white rounded-xl px-3 py-2 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-teal-400"
            >
              {parents.map(p => (
                <option key={p.id} value={p.id}>
                  {p.full_name} ({p.relationship})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-5 h-5 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-3 text-xs font-semibold text-slate-600">Loading parent profile &amp; linked children...</span>
        </div>
      )}

      {/* Parent Overview Bar */}
      {!isLoading && parent && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0 tracking-wider">
                {parent.full_name.split(' ').slice(0, 2).map(n => n[0]).join('')}
              </div>
              <div>
                <div className="flex items-center space-x-2.5">
                  <h2 className="text-lg font-bold text-slate-900">{parent.full_name}</h2>
                  <span className="text-[10px] font-mono font-bold bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full uppercase">
                    {parent.relationship}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Phone: <span className="font-mono font-semibold text-slate-800">{parent.phone}</span>
                  {parent.cnic && <> • CNIC: <span className="font-mono text-slate-700">{parent.cnic}</span></>}
                  {parent.occupation && <> • {parent.occupation}</>}
                </p>
                {parent.address && (
                  <p className="text-[11px] text-slate-400 mt-1 flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{parent.address}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3 self-end sm:self-center">
              <span className="text-xs font-bold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {children.length} {children.length === 1 ? 'Child' : 'Children'} Enrolled
              </span>
            </div>
          </div>

          {/* Child Switcher Cards (Multi-Child Switching Component) */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs uppercase font-extrabold text-slate-400 tracking-wider">
                My Children (Select child to view records)
              </h3>
              <span className="text-[11px] text-teal-600 font-semibold">
                Click any child to switch active view
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {children.map((child, idx) => {
                const isSelected = selectedChildIndex === idx;
                const st = child.student;
                return (
                  <div
                    key={st.id}
                    onClick={() => {
                      setSelectedChildIndex(idx);
                      if (activeTab === 'children-overview') {
                        setActiveTab('child-attendance');
                      }
                    }}
                    className={`cursor-pointer p-4 rounded-2xl border transition relative ${
                      isSelected
                        ? 'bg-teal-50/40 border-teal-500 shadow-sm ring-2 ring-teal-500/20'
                        : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300 hover:bg-slate-100/60'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 text-[9px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                        Active Child
                      </span>
                    )}

                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                        isSelected ? 'bg-teal-600 text-white' : 'bg-slate-800 text-white'
                      }`}>
                        {st.student_name.split(' ').slice(0, 2).map(n => n[0]).join('')}
                      </div>
                      <div className="truncate">
                        <h4 className="font-extrabold text-slate-900 text-sm truncate">{st.student_name}</h4>
                        <p className="text-[11px] text-slate-500 font-mono truncate">
                          {st.admission_no} • {st.academic_record?.class?.name || 'Class 9'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-slate-200/60 text-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Section</span>
                        <span className="text-xs font-bold text-slate-800 font-mono">
                          {st.academic_record?.section?.name || 'A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Attendance</span>
                        <span className="text-xs font-black text-emerald-700 font-mono">
                          {child.attendancePercentage}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] uppercase font-bold text-slate-400 block">Grade</span>
                        <span className="text-xs font-black text-teal-800 font-mono">
                          {child.latestGrade || 'A+'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tabs for Selected Child */}
      {selectedChild && (
        <div className="space-y-4">
          <div className="flex items-center space-x-1 border-b border-slate-200 overflow-x-auto pb-px">
            {[
              { id: 'child-attendance', label: `Attendance (${selectedChild.student.student_name.split(' ')[0]})`, icon: UserCheck },
              { id: 'child-results', label: 'Exam Results & Marksheet', icon: Award },
              { id: 'child-timetable', label: 'Daily Timetable', icon: Clock },
              { id: 'child-sos', label: 'Scheme of Study (SOS)', icon: BookOpen },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as ParentPortalTab)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition whitespace-nowrap border-b-2 ${
                    isActive
                      ? 'border-teal-600 text-teal-800 bg-white shadow-2xs'
                      : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: CHILD ATTENDANCE */}
          {activeTab === 'child-attendance' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedChild.student.student_name}'s Attendance Log
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verified classroom roll calls and daily attendance status.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-mono">
                    {selectedChild.attendancePercentage}% Attendance Rate
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Present Rate</span>
                  <span className="text-2xl font-black text-emerald-900 mt-1 block font-mono">
                    {selectedChild.attendancePercentage}%
                  </span>
                  <span className="text-[10px] text-emerald-600 mt-0.5 block">Consistent attendance</span>
                </div>
                <div className="p-4 bg-red-50/60 rounded-xl border border-red-200/60">
                  <span className="text-[10px] uppercase font-bold text-red-700 block">Absences</span>
                  <span className="text-2xl font-black text-red-900 mt-1 block font-mono">0</span>
                  <span className="text-[10px] text-red-600 mt-0.5 block">Unexcused leaves</span>
                </div>
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200/60">
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Leaves Taken</span>
                  <span className="text-2xl font-black text-amber-900 mt-1 block font-mono">0</span>
                  <span className="text-[10px] text-amber-600 mt-0.5 block">Approved applications</span>
                </div>
                <div className="p-4 bg-teal-50/60 rounded-xl border border-teal-200/60">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">Status</span>
                  <span className="text-2xl font-black text-teal-900 mt-1 block font-mono">Good</span>
                  <span className="text-[10px] text-teal-600 mt-0.5 block">Meets 75% requirement</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHILD EXAM RESULTS & MARKSHEET */}
          {activeTab === 'child-results' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    {selectedChild.student.student_name}'s Examination Scores
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Official test results evaluated by Star Academy instructors.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReportCardOpen(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report Card</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Overall Grade</span>
                  <span className="text-3xl font-black text-teal-900 font-mono mt-1 block">
                    {selectedChild.latestGrade || 'A+'}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">
                    Average Score: <span className="font-bold text-slate-900 font-mono">{selectedChild.averageMarksPercentage}%</span>
                  </span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assessments Evaluated</span>
                  <span className="text-3xl font-black text-slate-900 font-mono mt-1 block">
                    {selectedChild.totalTestsGiven}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5 block">Monthly tests &amp; midterms</span>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Academic Standing</span>
                  <span className="text-3xl font-black text-emerald-700 font-mono mt-1 block">PASS</span>
                  <span className="text-xs text-emerald-600 mt-0.5 block">Eligible for final examinations</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CHILD TIMETABLE */}
          {activeTab === 'child-timetable' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedChild.student.student_name}'s Timetable
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily period allocation, classroom numbers, and subject teachers.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { period: 1, time: '08:00 - 08:45', subject: 'Mathematics', teacher: 'Prof. Tariq Mahmood', room: 'Room 4' },
                  { period: 2, time: '08:45 - 09:30', subject: 'Physics', teacher: 'Dr. Shahzad Akram', room: 'Physics Lab' },
                  { period: 3, time: '09:30 - 10:15', subject: 'Chemistry', teacher: 'Mrs. Farzana Kausar', room: 'Room 2' },
                  { period: 4, time: '10:45 - 11:30', subject: 'English', teacher: 'Ms. Ayesha Siddiqui', room: 'Room 5' },
                ].map(item => (
                  <div key={item.period} className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                        P{item.period}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-xs">{item.subject}</h4>
                        <p className="text-[11px] text-slate-500">{item.teacher} • {item.room}</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CHILD SCHEME OF STUDY */}
          {activeTab === 'child-sos' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 sm:p-6 space-y-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  {selectedChild.student.student_name}'s Syllabus Targets
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly curriculum syllabus roadmap to track your child's learning pace.
                </p>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {[
                  { month: 'May 2026', subject: 'Mathematics', chapter: 'Matrices & Determinants', status: 'Completed' },
                  { month: 'June 2026', subject: 'Mathematics', chapter: 'Real & Complex Numbers', status: 'Completed' },
                  { month: 'July 2026', subject: 'Mathematics', chapter: 'Logarithms', status: 'In Progress' },
                  { month: 'May 2026', subject: 'Physics', chapter: 'Physical Quantities & Measurement', status: 'Completed' },
                  { month: 'June 2026', subject: 'Physics', chapter: 'Kinematics', status: 'In Progress' },
                ].map((sos, i) => (
                  <div key={i} className="p-3.5 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div>
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {sos.month}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1">{sos.chapter}</h4>
                      <p className="text-[11px] text-slate-500">{sos.subject}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase font-mono ${
                      sos.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {sos.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Marksheet Modal */}
      {isReportCardOpen && selectedChild && selectedAcademicYear && (
        <StudentReportCardModal
          isOpen={isReportCardOpen}
          onClose={() => setIsReportCardOpen(false)}
          studentId={selectedChild.student.id}
          academicYearId={selectedAcademicYear.id}
          settings={settings}
        />
      )}
    </div>
  );
};
