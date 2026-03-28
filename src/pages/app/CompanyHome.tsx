import { PageHeader } from '../../components/PageHeader';

export function CompanyHome() {
  return (
    <>
      <PageHeader
        title="Company Home"
        stats="0 active projects · 0 at risk · 0 awaiting activation"
      />
      <div className="p-5">
        {/* Summary cards row */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SummaryCard label="My Work" value="0" detail="items assigned to you" />
          <SummaryCard label="Needing Attention" value="0" detail="across 0 projects" />
          <SummaryCard label="Waiting on External" value="0" detail="open requests" />
          <SummaryCard label="Active Projects" value="0" detail="none yet" />
        </div>

        {/* Main content + right rail */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <ContentCard title="Active Projects">
              <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                No projects yet — create your first project to get started
              </div>
            </ContentCard>
            <ContentCard title="Recent Activity">
              <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                No recent activity
              </div>
            </ContentCard>
          </div>
          <div>
            <ContentCard title="Quick Actions">
              <div className="flex h-36 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                Actions will appear here
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
