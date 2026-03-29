# Development Workflow

This document defines the standard development process for the JiTpro project.

The goal is to ensure safe, predictable changes to the codebase while preventing accidental exposure of secrets or unintended production changes.

---

# 1. Work Locally First

All development must begin in the local development environment.

Typical process:

1. start the local dev server
2. implement code changes
3. verify behavior locally
4. review modified files

Never assume production behavior matches local behavior until deployment is complete.

---

# 2. Plan Before Making Changes

Before editing code, define the intended change.

This is especially important when working with AI coding agents.

The plan should include:

• files to be modified
• the reason for each modification
• whether configuration or environment variables are involved

Do not modify unrelated files.

---

# 3. Make Small, Targeted Changes

Changes should be minimal and focused on the specific task.

Avoid:

• broad refactoring
• unrelated formatting changes
• dependency updates unless required
• changes to infrastructure or configuration unless explicitly requested

The goal is to keep each change easy to review.

---

# 4. Test Before Committing

Before committing changes:

• confirm the dev server runs successfully
• verify the affected pages or features work locally
• check the browser console for errors
• verify no unintended files were modified

---

# 5. Review Changes

Before committing:

• review modified files carefully
• confirm no secrets appear in code
• confirm environment variables are referenced by name only
• confirm only intended files changed

---

# 6. Commit Changes

Commit only the files related to the task.

Avoid committing unrelated changes.

Example commit message formats:

feature: add turnstile verification to contact form
fix: resolve contact form submission error
docs: update development workflow

---

# 7. Push to Repository

Push commits to the remote repository.

Typical workflow:

git add <modified-files>
git commit -m "feature: add turnstile verification"
git push

Pushing to the repository triggers deployment through Cloudflare Pages.

---

# 8. Deployment

Production deployment occurs through **Cloudflare Pages**.

When code is pushed:

1. Cloudflare builds the project
2. environment variables are injected
3. the new build is deployed

Environment variables must be configured in:

Cloudflare Dashboard → Pages → Settings → Environment Variables

If new environment variables are introduced, they must be added before deployment.

---

# 9. Verify Production

After deployment:

1. visit the production site
2. confirm expected behavior
3. test any integrations (forms, APIs, etc.)
4. check browser console for errors

Never assume a fix is live until verified in production.

---

# 10. Secret Handling

Secrets must remain outside the repository.

Local development:

.env.local

Production:

Cloudflare environment variables

Rules:

• never commit real secrets
• never hardcode API keys in source files
• reference secrets only through environment variables

---

# 11. Incident Response

If a secret is exposed:

1. revoke the key immediately
2. generate a replacement
3. update environment variables
4. redeploy the application

Treat any exposed credential as compromised.

---

# Guiding Principle

Changes should be **small, deliberate, and easy to verify**.

Local changes must always be validated before assuming they affect production.
