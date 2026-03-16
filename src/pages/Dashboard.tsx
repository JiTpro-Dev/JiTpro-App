import { AppLayout } from '../layouts/AppLayout';

export function Dashboard() {
  return (
    <AppLayout>
      <div className="rounded-lg bg-white p-8 shadow-sm border border-slate-200">
        <h2 className="mb-2 text-xl font-semibold text-slate-900">
          Welcome to JiTpro
        </h2>
        <p className="text-slate-600">More features coming soon.</p>
      </div>
    </AppLayout>
  );
}
