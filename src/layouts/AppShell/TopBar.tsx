import { useLocation, useParams, Link } from 'react-router-dom';
import { HelpCircle } from 'lucide-react';
import { NotificationBell } from '../../components/NotificationBell';
import { ProfileMenu } from '../../components/ProfileMenu';

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

// Map route segments to context-aware create button labels
function getCreateLabel(pathname: string, isProjectContext: boolean): string {
  if (!isProjectContext) return '+ Create Project';
  if (pathname.includes('/requests')) return '+ Create Request';
  if (pathname.includes('/documents')) return '+ Upload Document';
  if (pathname.includes('/team')) return '+ Add Member';
  return '+ Create Item';
}

export function TopBar({ companyName }: { companyName: string }) {
  const location = useLocation();
  const { projectId } = useParams();
  const isProjectContext = Boolean(projectId);
  const segments = location.pathname.replace('/app/', '').split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || 'home';
  const currentLabel = routeLabels[lastSegment] || lastSegment;
  const createLabel = getCreateLabel(location.pathname, isProjectContext);

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
              to={`/app/projects/${projectId}/overview`}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              Maple St Residence
            </Link>
          </>
        )}
        <span className="mx-1.5 text-slate-300">›</span>
        <span className="font-medium text-slate-800">{currentLabel}</span>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-4">
        <button className="rounded-md bg-slate-800 px-3.5 py-[5px] text-[10px] font-medium text-white hover:bg-slate-700 transition-colors">
          {createLabel}
        </button>
        <NotificationBell />
        <button className="text-slate-400 hover:text-slate-600 transition-colors" aria-label="Help">
          <HelpCircle size={16} />
        </button>
        <ProfileMenu />
      </div>
    </div>
  );
}
