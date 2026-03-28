import { useParams } from 'react-router-dom';
import { NavHeader } from './NavHeader';
import { NavGroup } from './NavGroup';
import { ProjectSwitcher } from './ProjectSwitcher';
import { companyNavGroups, companyAdminItems, projectNavGroups } from './navConfig';

interface LeftNavProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function LeftNav({ isCollapsed, onToggleCollapse }: LeftNavProps) {
  const { projectId } = useParams();
  const isProjectContext = Boolean(projectId);

  const navGroups = isProjectContext ? projectNavGroups : companyNavGroups;

  return (
    <nav
      className={`flex flex-col bg-slate-800 transition-[width] duration-200 ease-in-out ${
        isCollapsed ? 'w-[52px]' : 'w-[200px]'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <NavHeader isCollapsed={isCollapsed} onToggleCollapse={onToggleCollapse} />

      {isProjectContext && (
        <ProjectSwitcher
          projectName="Maple St Residence"
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
    </nav>
  );
}
