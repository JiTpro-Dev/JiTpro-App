# System Architecture Overview

This document describes the high-level architecture and system boundaries for JiTpro.

For detailed implementation specifics such as folder structure, routes, and schema, see:

docs/architecture/implementation.md

---

## Purpose

This document explains the high-level architecture of the JiTpro codebase so contributors and AI coding agents can understand how the system is organized before making changes.

The goal is to reduce accidental changes, protect production behavior, and make development more predictable.

---

# System Overview

JiTpro currently consists of a web-based system with these main layers:

• Frontend application
• Hosting and deployment layer
• Backend services
• Environment and secret management

At a high level:

• the frontend is built locally and deployed through Cloudflare Pages
• the frontend communicates with Supabase for backend services
• public browser-safe configuration is provided through VITE_ environment variables
• true secrets must remain server-side only and must never be exposed in frontend code

---

# Core Platforms

## Cloudflare

Cloudflare is responsible for:

• hosting the deployed frontend
• managing production environment variables
• building and deploying the site from the connected GitHub repository
• serving the live production website

## Supabase

Supabase is responsible for backend capabilities such as:

• database services
• authentication, if enabled
• server-side functions, if enabled
• storage, if enabled
• API access used by the frontend

---

# Local Development

Local development runs on the developer machine through the local dev server.

Important:

• local development is separate from production
• local changes do not affect the live site until they are committed, pushed, deployed, and verified

---

# Environment Model

JiTpro uses two main environments:

## 1. Local Development

Used for development and testing on the local machine.

Typical characteristics:

• runs through localhost
• reads local environment variables
• does not automatically affect production

## 2. Production

Used for the live deployed site.

Typical characteristics:

• hosted on Cloudflare Pages
• uses Cloudflare environment variables
• requires deployment before changes become live

---

# Environment Variable Rules

## Frontend Variables

Variables prefixed with VITE_ are exposed to the browser.

These may include values such as:

• VITE_SUPABASE_URL
• VITE_SUPABASE_ANON_KEY
• VITE_TURNSTILE_SITE_KEY

These are not true secrets and may be used in frontend code.

## Server-Side Secrets

True secrets must remain server-side only.

Examples:

• RESEND_API_KEY
• SUPABASE_SERVICE_ROLE_KEY
• payment processor secrets
• webhook signing secrets

These must never be:

• hardcoded in source files
• placed in frontend code
• exposed through VITE_ variables
• committed to the repository

---

# Deployment Flow

The expected deployment flow is:

1. make changes locally
2. verify behavior locally
3. review changed files
4. commit only intended files
5. push to GitHub
6. Cloudflare Pages builds and deploys the project
7. verify behavior on the live site

Important distinction:

• local change is not the same as
• committed change, which is not the same as
• pushed change, which is not the same as
• deployed change

Never assume production is updated until the deployment is complete and verified.

---

# Architectural Boundaries

## Frontend Responsibilities

Frontend code is responsible for:

• rendering UI
• collecting user input
• calling approved backend services
• using browser-safe environment variables only

Frontend code must not:

• contain hardcoded secrets
• directly use privileged service-role credentials
• assume production-only configuration exists locally

## Backend Responsibilities

Backend systems are responsible for:

• sensitive operations
• secret handling
• privileged database actions
• protected integrations such as email sending and secure API operations

Any operation requiring a true secret should be implemented server-side.

---

# Repository Structure Guidance

The exact folder structure may evolve, but contributors should think in terms of these logical areas:

## UI / Pages

Contains route-level pages and screen-level user interfaces.

## Components

Contains reusable UI components.

## Utilities / Client Helpers

Contains helper functions and client setup logic, such as API or Supabase client initialization.

## Configuration

Contains project configuration files such as Vite configuration and other build settings.

## Documentation

Contains repo governance and operational documents, including:

• CLAUDE.md
• docs/guides/security.md
• docs/architecture/system-overview.md
• docs/guides/dev-workflow.md

---

# Sensitive / Restricted Areas

The following areas should be treated as restricted and should not be changed without explicit instruction:

• authentication logic
• database schema and migrations
• Cloudflare configuration
• Supabase configuration
• environment variable naming conventions
• deployment configuration
• DNS or domain settings
• middleware
• CI/CD settings

These areas can affect production stability, security, or infrastructure.

---

# Change Management Rules

Before making changes, contributors and AI coding agents should first identify:

• which files need to change
• why those files need to change
• whether the change affects frontend, backend, configuration, or deployment
• whether environment variables are involved

Preferred approach:

• make the smallest possible change
• avoid refactoring unrelated code
• preserve existing architecture unless explicitly told otherwise

---

# Security Model Summary

The JiTpro architecture follows these security principles:

• true secrets stay server-side
• browser code uses only browser-safe configuration
• local and production environments are separate
• no secrets are committed to the repository
• all changes should be reviewed before deployment

If a secret is ever exposed in code, chat, logs, or screenshots, it must be treated as compromised and rotated immediately.

---

# AI Agent Guidance

AI coding agents working in this repository must follow these rules:

• understand the requested scope before editing
• do not assume local behavior means production is fixed
• do not move secrets into source code
• do not modify restricted areas without explicit instruction
• prefer minimal, targeted edits
• respect the governance documents in this repo

AI agents should use this file to understand system boundaries before making architectural or configuration changes.

---

# Current Architectural Assumptions

Unless explicitly told otherwise, assume the following:

• the frontend is deployed through Cloudflare Pages
• backend services are provided through Supabase
• local development and production are different environments
• VITE_ variables are browser-visible
• true secrets must remain outside frontend code
• production behavior must always be verified after deployment
