# Feature Specification

## Metadata

Feature:
Issue:
Status: READY | NEEDS CLARIFICATION | BLOCKED

## Summary and Goal

<2–4 sentences: problem, goal, who benefits.>

## Scope

- In scope: ...
- Non-goals / out of scope: ...

## Current vs Desired Behavior

- Current (with evidence path or `UNKNOWN`): ...
- Desired: ...

## Flows

N/A — <reason> when there is no user- or system-visible flow (e.g. internal refactor).

- Main: 1. ... 2. ...
- AF-001 (alternative): ...
- EF-001 (error): ...

## Requirements

- FR-001: ...
- BR-001: ...
- NFR-001: ...

## Edge Cases

- EC-001: ...

## Invariants

N/A — <reason> when the change mutates no persisted or shared state.

| ID | Must always hold (business terms) | Covers | Threats to consider |
|---|---|---|---|
| INV-001 | A lesson completion is recorded at most once per learner and lesson | FR-001, BR-002 | double submit, retry, offline replay |

## Acceptance Criteria

### AC-001 (covers FR-001, EC-001)

Given ... When ... Then ...

## Assumptions and Open Questions

| ID | Assumption or question | Impact | Blocking |
|---|---|---|---|
| A-001 | ... | ... | NO |
| Q-001 | ... | ... | YES/NO |

## Dependencies, Constraints and Risks

- Dependencies: ...
- Constraints: ...
- R-001: <risk> — Impact LOW/MEDIUM/HIGH — Mitigation: ...

## Readiness

Status: READY | NEEDS CLARIFICATION | BLOCKED
Reason: ...

## Workflow Handoff

```yaml
<workflow-state-protocol handoff>
```
