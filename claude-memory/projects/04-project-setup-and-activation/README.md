# 04 — Project Setup & Activation

## Scope

Project lifecycle management: editing projects, changing status, archiving/deleting, and improving the project-level workspace.

## What Is Built

- Project creation form (name, number, description, address)
- Project list with status badges (Active/Completed/On Hold)
- Project Home with summary cards and division breakdown
- Project context from URL params (ProjectContext)
- Auto-add creator as project_manager on creation

## What Is Not Built

- Project editing (no edit form or update queries)
- Project deletion or archival
- Project status changes (always "active")
- Project dashboard customization
- Recent activity feed (placeholder)

## What Is Blocked

- Project deletion design decision needed (see open_questions.md Q4)

## Next Likely Steps

1. Add project edit form
2. Add project status management (active/on-hold/completed)
3. Add project archival or soft-delete
4. Improve Project Home with real activity feed
