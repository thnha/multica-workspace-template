---
name: self-code-review
description: Review a Developer's complete implementation diff before handoff to detect scope violations, missing requirements, logic defects, contract issues, security problems, and insufficient tests.
---

# Self Code Review

## Review Target

Review the complete diff, not remembered edits.

Self-review supplements but never replaces independent review.

## Checklist

### Scope

Check that:

- every change belongs to the assigned task
- no unrelated refactoring was introduced
- no accidental formatting or generated files remain
- dependencies were not changed without necessity
- approved boundaries were respected

### Requirements

For each assigned requirement and acceptance criterion:

- identify where the behavior is implemented
- identify how it is validated
- flag missing coverage

### Logic

Inspect relevant:

- conditions
- boundary values
- null or undefined behavior
- state transitions
- ordering
- async behavior
- errors
- cleanup
- retries

### Contracts

When contracts are affected, verify:

- request and response shape
- shared types
- serialization
- error behavior
- compatibility
- version assumptions

### Data

When persistence is affected, verify:

- integrity
- ownership
- constraints
- transaction behavior
- migration compatibility
- failure behavior

### Concurrency

When shared mutable state is involved, ask:

- What happens if this runs twice?
- What happens concurrently?
- What happens after retry?
- Can partial success occur?
- Can state or value be duplicated?

### Security

When relevant verify:

- authentication
- authorization
- resource ownership
- input validation
- trust boundaries
- sensitive logging
- secret exposure
- injection risks

### Maintainability

Verify that the implementation:

- follows existing conventions
- uses clear naming
- avoids unjustified abstraction
- avoids unnecessary duplication
- contains no temporary/debug code

Do not expand scope merely to improve unrelated code quality.

### Tests

Verify that tests cover the changed behavior and important
failure paths.

For bug fixes, add regression coverage when practical.

Prefer behavior-oriented tests over tests coupled unnecessarily
to implementation details.

## Result

Return one of:

**PASS**
No unresolved self-review issue remains within the task.

**ISSUES FOUND**
List each issue with its affected requirement or code area and
the required action.

Resolve in-scope findings before handoff whenever possible.