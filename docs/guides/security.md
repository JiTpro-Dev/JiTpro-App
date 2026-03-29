# SECURITY.md

## Purpose

This document defines the security practices for the JiTpro codebase.

The primary goal is to prevent exposure of credentials, secrets, and sensitive infrastructure configuration.

---

# Secret Management

Secrets must never be committed to the repository.

Secrets include:

• API keys
• service tokens
• database credentials
• authentication secrets
• webhook signing keys
• payment processor secrets

Secrets must be stored in:

• local `.env.local` files for development
• Cloudflare environment variables for production
• Supabase project secrets for server-side functions

---

# Frontend vs Backend Variables

Variables prefixed with:

VITE_

are exposed to the browser.

These variables are **not private** and must never contain sensitive secrets.

Examples of acceptable VITE variables:

VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
VITE_TURNSTILE_SITE_KEY

Examples of variables that must never be exposed to the frontend:

RESEND_API_KEY
SUPABASE_SERVICE_ROLE_KEY
STRIPE_SECRET_KEY

---

# Environment Files

Local development secrets should be placed in:

.env.local

This file must be listed in `.gitignore`.

---

# Prohibited Practices

The following actions are strictly prohibited:

• Hardcoding secrets in source code
• Logging secrets to console output
• Committing `.env` files with real values
• Copying secrets into documentation or comments
• Exposing server secrets in frontend code
• Never paste real secrets into AI prompts or chats

---

# Incident Response

If a secret is exposed in:

• Git commits
• logs
• screenshots
• chat conversations
• documentation

then it must be treated as compromised.

Immediate actions:

1. Revoke the exposed credential
2. Generate a new key
3. Update environment variables
4. Remove the secret from source history if necessary

---

# Reporting Security Issues

If a vulnerability is discovered:

1. Do not disclose it publicly
2. Notify the repository owner immediately
3. Fix the issue before deployment

---

## Supabase Key Safety

Supabase provides two types of keys:

ANON KEY
Used in frontend applications. Safe to expose.

SERVICE ROLE KEY
Has full database privileges and must never be exposed to the client.

Rules:

• Service role keys must only exist in server-side environments.
• Service role keys must never appear in frontend code.
• Service role keys must never be committed to the repository.
• If a service role key is exposed it must be rotated immediately.
