# 03 — Company Workspace

## Scope

Post-setup company management: editing company profile, managing settings, and improving the company-level workspace experience.

## What Is Built

- Company Home page with project summary cards and quick actions
- All company directory pages (People, Organizations, Cost Codes, Calendars, Templates)
- Setup wizard creates all company data
- Company switcher in nav

## What Is Not Built

- Company profile editing after setup
- Settings page (currently 5 placeholder cards: Company Profile, User Management, Subscription, Notifications, Integrations)
- Company deletion (exists on Dashboard but no confirmation of data cascade)
- Editing existing contacts, cost codes, calendars, or templates outside of setup wizard

## What Is Blocked

- Settings design decisions not made (see open_questions.md Q3)
- Should settings reuse wizard steps or be separate forms?

## Next Likely Steps

1. Build company profile edit form (reuse setup step 1 fields)
2. Build individual settings sections
3. Add contact CRUD outside of setup wizard
4. Add cost code editing outside of setup wizard
5. Add calendar/holiday editing outside of setup wizard
