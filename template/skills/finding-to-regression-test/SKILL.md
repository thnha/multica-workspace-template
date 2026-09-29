---
name: finding-to-regression-test
description: Turn an adversarial finding into a failing regression test on the reviewed head, hand it to the developer as a locked test on a separate branch, verify the fix turns it green, and produce the Adversarial Review Report with ADVERSARIAL_REVIEW_* workflow evidence.
---

# Finding → Regression Test

## Principle

A bug is established by a test that fails on the reviewed revision for the
reason the finding claims. The developer's fix is established by the same,
unchanged test passing on the new revision. Opinions do not block; red tests
do.

You write tests only. Never change production code, even to "help".

## Finding status

| Status | Meaning | Blocks? |
|---|---|---|
| CONFIRMED | Test fails on the reviewed head with the invariant assertion | YES for BLOCKER/MAJOR; MINOR states Blocking YES/NO |
| PLAUSIBLE | Concrete scenario, but not reproduced (state why) | No — listed as unverified risk for the leader and human approval |
| HELD | INV attacked with the listed tests; invariant held | No — positive evidence |
| INV-GAP | State-mutating path with no declared invariant | No — routed to the invariant owner |

Severity: BLOCKER = data loss/corruption, duplicated or lost learner progress,
money/subscription error, authorization bypass. MAJOR = invariant violation
with limited blast radius or needing unusual timing. MINOR = degraded
behavior, no invariant broken.

## Writing the test

1. Follow the repository's test conventions (runner, folder, helpers). Name the
   test so its title contains the finding and invariant IDs, e.g.
   `ADV-001 / INV-002: 20 concurrent completions record exactly one row`.
2. Assert the invariant on resulting state, not on return codes alone
   ("exactly one completion row", "balance == 100", "B cannot read A's deck").
3. Use real infrastructure for anything involving concurrency or transactions:
   - LingoBites-Server: `node:test` via `tsx` against a real Postgres
     (`DATABASE_URL`, see `test/assertDbUrl.mjs` and the `test:db` script).
     A DB-backed test must be runnable by an explicit command; if the repo
     runs DB tests from a file list, add the file to that list in the same
     commit.
   - LingoBites-App: Jest; use the real SQLite layer where the repository
     already does, and fake timers/lifecycle only at the boundary under attack.
   - Concurrency: fire competing operations with `Promise.all`; use enough
     parallelism/iterations to make the race observable. Where the order must
     be forced, use a barrier inside test-only code (test helper, injected
     dependency the code already accepts). Do not add production seams.
   - Partial failure / unknown outcome: inject a throw at the boundary through
     an existing dependency injection point, or kill the operation between
     steps using test helpers.
4. The failure must be the invariant assertion. A compile error, setup error,
   timeout, or missing fixture is not evidence of the bug; fix the test.
5. Run it on the reviewed head:
   - deterministic test: fails 3/3 runs
   - race test: record the failure rate over at least 10 runs; CONFIRMED
     requires at least one invariant-assertion failure. Raise parallelism until
     it fails reliably where possible.
6. If you cannot build a trustworthy test (no harness, needs multi-process
   infrastructure the repo lacks), record PLAUSIBLE with reason and add a
   `TEST-INFRA` note describing the missing harness. Never replace it with a
   mocked "proof".

## Delivering tests to the developer

- Create branch `adversarial/<CHILD-KEY>-r<n>` from the reviewed head SHA.
  Commit only test files and minimal test wiring (e.g. adding the file to a
  test script list). Push the branch. Do not open a PR. Do not push to the PR
  branch.
- Record in the report: branch, tip SHA, and the exact list of locked paths.
- CONFIRMED tests are **locked**. The developer merges the branch into the PR
  branch unchanged, then fixes production code until they pass. Any change to a
  locked path needs your written agreement on the child issue (for example a
  wrong fixture), recorded with the reason.
- HELD tests are delivered the same way and stay as permanent regression
  coverage.

## Re-review

For each prior ADV finding on the new head:

1. Locked tests unchanged: `git diff <adversarial-tip> <new-head> -- <locked paths>`
   is empty, or every difference is covered by a recorded agreement.
2. The test passes on the new head: deterministic 3/3, race tests 10/10.
3. Mark FIXED, OPEN, or NOT VERIFIED with the SHA and command.

Then attack only the changed code and previously failed INVs.

## Verdict

- ADVERSARIAL_REVIEW_FAILED — at least one unresolved blocking CONFIRMED
  finding, or a locked test was modified without agreement.
- ADVERSARIAL_REVIEW_PASSED — every INV attacked (HELD or FIXED), no
  unresolved blocking CONFIRMED finding. PLAUSIBLE, INV-GAP, and TEST-INFRA
  items may remain and must be listed.
- BLOCKED — invariant list, head SHA, repository, or any means to run tests is
  missing.

## Adversarial Review Report (canonical template)

Target under ~6,000 characters (re-review under ~3,000). Deliver it as
`adversarial-review-<CHILD-KEY>-r<n>.md` attached to the `handoff-policy`
summary card; never paste it into the comment.

```markdown
# Adversarial Review Report

## Scope and revisions
- Issue / spec / design (IDs, links):
- Repository / PR / base branch:
- Reviewed head SHA:
- Adversarial branch / tip SHA:
- Locked paths:

## Invariant coverage
| INV | Mechanism in code (path) | Attacks tried | Result (HELD / ADV-xxx / NOT ATTACKED + reason) |
|---|---|---|---|

## Findings
### ADV-001 — <title>
- Status / severity / Blocking:
- Invariant violated:
- Interleaving or failure sequence:
- Test: path + test name
- Command:
- Result on reviewed head: <fail count>/<runs>, assertion message
- Root cause (file:line at reviewed head):
- Suggested direction (not a patch):

## PLAUSIBLE, INV-GAP and TEST-INFRA notes
- ...

## Re-review
N/A for an initial review. Otherwise:
`ADV-xxx — FIXED | OPEN | NOT VERIFIED — locked diff empty: yes/no — <runs> on <SHA>`

## Verdict
- Workflow state: ADVERSARIAL_REVIEW_PASSED | ADVERSARIAL_REVIEW_FAILED | BLOCKED
- Unresolved blocking IDs and covered revision:

## Handoff
<workflow-state-protocol YAML; stage: adversarial_review>
```
