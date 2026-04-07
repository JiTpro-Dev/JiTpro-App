# DEPRECATED DOCUMENT

This document no longer reflects the current JiTpro system.

Refer to:
docs/CURRENT_STATE_UPDATED.md

---

# App Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new AppShell layout as a parallel route tree under `/app/*`, accessible from a "Launch New Layout" button on the existing dashboard, without modifying any existing pages or components.

**Architecture:** New `AppShell` layout component with four sub-components (LeftNav, TopBar, PageHeader, ContentArea). Routes under `/app/*` use React Router nested layouts. All existing routes (`/dashboard`, `/demo/*`, `/company/*`, `/project/*`) remain untouched. A placeholder Company Home page renders inside the new shell at `/app/home`.

**Tech Stack:** React 18, TypeScript, React Router v6 (nested routes with `<Outlet />`), Tailwind CSS v3, lucide-react icons

**Spec:** `docs/superpowers/specs/2026-03-28-authenticated-app-shell-design.md`

---

## File Structure

```
src/
├── layouts/
│   └── AppShell/
│       ├── AppShell.tsx          # Outer shell: LeftNav + right column (TopBar + Outlet)
│       ├── LeftNav.tsx           # Dark sidebar with nav groups, collapse toggle
│       ├── NavHeader.tsx         # Logo, company name, collapse toggle button
│       ├── NavGroup.tsx          # Reusable section: label + list of NavItems
│       ├── NavItem.tsx           # Single nav link with icon + label
│       ├── ProjectSwitcher.tsx   # Dropdown selector (project context only)
│       ├── TopBar.tsx            # Breadcrumb + right actions (create, bell, help, profile)
│       ├── navConfig.ts          # Nav group definitions for company + project contexts
│       └── types.ts              # Shared types for nav config
├── components/
│   ├── PageHeader.tsx            # Reusable page header (title, stats, filters, actions)
│   ├── NotificationBell.tsx      # Bell icon with unread badge + dropdown panel
│   └── ProfileMenu.tsx           # Avatar with dropdown menu
├── pages/
│   └── app/
│       └── CompanyHome.tsx       # Placeholder Company Home inside new shell
```

**Existing files modified (minimal):**
- `src/App.tsx` — add `/app/*` route tree alongside existing routes
- `src/pages/Dashboard.tsx` — add "Launch New Layout" button

---

## Task 1: Shared Types and Nav Config

**Files:**
- Create: `src/layouts/AppShell/types.ts`
- Create: `src/layouts/AppShell/navConfig.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/layouts/AppShell/types.ts
import type { LucideIcon } from 'lucide-react';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: LucideIcon;
}

export interface NavGroupConfig {
  label: string;
  items: NavItemConfig[];
}

export type NavContext = 'company' | 'project';
```

- [ ] **Step 2: Create nav config file**

```typescript
// src/layouts/AppShell/navConfig.ts
import {
  Home,
  FolderKanban,
  ClipboardList,
  ListChecks,
  Users,
  Building2,
  Hash,
  Calendar,
  LayoutTemplate,
  CreditCard,
  Settings,
  LayoutDashboard,
  Package,
  GanttChart,
  MessageSquare,
  FileText,
  UserCog,
  GitCompare,
  BarChart3,
} from 'lucide-react';
import type { NavGroupConfig } from './types';

export const companyNavGroups: NavGroupConfig[] = [
  {
    label: 'Workspace',
    items: [
      { label: 'Home', path: '/app/home', icon: Home },
      { label: 'Projects', path: '/app/projects', icon: FolderKanban },
    ],
  },
  {
    label: 'Pre-bid Tools',
    items: [
      { label: 'Scope Builder', path: '/app/pre-bid/scope-builder', icon: ClipboardList },
      { label: 'Selection Register', path: '/app/pre-bid/selection-register', icon: ListChecks },
    ],
  },
  {
    label: 'Directories',
    items: [
      { label: 'People', path: '/app/people', icon: Users },
      { label: 'Organizations', path: '/app/organizations', icon: Building2 },
    ],
  },
  {
    label: 'Standards',
    items: [
      { label: 'Cost Codes', path: '/app/cost-codes', icon: Hash },
      { label: 'Calendars', path: '/app/calendars', icon: Calendar },
      { label: 'Project Templates', path: '/app/project-templates', icon: LayoutTemplate },
    ],
  },
];

export const companyAdminItems: NavGroupConfig = {
  label: 'Admin',
  items: [
    { label: 'Billing', path: '/app/billing', icon: CreditCard },
    { label: 'Settings', path: '/app/settings', icon: Settings },
  ],
};

export const projectNavGroups: NavGroupConfig[] = [
  {
    label: 'Work',
    items: [
      { label: 'Overview', path: 'overview', icon: LayoutDashboard },
      { label: 'Items', path: 'items', icon: Package },
      { label: 'Schedule', path: 'schedule', icon: GanttChart },
      { label: 'Requests', path: 'requests', icon: MessageSquare },
      { label: 'Documents', path: 'documents', icon: FileText },
    ],
  },
  {
    label: 'Project Admin',
    items: [
      { label: 'Team', path: 'team', icon: UserCog },
      { label: 'Baselines', path: 'baselines', icon: GitCompare },
      { label: 'Reports', path: 'reports', icon: BarChart3 },
      { label: 'Settings', path: 'settings', icon: Settings },
    ],
  },
];
```

- [ ] **Step 3: Commit**

```bash
git add src/layouts/AppShell/types.ts src/layouts/AppShell/navConfig.ts
git commit -m "feat: add AppShell nav config and shared types"
```

---

## Task 2: NavItem Component

**Files:**
- Create: `src/layouts/AppShell/NavItem.tsx`

- [ ] **Step 1: Create NavItem component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/NavItem.tsx
git commit -m "feat: add NavItem component with active state styling"
```

---

## Task 3: NavGroup Component

**Files:**
- Create: `src/layouts/AppShell/NavGroup.tsx`

- [ ] **Step 1: Create NavGroup component**

```tsx
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
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/NavGroup.tsx
git commit -m "feat: add NavGroup component with section labels"
```

---

## Task 4: NavHeader Component

**Files:**
- Create: `src/layouts/AppShell/NavHeader.tsx`

- [ ] **Step 1: Create NavHeader component**

```tsx
// src/layouts/AppShell/NavHeader.tsx
import { ChevronsLeft, ChevronsRight } from 'lucide-react';

interface NavHeaderProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function NavHeader({ isCollapsed, onToggleCollapse }: NavHeaderProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-700 px-4 py-[14px]">
      {isCollapsed ? (
        <span className="mx-auto text-[14px] font-bold text-amber-500">J</span>
      ) : (
        <div>
          <div className="text-[14px] font-bold tracking-tight text-amber-500">JiTpro</div>
          <div className="mt-[2px] text-[9px] text-slate-500">Kaufman Construction</div>
        </div>
      )}
      <button
        onClick={onToggleCollapse}
        className={`text-slate-600 hover:text-slate-400 transition-colors ${isCollapsed ? 'mx-auto mt-2' : ''}`}
        aria-label={isCollapsed ? 'Expand navigation' : 'Collapse navigation'}
      >
        {isCollapsed ? <ChevronsRight size={16} /> : <ChevronsLeft size={16} />}
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/NavHeader.tsx
git commit -m "feat: add NavHeader with logo and collapse toggle"
```

---

## Task 5: ProjectSwitcher Component

**Files:**
- Create: `src/layouts/AppShell/ProjectSwitcher.tsx`

- [ ] **Step 1: Create ProjectSwitcher component**

This is a placeholder for now — functional project switching requires Supabase data. The component renders the UI shell with static content.

```tsx
// src/layouts/AppShell/ProjectSwitcher.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface ProjectSwitcherProps {
  projectName: string;
  isCollapsed: boolean;
}

export function ProjectSwitcher({ projectName, isCollapsed }: ProjectSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  if (isCollapsed) {
    return (
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="mx-auto mt-2 flex h-8 w-9 items-center justify-center rounded-md bg-slate-950 border border-slate-700 text-slate-200"
        title={projectName}
      >
        <span className="text-[10px] font-bold">{projectName.charAt(0)}</span>
      </button>
    );
  }

  return (
    <div className="mx-2 mt-2 relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full rounded-md bg-slate-950 border border-slate-700 px-2 py-2 text-left"
      >
        <div className="text-[9px] text-slate-500">Current Project</div>
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-medium text-slate-200 truncate">{projectName}</span>
          <ChevronDown size={12} className="text-slate-500 flex-shrink-0" />
        </div>
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-md border border-slate-700 bg-slate-900 py-1 shadow-lg">
          <button
            onClick={() => { navigate('/app/home'); setIsOpen(false); }}
            className="block w-full px-3 py-2 text-left text-[10px] text-slate-400 hover:bg-slate-800 hover:text-slate-200"
          >
            ← Back to Company Home
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/ProjectSwitcher.tsx
git commit -m "feat: add ProjectSwitcher dropdown component"
```

---

## Task 6: LeftNav Component

**Files:**
- Create: `src/layouts/AppShell/LeftNav.tsx`

- [ ] **Step 1: Create LeftNav component**

```tsx
// src/layouts/AppShell/LeftNav.tsx
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
              {/* Inline NavItem to avoid importing NavGroup for a single section */}
              <NavGroup group={{ label: '', items: [item] }} isCollapsed={isCollapsed} />
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/LeftNav.tsx
git commit -m "feat: add LeftNav with context-sensitive nav groups"
```

---

## Task 7: NotificationBell and ProfileMenu Components

**Files:**
- Create: `src/components/NotificationBell.tsx`
- Create: `src/components/ProfileMenu.tsx`

- [ ] **Step 1: Create NotificationBell component**

```tsx
// src/components/NotificationBell.tsx
import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = 0; // TODO: fetch from Supabase

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative text-slate-500 hover:text-slate-700 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[8px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-md border border-slate-200 bg-white py-2 shadow-lg z-50">
          <div className="px-4 py-2 text-[11px] text-slate-400">No new notifications</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create ProfileMenu component**

```tsx
// src/components/ProfileMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function ProfileMenu() {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // TODO: get initials from user profile
  const initials = 'JK';

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { label: 'My Profile', action: () => {} },
    { label: 'Notification Preferences', action: () => {} },
    { label: 'Company Settings', action: () => {} },
    { label: 'Help / Support', action: () => {} },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-amber-500 hover:bg-slate-700 transition-colors"
        aria-label="Profile menu"
      >
        {initials}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-md border border-slate-200 bg-white py-1 shadow-lg z-50">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => { item.action(); setIsOpen(false); }}
              className="block w-full px-4 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              {item.label}
            </button>
          ))}
          <div className="my-1 border-t border-slate-100" />
          <button
            onClick={logout}
            className="block w-full px-4 py-2 text-left text-[12px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/NotificationBell.tsx src/components/ProfileMenu.tsx
git commit -m "feat: add NotificationBell and ProfileMenu components"
```

---

## Task 8: TopBar Component

**Files:**
- Create: `src/layouts/AppShell/TopBar.tsx`

- [ ] **Step 1: Create TopBar component**

```tsx
// src/layouts/AppShell/TopBar.tsx
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

export function TopBar() {
  const location = useLocation();
  const { projectId } = useParams();
  const isProjectContext = Boolean(projectId);

  // Build breadcrumb segments
  const companyName = 'Kaufman Construction';
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
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/TopBar.tsx
git commit -m "feat: add TopBar with breadcrumb and context-aware actions"
```

---

## Task 9: PageHeader Component

**Files:**
- Create: `src/components/PageHeader.tsx`

- [ ] **Step 1: Create PageHeader component**

```tsx
// src/components/PageHeader.tsx
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  stats?: string;
  filters?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({ title, stats, filters, actions }: PageHeaderProps) {
  const hasSecondRow = filters || actions;

  return (
    <div className="border-b border-slate-200 bg-white px-5 pb-[14px] pt-[18px]">
      <h1 className="text-[20px] font-bold tracking-tight text-slate-950">
        {title}
      </h1>
      {stats && (
        <p className="mt-[3px] text-[11px] text-slate-500">{stats}</p>
      )}
      {hasSecondRow && (
        <div className="mt-[14px] flex items-center justify-between border-t border-slate-50 pt-[14px]">
          <div className="flex items-center gap-2">{filters}</div>
          <div className="flex items-center gap-2">{actions}</div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PageHeader.tsx
git commit -m "feat: add reusable PageHeader component"
```

---

## Task 10: AppShell Layout Component

**Files:**
- Create: `src/layouts/AppShell/AppShell.tsx`

- [ ] **Step 1: Create AppShell component**

```tsx
// src/layouts/AppShell/AppShell.tsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LeftNav } from './LeftNav';
import { TopBar } from './TopBar';

const COLLAPSE_KEY = 'jitpro_nav_collapsed';

export function AppShell() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem(COLLAPSE_KEY) === 'true';
  });

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, String(next));
      return next;
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <LeftNav isCollapsed={isCollapsed} onToggleCollapse={handleToggleCollapse} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/AppShell/AppShell.tsx
git commit -m "feat: add AppShell layout with collapsible nav and Outlet"
```

---

## Task 11: Placeholder Company Home Page

**Files:**
- Create: `src/pages/app/CompanyHome.tsx`

- [ ] **Step 1: Create CompanyHome page**

This page renders inside the new AppShell. It uses PageHeader and shows the summary cards and content layout from the approved mockup.

```tsx
// src/pages/app/CompanyHome.tsx
import { PageHeader } from '../../components/PageHeader';

export function CompanyHome() {
  return (
    <>
      <PageHeader
        title="Company Home"
        stats="0 active projects · 0 at risk · 0 awaiting activation"
      />
      <div className="p-5">
        {/* Summary cards row */}
        <div className="mb-5 grid grid-cols-4 gap-3">
          <SummaryCard label="My Work" value="0" detail="items assigned to you" />
          <SummaryCard label="Needing Attention" value="0" detail="across 0 projects" />
          <SummaryCard label="Waiting on External" value="0" detail="open requests" />
          <SummaryCard label="Active Projects" value="0" detail="none yet" />
        </div>

        {/* Main content + right rail */}
        <div className="grid grid-cols-[2fr_1fr] gap-4">
          <div className="space-y-3">
            <ContentCard title="Active Projects">
              <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                No projects yet — create your first project to get started
              </div>
            </ContentCard>
            <ContentCard title="Recent Activity">
              <div className="flex h-16 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                No recent activity
              </div>
            </ContentCard>
          </div>
          <div>
            <ContentCard title="Quick Actions">
              <div className="flex h-36 items-center justify-center rounded bg-slate-50 text-[12px] text-slate-400">
                Actions will appear here
              </div>
            </ContentCard>
          </div>
        </div>
      </div>
    </>
  );
}

function SummaryCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
      <div className="text-[9px] font-semibold uppercase tracking-[0.05em] text-slate-500">{label}</div>
      <div className="mt-1 text-[22px] font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500">{detail}</div>
    </div>
  );
}

function ContentCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-[14px]">
      <div className="mb-2 text-[12px] font-semibold text-slate-900">{title}</div>
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/CompanyHome.tsx
git commit -m "feat: add placeholder CompanyHome page with summary cards"
```

---

## Task 12: Wire Routes and Add Entry Point

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Add /app route tree to App.tsx**

Add the new import and route block. All existing routes remain untouched.

Add these imports at the top of `src/App.tsx` after the existing imports:

```tsx
import { AppShell } from './layouts/AppShell/AppShell';
import { CompanyHome } from './pages/app/CompanyHome';
```

Add this route block inside `<Routes>`, before the `<Route path="*" ...>` catch-all:

```tsx
          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppShell />
              </RequireAuth>
            }
          >
            <Route path="home" element={<CompanyHome />} />
            <Route index element={<Navigate to="home" replace />} />
          </Route>
```

- [ ] **Step 2: Add "Launch New Layout" button to Dashboard.tsx**

Add this button after the existing "Create Your First Project" link in the empty state block. Find the closing `</Link>` inside the empty state `<div>` and add after it:

```tsx
          <Link
            to="/app/home"
            className="inline-block ml-3 border border-slate-200 text-slate-600 px-6 py-2.5 rounded-md text-sm font-medium hover:bg-slate-100 transition-colors"
          >
            Launch New Layout
          </Link>
```

Also add a "Launch New Layout" button that's always visible (not just in empty state). Find the `<h2>` tag that says "Current Projects" and add after it, before the conditional block:

```tsx
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
```

And remove the standalone `<h2>` that was there before (it's now inside the flex container above).

- [ ] **Step 3: Verify the app compiles**

Run: `npm run dev`

Open the app, log in, and verify:
1. Existing `/dashboard` page loads normally with a "Launch New Layout" button
2. Clicking "Launch New Layout" navigates to `/app/home`
3. The new AppShell renders with dark left nav, top bar, and Company Home content
4. Nav collapse toggle works
5. All existing pages (`/demo/*`, `/company/setup`, etc.) still work unchanged

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx src/pages/Dashboard.tsx
git commit -m "feat: wire AppShell routes at /app/* with entry point from dashboard"
```

---

## Summary

| Task | What It Builds | Files |
|------|---------------|-------|
| 1 | Types + nav config | `types.ts`, `navConfig.ts` |
| 2 | NavItem | `NavItem.tsx` |
| 3 | NavGroup | `NavGroup.tsx` |
| 4 | NavHeader | `NavHeader.tsx` |
| 5 | ProjectSwitcher | `ProjectSwitcher.tsx` |
| 6 | LeftNav | `LeftNav.tsx` |
| 7 | NotificationBell + ProfileMenu | `NotificationBell.tsx`, `ProfileMenu.tsx` |
| 8 | TopBar | `TopBar.tsx` |
| 9 | PageHeader | `PageHeader.tsx` |
| 10 | AppShell | `AppShell.tsx` |
| 11 | CompanyHome page | `CompanyHome.tsx` |
| 12 | Routing + entry point | `App.tsx`, `Dashboard.tsx` |

**No existing files are deleted, archived, or renamed.** Only `App.tsx` and `Dashboard.tsx` get small additions.
