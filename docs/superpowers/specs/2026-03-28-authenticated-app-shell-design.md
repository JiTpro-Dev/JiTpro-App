# Authenticated App Shell Design

**Status:** Approved
**Date:** 2026-03-28
**Scope:** Global navigation frame for all authenticated JiTpro experiences
**Parent spec:** docs/specs/ui_ux_spec_outline.md (Section 4: Global Navigation Model)
**Companion docs:** Product Spec, Technical Architecture Spec, UI/UX Spec Outline

---

## 1. Overview

This spec defines the authenticated app shell — the persistent frame that wraps every authenticated page in JiTpro. It includes the left navigation, top bar, page header pattern, and context-switching behavior between company and project workspaces.

The shell is implemented as a single `AppShell` component with context-sensitive sub-components. It is the foundation all pages render inside.

---

## 2. Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Shell structure | Dark left nav + light top bar | Industry standard (Procore, Linear, Notion). Strong nav weight, clean content area. |
| Context switching | Full nav replace with project switcher dropdown | Entering a project replaces the left nav entirely. A dropdown in the nav allows switching projects directly or returning to Company Home without navigating to the Projects list. |
| Breadcrumb | Breadcrumb path in top bar | Shows: Company Name > Page or Company Name > Project Name > Page. Segments are clickable for navigation. |
| Create button | Context-aware single action | Top bar button changes label by context: "+ Create Project" at company level, "+ Create Item" inside a project. Single click, no dropdown menu. |
| Nav collapsibility | Collapsible from v1, default expanded | Toggle between expanded (~200px with labels) and collapsed (~52px icon-only). Default state is expanded. Collapse toggle is a « / » icon in the nav header. |
| Page header | Spacious with summary stats | Title block with breadcrumb, page title, and contextual summary stat line (e.g., "142 items · 12 at risk · 8 waiting on external"). Filters and actions on a second row separated by a subtle divider. |
| Notifications | Bell icon with dropdown panel | Bell icon in top bar with unread count badge. Click opens a dropdown panel with recent notifications. Link to full notifications page for history. |
| Profile menu | Standard set | My Profile, Notification Preferences, Company Settings (if admin), Help / Support, Sign Out. |

---

## 3. Component Architecture

The shell is a single `AppShell` layout component with four sub-components:

```
AppShell
├── LeftNav
│   ├── NavHeader (logo, company name, collapse toggle)
│   ├── ProjectSwitcher (visible only in project context)
│   ├── NavGroups (context-sensitive nav items)
│   └── NavFooter (Admin links: Billing, Settings — company context only)
├── TopBar
│   ├── Breadcrumb
│   ├── CreateButton (context-aware label)
│   ├── NotificationBell (with dropdown panel)
│   ├── HelpButton
│   └── ProfileMenu (avatar with dropdown)
├── PageHeader (per-page, passed as props or children)
│   ├── Title
│   ├── SummaryStats
│   ├── FilterBar (optional)
│   └── ActionButtons
└── ContentArea (route children)
```

### 3.1 AppShell

- Wraps all authenticated routes via React Router nested layout
- Manages collapse state (`isCollapsed`) via `useState`, persisted to `localStorage`
- Reads route params to determine context: company-level vs project-level
- Renders LeftNav, TopBar, and a content slot for page children

### 3.2 LeftNav

**Dimensions:**
- Expanded: 200px wide
- Collapsed: 52px wide
- Transition: CSS transition on width (~200ms ease)

**Visual design:**
- Background: `#1e293b` (slate-800)
- Text: `#94a3b8` (slate-400)
- Active item: `#f1f5f9` (slate-100) text, `#334155` (slate-700) background, 2px left border in `#f59e0b` (amber-500)
- Group labels: `#475569` (slate-600), 9px uppercase, 0.08em letter spacing
- Section dividers between groups use padding, not horizontal rules
- Admin group (Billing, Settings) pinned to bottom with a `#334155` top border

**Company context nav groups:**
1. Workspace: Home, Projects
2. Pre-bid Tools: Scope Builder, Selection Register
3. Directories: People, Organizations
4. Standards: Cost Codes, Calendars, Project Templates
5. Admin (bottom): Billing, Settings

**Project context nav groups:**
1. Project Switcher (dropdown at top, below logo)
2. Work: Overview, Items, Schedule, Requests, Documents
3. Project Admin: Team, Baselines, Reports, Settings

**External portal nav (reference only — implemented as a separate `PortalShell` layout, not part of `AppShell`):**
1. Home
2. Shared Items
3. Requests
4. Documents
5. Profile / Help

**Collapsed state:**
- Logo reduces to single letter "J" in amber
- Nav items show icon only (lucide-react icons)
- Group labels hidden
- Tooltip on hover shows the label text
- Project switcher collapses to a project icon; click expands a popover

**Icon assignments (lucide-react):**

| Nav Item | Icon |
|---|---|
| Home | `Home` |
| Projects | `FolderKanban` |
| Scope Builder | `ClipboardList` |
| Selection Register | `ListChecks` |
| People | `Users` |
| Organizations | `Building2` |
| Cost Codes | `Hash` |
| Calendars | `Calendar` |
| Project Templates | `LayoutTemplate` |
| Billing | `CreditCard` |
| Settings | `Settings` |
| Overview | `LayoutDashboard` |
| Items | `Package` |
| Schedule | `GanttChart` |
| Requests | `MessageSquare` |
| Documents | `FileText` |
| Team | `UserCog` |
| Baselines | `GitCompare` |
| Reports | `BarChart3` |

### 3.3 ProjectSwitcher

- Appears at the top of the left nav when inside a project context, below the logo/company header
- Shows current project name with a dropdown chevron
- Background: `#0f172a` (slate-950) with `#334155` border, 6px border-radius
- Label "Current Project" in `#64748b` (slate-500), 9px
- Project name in `#e2e8f0` (slate-200), 10px, font-weight 500

**Dropdown contents:**
- Search field (filters projects by name)
- Recent projects (last 3 visited)
- All assigned projects (scrollable list)
- Divider
- "Back to Company Home" link

### 3.4 TopBar

**Dimensions:**
- Height: 48px
- Background: `#fff` (white)
- Bottom border: 1px `#e2e8f0` (slate-200)
- Spans full width of the content area (right of left nav)

**Left side — Breadcrumb:**
- Font size: 11px
- Segments separated by `›` in `#cbd5e1` (slate-300)
- Intermediate segments: `#94a3b8` (slate-400), clickable
- Current segment: `#1e293b` (slate-800), font-weight 500
- Company context: `Kaufman Construction › Home`
- Project context: `Kaufman Construction › Maple St Residence › Items`

**Right side — Actions (left to right):**
1. **Create button:** `#1e293b` background, white text, 6px border-radius, 10px font, font-weight 500. Label changes by context:
   - Company Home: "+ Create Project"
   - Projects list: "+ Create Project"
   - Inside a project (most pages): "+ Create Item"
   - Requests page: "+ Create Request"
   - Documents page: "+ Upload Document"
   - Team page: "+ Add Member"
2. **Notification bell:** 16px icon, `#64748b` color. Unread badge: `#ef4444` background, white text, 8px font, pill shape, positioned top-right of icon.
3. **Help button:** `?` icon, `#94a3b8` color. Links to help/support.
4. **Profile avatar:** 28px circle, `#1e293b` background, initials in `#f59e0b` (amber-500), 10px font-weight 700.

**Profile dropdown menu items:**
- My Profile
- Notification Preferences
- Company Settings (visible only for company admins)
- Help / Support
- Divider
- Sign Out

### 3.5 PageHeader

Rendered by each page, not by AppShell directly. A reusable `PageHeader` component accepts props.

**Props interface:**
- `title`: string (required)
- `stats`: string (optional — e.g., "142 items · 12 at risk")
- `filters`: ReactNode (optional — filter bar content)
- `actions`: ReactNode (optional — action buttons)

**Layout:**
- Background: `#fff`
- Padding: 18px 20px top/sides, 14px bottom
- Bottom border: 1px `#e2e8f0`
- Title: 20px, font-weight 700, `#0f172a` (slate-950), letter-spacing -0.02em
- Stats line: 11px, `#64748b` (slate-500), margin-top 3px
- Filter/actions row (when present): margin-top 14px, padding-top 14px, top border 1px `#f1f5f9` (slate-50). Filters left-aligned, actions right-aligned.

**Filter chips:**
- Padding: 4px 10px
- Border: 1px `#e2e8f0`
- Border-radius: 4px
- Font: 9px, `#64748b`
- Active filter: `#f59e0b` border, `#fffbeb` background

**Action buttons:**
- Secondary: border `#e2e8f0`, text `#64748b`, 6px radius
- Primary: background `#1e293b`, text white, 6px radius

---

## 4. Routing Structure

The shell uses React Router nested layouts:

```
/ (redirect to /home or last-open project)
├── AppShell (layout route — renders shell frame)
│   ├── /home (Company Home)
│   ├── /projects (Projects list)
│   ├── /pre-bid/scope-builder
│   ├── /pre-bid/selection-register
│   ├── /people (People directory)
│   ├── /organizations
│   ├── /cost-codes
│   ├── /calendars
│   ├── /project-templates
│   ├── /billing
│   ├── /settings (Company Settings)
│   ├── /notifications (full notifications page)
│   └── /projects/:projectId (Project layout — switches nav context)
│       ├── /overview (Project Overview)
│       ├── /items
│       ├── /items/:itemId (Item Detail)
│       ├── /schedule
│       ├── /requests
│       ├── /documents
│       ├── /team
│       ├── /baselines
│       ├── /reports
│       └── /settings (Project Settings)
```

**Context detection:** If the route matches `/projects/:projectId/*`, render project nav. Otherwise render company nav.

**External portal** uses a separate route tree under `/portal` with its own simplified nav (not part of this shell — separate layout component).

---

## 5. Responsive Behavior

### 5.1 Desktop (>= 1024px)
- Full shell as described above
- Nav default expanded, user can collapse

### 5.2 Tablet (768px - 1023px)
- Nav starts collapsed (icon-only)
- User can expand temporarily (overlay mode, not pushing content)
- Top bar and page header remain unchanged

### 5.3 Mobile (< 768px)
- Nav hidden by default
- Hamburger menu in top bar toggles nav as a slide-over overlay
- Internal workspace is not optimized for mobile in v1 (per UI/UX spec Section 14)
- External portal has its own responsive layout

---

## 6. State Management

### 6.1 Collapse State
- Stored in `localStorage` key: `jitpro_nav_collapsed`
- Default: `false` (expanded)
- Tablet breakpoint overrides to collapsed regardless of stored preference
- Mobile breakpoint hides nav entirely

### 6.2 Active Nav Item
- Derived from current route path via React Router `useLocation()`
- No separate state needed — route is the source of truth

### 6.3 Project Context
- Derived from route params: `useParams().projectId`
- When present, LeftNav renders project nav groups and ProjectSwitcher
- When absent, LeftNav renders company nav groups

### 6.4 Notification Count
- Fetched from Supabase on shell mount
- Polled or subscribed via Supabase realtime (implementation detail for notification module)
- Displayed as badge on bell icon

---

## 7. Empty and Loading States

### 7.1 Shell Loading
- Shell frame renders immediately (nav, top bar)
- Content area shows a centered spinner or skeleton while page data loads
- Nav items are always available — no loading state for navigation

### 7.2 New Company (No Projects)
- Company Home shows onboarding checklist in the right rail
- Summary cards show zeros with helpful text ("No projects yet — create your first project to get started")
- Projects page shows empty state with prominent Create Project CTA

### 7.3 Notification Bell — No Notifications
- Badge hidden (not showing "0")
- Dropdown shows "No new notifications" with a link to notification settings

---

## 8. Accessibility

- All nav items are keyboard-accessible with visible focus indicators
- Collapse toggle has `aria-label="Collapse navigation"` / `"Expand navigation"`
- Nav groups use `role="navigation"` with `aria-label` per group
- Active nav item uses `aria-current="page"`
- Dropdown menus (profile, notifications, project switcher) are keyboard-navigable with Escape to close
- Status chips and badges do not rely on color alone — include text labels
- Top bar actions have `aria-label` attributes
- Skip-to-content link for keyboard users (hidden, visible on focus)

---

## 9. Design Tokens Summary

| Token | Value | Usage |
|---|---|---|
| Nav background | `#1e293b` (slate-800) | Left nav background |
| Nav text | `#94a3b8` (slate-400) | Inactive nav items |
| Nav active text | `#f1f5f9` (slate-100) | Active nav item |
| Nav active bg | `#334155` (slate-700) | Active nav item background |
| Nav active border | `#f59e0b` (amber-500) | Active item left border accent |
| Nav group label | `#475569` (slate-600) | Section headers |
| Nav width expanded | 200px | Default expanded state |
| Nav width collapsed | 52px | Collapsed icon-only state |
| Top bar bg | `#ffffff` | Top bar background |
| Top bar height | 48px | Fixed height |
| Top bar border | `#e2e8f0` (slate-200) | Bottom border |
| Breadcrumb inactive | `#94a3b8` (slate-400) | Parent segments |
| Breadcrumb active | `#1e293b` (slate-800) | Current segment |
| Page header title | `#0f172a` (slate-950) | Page title color |
| Page header stats | `#64748b` (slate-500) | Summary stat line |
| Content bg | `#f8fafc` (slate-50) | Main content area background |
| Primary button bg | `#1e293b` (slate-800) | CTA buttons |
| Accent | `#f59e0b` (amber-500) | Logo, active indicators, highlights |
| Error/alert | `#ef4444` (red-500) | Notification badge, error states |
| Warning | `#d97706` (amber-600) | Warning counts |

---

## 10. File Structure

```
src/
├── layouts/
│   └── AppShell/
│       ├── AppShell.tsx          # Main shell layout component
│       ├── TopBar.tsx            # Top bar with breadcrumbs, actions
│       ├── LeftNav.tsx           # Context-sensitive left navigation
│       ├── NavHeader.tsx         # Logo, company name, collapse toggle
│       ├── ProjectSwitcher.tsx   # Project dropdown selector
│       ├── NavGroup.tsx          # Reusable nav section with label + items
│       ├── NavItem.tsx           # Single nav link with icon
│       └── navConfig.ts          # Nav group definitions for each context
├── components/
│   ├── PageHeader.tsx            # Reusable page header component
│   ├── NotificationBell.tsx      # Bell icon with dropdown panel
│   └── ProfileMenu.tsx           # Profile avatar with dropdown menu
```

---

## 11. v1.1 Considerations

These are explicitly out of scope for v1 but the architecture should not prevent them:

- **Saved nav state per project** — remember which page the user was on when switching projects
- **Pinned/favorited projects** in project switcher
- **Global search** (Cmd+K) — can be added to top bar without layout changes
- **Theme toggle** — can be added to profile menu
- **Nav item badges** — e.g., showing count of overdue items next to "Requests" nav item
