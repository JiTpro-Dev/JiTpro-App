# Claude Operating Instructions for JiTpro Sessions

## Session Start Sequence (REQUIRED)

Every session MUST begin with these steps. Do not skip any.

1. Read `/claude-memory/OBJECTIVE.md` — Understand the north star
2. Read `/claude-memory/CURRENT_STATE.md` — Understand what is actually built today
3. Read `/claude-memory/wiki/current_build.md` — Implementation details (routes, auth, DB, components)
4. Read `/CLAUDE.md` — Repo-level rules and restrictions
5. Read the active project's `HANDOFF.md` — Context from the last session
6. If the user specifies a project, also read that project's `README.md` and `TASKS.md`
7. Before starting work, identify:
   - What exists in code (verify — do not assume)
   - What is missing
   - What should be done next

**Agents MUST NEVER assume a feature exists unless verified in code.** Reading a spec or doc that describes a feature does not mean it is built. Check the route in `src/App.tsx`, verify the component renders real data, and confirm Supabase queries work.

## Core Operating Rules

### 1. Code Reality vs. Spec Vision

Never assume a feature exists because it appears in a spec document. The specs describe the **target product**, not the current build.

Before claiming something works:
- Verify the route exists in `src/App.tsx`
- Verify the component renders real data (not placeholder text)
- Verify the database table has RLS policies that are actually applied
- Verify the Supabase query runs and returns data

### 2. Three-State Classification

Always classify features as one of:
- **Confirmed in code** — Route exists, component renders, data flows
- **Schema only** — Table exists in migrations but no UI or queries use it
- **Spec only** — Described in docs but no code exists

### 3. Updating CURRENT_STATE.md

After completing meaningful work, update CURRENT_STATE.md:
- Move items between "Built", "Partially Built", and "Not Built" sections
- Add the date of the update
- Be specific about what changed

### 4. Updating Project HANDOFF.md

At the end of every working session, update the active project's HANDOFF.md:
- What was accomplished
- What is blocked
- What should happen next
- Any decisions made or questions raised

### 5. Change Discipline

- Make the smallest possible change
- Do not refactor unrelated code
- Do not install packages without explicit instruction
- Do not modify database schema, auth, or deployment config without explicit instruction
- Do not commit or push without explicit instruction

### 6. Decision and Question Logging

When a non-obvious decision is made during a session:
- Add it to `/claude-memory/wiki/decision_log.md` with date and rationale

When an unresolved question is discovered:
- Add it to `/claude-memory/wiki/open_questions.md`

### 7. Architectural Honesty

Never blur the line between:
- **Implemented app** — what users can do today
- **Planned app** — what the roadmap says will be built
- **Aspirational app** — what the specs envision long-term

If something is partially built, say exactly what works and what doesn't.

## WORKLOG Rules

- Every session MUST append an entry to the active project's `WORKLOG.md`
- WORKLOG is a **permanent history log** — never overwrite or delete previous entries
- Each entry must include: date, what was worked on, what changed, key decisions, issues encountered
- `HANDOFF.md` is for **next steps** (what to do). `WORKLOG.md` is for **history** (what happened).
- If work spans multiple projects in one session, update each project's WORKLOG

## Change Control

Before making structural or architectural changes:

1. Propose the change and explain why
2. Show which files will be affected
3. Wait for user confirmation (for major changes)

Small implementation tasks (bug fixes, adding a UI component, updating styles) do not require confirmation. Structural changes include:
- Database schema modifications
- New dependencies or packages
- Authentication or RLS policy changes
- Routing architecture changes
- Deployment or infrastructure changes

## File Conventions

- Use ISO dates (YYYY-MM-DD) in all logs
- Keep TASKS.md action-oriented with clear done/not-done states
- Keep HANDOFF.md concise — it's a briefing, not a journal
- Keep WORKLOG.md append-only — each entry is a permanent record
- Never write secrets, API keys, or .env values into any markdown file
