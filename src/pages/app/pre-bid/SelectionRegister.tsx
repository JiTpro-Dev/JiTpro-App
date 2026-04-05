import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { useCompany } from '../../../context/CompanyContext';
import { supabase } from '../../../../supabase/client';
import type { ProcurementItem, ItemStatus, CostCode } from './scopeBuilderTypes';
import { statusConfig, PROCUREMENT_ITEM_COLUMNS } from './scopeBuilderTypes';

type SortKey = 'name' | 'csiCode' | 'status';
type SortDir = 'asc' | 'desc';

const STATUS_ORDER: Record<ItemStatus, number> = {
  missing_design: 0,
  pending_selection: 1,
  ready: 2,
};

export function SelectionRegister() {
  const { projectId } = useParams<{ projectId: string }>();
  const { activeCompanyId } = useCompany();

  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [divisions, setDivisions] = useState<{ code: string; title: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Fetch procurement items and division list
  useEffect(() => {
    if (!projectId || !activeCompanyId) return;

    async function load() {
      setLoading(true);
      setError(null);

      // Fetch items
      const { data: itemData, error: itemErr } = await supabase
        .from('procurement_items')
        .select(PROCUREMENT_ITEM_COLUMNS)
        .eq('project_id', projectId!)
        .order('sort_order');

      if (itemErr) {
        setError('Failed to load procurement items.');
        setLoading(false);
        return;
      }

      // Fetch level-1 cost codes (divisions) for the filter dropdown
      const { data: divData, error: divErr } = await supabase
        .from('cost_codes')
        .select('code, title')
        .eq('company_id', activeCompanyId!)
        .eq('level', 1)
        .order('sort_order');

      if (divErr) {
        setError('Failed to load divisions.');
        setLoading(false);
        return;
      }

      setItems(itemData ?? []);
      setDivisions(divData ?? []);
      setLoading(false);
    }

    load();
  }, [projectId, activeCompanyId]);

  // Filtered + sorted items
  const displayItems = useMemo(() => {
    let filtered = items.filter((item) => {
      if (filterDivision && item.csi_division !== filterDivision) return false;
      if (filterStatus && item.status !== filterStatus) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          item.name.toLowerCase().includes(q) ||
          (item.description ?? '').toLowerCase().includes(q) ||
          (item.csi_code ?? '').toLowerCase().includes(q) ||
          (item.csi_label ?? '').toLowerCase().includes(q);
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
          cmp = (a.csi_code ?? '').localeCompare(b.csi_code ?? '');
          break;
        case 'status':
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return filtered;
  }, [items, search, filterDivision, filterStatus, sortKey, sortDir]);

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

  if (!projectId || !activeCompanyId) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        No project or company selected.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center text-slate-400">
        Loading selection register...
      </div>
    );
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

      {error && (
        <div className="mx-5 mt-2 rounded-md bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

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
          {divisions.map((div) => (
            <option key={div.code} value={div.code}>
              {div.code} — {div.title}
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
              <th className={thSortClass} onClick={() => handleSort('name')}>
                <span className="flex items-center">
                  Item <SortIcon col="name" />
                </span>
              </th>
              <th className={thSortClass} onClick={() => handleSort('csiCode')}>
                <span className="flex items-center">
                  CSI Code <SortIcon col="csiCode" />
                </span>
              </th>
              <th className={thSortClass} onClick={() => handleSort('status')}>
                <span className="flex items-center">
                  Status <SortIcon col="status" />
                </span>
              </th>
              <th className={thClass}>Notes</th>
            </tr>
          </thead>
          <tbody>
            {displayItems.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-[13px] text-slate-400"
                >
                  {items.length === 0
                    ? 'No procurement items yet. Add items in the Scope Builder.'
                    : 'No items match the current filters.'}
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
                    <td className="px-3 py-2.5 max-w-[260px]">
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
                      {item.csi_code ? (
                        <>
                          <span className="font-mono text-[11px] text-slate-600">
                            {item.csi_code}
                          </span>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.csi_label}</p>
                        </>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">—</span>
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

                    {/* Notes */}
                    <td className="px-3 py-2.5 max-w-[200px]">
                      {item.notes ? (
                        <p className="text-[11px] text-slate-500 line-clamp-2">{item.notes}</p>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">—</span>
                      )}
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
