import {
  LayoutDashboard,
  Calendar,
  GraduationCap,
  Layers,
  BookOpen,
  Link2,
  Settings,
  LogOut,
  Users,
  UserPlus,
  ArrowRightLeft,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  DollarSign,
  Briefcase,
  BarChart3,
  CalendarRange,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export type NavTab = 
  | 'dashboard'
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

            {/* Academic Setup */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3">
                Academic Setup
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('academic-years')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'academic-years'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Calendar className="w-4 h-4 shrink-0" />
                    <span>Academic Years</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('classes')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'classes'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <GraduationCap className="w-4 h-4 shrink-0" />
                    <span>Classes Master</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('sections')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'sections'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Layers className="w-4 h-4 shrink-0" />
                    <span>Sections Master</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('batches')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'batches'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Batches Master</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('class-sections')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'class-sections'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Link2 className="w-4 h-4 shrink-0" />
                    <span>Class Sections</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('subjects')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'subjects'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <BookOpen className="w-4 h-4 shrink-0" />
                    <span>Subjects Master</span>
                  </button>
                </li>

                <li>
                  <button
                    onClick={() => handleNavClick('class-subjects')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'class-subjects'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <CalendarRange className="w-4 h-4 shrink-0" />
                    <span>Class Subjects</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* Settings */}
            <div>
              <p className="text-[11px] uppercase font-bold text-slate-400 tracking-wider mb-2 px-3">
                Settings
              </p>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => handleNavClick('settings')}
                    className={`w-full flex items-center space-x-3 px-3.5 py-2 rounded-xl font-medium text-xs transition ${
                      currentTab === 'settings'
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0" />
                    <span>Academy Profile</span>
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
                  { label: 'Staff & Teachers', icon: Briefcase },
                  { label: 'Timetable', icon: Calendar },
                  { label: 'Attendance', icon: Clock },
                  { label: 'Exams & Marks', icon: FileSpreadsheet },
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
