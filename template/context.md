## Default requester rules
Apply to every issue in every project unless the issue description or the project description explicitly overrides them.

- R1 Adversarial only when needed: dispatch Adversarial Reviewer only for packages that change production code touching shared/persisted state, auth/account, sync, data migrations, or declared invariants. Test/tooling/docs-only packages need Code Review only.
- R2 Correction limit: max rounds per package = issue property `Max rounds` (default 3). Handoff corrections and review repairs count toward the same limit, except the first mechanical correction per package on issues marked `Preflight: on` (skill `preflight-check`). At the limit: stop, write "Decision needed: YES" and ask the requester. Never open an extra round on your own, with one exception: when every remaining blocker is a CONFIRMED correctness defect (Adversarial CONFIRMED, or Code Review MAJOR/BLOCKER backed by a failing red test), the leader opens exactly one extra defect-only repair round limited to those findings, labelled `extra round (R2 exception)`, at most once per package.
- R3 Acceptance frozen at dispatch: no new requirements on a running package. New requirements become follow-ups, unless a CONFIRMED defect breaks an invariant.
- R4 CI is the primary evidence: format/lint/typecheck/test gates read GitHub checks on the exact head SHA. Never write "CI running" when the PR has no checks.

## Scope discipline
- Refactor/architecture tasks preserve behavior. A behavior change discovered during work (bug, data-loss risk, UX/API change) → ask the requester, then track it as a linked follow-up issue. Do not implement it inside the refactor unless the requester explicitly says so.
- Only the requester merges to `main`.

## Standing decisions (do not ask again)
Already decided by the requester. Apply them, cite the ID in the gate card, and never ask about them again. A requester answer that states a general rule on an issue also covers later questions of the same kind on that issue; quote it instead of asking again (LING-224: a repeated CI-policy question held the TASK-001 merge for 5h20m until the requester replied "tôi đã chốt rồi").
- SD1 Pre-existing red CI: a required check that also fails on the base branch (`main` or the integration branch), for a reason outside the package write scope, does not block merging the package into its integration branch. Name the check and the reason in the gate card and track it in one backlog follow-up per repository (reuse an open one). The milestone PR to `main` lists it; the requester decides there.
- SD2 Staging deploy is optional: contract checks run against a local Server (real Postgres + local storage) unless the requester asks for staging.

## Engineering practices
1. Before changing shared/persisted state: list every write path, await points, concurrent operations, and required ownership order.
2. CONFIRMED review finding: the reviewer first writes a test that fails on the exact faulty head; the developer includes it unchanged, then fixes (red → green).
3. Developer preflight before IMPLEMENTATION_COMPLETE: typecheck, lint, relevant + full tests, diff vs write-scope; report head SHA and CI result.
4. Root-cause checkpoint: the Feature Orchestrator applies it at the second failing round on the same invariant, acceptance criterion, or production file (its "Root-cause checkpoint" rule); the developer posts the note and stops before changing code.

## Environment prerequisites
Developer runtimes need `gh` authenticated and `GITHUB_TOKEN` (contents:write, pull_requests:write). If missing, report BLOCKED at preflight instead of retrying.

## Asking the requester (clarification format)
Applies to every agent in every project whenever you need a decision or clarification from a human.

1. Propose first. Start with the concrete result you would deliver if the answer is `ok` (e.g. a target tree, a short list of changes, a mock), max ~20 lines.
2. At most 3 questions per round. Ask only what has no safe default: destructive actions, large-impact choices, or pure preferences you cannot infer. One line per question; options A/B/C one line each; mark your recommendation with ★.
3. Everything else goes under "Defaults to apply" as D1, D2, … (one line each). The requester only objects if they disagree.
4. End with the reply syntax: `ok` = accept all ★ and all defaults; `ok, 1A, drop D3` = overrides. Free text and replies in the requester's own language are also accepted.
5. Ask a follow-up round only if the answers create new questions. Never repeat already-answered questions.
6. Keep evidence and long analysis out of the question comment; attach or link it.
7. Timeout default. When every ★ option and default is non-destructive, end the card with `Timeout default: <HH:MM> (Asia/Ho_Chi_Minh, card time + 2h) → ★ + defaults`. Non-destructive means: no merge to `main`, no deletion of data, files or branches, no closing or cancelling work, no accepting a known defect as a risk, no skipped gate, no scope change. Otherwise write `Timeout default: none — <reason>`. With a timeout default, register one wakeup on the card's issue: `multica issue wakeup create <issue> --event comment.created --filter-actor-type member --filter-actor-id <requester member id> --expires-in 2h --on-timeout wake --instruction "Decision card <comment-id>: if the requester has not replied, apply ★ and defaults"`. When it wakes on timeout with no requester reply, apply ★ and the defaults, post one notice (`Áp dụng mặc định ★ sau 2h không có phản hồi: …; trả lời để đổi`), and continue; applying it counts as the requester's answer (including for R2). A later requester answer overrides it from that point on. While a decision is pending, keep every package that it does not block moving.
8. Card location. Post the decision card where the requester is reading: the issue the requester last commented on for this work, or the blocked child itself. When another issue also needs the card (for example the parent milestone rule), post the full card in one place and a one-line pointer with a link and a requester mention in the other. LING-224: an A/B/C card posted on the parent while the requester read LING-245 cost a round trip ("nội dung A/B/C để ở đâu tôi không thấy").

Template:
**If you reply `ok`, I will:** <proposal>
**Please choose:**
1. <question> — A. … · ★B. … · C. …
**Defaults to apply** (object only if you disagree):
- D1: …
**Reply:** `ok` or `ok, 1A, drop D1`
**Timeout default:** <HH:MM> → ★ + defaults (or `none — <reason>`)

## Handoff files
For parents classified after 2026-10-04T08:34Z, the Feature Orchestrator writes the line `Handoff: files` in the parent's `## Current status` and in every packet. Agents bound to skill `handoff-files` follow it on those issue families: agent-to-agent comments become a 3-line stub with the details in an attached file, and full comments are written only when the requester must act. It overrides the comment-body rules of `handoff-policy` and of agent instructions there; issues without the line keep the old rules.
To switch it off: unbind `handoff-files` from the agents and delete this block.

## Preflight
For parents classified after 2026-10-04T08:34Z, the Feature Orchestrator writes the line `Preflight: on` in the parent's `## Current status` and in every packet. Agents bound to skill `preflight-check` follow it on those issue families: the leader runs one preflight per repository inside its first implementation dispatch (base CI, local CI commands, test lists, roster, quota, environment names) and developers self-check on the exact pushed SHA before IMPLEMENTATION_COMPLETE. Only a WARN that needs the requester becomes a card. It adds no run and no stage.
To switch it off: unbind `preflight-check` from the agents and delete this block (the R2 exception for mechanical corrections then lapses).

## Output language
- Everything that configures agents (instructions, skills, task packets, wakeup instructions) is written in English.
- Protocol tokens stay in English exactly as written: status tokens, card headers and field labels (`Decision needed: YES|NO`, `Result`, `Key points`, `Not verified`, `Needed from you`, `Next`), `[Watchdog]`, the clarification-template labels, option letters, and property values.
- Free text written for the human requester is Vietnamese: card field values, questions and options, proposals, explanations, and notices addressed to the requester.
- Text addressed to other agents (task packets, parent notices, resume notes), code, commits, and PR titles/bodies is English. Artifact IDs, requirement IDs, and commit SHAs are never translated.