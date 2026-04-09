// src/pages/setup/setupTypes.ts

export interface Holiday {
  id: string;
  name: string;
  dateDescription: string;
  isRecurring: boolean;
  isActive: boolean;
  isDefault: boolean;
}

export interface WorkWeek {
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

export const defaultWorkWeek: WorkWeek = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: false,
  sunday: false,
};

export interface ContactRow {
  first_name: string;
  last_name: string;
  title: string;
  company_organization: string;
  email: string;
  phone: string;
  address: string;
  contact_type: string;
  role_category: string;
  notes: string;
  org_type: string;
  errors: string[];
}

export interface CostCodeNode {
  id: string;
  code: string;
  title: string;
  level: number;
  parentId: string | null;
  sortOrder: number;
}

export interface PclTemplate {
  name: string;
  description: string;
  examples: string;
  reviewRounds: number;
  tasks: { name: string; days: number }[];
}

export const validContactTypes = ['internal', 'external'];

export const validOrgTypes = [
  'owner', 'architect', 'engineer', 'designer',
  'consultant', 'subcontractor', 'supplier', 'other',
];

export const validRoleCategories = [
  'principal', 'senior_project_manager', 'project_manager', 'project_engineer',
  'project_administrator', 'superintendent', 'foreman',
  'owner', 'architect', 'engineer', 'designer', 'consultant',
  'subcontractor', 'supplier', 'other',
];

export const csvTemplateColumns = [
  'First Name', 'Last Name', 'Title', 'Company/Organization',
  'Email', 'Phone', 'Address', 'Contact Type', 'Role Category', 'Notes', 'Org Type',
];

export const defaultHolidays: Holiday[] = [
  { id: 'newyear', name: "New Year's Day", dateDescription: 'January 1', isRecurring: true, isActive: true, isDefault: true },
  { id: 'mlk', name: 'Martin Luther King Jr. Day', dateDescription: 'Third Monday in January', isRecurring: true, isActive: true, isDefault: true },
  { id: 'presidents', name: "Presidents' Day", dateDescription: 'Third Monday in February', isRecurring: true, isActive: true, isDefault: true },
  { id: 'memorial', name: 'Memorial Day', dateDescription: 'Last Monday in May', isRecurring: true, isActive: true, isDefault: true },
  { id: 'kamehameha', name: 'King Kamehameha Day', dateDescription: 'June 11', isRecurring: true, isActive: false, isDefault: true },
  { id: 'independence', name: 'Independence Day', dateDescription: 'July 4', isRecurring: true, isActive: true, isDefault: true },
  { id: 'labor', name: 'Labor Day', dateDescription: 'First Monday in September', isRecurring: true, isActive: true, isDefault: true },
  { id: 'thanksgiving', name: 'Thanksgiving', dateDescription: 'Fourth Thursday in November', isRecurring: true, isActive: true, isDefault: true },
  { id: 'dayafterthanks', name: 'Day After Thanksgiving', dateDescription: 'Fourth Friday in November', isRecurring: true, isActive: true, isDefault: true },
  { id: 'xmaseve', name: 'Christmas Eve', dateDescription: 'December 24', isRecurring: true, isActive: true, isDefault: true },
  { id: 'xmas', name: 'Christmas Day', dateDescription: 'December 25', isRecurring: true, isActive: true, isDefault: true },
  { id: 'nyeve', name: "New Year's Eve", dateDescription: 'December 31', isRecurring: true, isActive: true, isDefault: true },
];

export const defaultPclTemplates: PclTemplate[] = [
  {
    name: 'Simple',
    description: 'Standard materials with short lead times and minimal coordination',
    examples: 'Interior paint, standard hardware, basic electrical fixtures',
    reviewRounds: 1,
    tasks: [
      { name: 'Buyout', days: 5 },
      { name: 'Submittal Coordination', days: 3 },
      { name: 'Submittal Prep', days: 5 },
      { name: '1st Review', days: 5 },
      { name: 'Approval', days: 2 },
      { name: 'Release to Fab', days: 2 },
      { name: 'Fabrication', days: 10 },
      { name: 'Shipping', days: 5 },
    ],
  },
  {
    name: 'Standard',
    description: 'Typical procurement items requiring coordination and multiple review rounds',
    examples: 'Millwork, specialty doors, mechanical equipment',
    reviewRounds: 2,
    tasks: [
      { name: 'Buyout', days: 10 },
      { name: 'Submittal Coordination', days: 10 },
      { name: 'Submittal Prep', days: 15 },
      { name: '1st Review', days: 10 },
      { name: 'Vendor Rev 1', days: 7 },
      { name: 'REV 1 Review', days: 7 },
      { name: 'Approval', days: 3 },
      { name: 'Release to Fab', days: 3 },
      { name: 'Fabrication', days: 30 },
      { name: 'Shipping', days: 10 },
    ],
  },
  {
    name: 'Complex',
    description: 'Long-lead, high-coordination items requiring extensive review and fabrication',
    examples: 'Structural steel, curtain wall, custom stone, elevator systems',
    reviewRounds: 3,
    tasks: [
      { name: 'Buyout', days: 15 },
      { name: 'Submittal Coordination', days: 20 },
      { name: 'Submittal Prep', days: 30 },
      { name: '1st Review', days: 14 },
      { name: 'Vendor Rev 1', days: 10 },
      { name: 'REV 1 Review', days: 10 },
      { name: 'Vendor Rev 2', days: 7 },
      { name: 'REV 2 Review', days: 7 },
      { name: 'Approval', days: 3 },
      { name: 'Release to Fab', days: 5 },
      { name: 'Fabrication', days: 60 },
      { name: 'Shipping', days: 15 },
    ],
  },
];
