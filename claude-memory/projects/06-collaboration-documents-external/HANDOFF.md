# 06 — Collaboration, Documents & External Handoff

## Status: Not Started — No Code Exists

## Current State
- Nav items for Documents and Requests are disabled (`disabled: true` in navConfig.ts)
- No file storage integration exists
- No RFI/request data model exists
- No external user access model exists

## Prerequisites Before Starting
- Project 02 (Core Data) — vendors and team must exist for document/RFI context
- Project 05 (Procurement Engine) — timelines should be in production so documents can attach to timeline phases
- Multiple design decisions needed:
  - File storage approach (Supabase Storage vs. S3 vs. other)
  - RFI workflow design
  - External user access model (read-only links? guest accounts? separate portal?)

## When This Project Starts — First Steps
1. Design file storage architecture
2. Build document upload attached to procurement items
3. Then design RFI workflow before building it

## What NOT to Redo
- Do not build a general-purpose document management system — documents serve procurement, not the reverse (see OBJECTIVE.md)
