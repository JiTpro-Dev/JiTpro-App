// src/layouts/AppShell/NavItem.tsx
import { NavLink } from 'react-router-dom';
import type { NavItemConfig } from './types';

interface NavItemProps {
  item: NavItemConfig;
  isCollapsed: boolean;
}

export function NavItem({ item, isCollapsed }: NavItemProps) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      end={item.path.endsWith('/home')}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-[7px] text-[11px] border-l-2 transition-colors ${
          isActive
            ? 'text-slate-100 bg-slate-700 border-amber-500 font-medium'
            : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-700/50'
        }${isCollapsed ? ' justify-center px-0' : ''}`
      }
      title={isCollapsed ? item.label : undefined}
    >
      <Icon size={16} className="flex-shrink-0" />
      {!isCollapsed && <span>{item.label}</span>}
    </NavLink>
  );
}
