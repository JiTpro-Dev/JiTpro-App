# 03 — Company Workspace Handoff

## Status: Not Started

## Current State
- All company directory pages (People, Organizations, Cost Codes, Calendars, Templates) are **read-only viewers** — they display data created during Setup Wizard but cannot edit it
- Settings page exists as placeholder with 5 "Coming soon" cards
- Company profile cannot be edited after setup
- Contacts cannot be added/edited/deleted outside the wizard

## Prerequisites Before Starting
- Project 02 (Core Data) should be substantially complete — vendor/location/submittal UIs establish CRUD patterns this project will follow
- Design decision needed: Should settings reuse wizard step components or be separate forms? (see open_questions.md Q3)

## When This Project Starts — First Steps
1. Decide settings page architecture (reuse wizard vs. standalone forms)
2. Start with company profile edit — simplest, reuses existing fields
3. Then contact CRUD — highest user value after profile editing

## What NOT to Redo
- Do not rebuild the Setup Wizard — it works. This project adds **post-setup editing**, not a replacement.
- Do not change the data model — existing tables and RLS are correct
