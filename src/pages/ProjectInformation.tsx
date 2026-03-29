import { AppLayout } from '../layouts/AppLayout';

export function ProjectInformation() {
  return (
    <AppLayout>
      <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
        <h2 className="mb-4 text-xl font-semibold text-slate-900">
          Create New Project
        </h2>
        <p className="text-slate-600">
          Project information form will be built here.
        </p>
      </div>
    </AppLayout>
  );
}
