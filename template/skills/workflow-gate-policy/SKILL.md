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
- with several PRs in that repository: every one merged into
  `integration/<PARENT-KEY>`; QA runs on that integration head SHA

Completion gate:
- every in-scope finding FIXED or explicitly dropped/moved by the requester
- REVIEW_PASSED or REVIEW_SKIPPED for every PR
- QA_PASSED or QA_SKIPPED

## MEDIUM gates

Developer entry:
- SPEC_PASSED
- acceptance criteria exist

MEDIUM has no Planner: before the first developer dispatch the leader splits a
package whose behavior write scope exceeds about 15 production files into
packages that each pass the LARGE PLAN sizing check (same exemptions).

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
- PLAN_PASSED, or on Workflow v2 parents `PLAN_PASSED (folded)`: the
  design's Work packages table passes the sizing check below and every INV
  is owned by a package

PLAN_PASSED also requires every behavior task to pass the Implementation
Planner sizing check: about 15 production files or fewer and size S/M, or size L
with a written reason why it cannot be split (pure moves, renames, import
rewrites and formatting are exempt). Otherwise return the plan to the Planner
before any developer dispatch (LING-183: one 36-file package, many runs).

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

QA entry: see "Parallel gates" below; QA runs on the same head SHA as the
adversarial review, not after it.

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

Finding statuses: CONFIRMED blocks when the Adversarial Reviewer marks it
`Blocking: YES` (Workflow v2 parents; on older parents every CONFIRMED
finding blocks); PLAUSIBLE, INV-GAP, and
TEST-INFRA never block alone but must appear as unverified risks in the gate
summary and, on LARGE, in the human approval request.

## Parallel gates (requester standing rule, 2026-10-03)

This overrides the "QA entry: REVIEW_PASSED or REVIEW_SKIPPED" lines of every
route above for work packages. Once the leader accepts IMPLEMENTATION_COMPLETE
with a PR URL and head SHA, Code Review, Adversarial Review (when R1 requires
it) and QA all start on that head SHA at the same time. QA entry is that
accepted IMPLEMENTATION_COMPLETE plus the route's requirement/implementation
evidence. The completion gate still needs every required gate PASSED or
SKIPPED on the same head SHA. AUDIT-FIX QA with several PRs keeps its
integration-head rule.

Gate members read GitHub checks on the head SHA as the evidence for format,
lint, typecheck and the full suite (R4); they run only targeted tests.

## Skipped review and QA

Review and QA are required by default on every route. REVIEW_SKIPPED,
QA_SKIPPED, and ADVERSARIAL_REVIEW_SKIPPED satisfy a gate only when the Feature
Orchestrator recorded one of these requester decisions (with its source,
reason, and covered revisions):
- a `Review: skip` / `QA: skip` / `Adversarial: skip` line the requesting user
  wrote in the issue description or in a comment on the issue, or an explicit
  reply from them;
- the issue's `QA` property set to "Skip" by the requester (QA only);
- a standing rule below.
An agent may not skip a gate on its own judgment. A skip covers only the
recorded revisions; a later code change needs a new decision. Report skipped
gates as SKIPPED in every summary, never as PASSED.
The requester has also set standing rules, recorded by the Feature
Orchestrator:
- R1 adversarial scoping (orchestrator-routing, "Adversarial review"): a work
  package whose production changes touch none of persisted/shared state,
  auth/account, sync, data migrations, or declared invariants gets
  ADVERSARIAL_REVIEW_SKIPPED with reason "R1: no invariant-affecting
  production change".
- A docs-only work package (every changed file is documentation: Markdown/MDX,
  `docs/**`, README, AGENTS.md, CLAUDE.md) gets `QA_SKIPPED (docs-only)` and
  Code Review only (LING-147). One non-docs file in the diff means normal QA.
- Small-package fast path (2026-10-03): a work package that needs Adversarial
  Reviewer and whose production diff is at most 50 changed lines (non-test
  files) gets `QA_SKIPPED (small-package: acceptance covered by adversarial)`.
  The adversarial packet lists the package's AC IDs under `Acceptance check`,
  and ADVERSARIAL_REVIEW_PASSED then also requires every listed AC proven by
  a passing test on the head SHA.

## Developer stage

"Developer" in this policy names the implementation stage, not an agent;
orchestrator-routing selects the developer per repository.

MEDIUM and LARGE packages are delivered block by block (incremental-block-delivery).
IMPLEMENTATION_COMPLETE on them also needs that skill's Blocks table and its
completion gate; a miss is a handoff correction. Packages whose first developer
dispatch was before 2026-10-02T03:30Z, including their repair rounds, keep
their dispatch-time evidence (acceptance freeze).

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


## Workflow v2 (parents whose Current status says `Workflow: v2`)

### Evidence by risk

Risk is the worst consequence of failure in the affected behavior and the
uncertainty left, never the number of changed lines or files. Completion
needs every row up to the package's level, with no unresolved blocking
finding:

| Level | Consequence of failure | Required evidence on the head SHA |
|---|---|---|
| LOW | wrong text, layout or tooling; easy to revert; no stored data | CI checks pass; REVIEW_PASSED |
| MODERATE | user-visible behavior wrong, no data harm | + one test per touched AC; QA per the current rules (phase 1) |
| HIGH | persisted or shared state, sync, migration, auth, learner progress, money (R1) | + one test per INV on real infrastructure; ADVERSARIAL_REVIEW_PASSED, or INCOMPLETE COVERAGE accepted by the requester |
| CRITICAL | irreversible data loss, security boundary, released-app compatibility (LARGE triggers) | + DESIGN_PASSED with an Invariants table; human approval |

### Evidence reuse

- Evidence is valid only for the exact head SHA and environment it ran on.
- A newer head may reuse a gate result only when the gate snapshot run with
  `-SinceSha <evidence sha>` shows no production file in the delta
  (`DELTA_PROD_FILES` empty) and no test that evidence relied on changed.
  Otherwise re-run the affected gate as a delta.
- Exception for Code Review (parents classified after 2026-10-04T08:34Z, LING-224
  retro): after a repair, the leader may carry the last Code Review verdict to
  the new head under the Feature Orchestrator rule CODE REVIEW DELTA ONLY WHEN
  NEEDED, but only when the Adversarial delta passed on that new head. The
  gate card names the carried SHA as `CODE_REVIEW_DELTA_SKIPPED (<reason>)`.
- A rebase, merge or squash that changes production files invalidates
  carried evidence. Package evidence stays valid for its package; checks on
  an integration head run on that head.

### Investigation budget

Each gate packet names a budget (adversarial: orchestrator-routing; reviewer:
one run; QA: its planned batches). A member that reaches its budget with
items unsettled reports `INCOMPLETE COVERAGE`: what was covered with
evidence, what was not, why, and the evidence still needed. INCOMPLETE
COVERAGE never satisfies a gate and is never reported as PASSED; the leader
asks the requester (Decision needed: YES) to approve one more bounded run,
accept the listed risk, or stop.

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

Changed 2026-10-04 (LING-232 retro, requester decision): CONFIRMED blocking follows the finding's Blocking field on Workflow v2 parents (Finding statuses).

Changed 2026-10-04 (LING-224 retro conflict review, requester decision): Code Review exception in Evidence reuse.
