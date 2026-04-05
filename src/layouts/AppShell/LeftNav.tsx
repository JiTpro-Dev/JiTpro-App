import { NavHeader } from './NavHeader';
import { NavGroup } from './NavGroup';
import { ProjectSwitcher } from './ProjectSwitcher';
import { CompanySwitcher } from './CompanySwitcher';
import { companyNavGroups, companyAdminItems, projectNavGroups } from './navConfig';
import { useProject } from '../../context/ProjectContext';

interface LeftNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  companyName: string;
}

export function LeftNav({ isCollapsed, onToggleCollapse, companyName }: LeftNavProps) {
  const { projectId, project } = useProject();
  const isProjectContext = Boolean(projectId);

  const projectBase = projectId ? `/app/project/${projectId}` : '';
  const navGroups = isProjectContext
    ? projectNavGroups.map((group) => ({
        ...group,
        items: group.items.map((item) => ({
          ...item,
          path: `${projectBase}/${item.path}`,
        })),
      }))
    : companyNavGroups;

  return (
    <nav
      className={`flex flex-col bg-slate-800 transition-[width] duration-200 ease-in-out ${
        isCollapsed ? 'w-[52px]' : 'w-[200px]'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <NavHeader isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} companyName={companyName} />

      {isProjectContext && (
        <ProjectSwitcher
          projectName={project?.name ?? 'Loading...'}
          isCollapsed={isCollapsed}
        />
      )}

      <div className="flex-1 overflow-y-auto">
        {navGroups.map((group) => (
          <NavGroup key={group.label} group={group} isCollapsed={isCollapsed} />
        ))}
      </div>

      {!isProjectContext && (
        <div className="border-t border-slate-700 py-2">
          {companyAdminItems.items.map((item) => (
            <div key={item.path}>
              <NavGroup group={{ label: '', items: [item] }} isCollapsed={isCollapsed} />
            </div>
          ))}
        </div>
      )}

      <CompanySwitcher isCollapsed={isCollapsed} />
    </nav>
  );
}
