# 07 — Billing, Notifications & Reports

## Scope

Business layer: Stripe billing integration, notification system (in-app + email), and reporting. BUILD_ROADMAP Phase 5.

## What Is Built

- Billing page exists as placeholder ("Coming soon")
- NotificationBell component renders with hardcoded count 0
- Resend API key exists in environment variables
- No reports UI exists

## What Is Not Built

- Stripe integration (no code)
- Subscription management
- In-app notification storage and delivery
- Email notification system (Resend integration)
- Reports page
- Reporting queries

## What Is Blocked

- Billing model decisions (pricing tiers, trial periods)
- Notification trigger definitions (what events send notifications)
- Report requirements (what reports are needed)

## Next Likely Steps

1. Define billing model and Stripe products
2. Integrate Stripe checkout and subscription management
3. Build notification trigger system
4. Integrate Resend for email notifications
5. Build reports page with key procurement metrics
