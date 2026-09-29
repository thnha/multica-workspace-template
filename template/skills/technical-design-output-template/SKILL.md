---
name: technical-design-output-template
description: Enforce the mandatory Technical Design template for Architect agents.
---

# Technical Design Output Template

Use this skill whenever the Architect produces a final Technical Design. Read
`templates/technical-design.md` before writing; do not recreate it from memory.
Keep its headings and order; do not add top-level sections.

## Length and brevity rules

- Target: under ~12,000 characters; a behavior-preserving refactor should be
  much shorter.
- The Feature Specification owns WHAT; do not restate its requirements, only
  reference their IDs (keep upstream FR/BR/NFR/EC IDs unchanged).
- A section that does not apply is one line: `N/A — <reason>`. In the
  cross-cutting table, a NO row needs only a short reason.
- Describe current architecture only where the change touches it.

## Content rules

- Base every claim about existing code, contracts, data, or tests on inspected
  evidence (paths, SHA). Use `UNKNOWN` otherwise. Keep current and proposed
  architecture clearly separate.
- Do not invent or silently change product requirements; product ambiguity
  goes to Open Questions.
- Prefer existing project patterns; do not add components or redesign
  unrelated areas.
- AD-, RISK-, IMP-, Q- identifiers are stable. Each AD cites the requirements
  that justify it.
- Name the mechanism behind any concurrency, security, or compatibility claim;
  identify breaking changes explicitly; when migrating, cover coexistence of
  old and new versions during deployment.
- Invariants: carry every INV from the specification unchanged; add
  technical INVs the design itself introduces (e.g. outbox row exists iff the
  state change committed). For each, name the enforcing mechanism, the
  realistic ways it could break (concurrency, retry, duplicate delivery,
  partial failure, multiple instances, ownership), and the test that would
  prove it on real infrastructure. An INV without a mechanism or a test means
  the design is not READY.
- The validation strategy is a plan, not results; never claim tests passed.
- Every critical FR has a row in the traceability table.
- No planner tasks, task IDs, or assignments.

## Readiness

- READY: the Planner and Developers can proceed without inventing technical
  or product decisions. Not READY while a blocking question, a critical FR
  without a design path, an undefined required contract/data/migration
  behavior, unresolved significant concurrency/security/compatibility
  behavior, a critical requirement without validation, or a contradiction of
  the specification remains.
- NEEDS CLARIFICATION: decisions required; list them in Open Questions.
- BLOCKED: required information, code, access, or prerequisite unavailable.

## Delivery

Write the completed template to `technical-design-<ISSUE-KEY>-r<attempt>.md`
and attach it to the summary-card result comment defined in `handoff-policy`.
Put the workflow-state-protocol YAML in the template's Workflow Handoff
section. Never paste the design into the comment.
