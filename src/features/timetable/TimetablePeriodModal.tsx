import React, { useState } from 'react';
import { X, Clock, Plus, Trash2 } from 'lucide-react';
import { TimetablePeriod } from '../../types/database.types';
import { databaseService } from '../../lib/database-service';
import { useToast } from '../../context/ToastContext';

interface TimetablePeriodModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: TimetablePeriod[];
  onPeriodsUpdated: () => void;
}

export const TimetablePeriodModal: React.FC<TimetablePeriodModalProps> = ({
  isOpen,
  onClose,
  periods,
  onPeriodsUpdated,
}) => {
  const toast = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [periodNumber, setPeriodNumber] = useState<number>(periods.length + 1);
  const [name, setName] = useState('');
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('08:45');
  const [isBreak, setIsBreak] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Validation Error', 'Period name is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      await databaseService.createTimetablePeriod({
        period_number: periodNumber,
        name: name.trim(),
        start_time: startTime,
        end_time: endTime,
        is_break: isBreak,
        display_order: periodNumber,
        status: 'active'
      });
      toast.success('Period Added', `"${name}" configured successfully.`);
      setIsAdding(false);
      setName('');
      setPeriodNumber(periods.length + 2);
      onPeriodsUpdated();
    } catch (err: any) {
      toast.error('Failed to create period', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, periodName: string) => {
    if (!confirm(`Are you sure you want to remove period "${periodName}"?`)) return;
    try {
      await databaseService.deleteTimetablePeriod(id);
      toast.success('Period Removed', `"${periodName}" was removed.`);
      onPeriodsUpdated();
    } catch (err: any) {
      toast.error('Cannot remove period', err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Periods Setup</h3>
              <p className="text-xs text-slate-500">Configure standard bell schedule, periods, and recess intervals</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Periods List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Schedule Periods</span>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg transition"
                  type="button"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Period</span>
                </button>
              )}
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200/80 rounded-2xl overflow-hidden">
              {periods.map((p) => (
                <div
                  key={p.id}
                  className={`p-3.5 flex items-center justify-between ${
                    p.is_break ? 'bg-amber-50/50' : 'bg-white hover:bg-slate-50/60'
                  } transition`}
                >
                  <div className="flex items-center space-x-3">
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs ${
                      p.is_break ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {p.is_break ? '☕' : p.period_number}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{p.name}</span>
                        {p.is_break && (
                          <span className="text-[10px] font-semibold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            Recess / Break
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {p.start_time.substring(0, 5)} – {p.end_time.substring(0, 5)}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition"
                    title="Remove period"
                    type="button"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* New Period Form */}
          {isAdding && (
            <form onSubmit={handleCreate} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 animate-fade-in">
              <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-indigo-600" />
                <span>New Period Timing</span>
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Period Number</label>
                  <input
                    type="number"
                    min={0}
                    value={periodNumber}
                    onChange={(e) => setPeriodNumber(parseInt(e.target.value) || 0)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Period Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Period 8, Lunch Break"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="is_break_check"
                  checked={isBreak}
                  onChange={(e) => setIsBreak(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <label htmlFor="is_break_check" className="text-xs text-slate-700 font-medium cursor-pointer">
                  This is a non-academic break / recess / assembly
                </label>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition"
                >
                  {isSubmitting ? 'Saving...' : 'Save Period'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition shadow-xs"
            type="button"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
