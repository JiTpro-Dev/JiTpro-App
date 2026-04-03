import { Link } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';

export function CompanyHome() {
  return (
    <>
      <PageHeader
        title="Company Home"
        stats="1 active project · 0 at risk · 0 awaiting activation"
      />
      <div className="p-5">
        {/* Summary cards row */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SummaryCard label="Active Projects" value="1" detail="in progress" />
          <SummaryCard label="Needing Attention" value="4" detail="items missing design" />
          <SummaryCard label="Waiting on External" value="3" detail="pending selections" />
          <SummaryCard label="Completed Projects" value="0" detail="none yet" />
        </div>

        {/* Main content + right rail */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <ContentCard title="Active Projects">
              <Link
                to="/app/projects"
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">Maple St Residence</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">12 procurement items · 5 ready · 3 pending · 4 missing</div>
                </div>
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">Active</span>
              </Link>
            </ContentCard>
            <ContentCard title="Recent Activity">
              <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                No recent activity
              </div>
            </ContentCard>
          </div>
          <div>
            <ContentCard title="Quick Actions">
              <div className="space-y-2">
                <Link
                  to="/app/projects"
                  className="block w-full rounded-md bg-slate-800 px-4 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-slate-700"
                >
                  Open Project
                </Link>
                <button
                  className="w-full rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-400 cursor-not-allowed"
                  disabled
                >
                  Create New Project
                </button>
                <p className="text-[9px] text-slate-400 text-center">Project creation coming soon</p>
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
