// src/pages/app/Calendars.tsx
import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../../supabase/client';

interface WorkWeekRow {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

interface HolidayRow {
  id: string;
  name: string;
  date_description: string | null;
  is_active: boolean;
  is_recurring: boolean | null;
}

const DAY_KEYS: { key: keyof WorkWeekRow; label: string }[] = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' },
];

export function Calendars() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [workWeek, setWorkWeek] = useState<WorkWeekRow | null>(null);
  const [holidays, setHolidays] = useState<HolidayRow[]>([]);

  useEffect(() => {
    if (!user) return;

    async function load() {
      setLoading(true);
      try {
        // Get company_id for this user
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('auth_id', user!.id)
          .single();

        if (userError || !userData?.company_id) {
          setLoading(false);
          return;
        }

        const companyId = userData.company_id;

        // Fetch work week and holidays in parallel
        const [workWeekRes, holidaysRes] = await Promise.all([
          supabase
            .from('company_work_weeks')
            .select('monday, tuesday, wednesday, thursday, friday, saturday, sunday')
            .eq('company_id', companyId)
            .single(),
          supabase
            .from('company_holidays')
            .select('id, name, date_description, is_active, is_recurring')
            .eq('company_id', companyId)
            .order('name', { ascending: true }),
        ]);

        setWorkWeek(workWeekRes.data ?? null);
        setHolidays(holidaysRes.data ?? []);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user]);

  const hasData = workWeek !== null || holidays.length > 0;

  return (
    <>
      <PageHeader title="Company Calendar" />

      <div className="p-5 space-y-4">
        {loading ? (
          <div className="flex h-32 items-center justify-center rounded-lg border border-slate-200 bg-white">
            <span className="text-[12px] text-slate-400">Loading calendar…</span>
          </div>
        ) : !hasData ? (
          <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
            <p className="text-[12px] text-slate-500">Calendar not configured yet.</p>
          </div>
        ) : (
          <>
            {/* Work Week */}
            <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
              <div className="mb-3 text-[12px] font-semibold text-slate-900">Work Week</div>
              {workWeek ? (
                <div className="flex flex-wrap gap-3">
                  {DAY_KEYS.map(({ key, label }) => {
                    const isWorking = workWeek[key];
                    return (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <span className="text-[12px] font-medium text-slate-700">{label}</span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                            isWorking
                              ? 'bg-green-100 text-green-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isWorking ? 'Working' : 'Non-Working'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[12px] text-slate-500">Work week not configured.</p>
              )}
            </div>

            {/* Holidays */}
            <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
              <div className="mb-3 text-[12px] font-semibold text-slate-900">
                Company Holidays
              </div>
              {holidays.length === 0 ? (
                <p className="text-[12px] text-slate-500">No holidays configured.</p>
              ) : (
                <div className="space-y-1">
                  {holidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <span className="text-[12px] font-medium text-slate-900">
                          {holiday.name}
                        </span>
                        {holiday.date_description && (
                          <span className="ml-2 text-[11px] text-slate-500">
                            {holiday.date_description}
                          </span>
                        )}
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                          holiday.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {holiday.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
