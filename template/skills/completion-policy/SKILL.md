# Completion Policy

## Principle

Completion is determined by evidence and defined gates,
not by agent confidence.

## Task Completion

A task may be COMPLETE only when:

- required implementation exists
- requirements assigned to the task are addressed
- required validation has passed
- no known blocking failure remains
- required artifacts are updated

## Feature Completion

A feature may be considered READY TO MERGE only when:

- specification is approved
- implementation is complete
- required build checks pass
- required automated tests pass
- review is approved
- QA requirements are satisfied
- migrations are validated when applicable
- unresolved blockers are absent

## Not Complete

The following do not constitute completion:

- code generated
- code compiles only
- unit tests pass while required integration tests are missing
- reviewer has not reviewed
- QA has not validated required acceptance criteria
- required evidence is unavailable

## Partial Completion

If some work succeeds and some remains:

Status:
PARTIAL

Clearly identify completed and remaining work.

Never convert partial success into DONE.


## Stage-aware completion

Apply completion requirements to the assigned deliverable. Analysis, design,
planning, review, and QA tasks complete by delivering their required artifacts
and evidence; they do not require the author to implement production code.
For implementation tasks, the implementation and validation requirements above
apply. Feature-level gates follow the selected complexity route: SMALL does not
require a separate Feature Analyst or QA stage unless risk warrants escalation.
PARTIAL describes delivery progress, not a new workflow state or Multica status:
record remaining work under IN_PROGRESS, or BLOCKED if it cannot proceed.
Workflow COMPLETED means the authorized engineering workflow gates passed; it
does not assert that a PR merged, software deployed, or the issue is done.
