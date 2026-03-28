import { Link } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

export function Dashboard() {
  // TODO: Replace with real projects from Supabase
  const currentProjects: { id: string; name: string; address: string }[] = [];

  return (
    <AppLayout pageTitle="Company Dashboard">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">
          Current Projects
        </h2>
        <Link
          to="/app/home"
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          Launch New Layout
        </Link>
      </div>
      {currentProjects.length === 0 ? (
        <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200 text-center">
          <p className="text-slate-600 mb-4">No current projects.</p>
          <Link
            to="/project/new"
            className="inline-block bg-slate-900 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            Create Your First Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {currentProjects.map((project) => (
            <Link
              key={project.id}
              to={`/project/${project.id}`}
              className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-slate-900">{project.name}</h3>
              <p className="mt-1 text-sm text-slate-600">{project.address}</p>
            </Link>
          ))}
        </div>
      )}
    </AppLayout>
  );
}
