// src/pages/setup/steps/HolidayCalendar.tsx
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Holiday } from '../setupTypes';

interface HolidayCalendarProps {
  holidays: Holiday[];
  onHolidaysChange: (holidays: Holiday[]) => void;
}

export function HolidayCalendar({ holidays, onHolidaysChange }: HolidayCalendarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRecurring, setNewRecurring] = useState(true);

  const toggleHoliday = (id: string) => {
    onHolidaysChange(
      holidays.map((h) => (h.id === id ? { ...h, isActive: !h.isActive } : h))
    );
  };

  const removeHoliday = (id: string) => {
    onHolidaysChange(holidays.filter((h) => h.id !== id));
  };

  const addCustomHoliday = () => {
    if (!newName.trim() || !newDate.trim()) return;
    const holiday: Holiday = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      dateDescription: newDate,
      isRecurring: newRecurring,
      isActive: true,
      isDefault: false,
    };
    onHolidaysChange([...holidays, holiday]);
    setNewName('');
    setNewDate('');
    setNewRecurring(true);
    setShowAddForm(false);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Holiday Calendar</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select the holidays your company observes. These will be excluded from workday calculations in procurement timelines.
        </p>
      </div>

      <div className="space-y-1">
        {holidays.map((holiday) => (
          <div
            key={holiday.id}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-slate-50 transition-colors"
          >
            <button
              onClick={() => toggleHoliday(holiday.id)}
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                holiday.isActive
                  ? 'bg-slate-800 text-white'
                  : 'border-2 border-slate-300 bg-white'
              }`}
              aria-label={`Toggle ${holiday.name}`}
            >
              {holiday.isActive && <Check size={12} strokeWidth={3} />}
            </button>

            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">{holiday.name}</span>
              <span className="ml-2 text-xs text-slate-500">{holiday.dateDescription}</span>
            </div>

            {!holiday.isDefault && (
              <button
                onClick={() => removeHoliday(holiday.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={`Remove ${holiday.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            + Add Custom Holiday
          </button>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Company Shutdown"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={newRecurring}
                onChange={(e) => setNewRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              />
              <label htmlFor="recurring" className="text-sm text-slate-600">
                Repeats every year
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={addCustomHoliday}
                className="rounded-md bg-slate-800 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-700 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); setNewDate(''); }}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
