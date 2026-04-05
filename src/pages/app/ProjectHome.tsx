import { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { useProject } from '../../context/ProjectContext';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';
import type { ProcurementItem, CostCode } from './pre-bid/scopeBuilderTypes';
import { PROCUREMENT_ITEM_COLUMNS } from './pre-bid/scopeBuilderTypes';

export function ProjectHome() {
  const { projectId, project, loading: projectLoading } = useProject();
  const { activeCompanyId } = useCompany();

  const [items, setItems] = useState<ProcurementItem[]>([]);
  const [divisions, setDivisions] = useState<CostCode[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId || !activeCompanyId) return;

    async function load() {
      setLoading(true);

      const [itemRes, divRes] = await Promise.all([
        supabase
          .from('procurement_items')
          .select(PROCUREMENT_ITEM_COLUMNS)
          .eq('project_id', projectId!)
          .order('sort_order'),
        supabase
          .from('cost_codes')
          .select('id, code, title, level, parent_id, sort_order')
          .eq('company_id', activeCompanyId!)
          .eq('level', 1)
          .order('sort_order'),
      ]);

      setItems(itemRes.data ?? []);
      setDivisions(divRes.data ?? []);
      setLoading(false);
    }

    load();
  }, [projectId, activeCompanyId]);

  const readyCount = items.filter((i) => i.status === 'ready').length;
  const pendingCount = items.filter((i) => i.status === 'pending_selection').length;
  const missingCount = items.filter((i) => i.status === 'missing_design').length;

  // Group items by csi_division to build per-division status rows
  const divisionStats = useMemo(() => {
    const map = new Map<string, { label: string; ready: number; pending: number; missing: number }>();

    for (const item of items) {
      const divCode = item.csi_division ?? 'Unknown';
      if (!map.has(divCode)) {
        const div = divisions.find((d) => d.code === divCode);
        map.set(divCode, { label: div?.title ?? divCode, ready: 0, pending: 0, missing: 0 });
      }
      const entry = map.get(divCode)!;
      if (item.status === 'ready') entry.ready++;
      else if (item.status === 'pending_selection') entry.pending++;
      else entry.missing++;
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, stats]) => stats);
  }, [items, divisions]);

  const projectLabel = projectLoading
    ? 'Loading...'
    : project
      ? `${project.name} · ${project.status.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}`
      : 'Project not found';

  return (
    <>
      <PageHeader
        title="Project Home"
        stats={projectLabel}
      />
      <div className="p-5">
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SummaryCard
            label="Total Items"
            value={loading ? '—' : String(items.length)}
            detail="in scope builder"
          />
          <SummaryCard
            label="Ready"
            value={loading ? '—' : String(readyCount)}
            detail="ready for procurement"
          />
          <SummaryCard
            label="Pending"
            value={loading ? '—' : String(pendingCount)}
            detail="awaiting selection"
          />
          <SummaryCard
            label="Missing"
            value={loading ? '—' : String(missingCount)}
            detail="missing design"
          />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <ContentCard title="Scope Builder Summary">
              {loading ? (
                <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                  Loading...
                </div>
              ) : divisionStats.length === 0 ? (
                <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                  No items yet. Add items in the Scope Builder.
                </div>
              ) : (
                <div className="space-y-2">
                  {divisionStats.map((row) => (
                    <StatusRow key={row.label} label={row.label} ready={row.ready} pending={row.pending} missing={row.missing} />
                  ))}
                </div>
              )}
            </ContentCard>
            <ContentCard title="Recent Activity">
              <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                Activity feed coming soon
              </div>
            </ContentCard>
          </div>
          <div>
            <ContentCard title="Control Tower">
              <div className="flex h-36 items-center justify-center rounded bg-slate-50 text-center">
                <div>
                  <p className="text-[12px] font-medium text-slate-500">Not yet activated</p>
                  <p className="mt-1 text-[10px] text-slate-400">Purchase Control Tower to unlock full procurement timeline management</p>
                </div>
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
      <div className="text-[9px] font-semibold uppercase tracking-[0.05em] text-slate-500">{label}</div>
      <div className="mt-1 text-[22px] font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500">{detail}</div>
    </div>
  );
}

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
      <div className="mb-2 text-[12px] font-semibold text-slate-900">{title}</div>
      {children}
    </div>
  );
}

function StatusRow({ label, ready, pending, missing }: { label: string; ready: number; pending: number; missing: number }) {
  const total = ready + pending + missing;
  return (
    <div className="flex items-center gap-3">
      <span className="w-24 text-[11px] font-medium text-slate-700 truncate" title={label}>{label}</span>
      <div className="flex-1">
        <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
          {ready > 0 && <div className="bg-green-400" style={{ width: `${(ready / total) * 100}%` }} />}
          {pending > 0 && <div className="bg-amber-400" style={{ width: `${(pending / total) * 100}%` }} />}
          {missing > 0 && <div className="bg-red-400" style={{ width: `${(missing / total) * 100}%` }} />}
        </div>
      </div>
      <span className="text-[10px] text-slate-400">{total}</span>
    </div>
  );
}
