// src/layouts/AppShell/NavGroup.tsx
import type { NavGroupConfig } from './types';
import { NavItem } from './NavItem';

interface NavGroupProps {
  group: NavGroupConfig;
  isCollapsed: boolean;
}

export function NavGroup({ group, isCollapsed }: NavGroupProps) {
  return (
    <div>
      {!isCollapsed && (
        <div className="px-4 pt-[14px] pb-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-slate-600">
          {group.label}
        </div>
      )}
      {isCollapsed && <div className="pt-3" />}
      {group.items.map((item) => (
        <NavItem key={item.path} item={item} isCollapsed={isCollapsed} />
      ))}
    </div>
  );
}
