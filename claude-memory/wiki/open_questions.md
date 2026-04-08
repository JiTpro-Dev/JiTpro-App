# Open Questions

Unresolved technical and product questions. Add date when raised, add resolution date and link to decision_log.md when resolved.

---

## Product Questions

**Q1: How should user invitations work?** (Raised: 2026-04-07)
- `handle_new_user()` trigger exists but is a no-op
- No token generation, no email flow, no onboarding UI
- Should invitations be email-based with token? Magic link? Manual admin creation?
- Resend API key exists in env but no sending code
- **Affects:** Project 01 (Auth & Environment)
- **Decision needed before:** Building invitation UI

**Q2: What role enforcement should exist in the UI?** (Raised: 2026-04-07, updated 2026-04-07)
- RLS handles data-level access control
- No UI-level restrictions exist (all authenticated users see all nav items and actions)
- Company directory model (decided 2026-04-07) establishes permission intent:
  - Company Admin: create/edit/deactivate directory records
  - PM: view directory, select/assign to project items
  - Superintendent: view-only everywhere
- Should directory CRUD buttons (Add/Edit/Deactivate) be hidden for non-admin roles?
- Should this be implemented now (simple flag check) or deferred to full role system?
- **Affects:** Project 01 (Auth & Environment), Project 02 (immediate — Vendors page shows edit/deactivate to everyone)
- **Decision needed before:** Shipping Vendors page to real users

**Q3: Should company settings be editable after setup?** (Raised: 2026-04-07)
- Setup wizard creates company with all settings
- No post-setup editing UI exists
- Settings page is placeholder ("Coming soon")
- Should settings reuse wizard steps, or be separate forms?
- **Affects:** Project 03 (Company Workspace)
- **Decision needed before:** Building settings page

**Q4: How should project editing and deletion work?** (Raised: 2026-04-07)
- Projects can be created but not edited or deleted
- Should deletion be soft-delete (status change) or hard-delete?
- What happens to procurement items when a project is archived?
- **Affects:** Project 04 (Project Setup & Activation)
- **Decision needed before:** Building project lifecycle management

---

## Architecture Questions

**Q5: When should Control Tower timeline move from sandbox to production?** (Raised: 2026-04-07)
- Timeline system works in sandbox with user-scoped RLS
- Production needs company-scoped RLS and connection to real procurement items
- Migration path: new production tables? Copy sandbox schema? Adapt existing?
- **Affects:** Project 05 (Procurement Execution Engine)
- **Decision needed before:** Creating production timeline migration
- **Depends on:** Project 02 completion (vendors, locations, submittals needed first)

**Q6: Should there be a centralized API/data layer?** (Raised: 2026-04-07)
- Currently each component calls Supabase directly (no shared hooks, no caching)
- No optimistic updates, no shared query patterns
- At what scale does this become a problem? Is it a problem now?
- Options: React Query, custom hooks wrapping Supabase, service layer
- **Affects:** All projects — this is a cross-cutting architecture decision
- **Decision needed before:** Building many more CRUD pages (getting harder to change later)

**Q9: Is a staging environment needed before pilot?** (Raised: 2026-04-07)
- Currently: single production Supabase instance, direct deploy from main
- Risk: breaking changes go straight to production
- Cost/complexity of adding staging vs. risk of not having it
- **Affects:** Project 08 (QA, Pilot & Launch)
- **Decision needed before:** Pilot launch

---

## Implementation Questions

**Q7: How should the cost code CSV import be validated?** (Raised: 2026-04-07)
- Current import expects exact 8-column format
- What happens with malformed rows? Duplicate codes? Missing parents?
- Should validation happen client-side, server-side, or both?
- **Affects:** Project 02 prerequisite (cost code import must work before vendor work)
- **Decision needed before:** Declaring cost code import complete

**Q8: What testing strategy should be adopted?** (Raised: 2026-04-07)
- Zero tests exist today
- What framework? Vitest for unit/integration? Playwright for E2E? Both?
- What should be tested first? (Auth flow? Setup wizard? Scope builder?)
- **Affects:** Project 08 (QA, Pilot & Launch)
- **Decision needed before:** Writing first test

**Q10: How should `sampleData.ts` be handled?** (Raised: 2026-04-07)
- Dead code — no longer imported anywhere (verified 2026-04-07 via grep)
- Contains type definitions (SubmittalType, ItemStatus, ProcurementItem, CsiDivision) but nothing uses them
- Trivial cleanup, flagged in BUILD_ROADMAP Phase 1 Task 3
- **Action:** Delete when convenient — no decision needed, just execution
