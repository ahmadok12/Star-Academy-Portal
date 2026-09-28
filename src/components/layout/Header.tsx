import React, { useState, useRef, useEffect } from 'react';
import { Menu, Calendar, ChevronDown, Check, Database, Sparkles } from 'lucide-react';
import { useAcademicYear } from '../../context/AcademicYearContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  academyName?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, academyName = 'Star Academy ERP' }) => {
  const {
    academicYears,
    selectedAcademicYear,
    setSelectedAcademicYear,
  } = useAcademicYear();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

      {/* Right: DB Status Badge + Global Academic Year Selector */}
      <div className="flex items-center space-x-3">
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
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2.5 bg-slate-50 hover:bg-slate-100/90 text-slate-800 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 transition shadow-xs text-xs font-semibold"
            type="button"
          >
            <Calendar className="w-4 h-4 text-slate-500" />
            <div className="text-left">
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
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Academic Year Dropdown Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-modal border border-slate-200/90 py-2 z-50 animate-modal-in">
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
                        setDropdownOpen(false);
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
      </div>
    </header>
  );
};
