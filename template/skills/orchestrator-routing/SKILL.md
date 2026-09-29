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
`QA: skip`.

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
   passes review: one dispatch listing every PR URL and head SHA. QA checks
   behavior preservation and the finding IDs, not a fresh full exploration.
6. Gate check, mark the PRs ready, post one summary card. No human approval
   stage.

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
2. Software Architect
3. Implementation Planner
4. Developer or Developers
5. Code Reviewer
6. QA / Test Engineer
7. Gate check
8. AWAITING_HUMAN_APPROVAL
9. Complete only after explicit human approval

## Adversarial review (items flagged `Invariants: REQUIRED`)

Applies on any route when workflow-classification sets the flag. Record the
flag in the parent's Current status.

1. Invariants before code:
   - MEDIUM / LARGE: the Feature Analyst packet requires the spec's
     `Invariants` section; on LARGE the Architect packet requires the design's
     Invariants table (mechanism, how it breaks, required test).
   - SMALL / AUDIT-FIX: write the INV lines (1–3, business terms) into the
     developer and adversarial packets from the issue or finding. If you cannot
     state them from available evidence, escalate to MEDIUM.
   - The developer packet requires one test per INV in the implementation
     evidence.
2. Dispatch Adversarial Reviewer in parallel with Code Reviewer, on the same PR
   and head SHA, as soon as IMPLEMENTATION_COMPLETE is accepted. The packet
   contains: invariant sources (spec/design links or the INV lines), PR URL,
   base branch, head SHA, and the parent notice. Do not put the developer's
   narrative in the packet; the Implementation Report stays reachable through
   the PR.
3. QA starts only when both REVIEW_PASSED (or SKIPPED) and
   ADVERSARIAL_REVIEW_PASSED (or SKIPPED) hold for the same head SHA.
4. Repair: when either review fails, send the developer one combined repair
   packet: CR- findings, ADV- findings, the adversarial branch and tip SHA,
   and the locked paths. The developer merges the adversarial branch unchanged
   first, then fixes. Re-review goes to each reviewer only for its own changed
   findings. Review and adversarial failures share the same repair-cycle count.
5. PLAUSIBLE, INV-GAP, and TEST-INFRA items do not block. List them in the
   gate summary card; on LARGE, list them in the human approval request as
   unverified risks. Route INV-GAP to the invariant owner only when it affects
   an acceptance criterion; otherwise record it as a follow-up.

Not flagged → no Adversarial Reviewer dispatch and no ADVERSARIAL_* gate.

## Speed rules (all routes)

- Record a gate decision and dispatch the next stage in the same run.
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

For work spanning app and server, establish the API/data/error contract and
compatibility requirements before splitting implementation. MEDIUM can use an
adequate spec; architecture/security or unresolved material contract risk
requires escalation to LARGE. Parallel work requires independent write scopes,
explicit owners, separate branches as needed, and an integration owner. Do not
assign overlapping files/branches concurrently without a coordination plan.
Give every specialist the same acceptance, handoff, and validation
requirements. Code Reviewer remains independent from implementation.

## Resume safely and prevent duplicate dispatch

At every leader trigger, read the current issue, children, relevant bounded
comment threads, and `multica issue runs <issue-id> --active --output json`.
Use `--siblings` when work spans the issue family. These reads are advisory,
not a lock; respect truncation warnings and re-read before uncertain dispatch.

Identify work by parent issue + task key + stage + input revision(s) + attempt.
Look for the existing delegation comment/child and queued or running task before
creating another. Reuse the existing task/thread for progress and rework. Do not
re-dispatch unchanged completed inputs, stale callbacks, or acknowledged work.
If a previous write had an ambiguous result, read back the issue/comments/runs
before retrying. Persist dispatch IDs and evidence references on the issue.
Put the ID of the parent dispatch comment in every child's task packet, so the
member can post its handoff notice under that thread and wake you.

Choose one start mechanism per work item: assignment/promotion OR an explicit
agent mention. Do not combine both for the same start. Keep serial downstream
children in backlog; todo starts work immediately. A roster entry alone does not
start a member. Read comment trigger outcomes: queued/coalesced/deferred input
must not be reposted; blocked input requires checking target identity and access.

Members return evidence; only the leader schedules the next gated stage. Do not
mention agents for acknowledgements. On a no-action trigger, follow the injected
squad activity protocol instead of posting a comment that creates another loop.

## Bounded review and QA repair

Each work package has at most 3 correction rounds in total after the initial
handoff: handoff corrections, review repairs, and QA repairs combined, across
all finding groups. One cycle is a targeted fix followed by independent
revalidation. Persist a combined count across review and QA on the issue; changing
the agent, thread, or run must not reset it. If the same failure repeats without
new evidence or a changed approach, escalate earlier.

After the limit, stop automatic re-dispatch of the affected work, record BLOCKED
with the findings, attempted fixes, evidence, and decision needed from the human
requester. Continue only independent work whose gates remain satisfied. An
explicit human decision may authorize additional attempts with a new limit;
never reset the count silently or mark failing work passed.

## Between runs

Do not keep a leader process waiting for workers or external CI. Persist progress
and dispatch evidence, then finish the turn; use Multica's event-driven follow-up
and the next trigger to re-read state. If an explicit task acceptance criterion
requires a CI result, follow the runtime's foreground collection rule.
