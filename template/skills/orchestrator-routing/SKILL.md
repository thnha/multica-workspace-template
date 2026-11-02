# orchestrator-routing

## Purpose

Guide the Engineering Squad leader in routing only the agents required for the selected complexity level.

## SMALL route

1. Developer (opens the PR)
2. Code Reviewer
3. QA / Test Engineer
4. Gate check
5. Complete if all required evidence passes

Do not invoke Feature Analyst, Software Architect, or Implementation Planner by default.
Review and QA run on every route unless the requester wrote `Review: skip` or
`QA: skip`, or the package is docs-only (`QA_SKIPPED (docs-only)`, see
workflow-gate-policy).

Several packages in one repository → package PRs target
`integration/<PARENT-KEY>`, the leader merges each after its gates, and one
final PR goes to the default branch (Feature Orchestrator instructions, PULL
REQUEST AND BRANCHES). This holds on every route.

## AUDIT-FIX route

For fixing findings from an existing review/audit report (see
workflow-classification). Optimize for few PRs and few handoffs.

1. Plan in your first turn, without an Analyst: read the audit report, drop
   findings already fixed on the current base, and group the rest into work
   packages. Default: one PR per repository; split only when a group is large
   (roughly >25 files or several unrelated areas). Put dependent findings in
   the same package instead of sequencing packages.
2. Dispatch packages with disjoint write scopes in parallel (different
   repositories, or non-overlapping files); sequence only overlapping ones.
   One child per package, or run on the parent itself when there is a single
   package. Never one child per finding, and no separate review/QA children.
3. Developer: packet = audit report link + finding IDs + write scope + base
   branch; opens a draft PR and runs the pre-handoff checks.
4. Code Reviewer per PR, scoped to the listed findings and regressions they
   could cause.
5. QA / Test Engineer once per repository, after every PR in that repository
   passes review (and, with several PRs, is merged into
   `integration/<PARENT-KEY>`): one dispatch listing every PR URL and head SHA,
   plus the integration head SHA when there is one. QA checks behavior
   preservation and the finding IDs, not a fresh full exploration.
6. Gate check, open the final PR per repository (or mark the single PR
   ready), post one summary card. No human approval stage.

A repair goes to the package that owns the finding; re-review only the
changed findings. Do not re-run QA on packages QA already passed unless their
code changed.

## MEDIUM route

1. Feature Analyst
2. Developer
3. Code Reviewer
4. QA / Test Engineer
5. Gate check
6. Complete if all required evidence passes

Do not invoke Software Architect or Implementation Planner unless the issue escalates to LARGE.

## LARGE route

1. Feature Analyst
2. Software Architect (Workflow v2: the packet says `Planner: folded`)
3. Implementation Planner (Workflow v2: only when the design says
   `Planner needed: YES`, or its Work packages table fails the PLAN sizing
   check once; otherwise record `PLAN_PASSED (folded)` from the design)
4. Developer or Developers
5. Code Reviewer
6. QA / Test Engineer
7. Gate check
8. AWAITING_HUMAN_APPROVAL
9. Complete only after explicit human approval

## Adversarial review

When it is required (R1, requester standing rule; this is the single source).
Decide per work package on every route, whether or not the parent is flagged
`Invariants: REQUIRED`. A package needs Adversarial Reviewer when its diff
changes production code that touches:
- how persisted or shared state is read, written, migrated, synced, retried,
  or de-duplicated (SQLite/storage access, schema/keys, transactions,
  outbox/sync/queue, server persistence);
- auth or account (authentication, authorization, sessions, identity linking);
- data migrations;
- an invariant declared in the spec/design or in the packet's INV lines.
Every other package (tests, fixtures, tooling, CI, docs; moves, renames,
re-exports, or import/module-ownership changes with unchanged runtime behavior
proven by characterization tests and the boundary checker; production code
outside the list) gets Code Review only: record ADVERSARIAL_REVIEW_SKIPPED
("R1: no invariant-affecting production change"). When unsure, dispatch it.
On an unflagged issue, write 1–3 INV lines into the adversarial packet.

Workflow v2 floor and requests: the gate snapshot's `R1_FLOOR=REQUIRED`
(a production path under persistence, migration, repository, jobs, auth,
security, identity, sync, local data or storage) always means dispatch; a
path miss does not mean skip, apply the rule above. A Code Review card line
`ADV-REQUEST: <hypothesis>` adds an adversarial stage on the same head with
that hypothesis first. No one may remove a required adversarial stage.

Workflow v2 packet (bounded): besides the items in step 2, every
adversarial packet carries
- `Hypotheses`: up to 5 prioritized failure hypotheses (H1 = highest
  consequence: learner-data loss, money, auth, then duplicates and races),
  each with the evidence that would confirm or clear it;
- `Budget`: 1 run; 2 runs when an INV covers money, learner-data loss or
  auth; a delta re-review gets 1 run on the delta only.
The reviewer may add hypotheses it finds in the diff (H-extra) within the
same budget. A card `INCOMPLETE COVERAGE` (budget spent, items unsettled) is
neither PASS nor FAIL: post a gate card with `Decision needed: YES` asking
the requester to ★ approve one more bounded run for the listed items, or
accept the listed risk, or stop. Never extend the budget yourself.

The `Invariants: REQUIRED` flag (workflow-classification) adds invariants
before code for the whole issue (step 1). Record the flag in the parent's
Current status.

1. Invariants before code (flagged issues):
   - MEDIUM / LARGE: the Feature Analyst packet requires the spec's
     `Invariants` section; on LARGE the Architect packet requires the design's
     Invariants table (mechanism, how it breaks, required test).
   - SMALL / AUDIT-FIX: write the INV lines (1–3, business terms) into the
     developer and adversarial packets from the issue or finding. If you cannot
     state them from available evidence, escalate to MEDIUM.
   - The developer packet requires one test per INV in the implementation
     evidence.
2. When required, dispatch Adversarial Reviewer in parallel with Code Reviewer, on the same PR
   and head SHA, as soon as IMPLEMENTATION_COMPLETE is accepted. The packet
   contains: invariant sources (spec/design links or the INV lines), PR URL,
   base branch, and head SHA. Do not put the developer's
   narrative in the packet; the Implementation Report stays reachable through
   the PR.
3. QA starts in parallel with both reviews on the same head SHA
   (workflow-gate-policy "Parallel gates"), or is skipped by the small-package
   fast path; the package passes only when every required gate passed on
   that head.
4. Repair: when either review fails, send the developer one combined repair
   packet: CR- findings, ADV- findings, the adversarial branch and tip SHA,
   and the locked paths. The developer merges the adversarial branch unchanged
   first, then fixes. Re-review goes to each reviewer only for its own changed
   findings. Review and adversarial failures share the same repair-cycle count.
5. PLAUSIBLE, INV-GAP, and TEST-INFRA items do not block. On Workflow v2
   parents a CONFIRMED finding with `Blocking: NO` does not block either; it
   goes to the non-blocking findings list with its locked test. List them in the
   gate summary card; on LARGE, list them in the human approval request as
   unverified risks. Route INV-GAP to the invariant owner only when it affects
   an acceptance criterion; otherwise record it as a follow-up.

## Gate snapshot

`scripts/gate-snapshot.ps1` in this skill's base directory (printed when the
skill loads) reads a PR's facts with `gh` and never writes:

`pwsh -NoProfile -ExecutionPolicy Bypass -File "<base dir>/scripts/gate-snapshot.ps1" -Repo thnha/<repo> -Pr <n> -ReportedSha <card sha> [-SinceSha <last reviewed or tested sha>]`

Output lines: PR_STATE, IS_DRAFT, BASE, HEAD_SHA, MERGED, MERGE_SHA,
SHA_MATCH, CHECKS (total/pass/fail/pending, or `none`), CHECKS_FAILED,
FILES, PROD_LINES (non-test, non-docs additions + deletions), TEST_LINES,
DOCS_ONLY, TEST_ONLY, SMALL_PACKAGE (PROD_LINES <= 50), R1_FLOOR,
R1_PATH_HITS, DELTA_STATUS, DELTA_FILES, DELTA_PROD_FILES, DELTA_R1,
SNAPSHOT, GITHUB_GATE.
- `GITHUB_GATE=HANDOFF_CORRECTION: <reason>` -> return the card to the
  developer as a handoff correction. `GITHUB_GATE=OK` covers only the GitHub
  facts; still read the card's local check evidence.
- `CHECKS=none` means the PR has no checks: never write "CI running" (R4).
- Exit code 2 / `SNAPSHOT=INCOMPLETE` -> fall back to the manual `gh`
  commands; do not guess the missing facts.
- Use its numbers as facts. Do not recount lines, compare SHAs, or classify
  paths by hand.

## Speed rules (all routes)

- Record a gate decision and dispatch the next stage in the same run.
- Per-package steps run on the child issue; the parent hears only milestones
  (package merged, blocked, decision needed, all done). A parent run costs far
  more context than a child run.
- A clean PASS needs no gate comment beyond the summary card; do not repeat
  the member's evidence.
- Run independent work packages in parallel when write scopes do not overlap.
- Do not re-run a member's validation yourself; check the reported commands,
  results, and SHA, and download the artifact only when the card is not enough
  to decide.

## Routing principles

- Never invoke agents merely because they are available.
- Do not skip required stages.
- Do not advance on missing evidence.
- Re-route failures to the stage that owns the defect.
- Escalate classification when new evidence expands risk/scope.
- Preserve issue history and evidence during rework.
- Avoid having the same implementation agent act as the only independent reviewer.
- Adversarial Reviewer is independent of both the developer and Code Reviewer;
  never ask a developer or Code Reviewer to perform the adversarial stage.


## Specialist selection inside the Developer stage

Resolve agents from the live Engineering Squad roster; use real UUIDs returned
by Multica. Route LingoBites-Server work (backend and web admin) to Node Js Developer and
LingoBites-App work to React Native Developer. "Developer" in the routes above
names a stage, not an agent; no general Developer agent exists. Work outside
both repositories is BLOCKED until the requesting user names an owner.
Do not dispatch every developer just because they are available.
Before posting a dispatch mention, check that the UUID in the link belongs to
the agent named in its label in `multica agent list --output json`
(LING-259: label "React Native Developer", UUID of Node Js Developer
`2fb6044c`, so App work ran on the backend developer).

For work spanning app and server, establish the API/data/error contract and
compatibility requirements before splitting implementation. MEDIUM can use an
adequate spec; architecture/security or unresolved material contract risk
requires escalation to LARGE. Parallel work requires independent write scopes,
explicit owners, separate branches as needed, and an integration owner. Do not
assign overlapping files/branches concurrently without a coordination plan.
Give every specialist the same acceptance, handoff, and validation
requirements. Code Reviewer remains independent from implementation.

App + Server (Workflow v2): before either package starts, the API/data/error
contract is fixed in the spec (MEDIUM) or the design (LARGE) with a revision.
The Server package owns the contract and its contract tests; the App package
builds against that frozen contract revision, named in its packet. You are
the integration owner: record the contract revision both packages cite, run
them in parallel only against the same frozen revision, and before the final
PRs require one cross-repo check (a QA case or contract test) proving the App
consumes the merged Server behavior. Both final PR cards state the merge and
deploy order (Server first unless the design says otherwise). A contract
change after dispatch goes back to the contract owner stage
(Analyst/Architect), never patched in one repository only.

## Resume safely and prevent duplicate dispatch

At every leader trigger, read the current issue, children, relevant bounded
comment threads, and `multica issue runs <issue-id> --active --output json`.
On a child issue, read that child, its threads, and `runs --siblings`; from
the parent read only the description and properties. These reads are
advisory, not a lock; respect truncation warnings and re-read before
uncertain dispatch.

Identify work by parent issue + task key + stage + input revision(s) + attempt.
Look for the existing delegation comment/child and queued or running task before
creating another. Reuse the existing task/thread for progress and rework. Do not
re-dispatch unchanged completed inputs, stale callbacks, or acknowledged work.
If a previous write had an ambiguous result, read back the issue/comments/runs
before retrying. Persist dispatch IDs and evidence references on the issue.
Members never post on the parent; how their results wake you is in the
Feature Orchestrator DISPATCH CHECKLIST.

Choose one start mechanism per work item: assignment/promotion OR an explicit
agent mention. Do not combine both for the same start. Keep serial downstream
children in backlog; todo starts work immediately. A roster entry alone does not
start a member. Read comment trigger outcomes: queued/coalesced/deferred input
must not be reposted; blocked input requires checking target identity and access.

Members return evidence; only the leader schedules the next gated stage. Do not
mention agents for acknowledgements. No-action triggers: Feature Orchestrator
NO-ACTION TRIGGERS.

## Bounded review and QA repair

Each work package has at most `Max rounds` correction rounds (issue property;
empty → 3) in total after the initial handoff: handoff corrections, review repairs, and QA repairs combined, across
all finding groups. One cycle is a targeted fix followed by independent
revalidation. Persist a combined count across review and QA on the issue; changing
the agent, thread, or run must not reset it. If the same failure repeats without
new evidence or a changed approach, escalate earlier.

After the limit, stop automatic re-dispatch of the affected work, record BLOCKED
with the findings, attempted fixes, evidence, and decision needed from the human
requester. Continue only independent work whose gates remain satisfied. An
explicit human decision may authorize additional attempts with a new limit;
never reset the count silently or mark failing work passed.

R2 defect-only exception: when the limit is reached and every remaining
blocker is a CONFIRMED correctness defect (an Adversarial Review CONFIRMED
finding, or a Code Review MAJOR/BLOCKER finding backed by a failing red test),
open exactly one extra repair round for that package, limited to those
findings and their red tests; no other change is allowed in it. Label it
`extra round (R2 exception)` in the dispatch and the persisted count, and
re-run every gate that failed on the new head. At most one such round per
package. If it does not clear the findings, or any other blocker remains
(scope, NIT/MINOR, environment, disputed finding), stop and ask the requester
as above. (LING-171 on 2026-10-01: a requester override plus follow-up
LING-175 cost 13 runs, where one repair round costs about 15 minutes.)

## Between runs

Do not keep a leader process waiting for workers or external CI. Persist progress
and dispatch evidence, then finish the turn; use Multica's event-driven follow-up
and the next trigger to re-read state. If an explicit task acceptance criterion
requires a CI result, follow the runtime's foreground collection rule.

## Workflow hygiene (lessons from LING-209/LING-210)

Load-bearing rules added after LING-209 (64 runs, 10h17m wall clock for about
2h49m of agent work). Apply them on every route.

Merge watch and merge safety while gates are pending live in
orchestrator-merge-flow.

### No duplicate wake-backs on the parent

Wake-backs (`task.completed` with `--filter-agent-id` or `--task-id`) are for
CHILD issues only. On the squad-assigned parent (Analyst, Architect and Planner
stages), the member's card comment already wakes you; a wake-back there
starts a second run that can only say "No action" (LING-209: 5 such runs).
Never register a `task.completed` wakeup on the parent. A member run on the
parent that fails without a card is covered by the Watchdog's task.failed
guard and the stall check.

### QA environment and preflight

- Every QA dispatch packet carries an `Environment` block: platform and
  device/simulator, which Orca/computer-use access the cases need, backend
  URL, and every fixture the planned cases need (lesson id or link, account,
  seed data) with the case ids that depend on it. QA runs its mandatory
  preflight against that block before building anything.
- A QA BLOCKED result from the preflight goes to the requester as a parent
  milestone card (Decision needed: YES) naming the exact action
  (for example "bật Accessibility cho Orca").
  When the requester replies that it is done, re-dispatch QA on the child in
  that same run (mention QA, register its wake-back); do not wait for the
  requester to mention an agent. Do not re-dispatch QA while the blocker is
  unanswered.
- QA keeps a `**[QA progress]` comment on the child during long passes. It is
  not a result card: never gate on it. After a QA run that failed (quota,
  crash), the resumed QA continues from that progress comment.
- QA runs a long pass in batches, one run per batch, and continues itself
  through its own `QA continuation` wakeup. Each batch run ends without a
  card, so QA's wake-back is continuous and the leader handles intermediate
  wakes with QA BATCH WAKE in its instructions. Never re-dispatch QA while its
  progress comment says `batch <k>/<N> — ... in progress`.

### Quota resume wakeups belong to the Watchdog

Never disable a Workflow Watchdog `at` wakeup (instruction starting "Quota
has reset" or "Quota fallback") unless that wakeup's own `agent_id` already
delivered its result card after the failure. Check the wakeup's `agent_id`
against the agent you are reasoning about before disabling it. (LING-210: a
leader run disabled the Code Reviewer's resume, and the package idled for
5h44m.)

Changed 2026-10-04 (LING-232 retro, requester decision): CONFIRMED Blocking: NO does not block on Workflow v2 parents (Adversarial review, item 5).
