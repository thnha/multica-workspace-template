---
name: analyst-output-template
description: Enforce the mandatory Feature Specification template for Analyst output.
---

# Analyst Output Template

Use this skill whenever the Analyst produces a final Feature Specification.
Read `templates/feature-specification.md` before writing; do not recreate it
from memory. Keep its headings and order; do not add top-level sections.

## Length and brevity rules

- Target: main body (Metadata through Readiness) under ~8,000 characters for a
  typical MEDIUM feature; longer only when the requirement count genuinely
  needs it. Changelog and Appendix A do not count toward the target.
- The Requester Summary comes first, is Vietnamese, and is at most 10 lines.
  It must be readable without the rest of the document.
- Reference upstream artifacts and audit/review reports by ID and link; never
  restate them.
- A section that does not apply is one line: `N/A — <reason>`.
- Write each requirement and criterion once. Traceability lives in each AC's
  `covers` list; do not add a separate traceability table.

## Readability rules

- Normative sections state the current requirement only. Revision notes
  ("r4 clarifies …"), retired-ID lists and moved-ID lists go in Changelog.
- File paths, line numbers and SHAs go in Appendix A as E-xxx rows; the body
  cites E-xxx. Metadata keeps only the repo SHAs read.
- Acceptance criteria: one Given/When/Then scenario per line (S1, S2, …),
  each with its surface tag. Never chain several scenarios in one paragraph.
- Diagrams: at most two conceptual Mermaid diagrams (domain concepts, main
  flow); never tables, columns, classes or endpoints.
- Glossary: every domain or technical term a non-engineer would not know
  (for example revision, tombstone, aggregate, outbox).
- Screens and States: required when the change is user-visible; list each
  affected screen with its loading, empty, ready, error, offline and stale
  states as applicable. No visual design.

## Content rules

- Every FR, BR and NFR carries a priority (Must, Should or Could) and an
  origin tag: [REQ] requested by the requester (cite the source), [DER]
  strictly required for a [REQ] item, or [PROP] the analyst's proposal.
  [PROP] items stay out of scope unless the requester accepted them. With a
  Clarification Record, every item traces to it or is [DER].
- Option defaults (★) are the smallest option that meets the stated goal;
  every option states its cost.

- Identifiers: FR-, BR-, NFR-, EC-, AC-, A-, Q-, R-, E- (evidence) with three digits; keep
  them stable across revisions.
- Do not invent requirements. Separate confirmed requirements, observed
  current behavior (with evidence), assumptions, and open questions. Never
  turn an assumption into a requirement.
- No implementation detail unless it is an explicit constraint. Exception
  (Workflow v2, MEDIUM): Appendix A `Implementation pointers` lists verified
  work areas, likely changes, tests to extend and a suggested block order, so
  the developer starts without rediscovering the code. Pointers are not
  requirements and never widen scope.
- Reuse an existing Feature Specification of the same feature by link; write
  only the task-specific additions. Ask a question only when its answer
  could change an implementation decision; otherwise record an assumption
  with its default.
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
