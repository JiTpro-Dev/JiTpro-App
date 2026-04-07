# 04 — Project Setup & Activation Handoff

## Status: Not Started

## Current State
- Project creation works (CreateProject.tsx — name, number, description, address fields)
- Projects display in grid with status badges (Active/Completed/On Hold)
- Project status is always set to 'active' on creation — no way to change it
- No project edit form, no deletion, no archival

## Prerequisites Before Starting
- Project 02 (Core Data) should be complete — project team management is in Project 02
- Design decision needed: soft-delete vs. hard-delete for projects (see open_questions.md Q4)

## When This Project Starts — First Steps
1. Add project edit form (reuse CreateProject fields, add UPDATE query)
2. Add status change UI (active → on-hold → completed)
3. Decide and implement deletion/archival approach

## What NOT to Redo
- Do not redesign the Projects grid or Project Home — they work
- Do not change the project creation flow — focus on edit/lifecycle only
