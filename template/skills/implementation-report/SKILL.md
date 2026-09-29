---
name: implementation-report
description: Produces the standard implementation report after a Developer completes, partially completes, blocks, or fails an implementation task.
---

# Implementation Report

Use `templates/implementation-report.md` for every task on every route. Read
it before writing the report and keep its headings and order.

## Length and brevity rules

- Target: under ~4,000 characters.
- Reference the packet, spec, and audit findings by ID; do not restate them.
- List only validation checks that the task required or you actually ran; do
  not add rows for categories that do not apply.
- A section with nothing to report says `None`.

## Rules

- Report only work actually performed. Mark a check PASS only with executed
  evidence; list failed and unverified checks, never omit them.
- Copy the head SHA from command output (`git rev-parse HEAD`,
  `gh pr view --json headRefOid`); never type it from memory.
- Include every Definition of Done criterion from the packet.
- A failure that also exists on the base SHA is PRE-EXISTING FAILURE only when
  you ran it on base.
- Unapproved material scope expansion prevents COMPLETE.
- COMPLETE means this task is complete; it does not assert review, QA,
  workflow completion, merge, or deployment.
