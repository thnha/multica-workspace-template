---
name: preflight-check
description: Cheap checks that catch trivial, repeat-causing errors before work starts (leader preflight, once per repository per parent) and before a developer hands off (self-check on the exact pushed SHA). Applies only to issue families marked `Preflight: on`.
---

# preflight-check

## Scope and switch

Apply this skill only when the parent issue's `## Current status` or your task
packet contains the line `Preflight: on`. The Feature Orchestrator writes that
line at classification (workspace context "Preflight"). It adds no run and no
stage: part A runs inside the leader's first implementation dispatch run for
each repository, part B inside the developer's own run.

Why: in LING-224 trivial issues caused repeat runs: a handoff whose report
said `yarn lint` PASS while CI failed lint twice (one of two repair rounds
spent), a red CI on `main` that held a merge for 5h20m, a new DB test not
registered in `test:db`, a reviewer without `DATABASE_URL`, a plan that
assumed two React Native agents when one existed, and a reviewer that hit its
session limit at the first gate.

## Part A — leader preflight (Feature Orchestrator)

When: in the run that dispatches the first implementation package for a
repository on this parent. Once per repository per parent; never repeat it on
later packages unless the base branch changed owner or CI configuration.
Budget: one batched read call, then the packet writes you already make.

Check and record:

1. Base CI: the latest checks on the package base branch head
   (`gh pr checks` of the last merged PR, or `gh run list --branch <base>
   --limit 3 --json conclusion,name,headSha`). Every red check becomes a line
   `Known red checks (SD1): <check> — <reason>` in each packet of that
   repository, so nobody chases a failure that is not theirs.
2. Local CI commands: the `run:` steps of the required workflow in
   `.github/workflows/*.yml` (for LingoBites-App `ci.yml`: `yarn format:check`,
   `yarn lint`, `yarn typecheck`, `yarn test --ci`). Copy them into the packet
   as `Local CI commands`; the developer runs exactly these.
3. Test lists: scripts that run tests from an explicit file list (for example
   LingoBites-Server `test:db`). Name them in the packet: a new test of that
   kind must be added to the list in the same commit.
4. Roster and runtimes: every owner agent the plan names exists
   (`multica agent list`), its runtime is online (`multica runtime list`),
   and the planned parallelism does not exceed the number of agents that can
   run it. A gap is a WARN with the corrected order.
5. Quota: when a gate agent's latest run failed on a quota or session limit
   within the past 5 hours (`multica agent tasks <agent-id> --limit 3 --output json`), write a WARN;
   the Workflow Watchdog still owns the resume.
6. Environment: name in the packet the environment each gate member needs
   (for example `DATABASE_URL` for Server DB tests). Never read secret values:
   `multica agent env get` prints them; do not use it. A member that lacks a
   named variable reports BLOCKED at its own preflight (workspace
   "Environment prerequisites").

Output:
- Add a `Preflight: OK` line, or `Preflight: WARN` with one line per finding,
  to the parent's `## Current status`, and the per-repository lines above to
  every packet of that repository.
- A WARN that needs the requester (missing secret or variable, missing agent
  or offline runtime with no alternative, a red base check SD1 does not cover)
  becomes one human card per the workspace clarification format; all other
  WARNs do not block dispatch and live only in the packet and status.

## Part B — developer self-check before IMPLEMENTATION_COMPLETE

Run on the exact commit you hand off, after the last edit and push:

1. `git status --porcelain` is empty and `git rev-parse HEAD` equals the
   remote PR head (`gh pr view <n> --json headRefOid`).
2. Run every `Local CI commands` line from the packet on that commit. Put the
   last output line of each command in the report's validation table. A check
   run before your last edit does not count.
3. New tests of a kind named under test lists are registered in that script.
4. Locked adversarial files are byte-unchanged (`git diff
   <adversarial-tip> HEAD -- <locked paths>` is empty).
5. A red command: fix it in this run and repeat steps 1-2. Never hand off with
   a red local CI command. A failure listed under `Known red checks (SD1)` is
   not yours: name it in the report instead of fixing it.

## Mechanical correction (R2 adjustment)

When the leader returns an IMPLEMENTATION_COMPLETE only because of a
format, lint or typecheck failure on the handed-off head, before any reviewer
ran on it, the first such correction per package does not count toward
`Max rounds`; record it as `mechanical correction (not counted)` in the gate
card. A second one counts as a normal round.

## Removal

To switch this off: unbind this skill from the agents and delete the
"Preflight" block in the workspace context. Issues that already carry
`Preflight: on` then follow the old rules; nothing else depends on it.
