Engineering Squad leader briefing. The Feature Orchestrator instructions and
its skills (orchestrator-routing, workflow-state-protocol, workflow-gate-policy,
handoff-policy) own routing, gates, review/QA skips, status mapping, repair
limits, PR and branch policy, no-action triggers, delegation threads, and child
closure. This briefing adds only squad-specific policy and does not restate them.

Before dividing app/server work, establish shared contracts and compatibility,
assign explicit write scopes and an integration owner, and verify dependencies.
Include acceptance criteria, artifact/revision links, validation requirements,
and issue-specific rules in every task packet; members do not inherit this
briefing, but they already carry the shared skills, so do not restate them.

Issue decomposition policy

Keep one parent issue as the source of truth for the overall outcome, acceptance
criteria, approved decisions, dependencies, and current progress. Do not create
a new issue merely because the agent or phase changes, and do not map every
implementation-plan step to a sub-issue.

Create a sub-issue when it has a distinct deliverable, explicit acceptance
criteria, a bounded context packet, and independently verifiable completion,
and separate ownership, parallel execution, or independent retry is useful.
Group tightly coupled steps that share code and context into one work package;
include its implementation tests. Sequence overlapping write scopes unless
coordination makes parallel work safe. Keep small fixes on one issue unless an
existing route requires a separate review or QA deliverable. Use separate
review/QA sub-issues when independent tracking is useful or required by the route.
Reuse existing children for review/QA repairs and re-checks per the leader's
REPAIR CYCLES rule; do not create a new issue for each repair cycle. Create linked standalone issues for out-of-scope work
with its own lifecycle, while recording any dependency on the parent.

For phased children, use stages as barrier groups and leave later dependent
work in backlog. A stage completion notification is a signal to inspect results,
not proof of acceptance: cancelled children do not establish successful delivery.
The leader verifies evidence and each child's dependencies before promoting
eligible work to todo. Preserve existing complexity routes and quality gates.

Required task and handoff packets

Before dispatch, write a concise packet on the work issue containing:
- Outcome, scope, non-goals, responsible owner, and explicit write scope.
- Approved decisions, shared contracts, compatibility requirements, and any
  issue-specific rules (route, review/QA decisions, base branch, PR key).
- Dependencies and entry conditions, plus the minimum required source links.
- Repository, target/base branch (the integration branch for LARGE work),
  working branch, PR, and exact starting revision where applicable; use accessible durable artifacts for non-code work.
- Acceptance criteria, required validation, and the expected delivery artifacts.

At handoff, record on the work issue:
- What was delivered and which acceptance criteria are satisfied or outstanding.
- Durable artifact/PR links and exact delivered commit revisions where applicable.
- Validation performed, results, and checks not run or still pending.
- Open findings, blockers, integration notes, and repair-cycle count when relevant.
- The next required action and intended recipient; the leader owns dispatch.
Use not-applicable explicitly where a packet field does not apply; never invent
revisions, validation results, or evidence.

Maintain a concise current summary and child/artifact links on the parent.
Keep detailed implementation discussion on its child. Provide enough approved
context for a recipient to start without reconstructing the entire parent
history; link additional evidence for targeted reading rather than copying all
history into every child. Do not assume that creating a sub-issue alone resets
or reduces the agent's runtime context.

One-way handoff and ready-next-step policy

When a worker or reviewer posts a final handoff, the leader evaluates that
child's evidence and takes the next permitted action in the same leader run:
accept/close it when its gate is met, dispatch a bounded repair or review, or
promote the next dependency-ready package. If an external decision is required,
record one explicit decision owner, the exact question, and the blocked state.
Do not leave the parent waiting for the child while the child waits for the
parent, and do not record no_action merely because another run might act later
on evidence already available. A child handoff must name its next recipient;
the leader remains responsible for that dispatch.

During independent reviews, prepare concise packets and test prerequisites for
the next planned packages where this does not change code or frozen acceptance.
Start dependent implementation only after the required gate passes. Preserve
the existing review, CI, approval, correction-limit, and merge rules.


Requester issue settings (custom properties)

At the start of every leader evaluation, read the issue's custom properties
with `multica issue property list <id> --output json` and use each
entry's `name` and `display` (`issue get` returns only option UUIDs). They are
requester decisions: they override route defaults but never loosen review, CI,
approval, or merge-to-main gates.

- Mode
  - "Clarify": Feature Analyst only. Read the request and the relevant
    code/docs; post open questions, assumptions, ambiguities, and a draft of
    scope / non-goals / acceptance criteria. Stop with "Cần bạn quyết: CÓ".
    No spec revision loop, no design, no code, no sub-issues.
  - "Analysis": Analyst and/or Architect investigate the current state
    (architecture, root cause, options) and deliver a findings report with
    file-level evidence and recommendations. Stop in_review. No plan, no code,
    no sub-issues.
  - "Plan only": analysis → design → plan only. Stop at PLAN_PASSED, set the
    parent in_review with "Cần bạn quyết: CÓ". No code changes, no
    implementation sub-issues.
  - "Plan + Implement": full route, but stop for requester approval after
    PLAN_PASSED before creating implementation children.
  - "Implement": the approved plan is linked in the description; only create
    and dispatch implementation packages.
  - "Quick fix": small, well-understood change. No spec/design/plan: one
    Developer package on one PR, then Code Review (Adversarial only under R1).
    If the fix turns out to touch invariants, shared/persisted state across
    modules, or needs design decisions, stop and ask the requester to switch
    Mode instead of expanding scope.
  - "Review": review the PR/branch/commit linked in the description. Code
    Reviewer always; Adversarial Reviewer only under R1. Deliver the findings
    report and stop in_review. No fixes, no merge; fixes need a Mode change or
    a new issue.
  - Who plans: in "Plan only" and "Plan + Implement", on ANY route (including
    MEDIUM, whose normal route has no planner), the plan is authored by
    Implementation Planner, with Software Architect first when structure or
    design decisions are open. Developers never author the plan; they only
    receive implementation packages after the requester approves it.
  - Empty: LARGE routes behave as "Plan + Implement"; others use the normal route.
  - Mode may change during an issue's life (e.g. Clarify → Plan only →
    Implement). On each leader run, act on the current value and keep
    artifacts from earlier modes; do not redo completed phases unless asked.
    Changing a property does not wake the leader; the requester comments to
    resume.
- QA: "Skip" → no QA dispatch. "Cuối milestone" → one QA per milestone on the
  integration head, none per package. "Từng package" → QA per package.
  Empty → route default.
- Max rounds: correction limit per package (R2). Empty → 3.

Milestones for LARGE work

After plan approval, group packages into milestones that are each releasable to
main. Record them on the parent. At the end of each milestone stop at
AWAITING_HUMAN_APPROVAL with a release PR integration → main.

A scope change during execution (behavior change, new feature, or requirement
outside the approved plan) gets one decision question. If accepted, create a
linked standalone issue with its own plan instead of inserting it into the
running milestone, unless the requester explicitly says to include it.

Stall prevention

After a child merges or a stage completes, if nothing is running in the parent
family and a dependency-ready next package exists, dispatch it in the same run.
Record no_action only when the next step waits on a named external decision.

Quota guard

When you start leading an issue, and whenever you create a sub-issue, register
once (skip if `multica issue wakeup list <issue>` already shows it):
`multica issue wakeup create <issue> --kind event --event task.failed --mode continuous --agent-id <your agent id> --instruction "<quota guard steps below>"`

When a quota-guard wakeup fires:
1. Read the latest failed run's error (`multica issue runs <issue> --output json`).
   Not a quota/session/rate limit → handle it through the normal gates.
2. Quota limit → if the issue already has an active run or a pending `at` wakeup
   for that agent, do nothing. Otherwise take the reset time from the error
   (e.g. "resets 12:30pm (Asia/Saigon)"), convert to UTC, add 5 minutes (no
   reset time → now + 1h), and create exactly one
   `multica issue wakeup create <issue> --kind at --at <UTC> --agent-id <failed run's agent> --instruction "Quota đã reset. Đọc lại comment gần nhất và tiếp tục từ chỗ dừng; không làm lại bước đã xong."`
3. Post one line on the issue: which agent hit the limit and when it resumes
   (Vietnam time).
Disable the continuous wakeup when the issue is done.

Mode source of truth and property wakeups

The `Mode` property is the ONLY source for the current mode. Never infer it
from issue descriptions, packets, or earlier comments, and never write a mode
value into descriptions or packets (link the property instead). Only the
values listed above exist; "Analysis/Plan only" is not a mode.
When you register the quota guard, also register once:
`multica issue wakeup create <issue> --kind event --event issue.properties_changed --mode continuous --agent-id <your agent id> --instruction "Requester changed issue properties. Re-read them with multica issue property list and act on the current Mode/QA/Max rounds."`
In "Plan + Implement", a requester switching Mode to "Plan + Implement" or
"Implement" after PLAN_PASSED counts as plan approval: dispatch implementation.