# Implementation Architecture

This document describes the concrete implementation details of the JiTpro system.

For high-level system design, deployment architecture, and governance rules, see:

docs/architecture/system-overview.md

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite 5
- **Styling:** Tailwind CSS 3
- **Authentication & Database:** Supabase
- **Routing:** React Router v7
- **Deployment Target:** app.jit-pro.com

## Project Structure

```
src/
├── components/        # Reusable UI components (Navbar)
├── pages/             # Route pages (Login, ResetPassword, Dashboard)
├── layouts/           # AuthLayout, AppLayout
├── auth/              # requireAuth protected route wrapper
├── services/          # API logic (future)
├── hooks/             # Custom hooks (future)
├── context/           # AuthContext
├── styles/            # globals.css (Tailwind entry point)
├── utils/             # Utility functions (future)
├── config/            # App configuration (future)
├── App.tsx            # Router and route definitions
└── main.tsx           # Application entry point
supabase/
└── client.ts          # Supabase client initialization
docs/
├── architecture/
│   ├── system-overview.md    # High-level architecture
│   └── implementation.md     # This file
├── guides/
│   └── claude-instructions.md
└── schema/
    └── profiles_table.sql    # Database schema SQL
```

## Auth Flow

1. JiTpro uses invite-only authentication via Supabase Auth
2. Users cannot self-register — an admin sends an invite through Supabase
3. User receives invite email, sets password, then logs in
4. Session is managed by Supabase's built-in session handling
5. Protected routes redirect unauthenticated users to `/login`

## Routes

| Path              | Auth Required | Description          |
|-------------------|---------------|----------------------|
| `/login`          | No            | Login page           |
| `/reset-password` | No            | Password reset       |
| `/dashboard`      | Yes           | Main dashboard       |
| `/projects`       | Yes           | Future               |
| `/settings`       | Yes           | Future               |

## Database Schema

### profiles

| Column     | Type      | Description                                           |
|------------|-----------|-------------------------------------------------------|
| id         | uuid (PK) | Auto-generated                                        |
| user_id    | uuid (FK) | References auth.users                                 |
| name       | text      | User's display name                                   |
| company    | text      | Company name                                          |
| role       | text      | general_contractor, owner, architect, subcontractor, admin |
| created_at | timestamp | Auto-generated                                        |

A trigger automatically creates a profile row when a new user signs up.
