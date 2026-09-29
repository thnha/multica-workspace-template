# workflow-gate-policy

## Principle

Agents create evidence. Gates determine whether work may advance.

An agent's statement that work is complete is not itself sufficient evidence.

## General gate

Before starting a stage, verify that all required upstream artifacts exist and are acceptable.

If an entry gate is not satisfied:

- do not perform the downstream work
- return BLOCKED
- identify missing or invalid evidence
- identify the responsible upstream stage

## SMALL gates

Developer entry:
- clear requirement

Reviewer entry:
- implementation evidence with PR URL and head SHA
- developer validation/test evidence

QA entry:
- REVIEW_PASSED or REVIEW_SKIPPED
- implementation evidence available

Completion gate:
- implementation complete
- relevant tests/validation pass
- REVIEW_PASSED or REVIEW_SKIPPED
- QA_PASSED or QA_SKIPPED

## AUDIT-FIX gates

Developer entry:
- audit/review report with finding IDs, and the assigned finding IDs and write
  scope (the report is the requirement; no SPEC_PASSED needed)

Reviewer entry:
- IMPLEMENTATION_COMPLETE with PR URL and head SHA
- developer validation evidence for that head

QA entry:
- REVIEW_PASSED or REVIEW_SKIPPED for every PR in scope for that repository

Completion gate:
- every in-scope finding FIXED or explicitly dropped/moved by the requester
- REVIEW_PASSED or REVIEW_SKIPPED for every PR
- QA_PASSED or QA_SKIPPED

## MEDIUM gates

Developer entry:
- SPEC_PASSED
- acceptance criteria exist

Reviewer entry:
- IMPLEMENTATION_COMPLETE with PR URL and head SHA
- implementation/test evidence exists

QA entry:
- REVIEW_PASSED or REVIEW_SKIPPED
- Feature Spec and acceptance criteria available
- implementation evidence available

Completion gate:
- SPEC_PASSED
- IMPLEMENTATION_COMPLETE
- REVIEW_PASSED or REVIEW_SKIPPED
- QA_PASSED or QA_SKIPPED

## LARGE gates

Architect entry:
- SPEC_PASSED

Planner entry:
- SPEC_PASSED
- DESIGN_PASSED

Developer entry:
- SPEC_PASSED
- DESIGN_PASSED
- PLAN_PASSED

Reviewer entry:
- IMPLEMENTATION_COMPLETE with PR URL and head SHA
- implementation/test evidence

QA entry:
- REVIEW_PASSED or REVIEW_SKIPPED
- approved requirements
- implementation evidence

Automated completion gate:
- SPEC_PASSED
- DESIGN_PASSED
- PLAN_PASSED
- IMPLEMENTATION_COMPLETE
- REVIEW_PASSED or REVIEW_SKIPPED
- QA_PASSED or QA_SKIPPED

After the automated gate passes, set AWAITING_HUMAN_APPROVAL.

Only explicit human approval permits COMPLETED. When review or QA was skipped,
the approval request must list each skipped gate and the unverified risk it
leaves, so the approval covers that risk explicitly.

## Invariant-critical gates (flag `Invariants: REQUIRED`)

These add to the route's gates; they do not replace them.

Spec / design gates:
- SPEC_PASSED requires an `Invariants` section with at least one INV (or a
  justified N/A that the leader accepts).
- DESIGN_PASSED (LARGE) requires every INV to have a mechanism, known break
  modes, and a required test.
- PLAN_PASSED (LARGE) requires every INV owned by a task.

Developer exit (IMPLEMENTATION_COMPLETE):
- implementation evidence lists each INV with the test that asserts it, the
  command, and its result on the head SHA. A concurrency or transaction INV is
  tested against real infrastructure, not mocks.

Adversarial Reviewer entry:
- IMPLEMENTATION_COMPLETE with PR URL and head SHA
- invariant list available (spec/design, or INV lines in the packet)

QA entry, in addition to the route's QA entry:
- ADVERSARIAL_REVIEW_PASSED or ADVERSARIAL_REVIEW_SKIPPED for the same head SHA
  as the review gate

Completion gate, in addition to the route's completion gate:
- ADVERSARIAL_REVIEW_PASSED or ADVERSARIAL_REVIEW_SKIPPED

Locked regression tests:
- Tests delivered by the Adversarial Reviewer for CONFIRMED findings are
  locked. The developer merges the adversarial branch unchanged into the PR
  branch before fixing, and must not edit, skip, weaken, or delete a locked
  test. A change to a locked path is valid only with the Adversarial Reviewer's
  written agreement on the issue.
- A fix is proven only by the unchanged locked test passing on the new head.
  A modified locked test without agreement fails the adversarial gate.

Finding statuses: CONFIRMED blocks per severity; PLAUSIBLE, INV-GAP, and
TEST-INFRA never block alone but must appear as unverified risks in the gate
summary and, on LARGE, in the human approval request.

## Skipped review and QA

Review and QA are required by default on every route. REVIEW_SKIPPED and
QA_SKIPPED satisfy a gate only when the Feature Orchestrator
recorded an explicit reply from the requesting user, or a `Review: skip` /
`QA: skip` line the requesting user wrote in the issue description (comment ID
or description line, reason, and covered revisions). An agent may not skip a gate on its own judgment. A skip
covers only the recorded revisions; a later code change needs a new decision.
Report skipped gates as SKIPPED in every summary, never as PASSED.
The same rule applies to ADVERSARIAL_REVIEW_SKIPPED, from an `Adversarial: skip`
line or explicit reply by the requesting user.
The requester has also set a standing rule: a work package that changes no
production code (tests, fixtures, tooling, CI, docs, validation only) gets
ADVERSARIAL_REVIEW_SKIPPED with reason "no production change", recorded by the
Feature Orchestrator.

## Developer stage

"Developer" in this policy names the implementation stage, not an agent. It is
performed by Node Js Developer (LingoBites-Server, including web admin) or React Native Developer
(LingoBites-App).

## Failure routing

REVIEW_FAILED → Developer unless the finding exposes an upstream requirement/design problem.

ADVERSARIAL_REVIEW_FAILED → Developer, with the adversarial branch and locked
paths; a finding showing the declared mechanism cannot hold the invariant →
Software Architect (LARGE) or Feature Analyst (MEDIUM, when the invariant
itself is wrong).

QA_FAILED due to implementation → the Developer-stage agent that owns the defect.

QA failure due to ambiguous requirement → Feature Analyst.

Architecture contradiction → Software Architect.

Plan insufficiency on LARGE work → Implementation Planner.

Scope/risk expansion → Feature Orchestrator for reclassification.


## Specification evidence versus execution evidence

SPEC_PASSED requires a readable specification, explicit scope and business rules,
observable acceptance criteria, recorded assumptions, and no blocking product
questions. Validate statements about existing behavior against available project
evidence. A canonical Feature Specification with status READY may satisfy this
gate after the leader checks it; the Analyst need not change its output template
to emit the workflow token. Apply the same evidence-based normalization to READY
Technical Designs and Implementation Plans for DESIGN_PASSED and PLAN_PASSED.

Do not require tests of an implementation that does not yet exist to pass the
specification gate. Executed implementation tests and acceptance verification
belong to the implementation, review, and QA gates. Existing explicit human
approval requirements still apply; a workflow token cannot manufacture approval.

Review and QA evidence must identify the implementation revision(s) examined.
After a fix, recheck affected findings and validation on the new revision before
restoring a passed gate. A scope or contract change invalidates affected upstream
approvals; route it back to the responsible stage before proceeding.
