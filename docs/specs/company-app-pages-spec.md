# Company App Pages — Specification

## Overview

All pages accessible from the left nav within the AppShell at the company level (`/app/*`) and project level (`/app/project/:id/*`).

---

## Workspace

### Home

**Company level (`/app/home`):**
- Company Home dashboard (already built)
- "Home" link hidden from nav when already on this page

**Project level (`/app/project/:id/home`):**
- Project Home dashboard (already built)
- Nav shows "Company Home" link that returns to `/app/home`

### Projects

**Nav behavior:**
- Hover shows dropdown of all projects the user is authorized to see
- When inside a project, the current project is excluded from the dropdown
- Clicking a project navigates into it (`/app/project/:id/home`)

**Projects page (`/app/projects`):**
- Full page list of all company projects
- Project cards showing name, status, item counts
- Ability to create new project (future — placeholder button for now)

---

## Directories

### People

**Company level (`/app/people`):**
- Full page directory of all individuals across the company
- Sources: `company_contacts` + `users` tables combined
- Columns: Name, Title, Organization, Email, Phone, Role Category, Contact Type
- Searchable, sortable
- Admin can add/edit contacts

**Project level (`/app/project/:id/people`):**
- Same layout, filtered to project members only
- "Add to Project" button:
  - Search existing company directory to add
  - OR create new contact on the fly (saves to company directory AND adds to project)
  - When adding, PM assigns a project-specific role (may differ from company-wide role)
- Adding a person auto-associates their organization with the project

### Organizations

**Company level (`/app/organizations`):**
- Full page list of all organizations (vendors, subs, architects, owners, etc.)
- Expandable rows — click an org to see its people rolled up underneath
- Grouped view of the People directory
- Admin can add/edit organizations

**Project level (`/app/project/:id/organizations`):**
- Filtered to organizations involved in the project
- Derived from people assigned to the project (if John from ABC Millwork is on the project, ABC Millwork shows up)

---

## Standards

### Cost Codes

**Company level (`/app/cost-codes`):**
- View only for all users
- Admin can add/modify/delete cost codes
- Future: PM can submit change requests for admin approval

**Project level (`/app/project/:id/settings` or similar):**
- Toggle numeric cost code values on/off (project-level override)
- No editing of the codes themselves

### Calendars

**Company level (`/app/calendars`):**
- View default work week and holidays
- Admin can edit

**Project level:**
- PM can override:
  - Toggle weekend days on/off (e.g., enable Saturdays for this project)
  - Add project-specific non-working days (shutdowns, inspections, weather days)
  - Company holidays apply as baseline — PM can add but not remove company-wide holidays

### Project Templates (PCL)

**Company level (`/app/project-templates`):**
- View only for all users
- Admin can edit master templates

**Project level:**
- PM can modify durations (days) and review cycles (number of rounds)
- Changes are project-level overrides — don't affect company master templates
- Project gets a copy of company templates at creation

---

## Admin

### Billing (`/app/billing`)

- **Visible to Company Admin only** (hidden from nav for other roles)
- Subscription management (Core plan, Control Tower per-project purchases)
- Placeholder for now

### Settings (`/app/settings`)

**Company Settings (Admin only):**
- Company Profile — edit setup wizard fields (name, address, license, etc.)
- User Management — invite users, assign roles, deactivate accounts, trigger password resets
- Subscription — view plan details
- Notifications — company-wide defaults (future)
- Integrations — future (Procore, PlanGrid, email)

**User Settings (All roles):**
- Profile — edit own name, phone, title
- Password — change own password
- Notifications — personal preferences (future)

---

## Data Privacy Model

- No personal/private user workspaces
- All communication and data at the project level is visible to authorized team members
- Company Admin does not need to access individual user accounts
- When a user is deactivated:
  - Login is blocked immediately
  - All company/project data is preserved (belongs to company, not user)
  - Admin reassigns project roles to another user
  - No data loss

---

## Database Changes Needed

- `project_members` table needs to support `company_contacts` in addition to `users` (not everyone is an app user)
- Add `project_role` field for project-specific role assignment
- Add `project_calendars` table for project-level work week/holiday overrides
- Add `project_pcl_overrides` table for project-level template duration/review cycle changes
- `organizations` table may be needed (currently vendors serve part of this, but organizations are broader)

---

## Revision History

| Date | Change |
|------|--------|
| 2026-04-01 | Initial spec from walkthrough session |
