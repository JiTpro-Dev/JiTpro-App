# Company Setup Wizard — Steps 3-6 Design

**Status:** Draft
**Date:** 2026-03-28
**Scope:** Remaining Company Setup wizard steps (Holiday Calendar, Company Contacts, Cost Codes, PCL Templates)
**Parent spec:** docs/specs/ui_ux_spec_outline.md (Section 7.5: Company Setup Onboarding)
**Companion docs:** Authenticated App Shell Design, Product Spec, Procurement Edit Logic

---

## 1. Overview

This spec defines the remaining four steps of the Company Setup wizard. Steps 1 (Company Profile) and 2 (Company Admin) are already built. The original Step 4 (Internal Users) has been removed from Company Setup — internal team member assignment moves to Project Setup where role-to-person mapping is project-specific.

**Revised wizard flow:**
1. Company Profile (built)
2. Company Admin (built)
3. Holiday Calendar (this spec)
4. Company Contacts (this spec)
5. Cost Codes (this spec)
6. PCL Templates (this spec)

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Wizard layout | Standalone full-screen, no shell or navbar | One-time admin onboarding flow. Clean, focused experience. Sensitive company data that lower roles shouldn't access. Separate route makes it easy to lock down with role-based access later. |
| Design language | Matches App Shell design tokens | Same slate/amber color palette, typography, button styles, and spacing as the new AppShell. Feels like the same product without the navigation chrome. |
| Internal Users step | Removed from Company Setup | Internal team members are selected from the company directory during Project Setup. Company directory (contacts) captures everyone — internal and external. Internal vs. external is determined by company name match. |
| Step ordering | Contacts before Cost Codes | Contacts must be imported before any downstream features can reference people from the directory. |

---

## 3. Shared Wizard Chrome

The wizard uses a consistent frame across all steps:

**Layout:**
- Full-screen white background
- Centered content area: `max-w-3xl` (768px)
- No navbar, no left nav, no footer

**Step indicator:**
- Horizontal row of step buttons at the top
- Current step: `bg-slate-900 text-white`
- Completed steps: `bg-slate-200 text-slate-700`
- Future steps: `bg-slate-50 text-slate-400`
- Steps are clickable (can jump to any completed or current step)

**Bottom navigation:**
- Left side: "Back" button (secondary style) or "* Required fields" text on first step
- Right side: "Save & Continue" button (primary: `bg-slate-900 text-white`)
- Final step: "Complete Setup" button instead of "Save & Continue"
- On "Complete Setup", redirect to `/app/home` (new AppShell)

**Logo:**
- JiTpro logo centered above the step indicator, subtle, small (`h-8`)
- Provides brand identity without full navbar weight

These elements are already partially built in the existing `CompanySetup.tsx` and will be preserved.

---

## 4. Step 3: Holiday Calendar

**Purpose:** Define the company's non-working days so procurement timelines can calculate workday-based durations correctly.

**Layout:**
- Section header: "Holiday Calendar" with subtitle "Select the holidays your company observes. These will be excluded from workday calculations in procurement timelines."
- Pre-populated list of 10 US holidays, each with a toggle checkbox (all checked by default)
- "Add Custom Holiday" button below the list

**Default holiday list:**

| Holiday | Typical Date | Default |
|---|---|---|
| New Year's Day | January 1 | Checked |
| Martin Luther King Jr. Day | Third Monday in January | Checked |
| Memorial Day | Last Monday in May | Checked |
| Independence Day | July 4 | Checked |
| Labor Day | First Monday in September | Checked |
| Thanksgiving | Fourth Thursday in November | Checked |
| Day After Thanksgiving | Fourth Friday in November | Checked |
| Christmas Eve | December 24 | Checked |
| Christmas Day | December 25 | Checked |
| New Year's Eve | December 31 | Checked |

**Holiday list item layout:**
- Left: round checkbox (checked = `bg-slate-900`, unchecked = `border-slate-300`)
- Middle: holiday name (`text-slate-900 text-sm font-medium`) + date description (`text-slate-500 text-xs`)
- Right: no action needed (checkbox is the toggle)

**Add Custom Holiday:**
- Button: "+ Add Custom Holiday" (secondary button style)
- Clicking reveals an inline form row at the bottom of the list:
  - Holiday name (text input, required)
  - Date (date input, required)
  - Recurring toggle (checkbox: "Repeats every year")
  - "Add" button (primary, small) and "Cancel" link
- Added custom holidays appear in the list with an "×" remove button on the right
- Custom holidays are always checked when added

**Data storage:** Holidays are stored per-company. Each holiday record has: name, date_or_rule (fixed date or rule like "last Monday in May"), is_recurring (boolean), is_active (boolean, maps to checked/unchecked), is_default (boolean, distinguishes JiTpro defaults from custom).

**No Supabase persistence in this step yet.** Data stays in component state. Persistence is a separate task when the full company setup save flow is built.

---

## 5. Step 4: Company Contacts

**Purpose:** Import or manually add the company's contact directory. This includes both internal team members and external contacts (architects, engineers, subs, suppliers, etc.).

**Layout:**
- Section header: "Company Contacts" with subtitle "Import your company directory from a CSV file or add contacts manually. This includes both internal team members and external contacts."
- Two input methods: CSV import (primary) and manual add (secondary)

**CSV Import (existing logic, preserved):**
- "Download CSV Template" button
- Drop zone / click-to-upload area for CSV file
- On upload: parse, validate, show preview table
- Preview table columns: #, First Name, Last Name, Title, Company, Email, Phone, Type, Role, Issues
- Error rows highlighted in red with error messages
- Duplicate email detection with amber warning
- "Confirm Import" and "Clear" buttons
- Confirmed state shows green success banner with count

**Manual Add:**
- "+ Add Contact" button (secondary style) below the CSV section, separated by a subtle divider with "or add contacts individually" text
- Clicking reveals an inline form:
  - Row 1: First Name (required), Last Name (required)
  - Row 2: Title, Company/Organization
  - Row 3: Email (required), Phone
  - Row 4: Contact Type dropdown (Internal / External), Role Category dropdown
  - "Add Contact" button (primary, small) and "Cancel" link
- Added contacts appear in a summary table below
- Each row has an "×" remove button
- Manual and CSV-imported contacts merge into the same list

**Validation rules (same as existing):**
- First Name required
- Last Name required
- Email required
- Contact Type must be "Internal" or "External"
- Role Category must be from the predefined list

---

## 6. Step 5: Cost Codes

**Purpose:** Load the company's cost code structure. Cost codes are the backbone of the Scope Builder → Specification Register → Procurement Items workflow.

**Layout:**
- Section header: "Cost Code Library" with subtitle "Upload your company's cost code structure or use the standard CSI MasterFormat list."
- Three-option card layout for the source choice
- Number visibility toggle below

**Source options (card-style, select one):**

1. **Upload Your Own** — "Import your company's cost code structure from a CSV file"
   - On select: shows CSV upload area (same pattern as contacts)
   - Expected columns: division_code, division_title, section_code, section_title, subsection_code, subsection_title, paragraph_code, paragraph_title
   - Rows can have empty subsection/paragraph columns (not all codes go full depth)
   - Preview shows parsed hierarchy: Division rows bold, sections indented, subsections further indented
   - Shows count summary: "X divisions, Y sections, Z subsections, W paragraphs parsed"

2. **Use CSI MasterFormat** — "Start with the standard 50-division CSI MasterFormat structure. You can customize it later."
   - On select: shows confirmation text "The CSI MasterFormat 50-division structure will be loaded with all divisions, sections, subsections, and paragraphs. You can customize this later from Company Settings."
   - "Load CSI MasterFormat" button (primary)
   - After loading: shows summary "X divisions, Y sections, Z subsections loaded"

3. **Skip for Now** — "Set up cost codes later from Company Settings"
   - On select: shows confirmation text and allows proceeding to next step

**Number visibility toggle:**
- Appears after a cost code source is selected (not for "Skip")
- Toggle switch with label: "Show cost code numbers"
- Default: On
- Subtitle: "When off, cost code descriptions are displayed without numbering. Descriptions remain in standard sort order."
- This is a company-level setting stored in the company profile

**Cost code data model (designed for Scope Builder):**

The `cost_codes` table stores the normalized hierarchy:

| Column | Type | Notes |
|---|---|---|
| id | UUID | Primary key |
| company_id | UUID | References company |
| parent_id | UUID | Nullable — references parent cost_code. NULL for divisions. |
| code | Text | The number (e.g., "03 30 00") |
| title | Text | The description (e.g., "Cast-in-Place Concrete") |
| level | Integer | 1=Division, 2=Section, 3=Subsection, 4=Paragraph |
| sort_order | Integer | Preserves CSI ordering |
| is_active | Boolean | Default true. Allows deactivating without deleting. |
| source | Text | "custom" or "csi_masterformat" |

**Import parsing logic:**
- Read CSV row by row
- Each row contains up to 4 code-title pairs across 8 columns
- For each row, create/find nodes at each level, linking parent_id:
  - Column 1-2 → Division (level 1, parent_id = NULL)
  - Column 3-4 → Section (level 2, parent_id = division)
  - Column 5-6 → Subsection (level 3, parent_id = section) — skip if empty
  - Column 7-8 → Paragraph (level 4, parent_id = subsection) — skip if empty
- Deduplicate by code — same division code across rows creates only one division record

**Scope Builder integration (future, not built now):**
- User selects Division (required) → Section (required minimum) → Subsection (optional) → Paragraph (optional)
- At any level from Section onwards, user can stop and add locations/conditions
- Each resulting combination flows into the Specification Register as a trackable item

**No Supabase persistence in this step yet.** The schema design is defined here for when persistence is built. Wizard step stores selections in component state.

---

## 7. Step 6: PCL Templates

**Purpose:** Show the default Procurement Complexity Level templates. Admin can review them and proceed. Customization happens later from the shell.

**Layout:**
- Section header: "Procurement Templates" with subtitle "JiTpro includes default procurement templates based on complexity level. You can customize these later from Company Settings."
- Three template cards displayed in a row

**Default PCL templates:**

1. **Simple**
   - Description: "Standard materials with short lead times and minimal coordination"
   - Example items: "Interior paint, standard hardware, basic electrical fixtures"
   - Default tasks and durations:
     - Buyout: 5 days
     - Submittal Coordination: 3 days
     - Submittal Prep: 5 days
     - 1st Review: 5 days
     - Approval: 2 days
     - Release to Fab: 2 days
     - Fabrication: 10 days
     - Shipping: 5 days
   - Review rounds: 1

2. **Standard**
   - Description: "Typical procurement items requiring coordination and multiple review rounds"
   - Example items: "Millwork, specialty doors, mechanical equipment"
   - Default tasks and durations:
     - Buyout: 10 days
     - Submittal Coordination: 10 days
     - Submittal Prep: 15 days
     - 1st Review: 10 days
     - Vendor Rev 1: 7 days
     - REV 1 Review: 7 days
     - Approval: 3 days
     - Release to Fab: 3 days
     - Fabrication: 30 days
     - Shipping: 10 days
   - Review rounds: 2

3. **Complex**
   - Description: "Long-lead, high-coordination items requiring extensive review and fabrication"
   - Example items: "Structural steel, curtain wall, custom stone, elevator systems"
   - Default tasks and durations:
     - Buyout: 15 days
     - Submittal Coordination: 20 days
     - Submittal Prep: 30 days
     - 1st Review: 14 days
     - Vendor Rev 1: 10 days
     - REV 1 Review: 10 days
     - Vendor Rev 2: 7 days
     - REV 2 Review: 7 days
     - Approval: 3 days
     - Release to Fab: 5 days
     - Fabrication: 60 days
     - Shipping: 15 days
   - Review rounds: 3

**Template card layout:**
- Card with border, rounded corners
- Header: template name (bold) + complexity badge
- Description text
- Example items in italic
- Collapsed task list (expandable via "View default durations" toggle)
- Total lead time calculated and displayed: "Total: X working days"

**Behavior:**
- Cards are read-only in the wizard — no editing
- "These templates are starting points. You can customize durations, add templates, or modify tasks later from Company Settings."
- No selection needed — all three are available to the company by default

**"Complete Setup" button:**
- This is the final step
- On click: redirect to `/app/home` (new AppShell Company Home)

---

## 8. Completion Flow

When the admin clicks "Complete Setup" on the final step:

1. All wizard data that requires persistence will be saved (when Supabase integration is built)
2. Redirect to `/app/home`
3. The AppShell Company Home page loads with the onboarding checklist in the right rail showing setup completion status

For now (no Supabase persistence), "Complete Setup" simply redirects to `/app/home`.

---

## 9. Route and Layout

**Route:** `/setup` (new standalone route, separate from `/company/setup`)
- The existing `/company/setup` route remains untouched (old layout, for reference)
- New wizard lives at `/setup` with its own minimal layout wrapper (no AppShell, no old Navbar)
- Protected by `RequireAuth`
- Future: protected by admin role check

**Layout wrapper:** `SetupLayout`
- Full-screen white background
- Centered JiTpro logo at top (small, `h-8`)
- Max-width content area (`max-w-3xl`)
- No navbar, no left nav, no footer
- Uses App Shell design tokens for colors, typography, buttons

---

## 10. Design Tokens (Matching App Shell)

| Element | Classes |
|---|---|
| Page background | `bg-white` |
| Content max-width | `max-w-3xl mx-auto` |
| Card border | `border border-slate-200 rounded-lg` |
| Primary button | `bg-slate-900 text-white hover:bg-slate-800` |
| Secondary button | `border border-slate-200 text-slate-600 hover:bg-slate-100` |
| Input fields | `border border-slate-200 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-slate-300` |
| Labels | `text-sm font-medium text-slate-700` |
| Section title | `text-xl font-semibold text-slate-900` |
| Subtitle text | `text-sm text-slate-600` |
| Toggle checkbox (checked) | `bg-slate-900 text-white` with checkmark |
| Toggle checkbox (unchecked) | `border-2 border-slate-300 bg-white` |
| Accent/highlight | `text-amber-600 bg-amber-50` (used sparingly) |
| Step indicator active | `bg-slate-900 text-white rounded-md px-3 py-1.5 text-xs font-medium` |
| Step indicator complete | `bg-slate-200 text-slate-700 rounded-md px-3 py-1.5 text-xs font-medium` |
| Step indicator future | `bg-slate-50 text-slate-400 rounded-md px-3 py-1.5 text-xs font-medium` |
