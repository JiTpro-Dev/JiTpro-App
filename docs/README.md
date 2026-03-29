# Documentation Map

## specs/
Product requirements and feature specifications.

| File | Description |
|------|-------------|
| product-spec.md | Primary product, business, and system specification |
| technical-architecture-spec.md | System architecture decisions and technical boundaries |
| ui_ux_spec_outline.md | UI/UX structure, navigation, page inventory, interaction patterns |
| procurement-edit-logic.md | Procurement timeline edit rules, baselines, audit trail |

## architecture/
System design and implementation details.

| File | Description |
|------|-------------|
| system-overview.md | High-level architecture, system boundaries, governance rules |
| implementation.md | Concrete implementation: folder structure, routes, auth flow, schema |

## guides/
Developer workflow and style references.

| File | Description |
|------|-------------|
| consistency-guide.md | Layout and styling guide matching JiTpro marketing site |
| dev-workflow.md | Developer workflow and conventions |
| claude-instructions.md | AI agent development instructions |
| build-summary.md | Initial scaffold summary and next steps |
| security.md | Security policies and sensitive area boundaries |

## schema/
Database schema reference files.

| File | Description |
|------|-------------|
| procurement_schema.sql | Core procurement tables (timelines, team, roles, assignments) |
| procurement_schema.csv | Procurement schema in CSV format |
| profiles_table.sql | User profiles table with RLS and auto-create trigger |
| roles_seed_data.csv | Role categories and sub-roles seed data |

## content/
External-facing content and marketing material.

| File | Description |
|------|-------------|
| submittal-coordination-and-prep.md | Writeup on submittal coordination vs prep (website content) |

## data/
Data files and spreadsheets.

| File | Description |
|------|-------------|
| company_information.xlsx | Company setup field definitions (7 worksheets) |
| project_information.xlsx | Project setup field definitions |
| permission_matrix.xlsx | Role-based permission matrix (internal + external users) |

## superpowers/
Design specs and implementation plans generated during development.

| Folder | Description |
|--------|-------------|
| specs/ | Approved design specifications |
| plans/ | Implementation plans with task breakdowns |
