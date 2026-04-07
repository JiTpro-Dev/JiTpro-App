# Documentation Map

> **Source of truth:** `docs/CURRENT_STATE_UPDATED.md` — all other documents must align with it.

## System State

| File | Description |
|------|-------------|
| CURRENT_STATE_UPDATED.md | Authoritative current state of the entire system |

## specs/
Product requirements, feature specifications, and design intent documents.

| File | Description | Type |
|------|-------------|------|
| jitpro-core-spec.md | Scope Builder and Selection Register specification | Current |
| procurement-edit-logic.md | Procurement timeline edit rules, baselines, audit trail (sandbox feature) | Current |
| product-spec.md | Primary product, business, and system specification | Design / Intent |
| technical-architecture-spec.md | Target technical architecture for v1 and beyond | Design / Intent |
| ui_ux_spec_outline.md | UI/UX structure, navigation, page inventory, interaction patterns | Design / Intent |
| company-app-pages-spec.md | Company and project page specifications | Design / Intent |

## guides/
Developer workflow and security references.

| File | Description |
|------|-------------|
| dev-workflow.md | Developer workflow and conventions |
| security.md | Security policies and sensitive area boundaries |

## schema/
Database schema reference and decision records.

| File | Description |
|------|-------------|
| cost_code_import_strategy_decision.md | Decision: canonical cost_codes hierarchy regardless of source |
| cost_codes_schema_decision.md | Decision: cost_codes table structure and hierarchy rules |
| scope_builder_cost_code_tree_decision.md | Decision: 4-level tree navigation, selection rules |
| migrations/README.md | Migration file index (001-010) |
| procurement_schema.sql | Core procurement tables (timelines, team, roles, assignments) |
| procurement_schema.csv | Procurement schema in CSV format |

## content/
Domain knowledge and educational content.

| File | Description |
|------|-------------|
| submittal-coordination-and-prep.md | Submittal coordination vs prep — domain reference |

## data/
Data files and spreadsheets.

| File | Description |
|------|-------------|
| company_information.xlsx | Company setup field definitions (7 worksheets) |
| project_information.xlsx | Project setup field definitions |
| permission_matrix.xlsx | Role-based permission matrix (internal + external users) |

## superpowers/
Design specifications generated during development.

| Folder | Description |
|--------|-------------|
| specs/ | Approved design specifications (AppShell, Setup Steps 3-6, Core Mockup) |

## archive/
Deprecated documents that no longer reflect the current system. Preserved for historical reference only. Each file contains a deprecation header pointing to `CURRENT_STATE_UPDATED.md`.

| File | Original Location | Reason |
|------|-------------------|--------|
| JITPRO_CURRENT_STATE.md | docs/ | Superseded by CURRENT_STATE_UPDATED.md |
| implementation.md | docs/architecture/ | Significantly outdated system description |
| system-overview.md | docs/architecture/ | Incomplete, missing current architecture |
| build-summary.md | docs/guides/ | Historical build log, completed |
| claude-instructions.md | docs/guides/ | References non-existent marketing site |
| consistency-guide.md | docs/guides/ | Marketing website guide, not app |
| 2026-03-28-app-shell-implementation.md | docs/superpowers/plans/ | Completed implementation plan |
| 2026-03-28-company-setup-steps-3-6.md | docs/superpowers/plans/ | Completed implementation plan |
| 2026-04-01-jitpro-core-mockup.md | docs/superpowers/plans/ | Completed implementation plan |
