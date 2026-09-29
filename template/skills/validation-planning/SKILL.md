# Validation Planning

## Purpose

Define evidence Developers and QA must produce to demonstrate
correctness.

---

# Validation Selection

Choose validation proportional to behavior and risk.

## Static

- compile
- build
- lint
- type check

## Unit

Use for isolated business logic.

## Integration

Use for boundaries such as:

- database
- API
- external services
- messaging
- framework integration

## Contract

Use when multiple components communicate through a defined
contract.

## Concurrency

Use when correctness depends on simultaneous execution,
duplicate requests, or retries.

## Migration

Use for schema/data transition.

## E2E

Use for critical user-visible flows.

## Regression

Use to verify existing behavior remains intact.

---

# Per-Task Validation

For every task specify:

Required:
...

Conditional:
...

Not Required:
...

Do not merely say:

"Add tests."

Specify what behavior requires verification.

---

# Evidence

Define expected evidence when useful:

Command:
...

Expected:
...

Behavior:
...

Do not fabricate commands that are not confirmed for the
project.

If commands are unknown, require the Developer to discover the
project's existing validation commands first.