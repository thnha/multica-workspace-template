# Technical Design

## Metadata

Feature:
Issue:
Status: READY | NEEDS CLARIFICATION | BLOCKED
Feature Spec: <link + revision>
Repository / base / inspected SHA:

## 1. Summary

<3–6 sentences: what changes and why; requirements addressed by ID.>

## 2. Current Architecture

<Only what the change touches, with evidence paths. `UNKNOWN` where unverified.>

## 3. Proposed Changes

| Change | Component / path | What changes | Requirements |
|---|---|---|---|
| NEW / MODIFY / REUSE / REMOVE | ... | ... | FR-001 |

<Proposed flow, only if it differs from current.>

## 4. Architecture Decisions

### AD-001 — <decision>

- Requirements: FR-...
- Decision and rationale: ...
- Alternatives rejected: ...
- Consequences / risks: ...

## 5. Contracts, Data and Migration

N/A — <reason> when no API, event, schema, or stored-data change.

- API / contract changes and compatibility: ...
- Data model, constraints, indexes: ...
- Migration required: YES | NO — strategy, deployment order, backfill, rollback: ...

## 6. Cross-cutting Concerns

| Concern | Relevant? | Design / mechanism | Risk |
|---|---|---|---|
| Transactions and concurrency | YES/NO | ... | ... |
| Security (authn, authz, trust boundaries, input validation) | YES/NO | ... | ... |
| Client and version compatibility | YES/NO | ... | ... |
| Observability | YES/NO | ... | ... |
| Performance | YES/NO | ... | ... |

### Invariants

N/A — <reason> when the specification declares no invariants and the design
mutates no persisted or shared state.

| INV | Enforced by (mechanism + component) | How it could break | Required test (level, real infra) |
|---|---|---|---|
| INV-001 | unique (learner_id, lesson_id) + upsert in one transaction | concurrent submit, retry after lost response | integration, real Postgres, 20 parallel requests → 1 row |

## 7. Validation Strategy and Traceability

| Requirement | Design (AD / component) | Validation (unit / integration / contract / E2E / regression) |
|---|---|---|
| FR-001 | AD-001 | ... |

## 8. Risks, Impact and Dependencies

| ID | Risk or impact | Area | Mitigation / action |
|---|---|---|---|
| RISK-001 | ... | ... | ... |
| IMP-001 | ... | ... | ... |

Dependencies: ...

## 9. Open Questions

| ID | Question | Impact | Affected requirements | Blocking |
|---|---|---|---|---|

## 10. Implementation Guidance

- Work areas: ...
- Ordering constraints: ...
- Parallelizable work: ...

No task IDs or step-by-step tasks; decomposition belongs to the Planner.

## 11. Readiness

Status: READY | NEEDS CLARIFICATION | BLOCKED
Reason and blocking items: ...

## Workflow Handoff

```yaml
<workflow-state-protocol handoff>
```
