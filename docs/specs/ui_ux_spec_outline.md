# DESIGN / INTENT DOCUMENT

This document describes the intended or future state of the system.

It may not reflect the current implementation.

Refer to:
docs/CURRENT_STATE_UPDATED.md for actual system behavior.

---

JiTpro UI/UX Specification Outline
1. Purpose

Define the target UI/UX structure for JiTpro so the product feels current against modern construction SaaS standards while staying focused on JiTpro’s procurement-specific workflow.

This document should govern:

navigation and information architecture
page and screen inventory
default dashboards
common interaction patterns
onboarding and setup flows
internal vs external user experiences
v1 vs v1.1 UI boundaries
2. UX Design Direction
2.1 Core direction

JiTpro should feel:

modern and operational, not enterprise-legacy
action-first, not report-first
structured and auditable, not spreadsheet-like
narrower and cleaner than a full construction suite
consistent across company, project, and external portal contexts
2.2 Design principles
Separate company administration from project execution
Separate project settings from day-to-day work
Use a persistent left navigation + top bar shell
Use overview pages as the landing experience, not blank lists
Use lists/tables as the primary work surface
Use drawers and side panels for quick edits and context preservation
Keep charts secondary to tasks, alerts, and recent activity
Make external collaboration feel like a simplified portal, not a cut-down internal app
Avoid deep treeviews and overly nested navigation
Make all permission restrictions obvious in the UI
2.3 Product additions this UI spec assumes

To meet current standards, the UI should include:

Company Home / Portfolio page
Project Overview page
Company-level Project Setup Templates
First-class Organizations UI surface
External Collaborator portal
3. Product Surface Model

JiTpro should have four distinct surfaces:

3.1 Public Surface
marketing site
lead form
sales invite landing
login
forgot password / reset password
3.2 Internal Company Workspace

Used for company-wide setup, portfolio visibility, and pre-bid/preconstruction tools.

3.3 Internal Project Workspace

Used for project-specific procurement execution.

3.4 External Collaborator Portal

Used by invited owners, architects, consultants, suppliers, and subcontractors with limited project-scoped access.

4. Global Navigation Model
4.1 Authenticated Shell
Top bar

Persistent across all authenticated experiences.

Contents:

company / workspace identity
context switcher (Company Home vs current project)
project picker
global create button
notifications
help / support
user profile menu
Left navigation

Context-sensitive.

company workspace nav when user is at company level
project workspace nav when user is inside a project
external portal nav for external users
Page header

Every page should have:

title
short descriptor or breadcrumb
primary action button
secondary actions
optional page-level filters or date range
4.2 Navigation rules
no treeview as the primary nav pattern
no more than two levels of primary navigation
settings live in dedicated Settings areas, not mixed into operational screens
create flows should be accessible from a global “Create” action where appropriate
4.3 Context switching
internal users can move between Company Home and assigned projects
project picker should support search and recent projects
external collaborators default into External Home and can switch only among projects they are invited to
5. Information Architecture
5.1 Company Workspace Navigation

Group the left nav as follows:

Workspace
Home
Projects
Pre-bid Tools
Scope Builder
Selection Register
Directories
People
Organizations
Standards
Cost Codes
Calendars
Project Templates
Admin
Billing
Settings
5.2 Project Workspace Navigation
Work
Overview
Items
Schedule
Requests
Documents
Project Admin
Team
Baselines
Reports
Settings
5.3 External Portal Navigation
Home
Shared Items
Requests
Documents
Profile / Help
6. Common Layout Standards
6.1 Page anatomy

All major pages should use:

sticky page header
primary content area
optional right rail for summary/actions
optional filter bar below header
consistent empty/loading/error states
6.2 Primary work patterns
tables for registers and queues
cards for overview/dashboard modules
drawers for quick detail/edit without leaving a list
full pages for setup, comparison, and complex editing
tabs for related grouped content
split views for queues + thread/detail panels
6.3 Standard UI components
status chips
permission badges
invite status badges
external visibility badges
editable forms with inline validation
audit/history side panel
confirmation modals for destructive actions
import preview tables
baseline compare summary cards
6.4 Status presentation

Use standardized chips for:

project status
activation status
user invite status
lifecycle status
health status
request status
document visibility

Health statuses should always appear with consistent ordering and color semantics:

Late
Blocked
Waiting on External
At Risk
On Track
6.5 Editing pattern
non-critical metadata may be inline-editable where appropriate
critical schedule edits must use a modal or drawer that requires edit reason entry for active items
archived, locked, or permission-restricted fields should clearly show why they cannot be edited
7. Entry, Login, and Onboarding UX
7.1 Lead Form

Simple public form with:

company name
contact name
email
phone
company type / notes

Post-submit state:

success confirmation
next-step message
no user account creation at this stage
7.2 Sales Invite Landing

Invite page should:

identify invited company
identify invitee email
explain next step clearly
support create account
support expired/resend handling
7.3 Login

Use email + password.
Screen should include:

company-neutral JiTpro branding
email
password
forgot password
invitation acceptance fallback
SSO placeholder reserved for later, not emphasized in v1
7.4 Early Paywall / Subscription Step

After first admin creation, the system should present:

company subscription summary
what unlocks with subscription
payment method form
trial / demo note if applicable
lockout of deep setup until payment succeeds
7.5 Company Setup Onboarding

Use a wizard or checklist-based onboarding flow:

Suggested steps:

Company Profile
Holiday Calendar
Internal Users
Contacts
Cost Codes
Project Templates
Finish / Go to Home

Onboarding should support:

save and resume
completion percentage
“skip for now” only where acceptable
clear indication of required vs optional tasks
8. Company Workspace Pages
8.1 Company Home
Purpose

Primary landing page for company admins, principals, and internal users who need a portfolio view.

UX goal

Show what needs attention now across the company.

Layout

Top summary row:

My Work
Projects Requiring Attention
Waiting on External
Billing / Activation Alerts

Main content:

Active Projects list
At-Risk Projects
Projects Ready for Activation
Upcoming Required Onsite Dates
Recent Activity

Right rail:

quick actions
onboarding checklist (for new companies)
latest notifications
Primary actions
Create Project
Invite User
Import Contacts
Open Billing
Open Project Templates
Empty state

For new companies:

guided setup checklist
sample screenshots / explanation of what Home will show once projects exist
8.2 Projects
Purpose

Portfolio register of all projects.

Default view

List/table view in v1.

Recommended columns
Project Name
Project Number
Type
Status
Activation Status
PM / Owner
Final Completion Date
Active Item Count
At-Risk Item Count
Waiting on External Count
Last Activity
Filters
project status
activation status
project type
PM
location
date range
billing / lock state
Actions
Create Project
Open Project
Duplicate From Template
Archive / Close (permissioned)
Export list
v1.1 enhancements
card view
map view
saved views
8.3 People
Purpose

Manage internal users, company contacts, and invite status.

Structure

Use tabs:

Internal Users
Company Contacts
Invitations
Internal Users tab

Columns:

Name
Email
Membership Type
Flags
Status
Assigned Projects
Last Active
Actions

Actions:

Invite User
Bulk Invite
Deactivate
Resend Invite
Assign to Project
Company Contacts tab

Columns:

Name
Organization
Contact Type
Role / Discipline
Email
Phone
Active Projects
Actions

Actions:

Add Contact
Import CSV
Export CSV
Assign to Project
Deactivate
Invitations tab

Shows:

pending invites
accepted
expired
revoked
Bulk-add behavior

Support paste-many emails for internal users and CSV import for contacts.

8.4 Organizations
Purpose

Manage outside firms and internal organizational relationships as a first-class browseable surface.

Note

If v1 data remains contact-centered, this page may initially be backed by grouped organization_name values, but the UX should still behave like a dedicated organization directory.

Default columns
Organization Name
Type
Primary Contact
Email / Phone
Active Projects
Tags
Actions
Organization types
Owner
Architect
Engineer
Designer
Consultant
Subcontractor
Supplier
Other
Organization detail

Open in drawer or page with:

overview
linked contacts
linked projects
notes
recent requests/documents later if available
8.5 Pre-bid Tools
Scope Builder

Company-level entry point for pre-bid scoping workflow.

Selection Register

Company-level entry point for specification/selection workflow.

UX requirement

These tools should appear in company workspace nav, but detailed screen design can live in a companion spec.

Handoff requirement

Each tool should clearly expose:

export / handoff readiness
link to project setup/import flow
source traceability
8.6 Cost Codes
Purpose

Manage company cost code library.

UI pattern

Table with optional hierarchy expand/collapse.

Actions
Add Cost Code
Edit
Import CSV
Export CSV
Activate / Deactivate
Key behaviors
support hierarchical display
allow filtering by division/subdivision
keep dense but readable
8.7 Calendars
Purpose

Manage company holiday calendar and non-working day standards.

Layout

Two-panel layout:

left: calendar selector / settings
main: month or list view of holidays
right: edit/create holiday drawer
Core actions
Add Holiday
Add Shutdown Range
Edit
Delete / Deactivate
Restore default US holidays
UX behavior
recurring holidays and one-time dates should be visually distinct
explain that existing projects use their own project calendar snapshot after project creation
provide clear warning when company calendar edits affect future projects only
8.8 Project Templates
Purpose

Manage company-level Project Setup Templates.

Important distinction

These are not PCL templates.

What a Project Setup Template may prefill
project type
standard consultants
default team roles
categories / systems
locations / areas
calendar choice
request defaults
default project settings
Default view

Template list or cards showing:

template name
type
last updated
usage count
status
Actions
Create Template
Duplicate
Edit
Archive
8.9 Billing
Purpose

Manage company subscription and project activation commercial state.

Content
subscription status
payment method
billing contacts
invoices / receipts
active projects and purchased capacity
projects in warning / lock state
Actions
update payment method
view invoices
activate project payment
upgrade / add capacity
8.10 Company Settings
Suggested sections
Company Profile
Branding
Notification Defaults
Permission / Invite Policies
Security
Support / Account Info
Rule

Keep settings administrative and separate from portfolio/work views.

9. Project Setup Wizard UX
9.1 Overall wizard structure
Recommended flow

Add a new opening step before current Screen 1:

Screen 0: Choose Project Template

blank project
start from company project template

Then continue with the existing wizard:

Project Details
Client / Owner
Consultants
Project Team
Procurement Source
Cost Codes & Categories
Scheduling Defaults & PCL Templates
Activation & Billing
Persistent elements
left or top stepper
progress state
Save & Exit
sticky right summary rail
validation status per step
Right summary rail content
project name
project type
PM / owner
key dates
estimated item count
activation summary
9.2 Wizard interaction standards
progressive disclosure for residential vs light commercial fields
inline create for new contacts and organizations
prefill from selected project template
import actions open in modal/side flow without losing wizard progress
every step should support back/next without data loss
9.3 Step-specific UI notes
Screen 1: Project Details
structured form
conditional fields by project type
date validation and inline guidance
Screen 2: Client / Owner
residential vs commercial form mode switch
organization/person distinction
create from existing contact/organization when possible
Screen 3: Consultants
repeatable consultant cards/rows
default consultant types preloaded
support two architect/engineer contacts by default
Screen 4: Project Team
split internal vs external selection areas
searchable add-from-company directory
invite status shown inline
access scope required for each external team member
Screen 5: Procurement Source
option cards for Manual / CSV / Scope Builder / Selection Register / Combined
import template download visible for CSV
imported items default to Draft
Screen 6: Cost Codes & Categories
mapping table
category multi-select
optional locations / areas panel
Screen 7: Scheduling Defaults & PCL Templates
show inherited project calendar
show holiday calendar override option
show project-level PCL editor
clearly separate scheduling defaults from PCL internals
Screen 8: Activation & Billing
capacity summary
recommended tier
installment summary
payment confirmation
final confirmation CTA
10. Project Workspace Pages
10.1 Project Overview
Purpose

Default landing page inside a project.

UX goal

Show what needs attention now on this project.

Layout

Top summary strip:

Project Status
Activation Status / Capacity
Final Completion Date
PM / Internal Owner
Latest Baseline
Last Activity

Main dashboard modules:

My Open Items / Tasks
At Risk / Late / Blocked / Waiting on External counts
Upcoming Required Onsite Dates
Recent Requests
Latest Baseline Variance
Recent Activity
Shared Documents / Recent Uploads

Right rail:

Quick Actions
Team Summary
Project Links / key settings
Quick actions
Create Item
Import Items
Create Request
Upload Document
Create Baseline
Open Schedule
UX rules
action cards first
charts secondary
prioritize due-now work over analytics
10.2 Items
Purpose

Primary operational register for procurement items.

Default layout

Table/list as the main surface, with detail drawer on row click.

Suggested tabs or filters
All
Draft
Active
Complete
Archived
Key columns
Item #
Title
Category / System
Cost Code
Location / Area
PCL
Owner
Required Onsite
Current Phase
Health Status
External Status
Baseline Variance
Lifecycle Status
Primary actions
Create Item
Import CSV
Bulk Edit
Share with External
Export
Archive
Recalculate
Filter bar
status
health
owner
category
PCL
external collaborator
date range
requests waiting on external
Bulk actions
assign owner
change lifecycle status
set visibility
export selected
archive draft items
recalc selected items
10.3 Item Detail
Access pattern

Open in right drawer from Items or Schedule.
Support deep link to full page if needed.

Sections
Overview
Schedule
Requests
Documents
Audit / History
Overview section
item identity
owner
cost code / category
location
PCL
required onsite
lifecycle status
health status
baseline reference
Schedule section
milestone summary
task list
planned vs actual dates
locks
recalc controls
holiday-aware dates
Requests section
open requests
overdue requests
create request
linked external collaborators
Documents section
internal docs
shared docs
upload
version history
Audit / History
edit log
status changes
override reasons
health override explanation
baseline changes reference
Edit behavior
if item is Active, critical changes must route through edit-reason flow
show what fields are editable vs locked
10.4 Schedule
Purpose

Visual procurement timeline / gantt.

Layout

Combined grid + gantt timeline.

Core features
zoom by week / month
today line
baseline overlay
group by category / owner / vendor / location
filter by health/status
open item drawer on click
show holiday/non-working-day shading if feasible
User actions
adjust view
open item
open requests
export schedule
create baseline
recalc project / filtered set
v1 rule

Focus on readability and operational use, not advanced CPM behavior.

10.5 Requests
Purpose

Operational queue for comments, requests, confirmations, and responses.

Layout

Split view:

left: queue
right: thread / response panel
Default tabs
Open
Overdue
Waiting on External
Completed
Columns
Request Type
Item
Requested To
Requested By
Due Date
Status
Last Activity
Actions
Create Request
Reply
Upload File
Mark Complete
Filter by external collaborator / organization / due date
10.6 Documents
Purpose

Project and item-level document management for procurement workflows.

Default tabs
All
Internal Only
Shared With External
Views
list view in v1
optional grid later
Core metadata
file name
item
visibility
uploaded by
version
updated date
Actions
Upload
Replace Version
Share / Unshare
Download
Link to Item
10.7 Team
Purpose

Manage project participants.

Structure

Tabs:

Internal Team
External Collaborators
Pending Invites
Columns
Name
Organization
Role
Access Scope
Invite Status
Last Activity
Actions
Actions
Add From Company Directory
Invite External
Change Role
Change Access Scope
Resend Invite
Revoke Invite
10.8 Baselines
Purpose

View, create, and compare immutable project baselines.

Layout

Top summary:

current baseline
baseline count
latest variance counts

Main content:

baseline list
compare mode
variance summary by item/status
Actions
Create Baseline
Compare Baseline to Current
Export Variance
Rules
no edit-in-place
baseline creation should feel important and deliberate
10.9 Reports
Purpose

Operational exports and standard reports.

v1 approach

Curated report center, not full BI builder.

Reports included
procurement register
overdue items
waiting on external
baseline variance
upcoming onsite dates
capacity usage
Actions
run report
export CSV/PDF
save filters later in v1.1
10.10 Project Settings
Purpose

Dedicated project admin area, separate from work views.

Suggested sections
General
Client / Owner
Consultants
Team Defaults
Categories / Locations
Scheduling & Calendar
PCL Templates
Sharing & External Access
Activation & Billing
Rule

Only show to roles with project settings access.

11. External Collaborator Portal
11.1 Goal

Provide a very simple, project-scoped experience for external parties.

11.2 Principles
minimal nav
no company workspace
no unrelated projects/items
no internal-only notes or docs
no full schedule administration
mobile-friendly by default
11.3 External Home
Content
pending requests assigned to me
due soon
overdue
recently shared documents
recently shared items
Actions
respond to request
upload file
open shared item
download doc
11.4 Shared Items
Purpose

List of items shared or assigned to the external user.

Columns
Item #
Title
Category
Required Response / Due Date
Status
Last Update
Item detail

Show:

summary
limited milestone dates relevant to the collaborator
open requests
shared docs
thread history
11.5 Requests
Purpose

Main response queue for the external user.

Actions
reply
confirm / reject date
upload document
mark response submitted
11.6 Documents
Purpose

View only shared documents and upload requested files where allowed.

Rule

No access to internal-only content.

12. Common Interaction Flows
12.1 Invite Internal User
open People
add one or many emails
assign membership type / flags
send invite
show invitation status chips
12.2 Import Company Contacts
open People > Company Contacts
download template
upload CSV
preview mapping/errors
confirm import
show import summary
12.3 Create Project
click Create Project
choose blank or template
complete wizard
save as draft or proceed to activation
12.4 Create Procurement Item
create from Items page
choose manual or import
set initial fields
save as Draft
activate later after review
12.5 Edit Active Item
open item
edit critical field
require reason modal
save
show audit confirmation toast
12.6 Create Baseline
open Baselines
create baseline
name / note
confirm snapshot
success state with compare action
12.7 Send External Request
open item or Requests
select collaborator
choose request type
set due date
attach file if needed
send
notification confirmation
13. Role-Based UX Rules
13.1 Company Admin

Default landing:

Company Home

Visible company nav:

all company pages

Visible project nav:

all assigned project pages
13.2 Principal / Executive

Default landing:

Company Home or last-open project Overview

Focus:

overview, reports, baselines, risk
13.3 Senior PM / PM / PE / Project Admin

Default landing:

last-open project Overview

Focus:

project work surfaces
13.4 Superintendent / Foreman

Default landing:

project Overview
may be directed to Items or Schedule with relevant filters applied

Focus:

due soon, field blockers, actual dates, documents
13.5 External Collaborator

Default landing:

External Home

Visible nav:

Home
Shared Items
Requests
Documents only
14. Responsive Behavior
14.1 v1 target
internal workspace optimized for desktop
tablet support for Overview, Items, Requests, Documents, Team
external portal fully responsive and mobile-friendly
14.2 Mobile posture
full internal mobile parity is not required in v1
external response workflows should work well on mobile
field users should be able to view relevant items and upload documents on tablet-sized screens
15. Accessibility and Usability Standards
keyboard-accessible navigation
sufficient contrast for all status chips
no status conveyed by color alone
form validation must be inline and readable
loading/error/empty states must be explicit
destructive actions must require confirmation
permission-restricted actions should explain why access is unavailable
16. Visual and Interaction Standards
Visual tone
clean, professional, operational
light default theme in v1
restrained color use, mainly for status and hierarchy
Density
moderate information density
denser tables for expert users
generous spacing on overview/dashboard surfaces
Iconography
use icons to support recognition, not replace labels
Motion
minimal
used only for drawers, toasts, and state transitions
17. Release Boundaries for UI/UX
17.1 v1 must-have
public lead flow
login / invite / onboarding
Company Home
Projects
People
Organizations
Cost Codes
Calendars
Project Templates
Billing
Project Setup Wizard
Project Overview
Items
Item Detail
Schedule
Requests
Documents
Team
Baselines
Reports
Project Settings
External Portal
17.2 v1.1 likely additions
saved views
project cards/map view
richer company portfolio analytics
configurable dashboard modules
deeper organization pages
global search
more advanced schedule interactions
bulk actions expansion
17.3 later
full mobile internal experience
user-personalized dashboards
cross-project advanced reporting
deeper pre-bid tool UX harmonization
AI-driven guidance surfaces
18. Required Product-Spec Follow-Ons

This UI/UX outline implies a few product-spec additions or clarifications:

add Company Home / Portfolio as a first-class page
add Project Overview as a first-class page
add Company-level Project Setup Templates as a distinct feature from PCL templates
add Organizations as a first-class UI concept, even if initially backed by grouped contacts
define the external portal screen set explicitly
define default landing pages by role
define whether global search is v1 or v1.1
19. One-sentence design target

JiTpro should feel like a focused procurement operating system with the navigation clarity and dashboard standards of modern construction SaaS, the audit rigor of enterprise systems, and a much cleaner, narrower day-to-day experience than a general-purpose platform.