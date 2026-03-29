# CLAUDE.md

## Purpose

This repository contains the JiTpro website and application codebase.

Claude (or any AI coding agent) must follow the rules in this file before making changes.
The goal is to ensure safe, minimal, and predictable modifications to the codebase.

---

# Core Operating Principles

1. Make the **smallest possible change** required to complete the task.
2. **Do not refactor unrelated code.**
3. **Do not rename, move, or delete files** unless explicitly instructed.
4. **Do not install or remove packages** unless explicitly instructed.
5. **Do not modify database schema, migrations, authentication logic, deployment configuration, or production infrastructure unless explicitly requested.**
6. **Do not commit or push changes unless explicitly requested.**
7. **Preserve existing architecture and styling.**

---

# Planning Requirement

Before editing any files, provide a short plan that includes:

• Files that will be modified
• Why each file must change
• Whether environment variables or configuration changes are required
• Any potential risks

Do not begin edits until this plan has been shown.

---

# Secrets and Environment Variables

Secrets must never appear in source code.

Rules:

• Never hardcode API keys, tokens, passwords, or secrets.
• Never print `.env` contents.
• Never copy values from `.env` files into source files.
• Never log secrets to the console.

Environment variables must be referenced by **name only**.

Example:

Correct:
process.env.RESEND_API_KEY

Incorrect:
"rsnd-actual-secret-key"

Important:

Variables beginning with `VITE_` are exposed to the browser and must **not contain true secrets**.

Server-only secrets must remain server-side.

Examples of true secrets:

• email service API keys
• service role keys
• payment processor secrets
• webhook signing secrets
• database credentials

---

# Environment Files

These files are sensitive:

.env
.env.local
.env.production
.env.development

Claude must **not read, modify, or expose values** from these files unless explicitly instructed.

---

# Safe Editing Areas

Claude may safely edit:

• page content
• React components
• UI layout and styling within scope
• utility functions related to the task
• documentation files

---

# Restricted Areas (Ask First)

Do not modify these without explicit instruction:

• package.json
• vite.config.*
• Cloudflare configuration
• Supabase configuration
• database migrations
• authentication logic
• middleware
• CI/CD configuration
• deployment scripts
• DNS or domain configuration

---

# Change Discipline

When editing code:

• modify only files directly related to the request
• avoid reformatting unrelated sections
• do not remove comments unless necessary
• do not introduce new dependencies unless required

---

# Response Format After Changes

After making changes, summarize:

1. Files changed
2. Exact changes made
3. Any assumptions made
4. Manual steps required to complete deployment

---

# Production Safety

Always distinguish between:

• local code change
• committed change
• pushed change
• deployed change

Never state that a production issue is fixed unless the change has been deployed and verified.

---

# Communication Style

Claude should:

• be concise
• clearly separate reasoning from actions
• provide step-by-step instructions when requested
• ask clarifying questions if uncertain
