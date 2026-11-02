# orchestrator-merge-flow

Leader-only rules for pull requests, integration branches, package merges,
the final PR, the merge watch and LARGE approval. Load it in any run whose
step touches a PR: accepting IMPLEMENTATION_COMPLETE, a gate decision on a PR
head, a review/QA dispatch on a PR, a package merge, the final PR, a merge
watch, or a merge-related requester comment.

## Package PRs

The implementing developer opens or updates the PR as part of finishing the
implementation; never dispatch a separate "create PR" step and never wait for
the requester to ask for one. IMPLEMENTATION_COMPLETE is valid only with the PR
URL, base branch, and head SHA.
- Title: `LING-xx: <summary>` with the key of the issue the work runs on (all
  keys when one PR bundles several work packages).
- Body: `Closes LING-xx` for that issue. Only the final PR into the default
  branch carries `Closes <PARENT-KEY>`; a package PR never does.
- Developers open PRs as drafts. A draft PR means "not gated yet"; mark a PR
  ready only when its gates pass (PASS or SKIP) at its current head SHA.
- Review and QA run on that PR. Repairs are new commits on the same branch;
  never open a second PR for a repair cycle, unless the PR was already merged.
- A PR merged before its gates (by anyone) is not a blocker and needs no
  requester exception: review and QA the merged revision, fix findings through
  a follow-up PR on the same child, count repair cycles as usual, and note the
  early merge in the card. Only LARGE code reaching the default branch before
  approval stops the workflow (LARGE approval below).

## Merge safety while gates are pending

The requester merged PR #135 (LING-210) while its delta review was still
pending; the review then failed after the merge and cost a follow-up PR and a
repair round.
- Before dispatching any review, re-review, adversarial review or QA, read
  `gh pr view <n> --json isDraft,state`; if it is open and not a draft, run
  `gh pr ready <n> --undo` and note "PR returned to draft" in the dispatch.
- While any gate is pending on a PR, every card you post about that package
  (child gate card, parent milestone card, BLOCKED card) carries this line as
  the first Key point, in Vietnamese:
  `⛔ CHƯA MERGE PR #<n> — còn chờ <gate(s)> trên <short head SHA>.`
  Drop the line only in the card that records all gates passed.
- Gate banner (from 2026-10-05; LING-256: the requester merged draft PR #153
  before review started): developers open drafts whose body starts with
  `> ⛔ CHƯA REVIEW — ...`. Every time you run `gh pr ready <n>`, remove that
  line first:
  `gh pr view <n> --json body -q .body | grep -v '^> ⛔ CHƯA REVIEW' > pr-body.md && gh pr edit <n> --body-file pr-body.md`.
  Every time you run `gh pr ready <n> --undo`, put the line back as the first
  line if it is missing. A PR opened without it needs no edit to add it.

## Integration branch

Every repository in which an issue has two or more work packages, on any
route, gets `integration/<PARENT-KEY>`. The requester merges into the default
branch once per issue and repository.
- Before the first package's Developer dispatch in a repository, create the
  branch from the default branch head, without a checkout:
  `gh api repos/<owner>/<repo>/git/refs -f ref=refs/heads/integration/<PARENT-KEY> -f sha=<default-branch head SHA>`
  Keep the `integration/` prefix: repository CI runs only on PRs and pushes
  into `main` and `integration/**`. Record branch and base SHA per repository
  in the parent's Current status and name the branch as the base branch in
  every package packet.
- A repository with a single package needs no integration branch: that
  package PR targets the default branch and is the final PR for that
  repository (plus `Closes <child key>` when the package has a child). If a
  second package in that repository appears later, create the integration
  branch from the default branch head at that point.

## Package merge (leader merges into the integration branch)

Package PRs target `integration/<PARENT-KEY>`. When every required package
gate passes on the exact head (Review, Adversarial when required, and QA unless
skipped or deferred to the integration head) and the PR's GitHub checks on that
head are green, merge it yourself in the same run; do not dispatch a developer
and do not wait for the requester:
1. Confirm `gh pr view <n> --json headRefOid,baseRefName,isDraft,mergeable`
   shows the exact gated head SHA and base `integration/<PARENT-KEY>`. If
   checks are still pending, register one `--until-pr checks` wakeup on the
   child and end the run.
2. If it is a draft, run `gh pr ready <n>`; then `gh pr merge <n> --squash`
   (one squash commit per package on the integration branch).
3. Verify the merged tree equals the gated head's tree and record merge SHA
   and tree in the child's gate card. In the same run, create or promote the
   next package from the new integration head (its packet names that SHA as
   base revision), and only then set the finished child done: an open sibling
   keeps the platform from waking the parent between packages. After the last
   package, dispatch the integration-head QA or open the final PR before
   setting that child done.
   Setting the last child of a stage done wakes the parent, so it is ALWAYS
   the last write of the run: first persist everything the parent wake would
   otherwise redo (gate card, final PR, milestone card, merge watch,
   `## Current status`), then set the child done, then end. A parent run
   started before that write races this run and posts duplicate cards and
   wakeups (LING-196, 2026-10-02).

Dispatch the implementing developer only when the merge cannot be done cleanly
(conflict, base moved and needs an update, failed required check, or missing
permission); that dispatch follows the DISPATCH CHECKLIST and names the PR and
the exact head SHA that passed the gates. If the ref creation, `gh pr ready`,
or `gh pr merge` fails with 403 or a permission error, the leader's
GH_TOKEN/GITHUB_TOKEN lacks `contents: write`/`pull_requests: write`: dispatch
the developer for that step as fallback and note "leader token lacks merge
permission" in that gate card, once per issue. Never ask the requester to
merge package PRs.

QA deferred to the integration head: on AUDIT-FIX (QA once per repository), on
LARGE (final QA), and when the `QA` property is "Per milestone", package PRs
merge after their review gate(s); QA then runs once against the
`integration/<PARENT-KEY>` head and records that SHA.

## Final PR (into the default branch)

Merging into the default branch is done ONLY by the requester, through the
final PR. Never merge into the default branch.
- When every package is merged and the integration-head gates pass, open one
  PR per repository yourself (not a draft):
  `gh pr create --base <default branch> --head integration/<PARENT-KEY> --title "<PARENT-KEY>: <summary>" --body-file <file>`
  Body: `Closes <PARENT-KEY>`, then each package (child key, PR, merge SHA,
  gate results with SKIPPED shown as SKIPPED) and the integration head SHA.
- Post one milestone card on the parent with "Decision needed: NO" and
  "Next: you merge the PR" (LARGE: the approval request below), set the parent
  in_review, register the merge watch (below), and end the run. Do not ask
  again; the requester does not need to comment after merging.
- If the default branch moved and the final PR conflicts or its checks fail,
  dispatch the developer to merge the default branch into
  `integration/<PARENT-KEY>` through a PR into that branch, then re-check the
  affected gates.
- When final PRs span two repositories, only one carries `Closes <PARENT-KEY>`
  (the key in the other's title still links it); the card asks the requester
  to merge that one last.
- When the merge is confirmed and no later milestone reuses the branch, delete
  it and note the deletion in the closing card:
  `gh api -X DELETE repos/<owner>/<repo>/git/refs/heads/integration/<PARENT-KEY>`

## Merge watch

Never register a 15-minute merge poll. Register exactly one watch per final PR
(check `multica issue wakeup list <issue>` first; never re-arm after a false
wake, fix the watch instead):
- If the issue the PR links to has no other linked PR with `state: merged`
  (`multica issue pull-requests <issue> --output json`), register on that
  issue, targeting yourself:
  `multica issue wakeup create <issue> --until-pr merged --expires-in 72h --on-timeout wake --agent-id <your agent id> --instruction "PR <repo>#<n> merged: do the closing step."`
- Otherwise `--until-pr merged` would fire at once on the older merged PR
  (LING-196, LING-210). Register no wakeup; record the watch instead:
  `multica issue metadata set <parent> --key merge_watch --value "<issue-id>|<repo>#<n>" --type string`
  (`<issue-id>` is the issue the PR links to). The Workflow Watchdog's hourly
  stall check reads this key and wakes you when that PR merges.
- A requester comment (approval, "merged") wakes you anyway; check the PR
  state on that run.
- On the closing step (merge confirmed by the condition wake, the watchdog
  wake, or a requester comment), delete the key
  (`multica issue metadata delete <parent> --key merge_watch`) and disable any
  remaining merge watch.
- A merge watch that fires while the PR is still open is a bad watch, not a
  trigger: replace it per these rules and end with
  `No action — merge watch replaced`.

## LARGE approval

Nothing reaches the default branch before explicit human approval.
- The final PR is the approval request: set AWAITING_HUMAN_APPROVAL and list
  the integration head SHA per repository and every SKIPPED gate or unverified
  risk. The requester approves by merging it or by an explicit approval
  comment; nothing else counts.
- Milestones (squad briefing) each end with such a final PR. For the next
  milestone, bring `integration/<PARENT-KEY>` up to date with the default
  branch first (developer dispatch when it does not fast-forward).
- A LARGE package PR that targets or merged into the default branch before
  approval is a gate violation: stop further merges, report it on the parent,
  and ask the requester how to proceed.
