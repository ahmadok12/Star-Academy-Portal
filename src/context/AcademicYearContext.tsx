import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AcademicYear } from '../types/database.types';
import { databaseService } from '../lib/database-service';
import { useToast } from './ToastContext';

interface AcademicYearContextType {
  academicYears: AcademicYear[];
  currentAcademicYear: AcademicYear | null;
  selectedAcademicYear: AcademicYear | null;
  isLoading: boolean;
  setSelectedAcademicYear: (year: AcademicYear) => void;
  setCurrentAcademicYear: (yearId: string) => Promise<void>;
  refreshAcademicYears: () => Promise<void>;
}

const AcademicYearContext = createContext<AcademicYearContextType | undefined>(undefined);

const SELECTED_YEAR_STORAGE_KEY = 'star_academy_selected_year_id';

export const AcademicYearProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYear, setSelectedYearState] = useState<AcademicYear | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const toast = useToast();

  const currentAcademicYear = academicYears.find(y => y.is_current) || null;

  const refreshAcademicYears = useCallback(async () => {
    try {
      const years = await databaseService.getAcademicYears();
      setAcademicYears(years);

      const current = years.find(y => y.is_current) || years[0] || null;
      const storedYearId = localStorage.getItem(SELECTED_YEAR_STORAGE_KEY);

      if (storedYearId) {
        const found = years.find(y => y.id === storedYearId);
        if (found) {
          setSelectedYearState(found);
          return;
        }
      }

      if (current) {
        setSelectedYearState(current);
        localStorage.setItem(SELECTED_YEAR_STORAGE_KEY, current.id);
      }
    } catch (err: any) {
      console.error('Failed to load academic years:', err);
      toast.error('Failed to load academic years', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    refreshAcademicYears();
  }, [refreshAcademicYears]);

  const setSelectedAcademicYear = (year: AcademicYear) => {
    setSelectedYearState(year);
    localStorage.setItem(SELECTED_YEAR_STORAGE_KEY, year.id);
  };

  const setCurrentAcademicYear = async (yearId: string) => {
    try {
      const updatedYear = await databaseService.setCurrentAcademicYear(yearId);
      await refreshAcademicYears();
      setSelectedAcademicYear(updatedYear);
      toast.success('Academic Year Updated', `"${updatedYear.name}" is now the active current academic year.`);
    } catch (err: any) {
      toast.error('Error changing current year', err.message);
      throw err;
    }
  };

  return (
    <AcademicYearContext.Provider
      value={{
        academicYears,
        currentAcademicYear,
        selectedAcademicYear,
        isLoading,
        setSelectedAcademicYear,
        setCurrentAcademicYear,
        refreshAcademicYears
      }}
    >
      {children}
    </AcademicYearContext.Provider>
  );
};

export const useAcademicYear = (): AcademicYearContextType => {
  const context = useContext(AcademicYearContext);
  if (!context) {
    throw new Error('useAcademicYear must be used within an AcademicYearProvider');
  }
  return context;
};
