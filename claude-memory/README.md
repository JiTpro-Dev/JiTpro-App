# claude-memory

Persistent working memory for JiTpro development sessions. This system is the authoritative reference for what is built, what is planned, and what to do next.

## Structure

```
claude-memory/
  OBJECTIVE.md          — North star: what JiTpro is and must become
  CLAUDE.md             — Operating instructions for AI development sessions
  CURRENT_STATE.md      — Honest snapshot of the current build
  README.md             — This file

  wiki/
    product_overview.md       — Product vision summary
    architecture_overview.md  — Target architecture (labeled where aspirational)
    current_build.md          — Detailed implementation inventory
    domain_rules.md           — Non-negotiable domain logic
    decision_log.md           — Resolved decisions with rationale
    open_questions.md         — Unresolved technical/product questions
    source_doc_map.md         — Index of important repo docs

  projects/                   — Each folder contains:
    NN-project-name/            README.md  — Scope, status, blockers
      README.md                 TASKS.md   — Ordered action items
      TASKS.md                  HANDOFF.md — Next session briefing
      HANDOFF.md                WORKLOG.md — Permanent session history
      WORKLOG.md

    00-launch-program/
    01-foundation-auth-and-env/
    02-core-data-and-permissions/   ← ACTIVE NEXT PROJECT
    03-company-workspace/
    04-project-setup-and-activation/
    05-procurement-execution-engine/
    06-collaboration-documents-external/
    07-billing-notifications-reports/
    08-qa-pilot-and-launch/

  templates/
    project_readme_template.md
    tasks_template.md
    handoff_template.md
```

## How to Use

1. Read `OBJECTIVE.md` to understand the product
2. Read `CURRENT_STATE.md` to understand what exists today
3. Read the active project's `HANDOFF.md` for session context
4. Follow `CLAUDE.md` operating rules during development
5. After completing work:
   - Update `CURRENT_STATE.md` if build state changed
   - Append to the active project's `WORKLOG.md` (permanent history)
   - Update the active project's `HANDOFF.md` (next session briefing)
