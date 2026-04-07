# DESIGN / INTENT DOCUMENT

This document describes the intended or future state of the system.

It may not reflect the current implementation.

Refer to:
docs/CURRENT_STATE_UPDATED.md for actual system behavior.

---

# JiTpro Technical Architecture Specification Outline

**Status:** Draft v0.1
**Purpose:** Define the target technical architecture for JiTpro v1, v1.1, and near-term evolution
**Primary reference:** JiTpro Product, Business, and System Specification
**Audience:** Engineering, product, design, QA, operations
**Companion docs:** Product Spec, UI/UX Spec, Import Mapping Spec, Billing/Payments Spec, API Contract Spec, Data Model / ERD

---

## 1. Document Overview

### 1.1 Purpose
- define the target system architecture for JiTpro
- translate product requirements into technical boundaries, components, data flows, and enforcement rules
- document launch architecture, not just ideal future-state architecture

### 1.2 Scope
Include:
- authenticated app architecture
- public lead capture and invitation flows
- identity, permissions, and tenancy
- scheduling / recalculation engine
- baselines and audit history
- billing entitlements and project activation
- imports, exports, notifications, file storage, and reporting

Exclude:
- detailed UI design
- detailed product behavior already owned by product spec
- vendor selection unless needed for architectural decisions

### 1.3 Relationship to Product Spec
- product spec is the source of truth for product behavior
- architecture spec is the source of truth for technical implementation approach
- any conflict must be resolved explicitly in a decision log

### 1.4 Decision Log
- architecture decisions
- date
- owner
- rationale
- implications
- alternatives considered

---

## 2. Architectural Goals and Principles

### 2.1 Primary Goals
- strict tenant isolation by company
- deterministic procurement schedule calculations
- auditable history for active project changes
- clean separation of internal-only vs shared-with-external data
- strong permission enforcement at both company and project levels
- support for v1 launch scope without over-fragmenting the system

### 2.2 Recommended v1 Architectural Stance
- Supabase-centered modular monolith first
- Supabase Postgres as the primary relational source of truth
- Supabase Auth retained for authentication in v1
- Supabase Storage retained for file storage in v1
- application service layer for business logic and permission-checked mutations
- background jobs for async workflows (imports, exports, notifications, recalculations)
- event/outbox pattern for notifications and non-blocking side effects
- clear domain module boundaries so services can be split later if needed

### 2.3 Core Principles
- consistency over premature service decomposition
- immutable history where product requires auditability
- derived state should be reproducible from source data where possible
- permissions must be enforced server-side, never only in UI
- imports and calculations must be traceable and idempotent
- architecture must support rollout in phases
- **copy-on-create, no-cascade** — all template and calendar inheritance uses snapshots, never live references

---

## 3. System Context and High-Level Topology

### 3.1 External Actors
- prospective customer / lead
- sales team
- company admin
- internal project users
- external collaborators
- payment provider
- email delivery provider
- file storage provider (Supabase Storage)

### 3.2 High-Level Components
- public website / lead capture frontend
- authenticated application frontend (React / Vite / Tailwind)
- application API layer (Supabase client + edge/server functions)
- domain services / modules
- scheduling engine
- background worker / job processor
- relational database (Supabase Postgres)
- object storage (Supabase Storage)
- notification/email subsystem
- billing/payment integration
- reporting/export subsystem

### 3.3 Environment Topology
- local development
- staging
- production
- admin/support environment if applicable

### 3.4 Network and Trust Boundaries
- public unauthenticated endpoints
- authenticated internal/external app endpoints
- internal job/worker execution
- storage access boundary
- payment webhook boundary

---

## 4. Domain Module Boundaries

Define clear module boundaries for a modular-monolith-first design.

### 4.1 Public Lead & Sales Module
- public lead capture
- sales invite creation
- invite token lifecycle
- provisional company bootstrap

### 4.2 Identity & Access Module
- user accounts
- company memberships
- project team assignments
- authentication (Supabase Auth)
- authorization
- invitation acceptance

### 4.3 Company Administration Module
- company profile
- company contacts
- internal users
- cost code library
- holiday calendar
- company defaults
- company-level PCL templates

### 4.4 Project Setup & Activation Module
- project creation
- wizard state persistence
- procurement source selection
- activation readiness checks
- billing and entitlement handoff

### 4.5 Procurement Planning Module
- project-level PCL templates
- procurement items
- procurement tasks
- schedule generation
- recalculation
- health status

### 4.6 Baseline & Audit Module
- baseline creation
- variance calculation
- audit history
- edit reason enforcement

### 4.7 Collaboration Module
- documents
- comments / requests / responses
- external sharing rules
- invitations and scoped visibility

### 4.8 Import / Export Module
- CSV templates (downloadable)
- parsing, validation, preview, commit
- lineage tracking
- export generation

### 4.9 Billing & Entitlements Module
- company subscription state
- project activation state
- capacity tracking
- grace-period lock behavior

### 4.10 Notifications & Reporting Module
- event generation
- in-app notifications
- email notifications
- project and portfolio reporting

---

## 5. Multi-Tenancy and Data Partitioning

### 5.1 Tenant Model
- company is the primary tenant boundary
- projects belong to exactly one company
- most business data is company-scoped or project-scoped under company

### 5.2 Cross-Tenant Considerations
- external collaborators may participate across multiple companies/projects
- user identity is global
- access rights are tenant/project scoped through memberships and assignments

### 5.3 Data Ownership Rules
- company-owned records
- project-owned records
- system-owned default records
- immutable historical records

### 5.4 Partitioning Strategy
- tenant key requirements on all company/project records
- project key requirements on project-scoped records
- recommendations for indexing by company_id and project_id

### 5.5 Deletion and Retention Strategy
- soft-delete vs archive vs immutable history
- records that can never be hard-deleted after activation/baselining
- retention rules for logs, files, and import/export artifacts

---

## 6. Identity, Authentication, and Account Lifecycle

### 6.1 Identity Model
- distinction between contact records and user accounts
- one user account links to one contact record
- internal and external account types

### 6.2 Authentication
- Supabase Auth for email/password in v1
- auth provider abstraction for later SSO or external identity providers
- password reset and invite-based account creation
- session model and token strategy

### 6.3 Internal Account Lifecycle
- invited
- accepted
- active
- suspended
- revoked

### 6.4 External Account Lifecycle
- project invite created
- invite sent
- accepted/rejected
- scoped project access granted
- revoked or expired

### 6.5 First-Admin Bootstrap Flow
- sales invite
- provisional company creation
- first admin creation
- payment gate placement
- initial company setup

### 6.6 Account Recovery and Security Controls
- password reset
- invite expiration
- suspicious login handling
- rate limiting for auth endpoints

---

## 7. Authorization and Permission Enforcement

### 7.1 Permission Layers
- company-level permissions
- project-level role permissions
- item/document/thread visibility permissions

### 7.2 Permission Evaluation Order
Define the order in which access is checked:
1. authentication
2. account status
3. tenant membership / project assignment
4. role-based permission
5. access scope filter
6. object-level visibility

### 7.3 Company Permission Model
- company admin
- company member
- optional flags: billing, project creator, portfolio reporting

### 7.4 Project Role Model
- principal / executive
- senior PM
- PM
- PE
- project administrator
- superintendent
- foreman
- external collaborator

### 7.5 Access Scope Model
- full project
- procurement only
- assigned items only
- shared items only

### 7.6 Enforcement Strategy
- server-side policy layer
- Supabase Row Level Security (RLS) for tenant filtering
- application-level role and scope checks for fine-grained permissions
- document visibility enforcement
- export filtering
- notification filtering

### 7.7 Permission Test Matrix
- required automated tests for every action in the product permission matrix
- negative tests for external data leakage
- regression tests for cross-tenant access

---

## 8. Core Data Architecture and Entity Relationships

### 8.1 Canonical Entity List
- companies
- holiday_calendars
- holiday_calendar_entries
- user_accounts
- company_memberships
- contacts
- projects
- project_holiday_calendars
- project_team_assignments
- cost_codes
- pcl_template_sets (system and company scope)
- project_pcl_templates
- pcl_template_phases / durations
- procurement_items
- procurement_tasks
- baselines
- audit_logs
- documents
- threads
- thread_messages / responses
- notifications
- invitations
- subscriptions / entitlements
- imports
- exports

### 8.2 Relationship Model
- one-to-many and many-to-many relationships
- nullable relationships that are intentional
- cascade restrictions
- archival effects on related records

### 8.3 ID Strategy
- globally unique IDs (UUID) via Supabase gen_random_uuid()
- human-readable project/item numbers
- external-safe IDs vs internal IDs

### 8.4 State / Enum Strategy
- project statuses
- activation statuses
- item lifecycle statuses
- health statuses
- invite statuses
- notification statuses
- payment / entitlement statuses

### 8.5 Normalized vs Snapshot Data
- current-state tables
- immutable snapshot tables or payloads for baselines
- immutable audit records
- import lineage data
- copy-on-create snapshots for PCL templates and holiday calendars

### 8.6 Versioning Requirements
- PCL template versioning
- task structure versioning on items
- CSV template versioning
- holiday calendar versioning or effective dating
- API versioning approach if needed

---

## 9. Calendar, Workday, and Timezone Engine

### 9.1 Calendar Model
- base system holiday defaults (US holidays)
- company-owned holiday calendar (copied from system defaults, editable)
- project-level calendar (copied from company calendar at project creation, editable)
- **copy-on-create at each level — changes never cascade downward**

### 9.2 Holiday Entry Semantics
- one-time holiday dates
- recurring annual holidays
- company shutdown periods
- editing and activation of calendars

### 9.3 Workday Calculation Rules
- weekends as non-working days
- holidays as non-working days (from applicable project calendar)
- business-day rule behavior
- date addition / subtraction semantics
- inclusive vs exclusive date boundaries

### 9.4 Project Override Behavior
- project calendar is seeded from company calendar at project creation
- project scheduling uses the project calendar snapshot thereafter
- edits to the company holiday calendar do not retroactively change existing projects
- project override means editing the project's own calendar copy
- optional re-sync from company calendar may be added later as an explicit action, never automatic
- lineage tracking: store source_company_calendar_id and source_company_calendar_version on the project calendar

### 9.5 Timezone Strategy
- company timezone
- project timezone override
- storage timezone standard (UTC)
- UI display timezone
- job scheduling timezone implications

### 9.6 Testing Requirements
- holiday-aware backward and forward calculations
- recurring holiday edge cases
- leap year and year-boundary cases

---

## 10. PCL Template Architecture

### 10.1 Template Hierarchy
- system defaults
- company-level copies (copied from system, editable by company admin)
- project-level copies (copied from company at project creation, editable per project)
- item-level copy on creation (copied from project template, independent thereafter)
- **copy-on-create at each level — changes never cascade downward**

### 10.2 Data Representation
- recommended normalized representation of phase definitions
- round-based review/revision structure
- required/optional milestones
- duration units and business-day rules

### 10.3 Inheritance Rules
- copy-on-create behavior at every level
- editing company templates does not affect existing projects
- editing project templates does not affect existing items
- no retroactive changes
- project edits only affect new items unless explicit bulk update is added later

### 10.4 Versioning and Traceability
- template version at time of item creation
- task_structure_version on item
- source_template_id and source_template_version on copies
- reconstruction of why a task set looks the way it does

### 10.5 No-Buffer Rule
- architecture must treat schedule as explicit phase durations only
- no hidden buffer calculations in v1

---

## 11. Procurement Scheduling and Calculation Engine

### 11.1 Scheduling Responsibilities
- generate tasks from PCL template and project settings
- calculate dates backward from required onsite date
- support forward calculation when needed
- respect actuals, locked tasks, and milestone dependencies
- use project-level holiday calendar for all workday calculations

### 11.2 Canonical Phase Engine
- standard phase library
- conditional inclusion by PCL
- round-based review/resubmittal logic
- milestone handling

### 11.3 Backward Calculation Algorithm
- starting anchor
- reverse phase traversal
- workday subtraction logic (holiday-aware)
- handling final design and final selection dependencies

### 11.4 Forward Calculation Algorithm
- starting anchor
- workday addition logic (holiday-aware)
- lock and actual-date constraints
- handling partially complete items

### 11.5 Recalculation Triggers
- item creation
- PCL change before activation
- date change
- lock/unlock change
- actual date update
- holiday calendar change
- project scheduling defaults change
- manual recalc action

### 11.6 Concurrency and Determinism
- how conflicting edits are handled
- transactional boundaries
- optimistic locking or version checks
- reproducibility of calculations

### 11.7 Performance Strategy
- synchronous vs asynchronous recalculation
- thresholds for background recalculation
- bulk recalc support
- caching of calendar/workday computations

### 11.8 Error Handling
- invalid schedule states
- impossible backward schedule detection
- user-visible calculation warnings
- audit/logging of failures

---

## 12. Health Status Engine

### 12.1 Computed Health Model
- On Track
- At Risk
- Waiting on External
- Blocked
- Late

### 12.2 Priority Evaluation
- Late > Blocked > Waiting on External > At Risk > On Track

### 12.3 Input Signals
- current task dates
- actual dates
- baseline comparison
- open external requests
- predecessor completion state
- required onsite projections

### 12.4 Manual Override Model
- recommended fields:
  - computed_health_status
  - overridden_health_status
  - health_override_reason
  - effective_health_status
- audit requirements for override actions

### 12.5 Pre-Baseline Behavior
- define how "Late" is computed before first baseline exists
- define fallback rules using current planned dates or required onsite commitments

### 12.6 Recompute Triggers
- task date changes
- baseline creation
- request/response updates
- dependency completion
- manual override / clear override

---

## 13. Baselines and Variance Architecture

### 13.1 Baseline Model
- immutable baseline records
- sequential numbering per project
- baseline scope and metadata
- creator and timestamp

### 13.2 Snapshot Strategy
Choose and justify one or more of:
- full JSON snapshot payload
- normalized baseline item/task snapshot tables
- hybrid approach with metadata + structured snapshot tables

### 13.3 Baseline Creation Flow
- eligibility checks
- transactional snapshot creation
- locking considerations
- post-create events and notifications

### 13.4 Variance Calculation
- compare current state vs selected baseline
- project-level and item-level variance
- field-level vs summary-level variance
- handling archived/completed items

### 13.5 Storage and Query Strategy
- indexing
- reporting performance
- baseline payload size
- retrieval patterns for UI and exports

---

## 14. Audit Log and Activity History

### 14.1 Audit Scope
- active item field changes
- status changes
- baseline creation
- permission-sensitive actions
- invite lifecycle changes
- billing/activation lock changes

### 14.2 Audit Schema
- object type
- object ID
- changed by
- timestamp
- changed field(s)
- old/new values
- edit reason
- visibility

### 14.3 Structured Edit Reasons
- enumerated reasons
- freeform note support
- validation rules

### 14.4 Immutable Storage Requirements
- append-only model
- prevention of audit edits/deletes
- support/admin visibility rules

### 14.5 User Activity Feed vs System Audit
- distinguish between user-facing activity history and internal audit records
- define whether both are derived from one source or separate models

---

## 15. Billing, Entitlements, and Activation Architecture

### 15.1 Entitlement Domains
- company subscription entitlement
- project activation entitlement
- capacity entitlement

### 15.2 Company Subscription State Machine
- invited
- unpaid
- active
- past due
- grace
- read-only
- canceled

### 15.3 Project Activation State Machine
- setup
- ready for activation
- payment pending
- active
- grace
- locked
- closed / archived

### 15.4 Capacity Model
- purchased item capacity
- active item count consumption
- upgrade/add-on flow
- capacity threshold warnings

### 15.5 Billing Lock Behavior
- what becomes read-only on company payment failure
- what becomes locked on project activation payment failure
- how entitlement checks are enforced in API and UI

### 15.6 Payment Provider Integration
- checkout
- recurring billing
- installment handling
- webhook ingestion
- idempotency
- reconciliation and retry behavior

### 15.7 Audit and Supportability
- entitlement change logs
- webhook event storage
- support/admin tools for billing issues

---

## 16. Public Lead Capture and Sales Invitation Architecture

### 16.1 Lead Capture
- public form ingestion
- validation
- spam/rate-limit protections
- storage model
- sales notification trigger

### 16.2 Sales Invite Flow
- invite creation
- provisional company record
- invite token generation
- expiration and resend behavior

### 16.3 Conversion Flow
- first admin account creation
- company association
- first login
- transition into payment/onboarding

### 16.4 Security Considerations
- token expiration
- one-time use rules
- email verification expectations
- abuse prevention

---

## 17. Company Setup Architecture

### 17.1 Setup State Persistence
- partially completed setup
- resumable flows
- setup completion flags

### 17.2 Company Contacts
- manual creation
- CSV import with downloadable template
- dedupe strategy
- inactive vs delete rules

### 17.3 Internal User Invites
- invite state model
- pending user records
- linking to contacts
- membership assignment

### 17.4 Cost Code Library
- import/manual entry
- hierarchical storage
- active/inactive handling
- project selection behavior

### 17.5 Holiday Calendar Customization
- system seed data (base US holidays)
- company copy-on-create from system defaults
- recurring rules
- effect on new projects: new projects copy from company calendar
- effect on existing projects: none (copy-on-create, no cascade)

### 17.6 Company PCL Templates
- system seed data
- company copy-on-create from system defaults
- editable by company admin
- effect on new projects: new projects copy from company templates
- effect on existing projects: none (copy-on-create, no cascade)

---

## 18. Project Setup Wizard Architecture

### 18.1 Wizard State Model
- step-based persistence
- validations per step
- ability to save and return later
- draft project lifecycle

### 18.2 Step Data Boundaries
- project details
- owner/client data
- consultants
- project team
- procurement source
- cost codes/categories
- scheduling defaults & PCLs (copied from company at project creation)
- activation & billing

### 18.3 Readiness Checks
- required fields complete
- payment prerequisites
- estimated item count vs capacity recommendation
- role/permission checks for activation

### 18.4 Activation Handoff
- final validation
- entitlement purchase or confirmation
- activation transaction
- post-activation events

---

## 19. Import Architecture

### 19.1 v1 CSV Imports
- company contacts import
- procurement item import

### 19.2 Template Management
- downloadable template generation
- template versioning
- required and optional columns
- customer-safe validation docs

### 19.3 Import Workflow
- upload
- parse
- validate
- preview
- confirm
- commit
- post-import summary

### 19.4 Validation Strategy
- type validation
- enum validation
- required field checks
- cross-reference validation
- duplicate detection
- row-level error reporting

### 19.5 Idempotency and Reprocessing
- import batch IDs
- safe retry behavior
- duplicate prevention
- "same file twice" handling

### 19.6 Lineage and Source Tracking
- source_type
- source_record_id
- import timestamp
- import batch reference
- user who imported

### 19.7 Future Imports
- Scope Builder
- Specification / Selection Register
- reuse vs separate pipelines
- internal API/event contracts for future modules

---

## 20. Export and Reporting Architecture

### 20.1 Export Types
- CSV exports
- PDF exports if supported in v1
- project register export
- variance export
- capacity usage export

### 20.2 Export Execution Model
- synchronous for small exports
- background jobs for large exports
- permission-filtered data only
- signed download URLs / expiration

### 20.3 Reporting Query Layer
- operational reports
- list/gantt support queries
- dashboard summaries
- portfolio reporting boundaries

### 20.4 Performance Strategy
- indexes
- read models / materialized views if needed
- caching for common report aggregates

---

## 21. Document Storage and File Access Architecture

### 21.1 File Storage Model
- Supabase Storage for object storage
- metadata stored in Supabase Postgres
- file versioning support

### 21.2 Visibility Model
- internal-only
- shared with external
- inherited vs explicit sharing

### 21.3 Access Delivery
- signed URLs or proxy download
- permission checks before access
- expiration and revocation behavior

### 21.4 File Processing
- size limits
- allowed file types
- checksuming
- antivirus / malware scan if required
- thumbnail/preview generation if supported

### 21.5 Lifecycle
- upload
- replace / version
- archive
- retention and deletion rules

---

## 22. Collaboration, Requests, and Responses Architecture

### 22.1 Thread Model
- project-linked and item-linked threads
- thread types: comment, request, issue, confirmation
- shared vs internal visibility

### 22.2 Message Model
- message body
- sender
- recipient(s)
- timestamps
- status
- attachments

### 22.3 Structured Request Workflow
- request creation
- due date
- assigned external collaborator
- pending / responded / closed states
- overdue detection

### 22.4 External Interaction Controls
- permitted actions
- forbidden actions
- access scope enforcement
- audit requirements

### 22.5 Notification Triggers
- request created
- response submitted
- overdue reminder
- thread updated

---

## 23. Notification and Event Architecture

### 23.1 Domain Event Catalog
At minimum:
- lead submitted
- invite sent
- invite accepted
- company payment success/failure
- project activation success/failure
- external invite sent/accepted/expired
- item due soon
- item overdue
- request created
- response overdue
- baseline created
- capacity threshold reached

### 23.2 Event Publishing Model
- transactional outbox recommended
- event schema
- retries and deduplication
- delivery guarantees

### 23.3 Notification Channels
- in-app
- email
- future SMS/push if ever added

### 23.4 Notification Preferences
- v1 defaults vs future user-configurable preferences
- unsubscribe handling for non-critical emails

### 23.5 Delivery Monitoring
- failed sends
- retries
- bounce handling
- provider outages

---

## 24. API Architecture

### 24.1 API Style
- Supabase client SDK as primary data access layer for v1
- Supabase Edge Functions for trusted server-side business logic
- RLS for tenant-level data isolation
- application-level authorization for role and scope checks
- versioning strategy for future API evolution

### 24.2 Endpoint / Service Grouping
- public leads
- auth
- company admin
- projects
- procurement items/tasks
- baselines
- documents
- threads/requests
- imports/exports
- billing/entitlements
- notifications

### 24.3 Common API Concerns
- authentication (Supabase Auth)
- authorization (RLS + application-level)
- pagination
- filtering/sorting
- optimistic concurrency
- idempotency keys for mutation endpoints
- standardized error shape

### 24.4 Bulk Operations
- bulk item updates
- bulk import commit
- bulk recalc
- bulk notifications where applicable

### 24.5 Public vs Authenticated APIs
- public lead endpoints
- invite acceptance endpoints
- internal/external authenticated app endpoints

---

## 25. Frontend Architecture

### 25.1 Application Structure
- React / Vite / TypeScript / Tailwind CSS
- route/module layout
- public site vs authenticated app separation
- internal vs external user experience differences

### 25.2 State Management
- server state vs client UI state
- form state for long wizards
- optimistic updates where safe
- cache invalidation strategy

### 25.3 Key Frontend Surfaces
- company setup
- project setup wizard
- procurement list
- gantt/schedule view
- item detail
- baseline compare
- external collaborator portal views
- imports/exports
- billing and entitlements

### 25.4 Error and Empty States
- no baseline yet
- no holiday calendar override
- no shared items for external user
- payment locked states
- import failures
- schedule calculation warnings

### 25.5 Accessibility and Performance
- large table rendering
- gantt virtualization if needed
- keyboard navigation
- mobile/responsive expectations

---

## 26. Background Jobs and Workflow Orchestration

### 26.1 Async Workloads
- notification delivery
- import parsing/validation
- large exports
- bulk recalculation
- scheduled reminders
- entitlement reconciliation

### 26.2 Job Model
- queue selection
- retry policy
- dead-letter handling
- idempotency
- observability

### 26.3 Scheduled Jobs
- upcoming due reminders
- overdue checks
- payment grace-period enforcement
- stale invite expiration
- health status recomputation sweeps if needed

---

## 27. Search, Filtering, and Query Performance

### 27.1 Core Query Patterns
- project procurement item lists
- status filters
- PCL filters
- overdue items
- waiting on external
- item capacity usage
- baseline variance views

### 27.2 Indexing Strategy
- tenant/project/status/date indexes
- search fields
- audit and thread query indexes

### 27.3 Future Saved Views
- define whether query model can support saved views later without redesign

### 27.4 Gantt/Data Density Performance
- lazy loading
- virtualization
- aggregation/precomputation where needed

---

## 28. Security, Privacy, and Compliance

### 28.1 Security Model
- least-privilege access
- tenant isolation (Supabase RLS + application-level)
- secret management (environment variables, never in source code)
- secure file access (signed URLs)
- secure webhook handling

### 28.2 Data Protection
- encryption at rest (Supabase managed)
- encryption in transit (TLS)
- backup encryption
- audit retention

### 28.3 External Access Security
- scoped visibility
- signed URLs
- invite expiry
- revocation behavior

### 28.4 Operational Security
- admin access controls
- support tooling permissions
- auditability of privileged actions

### 28.5 Compliance Posture
- define current posture and future needs
- no unsupported compliance claims in docs unless formally met

---

## 29. Non-Functional Requirements and Capacity Planning

### 29.1 Reliability Targets
- uptime targets
- backup and restore targets
- recovery expectations

### 29.2 Performance Targets
- page load expectations
- list/gantt performance for target item counts
- import size limits
- export completion targets

### 29.3 Scalability Assumptions
- company/project/user counts
- procurement items per project (hundreds to thousands)
- file storage growth
- notification volume

### 29.4 Durability Requirements
- immutable baselines
- immutable audit logs
- durable import/export artifacts where needed

---

## 30. Observability, Operations, and Support Tooling

### 30.1 Logging
- structured application logs
- audit correlation IDs
- user action correlation
- webhook logs

### 30.2 Metrics
- auth success/failure
- invite conversion
- schedule recalculation duration
- import success/failure
- export generation time
- notification delivery metrics
- entitlement lock/unlock events

### 30.3 Tracing
- critical flows
- billing webhooks
- recalculation paths
- background job execution

### 30.4 Admin / Support Tooling
- resend invite
- inspect imports
- inspect entitlement state
- view job failures
- safe audit inspection
- support overrides with audit trail

---

## 31. Testing Strategy

### 31.1 Unit Tests
- date math (holiday-aware)
- PCL phase generation
- health status evaluation
- entitlement rule evaluation

### 31.2 Integration Tests
- auth + permission enforcement
- billing webhook handling
- baseline creation
- import pipeline
- file visibility

### 31.3 End-to-End Tests
- lead-to-first-admin onboarding
- company setup
- project setup and activation
- item creation and scheduling
- baseline creation
- external collaborator request/response flow
- payment grace-period lock behavior

### 31.4 Property / Scenario Testing
- complex scheduling edge cases
- impossible schedule detection
- recurring holiday scenarios
- cross-tenant authorization attempts

### 31.5 Migration and Data Integrity Tests
- seed data correctness
- PCL template migrations
- holiday calendar upgrades
- enum/status transitions

---

## 32. Data Migration, Seeding, and Rollout Plan

### 32.1 Seed Data
- base US holiday calendar
- system PCL templates (5 levels)
- default procurement categories
- default status enums

### 32.2 Rollout Strategy
- internal alpha
- pilot customers
- phased feature flags
- external collaborator rollout controls

### 32.3 Migration Strategy
- schema migrations (Supabase migration files)
- historical backfill if migrating from prototype/demo data
- reversible vs irreversible migrations
- baseline/audit safety in migrations

### 32.4 Feature Flags
- CSV import
- external collaboration
- health status overrides
- v1.1 module flags

---

## 33. Resolved Technical Decisions

- **PCL hierarchy for v1:** system → company → project → item, with copy-on-create at each level and no downward cascading
- **Holiday calendar hierarchy:** system → company → project, with copy-on-create at each level and no downward cascading
- **Platform for v1:** Supabase-centered (Postgres, Auth, Storage) with application service layer
- **No buffer durations:** schedule is explicit phase durations only

---

## 34. Open Technical Decisions

- exact strategy for baseline storage: JSON snapshot, normalized copies, or hybrid
- pre-baseline definition of "Late"
- whether health override is stored separately from computed status
- synchronous vs async recalculation thresholds
- whether exports are generated on-demand or from prebuilt read models
- file antivirus/preview strategy
- payment provider abstraction depth needed for v1

---

## 35. Appendices

### Appendix A: Proposed ERD
- diagram of all core entities and relationships

### Appendix B: State Machines
- user/account lifecycle
- invite lifecycle
- company subscription lifecycle
- project activation lifecycle
- procurement item lifecycle
- request/response lifecycle

### Appendix C: Permission Mapping
- technical permission matrix by action and object

### Appendix D: Event Catalog
- event names
- payload schemas
- publishers
- consumers

### Appendix E: Import Template Specs
- contact import CSV
- procurement item import CSV
- validation rules
- versioning rules

### Appendix F: Scheduling Engine Scenarios
- example backward scheduling case
- forward scheduling case
- locked task case
- holiday-shifted calculation case
- baseline variance case
