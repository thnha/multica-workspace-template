# Validation Policy

## Principle

Changes must be validated at the lowest useful level and at
appropriate integration boundaries.

## Validation Layers

When applicable:

1. Static validation
2. Compile / build
3. Lint
4. Type checking
5. Unit tests
6. Integration tests
7. Contract tests
8. End-to-end tests
9. Regression tests
10. Runtime verification

Not every change requires every layer.

Required validation must be proportional to risk.

## Changed Behavior

New or changed behavior should have corresponding validation.

## Bug Fixes

Whenever practical, a bug fix should include a regression test
that fails before the fix and passes afterward.

## Failed Validation

A failed required validation means the task cannot be reported
as successfully completed.

Do not ignore failing tests because they appear unrelated.

Investigate and classify them.

## Skipped Validation

If validation cannot be performed, report:

- what was not executed
- why
- associated risk
- what remains to be verified

Skipped validation must never be reported as PASS.