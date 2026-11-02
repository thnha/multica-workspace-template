---
name: incremental-block-delivery
description: Mandatory delivery loop for every developer agent on MEDIUM and LARGE packages - split the package into blocks and, per block, code + tests + targeted checks + commit + push + checkpoint, all in one run; resume from the last pushed block. Planners and leaders use it to write the block plan and to gate IMPLEMENTATION_COMPLETE; Code Reviewer uses it for test-edit checks.
---

# Incremental Block Delivery

One package = several blocks. Each block is coded, tested, committed and
pushed before the next one starts. Never write all the code first and the tests
at the end.

Why: runs get cut by quota/session limits and rate limits; unpushed work is
lost and the next run re-reads everything. Tests written at the end get
forgotten (LING-183 r1: 36 production files, 0 test files → correction round),
and failures across many files are hard to localize.

## When it applies

- MEDIUM and LARGE packages, every developer agent (any stack).
- SMALL and AUDIT-FIX: optional; a package that fits one block is one block.
- Repairs (review/QA/handoff correction): each finding group is one block.
- Precedence: on MEDIUM/LARGE this loop replaces steps 4-7 of
  `software-implementation` (implement, inspect diff, self-review, validate),
  run per block; its steps 1-3 and 8-9 still apply.
- This skill is a method. It does not change a package's acceptance criteria,
  required evidence, write scope, or base branch; the task packet stays the
  source of scope. Your agent instructions (PR rules, preflight, pre-handoff
  checks, host safety) still apply in full.

## 1. Block plan

Use the packet's block list when it has one. Otherwise derive it before the
first edit and record it in the first checkpoint (section 5).

A block is:
- one cohesive unit: a module, a store + its callers, one behavior, or one
  finding group;
- about 8 production files or fewer, plus their tests;
- independently green: after it, the whole-project typecheck and the affected
  tests pass. So a block includes every call site its change breaks (for
  example a store whose constructor changes includes its construction line in
  `server.ts` and in tests);
- ordered by dependency: contracts first, then modules, then remaining
  wiring, then cross-cutting cleanup.

Atomicity beats size: never split one transaction boundary, one invariant, or
one contract change across blocks. Such a block may exceed the size cap; state
the reason in the plan.

Contracts block (first): when the package adds or changes shared types,
interfaces, error shapes, or helpers, block 1 contains only those, exactly as
the approved design defines them. Later blocks reuse them and never define
parallel versions.

Each block names: production files, test files to add/update, INV IDs it
touches, and the targeted test command.

## 2. Baseline (once per package)

Before the first edit, on the base revision (on a repair: the current PR
head), run preflight, typecheck and the test commands the blocks will use
(including real-service suites such as `test:db` when the package touches
persistence). Record pre-existing failures. A failure is PRE-EXISTING only if
you saw it here.

## 3. The block loop

All blocks run in the same run. A checkpoint is not a stopping point: end the
run only when every block is done, when you are BLOCKED, or when the run is
cut. Between blocks, do not re-read the issue, the design, or files you
already read and have not changed since.

Run hygiene: apply the Run discipline of `software-implementation` for the
whole run (read the packet once, foreground commands, isolated test
resources, never wait for CI).

For each block, in order:

1. Code the block's production change.
2. Tests in the same block, never deferred:
   - update tests that break because of the change (for a behavior-preserving
     refactor: construction/wiring lines only, assertions unchanged);
   - add a test for every new behavior and for every INV the block touches;
   - bug fix: write the failing test first, see it red, then fix
     (red → green). When the packet provides locked red tests (adversarial
     branch), merge them unchanged and use them; never edit a locked test;
   - a block with no test change must state why in its checkpoint and name the
     existing tests that cover it (for example pure wiring covered by
     `test/sync.test.ts`).
3. Targeted checks: typecheck, lint (on changed files when the linter
   supports it), and the affected test files. Use the real services the
   packet requires (for example real Postgres for persistence); never start a
   simulator, emulator, device, or Metro unless the packet explicitly asks.
   Fix until green. Do not start the next block while this block's checks are
   red; if you cannot make them green, stop and report BLOCKED with the block
   name.
   Green by fixing the code, never by gaming the tests: do not skip, delete,
   or `.only` tests, loosen assertions, or stub production code. Changing an
   existing test needs a reason in the checkpoint (`Test edits: <file> -
   <why>`).
   Keep tool output short: run tests with a compact reporter or pipe through
   `tail`, and keep only the pass/fail/skipped summary and the failing tests.
4. Diff check: only files in the write scope; no debug code or temp files.
5. Commit: `<ISSUE-KEY> block <k>/<N>: <block name>` (one or more commits).
6. Push the task branch. Do not open the PR yet: CI runs on pull requests, so
   pushes without a PR cost no CI minutes. Open the draft PR once, after the
   last block (PR rules in your agent instructions), or earlier only when you
   stop as BLOCKED/PARTIAL. On a repair the PR already exists; push anyway.
   Do not wait for CI (Run hygiene).
7. Checkpoint (section 5).

Going back is allowed: when a later block shows an earlier block is wrong
(interface, error shape, transaction boundary), fix it at the source with a new
commit `<ISSUE-KEY> block <k>/<N> (amends <j>): <what>` and re-run the targeted
checks of both blocks. Do not work around an earlier mistake.

## 4. Final validation

Before the final checks, self-review the whole PR diff (not block by block):
duplicated helpers, inconsistent naming/error handling/patterns between
blocks, dead code left by earlier blocks. Fix what you find as one last block.

Then run the full pre-handoff checks from your agent instructions (format,
lint, typecheck, full tests, every CI step, real-service suites) on the final
pushed head. A formatter fix is committed as `<ISSUE-KEY> final: format`.
Write the Implementation Report; put the Blocks table inside its `## Changes`
section, one row per block, keeping the template headings and length limit:

| # | Block | Commit | Tests changed/added | Test edits (why) | Targeted result |
|---|---|---|---|---|---|

The Blocks table is the durable record: metadata checkpoints keep only the
latest block, and reviewers read `Test edits` from this table.

## 5. Checkpoint and resume

Checkpoint = one short note after each push:

```
[Block checkpoint] <k>/<N> <block name> DONE @ <full SHA from git rev-parse HEAD>
Branch: <task branch>
Tests: <files changed/added> · <command> → <pass/fail/skipped counts>
Test edits: <pre-existing test file - why> | none
Next: <k+1>/<N> <next block name>
```

Where to write it:
- The issue is assigned to you (normal child package): a top-level comment on
  that issue, written with `--content-file`.
- Otherwise (for example a squad-assigned parent, where any comment can wake
  the leader): issue metadata, which wakes nobody:
  `multica issue metadata set <issue> --key block_checkpoint --type string --value "<checkpoint text>"`
  (overwrite the key each block; store the block plan once under
  `block_plan`).

The first checkpoint also lists the full block plan. Checkpoints are progress
notes, not result cards (handoff-policy exception): do not change status and do not mention anyone.

Resume (every run that continues a package, including after a quota cut):
1. Work on the task branch named in the latest checkpoint (or the PR head
   branch, `gh pr view <n> --json headRefName`), never a fresh branch.
   `git fetch`, then `git log --oneline <base>..origin/<branch>`: the pushed
   `block <k>/<N>` commits are the source of truth.
2. Read the latest `[Block checkpoint]` (issue comment, or
   `multica issue metadata get <issue> --key block_checkpoint`) for the plan
   and the next block. Do not re-read the whole issue history.
3. Pushed work is kept. Uncommitted local work of the next block is kept only
   after its targeted checks pass again. Continue from the first block without
   a pushed commit. Redo the baseline only if the base moved.

## 6. Completion gate

IMPLEMENTATION_COMPLETE is valid only when:
- every block has a pushed commit and a row in the Blocks table;
- every block has test changes or a stated reason naming covering tests;
- the PR diff changes production code and test code, unless the packet says
  the package is docs/tooling/test-only or a pure move with existing coverage;
- the whole-diff self-review (section 4) is done;
- the final validation passed on the reported head (no required check skipped
  or NOT VERIFIED without a packet waiver).

Otherwise report PARTIAL or BLOCKED with the last completed block.

## For planners, leaders and reviewers

- Implementation Planner: for each MEDIUM/LARGE task, add a `Blocks` list
  (name, production files, test files, INV IDs, targeted command) sized by
  section 1. A task with more than about 3 blocks likely fails the PLAN sizing gate in
  workflow-gate-policy (about 15 production files); split it.
- Feature Orchestrator: put the planner's block list in the developer packet
  when it exists (do not copy this skill's rules). Before accepting
  IMPLEMENTATION_COMPLETE, check the Blocks table and section 6; a miss is a
  handoff correction. Do not ask the developer to wait for or collect a CI
  result in a packet; read `gh pr checks` yourself at gate time (R4). Keep a
  repair packet self-contained in the single `## Repair round <n>` section
  that replaces the previous one (Feature Orchestrator COMMENT LENGTH), so
  the developer reads only that section. A block checkpoint comment is not a result card: it
  needs no gate decision (no-action). Packages whose first developer dispatch
  was before 2026-10-02T03:30Z, including their later repair rounds, keep
  their dispatch-time evidence (acceptance freeze); for them this gate is
  advisory.
- Code Reviewer: on the first review, review the whole PR, not per block; a
  re-review stays a delta review (last reviewed SHA to new head) as dispatched. Check every modified or
  deleted pre-existing test against its `Test edits` reason in the Blocks
  table: a loosened
  assertion, skipped/removed test, or stubbed production path without a valid
  reason is a MAJOR finding. Also flag cross-block inconsistency (parallel
  types or helpers, mixed error handling).
