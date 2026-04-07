# Session Handoff — 2026-04-06

> Read this file at the start of the next session to resume where we left off.
> After resuming, this file can be deleted.

---

## CURRENT FOCUS

Primary task:
Get cost code CSV import working so Scope Builder renders correctly.

DO NOT switch tasks until this is complete.

---

## Required Reading (in order)

1. `CLAUDE.md` — project rules
2. `docs/CURRENT_STATE_UPDATED.md` — authoritative system state
3. `docs/BUILD_ROADMAP.md` — task tracker (Phase 1 complete, Phase 2 next)
4. `docs/glossary.md` — locked system language (v3)

---

## What Was Completed Today (2026-04-06)

### Phase 1 — System Integrity (ALL COMPLETE)

1. **RLS multi-company bug fix** — Migration 008 applied to production. All RLS policies now use `user_belongs_to_company()`. Verified in app.
2. **Sandbox/production separation** — New Supabase project (`jitpro-sandbox`) created. `/demo/*` routes use `sandboxSupabase` client. Dual-login/logout in AuthContext. Sandbox bootstrap SQL run. Demo pages use sandbox auth user ID for row ownership.
3. **Dead code** — `sampleData.ts` still exists but is not imported anywhere. Deletion is Task 3 (not started, trivial).
4. **RLS migration verified** — Applied and confirmed in production.

### Documentation Overhaul

- `docs/CURRENT_STATE_UPDATED.md` created as authoritative system doc (Sections 1-15)
- `docs/glossary.md` rewritten to v3 with enforced naming rules, canonical relationships, disallowed terminology
- `docs/BUILD_ROADMAP.md` created and maintained as living checklist
- 13 outdated docs archived to `docs/archive/`
- 4 spec docs restored with "Design / Intent" headers
- `docs/README.md` rewritten to reflect new structure

### Code Changes

- `src/pages/app/pre-bid/AddItemForm.tsx` — added `vendor_id: null`, `requires_submittal: false`
- `src/pages/app/pre-bid/SelectionRegister.tsx` — removed unused `CostCode` import
- `src/layouts/AppShell/TopBar.tsx` — added back-to-dashboard icon
- `public/_redirects` — restored SPA routing for Cloudflare Pages
- `supabase/sandboxClient.ts` — new sandbox Supabase client
- `src/context/AuthContext.tsx` — dual-login/logout for sandbox
- `src/pages/demos/*.tsx` — all 3 demo pages switched to sandboxSupabase
- `src/pages/demos/ProcurementTimeline.tsx` — sandbox user ID for inserts/updates
- `src/pages/demos/ProcurementSchedule.tsx` — tooltip anchored to segment with flip logic
- `src/pages/setup/steps/CostCodes.tsx` — CSV parser reverted to hierarchical-only (flat parser removed)
- `docs/schema/sandbox_bootstrap.sql` — idempotent sandbox schema creation script
- `supabase/migrations/20260406000000_rls_multi_company_fix.sql` — RLS fix tracked by Supabase CLI
- Multiple migration and doc files updated

---

## Where to Pick Up

### Immediate Next Step: Cost Code Import

The user has a large CSI MasterFormat cost code list in xlsx (hierarchical 8-column format). The CSV parser is verified and ready:

- Parser: `src/pages/setup/steps/CostCodes.tsx` — `parseCostCodeCSV()`
- Format: 8 columns — division_code, division_title, section_code, section_title, subsection_code, subsection_title, paragraph_code, paragraph_title
- Hierarchy comes from column position, NOT from code format
- Decimal codes (e.g., "02 41 16.13") are fully supported and stored as-is
- Parser was analyzed and verified against 4 test cases with decimal codes on 2026-04-06

**The user needs to:**
1. Export their xlsx to CSV (8 columns + header row)
2. Upload via Setup Wizard Step 5 ("Upload Your Own")
3. This populates the company's `cost_codes` table
4. Scope Builder then works (reads cost codes, enables item creation)

### After Cost Code Import

Once cost codes are loaded and Scope Builder is functional:

- **Phase 1, Task 3** — Delete `sampleData.ts` (trivial)
- **Phase 2** — Core Procurement Completion (Vendors, Locations, Submittals, Team)
- See `docs/BUILD_ROADMAP.md` for full task list

---

## CRITICAL — COST CODE IMPORT RULES (DO NOT VIOLATE)

We are importing a large CSI cost code dataset via CSV into the cost_codes table.

The spreadsheet structure is FINAL and MUST NOT BE CHANGED.

### 1. Hierarchy Source of Truth

Hierarchy is defined ONLY by column position:

- division_code → level 1
- section_code → level 2
- subsection_code → level 3
- paragraph_code → level 4

DO NOT infer hierarchy from:
- trailing "00"
- decimal suffixes (e.g., .13)
- number of segments

### 2. Decimal Codes

Codes like:
- 09 25 13
- 09 25 13.13

ARE siblings when in the same column.

Parent is determined by the column, NOT the code.

Example:
09 00 00 → 09 20 00 → 09 25 00 → 09 25 13
09 00 00 → 09 20 00 → 09 25 00 → 09 25 13.13

Both children of 09 25 00.

### 3. Subsection Behavior

Subsection codes may include:
- standard codes (10 06 10)
- decimal codes (10 06 10.13)

These are ALL level 3 if in subsection_code column.

They are NOT parent/child of each other.

### 4. Parser Behavior (REQUIRED)

Parser must:
- assign level strictly from column index
- assign parent from previous non-empty column in the same row
- store code strings exactly as-is
- NOT parse or split code strings
- NOT infer relationships from decimals

### 5. Data Cleaning Rules

Before import:
- NULL values removed
- trailing spaces removed (TRIM applied and values pasted)
- no modification to hierarchy or column structure

### 6. Current Status

- Spreadsheet cleaned (NULL removal, TRIM in progress)
- Parser reverted to hierarchical-only (flat parser removed)
- Ready for final trim → CSV export → import → Scope Builder validation

### 7. Next Step (START HERE)

1. Finish TRIM replacement for all code columns
2. Export CSV (UTF-8)
3. Upload in Setup Wizard
4. Verify:
   - divisions render
   - hierarchy is correct
   - decimal codes appear as siblings

---

## Key Decisions Made

1. **Procurement Item is parent, Procurement Timeline is child** — locked in glossary v3
2. **Selection Register is canonical name** — "Spec Register" is disallowed
3. **Dashboard vs Company Home** — Dashboard = `/dashboard` (company picker), Company Home = `/app/home` (workspace)
4. **Cost code hierarchy from column position only** — no code-format inference, no decimal parsing
5. **Sandbox isolation via separate Supabase project** — not just separate tables

---

## Uncommitted Changes

There are likely uncommitted changes from today's work. Run `git status` and `git diff --stat` to see what needs committing before starting new work.
