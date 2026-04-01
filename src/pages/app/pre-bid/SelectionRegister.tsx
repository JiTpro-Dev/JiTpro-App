import { useState, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import {
  sampleItems,
  sampleDivisions,
  statusConfig,
  submittalTypeLabels,
} from './sampleData';
import type { ProcurementItem, ItemStatus } from './sampleData';

type SortKey = 'name' | 'csiCode' | 'location' | 'vendor' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<ItemStatus, number> = {
  missing_design: 0,
  pending_selection: 1,
  ready: 2,
};

export function SelectionRegister() {
  const [items] = useState<ProcurementItem[]>(sampleItems);

  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Unique vendors derived from items
  const uniqueVendors = useMemo(() => {
    const vendors = items
      .map((i) => i.vendor)
      .filter((v): v is string => v !== null);
    return Array.from(new Set(vendors)).sort();
  }, [items]);

  // Unique locations derived from items
  const uniqueLocations = useMemo(() => {
    const locs = items.flatMap((i) => i.locations);
    return Array.from(new Set(locs)).sort();
  }, [items]);

  // Filtered + sorted items
  const displayItems = useMemo(() => {
    let filtered = items.filter((item) => {
      if (filterDivision && item.csiDivision !== filterDivision) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (filterVendor) {
        if (filterVendor === '__none__') {
          if (item.vendor !== null) return false;
        } else {
          if (item.vendor !== filterVendor) return false;
        }
      }
      if (filterLocation && !item.locations.includes(filterLocation)) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.csiCode.toLowerCase().includes(q) ||
          item.csiLabel.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name':
          cmp = a.name.localeCompare(b.name);
          break;
        case 'csiCode':
          cmp = a.csiCode.localeCompare(b.csiCode);
          break;
        case 'location':
          cmp = (a.locations[0] ?? '').localeCompare(b.locations[0] ?? '');
          break;
        case 'vendor':
          cmp = (a.vendor ?? '').localeCompare(b.vendor ?? '');
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [items, search, filterDivision, filterLocation, filterVendor, filterStatus, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) {
      return <ChevronDown size={12} className="ml-0.5 opacity-30" />;
    }
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="ml-0.5 text-slate-600" />
      : <ChevronDown size={12} className="ml-0.5 text-slate-600" />;
  }

  const selectClass =
    'rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500';

  const thClass =
    'text-[10px] uppercase tracking-wide text-slate-500 font-semibold px-3 py-2 text-left select-none whitespace-nowrap';
  const thSortClass = `${thClass} cursor-pointer hover:text-slate-700`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Selection Register"
        stats={`${displayItems.length} of ${items.length} items`}
      />

      {/* Filter bar */}
      <div className="border-b border-slate-200 bg-slate-50 px-5 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search items…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-200 bg-white pl-7 pr-2.5 py-1.5 text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 w-48"
          />
        </div>

        {/* CSI Division */}
        <select
          value={filterDivision}
          onChange={(e) => setFilterDivision(e.target.value)}
          className={selectClass}
        >
          <option value="">All Divisions</option>
          {sampleDivisions.map((div) => (
            <option key={div.code} value={div.code}>
              {div.code} — {div.name}
            </option>
          ))}
        </select>

        {/* Location */}
        <select
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className={selectClass}
        >
          <option value="">All Locations</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>
              {loc}
            </option>
          ))}
        </select>

        {/* Vendor */}
        <select
          value={filterVendor}
          onChange={(e) => setFilterVendor(e.target.value)}
          className={selectClass}
        >
          <option value="">All Vendors</option>
          <option value="__none__">Not Assigned</option>
          {uniqueVendors.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={selectClass}
        >
          <option value="">All Statuses</option>
          <option value="missing_design">Missing Design</option>
          <option value="pending_selection">Pending Selection</option>
          <option value="ready">Ready</option>
        </select>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
            <tr>
              <th
                className={thSortClass}
                onClick={() => handleSort('name')}
              >
                <span className="flex items-center">
                  Item <SortIcon col="name" />
                </span>
              </th>
              <th
                className={thSortClass}
                onClick={() => handleSort('csiCode')}
              >
                <span className="flex items-center">
                  CSI Code <SortIcon col="csiCode" />
                </span>
              </th>
              <th
                className={thSortClass}
                onClick={() => handleSort('location')}
              >
                <span className="flex items-center">
                  Location <SortIcon col="location" />
                </span>
              </th>
              <th
                className={thSortClass}
                onClick={() => handleSort('vendor')}
              >
                <span className="flex items-center">
                  Vendor <SortIcon col="vendor" />
                </span>
              </th>
              <th className={thClass}>Submittals</th>
              <th
                className={thSortClass}
                onClick={() => handleSort('status')}
              >
                <span className="flex items-center">
                  Status <SortIcon col="status" />
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-[13px] text-slate-400"
                >
                  No items match the current filters.
                </td>
              </tr>
            ) : (
              displayItems.map((item) => {
                const status = statusConfig[item.status];
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-slate-100 ${status.rowClass} hover:brightness-95 transition-[filter]`}
                  >
                    {/* Item name + description */}
                    <td className="px-3 py-2.5 max-w-[220px]">
                      <p className="text-[13px] font-semibold text-slate-900 leading-snug">
                        {item.name}
                      </p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 leading-snug mt-0.5 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </td>

                    {/* CSI Code */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] text-slate-600">
                        {item.csiCode}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{item.csiLabel}</p>
                    </td>

                    {/* Location */}
                    <td className="px-3 py-2.5 text-[12px] text-slate-600 max-w-[160px]">
                      {item.locations.join(', ')}
                    </td>

                    {/* Vendor */}
                    <td className="px-3 py-2.5 text-[12px]">
                      {item.vendor ? (
                        <span className="text-slate-700">{item.vendor}</span>
                      ) : (
                        <span className="italic text-slate-400">Not assigned</span>
                      )}
                    </td>

                    {/* Submittals */}
                    <td className="px-3 py-2.5">
                      {item.submittalTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {item.submittalTypes.map((type) => (
                            <span
                              key={type}
                              className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 whitespace-nowrap"
                            >
                              {submittalTypeLabels[type]}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No submittal</span>
                      )}
                    </td>

                    {/* Status badge */}
                    <td className="px-3 py-2.5 whitespace-nowrap">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${status.badgeClass}`}
                      >
                        {status.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
