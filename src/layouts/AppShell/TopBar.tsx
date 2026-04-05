import { useLocation, Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { NotificationBell } from '../../components/NotificationBell';
import { ProfileMenu } from '../../components/ProfileMenu';
import { useProject } from '../../context/ProjectContext';

// Map route segments to display labels
const routeLabels: Record<string, string> = {
  home: 'Home',
  projects: 'Projects',
  'scope-builder': 'Scope Builder',
  'selection-register': 'Selection Register',
  people: 'People',
  organizations: 'Organizations',
  'cost-codes': 'Cost Codes',
  calendars: 'Calendars',
  'project-templates': 'Project Templates',
  billing: 'Billing',
  settings: 'Settings',
  overview: 'Overview',
  items: 'Items',
  schedule: 'Schedule',
  requests: 'Requests',
  documents: 'Documents',
  team: 'Team',
  baselines: 'Baselines',
  reports: 'Reports',
};

export function TopBar({ companyName }: { companyName: string }) {
  const location = useLocation();
  const { projectId, project } = useProject();
  const isProjectContext = Boolean(projectId);
  const segments = location.pathname.replace('/app/', '').split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'home';
  const currentLabel = routeLabels[lastSegment] || lastSegment;

  return (
    <div className="flex h-12 flex-shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
      {/* Breadcrumb */}
      <div className="text-[11px]">
        <Link to="/app/home" className="text-slate-400 hover:text-slate-600 transition-colors">
          {companyName}
        </Link>
        {isProjectContext && (
          <>
            <span className="mx-1.5 text-slate-300">›</span>
            <Link
              to={`/app/project/${projectId}/home`}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              {project?.name ?? 'Loading...'}
            </Link>
          </>
        )}
        <span className="mx-1.5 text-slate-300">›</span>
        <span className="font-medium text-slate-800">{currentLabel}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <button className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Help">
          <HelpCircle size={16} />
        </button>
        <ProfileMenu />
      </div>
    </div>
  );
}
