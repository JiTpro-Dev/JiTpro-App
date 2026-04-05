import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

interface Project {
  id: string;
  name: string;
  status: string;
  address: string | null;
}

export function CompanyHome() {
  const { activeCompanyId } = useCompany();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeCompanyId) return;

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from('projects')
        .select('id, name, status, address')
        .eq('company_id', activeCompanyId!)
        .order('created_at', { ascending: false });

      setProjects(data ?? []);
      setLoading(false);
    }

    load();
  }, [activeCompanyId]);

  const activeProjects = projects.filter((p) => p.status === 'active');
  const completedProjects = projects.filter((p) => p.status === 'completed');
  const onHoldProjects = projects.filter((p) => p.status === 'on_hold');

  const statsText = loading
    ? 'Loading...'
    : `${activeProjects.length} active project${activeProjects.length !== 1 ? 's' : ''} · ${onHoldProjects.length} on hold · ${completedProjects.length} completed`;

  return (
    <>
      <PageHeader
        title="Company Home"
        stats={statsText}
      />
      <div className="p-5">
        {/* Summary cards row */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SummaryCard label="Active Projects" value={loading ? '—' : String(activeProjects.length)} detail="in progress" />
          <SummaryCard label="On Hold" value={loading ? '—' : String(onHoldProjects.length)} detail="paused" />
          <SummaryCard label="Completed" value={loading ? '—' : String(completedProjects.length)} detail="finished" />
          <SummaryCard label="Total Projects" value={loading ? '—' : String(projects.length)} detail="all time" />
        </div>

        {/* Main content + right rail */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <ContentCard title="Active Projects">
              {loading ? (
                <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                  Loading projects...
                </div>
              ) : activeProjects.length === 0 ? (
                <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                  No active projects. Create one to get started.
                </div>
              ) : (
                <div className="space-y-2">
                  {activeProjects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => navigate(`/app/project/${project.id}/home`)}
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-slate-900 truncate">{project.name}</div>
                        {project.address && (
                          <div className="mt-0.5 text-[11px] text-slate-500 truncate">{project.address}</div>
                        )}
                      </div>
                      <span className="ml-3 shrink-0 rounded-full bg-green-100 px-2.5 py-0.5 text-[10px] font-semibold text-green-700">
                        Active
                      </span>
                    </button>
                  ))}
                </div>
              )}
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
                  View All Projects
                </Link>
                <Link
                  to="/app/projects/new"
                  className="block w-full rounded-md border border-slate-200 px-4 py-2 text-center text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Create New Project
                </Link>
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
