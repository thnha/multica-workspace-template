---
name: software-implementation
description: Execute an approved software implementation task from repository inspection through implementation, validation, and handoff. Use when modifying production code for an assigned implementation task. Mandatory first read of every developer run - its Run discipline covers bootstrap, packet reading, isolated test resources, foreground commands, and never waiting for CI.
---

# Software Implementation

## Inputs

Use the assigned task as the source of scope.

Read, when available:

- requirements and acceptance criteria
- architecture decisions
- in-scope and out-of-scope boundaries
- dependencies
- validation requirements
- Definition of Done

Read linked Feature Specification, Technical Design, or
Implementation Plan only when additional context is required.

## Run discipline (every run, every route)

Every tool call re-sends the whole context, so each wasted step costs time and
tokens. These rules apply to every developer run: any route, first run,
repair, or resume.

1. Read your workflow skills before acting: this file at the start of every
   run; on MEDIUM/LARGE also `incremental-block-delivery` before the first
   edit; `implementation-report` before writing the report. Knowing a skill's
   name or description is not reading it.
2. Bootstrap directly: get the repository with `multica repo checkout <url>`
   (or the checkout the packet names). Do not inspect other tasks' workdirs,
   daemon or sidecar files, or CLI `--help` output unless a command you need
   failed.
3. Read the packet once: save the issue description to a local file on the
   first read and grep that file afterwards; never re-fetch it to read another
   slice. On a repair or resume, read only the newest repair section plus the
   Scope and acceptance sections.
4. Isolated test resources: real-service tests (database, cache, queue) run
   against a resource owned by this task, for example a database named
   `<db>_<issue-key>`, created at baseline and named in the report. Never run
   them against a shared database another run may be using.
5. Foreground only: run installs, builds and tests in the foreground with a
   timeout; never start a command in the background and poll its status. Keep
   output short (compact reporter or `tail`).
6. Batch: chain related read-only commands in one call (`git status && git log
   -1`, one grep across several files) instead of one call each.
7. Never wait for CI: no `gh pr checks --watch`, `gh run watch`, repeated
   `gh run view`, or sleep/poll loops. After the final push, read the check
   state once (`gh pr checks <n>`; if the token cannot read checks,
   `gh run list --branch <branch> --limit 1`), report it as
   `CI running: <PR link>` or its result, and finish. The leader reads GitHub
   checks on the exact head at gate time (R4). A packet line such as "CI checks
   must be green on the reported head" is that leader gate, not an instruction
   to wait. Only when the packet explicitly says to wait for the CI result,
   make ONE foreground `gh pr checks <n> --watch` call and nothing else.

Incidents (2026-10-02): LING-183 repair round 1 fetched the issue description
7 times and spent about 6 minutes watching CI plus 87 background-status polls.
LING-187 never opened `incremental-block-delivery`, polled CI 29 times for
about 6 minutes (about 20% of the run's tokens), lost about 1 minute to a
shared-database collision, and needed a handoff correction round for the
missing Blocks table and block checkpoints.

## Workflow

### 1. Understand

Before editing, determine:

- required behavior
- behavior that must remain unchanged
- task boundaries
- dependencies
- required validation
- completion criteria

If a missing decision materially affects implementation, stop
the affected work and report the blocker.

### 2. Inspect

Inspect the relevant repository areas.

Find:

- current execution flow
- existing implementation patterns
- relevant contracts
- relevant tests
- project validation commands

Use `code-change-analysis` when the change surface is not
immediately clear.

Do not assume framework, architecture, filenames, commands, or
dependencies without repository evidence.

### 2b. Design (Approach Note)

Read `design-discipline` and write its Approach Note before the first edit,
scaled to the route (SMALL 3–5 lines, MEDIUM up to ~25 lines, LARGE only
deviations from the Technical Design). Search for reusable code first and
record what you found. If the note exposes an unsettled contract, schema,
auth, or architecture decision, stop and escalate.

### 3. Establish Baseline

When practical, run relevant existing validation before editing.

Record failures that already exist.

Prefer targeted validation over unnecessarily broad checks.

### 4. Implement

Make the smallest coherent change that satisfies the assigned
task.

Follow existing project conventions.

Preserve behavior outside the approved scope.

Add or update tests required by the task.

Do not perform unrelated refactoring, cleanup, upgrades, or
redesign.

### 5. Inspect the Diff

Review the complete working diff.

Remove:

- accidental changes
- debug code
- unrelated formatting
- temporary files
- unintended generated files
- secrets
- unrelated dependency changes
- new files or exported symbols missing from the Approach Note, duplicated
  blocks, and old code paths left alive after a replacement
  (`design-discipline` §5)

### 6. Self-review

Use `self-code-review`.

Resolve findings that are within task scope.

Escalate findings that require changing approved requirements,
architecture, contracts, or scope.

### 7. Validate

Use `implementation-validation`.

Run the validation required by the task and project.

If validation fails, use `debugging` when diagnosis is not
obvious.

### 8. Check Completion

Evaluate every Definition of Done item.

Use only:

- PASS
- FAIL
- NOT VERIFIED
- N/A

Never convert missing verification into PASS.

### 9. Handoff

Produce the project's Implementation Report.

Report:

- actual changes
- requirements addressed
- tests changed
- validation evidence
- DoD results
- deviations
- known issues
- blockers
- remaining verification

## Stop Conditions

Stop the affected work and report the issue when:

- a required dependency is missing
- requirements materially conflict
- approved architecture cannot support the task
- implementation requires unapproved scope expansion
- a public contract must change unexpectedly
- safe implementation requires a product or architecture decision

Do not silently solve these by changing the approved design.

## Completion

Report COMPLETE only when the assigned scope is implemented and
all required completion gates are satisfied.

Otherwise report PARTIAL, BLOCKED, or FAILED as appropriate.
