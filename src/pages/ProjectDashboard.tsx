import { useParams } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

export function ProjectDashboard() {
  const { id } = useParams();

  // TODO: Fetch project name from Supabase using id
  const projectName: string | undefined = undefined;

  return (
    <AppLayout pageTitle={projectName || 'Project Dashboard'}>
      <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
        <p className="text-slate-600">Project ID: {id}</p>
        <p className="mt-2 text-sm text-slate-400">
          This is a placeholder. Project details will be built here.
        </p>
      </div>
    </AppLayout>
  );
}
