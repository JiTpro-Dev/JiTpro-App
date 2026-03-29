import { Link } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

const demos = [
  {
    name: 'Enter Procurement Items',
    description: 'Create and configure procurement item timelines with durations, milestones, and review rounds.',
    path: '/demo/procurement-timeline',
  },
  {
    name: 'View Procurement Timeline',
    description: 'View all saved procurement items and their timelines.',
    path: '/demo/view-procurement-timeline',
  },
  {
    name: 'Procurement Schedule',
    description: 'Gantt chart view of all procurement items with calendar timeline.',
    path: '/demo/procurement-schedule',
  },
];

export function Demo() {
  return (
    <AppLayout pageTitle="Demos">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demos.map((demo) => (
          <Link
            key={demo.path}
            to={demo.path}
            className="rounded-lg bg-white p-6 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all"
          >
            <h3 className="font-semibold text-slate-900">{demo.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{demo.description}</p>
          </Link>
        ))}
      </div>
    </AppLayout>
  );
}
