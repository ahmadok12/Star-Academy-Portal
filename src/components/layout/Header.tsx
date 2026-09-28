import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Calendar,
  ChevronDown,
  Check,
  Database,
  Sparkles,
  Settings,
  GraduationCap,
  Layers,
  BookOpen,
  Link2,
  CalendarRange
} from 'lucide-react';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { NavTab } from './Sidebar';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  academyName?: string;
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenMobileMenu,
  academyName = 'Star Academy ERP',
  currentTab,
  onSelectTab
}) => {
  const {
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
  } = useAcademicYear();

  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const yearDropdownRef = useRef<HTMLDivElement>(null);
  const settingsDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setYearDropdownOpen(false);
      }
      if (settingsDropdownRef.current && !settingsDropdownRef.current.contains(event.target as Node)) {
        setSettingsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const academicSetupItems: { tab: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'academic-years', label: 'Academic Years', icon: Calendar },
    { tab: 'classes', label: 'Classes Master', icon: GraduationCap },
    { tab: 'sections', label: 'Sections Master', icon: Layers },
    { tab: 'batches', label: 'Batches Master', icon: Sparkles },
    { tab: 'class-sections', label: 'Class Sections', icon: Link2 },
    { tab: 'subjects', label: 'Subjects Master', icon: BookOpen },
    { tab: 'class-subjects', label: 'Class Subjects', icon: CalendarRange },
  ];

  const generalSettingsItems: { tab: NavTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { tab: 'settings', label: 'Academy Profile', icon: Settings },
  ];

  const setupTabKeys: NavTab[] = [
    'academic-years',
    'classes',
    'sections',
    'batches',
    'class-sections',
    'subjects',
    'class-subjects',
    'settings'
  ];
  const isSetupActive = setupTabKeys.includes(currentTab);

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
      {/* Left: Mobile Toggle & Title */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-800 md:hidden"
          type="button"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-800 tracking-tight">{academyName}</span>
          <span className="text-slate-300">/</span>
          <span className="text-xs text-slate-500 font-medium">Administration Portal</span>
        </div>
      </div>

      {/* Right Controls: DB Badge + Academic Year Selector + Settings Button */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Backend Indicator Badge */}
        <div
          title={isSupabaseConfigured ? 'Connected to live Supabase PostgreSQL' : 'Operating in fast local demo state'}
          className={`hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            isSupabaseConfigured
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              : 'bg-slate-100 text-slate-600 border-slate-200'
          }`}
        >
          {isSupabaseConfigured ? (
            <>
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Supabase Live</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Dev Demo Store</span>
            </>
          )}
        </div>

        {/* Global Academic Year Selector */}
        <div className="relative" ref={yearDropdownRef}>
          <button
            onClick={() => {
              setYearDropdownOpen(!yearDropdownOpen);
              setSettingsDropdownOpen(false);
            }}
            className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100/90 text-slate-800 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 transition shadow-xs text-xs font-semibold"
            type="button"
          >
            <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
            <div className="text-left hidden xs:block">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold leading-none">
                Academic Year
              </span>
              <span className="text-xs font-bold text-slate-900 leading-tight block mt-0.5">
                {selectedAcademicYear ? selectedAcademicYear.name : 'Select Year'}
                {selectedAcademicYear?.is_current && (
                  <span className="ml-1 text-[10px] font-medium text-emerald-600">(Current)</span>
                )}
              </span>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${yearDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Academic Year Dropdown Menu */}
          {yearDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-modal-in">
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Active Academic Year
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Controls class sections, subjects, and curricula shown across the ERP.
                </p>
              </div>

              <div className="max-h-56 overflow-y-auto custom-scroll">
                {academicYears.map((year) => {
                  const isSelected = selectedAcademicYear?.id === year.id;
                  const isCurrent = year.is_current;

                  return (
                    <button
                      key={year.id}
                      onClick={() => {
                        setSelectedAcademicYear(year);
                        setYearDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between transition ${
                        isSelected
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{year.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-semibold border border-emerald-200/60">
                            Current
                          </span>
                        )}
                        {year.status === 'inactive' && (
                          <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-slate-900" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Small Settings Button on Top Right Corner */}
        <div className="relative" ref={settingsDropdownRef}>
          <button
            onClick={() => {
              setSettingsDropdownOpen(!settingsDropdownOpen);
              setYearDropdownOpen(false);
            }}
            title="Academic Setup & System Settings"
            className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border transition shadow-xs text-xs font-semibold ${
              isSetupActive
                ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                : 'bg-slate-50 hover:bg-slate-100/90 text-slate-700 border-slate-200'
            }`}
            type="button"
          >
            <Settings className={`w-4 h-4 ${isSetupActive ? 'text-white' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">Settings</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${settingsDropdownOpen ? 'rotate-180' : ''} ${isSetupActive ? 'text-white/80' : 'text-slate-400'}`} />
          </button>

          {/* Settings & Academic Setup Dropdown */}
          {settingsDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2.5 z-50 animate-modal-in">
              <div className="px-3.5 py-1.5 border-b border-slate-100 mb-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Academic Setup &amp; Settings
                  </p>
                  <span className="text-[9px] bg-slate-100 text-slate-500 font-semibold px-1.5 py-0.5 rounded">
                    One-Time Setup
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Configure structural rules, classes, sections, and academy profile.
                </p>
              </div>

              {/* Group 1: Academic Setup */}
              <div className="px-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2.5 py-1">
                  Academic Setup
                </p>
                <div className="space-y-0.5">
                  {academicSetupItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => {
                          onSelectTab(item.tab);
                          setSettingsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-slate-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 my-2" />

              {/* Group 2: System Settings */}
              <div className="px-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider px-2.5 py-1">
                  Settings
                </p>
                <div className="space-y-0.5">
                  {generalSettingsItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = currentTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => {
                          onSelectTab(item.tab);
                          setSettingsDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium transition ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 font-bold'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-slate-900' : 'text-slate-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-slate-900" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
