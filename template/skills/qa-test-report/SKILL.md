---
name: qa-test-report
description: Produce a structured QA Test Report from executed validation, mapping requirements and acceptance criteria to test results, defects, regression coverage, evidence, and a final QA assessment.
---

# QA Test Report

## Purpose

Generate the final QA Test Report after validating an implementation.

The report must clearly show:

* what was tested
* requirement and acceptance-criteria coverage
* test results
* discovered defects
* regression coverage
* final QA status

## Inputs

Use available project artifacts:

* Feature Spec
* Implementation Report
* Code Review Report
* test results
* runtime or manual validation evidence

Do not invent missing results or evidence.

## Instructions

1. Map relevant requirements and acceptance criteria to QA results.
2. Include every required scenario, including `BLOCKED` and `NOT_RUN` scenarios; distinguish required validation from optional coverage.
3. Record expected versus actual behavior.
4. Attach concise evidence when available.
5. Create defect entries for confirmed failures.
6. Separate validated and unvalidated regression areas.
7. Derive the final status from actual QA results.
8. Keep confirmed defects and `SUSPECTED (not reproduced)` issues in separate sections.
9. Evidence must match the case's level: a device/UI case is PASS only with device evidence from the tested head (interaction, screenshot of the result, AX read). Unit tests, code reading or screenshots of an unrelated state make it NOT_RUN or BLOCKED, never PASS or FIXED.

## Severity

Judge from evidence and context; keep scheduling priority separate.

* `CRITICAL`: severe exposure, widespread irreversible loss, or a primary service effectively unusable.
* `MAJOR`: a major journey fails, authorization is violated, data integrity is at risk, or a meaningful functional error has no practical workaround.
* `MINOR`: limited functional impact with a workaround, or a usability/cosmetic issue.

Deduplicate related manifestations without assuming a shared root cause. Do not inflate the finding count or present preferences as defects.

## Status Rules

Derive the final assessment in this order:

1. `FAIL` if any confirmed defect prevents acceptance or any required behavior fails. This takes precedence over incomplete validation; still list every blocker and unexecuted required test.
2. Otherwise, `BLOCKED` if any required validation remains `BLOCKED`, `NOT_RUN`, or lacks trustworthy evidence at handoff. Record why, the risk, and what is needed to finish.
3. Otherwise, `PASS_WITH_NOTES` if all required validation passed and only non-blocking observations or optional coverage limitations remain.
4. Otherwise, `PASS` if all required validation passed and no concerns remain.

Never use `PASS_WITH_NOTES` to hide missing required validation. A required case still `BLOCKED` or `NOT_RUN` forces `BLOCKED` unless the requester explicitly waived it in a comment; cite that comment id in the report. Do not downgrade a required test to optional just to obtain a passing result. Record approved scope changes and their source.

## Workflow Handoff

Map the report assessment to workflow evidence:

* `PASS` or `PASS_WITH_NOTES` -> `QA_PASSED`
* `FAIL` -> `QA_FAILED`
* `BLOCKED` -> `BLOCKED`, with `blocked_by` populated and `entry_gate_satisfied: false`

Fill the YAML handoff block in the template's Final Assessment section when operating in an issue workflow; the issue comment is only the summary card from `handoff-policy`. These workflow tokens are not Multica issue status values: never pass them to `multica issue status`, and never record `QA_SKIPPED` yourself (only the leader records skips). QA reports evidence to the leader; it does not declare the overall feature completed or dispatch the next stage.

## Output

Read and use `templates/qa-test-report.md` from this skill before producing the report. Do not reconstruct the template from memory.

Preserve the template structure and section order.

Use `None` where the template allows it.

State conclusions narrowly: "No defects observed in the tested scenarios" is acceptable; "bug-free", "fully tested" or "ready to release" is not.

## Length and brevity rules

- Target: under ~6,000 characters.
- One table row per test. Write detailed evidence only for FAIL, BLOCKED, or
  NOT_RUN tests; for PASS, the key output (counts, exit code) in the row is
  enough.
- Reference spec, implementation, and review reports by ID and link; do not
  restate them or re-list requirements outside the Covers column.
