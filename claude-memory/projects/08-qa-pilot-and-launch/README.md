# 08 — QA, Pilot & Launch

## Scope

Testing strategy, staging environment, error handling, and pilot deployment. BUILD_ROADMAP Phase 6.

## What Is Built

- Production deployment works (Cloudflare Pages, auto-deploy from main)
- Basic loading states in components
- RLS provides data-level security

## What Is Not Built

- Automated tests (unit, integration, E2E)
- Staging environment
- CI/CD pipeline
- Centralized error handling
- Error boundary components
- Logging/monitoring
- Loading skeleton states
- Performance optimization

## What Is Blocked

- Testing framework decision (see open_questions.md Q8)
- Staging environment decision (see open_questions.md Q9)

## Next Likely Steps

1. Choose test framework (Vitest + Playwright recommended)
2. Write tests for critical paths (auth, setup wizard, scope builder)
3. Set up staging environment
4. Add CI/CD pipeline (run tests on PR, deploy to staging)
5. Add error boundaries and centralized error handling
6. Conduct pilot with real users
