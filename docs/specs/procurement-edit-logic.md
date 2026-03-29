# Procurement Timeline — Edit Logic & Rules

## Overview

This document defines the rules for how procurement timelines are created, edited, baselined, and tracked. The system supports accountability tracking, baseline comparisons, and constraint enforcement.

---

## 1. Procurement Item Lifecycle

Each procurement item moves through three statuses:

| Status   | Description |
|----------|-------------|
| **Draft**    | Item is being set up. No baseline exists. Fully editable. |
| **Active**   | At least one baseline has been set. Edits are tracked against the baseline. |
| **Complete** | Item has been delivered. All actual dates recorded. Locked from editing. Only higher admin can reopen. |

---

## 2. Task-Level Status

Each task within a procurement timeline has its own status:

| Status         | Description |
|----------------|-------------|
| **Not Started**    | Only baseline/planned dates visible. No actuals entered. |
| **In Progress**    | User has entered an Actual Start date. |
| **Complete**       | User has entered an Actual Finish date and marked the task complete. Locked — only higher admin can reopen. |

- Tasks can be marked **out of sequence** (e.g., submittal coordination can start before buyout is fully complete).
- All updates must be made **before** a task is marked Complete.

---

## 3. Baselines

### What is a baseline?
A baseline is a **permanent, numbered snapshot** of the entire procurement timeline at a point in time. It captures:

- All task names, durations, start dates, and end dates
- Delivery date
- Start of Buyout date
- Final Design and Final Selection dates and their linked tasks
- All milestone dates
- Review round configuration

### Baseline rules
- A procurement item can have **multiple baselines**: Baseline 1, Baseline 2, Baseline 3, etc.
- Each baseline is **permanent** — it cannot be edited or deleted.
- Baselines are stored in a **separate table** (`timeline_baselines`).
- Setting a baseline changes the item status from **Draft** to **Active** (on the first baseline).
- The user must explicitly click a "Set Baseline" action to create one.

### Baseline comparisons
- The system can compare the **current state** against any saved baseline.
- Differences are flagged: tasks that are behind schedule, delivery date shifts, etc.
- This provides accountability: "Baseline 1 planned delivery on Dec 1. Current projection is Dec 15. 14-day delay caused by [reason]."

---

## 4. Calculation Modes

The direction of calculation depends on whether the buyout start date is in the future or the past.

### Mode A: Start Date in the Future (delivery date is fixed)

- **Delivery date** is the anchor (fixed).
- **Start date** calculates **backward** from the delivery date.
- Editing durations moves the start date earlier or later.
- If the start date lands **before today's date**:
  - The timeline is **flagged visually** (not blocked).
  - A message displays: "This timeline requires starting X working days before today."
  - The user can adjust durations to make it fit, or leave as-is to demonstrate to the client that the requested schedule is unrealistic.
  - This is a **communication tool** — shows clients when expectations don't align with reality.

### Mode B: Start Date in the Past (work is underway)

- **Start date** is locked (work has begun).
- **Delivery date** calculates **forward** from the start date based on current durations.
- Lengthen a duration → delivery date pushes later.
- Shorten a duration → delivery date pulls earlier.
- The delivery date input is **calculated only** — no manual override allowed.

---

## 5. Actual Dates

Each task supports two actual date fields:

| Field          | When entered |
|----------------|--------------|
| **Actual Start**  | When the task begins in the real world. |
| **Actual Finish** | When the task completes in the real world. |

### Rules
- Actual dates are entered by the user as work progresses.
- When an Actual Finish is entered, the system recalculates downstream dates based on the actual (not the planned) finish.
- Actual dates vs. baseline dates provide the **variance** — how far ahead or behind schedule each task is.
- All actuals must be entered before a task can be marked Complete.

---

## 6. Edit Reasons (Audit Trail)

- When a user edits a duration on an **Active** item (post-baseline), they must enter a **reason** for the change.
- Example: "Fabrication delayed 15 days due to steel shortage."
- This creates a permanent audit trail of what changed, when, and why.

---

## 7. Final Design & Final Selection Constraints

### What are they?
Final Design (FD) and Final Selection (FS) are **owner/architect decision milestones** that are outside the contractor's control. They act as **hard constraints** that gate specific tasks in the timeline.

### How they work

- The user assigns FD and FS to specific tasks when creating the procurement item.
  - Example: Final Design gates Submittal Coordination. Final Selection gates Release to Fab.
- Different procurement items can have FD and FS gating different tasks.
- Each constraint has a **responsible party** (e.g., architect for FD, owner for FS).

### Constraint enforcement (Locked — default behavior)

- FD/FS is **fixed** to its assigned task.
- If the responsible party misses the planned date:
  - The user enters the **actual delivery date** for FD or FS.
  - The gated task is extended by the duration of the delay.
  - Everything downstream recalculates.
  - The baseline comparison shows exactly how many days the delay cost the project.
  - The responsible party is **on record** for the delay.

### Unlock mode (manual override)

- The user can **unlock** FD or FS and reposition it without triggering a schedule recalculation.
- Use case: "The architect will deliver design 2 weeks late, but we have enough info to keep submittal coordination moving."
- In this mode, the constraint is **informational only** — it shows on the timeline but doesn't enforce schedule impact.
- The user must explicitly unlock; the default is always locked/enforced.

### Visual distinction
- FD and FS milestones are displayed in **dark blue** and extend **above** the timeline bar.
- Contractor milestones extend **below** the bar.
- This visually separates "their responsibility" (above) from "our responsibility" (below).

---

## 8. Review Rounds

- The user selects 1, 2, or 3 review rounds when creating a procurement item.
- **1 round:** 1st Review → Approval
- **2 rounds:** 1st Review → Vendor Rev 1 → REV 1 Review → Approval
- **3 rounds:** 1st Review → Vendor Rev 1 → REV 1 Review → Vendor Rev 2 → REV 2 Review → Approval
- Default is 3 rounds.
- Changing review rounds preserves previously edited durations for matching task names.

---

## 9. Database Schema Summary

| Table                     | Purpose |
|---------------------------|---------|
| `procurement_timelines`   | Main record: name, description, delivery date, current timeline data, FD/FS dates, status (draft/active/complete) |
| `timeline_baselines`      | Permanent numbered snapshots: baseline_number, full snapshot (JSONB), created_at |
| `timeline_assignments`    | Links tasks and FD/FS milestones to responsible team members |
| `project_team`            | Team member directory: name, title, company, role, contact info |
| `roles`                   | Lookup table for role categories and sub-roles |

### Fields to add to `procurement_timelines`
- `status` — draft / active / complete
- `baseline_count` — number of baselines set (for quick reference)

### New table: `timeline_baselines`
- `id` — primary key
- `timeline_id` — references procurement_timelines
- `baseline_number` — 1, 2, 3, etc.
- `snapshot` — JSONB containing the full timeline state at time of baseline
- `created_at` — when the baseline was set
- `created_by` — who set the baseline

### Fields to add to task tracking (inside timeline_data JSONB or separate table TBD)
- `task_status` — not_started / in_progress / complete
- `actual_start` — date
- `actual_finish` — date

### New table or field for edit audit trail
- `timeline_id`
- `task_name`
- `field_changed`
- `old_value`
- `new_value`
- `reason`
- `changed_by`
- `changed_at`

---

## 10. Procurement Schedule Page (Gantt View)

- Displays all procurement items in a **Gantt chart** style layout.
- Each row = one procurement item (narrow bar with colored phase segments).
- Shared calendar axis with **zoom levels**: quarters → months → weeks → days.
- Timeline spans from a few weeks before the earliest start date to the end of the latest delivery date.
- **"You Are Here"** dashed line shows the current date.
- Clicking a bar opens the item for viewing/editing.
- Colors of each phase match the colors from the input page.

---

## Summary of Scenarios

| Scenario | Anchor | Calculates | User can edit |
|----------|--------|------------|---------------|
| Draft, no baseline | Delivery date (fixed) | Start date backward | Everything freely |
| Active, start in future | Delivery date (fixed) | Start date backward | Durations (with reason). FD/FS dates. |
| Active, start in past | Start date (locked) | Delivery date forward | Durations (with reason). Delivery is calculated only. |
| Complete | Everything locked | Nothing | Nothing without admin reopen |
| FD/FS locked | Constraint enforced | Downstream tasks shift on miss | Enter actual date for FD/FS |
| FD/FS unlocked | Constraint informational | No schedule impact | Reposition freely |
