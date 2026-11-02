# workflow-state-protocol

## Purpose

Use consistent machine-readable workflow states and handoff information across all agents.

## Allowed high-level states

- READY
- IN_PROGRESS
- BLOCKED
- SPEC_PASSED
- DESIGN_PASSED
- PLAN_PASSED
- IMPLEMENTATION_COMPLETE
- REVIEW_PASSED
- REVIEW_FAILED
- REVIEW_SKIPPED
- ADVERSARIAL_REVIEW_PASSED
- ADVERSARIAL_REVIEW_FAILED
- ADVERSARIAL_REVIEW_SKIPPED
- QA_PASSED
- QA_FAILED
- QA_SKIPPED
- AWAITING_HUMAN_APPROVAL
- COMPLETED

## Ownership boundaries

Feature Analyst may produce SPEC_PASSED.

Software Architect may produce DESIGN_PASSED.

Implementation Planner may produce PLAN_PASSED.

Developer stage (Node Js Developer or React Native Developer) may produce
IMPLEMENTATION_COMPLETE.

Code Reviewer may produce REVIEW_PASSED or REVIEW_FAILED.

Adversarial Reviewer may produce ADVERSARIAL_REVIEW_PASSED or
ADVERSARIAL_REVIEW_FAILED.

QA / Test Engineer may produce QA_PASSED or QA_FAILED.

Only the Feature Orchestrator may record REVIEW_SKIPPED, QA_SKIPPED, or
ADVERSARIAL_REVIEW_SKIPPED, and only on a requester decision or standing rule
listed in workflow-gate-policy ("Skipped review and QA"). Record the source
(comment ID, description line, property, or rule), who confirmed, the reason,
and the revisions the skip covers. A SKIPPED state is not a PASS: never report
it as reviewed or tested.

Only the Feature Orchestrator may declare the overall workflow COMPLETED.

LARGE work requires explicit human approval before COMPLETED.

## Handoff format

Every stage should include a compact structured handoff:

```yaml
workflow:
  complexity: SMALL|MEDIUM|LARGE
  stage: <current stage>
  status: <allowed state>

evidence:
  artifacts: []
  changed_files: []
  commands: []
  tests: []

risks: []
assumptions: []
blocked_by: []

handoff:
  next_stage: <stage or NONE>
  entry_gate_satisfied: true|false
  reason: <short explanation>
```

Use real evidence. Do not fabricate command execution, test results, file changes, or approvals.

## Blocking

When BLOCKED, populate `blocked_by` and make `entry_gate_satisfied: false`.

Do not hide blockers inside prose while reporting a successful status.


## Multica issue status mapping

The uppercase states above describe workflow evidence. They are NOT arguments
to `multica issue status`. Keep them in the durable issue handoff, or an existing
compatible custom property after inspecting its definition. Do not create issue
statuses or property definitions to represent these tokens.

For a parent issue assigned to the Engineering Squad:

| Workflow condition | Multica issue status |
| --- | --- |
| Work is parked and not authorized to start | backlog |
| Work is admitted but not started | todo |
| Active stages, delegation, partial delivery, or correctable review/QA failure | in_progress |
| Work cannot proceed due to a documented dependency or decision | blocked |
| All required automated gates pass; LARGE awaits human approval | in_review |
| Authorized workflow is COMPLETED and ready for final human/merge handling | in_review |

An individual stage PASS never completes the parent. Do not set done merely
because a run ended or the workflow reports COMPLETED. Follow explicit closure
instructions or verified merge/close-intent behavior. Preserve human terminal
decisions; do not reopen a done/cancelled issue on a stale callback.

Use `--no-start` for status or assignment writes that only record ongoing work.
Starting an approved parked child is deliberate dispatch: promote backlog to
todo without `--no-start` only after its dependencies and entry gate pass.
Reassigning a child to another member, or reopening a done/in_review child for
repair, re-review, or re-test, is also dispatch: run `multica issue assign
<child> --to-id <agent>` WITHOUT `--no-start` (that enqueues the member's run),
then write the status. `assign --no-start` followed by `status todo` starts
nothing. Use `--no-start` only when the target member is already running on that
issue. After a dispatch, confirm with `multica issue runs <child> --active
--output json`; if no run is queued or running, start it with one
mention of the member on the child before ending the turn.
When acting as a guest leader on an issue assigned elsewhere, obey the runtime's
status-authority restriction and report findings without changing its status.

## Child issue status and closure

For a child issue created by the leader for one stage or work package:

| Child condition | Multica issue status |
| --- | --- |
| Parked until its entry gate passes | backlog |
| Dispatched | todo / in_progress |
| Member handed off evidence; leader gate check pending | in_review |
| Leader accepted its gate (PASS, or SKIPPED by requester) and any required PR is merged into the base branch named in its packet (`integration/<PARENT-KEY>` when the issue has several packages in that repository) or explicitly not needed | done — set automatically when a merged PR carries `Closes <key>`; otherwise the leader sets it |
| Failed gate with a repair cycle running on this same child | in_progress |
| Superseded, merged into another child, or no longer needed | cancelled, with a comment linking the replacement |

The leader moves a child to done or cancelled in the same turn it records the
gate decision. When the parent workflow ends (LARGE approval, requester closes
the parent, or requester cancels the work), close every remaining child that is
delivered, superseded, or no longer needed. A child whose work is unfinished
stays open and is listed on the parent as outstanding; never mark it done to
tidy up.

## No-action triggers

A duplicate callback, stale wakeup, or already-handled trigger gets no issue
comment; a comment on a squad-assigned issue can wake the leader again.
Members end such a run with one `No new work — <reason>` line
(handoff-policy); the leader follows NO-ACTION TRIGGERS in its instructions.

Record parent issue, task key, stage attempt, evidence revision(s), dispatch
comment/child issue IDs, unresolved finding IDs, repair-cycle count, next owner,
and blocker/approval references alongside the existing handoff schema.
For LARGE approval, record the approving human's explicit message/comment and
the scope/revisions it covers. Elapsed time or agent assertions are not approval.
