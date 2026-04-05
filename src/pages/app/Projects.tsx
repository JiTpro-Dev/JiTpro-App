import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';
import { useCompany } from '../../context/CompanyContext';
import { supabase } from '../../../supabase/client';

interface Project {
  id: string;
  name: string;
  status: string;
  address: string;
}

type StatusKey = 'Active' | 'Completed' | 'On Hold';

const STATUS_STYLES: Record<StatusKey, string> = {
  Active: 'bg-green-100 text-green-700',
  Completed: 'bg-slate-100 text-slate-600',
  'On Hold': 'bg-amber-100 text-amber-700',
};

function statusStyle(status: string): string {
  return STATUS_STYLES[status as StatusKey] ?? 'bg-slate-100 text-slate-500';
}

export function Projects() {
  const { activeCompanyId } = useCompany();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCompanyId) return;

    async function fetchProjects() {
      setLoading(true);
      setError(null);

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('id, name, status, address')
        .eq('company_id', activeCompanyId!)
        .order('name');

      if (projectError) {
        setError('Could not load projects.');
        setLoading(false);
        return;
      }

      setProjects(projectData ?? []);
      setLoading(false);
    }

    fetchProjects();
  }, [activeCompanyId]);

  const activeCount = projects.filter((p) => p.status === 'Active').length;

  return (
    <>
      <PageHeader
        title="Projects"
        stats={
          loading
            ? 'Loading...'
            : `${projects.length} project${projects.length !== 1 ? 's' : ''} · ${activeCount} active`
        }
        actions={
          <button
            onClick={() => navigate('/app/projects/new')}
            className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            Create New Project
          </button>
        }
      />

      <div className="p-5">
        {loading && (
          <div className="flex h-32 items-center justify-center text-[12px] text-slate-400">
            Loading projects...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-[12px] text-red-600">
            {error}
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white text-center">
            <div className="text-[13px] font-medium text-slate-700">No projects yet</div>
            <div className="text-[11px] text-slate-400">Projects will appear here once created.</div>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => navigate(`/app/project/${project.id}/home`)}
                className="flex w-full items-start justify-between rounded-lg border border-slate-200 bg-white p-4 text-left transition-colors hover:border-slate-300 hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-slate-900 truncate">{project.name}</div>
                  {project.address && (
                    <div className="mt-0.5 text-[11px] text-slate-500 truncate">{project.address}</div>
                  )}
                </div>
                <span
                  className={`ml-3 shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${statusStyle(project.status)}`}
                >
                  {project.status ?? 'Unknown'}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
