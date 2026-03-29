# JiTpro Product, Business, and System Specification

**Status:** Draft v0.2
**Purpose:** Primary product requirements document for launch and near-term roadmap
**Companion documents:** Technical Architecture Spec, UI/UX Spec, Import Mapping Spec, Billing/Payments Spec

---

## 1. Executive Summary

JiTpro is a procurement planning and control platform for luxury residential and light commercial general contractors.

The product addresses a common failure point in construction delivery: the project schedule assumes key procurement decisions, approvals, submittals, fabrication, and shipping will happen on time, but those dependencies are rarely mapped or managed in one system. By the time schedule drift is visible in the field, the root causes often began months earlier.

JiTpro provides a structured procurement system that:
- identifies long-lead and coordination risk early
- links procurement tasks to required on-site dates
- turns procurement planning into a repeatable operating process
- creates auditable baselines and edit history
- allows limited, controlled collaboration with external parties
- converts pre-bid/preconstruction data into post-award execution data where possible

JiTpro has two commercial layers:
1. **Company subscription** for the contractor workspace and pre-bid/preconstruction tools
2. **Project activation** for post-award procurement execution on a specific project

This document defines the product scope, core systems, data objects, permissions, and release boundaries for launch and near-term iterations.

---

## 2. Problem Statement

Construction schedules routinely assume that owner selections, design coordination, consultant approvals, vendor revisions, fabrication lead times, and shipping will align with field needs. In reality:
- those tasks are often tracked in disconnected spreadsheets, emails, and meeting notes
- responsibility is fragmented across internal and external participants
- long-lead issues are discovered late
- changes are not audited cleanly
- schedule impacts are difficult to explain or forecast

JiTpro solves this by making procurement an explicit system of record rather than an informal coordination process.

---

## 3. Product Goals

### 3.1 Business Goals
- create a subscription product contractors can adopt at the company level
- create a project-level monetization model aligned to project complexity
- support repeated project activation within the same customer account
- make JiTpro valuable in both pre-bid and post-award phases

### 3.2 User Goals
- reduce hidden procurement-driven schedule drift
- give PM teams a structured procurement schedule tied to required on-site dates
- reduce manual re-entry from pre-bid/preconstruction into execution
- allow controlled collaboration with owners, architects, engineers, designers, suppliers, and subcontractors
- preserve a defensible history of schedule assumptions and changes

### 3.3 Product Goals
- establish a consistent project setup workflow
- standardize procurement item creation and tracking
- provide baselines, edit logs, and variance reporting
- support project-level customization without breaking system defaults
- enforce role-based access and data visibility

---

## 4. Non-Goals

The following are explicitly out of scope for launch unless noted otherwise:
- full ERP or accounting functionality
- full subcontract management
- full change order management
- full lender portal or lender-facing workflow
- replacing the master CPM schedule system
- deep native integrations as a launch dependency
- broad document management beyond procurement-related files and threads
- enterprise portfolio analytics beyond basic reporting

---

## 5. Ideal Customer Profile and Personas

## 5.1 ICP

**Primary segments**
- luxury residential construction
- light commercial construction

**Primary customer**
- general contractors

**Out of scope for initial launch**
- owner/developer direct accounts as primary customer
- large national enterprise GCs with highly customized enterprise workflows
- specialty trade-only deployments

## 5.2 Personas

### Company Admin
Typically an owner, principal, operations leader, or delegated admin.
- buys the product
- manages billing and company settings
- controls users, libraries, and access
- wants visibility across all projects

### Principal / Executive
Senior internal stakeholder with project oversight.
- wants portfolio visibility
- reviews high-risk items and milestone drift
- may approve project activation or baseline decisions

### Senior Project Manager
Senior delivery lead.
- sets project standards
- manages project setup
- manages baselines and template adjustments
- oversees coordination risk

### Project Manager
Owns day-to-day project procurement execution.
- activates projects
- creates and manages procurement items
- manages dates, schedule changes, coordination, and external requests
- owns accountability for at-risk items

### Project Engineer
Supports detailed execution.
- manages items, durations, documents, follow-up, and responses
- updates schedule logic and item metadata
- helps drive procurement completion

### Project Administrator
Supports project records and coordination.
- manages contacts, assignments, documents, exports, and administrative updates
- may update non-critical metadata and support reminders

### Superintendent
Field-facing leader.
- needs visibility into on-site readiness and blockers
- updates actual dates, field constraints, and readiness information
- should not manage billing or company configuration

### Foreman
Field role with limited operational updates.
- views assigned items or relevant project items
- updates field status, actual receipt, or installation readiness where allowed

### External Collaborator
Owner, owner rep, architect, engineer, designer, consultant, subcontractor, or supplier.
- receives limited project-scoped access
- can view only shared or assigned procurement items
- can comment, respond, confirm dates, and upload documents
- cannot see company settings, internal billing, internal notes, or unrelated items

---

## 6. Product Modules

JiTpro is composed of the following modules:

1. **Lead Capture & Sales Invitation**
2. **Company Subscription Workspace**
3. **Company Users, Contacts, Cost Code Libraries, and Defaults**
4. **Project Setup & Activation**
5. **Procurement Item Planning & Scheduling**
6. **Baselines, Variance, and Audit History**
7. **External Collaboration**
8. **Reporting, Reminders, and Exports**
9. **Pre-bid / Preconstruction Tools**
   - Scope Builder
   - Specification / Selection Register

This document focuses primarily on modules 1 through 8 and the system boundaries around them. Detailed product specs for pre-bid tools may live in companion documents, but their handoff into procurement execution is defined here.

---

## 7. Commercial Model, Packaging, and Billing Rules

## 7.1 Revenue Stream 1: Company Subscription

**Base price:** $199/month at launch
**Commercial framing:** overhead cost to the contractor

This subscription unlocks:
- company workspace
- internal user management
- contacts and libraries
- pre-bid / preconstruction tools
- company-level defaults
- project creation capability
- access to project setup workflows

A company subscription is required for internal company workspace access.

## 7.2 Revenue Stream 2: Project Activation

**Commercial framing:** billable project cost
**Purpose:** unlocks post-award procurement execution tools for one project

Project activation unlocks:
- procurement item execution
- procurement schedule / gantt
- baselines and variance tracking
- external collaborator workflows
- item audit history
- execution reporting and alerts

Project activation pricing is based on **purchased procurement item capacity** for the project.

## 7.3 Recommended Billing Rules

### Internal access
- Internal company users require an active company subscription.
- A company may have multiple company admins.
- Internal user count is not the primary billing driver in the initial model.

### External access
- External collaborator accounts are **non-billable**.
- External collaborators do not consume internal seats.
- External collaborators only exist within active, invited project contexts.

### Billable procurement item definition
A procurement item becomes billable when it is activated into the project's execution scope.

**Recommended rule set**
- Draft items do **not** consume purchased capacity.
- Activated items **do** consume purchased capacity.
- Completed or archived items continue to count against purchased capacity for that project because capacity represents project complexity, not fluctuating monthly workload.
- Capacity upgrades or add-on bundles are required before activating items beyond the purchased tier.
- Admin-only cleanup may remove accidental duplicate draft items before activation.

## 7.4 Initial Tier Framework

| Tier | Item Capacity | Target Use Case |
|------|---------------|-----------------|
| Tier 1 | Up to 500 | Standard luxury residential |
| Tier 2 | Up to 1500 | Complex residential / light commercial |
| Bundle | +250 items | Capacity add-on |

**Note:** exact tier boundaries require real-world validation before pricing is finalized.

## 7.5 Payment Timing

### Company subscription
- payment is required before full internal workspace setup is complete
- the paywall should appear early in onboarding

### Project activation
- payment confirmation is required before the project moves from Setup to Active
- project activation fee may be split into monthly installments over up to 6 months

## 7.6 Failed Payment Behavior

### Failed company subscription
- company enters billing warning state
- reminders are sent to company admins
- after grace period, internal workspace becomes read-only except billing management
- active projects remain viewable, but new changes lock until billing is resolved

### Failed project activation installment
- project remains viewable during grace period
- after grace period, editing, new item activation, exports, and new external invites are locked
- billing resolution restores editing access

---

## 8. Product Scope by Lifecycle Phase

## 8.1 Lead / Sales Phase
- public lead form
- sales notification
- invite-driven onboarding
- no platform account created at lead capture stage

## 8.2 Company Workspace Phase
- subscription purchase
- company setup
- internal users
- contacts
- cost code library
- company defaults

## 8.3 Project Setup Phase
- project wizard
- project team assignment
- procurement source selection
- project-level scheduling defaults
- activation and billing

## 8.4 Project Execution Phase
- procurement item management
- schedule view
- baselines
- edit audit log
- docs, comments, requests, responses
- reporting, reminders, exports

---

## 9. System Model

JiTpro uses a multi-tenant hierarchy:

**Platform**
→ **Company**
→ **Project**
→ **Procurement Item**
→ **Procurement Tasks / Baselines / Documents / Requests / Comments**

### Key modeling principles
1. Company is the primary customer account boundary.
2. Projects belong to a single company.
3. Internal users belong to a company.
4. Contacts are reusable records and may or may not have logins.
5. Project access is controlled through project team assignments.
6. External collaborators are project-scoped and limited by explicit sharing rules.
7. Procurement items are the atomic unit of execution.
8. Baselines and audit logs are immutable history records.

---

## 10. Identity, Accounts, and Access Model

The system must distinguish between **people records** and **login accounts**.

## 10.1 Contact vs User

### Contact
A contact is a reusable person or organization record used in company directories and project teams.

A contact may represent:
- an internal employee
- an owner or owner rep
- an architect or engineer
- a designer
- a consultant
- a subcontractor or supplier contact

A contact does **not** automatically have login credentials.

### User Account
A user account is a login identity with authentication credentials.

A user account may represent:
- an internal company user
- an invited external collaborator

A user account must link to exactly one contact record.

## 10.2 Internal vs External Accounts

### Internal Licensed User
- belongs to a company
- may access company workspace
- may be assigned to multiple projects in that company
- may have company-level permissions and project-level roles

### External Collaborator User
- does not belong to the GC company as an internal member
- only gains access through project invitation
- only sees explicitly shared project scope
- may participate in multiple projects or companies through separate project-scoped invitations
- never gains company-level admin or billing access

## 10.3 Company Membership

Each internal user has a company membership type:

### Company Admin
- full company configuration access
- manage users
- manage billing
- manage company defaults and libraries
- view all company projects

### Company Member
- no company-wide admin rights
- access only to assigned projects unless other flags are granted

### Optional Company Flags
- Billing Access
- Project Creator
- Portfolio Reporting Access

These flags allow flexibility without multiplying top-level company roles.

---

## 11. Core Data Objects

## 11.1 Company

**Purpose:** top-level customer account

**Core fields**
- company_id
- legal_name
- display_name
- address
- license_number
- logo
- timezone
- default_work_calendar
- holiday_calendar_id
- subscription_status
- created_at
- created_by

**Rules**
- one company may have many internal users
- one company may have many projects
- company owns contacts, libraries, templates, projects, and holiday calendar

## 11.2 Holiday Calendar

**Purpose:** company-owned calendar of non-working days used in all date calculations

**Core fields**
- calendar_id
- company_id
- calendar_name
- year

**Holiday entries**
- entry_id
- calendar_id
- date
- name
- recurring (boolean — repeats annually)

**Rules**
- JiTpro ships with a base US holiday calendar as the system default
- company calendar is copied from system default and may be customized (add regional holidays, company shutdowns, etc.)
- holidays are treated as non-working days in all workday calculations (same as weekends)
- each company may have one active holiday calendar
- project calendar is copied from the company calendar at project creation
- project teams may edit the project's own calendar copy (add site-specific non-working days, local holidays, etc.)
- **changes never cascade downward** — each level is a copy-on-create snapshot, not a live reference
- editing the company calendar does not affect existing projects
- editing a project calendar does not affect other projects
- optional re-sync from company calendar may be added later as an explicit action, never automatic

## 11.3 User Account

**Purpose:** authenticated login identity

**Core fields**
- user_id
- email
- password_auth / auth_provider
- contact_id
- account_type (internal, external)
- status (invited, active, suspended, revoked)
- last_login_at

**Rules**
- email is the primary login identifier
- usernames are not required in v1
- a user account maps to one contact record

## 11.4 Company Membership

**Purpose:** link an internal user account to a company and define company-wide access

**Core fields**
- membership_id
- company_id
- user_id
- membership_type
- billing_access_flag
- project_creator_flag
- portfolio_reporting_flag
- status

## 11.5 Contact

**Purpose:** reusable person / organization record

**Core fields**
- contact_id
- company_id
- contact_type (internal, external)
- first_name
- last_name
- display_name
- organization_name
- title
- email
- phone
- address
- notes
- active

**Rules**
- contacts may be created at company level or during project setup
- project-created contacts should write back into company contacts
- deleting contacts should be restricted; inactive is preferred to hard delete
- company directories may be imported via CSV; the app provides a downloadable template

## 11.6 Project

**Purpose:** project workspace

**Core fields**
- project_id
- company_id
- project_name
- project_number
- project_type
- address
- APN
- project_size_sqft
- project_value
- preconstruction_start_date
- construction_start_date
- substantial_completion_date
- final_completion_date
- project_status
- activation_status
- purchased_item_capacity
- timezone
- created_by

**Project statuses**
- Draft
- Setup In Progress
- Ready for Activation
- Active
- On Hold
- Closed
- Archived

**Rules**
- project is not billable until activated
- project activation moves project into execution mode

## 11.7 Project Team Assignment

**Purpose:** assign a contact/user to a project with a role and access scope

**Core fields**
- assignment_id
- project_id
- contact_id
- user_id (nullable until invite accepted)
- role
- access_scope
- invitation_status
- invited_by
- sponsor_user_id
- active

**Access scope values**
- Full Project
- Procurement Only
- Assigned Items Only
- Shared Items Only

**Rules**
- consultants added in setup become external project team records
- internal project users should be selected from company contacts/users when possible
- one person may have multiple project assignments across projects

## 11.8 Cost Code Library

**Purpose:** company-owned cost coding structure usable across projects

**Core fields**
- cost_code_id
- company_id
- division
- subdivision
- code
- description
- cost_type
- active
- sort_order

**Rules**
- JiTpro should support hierarchical cost codes but not hardcode one customer's accounting schema
- procurement items may reference cost code, procurement category, or both
- cost code usage is recommended but not required for initial activation

## 11.9 PCL Template Set

**Purpose:** duration and structure defaults for procurement complexity levels

**Core fields**
- template_set_id
- scope (system, company, project)
- PCL_level
- requires_final_design
- requires_final_selection
- review_round_count
- default_phase_durations
- business_day_rule
- shipping_duration
- notes

**Rules**
- system templates ship with the product
- company templates are copied from system defaults and may be edited by the company admin
- project templates are copied from company templates at project creation and may be edited per project
- item values are copied from project templates at item creation time
- **changes never cascade downward** — each level is a copy-on-create snapshot, not a live reference
- editing company templates does not affect existing projects
- editing project templates does not affect existing items
- no buffer durations — the detailed phase structure eliminates the need for buffers

## 11.10 Procurement Item

**Purpose:** atomic tracked procurement work package

**Core identity fields**
- item_id
- project_id
- item_number
- title
- description
- procurement_category
- system_or_trade
- cost_code_id (nullable)
- location_or_area
- source_type
- source_record_id
- created_by

**Ownership and commercial fields**
- internal_owner_user_id
- responsible_role
- vendor_name
- supplier_contact_id
- subcontractor_contact_id
- allowance_flag
- commitment_reference
- notes_internal
- notes_shared

**Schedule anchor fields**
- required_onsite_date
- final_design_date
- final_selection_date
- calculation_mode (backward, forward)
- PCL_level
- task_structure_version

**Control fields**
- lifecycle_status
- health_status
- baseline_reference_id
- external_visibility_scope
- archived

**Rules**
- procurement item is the unit used for project pricing capacity
- active item edits must generate audit history
- active items should not be hard deleted after baseline creation
- external users only see items shared or assigned to them

## 11.11 Procurement Task

**Purpose:** scheduled task or milestone within a procurement item

**Core fields**
- task_id
- item_id
- phase_key
- phase_label
- round_number
- task_type (duration, milestone)
- planned_start
- planned_finish
- actual_start
- actual_finish
- duration_days
- locked
- status
- predecessor_rules

**Rules**
- tasks are generated from the item's PCL and project defaults
- actual dates should not be overwritten by recalculation
- locked tasks constrain recalculation
- completed tasks become historical fact, not editable defaults

## 11.12 Baseline

**Purpose:** immutable project or item schedule snapshot

**Core fields**
- baseline_id
- project_id
- baseline_number
- baseline_name
- created_by
- created_at
- baseline_scope
- baseline_payload

**Rules**
- baselines are immutable
- at least one baseline should exist after the initial execution plan is accepted
- variance reporting compares current item/task dates to selected baseline data

## 11.13 Audit Log

**Purpose:** permanent history of key schedule and metadata changes

**Core fields**
- audit_id
- object_type
- object_id
- changed_by
- changed_at
- field_name
- old_value
- new_value
- edit_reason
- visibility

**Rules**
- edits to active items require a reason
- audit entries are read-only history records

## 11.14 Document

**Purpose:** project- or item-linked file

**Core fields**
- document_id
- project_id
- item_id (nullable)
- filename
- file_type
- storage_key
- uploaded_by
- version_number
- visibility
- created_at

**Visibility values**
- Internal Only
- Shared With External

## 11.15 Comment / Request / Response

**Purpose:** structured communication on a project or item

**Core fields**
- thread_id
- project_id
- item_id
- thread_type (comment, request, issue, confirmation)
- visibility (internal, shared)
- requested_by
- requested_to
- due_date
- status
- body
- responded_at

**Definition of "respond"**
In JiTpro, "respond" means one or more of the following:
- reply to a request or comment
- confirm or reject a date
- provide requested submittal or procurement information
- upload a supporting file
- mark a requested response complete

It does **not** mean unrestricted schedule editing.

## 11.16 Notification

**Purpose:** system-generated message tied to product events

**Core fields**
- notification_id
- event_type
- recipient_user_id
- channel (in-app, email)
- related_object_type
- related_object_id
- sent_at
- read_at

---

## 12. User Journey and Lifecycle

## 12.1 Lead Capture
- visitor submits lead form on public website
- lead record is created for sales
- no JiTpro product account is created at this stage

## 12.2 Sales Invite
- sales sends invite to prospective buyer
- invite creates provisional company context and invite token
- invite is email-based

## 12.3 Buyer Account Creation
- buyer sets name, email, password
- buyer account attaches to invited company
- buyer is the first company admin by default

## 12.4 Early Paywall
- buyer confirms company subscription before deep setup
- this prevents high setup effort before conversion

## 12.5 Company Setup
- company profile
- internal team
- contacts (manual entry or CSV import with downloadable template)
- cost code library
- holiday calendar customization
- defaults and templates

## 12.6 Project Setup
- user creates project
- configures participants, data sources, defaults, and activation settings

## 12.7 Project Activation
- recommended item tier is shown
- buyer/admin confirms payment
- project moves to Active
- execution tools unlock

## 12.8 Execution
- items are created/imported
- items are reviewed and activated
- baseline created
- dates, actuals, docs, and responses managed throughout project lifecycle

---

## 13. Company Setup Requirements

The company setup flow must support the following:

### 13.1 Company Profile
- legal company name
- display name
- address
- license number
- logo
- timezone

### 13.2 Holiday Calendar
- JiTpro provides a base US holiday calendar
- user can add, remove, or edit holidays
- support for recurring annual holidays and one-time dates (e.g., company shutdown weeks)
- holidays are treated as non-working days in all workday calculations

### 13.3 Internal Users
- invite internal users by email
- assign company membership type
- optionally assign billing/project creator flags

### 13.4 Company Contacts
- internal and external contact records
- reusable across projects
- organization affiliation
- discipline / trade / vendor category tags
- CSV import supported with downloadable template

### 13.5 Libraries and Defaults
- cost code library
- default project calendar
- default PCL template set
- default review durations
- default shipping duration
- default procurement categories

---

## 14. Project Setup Wizard

The project wizard must be fully defined through activation.

## Screen 1: Project Details
Required fields:
- Project Name
- Project Number
- Project Address
- Project Type
- Project Size
- Project Value
- Preconstruction Start Date
- Construction Start Date
- Substantial Completion Date
- Final Completion Date

Conditional / optional fields:
- APN (primarily residential)
- contract type
- timezone override

**Naming change:** "Final Date" becomes **Final Completion Date**.

## Screen 2: Client / Owner

This screen must adapt by project type.

### Residential fields
- Client / Owner Name
- Spouse / Partner Name (optional)
- Owner Address
- Owner Email
- Owner Phone

### Light commercial fields
- Client Legal Entity
- Owner Representative Name
- Billing Contact
- Site Contact
- Owner Address
- Owner Email
- Owner Phone

## Screen 3: Consultants
Each consultant entry includes:
- firm name
- address
- phone
- contact name
- title
- email
- phone

Default consultant types:
- Architect
- Engineer
- Interior Designer
- Geotech
- Entitlements
- Arborist
- User-defined Consultant Type

Architect and Engineer support two contacts by default:
- lead
- project contact

Consultants entered here automatically become external project team candidates on Screen 4.

## Screen 4: Project Team

### Internal team members
Selected from company users / contacts where possible.

Supported internal project roles:
- Principal / Executive
- Senior Project Manager
- Project Manager
- Project Engineer
- Project Administrator
- Superintendent
- Foreman

### External team members
Supported external roles:
- Owner
- Owner Representative
- Architect
- Engineer
- Designer
- Consultant
- Subcontractor
- Supplier

### Required behavior
- consultants from Screen 3 are pre-populated
- new contacts created here write back to company contacts
- each team member gets a project role and access scope
- internal and external access models remain distinct

## Screen 5: Procurement Source

Choose how the project's initial procurement items will be created:
- Manual Entry
- CSV Import (with downloadable template)
- Import from Scope Builder
- Import from Specification / Selection Register
- Combined Sources

Fields:
- source option
- estimated item count
- whether to create items now or later
- whether imported items start as Draft or Active candidates

**Rule:** imported items should default to Draft until reviewed.

## Screen 6: Cost Codes & Categories
- select company cost code library for this project
- choose procurement categories / systems
- optionally define project locations / areas
- set required item metadata for this project
- optionally map imported source records to cost codes/categories

## Screen 7: Scheduling Defaults & PCL Templates
- working calendar
- holiday calendar (inherited from company, may override)
- business day rule
- default review durations
- default shipping duration
- project-level PCL adjustments
- whether final design milestone is enabled by default
- whether final selection milestone is enabled by default

## Screen 8: Activation & Billing
- estimated active item count
- recommended tier
- current purchased capacity
- installment summary
- confirmation of payment method
- project activation confirmation

**Activation result**
- project status becomes Active
- procurement execution tools unlock
- item capacity is reserved
- project is ready for first baseline creation once initial item set is accepted

---

## 15. Pre-bid to Post-award Data Handoff

JiTpro's long-term product value depends on reducing re-entry between upstream planning and downstream execution.

### Supported procurement sources
- manual creation
- CSV import (with downloadable template)
- Scope Builder records
- Specification / Selection Register records

### Required mapping behavior
Imported source records should map, where possible, into:
- item title
- description
- procurement category
- cost code
- location / area
- vendor or trade
- owner of selection
- final design / selection milestones
- notes

### Source-link requirement
Every item created from an upstream tool should retain:
- source type
- source record ID
- import timestamp

This allows traceability without making execution dependent on the upstream tool's schema.

---

## 16. Procurement Complexity Levels (PCLs)

## 16.1 Concept

PCLs are reusable procurement schedule templates that determine:
- number of review rounds
- milestone requirements
- default durations by phase
- coordination intensity

JiTpro ships with five standard levels.

### PCL 1
Stock or relatively straightforward item. Minimal coordination. Usually one review path.

### PCL 2
Moderately custom item with some coordination and moderate lead time.

### PCL 3
Custom item with meaningful coordination and at least two meaningful review cycles likely.

### PCL 4
High-coordination, long-lead item with significant review and vendor iteration risk.

### PCL 5
Highly bespoke, highly coordinated, critical long-lead item with the highest review and lead-time risk.

## 16.2 Template Hierarchy
1. **System defaults** — ship with the app
2. **Company-level copies** — copied from system defaults, editable by company admin
3. **Project-level copies** — copied from company templates at project creation, editable per project
4. **Item-level copy on creation** — copied from project templates, independent thereafter

## 16.3 Core Rules
- templates are editable at system, company, and project level by authorized users
- **changes never cascade downward** — each level is a copy-on-create snapshot
- editing company templates does not affect existing projects
- editing project templates does not affect existing items
- item values are copied at creation time
- item values become independent after creation
- manual entry is always supported even when upstream import exists
- no buffer durations — the detailed phase structure eliminates the need for buffers

## 16.4 PCL Template Fields
- review_round_count
- final_design_required
- final_selection_required
- buyout_duration
- submittal_coordination_duration
- submittal_preparation_duration
- review_duration_by_round
- response_duration_by_round
- vendor_revision_duration_by_round
- fabrication_duration
- shipping_duration
- business_day_rule

**Note:** exact day counts should live in configuration data, not hard-coded prose in this product spec.

---

## 17. Procurement Item Scheduling Model

## 17.1 Canonical Phase Model

Every procurement item is built from a canonical sequence of phases and milestones.

### Standard milestones and phases
- Final Design milestone
- Final Selection milestone
- Buyout
- Submittal Coordination
- Submittal Preparation
- Initial Submittal
- Review Round 1
- Response 1
- Vendor Revision 1
- Resubmittal 1
- Review Round 2
- Response 2
- Vendor Revision 2
- Resubmittal 2
- Review Round 3 / Final Approval
- Start Fabrication milestone
- Fabrication
- Fabrication Complete milestone
- Shipping / Delivery
- Onsite Ready for Install milestone

Not all phases appear on every item. PCL structure determines which loops are included.

## 17.2 Calculation Modes

### Backward scheduling
Default mode. System calculates backward from required onsite date.

### Forward scheduling
Allowed when:
- item already has a locked start
- work is already underway
- actual dates constrain backward calculation

## 17.3 Scheduling Rules
- required onsite date is the default anchor
- actual dates on completed tasks are preserved
- locked dates constrain recalculation
- forward or backward recalculation must not overwrite actual history
- final design and final selection milestones act as dependencies where enabled
- changes to active items require edit reason capture
- all workday calculations must account for weekends and holidays from the applicable holiday calendar

## 17.4 Item Status Model

### Lifecycle status
- Draft
- Active
- Complete
- Archived

### Derived health status
- **On Track** — all tasks are on schedule or ahead; no overdue milestones; no unresolved external dependencies past due
- **At Risk** — the item has not yet missed a critical date, but current trajectory or remaining float indicates a likely miss; includes items where the calculated start date falls before today in backward scheduling mode
- **Waiting on External** — the item has at least one open request or dependency assigned to an external collaborator that has not been responded to and is approaching or past its expected response date
- **Blocked** — the item cannot proceed because a required predecessor (Final Design, Final Selection, or another gating dependency) has not been completed and is past its planned date
- **Late** — at least one task's actual start or actual finish date is later than the corresponding baseline planned date, or the current projected delivery date is later than the baseline delivery date

### Health status rules
- health status is **system-derived** from comparing current dates, actuals, baselines, and open requests
- the system evaluates status in priority order: Late > Blocked > Waiting on External > At Risk > On Track
- an item may only show one health status at a time (the highest priority condition wins)
- authorized users may manually override health status with an explanation that is logged in the audit trail

---

## 18. Baselines, Variance, and Audit

## 18.1 Baseline Rules
- baselines are immutable snapshots
- baseline numbers are sequential per project
- baseline should capture all active procurement items and tasks at snapshot time
- variance is shown against a selected baseline

## 18.2 Recommended baseline milestones
- Baseline 1: initial accepted procurement execution plan
- Additional baselines: major schedule reset, approved change event, major design shift, or milestone review

## 18.3 Edit Rules
- edits to Draft items do not require a reason
- edits to Active items require an edit reason
- edit reasons should be structured where possible:
  - owner change
  - design change
  - consultant review delay
  - vendor delay
  - shipping/logistics delay
  - field condition
  - internal correction
  - other

## 18.4 Deletion and Archiving
- Draft items may be deleted by authorized users
- Active items should be archived rather than hard deleted
- baseline history and audit history must remain intact

---

## 19. Permissions Model

JiTpro uses **two permission layers**:
1. company-level access
2. project-level role permissions

## 19.1 Company-Level Permissions

### Company Admin
Can:
- manage billing
- manage company settings
- manage users
- manage company contacts
- manage cost code libraries and defaults
- manage holiday calendar
- view all projects
- create projects
- assign company flags

### Company Member
Can:
- access assigned projects
- update allowed project data based on project role
- create projects only if project creator flag is granted
- view billing only if billing access flag is granted

## 19.2 Project Roles

- Principal / Executive
- Senior Project Manager
- Project Manager
- Project Engineer
- Project Administrator
- Superintendent
- Foreman
- External Collaborator

## 19.3 Project Permission Matrix

| Action | Principal | Sr PM | PM | PE | Project Admin | Superintendent | Foreman | External |
|--------|-----------|-------|----|----|---------------|----------------|---------|----------|
| View full project | Full | Full | Full | Full | Full | Full | Assigned/Relevant | Shared only |
| Edit project settings | Full | Full | Full | Limited | Limited | No | No | No |
| Activate project | Full | Full | Full | No | No | No | No | No |
| Manage project team | Full | Full | Full | Limited | Limited | No | No | No |
| Send external invites | Full | Full | Full | Limited | No | No | No | No |
| Edit project PCL templates | Full | Full | Full | No | No | No | No | No |
| Create procurement items | Full | Full | Full | Full | Limited | No | No | No |
| Edit item metadata | Full | Full | Full | Full | Limited | Limited | Limited | No |
| Edit critical dates/durations | Full | Full | Full | Full | No | Limited actual/field only | No | No |
| Create baselines | Full | Full | Full | No | No | No | No | No |
| Mark item complete/archive | Full | Full | Full | Limited | No | Limited actual completion only | No | No |
| Update actual dates/blockers | Full | Full | Full | Full | Limited | Full | Limited | Limited response/date confirmation |
| Upload documents | Full | Full | Full | Full | Full | Full | Limited | Shared only |
| Comment / create requests | Full | Full | Full | Full | Full | Full | Limited | Shared only |
| Export project data | Full | Full | Full | Full | Full | Limited | No | No |
| View billing/project tier usage | Full | Limited | Limited | No | No | No | No | No |

### Notes on role behavior

**Principal / Executive**
- broad project visibility and approval authority
- usually not daily operator

**Senior PM**
- full control of assigned project
- owns standards, baselines, and higher-level coordination

**PM**
- full day-to-day control
- owns activation, execution, and accountability

**PE**
- full item authoring and coordination support
- no baseline creation or activation authority by default

**Project Administrator**
- manages records, contacts, documents, exports, and administrative support
- does not own critical schedule logic by default

**Superintendent**
- updates actuals, field readiness, site blockers, and received/on-site milestones
- does not manage billing or project activation

**Foreman**
- limited field updates on assigned or relevant items
- not a schedule control role

**External Collaborator**
- only sees shared or assigned items
- can comment, respond, confirm dates, and upload docs
- cannot see internal-only notes, billing, baselines, or unrelated items

---

## 20. External Collaboration Model

## 20.1 Supported External Roles
- Owner
- Owner Representative
- Architect
- Engineer
- Designer
- Consultant
- Subcontractor
- Supplier

## 20.2 Invitation Rules
- external users are invited by internal project users with permission
- each external invitation must specify:
  - project
  - role
  - access scope
  - sponsoring internal user
- invitation states:
  - Draft
  - Sent
  - Accepted
  - Expired
  - Revoked

## 20.3 Visibility Rules
By default, external collaborators see:
- only items explicitly shared with them
- only shared documents and shared threads
- only dates and requests relevant to those shared items

External collaborators do **not** see:
- company workspace
- billing
- company user lists
- internal-only notes
- internal-only documents
- all-project views
- unrelated project items

## 20.4 Response Workflow
Internal users may create structured requests for external collaborators, such as:
- confirm review date
- upload submittal package
- confirm fabrication lead time
- respond to revision request
- confirm shipping / delivery window

External users may:
- reply in thread
- upload requested document
- confirm or reject date
- mark response submitted

They may not:
- change purchased item tier
- edit PCL templates
- create baselines
- broadly edit internal schedules

---

## 21. Notifications, Reports, and Exports

## 21.1 Minimum Notification Set
- lead form submitted
- sales invite sent
- company subscription payment success/failure
- project activation success/failure
- external invitation sent / accepted / expired
- item due soon
- item overdue
- response requested
- response overdue
- baseline created
- project at-risk digest
- item capacity threshold reached

## 21.2 Minimum Reports
- procurement item register
- items by status
- items by PCL
- overdue items
- items waiting on external response
- baseline variance report
- upcoming required onsite dates
- project item capacity usage
- project export to CSV/PDF

---

## 22. Release Boundaries

## 22.1 Launch / v1 Scope

### Must-have
- lead capture and invite flow
- company subscription purchase
- company setup
- internal users and company contacts
- company defaults and cost code library
- holiday calendar with base US defaults and customization
- CSV import for company directories with downloadable template
- project setup wizard through activation
- project-level procurement source selection
- manual procurement item creation
- CSV import/export for procurement items with downloadable template
- project-level PCL templates
- procurement list view
- procurement schedule / gantt view
- baselines and variance
- active-item edit reasons and audit log
- document upload
- comments / requests / responses
- external collaborator invitations and limited access
- basic notifications and reports

## 22.2 v1.1 Scope
- import from Scope Builder
- import from Specification / Selection Register
- saved views and advanced filters
- bulk item actions
- better portfolio reporting
- richer reminder automation

## 22.3 Later / v2+
- deep integrations with external systems
- lender-facing workflow
- advanced analytics / benchmarking
- broader portfolio governance
- AI-assisted duration recommendations or risk detection

## 22.4 Explicitly Deferred
- full budget forecasting
- full commitment / PO management
- full change order system
- full accounting integration
- replacing Procore or equivalent entirely
- generalized enterprise workflow engine

---

## 23. Non-Functional Requirements

- multi-tenant company data isolation
- row-level and object-level permission enforcement
- immutable baseline history
- immutable audit history for active-item changes
- reliable recalculation logic
- timezone-aware date handling
- holiday-aware workday calculations
- responsive UI for large item sets
- durable file storage
- export performance that supports active project use
- clear distinction between internal and shared data

---

## 24. Success Metrics

## 24.1 Business Metrics
- lead-to-demo conversion
- demo-to-paid subscription conversion
- paid company to first active project conversion
- average active projects per company

## 24.2 Product Metrics
- time from signup to first project activation
- average number of active procurement items per project
- percentage of items assigned a PCL
- percentage of active projects with at least one baseline
- external response turnaround time

## 24.3 Outcome Metrics
- number of at-risk items identified before required onsite date
- reduction in overdue procurement tasks
- reduction in manual re-entry from upstream planning tools
- adoption of structured external response workflows

---

## 25. Open Questions Requiring Validation

- exact project tier pricing boundaries
- exact default day counts for each PCL
- whether first baseline is required immediately at activation or after schedule review
- exact billing grace periods
- exact external approval semantics for architect/owner review workflows
- what fields must map from Scope Builder and Selection Register in the first integrated release

---

## 26. Naming and Terminology Standards

Use these terms consistently:
- **Principal** (not Principle)
- **Email + Password** (not Username + Password)
- **Final Completion Date** (not Final Date)
- **Company Users** and **Company Contacts** (not one blended "Company Directory" concept)
- **External Collaborator** for project-scoped outside participants
- **Respond** only for structured replies, confirmations, uploads, and thread responses

---

## 27. Summary of Key Product Decisions in This Revision

- separate internal licensed users from external collaborator accounts
- separate company-level permissions from project-level roles
- define procurement item as the core execution object
- make project activation capacity-based
- treat drafts as non-billable and activated items as billable
- keep architecture and implementation details out of the product spec
- define the full project setup wizard through activation
- define baselines, audit rules, and schedule recalculation as core product requirements
- holiday calendar with customizable base US defaults
- CSV import as v1 must-have with downloadable templates
- no buffer durations — detailed phase structure replaces buffers
- health status is system-derived with priority-based evaluation
