# JiTpro — Build Roadmap

> Purpose: Execute development in the correct order based on CURRENT_STATE_UPDATED.md
> This document is a living checklist. Claude must update it as tasks are completed.

---

## Rules

* Always read `CURRENT_STATE_UPDATED.md` before executing any task
* Only work on tasks marked **NEXT** or **IN PROGRESS**
* When a task is completed:

  * Mark it as COMPLETE
  * Add notes on what was done
* Do NOT skip phases
* Do NOT introduce new features outside this roadmap

---

# STATUS LEGEND

* NOT STARTED
* IN PROGRESS
* COMPLETE
* BLOCKED

---

# PHASE 1 — SYSTEM INTEGRITY

## 1. Fix RLS (Multi-Company Bug)

Status: COMPLETE

Tasks:

* Replace all usage of `current_company_id()` — DONE
* Use `user_belongs_to_company(company_id)` in all RLS policies — DONE
* Verify multi-company access works correctly — DONE

Notes:

* `docs/schema/migrations/000_full_migration.sql` updated: all 22 RLS policies now use `user_belongs_to_company()` instead of `current_company_id()`. All `FOR ALL` policies now include both `USING` and `WITH CHECK` clauses.
* `supabase/migrations/20260406000000_rls_multi_company_fix.sql` created: copy of migration 008 so it's tracked by Supabase CLI.
* `docs/schema/migrations/README.md` updated: full migration index (001-010), notes `current_company_id()` as deprecated.
* `docs/CURRENT_STATE_UPDATED.md` updated: blocker status, RLS pattern description, risk entries, conflict #5, infrastructure section.
* Standalone migration files 004 and 005 already used `user_belongs_to_company()` — no changes needed.
* No frontend code references `current_company_id()` — zero application code changes needed.
* Migration 008 SQL was run successfully in production Supabase on 2026-04-06.
* Multi-company behavior manually verified in the app — projects, procurement items, and cost codes display correctly when switching between companies.

---

## 2. Separate Sandbox from Production Database

Status: COMPLETE

Tasks:

* Create new Supabase project for sandbox — DONE
* Add new environment variables — DONE
* Point `/demo/*` routes to sandbox DB — DONE
* Verify no shared data between systems — DONE

Notes:

* New Supabase project created (jitpro-sandbox).
* `VITE_SANDBOX_SUPABASE_URL` and `VITE_SANDBOX_SUPABASE_ANON_KEY` added to `.env` (gitignored).
* `supabase/sandboxClient.ts` created — exports `sandboxSupabase` client.
* All 3 demo pages (`ProcurementTimeline.tsx`, `ProcurementSchedule.tsx`, `ViewProcurementTimeline.tsx`) switched from `supabase` to `sandboxSupabase`.
* `AuthContext.tsx` updated with dual-login (sandbox signs in alongside production) and dual-logout.
* `ProcurementTimeline.tsx` updated to use sandbox auth user ID for `user_id`, `created_by`, `changed_by` fields instead of production session.
* `docs/schema/sandbox_bootstrap.sql` created — idempotent SQL script to create all 6 sandbox tables with RLS and seed data.
* Sandbox bootstrap SQL was run in jitpro-sandbox Supabase project.
* A matching user account must exist in the sandbox Supabase Auth (same email/password as production).

---

## 3. Remove Dead Code

Status: NOT STARTED

Tasks:

* Delete `sampleData.ts`
* Confirm no references exist

Notes:

---

## 4. Verify RLS Migration Applied

Status: COMPLETE

Tasks:

* Confirm migration 008 exists in production DB — DONE
* Apply manually if missing — DONE (applied 2026-04-06)

Notes:

* Migration 008 was run successfully in production Supabase SQL Editor on 2026-04-06.
* Multi-company behavior manually verified in the app.
* See Task 1 notes for full details.

---

# PHASE 2 — CORE PROCUREMENT COMPLETION

## 5. Vendor System

Status: NOT STARTED

Tasks:

* Build vendor CRUD UI
* Connect to `vendors` table
* Add vendor selection in Scope Builder

Notes:

---

## 6. Location System

Status: NOT STARTED

Tasks:

* Build project location management UI
* Connect to `project_locations`
* Allow assignment to procurement items

Notes:

---

## 7. Submittal System

Status: NOT STARTED

Tasks:

* Add submittal toggle + selection
* Connect to `submittal_types`
* Write to junction table

Notes:

---

## 8. Project Team System

Status: NOT STARTED

Tasks:

* Build team management page
* Manage `project_members`
* Assign roles

Notes:

---

# PHASE 3 — AUTH + USER SYSTEM

## 9. Invitation System

Status: NOT STARTED

Tasks:

* Create invite flow
* Build Supabase Edge Function
* Send emails (Resend)
* Accept invite → create user

Notes:

---

## 10. Role Enforcement

Status: NOT STARTED

Tasks:

* Restrict UI by role
* Restrict actions by role

Notes:

---

# PHASE 4 — CONTROL TOWER

## 11. Production Timeline System

Status: NOT STARTED

Tasks:

* Replace sandbox timelines with project-scoped system
* Move away from JSONB structure

Notes:

---

## 12. Schedule Page

Status: NOT STARTED

Tasks:

* Build schedule UI
* Integrate procurement items + timeline

Notes:

---

## 13. Requests System

Status: NOT STARTED

Tasks:

* Build request/RFI system
* Connect to procurement items

Notes:

---

## 14. Documents System

Status: NOT STARTED

Tasks:

* File upload system
* Attach to items

Notes:

---

# PHASE 5 — BUSINESS LAYER

## 15. Billing System

Status: NOT STARTED

Tasks:

* Integrate Stripe
* Add subscription logic

Notes:

---

## 16. Notifications System

Status: NOT STARTED

Tasks:

* In-app notifications
* Email notifications

Notes:

---

# PHASE 6 — STABILITY

## 17. Testing

Status: NOT STARTED

Tasks:

* Add basic unit tests
* Add integration tests

Notes:

---

## 18. Error Handling

Status: NOT STARTED

Tasks:

* Add UI error states
* Add logging

Notes:

---

# CURRENT FOCUS

Claude must ONLY work on the FIRST incomplete task in the roadmap.
