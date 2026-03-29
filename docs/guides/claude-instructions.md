# JiTpro Application - Development Instructions

## Overview

JiTpro is a construction procurement intelligence platform. This is the authenticated
application, separate from the marketing website (JiTpro-Website).

- Application deploys to: app.jit-pro.com
- Marketing site deploys to: jit-pro.com

## Stack

- React 18 + TypeScript
- Vite 5
- Tailwind CSS 3
- Supabase (auth + database)
- React Router v7

## Supabase

Shared Supabase project with the marketing site.

Environment variables (in .env):
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

## Authentication Model

Invite-only via Supabase Auth. Users cannot create accounts publicly.

Flow:
1. User requests access via marketing site contact form
2. JiTpro team reviews request
3. Admin sends invite through Supabase
4. User receives invite email and sets password
5. User logs in

First admin: Jeff Kaufman (created manually in Supabase dashboard)

## Project Structure

```
src/
├── components/        # Reusable UI (Button, Input, Card, Navbar)
├── pages/             # Route pages (Login, ResetPassword, Dashboard)
├── layouts/           # AuthLayout, AppLayout
├── auth/              # requireAuth.tsx (protected route wrapper)
├── services/          # API logic (users.ts, projects.ts)
├── hooks/             # useAuth.ts, useUser.ts
├── context/           # AuthContext.tsx
├── styles/            # globals.css
├── utils/             # formatDate.ts, validators.ts
├── config/            # App configuration
├── App.tsx
└── main.tsx
supabase/
└── client.ts
```

## Pages

- `/login` - Email/password login with Remember Me and Forgot Password
- `/reset-password` - Password reset via Supabase resetPasswordForEmail
- `/dashboard` - Protected. Shows welcome message with navbar and logout

## Protected Routes

Routes requiring auth: /dashboard, /projects (future), /settings (future).
Unauthenticated users are redirected to /login.

## Database

Current table: `profiles` (see docs/schema/profiles_table.sql)

Future tables (not yet created):
- projects
- procurement items
- constraints
- dependencies
- schedule impacts

## Styling

- Slate color palette
- Clean, minimal, professional
- Match marketing site design system

## Important Rules

- Do NOT modify the JiTpro-Website repo
- Do NOT add unnecessary complexity
- Keep the codebase simple and modular
- Build only what is specified
