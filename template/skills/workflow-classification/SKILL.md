# workflow-classification

## Purpose

Classify engineering work into the minimum safe workflow level: SMALL, MEDIUM, or LARGE.

## Rules

Classification is based on engineering impact and risk, not issue length.

### SMALL

Use SMALL when all important characteristics are localized and low risk:

- existing behavior is understood
- limited blast radius
- no architecture change
- no API contract change
- no schema/migration change
- no authentication/authorization impact
- no security-sensitive behavior
- no major integration impact

Examples: text changes, small validation fixes, localized UI bugs, narrow logic bugs, simple refactors covered by existing tests.

Workflow:

Developer → Developer validation → Code Reviewer → QA / Test Engineer

### AUDIT-FIX (SMALL route for fixing review/audit findings)

Use AUDIT-FIX when the issue asks to fix findings from an existing Code Review
or quality-audit report (finding IDs with locations and corrections), usually a
child of the review issue or linking it. Typical findings: lint/format budget,
naming, file moves, dead or scratch files, test fixes and flaky/open-handle
tests, localized bugs, and behavior-preserving refactors (splitting large
components/modules, moving code behind existing boundaries).

- The audit report is the specification; its finding IDs are the acceptance
  criteria. No Feature Analyst, Software Architect, or Implementation Planner.
- Complexity is SMALL for workflow-state purposes.
- Many changed files do not escalate it. A behavior-preserving reorganization
  covered by tests is not an "architecture change".
- A finding that needs an API/data contract change, schema or migration,
  learner-data deletion, auth/security design, or a product decision is taken
  out of the route: ask the requester once, in one batched question, whether to
  drop it or move it to its own MEDIUM/LARGE issue; the other findings continue.

Workflow:

Developer(s) → Code Reviewer (per PR) → QA / Test Engineer (once, at the end)

### MEDIUM

Use MEDIUM for moderate feature/integration work such as:

- new API endpoint
- new UI flow
- small database change
- new business logic
- multiple affected components
- moderate integration work

Workflow:

Feature Analyst → Developer → Code Reviewer → QA / Test Engineer

### LARGE

Use LARGE when the work includes substantial architectural, security, data, operational, or cross-system risk, including:

- authentication
- authorization
- payments
- deleting or migrating learner data on the server or on devices (for example
  local SQLite lesson tables or progress rows)
- account merge or identity linking
- offline sync and conflict resolution
- publishing or versioning lesson content consumed by released app versions
- architecture changes
- major migrations
- distributed systems
- security-sensitive changes
- major external integrations
- broad cross-service changes

Workflow:

Feature Analyst → Software Architect → Implementation Planner → Developer(s) → Code Reviewer → QA / Test Engineer → Human Approval

### Not LARGE by itself

Touching both LingoBites-Server and LingoBites-App is not LARGE by itself.
New or changed endpoints plus the app screens/clients that consume them are
MEDIUM when the API/data/error contract is agreed before implementation splits.
Use LARGE only when at least one LARGE trigger above is actually present.

Fixing audit findings is not MEDIUM or LARGE by itself: use AUDIT-FIX unless a
specific finding carries a MEDIUM/LARGE trigger, and then split only that
finding out.

### Behavior-preserving restructuring is MEDIUM

Reorganizing code without changing runtime behavior (module boundaries and
ownership, splitting clients/files, moving screens/DTOs, aliases, boundary
checker rules) is MEDIUM, not an "architecture change" LARGE trigger, when all
of these hold:

- no API/data/error contract, route contract, or server payload change
- no schema, storage key, migration, or learner-data deletion
- no auth/security, sync/conflict, or transaction logic change
- characterization tests (existing or added first) prove unchanged behavior

The MEDIUM route still gets Code Review and QA, and the Invariant-critical
flag below still applies on its own when persisted data must be preserved.
Use LARGE when any condition fails, or when a real LARGE trigger is present.
Apply this at classification time; do not reclassify work already running.

## Invariant-critical flag

Independent of the level, flag the work `Invariants: REQUIRED` when the change
creates or modifies behavior that mutates persisted or shared state where
timing, retries, duplicates, partial failure, or ownership can break
correctness, including:

- learner progress, lesson completion, exercise attempts, scores, streaks,
  reminders/review scheduling
- subscriptions, purchases, entitlements, credits
- offline sync, conflict resolution, outbox/queue/job processing, webhooks
- idempotent endpoints, uniqueness guarantees, counters and balances
- per-user ownership of mutable resources

Read-only changes, UI-only changes, copy, styling, and behavior-preserving
refactors covered by existing tests are not flagged.

A flagged item adds invariants to its artifacts; whether each package also
gets an Adversarial Review stage follows R1 in orchestrator-routing
("Adversarial review"). The flag never lowers or raises the level by
itself. When uncertain, flag it.

A requester line `Adversarial: required` or `Adversarial: skip` in the issue
description sets the flag. Report contrary evidence once and follow it.

## Requester override

A `Classification: SMALL|AUDIT-FIX|MEDIUM|LARGE` line in the issue description, written by
the requesting user, sets the level. Report contrary evidence once, with the
evidence, and follow the requester's level unless they change it.

## Escalation

When uncertain whether a LARGE trigger is present, choose LARGE. For audit
fixes, apply this per finding, not to the whole issue. When uncertain
only between SMALL and MEDIUM, choose MEDIUM.

Classification can increase when new evidence appears.

A SMALL task must be escalated when repository inspection reveals contract, schema, security, architecture, migration, or significant cross-component impact.

A MEDIUM task must be escalated when architectural, security, major data-integrity, migration, or broad cross-service concerns appear.

Do not preserve a lower classification merely to save compute.
