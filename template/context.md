## Default requester rules
Apply to every issue in every project unless the issue description or the project description explicitly overrides them.

- R1 Adversarial only when needed: dispatch Adversarial Reviewer only for packages that change production code touching shared/persisted state, auth/account, sync, data migrations, or declared invariants. Test/tooling/docs-only packages need Code Review only.
- R2 Correction limit: max rounds per package = issue property `Max rounds` (default 3). Handoff corrections and review repairs count toward the same limit. At the limit: stop, write "Cần bạn quyết: CÓ" and ask the requester. Never open an extra round on your own.
- R3 Acceptance frozen at dispatch: no new requirements on a running package. New requirements become follow-ups, unless a CONFIRMED defect breaks an invariant.
- R4 CI is the primary evidence: format/lint/typecheck/test gates read GitHub checks on the exact head SHA. Never write "CI running" when the PR has no checks.

## Scope discipline
- Refactor/architecture tasks preserve behavior. A behavior change discovered during work (bug, data-loss risk, UX/API change) → ask the requester, then track it as a linked follow-up issue. Do not implement it inside the refactor unless the requester explicitly says so.
- Only the requester merges to `main`.

## Engineering practices
1. Before changing shared/persisted state: list every write path, await points, concurrent operations, and required ownership order.
2. CONFIRMED review finding: the reviewer first writes a test that fails on the exact faulty head; the developer includes it unchanged, then fixes (red → green).
3. Developer preflight before IMPLEMENTATION_COMPLETE: typecheck, lint, relevant + full tests, diff vs write-scope; report head SHA and CI result.
4. Root-cause checkpoint after the 2nd correction round when the failure involves races, shared state, or multiple modules.

## Environment prerequisites
Developer runtimes need `gh` authenticated and `GITHUB_TOKEN` (contents:write, pull_requests:write). If missing, report BLOCKED at preflight instead of retrying.

## Asking the requester (clarification format)
Applies to every agent in every project whenever you need a decision or clarification from a human.

1. Propose first. Start with the concrete result you would deliver if the answer is `ok` (e.g. a target tree, a short list of changes, a mock), max ~20 lines.
2. At most 3 questions per round. Ask only what has no safe default: destructive actions, large-impact choices, or pure preferences you cannot infer. One line per question; options A/B/C one line each; mark your recommendation with ★.
3. Everything else goes under "Mặc định sẽ áp dụng" as D1, D2, … (one line each). The requester only objects if they disagree.
4. End with the reply syntax: `ok` = accept all ★ and all defaults; `ok, 1A, bỏ D3` = overrides. Free text is also accepted.
5. Ask a follow-up round only if the answers create new questions. Never repeat already-answered questions.
6. Keep evidence and long analysis out of the question comment; attach or link it.

Template:
**Nếu bạn trả lời `ok`, mình sẽ làm:** <proposal>
**Cần bạn chọn:**
1. <question> — A. … · ★B. … · C. …
**Mặc định sẽ áp dụng** (chỉ cần phản đối nếu không muốn):
- D1: …
**Trả lời:** `ok` hoặc `ok, 1A, bỏ D1`