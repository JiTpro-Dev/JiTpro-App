import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { supabase } from '../../../supabase/client';
import { useAuth } from '../../context/AuthContext';

interface TimelineItem {
  name: string;
  days: number;
  color: string;
  milestone?: boolean;
  task_status?: 'not_started' | 'in_progress' | 'complete';
  actual_start?: string | null;
  actual_finish?: string | null;
}

// Base timeline items (before review rounds)
const preReviewItems: TimelineItem[] = [
  { name: 'Start Buyout', days: 0, color: '#111', milestone: true },
  { name: 'Buyout', days: 15, color: '#555' },
  { name: 'Buyout Complete', days: 0, color: '#111', milestone: true },
  { name: 'Submittal Coordination', days: 22, color: '#1f77b4' },
  { name: 'Coordination Complete', days: 0, color: '#111', milestone: true },
  { name: 'Submittal Preparation', days: 22, color: '#1f77b4' },
  { name: 'Initial Submittal', days: 0, color: '#111', milestone: true },
  { name: '1st Review', days: 15, color: '#d62728' },
];

const round1Response: TimelineItem[] = [
  { name: 'Revise Response', days: 0, color: '#111', milestone: true },
  { name: 'Vendor Rev 1', days: 8, color: '#ff7f0e' },
  { name: 'REV 1 Submittal', days: 0, color: '#111', milestone: true },
  { name: 'REV 1 Review', days: 10, color: '#d62728' },
];

const round2Response: TimelineItem[] = [
  { name: 'REV 1 Response', days: 0, color: '#111', milestone: true },
  { name: 'Vendor Rev 2', days: 5, color: '#ff7f0e' },
  { name: 'REV 2 Submittal', days: 0, color: '#111', milestone: true },
  { name: 'REV 2 Review', days: 6, color: '#2ca02c' },
];

const postReviewItems: TimelineItem[] = [
  { name: 'Approval', days: 0, color: '#111', milestone: true },
  { name: 'Release to Fab', days: 0, color: '#111', milestone: true },
  { name: 'Fabrication', days: 130, color: '#9467bd' },
  { name: 'Fabrication Complete', days: 0, color: '#111', milestone: true },
  { name: 'Shipping', days: 8, color: '#17becf' },
  { name: 'Delivered - Ready for Install', days: 0, color: '#111', milestone: true },
];

function buildTimeline(rounds: number): TimelineItem[] {
  const items = [...preReviewItems];
  if (rounds >= 2) items.push(...round1Response);
  if (rounds >= 3) items.push(...round2Response);
  items.push(...postReviewItems);
  return items;
}

function detectReviewRounds(data: TimelineItem[]): number {
  const names = data.map((d) => d.name);
  if (names.includes('Vendor Rev 2')) return 3;
  if (names.includes('Vendor Rev 1')) return 2;
  return 1;
}

function isWorkday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function addWorkdays(date: Date, workdays: number): Date {
  const result = new Date(date);
  let remaining = workdays;
  while (remaining > 0) {
    result.setDate(result.getDate() + 1);
    if (isWorkday(result)) remaining--;
  }
  return result;
}

function subtractWorkdays(date: Date, workdays: number): Date {
  const result = new Date(date);
  let remaining = workdays;
  while (remaining > 0) {
    result.setDate(result.getDate() - 1);
    if (isWorkday(result)) remaining--;
  }
  return result;
}

function nextWorkday(date: Date): Date {
  const result = new Date(date);
  while (!isWorkday(result)) {
    result.setDate(result.getDate() + 1);
  }
  return result;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function toInputDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

interface TooltipInfo {
  name: string;
  startDate: string;
  endDate: string;
  duration: number;
  isMilestone: boolean;
  x: number;
  y: number;
}

export function ProcurementTimeline() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('id');
  const { session } = useAuth();

  // Procurement item info
  const [itemName, setItemName] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [reviewRounds, setReviewRounds] = useState(3);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [status, setStatus] = useState<'draft' | 'active' | 'complete'>('draft');
  const [baselineCount, setBaselineCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState<TimelineItem[]>(buildTimeline(3));
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date(2026, 11, 1));
  const [tooltip, setTooltip] = useState<TooltipInfo | null>(null);
  const [showTable, setShowTable] = useState(false);

  // Owner/Architect milestones (outside contractor control)
  const [finalDesignEnabled, setFinalDesignEnabled] = useState(false);
  const [finalDesignDate, setFinalDesignDate] = useState<Date | null>(null);
  const [finalSelectionEnabled, setFinalSelectionEnabled] = useState(false);
  const [finalSelectionDate, setFinalSelectionDate] = useState<Date | null>(null);

  // Edit reason modal
  const [editReasonModal, setEditReasonModal] = useState<{
    index: number;
    taskName: string;
    field: string;
    oldValue: string;
    newValue: string;
    applyChange: () => void;
  } | null>(null);
  const [editReason, setEditReason] = useState('');

  // Load existing item if editing
  useEffect(() => {
    if (!editId) return;
    setLoading(true);
    supabase
      .from('procurement_timelines')
      .select('*')
      .eq('id', editId)
      .single()
      .then(({ data: row, error }) => {
        if (error || !row) {
          setSaveError('Could not load procurement item.');
          setLoading(false);
          return;
        }
        setItemName(row.name);
        setItemDescription(row.description || '');
        setDeliveryDate(new Date(row.delivery_date + 'T00:00:00'));
        setStatus(row.status || 'draft');
        setBaselineCount(row.baseline_count || 0);
        const loadedData = row.timeline_data as TimelineItem[];
        setData(loadedData);
        setReviewRounds(detectReviewRounds(loadedData));
        setFinalDesignEnabled(row.final_design_enabled || false);
        setFinalDesignDate(row.final_design_date ? new Date(row.final_design_date + 'T00:00:00') : null);
        setFinalSelectionEnabled(row.final_selection_enabled || false);
        setFinalSelectionDate(row.final_selection_date ? new Date(row.final_selection_date + 'T00:00:00') : null);
        setLoading(false);
      });
  }, [editId]);

  const handleReviewRoundsChange = useCallback((rounds: number) => {
    setReviewRounds(rounds);
    setData((prev) => {
      const newTemplate = buildTimeline(rounds);
      const prevMap = new Map(prev.map((item) => [item.name, item]));
      return newTemplate.map((item) => {
        const existing = prevMap.get(item.name);
        return existing ? { ...item, days: existing.days, task_status: existing.task_status, actual_start: existing.actual_start, actual_finish: existing.actual_finish } : item;
      });
    });
  }, []);

  const totalWorkdays = useMemo(() => data.reduce((sum, d) => sum + d.days, 0), [data]);

  const effectiveWorkdays = useMemo(
    () => data.reduce((sum, d) => sum + (d.days > 0 ? d.days + 1 : 0), 0),
    [data]
  );

  // Determine calculation mode
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const naiveStartDate = useMemo(() => subtractWorkdays(deliveryDate, effectiveWorkdays), [deliveryDate, effectiveWorkdays]);

  const isStartInPast = status !== 'draft' && naiveStartDate < today;

  // Mode A: delivery fixed, start calculates backward
  // Mode B: start locked, delivery calculates forward
  const startDate = useMemo(() => {
    if (isStartInPast) return naiveStartDate; // locked — can't change
    return naiveStartDate;
  }, [naiveStartDate, isStartInPast]);

  const calculatedDeliveryDate = useMemo(() => {
    if (isStartInPast) {
      return addWorkdays(startDate, effectiveWorkdays);
    }
    return deliveryDate;
  }, [isStartInPast, startDate, effectiveWorkdays, deliveryDate]);

  const activeDeliveryDate = isStartInPast ? calculatedDeliveryDate : deliveryDate;

  // Flag if start date is before today
  const startBeforeToday = naiveStartDate < today;
  const workdaysBehind = useMemo(() => {
    if (!startBeforeToday) return 0;
    let count = 0;
    const d = new Date(naiveStartDate);
    while (d < today) {
      d.setDate(d.getDate() + 1);
      if (isWorkday(d)) count++;
    }
    return count;
  }, [naiveStartDate, today, startBeforeToday]);

  const segments = useMemo(() => {
    let currentDate = new Date(startDate);
    return data.map((item) => {
      const segStart = new Date(currentDate);
      let segEnd: Date;

      if (item.days > 0) {
        segEnd = addWorkdays(segStart, item.days);
        currentDate = nextWorkday(addWorkdays(segStart, item.days + 1));
      } else {
        segEnd = new Date(segStart);
        currentDate = nextWorkday(new Date(segStart));
      }

      const offset = totalWorkdays > 0 ? (data.slice(0, data.indexOf(item)).reduce((s, d) => s + d.days, 0) / totalWorkdays) * 100 : 0;
      const width = totalWorkdays > 0 ? (item.days / totalWorkdays) * 100 : 0;

      return { ...item, offset, width, startDate: segStart, endDate: segEnd };
    });
  }, [data, totalWorkdays, startDate]);

  const getDatePosition = useCallback(
    (date: Date): number | null => {
      if (!startDate || !activeDeliveryDate) return null;
      const barStart = startDate.getTime();
      const barEnd = activeDeliveryDate.getTime();
      if (barEnd <= barStart) return null;
      const pos = ((date.getTime() - barStart) / (barEnd - barStart)) * 100;
      if (pos < 0 || pos > 100) return null;
      return pos;
    },
    [startDate, activeDeliveryDate]
  );

  const handleMouseEnter = useCallback(
    (index: number, e: React.MouseEvent) => {
      const seg = segments[index];
      setTooltip({
        name: seg.name,
        startDate: formatDate(seg.startDate),
        endDate: formatDate(seg.endDate),
        duration: seg.days,
        isMilestone: !!seg.milestone,
        x: e.clientX,
        y: e.clientY,
      });
    },
    [segments]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (tooltip) {
        setTooltip((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY } : null));
      }
    },
    [tooltip]
  );

  const handleMouseLeave = useCallback(() => {
    setTooltip(null);
  }, []);

  const handleDurationChange = useCallback((index: number, value: string) => {
    const newDays = parseInt(value, 10);
    if (isNaN(newDays) || newDays < 1) return;

    const oldDays = data[index].days;
    const taskName = data[index].name;

    if (status === 'active') {
      // Require reason for changes on active items
      setEditReasonModal({
        index,
        taskName,
        field: 'duration',
        oldValue: String(oldDays),
        newValue: String(newDays),
        applyChange: () => {
          setData((prev) => {
            const updated = [...prev];
            updated[index] = { ...updated[index], days: newDays };
            return updated;
          });
        },
      });
      return;
    }

    setData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], days: newDays };
      return updated;
    });
  }, [data, status]);

  const submitEditReason = useCallback(async () => {
    if (!editReasonModal || !editReason.trim() || !editId) return;

    // Log the edit
    await supabase.from('timeline_edit_log').insert({
      timeline_id: editId,
      task_name: editReasonModal.taskName,
      field_changed: editReasonModal.field,
      old_value: editReasonModal.oldValue,
      new_value: editReasonModal.newValue,
      reason: editReason.trim(),
      changed_by: session?.user?.id,
    });

    editReasonModal.applyChange();
    setEditReasonModal(null);
    setEditReason('');
  }, [editReasonModal, editReason, editId, session]);

  const handleDeliveryDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isStartInPast) return; // delivery is calculated when start is in the past
    const newDate = new Date(e.target.value + 'T00:00:00');
    if (!isNaN(newDate.getTime())) {
      setDeliveryDate(newDate);
    }
  }, [isStartInPast]);

  // Task status updates
  const handleTaskStatusChange = useCallback((index: number, newStatus: 'not_started' | 'in_progress' | 'complete') => {
    setData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], task_status: newStatus };
      return updated;
    });
  }, []);

  const handleActualDateChange = useCallback((index: number, field: 'actual_start' | 'actual_finish', value: string) => {
    setData((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value || null };
      return updated;
    });
  }, []);

  // Drag support for owner/architect milestones
  const barRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef<'finalDesign' | 'finalSelection' | null>(null);

  const positionToDate = useCallback(
    (clientX: number): Date => {
      const bar = barRef.current;
      if (!bar) return startDate;
      const rect = bar.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      const ms = startDate.getTime() + ratio * (activeDeliveryDate.getTime() - startDate.getTime());
      return new Date(ms);
    },
    [startDate, activeDeliveryDate]
  );

  const handleDragMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingRef.current) return;
      const date = positionToDate(e.clientX);
      if (draggingRef.current === 'finalDesign') {
        setFinalDesignDate(date);
      } else {
        setFinalSelectionDate(date);
      }
    },
    [positionToDate]
  );

  const handleDragEnd = useCallback(() => {
    draggingRef.current = null;
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  const startDrag = useCallback(
    (which: 'finalDesign' | 'finalSelection', e: React.MouseEvent) => {
      e.preventDefault();
      draggingRef.current = which;
      document.body.style.cursor = 'grabbing';
      const date = positionToDate(e.clientX);
      if (which === 'finalDesign') {
        setFinalDesignDate(date);
      } else {
        setFinalSelectionDate(date);
      }
    },
    [positionToDate]
  );

  // Save to Supabase (insert or update)
  const handleSave = useCallback(async () => {
    if (!itemName.trim()) {
      setSaveError('Please enter a procurement item name.');
      return;
    }
    if (!session?.user?.id) {
      setSaveError('You must be logged in to save.');
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    const payload = {
      user_id: session.user.id,
      name: itemName.trim(),
      description: itemDescription.trim() || null,
      delivery_date: toInputDate(activeDeliveryDate),
      timeline_data: data,
      final_design_enabled: finalDesignEnabled,
      final_design_date: finalDesignDate ? toInputDate(finalDesignDate) : null,
      final_selection_enabled: finalSelectionEnabled,
      final_selection_date: finalSelectionDate ? toInputDate(finalSelectionDate) : null,
      status,
      baseline_count: baselineCount,
    };

    let error;
    if (editId) {
      ({ error } = await supabase.from('procurement_timelines').update(payload).eq('id', editId));
    } else {
      ({ error } = await supabase.from('procurement_timelines').insert(payload));
    }

    setSaving(false);

    if (error) {
      setSaveError(error.message);
      return;
    }

    if (editId) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } else {
      // Reset form for next item
      setItemName('');
      setItemDescription('');
      setReviewRounds(3);
      setData(buildTimeline(3));
      setDeliveryDate(new Date(2026, 11, 1));
      setFinalDesignEnabled(false);
      setFinalDesignDate(null);
      setFinalSelectionEnabled(false);
      setFinalSelectionDate(null);
      setShowTable(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }, [
    itemName, itemDescription, activeDeliveryDate, data, session, status, baselineCount,
    finalDesignEnabled, finalDesignDate, finalSelectionEnabled, finalSelectionDate, editId,
  ]);

  // Set baseline
  const handleSetBaseline = useCallback(async () => {
    if (!editId || !session?.user?.id) {
      setSaveError('Save the item first before setting a baseline.');
      return;
    }

    const newBaselineNumber = baselineCount + 1;
    const snapshot = {
      name: itemName,
      description: itemDescription,
      delivery_date: toInputDate(activeDeliveryDate),
      start_date: toInputDate(startDate),
      timeline_data: data,
      final_design_enabled: finalDesignEnabled,
      final_design_date: finalDesignDate ? toInputDate(finalDesignDate) : null,
      final_selection_enabled: finalSelectionEnabled,
      final_selection_date: finalSelectionDate ? toInputDate(finalSelectionDate) : null,
      review_rounds: reviewRounds,
    };

    const { error: baselineError } = await supabase.from('timeline_baselines').insert({
      timeline_id: editId,
      baseline_number: newBaselineNumber,
      snapshot,
      created_by: session.user.id,
    });

    if (baselineError) {
      setSaveError(baselineError.message);
      return;
    }

    // Update the timeline status to active and increment baseline count
    const newStatus = 'active' as const;
    const { error: updateError } = await supabase
      .from('procurement_timelines')
      .update({ status: newStatus, baseline_count: newBaselineNumber })
      .eq('id', editId);

    if (updateError) {
      setSaveError(updateError.message);
      return;
    }

    setStatus(newStatus);
    setBaselineCount(newBaselineNumber);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, [
    editId, session, baselineCount, itemName, itemDescription, activeDeliveryDate,
    startDate, data, finalDesignEnabled, finalDesignDate, finalSelectionEnabled,
    finalSelectionDate, reviewRounds,
  ]);

  const isComplete = status === 'complete';
  const isActive = status === 'active';
  const pageTitle = editId ? `Edit: ${itemName || 'Procurement Item'}` : 'Enter Procurement Item';

  if (loading) {
    return (
      <AppLayout pageTitle="Loading...">
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Loading procurement item...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={pageTitle}>
      <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
        {/* Status badge */}
        {editId && (
          <div className="mb-4 flex items-center gap-3">
            <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
              status === 'draft' ? 'bg-slate-100 text-slate-600' :
              status === 'active' ? 'bg-blue-100 text-blue-700' :
              'bg-green-100 text-green-700'
            }`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {baselineCount > 0 && (
              <span className="text-xs text-slate-500">
                {baselineCount} baseline{baselineCount > 1 ? 's' : ''} set
              </span>
            )}
          </div>
        )}

        {/* Warning: start before today */}
        {startBeforeToday && status !== 'draft' && (
          <div className="mb-4 rounded-md bg-amber-50 border border-amber-200 px-4 py-3">
            <p className="text-sm font-medium text-amber-800">
              This timeline requires starting {workdaysBehind} working day{workdaysBehind !== 1 ? 's' : ''} before today.
            </p>
            <p className="text-sm text-amber-700 mt-1">
              Planned start: {formatDate(naiveStartDate)} — Today: {formatDate(today)}
            </p>
          </div>
        )}

        {/* Item name, description, and review rounds */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Procurement Item Name *
            </label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="e.g., Structural Steel"
              disabled={isComplete}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Description
            </label>
            <input
              type="text"
              value={itemDescription}
              onChange={(e) => setItemDescription(e.target.value)}
              placeholder="Optional notes"
              disabled={isComplete}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Review Rounds
            </label>
            <select
              value={reviewRounds}
              onChange={(e) => handleReviewRoundsChange(Number(e.target.value))}
              disabled={isComplete || isActive}
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
            >
              <option value={1}>1 Round</option>
              <option value={2}>2 Rounds</option>
              <option value={3}>3 Rounds</option>
            </select>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">
              {itemName || 'Procurement Timeline'}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {isStartInPast
                ? 'Start date is locked. Duration changes will adjust the delivery date.'
                : 'Delivery date is fixed. Duration changes will adjust the start date.'}
              {' '}All durations are in working days (Mon–Fri).
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Delivered - Ready for Install
            </label>
            <input
              type="date"
              value={toInputDate(activeDeliveryDate)}
              onChange={handleDeliveryDateChange}
              disabled={isComplete || isStartInPast}
              className="rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
            />
            {isStartInPast && (
              <p className="mt-1 text-xs text-slate-400">Calculated from locked start date</p>
            )}
          </div>
        </div>

        {/* Owner/Architect milestone controls */}
        <div className="mb-4 flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="finalDesign"
              checked={finalDesignEnabled}
              onChange={(e) => {
                setFinalDesignEnabled(e.target.checked);
                if (!e.target.checked) setFinalDesignDate(null);
              }}
              disabled={isComplete}
              className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
            />
            <label htmlFor="finalDesign" className="text-sm font-medium text-slate-700">
              Final Design
            </label>
            {finalDesignEnabled && (
              <input
                type="date"
                value={finalDesignDate ? toInputDate(finalDesignDate) : ''}
                min={toInputDate(startDate)}
                max={toInputDate(activeDeliveryDate)}
                onChange={(e) => {
                  const d = new Date(e.target.value + 'T00:00:00');
                  if (!isNaN(d.getTime())) setFinalDesignDate(d);
                }}
                disabled={isComplete}
                className="ml-1 rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] disabled:bg-slate-50 disabled:text-slate-400"
              />
            )}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="finalSelection"
              checked={finalSelectionEnabled}
              onChange={(e) => {
                setFinalSelectionEnabled(e.target.checked);
                if (!e.target.checked) setFinalSelectionDate(null);
              }}
              disabled={isComplete}
              className="h-4 w-4 rounded border-slate-300 text-[#1e3a5f] focus:ring-[#1e3a5f]"
            />
            <label htmlFor="finalSelection" className="text-sm font-medium text-slate-700">
              Final Selection
            </label>
            {finalSelectionEnabled && (
              <input
                type="date"
                value={finalSelectionDate ? toInputDate(finalSelectionDate) : ''}
                min={toInputDate(startDate)}
                max={toInputDate(activeDeliveryDate)}
                onChange={(e) => {
                  const d = new Date(e.target.value + 'T00:00:00');
                  if (!isNaN(d.getTime())) setFinalSelectionDate(d);
                }}
                disabled={isComplete}
                className="ml-1 rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] disabled:bg-slate-50 disabled:text-slate-400"
              />
            )}
          </div>
        </div>

        <div>
          <div className="mb-2 flex justify-between text-xs text-slate-400">
            <span>{formatDate(startDate)}</span>
            <span>{totalWorkdays} working days</span>
            <span>{formatDate(activeDeliveryDate)}</span>
          </div>

          <div
            ref={barRef}
            className="relative flex h-8 rounded-md overflow-visible select-none"
            style={{ marginTop: '1.5rem' }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {/* Today indicator */}
            {(() => {
              const pos = getDatePosition(today);
              if (pos === null) return null;
              return (
                <div
                  className="absolute z-30 pointer-events-none"
                  style={{
                    left: `${pos}%`,
                    bottom: 0,
                    height: 'calc(100% + 1.5rem)',
                    borderLeft: '1px dashed #b0b8c4',
                  }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-400">
                    You Are Here
                  </span>
                </div>
              );
            })()}

            {/* Owner/Architect milestones — extend above the bar */}
            {finalDesignEnabled && finalDesignDate && (() => {
              const pos = getDatePosition(finalDesignDate);
              if (pos === null) return null;
              return (
                <div
                  key="finalDesign"
                  className="absolute w-1 z-20 hover:w-2 transition-all"
                  style={{
                    left: `${pos}%`,
                    bottom: '100%',
                    height: '1rem',
                    backgroundColor: '#1e3a5f',
                    cursor: isComplete ? 'default' : 'grab',
                  }}
                  onMouseDown={isComplete ? undefined : (e) => startDrag('finalDesign', e)}
                  onMouseEnter={(e) => {
                    setTooltip({
                      name: 'Final Design',
                      startDate: formatDate(finalDesignDate),
                      endDate: formatDate(finalDesignDate),
                      duration: 0,
                      isMilestone: true,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[#1e3a5f]">
                    FD
                  </span>
                </div>
              );
            })()}
            {finalSelectionEnabled && finalSelectionDate && (() => {
              const pos = getDatePosition(finalSelectionDate);
              if (pos === null) return null;
              return (
                <div
                  key="finalSelection"
                  className="absolute w-1 z-20 hover:w-2 transition-all"
                  style={{
                    left: `${pos}%`,
                    bottom: '100%',
                    height: '1rem',
                    backgroundColor: '#1e3a5f',
                    cursor: isComplete ? 'default' : 'grab',
                  }}
                  onMouseDown={isComplete ? undefined : (e) => startDrag('finalSelection', e)}
                  onMouseEnter={(e) => {
                    setTooltip({
                      name: 'Final Selection',
                      startDate: formatDate(finalSelectionDate),
                      endDate: formatDate(finalSelectionDate),
                      duration: 0,
                      isMilestone: true,
                      x: e.clientX,
                      y: e.clientY,
                    });
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-medium text-[#1e3a5f]">
                    FS
                  </span>
                </div>
              );
            })()}

            {/* Contractor milestones & tasks — on/below the bar */}
            {segments.map((seg, i) =>
              seg.milestone ? (
                <div
                  key={i}
                  className="absolute top-0 w-1 z-10 hover:w-2 transition-all"
                  style={{
                    left: `${seg.offset}%`,
                    height: '3rem',
                    backgroundColor: seg.color,
                  }}
                  onMouseEnter={(e) => handleMouseEnter(i, e)}
                  onMouseLeave={handleMouseLeave}
                />
              ) : (
                <div
                  key={i}
                  className="flex items-center justify-center h-8 overflow-hidden"
                  style={{
                    width: `${seg.width}%`,
                    backgroundColor: seg.color,
                  }}
                  onMouseEnter={(e) => handleMouseEnter(i, e)}
                  onMouseLeave={handleMouseLeave}
                />
              )
            )}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTable(!showTable)}
              className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
            >
              {showTable ? 'Hide Details ▲' : 'Edit Details ▼'}
            </button>
          </div>
        </div>

        {showTable && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Task</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Type</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Duration</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Planned Start</th>
                  <th className="py-2 pr-4 text-left font-medium text-slate-600">Planned End</th>
                  {isActive && (
                    <>
                      <th className="py-2 pr-4 text-left font-medium text-slate-600">Status</th>
                      <th className="py-2 pr-4 text-left font-medium text-slate-600">Actual Start</th>
                      <th className="py-2 text-left font-medium text-slate-600">Actual Finish</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody>
                {segments.map((seg, i) => (
                  <tr key={i} className="border-b border-slate-100">
                    <td className="py-2 pr-4 text-slate-900">{seg.name}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {seg.milestone ? 'Milestone' : 'Task'}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {seg.milestone ? (
                        '—'
                      ) : (
                        <input
                          type="number"
                          min="1"
                          value={seg.days}
                          onChange={(e) => handleDurationChange(i, e.target.value)}
                          disabled={isComplete || (data[i]?.task_status === 'complete')}
                          className="w-20 rounded border border-slate-200 px-2 py-1 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50 disabled:text-slate-400"
                        />
                      )}
                    </td>
                    <td className="py-2 pr-4 text-slate-600">{formatDate(seg.startDate)}</td>
                    <td className="py-2 pr-4 text-slate-600">{formatDate(seg.endDate)}</td>
                    {isActive && !seg.milestone && (
                      <>
                        <td className="py-2 pr-4">
                          <select
                            value={data[i]?.task_status || 'not_started'}
                            onChange={(e) => handleTaskStatusChange(i, e.target.value as 'not_started' | 'in_progress' | 'complete')}
                            disabled={isComplete || data[i]?.task_status === 'complete'}
                            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
                          >
                            <option value="not_started">Not Started</option>
                            <option value="in_progress">In Progress</option>
                            <option value="complete">Complete</option>
                          </select>
                        </td>
                        <td className="py-2 pr-4">
                          <input
                            type="date"
                            value={data[i]?.actual_start || ''}
                            onChange={(e) => handleActualDateChange(i, 'actual_start', e.target.value)}
                            disabled={isComplete || data[i]?.task_status === 'complete'}
                            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
                          />
                        </td>
                        <td className="py-2">
                          <input
                            type="date"
                            value={data[i]?.actual_finish || ''}
                            onChange={(e) => handleActualDateChange(i, 'actual_finish', e.target.value)}
                            disabled={isComplete || data[i]?.task_status === 'complete'}
                            className="rounded border border-slate-200 px-2 py-1 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:bg-slate-50"
                          />
                        </td>
                      </>
                    )}
                    {isActive && seg.milestone && (
                      <>
                        <td className="py-2 pr-4 text-slate-400">—</td>
                        <td className="py-2 pr-4 text-slate-400">—</td>
                        <td className="py-2 text-slate-400">—</td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-6">
          <div className="flex items-center gap-3">
            {saveError && <p className="text-sm text-red-600">{saveError}</p>}
            {saveSuccess && <p className="text-sm text-green-600">Saved successfully!</p>}
          </div>
          <div className="flex items-center gap-3">
            {editId && status === 'draft' && (
              <button
                onClick={handleSetBaseline}
                className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Set Baseline
              </button>
            )}
            {editId && status === 'active' && (
              <button
                onClick={handleSetBaseline}
                className="rounded-md border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
              >
                Set Baseline {baselineCount + 1}
              </button>
            )}
            <button
              onClick={() => navigate('/demo/procurement-timeline')}
              className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              + New Item
            </button>
            {!isComplete && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-slate-800 px-6 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving...' : editId ? 'Save Changes' : 'Send to Procurement Timeline'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit reason modal */}
      {editReasonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="rounded-lg bg-white p-6 shadow-xl border border-slate-200 w-full max-w-md">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Reason for Change</h3>
            <p className="text-sm text-slate-600 mb-1">
              <strong>{editReasonModal.taskName}</strong> — {editReasonModal.field}
            </p>
            <p className="text-sm text-slate-500 mb-4">
              {editReasonModal.oldValue} → {editReasonModal.newValue}
            </p>
            <textarea
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              placeholder="Enter the reason for this change..."
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 mb-4"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => { setEditReasonModal(null); setEditReason(''); }}
                className="rounded-md border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitEditReason}
                disabled={!editReason.trim()}
                className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 transition-colors"
              >
                Apply Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-md border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-slate-900">{tooltip.name}</p>
          {tooltip.isMilestone ? (
            <p className="text-slate-600">Milestone: {tooltip.startDate}</p>
          ) : (
            <>
              <p className="text-slate-600">{tooltip.startDate} — {tooltip.endDate}</p>
              <p className="text-slate-600">{tooltip.duration} working days</p>
            </>
          )}
        </div>
      )}
    </AppLayout>
  );
}
