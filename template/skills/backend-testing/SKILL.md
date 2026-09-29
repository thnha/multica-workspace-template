---
name: backend-testing
description: Design and implement backend tests for Node.js changes using the repository's existing test framework and conventions, selecting unit, integration, contract, concurrency, and regression coverage according to behavior and risk.
---

# Backend Testing

## Discover Existing Test Conventions

Inspect:

- test framework
- test directory structure
- naming conventions
- fixtures
- factories
- mocks
- database test setup
- integration helpers
- existing similar tests

Follow repository conventions.

Do not introduce a second test framework for a local task.

## Test Behavior

Tests should primarily demonstrate required behavior.

Avoid coupling tests unnecessarily to:

- private methods
- internal call counts
- implementation-specific structure

unless those details are themselves part of the required
contract.

## Unit Tests

Use unit tests when behavior can be meaningfully isolated.

Good candidates include:

- deterministic business rules
- transformations
- validation logic
- calculations
- state decisions

Do not mock so much that the test no longer demonstrates useful
behavior.

## Integration Tests

Prefer integration tests when correctness depends on:

- database semantics
- framework wiring
- transactions
- serialization
- API behavior
- real repository queries
- external adapter contracts

## Regression Tests

For bug fixes, when practical create a test that demonstrates
the reported failure before relying on the fix.

The test should fail for the original defect and pass with the
correct implementation.

## Negative Paths

Cover relevant failure behavior such as:

- invalid input
- unauthorized access
- forbidden access
- missing state
- duplicate operation
- dependency failure
- constraint violation

Do not create exhaustive combinations without meaningful risk.

## Concurrency

When concurrency is part of correctness, use the
`backend-concurrency` skill and test the resulting invariant.

## Determinism

Avoid tests depending unnecessarily on:

- real wall-clock timing
- arbitrary sleeps
- uncontrolled randomness
- execution order
- external network access

Use the project's established mechanisms for controlling these
dependencies.

## Test Quality Check

Before handoff verify:

- important new behavior has coverage
- tests would fail for meaningful behavioral regressions
- relevant failure paths and concurrency invariants are covered
- fixtures, mocks, and cleanup preserve test isolation
- executed commands and results are recorded
- failed, skipped, or unavailable checks are reported explicitly

Use `implementation-validation` to record validation evidence.
Do not report a test as passed unless it was executed or supported
by trusted execution evidence.
