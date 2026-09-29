---
name: software-implementation
description: Execute an approved software implementation task from repository inspection through implementation, validation, and handoff. Use when modifying production code for an assigned implementation task.
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