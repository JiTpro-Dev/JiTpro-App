# Domain Rules

Non-negotiable business logic established in specs and code.

---

## Procurement Item Lifecycle

The **Procurement Item** is the atomic unit. It represents *what* must be procured.

### Item Statuses (Production)
| Status | Color | Meaning |
|--------|-------|---------|
| `ready` | Green (#10b981) | Design is final, selections are made |
| `pending_selection` | Amber (#f59e0b) | Design exists but selections are needed |
| `missing_design` | Red (#ef4444) | Cannot procure — design information is missing |

### Item Assignment Rules
- Items are assigned to a cost code (minimum level 2 — never to a division)
- Items are disaggregated by location during scoping but re-grouped by CSI code or vendor for procurement
- Each item belongs to exactly one project and one company

---

## Procurement Timeline Lifecycle

The **Procurement Timeline** attaches to an item. It represents *when and how* procurement happens.

### Timeline Statuses
| Status | Meaning | Edit Rules |
|--------|---------|------------|
| `draft` | No baseline exists | Fully editable |
| `active` | At least one baseline set | Edits require a reason (audit trail) |
| `complete` | Delivered | Locked — only higher admin can reopen |

### Task-Level Status
- Not Started, In Progress, Complete
- Tasks can be marked out of sequence
- All updates must happen before marking Complete

---

## Baseline Rules

Baselines are the **core accountability mechanism**.

1. Baselines are permanent, numbered snapshots (Baseline 1, 2, 3...)
2. **Cannot be edited or deleted** — append-only
3. Setting the first baseline promotes an item from `draft` to `active`
4. Enable variance comparison: "Baseline 1 planned Dec 1. Current projection Dec 15. 14-day delay."

---

## Edit Reason Rules

When editing an `active` timeline:
1. A reason **must** be entered (e.g., "Fabrication delayed 15 days due to steel shortage")
2. Creates a permanent audit record with:
   - Field changed
   - Old value → New value
   - Reason text
   - Who changed it
   - Timestamp
3. Edit logs **cannot be edited or deleted** — append-only

---

## Calculation Modes

### Mode A — Start in Future (Backward Calculation)
- Delivery date is fixed (required-on-site date)
- Start date calculates backward from delivery
- If start lands before today: visual flag — "This timeline requires starting X working days before today"

### Mode B — Start in Past (Forward Calculation)
- Start date is locked
- Delivery date calculates forward
- Delivery is calculated-only, no manual override

---

## FD/FS Constraint Behavior

**Final Design (FD)** and **Final Selection (FS)** are owner/architect decision milestones.

- Separate from contractor's timeline — visually shown above the timeline
- Can be **locked** (enforced) or **unlocked** (informational only)
- When locked and missed: the gated task extends by the delay duration
- Purpose: accountability — "Architect missed design date. Schedule impact: 7 days."

---

## Procurement Phase Structure

Canonical 8-phase sequence (with optional review rounds):

| # | Phase | Type | Default Days |
|---|-------|------|-------------|
| 1 | Start Buyout | Milestone | 0 |
| 2 | Buyout | Phase | 15 |
| 3 | Submittal Coordination | Phase | 22 |
| 4 | Submittal Preparation | Phase | 22 |
| 5 | Initial Submittal | Milestone | 0 |
| 6 | 1st Review | Phase | 15 |
| 7 | Vendor Rev 1 | Phase | 8 (if 2+ rounds) |
| 8 | REV 1 Review | Phase | 10 (if 2+ rounds) |
| 9 | Vendor Rev 2 | Phase | 5 (if 3 rounds) |
| 10 | REV 2 Review | Phase | 6 (if 3 rounds) |
| 11 | Approval | Milestone | 0 |
| 12 | Release to Fab | Milestone | 0 |
| 13 | Fabrication | Phase | 130 |
| 14 | Shipping | Phase | 8 |
| 15 | Delivered - Ready for Install | Milestone | 0 |

Review rounds: user selects 1, 2, or 3. Changing rounds preserves previously edited durations for matching task names.

---

## Submittal Coordination vs. Submittal Preparation

These are **distinct phases** — this is a core JiTpro insight.

**Submittal Coordination** (contractor's responsibility):
- Getting the vendor everything they need: RFI responses, multi-disciplinary review, design clarifications, owner decisions
- Duration varies dramatically by item complexity
- Most contractors underestimate this because it's invisible in traditional scheduling

**Submittal Preparation** (vendor's responsibility):
- Producing the actual submittal package: shop drawings, product data, samples, calculations
- Duration is usually well-known (vendors quote this)

Separating them forces accountability: if coordination runs long, baselines show the delay was in coordination, not vendor production.

---

## Cost Code Hierarchy Rules

**Source of truth: column position determines level, NOT code format.**

| Column | Level | Parent |
|--------|-------|--------|
| division_code | 1 | NULL |
| section_code | 2 | Division |
| subsection_code | 3 | Section |
| paragraph_code | 4 | Subsection |

### Strict Rules
- Do NOT infer hierarchy from trailing "00" or decimal suffixes
- Decimal codes (e.g., "09 25 13" vs "09 25 13.13") are siblings if in the same column
- Parent is always the previous non-empty column in the row
- Store codes exactly as-is — do not parse or split code strings
- Items cannot be assigned to division level (level 1) — minimum is section (level 2)
- Trigger `enforce_cost_code_hierarchy` validates parent-child level rules in DB

---

## Copy-on-Create / No-Cascade Rules

- PCL templates are copied into project context, not referenced — editing a template does not affect existing projects
- Deleting a company contact does not cascade to procurement items
- Cost code deletion and re-import replaces the full tree (DELETE + INSERT pattern in setup)

---

## Canonical Terminology

| Correct | Incorrect | Notes |
|---------|-----------|-------|
| Dashboard | Home (for company picker) | `/dashboard` route |
| Company Home | Dashboard (for company workspace) | `/app/home` route |
| Project Home | Dashboard / Overview | `/app/project/:id/home` |
| Procurement Item | Item (standalone) | Always "Procurement Item" in formal context |
| Procurement Timeline | Timeline (standalone) | Always child of an item |
| Selection Register | Spec Register | "Spec Register" is disallowed |
| Contact | User (for non-login records) | Contacts cannot log in |
| User Account | Contact (for login identities) | Users have auth.users records |
