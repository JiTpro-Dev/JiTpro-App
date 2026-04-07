# Decision Log

Resolved decisions with rationale. Most recent first.

---

### 2026-04-06 — Sandbox isolation via separate Supabase project

**Decision:** Demo/sandbox features use a completely separate Supabase project (`jitpro-sandbox`), not just separate tables in the same database.

**Rationale:** Prevents data pollution between experimental features and production. Sandbox tables use `auth.uid()` scoping (user-level), while production uses `user_belongs_to_company()` scoping (company-level). Mixing these in one DB created confusion.

**Impact:** Two Supabase clients in code (`supabase/client.ts` and `supabase/sandboxClient.ts`). Two sets of env vars. AuthContext syncs login/logout across both.

---

### 2026-04-06 — RLS multi-company fix (migration 008)

**Decision:** Replace all uses of `current_company_id()` with `user_belongs_to_company(company_id)` in RLS policies.

**Rationale:** `current_company_id()` assumed one company per user. Users who belong to multiple companies could not access data correctly. The helper function `user_belongs_to_company()` correctly checks membership.

**Impact:** Applied to all project and procurement table policies. `current_company_id()` is deprecated but still exists in DB.

---

### 2026-04-06 — Documentation archive and restructure

**Decision:** Move older docs into `docs/archive/` and create new canonical docs: BUILD_ROADMAP.md, CURRENT_STATE_UPDATED.md, SESSION_HANDOFF.md, glossary.md.

**Rationale:** Old docs were scattered across `docs/guides/`, `docs/architecture/`, `docs/superpowers/plans/`. Consolidation improves discoverability.

---

### 2026-03-28 — Setup wizard uses security definer RPC

**Decision:** Company creation during setup uses `setup_company()` RPC function with `SECURITY DEFINER` privilege.

**Rationale:** Chicken-and-egg problem — user needs to create a company, but RLS requires user to belong to a company to write to company tables. The RPC function runs with elevated privileges to bootstrap the first company + admin user record.

---

### 2026-03-28 — Cost code hierarchy determined by column position

**Decision:** Parent-child relationships in cost codes are determined by which CSV column a code appears in, NOT by parsing the code string.

**Rationale:** CSI code formats vary (decimal suffixes, inconsistent zero-padding). Parsing codes to infer hierarchy is fragile and produces incorrect trees. Column position is unambiguous.

---

### 2026-03-25 — Procurement Item is the atomic unit, not Timeline

**Decision:** The Procurement Item (what to procure) is the parent entity. The Procurement Timeline (how long it takes) is a child attached to an item.

**Rationale:** Items exist independently of timelines (Core product doesn't require timelines). Timelines are meaningless without a parent item. This separation enables the two-tier product model (Core vs Control Tower).

---

### 2026-03-25 — Submittal Coordination and Preparation are separate phases

**Decision:** Split traditional "submittals" into two explicit phases with independent durations.

**Rationale:** Coordination (contractor gathers info for vendor) and Preparation (vendor produces submittal package) have different owners, different durations, and different risk profiles. Lumping them hides where delays actually occur.
