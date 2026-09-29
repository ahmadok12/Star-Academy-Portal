import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  LogOut,
  Users,
  UserPlus,
  ArrowRightLeft,
  ClipboardList,
  Clock,
  DollarSign,
  Briefcase,
  BarChart3,
  Award,
  Smartphone,
  GraduationCap,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard'
  | 'teacher-portal'
  | 'student-portal'
  | 'parent-portal'
  | 'exams-marks'
  | 'student-inquiries'
  | 'students-directory'
  | 'student-admission'
  | 'student-promotion'
  | 'staff-directory'
  | 'teacher-assignments'
  | 'academic-years'
  | 'classes'
  | 'sections'
  | 'batches'
  | 'class-sections'
  | 'subjects'
  | 'class-subjects'
  | 'timetable'
  | 'attendance'
  | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  academyName?: string;
  logoUrl?: string | null;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
  academyName = 'Star Academy',
  logoUrl,
}) => {
  const { user, logout } = useAuth();

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const getInitials = (name?: string) => {
    if (!name) return 'SA';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 p-5 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Logo & Brand */}
          <div className="flex items-center justify-between pb-5 border-b border-dashed border-slate-200 shrink-0">
            <div className="flex items-center space-x-3 overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={academyName}
                  className="w-9 h-9 rounded-xl object-contain border border-slate-100 shadow-xs"
                />
              ) : (
                <div className="w-9 h-9 rounded-xl bg-[#11141A] text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs shrink-0">
                  ★
                </div>
              )}
              <div className="truncate">
                <span className="text-base font-extrabold tracking-tight text-slate-900 block truncate">
                  {academyName}
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Management ERP
                </span>
              </div>
            </div>
          </div>

          {/* Nav Links with Custom Scrollbar */}
          <div className="flex-1 overflow-y-auto custom-scroll pr-1 mt-4 space-y-6">
            {/* Main Menu */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3">
                Main Menu
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('dashboard')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition ${
                      currentTab === 'dashboard'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4 shrink-0" />
                    <span>Dashboard</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Operations & Schedule (Phase 5, 6 & 7) */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3 flex items-center justify-between">
                <span>Operations &amp; Portals</span>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded border border-emerald-200/60">P5, P6 &amp; P7</span>
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('timetable')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'timetable'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <span>Timetable &amp; Schedule</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold">P5</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('attendance')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'attendance'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>Attendance &amp; Registers</span>
                    </div>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold">P6</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('teacher-portal')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'teacher-portal'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Smartphone className="w-4 h-4 shrink-0 text-amber-500" />
                      <span className="font-semibold text-slate-900">Teacher Portal</span>
                    </div>
                    <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-1 py-0.5 rounded font-semibold border border-amber-200/50">P7</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('student-portal')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'student-portal'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-4 h-4 shrink-0 text-indigo-500" />
                      <span className="font-semibold text-slate-900">Student Portal</span>
                    </div>
                    <span className="text-[9px] font-mono text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded font-semibold border border-indigo-200/50">P9</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('parent-portal')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'parent-portal'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <ShieldCheck className="w-4 h-4 shrink-0 text-teal-600" />
                      <span className="font-semibold text-slate-900">Parent Portal</span>
                    </div>
                    <span className="text-[9px] font-mono text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-semibold border border-teal-200/50">P9</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Student Module (Phase 3) */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3">
                Student Management
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('students-directory')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'students-directory'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0" />
                    <span>All Students</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('student-inquiries')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'student-inquiries'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ClipboardList className="w-4 h-4 shrink-0" />
                    <span>Inquiries Pipeline</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('student-admission')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'student-admission'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <UserPlus className="w-4 h-4 shrink-0" />
                    <span>New Admission</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('student-promotion')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'student-promotion'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4 shrink-0" />
                    <span>Enroll &amp; Promote</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Staff & Faculty */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3">
                Staff &amp; Faculty
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('staff-directory')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'staff-directory'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Briefcase className="w-4 h-4 shrink-0" />
                    <span>Staff Directory</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('teacher-assignments')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'teacher-assignments'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Teacher Allocations</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Academic & Examination (Phase 8) */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3 flex items-center justify-between">
                <span>Academics &amp; Exams</span>
                <span className="text-[9px] bg-blue-50 text-blue-700 font-semibold px-1.5 py-0.5 rounded border border-blue-200/60">Phase 8</span>
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('exams-marks')}
                    className={`w-full flex items-center justify-between px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'exams-marks'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="w-4 h-4 shrink-0 text-amber-500" />
                      <span className="font-semibold text-slate-900">Exams &amp; Marksheets</span>
                    </div>
                    <span className="text-[9px] font-mono text-blue-700 bg-blue-50 px-1 py-0.5 rounded font-semibold border border-blue-200/50">P8</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Future Modules (Coming Soon) */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3 flex items-center justify-between">
                <span>Future Modules</span>
                <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-400 font-normal">Next Phases</span>
              </p>
              <ul className="space-y-1 opacity-55">
                {[
                  { label: 'Fees & Finance', icon: DollarSign },
                  { label: 'Central Reports', icon: BarChart3 },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <li key={i} className="flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 cursor-not-allowed">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{item.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">Soon</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>

          {/* User Profile Card at Bottom */}
          <div className="mt-4 pt-3.5 border-t border-slate-200/80 flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 tracking-wider">
                {getInitials(user?.full_name)}
              </div>
              <div className="truncate">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.full_name || 'Admin User'}
                </p>
                <p className="text-[10px] text-slate-400 truncate">
                  {user?.email || 'admin@staracademy.edu.pk'}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-slate-400 hover:text-slate-700 transition p-1.5 hover:bg-slate-100 rounded-lg shrink-0"
              type="button"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
