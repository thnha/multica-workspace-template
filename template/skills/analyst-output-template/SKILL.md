---
name: analyst-output-template
description: Enforce the mandatory Feature Specification template for Analyst output.
---

# Analyst Output Template

Use this skill whenever the Analyst produces a final Feature Specification.
Read `templates/feature-specification.md` before writing; do not recreate it
from memory. Keep its headings and order; do not add top-level sections.

## Length and brevity rules

- Target: under ~8,000 characters for a typical MEDIUM feature; longer only
  when the requirement count genuinely needs it.
- Reference upstream artifacts and audit/review reports by ID and link; never
  restate them.
- A section that does not apply is one line: `N/A — <reason>`.
- Write each requirement and criterion once. Traceability lives in each AC's
  `covers` list; do not add a separate traceability table.

## Content rules

- Identifiers: FR-, BR-, NFR-, EC-, AC-, A-, Q-, R- with three digits; keep
  them stable across revisions.
- Do not invent requirements. Separate confirmed requirements, observed
  current behavior (with evidence), assumptions, and open questions. Never
  turn an assumption into a requirement.
- No implementation detail unless it is an explicit constraint.
- Acceptance criteria are observable, deterministic, and testable, in
  Given/When/Then. Every critical FR is covered by at least one AC.
- Use `UNKNOWN` for undeterminable facts. No `TODO`, `TBD`, or `{{...}}`.
- Invariants (INV-001…) state what must stay true regardless of timing,
  retries, duplicates, or failures: uniqueness, at-most-once, no lost update,
  ownership, monotonic progress, conservation of counts or balances. Write
  them in business terms; the mechanism belongs to the design or developer.
  Required when the change mutates persisted or shared state (learner
  progress, attempts, streaks, subscriptions, sync, jobs); otherwise one line
  `N/A — <reason>`. Each INV is observable enough to be asserted by a test.

## Readiness

- READY: downstream agents can proceed without inventing product decisions.
  Not READY while a blocking question, ambiguous core FR, contradiction,
  missing critical AC, unresolved critical BR, or behavior-changing assumption
  remains.
- NEEDS CLARIFICATION: product/business decisions needed; list them as Q-xxx.
- BLOCKED: required information, dependency, or access is unavailable.

## Delivery

Write the completed template to `feature-spec-<ISSUE-KEY>-r<attempt>.md` and
attach it to the summary-card result comment defined in `handoff-policy`.
Put the workflow-state-protocol YAML in the template's Workflow Handoff
section. Never paste the specification into the comment.
