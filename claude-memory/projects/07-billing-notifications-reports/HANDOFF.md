# 07 — Billing, Notifications & Reports Handoff

## Status: Not Started — Placeholder UI Only

## Current State
- Billing page renders "Coming soon" text (Billing.tsx)
- NotificationBell component exists with hardcoded count=0 and empty dropdown
- Resend API key exists in `.env` but no email-sending code exists anywhere in the codebase
- No Stripe integration, no subscription model, no reports page

## Prerequisites Before Starting
- Core product features (Projects 02, 05) must be functional — billing makes no sense without a usable product
- Product decisions needed:
  - Pricing tiers and trial periods
  - Which events trigger notifications
  - What reports users need (procurement status? timeline variance? project summary?)

## When This Project Starts — First Steps
1. Define billing model with user (pricing, tiers, trial structure)
2. Set up Stripe products and checkout flow
3. Then notifications — in-app first, email second

## What NOT to Redo
- Do not rebuild NotificationBell — extend it with real data
- Do not remove the Billing placeholder — replace its content with real UI
