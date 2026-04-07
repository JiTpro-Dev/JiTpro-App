# 00 — Launch Program

## Scope

Overall coordination of the JiTpro development program from current state through pilot launch. This project tracks cross-cutting concerns, sequencing decisions, and program-level blockers.

## What Is Known

- The app has a working foundation: auth, multi-company, setup wizard, company pages, basic project/item CRUD
- BUILD_ROADMAP.md defines 6 phases with 17+ tasks
- Phase 1 (System Integrity) is nearly complete — only dead code cleanup remains
- Phase 2 (Core Procurement Completion) is the designated next focus
- No CI/CD, no tests, no staging environment exist
- Single developer (JeffK) with AI-assisted sessions

## What Is Blocked

- No blocking issues at program level
- Individual project blockers tracked in their respective folders

## Recommended Sequencing

1. **02-core-data-and-permissions** — Vendors, locations, submittals, team (Phase 2)
2. **01-foundation-auth-and-env** — Invitation system, role enforcement (Phase 3)
3. **05-procurement-execution-engine** — Move timelines to production (Phase 4)
4. **03-company-workspace** — Settings editing, post-setup management
5. **04-project-setup-and-activation** — Project editing, lifecycle management
6. **06-collaboration-documents-external** — Documents, RFIs, external sharing
7. **07-billing-notifications-reports** — Stripe, email notifications, reports
8. **08-qa-pilot-and-launch** — Testing, staging, pilot deployment

## Key Program Decisions

- Core procurement features (vendors, locations, submittals) before auth/invitation system
- Sandbox timeline system must migrate to production before Control Tower work
- Testing strategy to be determined before pilot
