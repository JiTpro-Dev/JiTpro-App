import { PageHeader } from '../../components/PageHeader';

export function ProjectHome() {
  return (
    <>
      <PageHeader
        title="Project Home"
        stats="Maple St Residence · Active"
      />
      <div className="p-5">
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SummaryCard label="Total Items" value="12" detail="in scope builder" />
          <SummaryCard label="Ready" value="5" detail="ready for procurement" />
          <SummaryCard label="Pending" value="3" detail="awaiting selection" />
          <SummaryCard label="Missing" value="4" detail="missing design" />
        </div>

        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <ContentCard title="Scope Builder Summary">
              <div className="space-y-2">
                <StatusRow label="Furnishings" ready={2} pending={1} missing={1} />
                <StatusRow label="Metals" ready={1} pending={0} missing={1} />
                <StatusRow label="Finishes" ready={0} pending={2} missing={1} />
                <StatusRow label="Concrete" ready={0} pending={0} missing={1} />
                <StatusRow label="Equipment" ready={1} pending={0} missing={0} />
                <StatusRow label="Openings" ready={1} pending={0} missing={0} />
              </div>
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
      <span className="w-24 text-[11px] font-medium text-slate-700">{label}</span>
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
