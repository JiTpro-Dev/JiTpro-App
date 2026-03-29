# Company Setup Wizard Steps 3-6 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the remaining 4 steps of the Company Setup wizard (Holiday Calendar, Company Contacts, Cost Codes, PCL Templates) as a standalone full-screen flow at `/setup`.

**Architecture:** A new `SetupLayout` wrapper renders the wizard chrome (logo, step indicator, nav buttons). Each step is its own component file. The wizard page manages step state and renders the active step component. All data stays in component state — no Supabase persistence yet. The existing `/company/setup` route is untouched.

**Tech Stack:** React 18, TypeScript, Tailwind CSS v3, React Router v6, lucide-react

**Spec:** `docs/superpowers/specs/2026-03-28-company-setup-steps-3-6-design.md`

---

## File Structure

```
src/
├── layouts/
│   └── SetupLayout.tsx              # Full-screen wizard chrome (logo, step indicator, nav)
├── pages/
│   └── setup/
│       ├── SetupWizard.tsx           # Wizard page: manages step state, renders active step
│       ├── steps/
│       │   ├── HolidayCalendar.tsx   # Step 3: holiday toggle list + custom add
│       │   ├── CompanyContacts.tsx    # Step 4: CSV import + manual add
│       │   ├── CostCodes.tsx         # Step 5: source selection + CSV upload + number toggle
│       │   └── PclTemplates.tsx      # Step 6: read-only template cards
│       └── setupTypes.ts            # Shared types for wizard state
```

**Existing files modified (minimal):**
- `src/App.tsx` — add `/setup` route

---

## Task 1: Shared Types

**Files:**
- Create: `src/pages/setup/setupTypes.ts`

- [ ] **Step 1: Create shared types file**

```typescript
// src/pages/setup/setupTypes.ts

export interface Holiday {
  id: string;
  name: string;
  dateDescription: string;
  isRecurring: boolean;
  isActive: boolean;
  isDefault: boolean;
}

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

export const validRoleCategories = [
  'principal', 'senior_project_manager', 'project_manager', 'project_engineer',
  'project_administrator', 'superintendent', 'foreman',
  'owner', 'architect', 'engineer', 'designer', 'consultant',
  'subcontractor', 'supplier', 'other',
];

export const csvTemplateColumns = [
  'First Name', 'Last Name', 'Title', 'Company/Organization',
  'Email', 'Phone', 'Address', 'Contact Type', 'Role Category', 'Notes',
];

export const defaultHolidays: Holiday[] = [
  { id: 'newyear', name: "New Year's Day", dateDescription: 'January 1', isRecurring: true, isActive: true, isDefault: true },
  { id: 'mlk', name: 'Martin Luther King Jr. Day', dateDescription: 'Third Monday in January', isRecurring: true, isActive: true, isDefault: true },
  { id: 'memorial', name: 'Memorial Day', dateDescription: 'Last Monday in May', isRecurring: true, isActive: true, isDefault: true },
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
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/setup/setupTypes.ts
git commit -m "feat: add shared types and default data for company setup wizard"
```

---

## Task 2: SetupLayout Wrapper

**Files:**
- Create: `src/layouts/SetupLayout.tsx`

- [ ] **Step 1: Create SetupLayout component**

```tsx
// src/layouts/SetupLayout.tsx
import type { ReactNode } from 'react';

interface SetupStep {
  key: string;
  label: string;
}

interface SetupLayoutProps {
  children: ReactNode;
  steps: SetupStep[];
  currentStep: number;
  onStepClick: (index: number) => void;
  onBack: () => void;
  onNext: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export function SetupLayout({
  children,
  steps,
  currentStep,
  onStepClick,
  onBack,
  onNext,
  isFirstStep,
  isLastStep,
}: SetupLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Logo */}
        <div className="mb-6 text-center">
          <img
            src={`${import.meta.env.BASE_URL}JiTpro.jpg`}
            alt="JiTpro"
            className="mx-auto h-8"
          />
        </div>

        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            {steps.map((step, i) => (
              <button
                key={step.key}
                onClick={() => i <= currentStep && onStepClick(i)}
                className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  i === currentStep
                    ? 'bg-slate-900 text-white'
                    : i < currentStep
                    ? 'bg-slate-200 text-slate-700 hover:bg-slate-300 cursor-pointer'
                    : 'bg-slate-50 text-slate-400 cursor-default'
                }`}
              >
                {i + 1}. {step.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content card */}
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          {children}

          {/* Bottom navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6">
            <div>
              {!isFirstStep ? (
                <button
                  onClick={onBack}
                  className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Back
                </button>
              ) : (
                <p className="text-xs text-slate-400">* Required fields</p>
              )}
            </div>
            <button
              onClick={onNext}
              className="rounded-md bg-slate-900 px-6 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              {isLastStep ? 'Complete Setup' : 'Save & Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/layouts/SetupLayout.tsx
git commit -m "feat: add SetupLayout wrapper for standalone wizard"
```

---

## Task 3: Holiday Calendar Step

**Files:**
- Create: `src/pages/setup/steps/HolidayCalendar.tsx`

- [ ] **Step 1: Create HolidayCalendar component**

```tsx
// src/pages/setup/steps/HolidayCalendar.tsx
import { useState } from 'react';
import { Check, X } from 'lucide-react';
import type { Holiday } from '../setupTypes';

interface HolidayCalendarProps {
  holidays: Holiday[];
  onHolidaysChange: (holidays: Holiday[]) => void;
}

export function HolidayCalendar({ holidays, onHolidaysChange }: HolidayCalendarProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newRecurring, setNewRecurring] = useState(true);

  const toggleHoliday = (id: string) => {
    onHolidaysChange(
      holidays.map((h) => (h.id === id ? { ...h, isActive: !h.isActive } : h))
    );
  };

  const removeHoliday = (id: string) => {
    onHolidaysChange(holidays.filter((h) => h.id !== id));
  };

  const addCustomHoliday = () => {
    if (!newName.trim() || !newDate.trim()) return;
    const holiday: Holiday = {
      id: `custom-${Date.now()}`,
      name: newName.trim(),
      dateDescription: newDate,
      isRecurring: newRecurring,
      isActive: true,
      isDefault: false,
    };
    onHolidaysChange([...holidays, holiday]);
    setNewName('');
    setNewDate('');
    setNewRecurring(true);
    setShowAddForm(false);
  };

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Holiday Calendar</h2>
        <p className="mt-1 text-sm text-slate-600">
          Select the holidays your company observes. These will be excluded from workday calculations in procurement timelines.
        </p>
      </div>

      <div className="space-y-1">
        {holidays.map((holiday) => (
          <div
            key={holiday.id}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-slate-50 transition-colors"
          >
            {/* Round checkbox */}
            <button
              onClick={() => toggleHoliday(holiday.id)}
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full transition-colors ${
                holiday.isActive
                  ? 'bg-slate-900 text-white'
                  : 'border-2 border-slate-300 bg-white'
              }`}
              aria-label={`Toggle ${holiday.name}`}
            >
              {holiday.isActive && <Check size={12} strokeWidth={3} />}
            </button>

            {/* Holiday info */}
            <div className="flex-1">
              <span className="text-sm font-medium text-slate-900">{holiday.name}</span>
              <span className="ml-2 text-xs text-slate-500">{holiday.dateDescription}</span>
            </div>

            {/* Remove button for custom holidays */}
            {!holiday.isDefault && (
              <button
                onClick={() => removeHoliday(holiday.id)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={`Remove ${holiday.name}`}
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add Custom Holiday */}
      <div className="mt-4">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            + Add Custom Holiday
          </button>
        ) : (
          <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Holiday Name *
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g., Company Shutdown"
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300"
                />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <input
                type="checkbox"
                id="recurring"
                checked={newRecurring}
                onChange={(e) => setNewRecurring(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-300"
              />
              <label htmlFor="recurring" className="text-sm text-slate-600">
                Repeats every year
              </label>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={addCustomHoliday}
                className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
              >
                Add
              </button>
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); setNewDate(''); }}
                className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/setup/steps/HolidayCalendar.tsx
git commit -m "feat: add Holiday Calendar step with toggle list and custom add"
```

---

## Task 4: Company Contacts Step

**Files:**
- Create: `src/pages/setup/steps/CompanyContacts.tsx`

- [ ] **Step 1: Create CompanyContacts component**

This is the largest step. It includes CSV import (ported from existing CompanySetup.tsx), plus a new manual add form.

```tsx
// src/pages/setup/steps/CompanyContacts.tsx
import { useCallback, useRef, useState } from 'react';
import { X } from 'lucide-react';
import type { ContactRow } from '../setupTypes';
import { csvTemplateColumns, validContactTypes, validRoleCategories } from '../setupTypes';

interface CompanyContactsProps {
  contacts: ContactRow[];
  onContactsChange: (contacts: ContactRow[]) => void;
}

function parseCSV(text: string): ContactRow[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  return lines.slice(1).map((line) => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());

    const row: ContactRow = {
      first_name: fields[0] || '',
      last_name: fields[1] || '',
      title: fields[2] || '',
      company_organization: fields[3] || '',
      email: fields[4] || '',
      phone: fields[5] || '',
      address: fields[6] || '',
      contact_type: (fields[7] || '').toLowerCase(),
      role_category: (fields[8] || '').toLowerCase(),
      notes: fields[9] || '',
      errors: [],
    };

    if (!row.first_name) row.errors.push('First Name is required');
    if (!row.last_name) row.errors.push('Last Name is required');
    if (!row.email) row.errors.push('Email is required');
    if (row.contact_type && !validContactTypes.includes(row.contact_type)) {
      row.errors.push('Contact Type must be "Internal" or "External"');
    }
    if (row.role_category && !validRoleCategories.includes(row.role_category)) {
      row.errors.push(`Invalid Role Category: "${row.role_category}"`);
    }

    return row;
  });
}

export function CompanyContacts({ contacts, onContactsChange }: CompanyContactsProps) {
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvImported, setCsvImported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showManualForm, setShowManualForm] = useState(false);
  const [manualFirst, setManualFirst] = useState('');
  const [manualLast, setManualLast] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualCompany, setManualCompany] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualType, setManualType] = useState('');
  const [manualRole, setManualRole] = useState('');

  const handleDownloadTemplate = useCallback(() => {
    const header = csvTemplateColumns.join(',');
    const exampleRow = [
      'John', 'Smith', 'Project Manager', 'Smith Construction', 'john@example.com',
      '555-555-5555', '123 Main St', 'Internal', 'project_manager', '',
    ].join(',');
    const csv = header + '\n' + exampleRow + '\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jitpro_contacts_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);
    setCsvImported(false);

    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setCsvError('No data rows found in the file. Make sure the first row is the header.');
        return;
      }
      onContactsChange([...contacts, ...parsed]);
      setCsvImported(true);
    };
    reader.readAsText(file);
  }, [contacts, onContactsChange]);

  const removeContact = (index: number) => {
    onContactsChange(contacts.filter((_, i) => i !== index));
  };

  const resetManualForm = () => {
    setManualFirst(''); setManualLast(''); setManualTitle('');
    setManualCompany(''); setManualEmail(''); setManualPhone('');
    setManualType(''); setManualRole('');
  };

  const addManualContact = () => {
    const errors: string[] = [];
    if (!manualFirst.trim()) errors.push('First Name is required');
    if (!manualLast.trim()) errors.push('Last Name is required');
    if (!manualEmail.trim()) errors.push('Email is required');

    const row: ContactRow = {
      first_name: manualFirst.trim(),
      last_name: manualLast.trim(),
      title: manualTitle.trim(),
      company_organization: manualCompany.trim(),
      email: manualEmail.trim(),
      phone: manualPhone.trim(),
      address: '',
      contact_type: manualType,
      role_category: manualRole,
      notes: '',
      errors,
    };

    onContactsChange([...contacts, row]);
    resetManualForm();
    setShowManualForm(false);
  };

  const errorCount = contacts.filter((c) => c.errors.length > 0).length;
  const validCount = contacts.filter((c) => c.errors.length === 0).length;
  const duplicateEmails = contacts
    .map((c) => c.email.toLowerCase())
    .filter((email, i, arr) => email && arr.indexOf(email) !== i);

  const inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
  const labelClass = 'block text-sm font-medium text-slate-700 mb-1';

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Company Contacts</h2>
        <p className="mt-1 text-sm text-slate-600">
          Import your company directory from a CSV file or add contacts manually. This includes both internal team members and external contacts.
        </p>
      </div>

      {/* CSV Import */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <button
            onClick={handleDownloadTemplate}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Download CSV Template
          </button>
          <span className="text-xs text-slate-400">Download the template, fill it in, then upload below</span>
        </div>

        <div>
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full h-32 rounded-md border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Click to upload CSV file</p>
              <p className="text-xs text-slate-400 mt-1">or drag and drop</p>
            </div>
          </div>
        </div>

        {csvError && <p className="text-sm text-red-600">{csvError}</p>}

        {csvImported && (
          <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3">
            <p className="text-sm font-medium text-green-800">
              {validCount} contact{validCount !== 1 ? 's' : ''} imported.
              {errorCount > 0 && ` ${errorCount} row${errorCount !== 1 ? 's' : ''} had errors.`}
            </p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="flex-1 border-t border-slate-200" />
        <span className="text-xs text-slate-400">or add contacts individually</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {/* Manual Add */}
      {!showManualForm ? (
        <button
          onClick={() => setShowManualForm(true)}
          className="rounded-md border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
        >
          + Add Contact
        </button>
      ) : (
        <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>First Name *</label>
                <input type="text" value={manualFirst} onChange={(e) => setManualFirst(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Last Name *</label>
                <input type="text" value={manualLast} onChange={(e) => setManualLast(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Title</label>
                <input type="text" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Company / Organization</label>
                <input type="text" value={manualCompany} onChange={(e) => setManualCompany(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={manualEmail} onChange={(e) => setManualEmail(e.target.value)} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={manualPhone} onChange={(e) => setManualPhone(e.target.value)} className={inputClass} />
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <label className={labelClass}>Contact Type</label>
                <select value={manualType} onChange={(e) => setManualType(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  <option value="internal">Internal</option>
                  <option value="external">External</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Role Category</label>
                <select value={manualRole} onChange={(e) => setManualRole(e.target.value)} className={inputClass}>
                  <option value="">Select...</option>
                  {validRoleCategories.map((role) => (
                    <option key={role} value={role}>
                      {role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={addManualContact}
              className="rounded-md bg-slate-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-slate-800 transition-colors"
            >
              Add Contact
            </button>
            <button
              onClick={() => { setShowManualForm(false); resetManualForm(); }}
              className="text-sm text-slate-500 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Contact summary table */}
      {contacts.length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-slate-800 mb-2">
            {contacts.length} contact{contacts.length !== 1 ? 's' : ''}
            {errorCount > 0 && <span className="text-red-600 font-normal ml-2">({errorCount} with errors)</span>}
          </h3>
          {duplicateEmails.length > 0 && (
            <p className="text-xs text-amber-600 mb-2">
              Duplicate emails: {[...new Set(duplicateEmails)].join(', ')}
            </p>
          )}
          <div className="overflow-x-auto rounded-md border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Name</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Company</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Email</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Type</th>
                  <th className="py-2 px-3 text-left font-medium text-slate-600">Role</th>
                  <th className="py-2 px-3 w-8"></th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c, i) => (
                  <tr key={i} className={`border-b border-slate-100 ${c.errors.length > 0 ? 'bg-red-50' : ''}`}>
                    <td className="py-1.5 px-3 text-slate-900">{c.first_name} {c.last_name}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.company_organization || '—'}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.email || '—'}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.contact_type || '—'}</td>
                    <td className="py-1.5 px-3 text-slate-600">{c.role_category ? c.role_category.replace(/_/g, ' ') : '—'}</td>
                    <td className="py-1.5 px-3">
                      <button onClick={() => removeContact(i)} className="text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/setup/steps/CompanyContacts.tsx
git commit -m "feat: add Company Contacts step with CSV import and manual add"
```

---

## Task 5: Cost Codes Step

**Files:**
- Create: `src/pages/setup/steps/CostCodes.tsx`

- [ ] **Step 1: Create CostCodes component**

```tsx
// src/pages/setup/steps/CostCodes.tsx
import { useCallback, useRef, useState } from 'react';
import { Upload, Database, SkipForward } from 'lucide-react';
import type { CostCodeNode } from '../setupTypes';

type CostCodeSource = 'upload' | 'csi' | 'skip' | null;

interface CostCodesProps {
  costCodes: CostCodeNode[];
  onCostCodesChange: (codes: CostCodeNode[]) => void;
  showNumbers: boolean;
  onShowNumbersChange: (show: boolean) => void;
}

function parseCostCodeCSV(text: string): CostCodeNode[] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];

  const nodes: CostCodeNode[] = [];
  const seen = new Map<string, string>(); // code -> id
  let sortOrder = 0;

  for (const line of lines.slice(1)) {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (const ch of line) {
      if (ch === '"') { inQuotes = !inQuotes; }
      else if ((ch === ',' || ch === '\t') && !inQuotes) { fields.push(current.trim()); current = ''; }
      else { current += ch; }
    }
    fields.push(current.trim());

    // Process up to 4 code-title pairs
    const pairs: { code: string; title: string }[] = [];
    for (let i = 0; i < 8; i += 2) {
      const code = fields[i] || '';
      const title = fields[i + 1] || '';
      if (code && title) pairs.push({ code, title });
    }

    let parentId: string | null = null;
    for (let level = 0; level < pairs.length; level++) {
      const { code, title } = pairs[level];
      if (seen.has(code)) {
        parentId = seen.get(code)!;
        continue;
      }
      const id = `cc-${sortOrder}`;
      nodes.push({
        id,
        code,
        title,
        level: level + 1,
        parentId,
        sortOrder: sortOrder++,
      });
      seen.set(code, id);
      parentId = id;
    }
  }
  return nodes;
}

export function CostCodes({ costCodes, onCostCodesChange, showNumbers, onShowNumbersChange }: CostCodesProps) {
  const [source, setSource] = useState<CostCodeSource>(costCodes.length > 0 ? 'upload' : null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvError(null);

    if (!file.name.endsWith('.csv')) {
      setCsvError('Please upload a .csv file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCostCodeCSV(text);
      if (parsed.length === 0) {
        setCsvError('No cost codes found. Check that the file has a header row and data rows with code-title pairs.');
        return;
      }
      onCostCodesChange(parsed);
    };
    reader.readAsText(file);
  }, [onCostCodesChange]);

  const divisionCount = costCodes.filter((c) => c.level === 1).length;
  const sectionCount = costCodes.filter((c) => c.level === 2).length;
  const subsectionCount = costCodes.filter((c) => c.level === 3).length;
  const paragraphCount = costCodes.filter((c) => c.level === 4).length;

  const sourceCards: { key: CostCodeSource; icon: React.ReactNode; title: string; description: string }[] = [
    { key: 'upload', icon: <Upload size={20} />, title: 'Upload Your Own', description: "Import your company's cost code structure from a CSV file" },
    { key: 'csi', icon: <Database size={20} />, title: 'Use CSI MasterFormat', description: 'Start with the standard 50-division CSI MasterFormat structure' },
    { key: 'skip', icon: <SkipForward size={20} />, title: 'Skip for Now', description: 'Set up cost codes later from Company Settings' },
  ];

  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Cost Code Library</h2>
        <p className="mt-1 text-sm text-slate-600">
          Upload your company's cost code structure or use the standard CSI MasterFormat list.
        </p>
      </div>

      {/* Source selection cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {sourceCards.map((card) => (
          <button
            key={card.key}
            onClick={() => { setSource(card.key); if (card.key !== 'upload') onCostCodesChange([]); }}
            className={`rounded-lg border p-4 text-left transition-colors ${
              source === card.key
                ? 'border-slate-900 bg-slate-50 ring-1 ring-slate-900'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className={`mb-2 ${source === card.key ? 'text-slate-900' : 'text-slate-400'}`}>
              {card.icon}
            </div>
            <div className="text-sm font-medium text-slate-900">{card.title}</div>
            <div className="mt-1 text-xs text-slate-500">{card.description}</div>
          </button>
        ))}
      </div>

      {/* Upload area */}
      {source === 'upload' && (
        <div className="mt-6 space-y-4">
          <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center w-full h-28 rounded-md border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-slate-300 hover:bg-slate-100 transition-colors"
          >
            <div className="text-center">
              <p className="text-sm font-medium text-slate-600">Click to upload cost code CSV</p>
              <p className="text-xs text-slate-400 mt-1">Expected columns: division_code, division_title, section_code, section_title, ...</p>
            </div>
          </div>
          {csvError && <p className="text-sm text-red-600">{csvError}</p>}
        </div>
      )}

      {/* CSI MasterFormat confirmation */}
      {source === 'csi' && costCodes.length === 0 && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            The CSI MasterFormat 50-division structure will be loaded with all divisions, sections, subsections, and paragraphs. You can customize this later from Company Settings.
          </p>
          <button
            onClick={() => {
              // Placeholder: in production, load from Supabase or bundled JSON
              onCostCodesChange([{ id: 'csi-placeholder', code: '01 00 00', title: 'General Requirements', level: 1, parentId: null, sortOrder: 0 }]);
            }}
            className="mt-3 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
          >
            Load CSI MasterFormat
          </button>
        </div>
      )}

      {/* Skip confirmation */}
      {source === 'skip' && (
        <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            You can set up cost codes later from Company Settings. Some features like the Scope Builder will require cost codes to be configured first.
          </p>
        </div>
      )}

      {/* Cost code summary */}
      {costCodes.length > 0 && (
        <div className="mt-6 rounded-md bg-green-50 border border-green-200 px-4 py-3">
          <p className="text-sm font-medium text-green-800">
            {divisionCount} division{divisionCount !== 1 ? 's' : ''}
            {sectionCount > 0 && `, ${sectionCount} section${sectionCount !== 1 ? 's' : ''}`}
            {subsectionCount > 0 && `, ${subsectionCount} subsection${subsectionCount !== 1 ? 's' : ''}`}
            {paragraphCount > 0 && `, ${paragraphCount} paragraph${paragraphCount !== 1 ? 's' : ''}`}
            {' '}loaded
          </p>
        </div>
      )}

      {/* Number visibility toggle */}
      {source !== 'skip' && source !== null && (
        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => onShowNumbersChange(!showNumbers)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              showNumbers ? 'bg-slate-900' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={showNumbers}
            aria-label="Show cost code numbers"
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                showNumbers ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
          <div>
            <span className="text-sm font-medium text-slate-700">Show cost code numbers</span>
            <p className="text-xs text-slate-500">
              When off, cost code descriptions are displayed without numbering. Descriptions remain in standard sort order.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/setup/steps/CostCodes.tsx
git commit -m "feat: add Cost Codes step with upload, CSI default, and number toggle"
```

---

## Task 6: PCL Templates Step

**Files:**
- Create: `src/pages/setup/steps/PclTemplates.tsx`

- [ ] **Step 1: Create PclTemplates component**

```tsx
// src/pages/setup/steps/PclTemplates.tsx
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { PclTemplate } from '../setupTypes';

interface PclTemplatesProps {
  templates: PclTemplate[];
}

function getBadgeColor(name: string): string {
  if (name === 'Simple') return 'bg-green-100 text-green-700';
  if (name === 'Standard') return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function TemplateCard({ template }: { template: PclTemplate }) {
  const [expanded, setExpanded] = useState(false);
  const totalDays = template.tasks.reduce((sum, t) => sum + t.days, 0);

  return (
    <div className="rounded-lg border border-slate-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-sm font-bold text-slate-900">{template.name}</h3>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${getBadgeColor(template.name)}`}>
          {template.reviewRounds} review round{template.reviewRounds !== 1 ? 's' : ''}
        </span>
      </div>
      <p className="text-xs text-slate-600">{template.description}</p>
      <p className="mt-1 text-xs italic text-slate-500">{template.examples}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-700">Total: {totalDays} working days</span>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
        >
          {expanded ? 'Hide' : 'View'} durations
          {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>
      {expanded && (
        <div className="mt-3 border-t border-slate-100 pt-3 space-y-1">
          {template.tasks.map((task) => (
            <div key={task.name} className="flex items-center justify-between text-xs">
              <span className="text-slate-600">{task.name}</span>
              <span className="text-slate-900 font-medium">{task.days} days</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PclTemplates({ templates }: PclTemplatesProps) {
  return (
    <>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Procurement Templates</h2>
        <p className="mt-1 text-sm text-slate-600">
          JiTpro includes default procurement templates based on complexity level. You can customize these later from Company Settings.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {templates.map((template) => (
          <TemplateCard key={template.name} template={template} />
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        These templates are starting points. You can customize durations, add templates, or modify tasks later from Company Settings.
      </p>
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/setup/steps/PclTemplates.tsx
git commit -m "feat: add PCL Templates step with expandable template cards"
```

---

## Task 7: SetupWizard Page

**Files:**
- Create: `src/pages/setup/SetupWizard.tsx`

- [ ] **Step 1: Create SetupWizard component**

This is the main wizard page that manages step state and renders the active step. It imports SetupLayout and all step components.

```tsx
// src/pages/setup/SetupWizard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SetupLayout } from '../../layouts/SetupLayout';
import { HolidayCalendar } from './steps/HolidayCalendar';
import { CompanyContacts } from './steps/CompanyContacts';
import { CostCodes } from './steps/CostCodes';
import { PclTemplates } from './steps/PclTemplates';
import type { Holiday, ContactRow, CostCodeNode } from './setupTypes';
import { defaultHolidays, defaultPclTemplates } from './setupTypes';

const steps = [
  { key: 'profile', label: 'Company Profile' },
  { key: 'admin', label: 'Company Admin' },
  { key: 'calendar', label: 'Holiday Calendar' },
  { key: 'contacts', label: 'Company Contacts' },
  { key: 'costcodes', label: 'Cost Codes' },
  { key: 'pcl', label: 'PCL Templates' },
];

export function SetupWizard() {
  const navigate = useNavigate();

  // Start at step 2 (index 2) since steps 0 and 1 are already built
  // In production, this would track actual completion state
  const [currentStep, setCurrentStep] = useState(2);

  // Step 3: Holiday Calendar state
  const [holidays, setHolidays] = useState<Holiday[]>([...defaultHolidays]);

  // Step 4: Company Contacts state
  const [contacts, setContacts] = useState<ContactRow[]>([]);

  // Step 5: Cost Codes state
  const [costCodes, setCostCodes] = useState<CostCodeNode[]>([]);
  const [showCostCodeNumbers, setShowCostCodeNumbers] = useState(true);

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Complete Setup — redirect to new AppShell
      navigate('/app/home');
      return;
    }
    setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 2)); // Don't go before step 3 (index 2)
  };

  const handleStepClick = (index: number) => {
    if (index >= 2 && index <= currentStep) {
      setCurrentStep(index);
    }
  };

  return (
    <SetupLayout
      steps={steps}
      currentStep={currentStep}
      onStepClick={handleStepClick}
      onBack={handleBack}
      onNext={handleNext}
      isFirstStep={currentStep === 2}
      isLastStep={currentStep === steps.length - 1}
    >
      {currentStep === 2 && (
        <HolidayCalendar holidays={holidays} onHolidaysChange={setHolidays} />
      )}
      {currentStep === 3 && (
        <CompanyContacts contacts={contacts} onContactsChange={setContacts} />
      )}
      {currentStep === 4 && (
        <CostCodes
          costCodes={costCodes}
          onCostCodesChange={setCostCodes}
          showNumbers={showCostCodeNumbers}
          onShowNumbersChange={setShowCostCodeNumbers}
        />
      )}
      {currentStep === 5 && (
        <PclTemplates templates={defaultPclTemplates} />
      )}
    </SetupLayout>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/setup/SetupWizard.tsx
git commit -m "feat: add SetupWizard page managing all step state"
```

---

## Task 8: Wire Route and Entry Point

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add /setup route to App.tsx**

Add this import after the existing imports:

```tsx
import { SetupWizard } from './pages/setup/SetupWizard';
```

Add this route block inside `<Routes>`, before the `/app` route:

```tsx
          <Route
            path="/setup"
            element={
              <RequireAuth>
                <SetupWizard />
              </RequireAuth>
            }
          />
```

- [ ] **Step 2: Verify the app compiles**

Run: `npx tsc --noEmit`
Expected: No errors

Run: `npm run dev`

Open http://localhost:5174/setup and verify:
1. Wizard loads with step indicator showing all 6 steps
2. Steps 1-2 indicators show as completed (slate-200)
3. Step 3 (Holiday Calendar) is active with 10 pre-checked holidays
4. Toggling holidays works
5. Adding a custom holiday works
6. "Save & Continue" advances to Step 4 (Company Contacts)
7. CSV import and manual add both work
8. Step 5 (Cost Codes) shows three source cards
9. Step 6 (PCL Templates) shows three template cards with expandable durations
10. "Complete Setup" redirects to /app/home

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire /setup route for standalone company setup wizard"
```

---

## Summary

| Task | What It Builds | Files |
|------|---------------|-------|
| 1 | Shared types and default data | `setupTypes.ts` |
| 2 | SetupLayout wrapper | `SetupLayout.tsx` |
| 3 | Holiday Calendar step | `HolidayCalendar.tsx` |
| 4 | Company Contacts step | `CompanyContacts.tsx` |
| 5 | Cost Codes step | `CostCodes.tsx` |
| 6 | PCL Templates step | `PclTemplates.tsx` |
| 7 | SetupWizard page | `SetupWizard.tsx` |
| 8 | Route wiring | `App.tsx` |

**No existing files are deleted or archived.** Only `App.tsx` gets one new import and route.
