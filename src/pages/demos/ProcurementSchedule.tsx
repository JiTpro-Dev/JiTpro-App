import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AppLayout } from '../../layouts/AppLayout';
import { supabase } from '../../../supabase/client';

interface TimelineItem {
  name: string;
  days: number;
  color: string;
  milestone?: boolean;
}

interface SavedTimeline {
  id: string;
  name: string;
  delivery_date: string;
  status: string;
  timeline_data: TimelineItem[];
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

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function daysBetween(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDateFull(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

type ZoomLevel = 'quarters' | 'months' | 'weeks' | 'days';

function getEffectiveWorkdays(data: TimelineItem[]): number {
  return data.reduce((sum, d) => sum + (d.days > 0 ? d.days + 1 : 0), 0);
}

function getStartDate(deliveryDate: Date, data: TimelineItem[]): Date {
  return subtractWorkdays(deliveryDate, getEffectiveWorkdays(data));
}

// Build calendar header ticks based on zoom level
function buildTicks(chartStart: Date, chartEnd: Date, zoom: ZoomLevel): { date: Date; label: string }[] {
  const ticks: { date: Date; label: string }[] = [];
  const d = new Date(chartStart);

  if (zoom === 'days') {
    while (d <= chartEnd) {
      ticks.push({ date: new Date(d), label: formatDateShort(d) });
      d.setDate(d.getDate() + 1);
    }
  } else if (zoom === 'weeks') {
    // Align to Monday
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    while (d <= chartEnd) {
      ticks.push({ date: new Date(d), label: formatDateShort(d) });
      d.setDate(d.getDate() + 7);
    }
  } else if (zoom === 'months') {
    d.setDate(1);
    if (d < chartStart) d.setMonth(d.getMonth() + 1);
    while (d <= chartEnd) {
      ticks.push({
        date: new Date(d),
        label: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      });
      d.setMonth(d.getMonth() + 1);
    }
  } else {
    // quarters
    d.setDate(1);
    d.setMonth(Math.floor(d.getMonth() / 3) * 3);
    if (d < chartStart) d.setMonth(d.getMonth() + 3);
    while (d <= chartEnd) {
      const q = Math.floor(d.getMonth() / 3) + 1;
      ticks.push({
        date: new Date(d),
        label: `Q${q} ${d.getFullYear()}`,
      });
      d.setMonth(d.getMonth() + 3);
    }
  }

  return ticks;
}

// Build sub-divider lines (finer grid within the main ticks)
function buildSubTicks(chartStart: Date, chartEnd: Date, zoom: ZoomLevel): Date[] {
  const ticks: Date[] = [];
  const d = new Date(chartStart);

  if (zoom === 'quarters') {
    // Show week lines in quarter view
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    while (d <= chartEnd) {
      ticks.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else if (zoom === 'months') {
    // Show week lines in month view
    while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
    while (d <= chartEnd) {
      ticks.push(new Date(d));
      d.setDate(d.getDate() + 7);
    }
  } else if (zoom === 'weeks') {
    // Show day lines in week view
    while (d <= chartEnd) {
      ticks.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
  }
  // Days view already shows every day as a main tick, no sub-ticks needed

  return ticks;
}

// Build weekend day ranges for shading
function buildWeekendBands(chartStart: Date, chartEnd: Date, totalDays: number): { left: number; width: number }[] {
  const bands: { left: number; width: number }[] = [];
  const d = new Date(chartStart);

  while (d <= chartEnd) {
    const day = d.getDay();
    if (day === 6) {
      // Saturday — shade Sat + Sun as one band
      const satPos = (daysBetween(chartStart, d) / totalDays) * 100;
      const bandWidth = (2 / totalDays) * 100; // 2 days wide
      bands.push({ left: satPos, width: bandWidth });
    }
    d.setDate(d.getDate() + 1);
  }

  return bands;
}

interface BarSegment {
  offset: number;
  width: number;
  color: string;
  name: string;
  days: number;
  startDate: Date;
  endDate: Date;
}

// Compute segment positions within a bar, including dates
function computeBarSegments(data: TimelineItem[], totalWorkdays: number, timelineStart: Date): BarSegment[] {
  const segments: BarSegment[] = [];
  let cumDays = 0;
  let currentDate = new Date(timelineStart);

  for (const item of data) {
    const segStart = new Date(currentDate);

    if (item.days > 0) {
      const segEnd = addWorkdays(segStart, item.days);
      const offset = totalWorkdays > 0 ? (cumDays / totalWorkdays) * 100 : 0;
      const width = totalWorkdays > 0 ? (item.days / totalWorkdays) * 100 : 0;
      segments.push({ offset, width, color: item.color, name: item.name, days: item.days, startDate: segStart, endDate: segEnd });
      currentDate = nextWorkday(addWorkdays(segStart, item.days + 1));
    } else {
      currentDate = nextWorkday(new Date(segStart));
    }
    cumDays += item.days;
  }

  return segments;
}

const statusOrder: Record<string, number> = { draft: 0, active: 1, complete: 2 };

export function ProcurementSchedule() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sortBy = searchParams.get('sort') || 'delivery_asc';
  const [timelines, setTimelines] = useState<SavedTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState<ZoomLevel>('quarters');
  const [tooltip, setTooltip] = useState<{
    itemName: string;
    phaseName: string;
    startDate: string;
    endDate: string;
    days: number;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    supabase
      .from('procurement_timelines')
      .select('id, name, delivery_date, status, timeline_data')
      .order('delivery_date', { ascending: true })
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
        } else {
          setTimelines((data as SavedTimeline[]) || []);
        }
        setLoading(false);
      });
  }, []);

  // Compute each timeline's start and end dates, then sort
  const itemRanges = useMemo(() => {
    const items = timelines.map((tl) => {
      const delivery = new Date(tl.delivery_date + 'T00:00:00');
      const start = getStartDate(delivery, tl.timeline_data);
      const totalWorkdays = tl.timeline_data.reduce((s, d) => s + d.days, 0);
      return { ...tl, start, delivery, totalWorkdays };
    });

    items.sort((a, b) => {
      switch (sortBy) {
        case 'delivery_asc': return a.delivery.getTime() - b.delivery.getTime();
        case 'delivery_desc': return b.delivery.getTime() - a.delivery.getTime();
        case 'start_asc': return a.start.getTime() - b.start.getTime();
        case 'start_desc': return b.start.getTime() - a.start.getTime();
        case 'duration_desc': return b.totalWorkdays - a.totalWorkdays;
        case 'duration_asc': return a.totalWorkdays - b.totalWorkdays;
        case 'status': return (statusOrder[a.status] ?? 0) - (statusOrder[b.status] ?? 0);
        case 'name_asc': return a.name.localeCompare(b.name);
        case 'name_desc': return b.name.localeCompare(a.name);
        default: return 0;
      }
    });

    return items;
  }, [timelines, sortBy]);

  // Chart date range: 2 weeks before earliest start, 2 weeks after latest delivery
  const { chartStart, chartEnd, totalDays } = useMemo(() => {
    if (itemRanges.length === 0) {
      const now = new Date();
      return { chartStart: now, chartEnd: addDays(now, 90), totalDays: 90 };
    }
    const earliest = itemRanges.reduce((min, r) => (r.start < min ? r.start : min), itemRanges[0].start);
    const latest = itemRanges.reduce((max, r) => (r.delivery > max ? r.delivery : max), itemRanges[0].delivery);
    const cs = addDays(earliest, -14);
    const ce = addDays(latest, 14);
    return { chartStart: cs, chartEnd: ce, totalDays: daysBetween(cs, ce) };
  }, [itemRanges]);

  const ticks = useMemo(() => buildTicks(chartStart, chartEnd, zoom), [chartStart, chartEnd, zoom]);
  const subTicks = useMemo(() => buildSubTicks(chartStart, chartEnd, zoom), [chartStart, chartEnd, zoom]);
  const weekendBands = useMemo(() => buildWeekendBands(chartStart, chartEnd, totalDays), [chartStart, chartEnd, totalDays]);

  const todayPos = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = daysBetween(chartStart, today);
    if (d < 0 || d > totalDays) return null;
    return (d / totalDays) * 100;
  }, [chartStart, totalDays]);

  // Minimum chart width based on zoom level
  const chartMinWidth = useMemo(() => {
    if (zoom === 'days') return Math.max(totalDays * 30, 800);
    if (zoom === 'weeks') return Math.max((totalDays / 7) * 80, 800);
    if (zoom === 'months') return Math.max((totalDays / 30) * 120, 800);
    return 800; // quarters
  }, [zoom, totalDays]);

  // Resizable label column
  const [labelWidth, setLabelWidth] = useState(224); // 14rem default
  const draggingCol = useRef(false);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(0);
  const labelColRef = useRef<HTMLDivElement>(null);

  const handleColDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    draggingCol.current = true;
    dragStartX.current = e.clientX;
    dragStartWidth.current = labelWidth;
    document.body.style.cursor = 'col-resize';
  }, [labelWidth]);

  const handleColDragMove = useCallback((e: MouseEvent) => {
    if (!draggingCol.current) return;
    const delta = e.clientX - dragStartX.current;
    setLabelWidth(Math.max(120, Math.min(600, dragStartWidth.current + delta)));
  }, []);

  const handleColDragEnd = useCallback(() => {
    draggingCol.current = false;
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleColDragMove);
    document.addEventListener('mouseup', handleColDragEnd);
    return () => {
      document.removeEventListener('mousemove', handleColDragMove);
      document.removeEventListener('mouseup', handleColDragEnd);
    };
  }, [handleColDragMove, handleColDragEnd]);

  // Double-click to auto-fit column width to longest item name
  const handleColAutoFit = useCallback(() => {
    if (!labelColRef.current) return;
    // Measure the widest text using a hidden element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.font = '14px ui-sans-serif, system-ui, sans-serif';
    let maxWidth = 0;
    for (const item of itemRanges) {
      const width = ctx.measureText(item.name).width;
      if (width > maxWidth) maxWidth = width;
    }
    // Add padding (16px left + 16px right + 8px drag handle)
    setLabelWidth(Math.max(120, Math.min(600, Math.ceil(maxWidth + 40))));
  }, [itemRanges]);

  const handleBarClick = useCallback((id: string) => {
    navigate(`/demo/procurement-timeline?id=${id}`);
  }, [navigate]);

  if (loading) {
    return (
      <AppLayout pageTitle="Procurement Schedule" fullWidth>
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
          <p className="text-sm text-slate-500">Loading schedule...</p>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout pageTitle="Procurement Schedule" fullWidth>
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Procurement Schedule" fullWidth>
      <div className="rounded-lg bg-white shadow-sm border border-slate-200 flex flex-col" style={{ height: 'calc(100vh - 10rem)' }}>
        {/* Header — fixed, not scrollable */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Procurement Schedule</h2>
            <p className="mt-1 text-sm text-slate-600">
              {itemRanges.length} procurement item{itemRanges.length !== 1 ? 's' : ''}
              {' '}&middot; Click a bar to edit
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-md border border-slate-200 p-1">
            {(['quarters', 'months', 'weeks', 'days'] as ZoomLevel[]).map((z) => (
              <button
                key={z}
                onClick={() => setZoom(z)}
                className={`rounded px-3 py-1 text-xs font-medium transition-colors ${
                  zoom === z
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {z.charAt(0).toUpperCase() + z.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {itemRanges.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            No procurement items yet. Create one from the Demos page.
          </p>
        ) : (
          <div className="flex flex-col flex-1 min-h-0 overflow-x-auto">
            <div style={{ minWidth: chartMinWidth }} className="flex flex-col flex-1 min-h-0">
              {/* Calendar header — pinned */}
              <div className="flex border-b border-slate-200 flex-shrink-0 bg-white z-20">
                {/* Label column */}
                <div
                  ref={labelColRef}
                  className="flex-shrink-0 py-2 text-xs font-medium text-slate-500 relative select-none"
                  style={{ width: labelWidth }}
                >
                  <span className="pl-2">Item</span>
                  {/* Drag handle */}
                  <div
                    className="absolute top-0 right-0 h-full w-2 cursor-col-resize border-r border-slate-200 hover:border-slate-400 hover:bg-slate-100 transition-colors"
                    onMouseDown={handleColDragStart}
                    onDoubleClick={handleColAutoFit}
                  />
                </div>
                {/* Timeline header */}
                <div className="flex-1 relative h-8 overflow-hidden">
                  {/* Weekend shading */}
                  {weekendBands.map((band, i) => (
                    <div
                      key={`wh-${i}`}
                      className="absolute top-0 h-full bg-slate-100/60"
                      style={{ left: `${band.left}%`, width: `${band.width}%` }}
                    />
                  ))}
                  {/* Sub-tick lines */}
                  {subTicks.map((date, i) => {
                    const pos = (daysBetween(chartStart, date) / totalDays) * 100;
                    return (
                      <div
                        key={`st-${i}`}
                        className="absolute top-0 h-full border-l border-slate-100/70"
                        style={{ left: `${pos}%` }}
                      />
                    );
                  })}
                  {/* Main tick lines */}
                  {ticks.map((tick, i) => {
                    const pos = (daysBetween(chartStart, tick.date) / totalDays) * 100;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 h-full border-l border-slate-200"
                        style={{ left: `${pos}%` }}
                      >
                        <span className="absolute top-1 left-1 whitespace-nowrap text-[10px] text-slate-400">
                          {tick.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Scrollable rows area */}
              <div className="flex-1 overflow-y-auto min-h-0">
              {itemRanges.map((item) => {
                const barLeft = (daysBetween(chartStart, item.start) / totalDays) * 100;
                const barWidth = (daysBetween(item.start, item.delivery) / totalDays) * 100;
                const barSegments = computeBarSegments(item.timeline_data, item.totalWorkdays, item.start);

                return (
                  <div
                    key={item.id}
                    className="flex border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Label */}
                    <div
                      className="flex-shrink-0 py-3 flex items-center bg-white relative select-none"
                      style={{ width: labelWidth }}
                    >
                      <div className="min-w-0 pl-2 pr-4">
                        <p className="text-sm font-medium text-slate-900 truncate">{item.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {formatDateFull(item.start)} — {formatDateFull(item.delivery)}
                        </p>
                      </div>
                      <div
                        className="absolute top-0 right-0 h-full w-2 cursor-col-resize border-r border-slate-200 hover:border-slate-400 hover:bg-slate-100 transition-colors"
                        onMouseDown={handleColDragStart}
                        onDoubleClick={handleColAutoFit}
                      />
                    </div>
                    {/* Bar area */}
                    <div className="flex-1 relative py-3 overflow-hidden">
                      {/* Weekend shading */}
                      {weekendBands.map((band, i) => (
                        <div
                          key={`wr-${i}`}
                          className="absolute top-0 h-full bg-slate-100/60"
                          style={{ left: `${band.left}%`, width: `${band.width}%` }}
                        />
                      ))}
                      {/* Sub-tick grid lines */}
                      {subTicks.map((date, i) => {
                        const pos = (daysBetween(chartStart, date) / totalDays) * 100;
                        return (
                          <div
                            key={`sr-${i}`}
                            className="absolute top-0 h-full border-l border-slate-100/70"
                            style={{ left: `${pos}%` }}
                          />
                        );
                      })}
                      {/* Main grid lines */}
                      {ticks.map((tick, i) => {
                        const pos = (daysBetween(chartStart, tick.date) / totalDays) * 100;
                        return (
                          <div
                            key={i}
                            className="absolute top-0 h-full border-l border-slate-200/50"
                            style={{ left: `${pos}%` }}
                          />
                        );
                      })}

                      {/* Today line */}
                      {todayPos !== null && (
                        <div
                          className="absolute top-0 h-full z-10 pointer-events-none"
                          style={{
                            left: `${todayPos}%`,
                            borderLeft: '1px dashed #b0b8c4',
                          }}
                        />
                      )}

                      {/* The bar */}
                      <div
                        className="absolute h-5 rounded-sm cursor-pointer overflow-hidden hover:opacity-90 transition-opacity"
                        style={{
                          left: `${Math.max(0, barLeft)}%`,
                          width: `${Math.max(0.5, barWidth)}%`,
                          top: '50%',
                          transform: 'translateY(-50%)',
                        }}
                        onClick={() => handleBarClick(item.id)}
                      >
                        {/* Colored segments */}
                        <div className="relative w-full h-full flex">
                          {barSegments.map((seg, si) => (
                            <div
                              key={si}
                              className="h-full"
                              style={{
                                width: `${seg.width}%`,
                                backgroundColor: seg.color,
                              }}
                              onMouseEnter={(e) => {
                                setTooltip({
                                  itemName: item.name,
                                  phaseName: seg.name,
                                  startDate: formatDateFull(seg.startDate),
                                  endDate: formatDateFull(seg.endDate),
                                  days: seg.days,
                                  x: e.clientX,
                                  y: e.clientY,
                                });
                              }}
                              onMouseMove={(e) => {
                                setTooltip((prev) => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
                              }}
                              onMouseLeave={() => setTooltip(null)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Today label in header area */}
              {todayPos !== null && (
                <div className="relative h-0">
                  <div
                    className="absolute pointer-events-none"
                    style={{ left: `calc(12rem + ${todayPos}% * calc(100% - 12rem) / 100%)` }}
                  >
                  </div>
                </div>
              )}
              </div>{/* end scrollable rows */}
            </div>
          </div>
        )}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none rounded-md border border-slate-200 bg-white px-3 py-2 shadow-lg text-sm"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-semibold text-slate-900">{tooltip.itemName}</p>
          <p className="text-slate-700">{tooltip.phaseName}</p>
          <p className="text-slate-600">{tooltip.startDate} — {tooltip.endDate}</p>
          <p className="text-slate-600">{tooltip.days} working days</p>
        </div>
      )}
    </AppLayout>
  );
}
