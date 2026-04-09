import {
  Home, FolderKanban, ClipboardList, ListChecks, Users, Building2, BookUser,
  Hash, Calendar, LayoutTemplate, CreditCard, Settings, LayoutDashboard,
  Package, GanttChart, MessageSquare, FileText, UserCog, GitCompare, BarChart3,
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
    label: 'Directories',
    items: [
      { label: 'Directory', path: '/app/directory', icon: BookUser },
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
    label: 'Project',
    items: [
      { label: 'Home', path: 'home', icon: LayoutDashboard },
    ],
  },
  {
    label: 'Core',
    items: [
      { label: 'Scope Builder', path: 'scope-builder', icon: ClipboardList },
      { label: 'Spec Register', path: 'selection-register', icon: ListChecks },
    ],
  },
  {
    label: 'Control Tower',
    items: [
      { label: 'Procurement', path: 'procurement', icon: Package, disabled: true },
      { label: 'Schedule', path: 'schedule', icon: GanttChart, disabled: true },
      { label: 'Requests', path: 'requests', icon: MessageSquare, disabled: true },
      { label: 'Documents', path: 'documents', icon: FileText, disabled: true },
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
