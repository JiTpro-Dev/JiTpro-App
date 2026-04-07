# 01 — Foundation: Auth & Environment

## Scope

User invitation system, role enforcement in UI, and environment hardening (staging, CI/CD).

## What Is Known

- Email/password auth works via Supabase Auth
- `handle_new_user()` trigger exists but is a no-op
- Resend API key exists in env for email sending
- `app_metadata.is_super_admin` flag exists but no UI enforcement
- `users` table has `role` column (text) but no role-based UI restrictions
- No CI/CD pipeline exists
- No staging environment exists
- No automated tests exist

## What Is Built

- Login / logout / password reset flow
- RequireAuth route guard
- AuthContext with session management
- Setup wizard creates primary + secondary admin users
- RLS enforces data-level access control

## What Is Not Built

- User invitation flow (token generation, email, onboarding)
- Role-based UI restrictions (all users see all nav items)
- CI/CD pipeline
- Staging environment
- Automated tests

## What Is Blocked

- Email sending requires Resend integration (API key exists, no code)
- Invitation flow design decisions not yet made (see open_questions.md Q1)

## Next Likely Steps

1. Design invitation flow (email + token vs. magic link vs. admin creation)
2. Implement email sending via Resend
3. Build invitation UI (admin sends invite → user receives email → user creates password)
4. Add role-based UI visibility (hide/disable nav items and actions by role)
5. Consider CI/CD and staging environment setup
