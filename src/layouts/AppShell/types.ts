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
