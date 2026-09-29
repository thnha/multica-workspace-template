---
name: implementation-plan-output-template
description: Produce the Implementation Planner's canonical plan with repository evidence, executable tasks, dependencies, coverage, readiness, and durable handoff.
---

# Implementation Plan Output Template

Use this skill when producing a final Implementation Plan. Read
`templates/implementation-plan.md` before writing; do not recreate it from
memory. Keep its headings and order.

## Length and brevity rules

- Target: under ~15,000 characters, with each task block under ~1,500
  characters. Split the plan only when it has more than ~8 tasks.
- The spec owns requirements and the design owns decisions: reference their
  IDs; never restate them. Guidance lists only what a developer cannot read in
  the design.
- A section that does not apply is one line: `N/A — <reason>`.
- Do not repeat the leader's gate checks or restate upstream approvals; the
  leader verifies gates.

## Inputs and authority

Read the issue, the approved Feature Specification and Technical Design, and
the relevant code (`codebase-exploration`). Preserve upstream FR/BR/NFR/EC/AC/
AD IDs exactly. Missing or contradictory required inputs produce a BLOCKED plan
naming the missing evidence and its owner; do not invent tasks around it.
Record repository, base branch, inspected SHA, and paths in Repository
Evidence. Cite exact paths only when inspected.

## Tasks

- One coherent, independently verifiable outcome per task, with owner role,
  repository/base, covered IDs, scope, dependencies, validation, and an
  objective Definition of Done.
- Group tightly coupled steps into one task; do not create a task per file or
  per step. Avoid sequential dependencies that exist only for ordering taste;
  allow parallel work once contracts and write scopes are clear.
- Stable TASK-001 IDs; keep IDs on revisions and never reuse a retired ID.
- Planned checks are not executed evidence; never record results you did not
  observe.
- Every INV in the design's Invariants table is owned by the task that
  implements its mechanism, and that task's Validation names the invariant
  test the design requires (real infrastructure, observable assertion).

## Readiness

READY only when: required inputs exist; repository evidence supports the scope;
tasks are bounded with objective DoD; dependencies are acyclic; every
applicable FR/AC/AD is owned (Coverage Gaps is `None`); validation is defined;
migration/rollback ordering is respected; no implementation-blocking ambiguity
remains. NEEDS CLARIFICATION: a usable draft with limited open questions, not
released for implementation. BLOCKED: a missing input or decision materially
affects scope, contracts, security, data, migration, or validation.

The plan status is not a Multica issue status. A READY plan proposes
PLAN_PASSED for the leader to verify; it does not dispatch anything. In the
YAML handoff use status READY, IN_PROGRESS (for NEEDS CLARIFICATION, with
next_stage NONE), or BLOCKED; entry_gate_satisfied stays false until the leader
verifies the developer entry gate. Branches, commits, and PRs do not exist yet;
never invent them.

## Delivery

Write the completed plan to `implementation-plan-<ISSUE-KEY>-r<attempt>.md`
and attach it to the summary-card result comment defined in `handoff-policy`.
Never paste the plan into the comment.
