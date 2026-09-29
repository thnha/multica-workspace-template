---
name: code-change-review
description: Review changed code as a production quality gate for correctness, regressions, repository consistency, naming, readability, maintainability, architecture, typing, error handling, security, performance, concurrency, and code hygiene. Use surrounding repository code as the source of truth and report only actionable findings supported by evidence.
---

# Code Change Review

## Role

Act as a production code quality gate.

Your job is to determine whether the changed code is safe, correct, consistent, readable, and maintainable enough to merge.

Do not rewrite the implementation.

Do not review based on personal stylistic preference.

Use:

1. repository conventions
2. surrounding code
3. established architecture
4. task requirements
5. language/framework conventions

as evidence.

---

## Inspect Before Reviewing

Before raising findings:

1. inspect the changed files
2. inspect relevant surrounding code
3. inspect at least one similar implementation when available
4. identify repository conventions
5. understand the intended behavior of the change

Do not judge a file in isolation when repository context is available.

Do not recommend a new architecture merely because it is theoretically cleaner.

---

## Review Correctness

Check for:

* logic defects
* incorrect conditions
* invalid assumptions
* incorrect state transitions
* missing cases
* incorrect data transformations
* broken control flow
* incorrect async behavior
* unintended behavior changes

Consider relevant edge cases.

A change that looks clean but behaves incorrectly must fail review.

---

## Review Regressions

Check whether the change can break existing behavior.

Inspect relevant:

* callers
* consumers
* shared utilities
* public APIs
* component props
* navigation contracts
* persisted data
* database behavior
* external integrations

Pay particular attention to changes in shared code.

---

## Review Repository Consistency

Changed code should look like it belongs in the repository.

Check:

* file naming
* folder placement
* import style
* export style
* component patterns
* service patterns
* hook patterns
* data-access patterns
* error patterns
* logging patterns
* testing patterns

Flag unnecessary deviation from an established repository convention.

Do not flag differences when the repository itself is inconsistent and there is no clear convention.

---

## Review Naming

Check new or changed:

* files
* folders
* variables
* functions
* classes
* components
* hooks
* services
* types

Names should communicate intent and match repository conventions.

Flag vague or misleading names when they materially hurt readability.

Examples that deserve attention when a better domain name is available:

```text id="abzn29"
data
data2
temp
obj
flag
fn
value2
result2
```

Do not request renames purely for personal preference.

---

## Review Readability

The implementation should be understandable without unnecessary mental overhead.

Check for:

* deeply nested control flow
* oversized functions
* oversized components
* mixed responsibilities
* unnecessarily complex expressions
* excessive branching
* duplicated logic
* confusing boolean logic
* unnecessary abstractions
* clever code where straightforward code would be clearer

Prefer simple, explicit code.

Do not demand abstraction solely because code could technically be extracted.

---

## Review Architecture

Check whether the change respects the architecture already used by the repository.

Look for responsibilities placed in the wrong layer.

Examples include:

* business logic leaking into presentation code
* database access bypassing established data-access patterns
* HTTP concerns leaking into domain logic
* React screens performing infrastructure work when the project uses hooks/services
* duplicated infrastructure clients
* bypassed shared abstractions

Do not force generic architectural patterns onto the repository.

Repository architecture is the primary reference.

---

## Review Type Safety

When TypeScript is used, check for:

* unnecessary `any`
* `@ts-ignore`
* `@ts-nocheck`
* unsafe assertions
* incorrect nullability assumptions
* duplicated domain types
* weak types hiding real uncertainty

Do not accept type suppression merely because it makes compilation succeed.

Runtime data should not be trusted solely because a TypeScript type claims it is valid.

---

## Review Error Handling

Check:

* swallowed errors
* missing failure paths
* incorrect fallback behavior
* misleading error responses
* lost error context
* inconsistent repository error handling

Flag patterns such as:

```ts id="1f2jdt"
try {
  await operation();
} catch {}
```

when failure is silently ignored without a valid reason.

---

## Review Async and Concurrency

When relevant, check:

* missing `await`
* floating promises
* race conditions
* unsafe parallel execution
* duplicate requests
* incorrect ordering
* cleanup
* cancellation
* transaction boundaries

Do not flag theoretical concurrency issues without a realistic execution path.

---

## Review React / React Native Changes

When reviewing React or React Native code, additionally check:

* Rules of Hooks
* incorrect effect dependencies
* unnecessary effects
* missing effect cleanup
* stale closures
* derived state stored unnecessarily
* unsafe async lifecycle behavior
* unnecessary state
* unnecessary memoization
* unstable list keys
* broken loading/error/empty states
* navigation contract changes

Check whether large screens/components are accumulating unrelated responsibilities.

Follow existing application patterns before suggesting extraction.

---

## Review Node.js Changes

When reviewing Node.js backend code, additionally check:

* external input validation
* async error propagation
* authentication
* authorization
* data-access boundaries
* transaction behavior
* resource lifecycle
* configuration usage
* API contract compatibility
* sensitive logging
* dependency usage

Do not assume controller/service/repository architecture unless the repository actually uses it.

---

## Review Security

When relevant, check for:

* missing authentication
* missing authorization
* trusting client-controlled identity or permissions
* injection risks
* unsafe input handling
* sensitive data exposure
* hardcoded secrets
* secrets written to logs
* insecure defaults

Security findings must identify a concrete attack or exposure path.

Do not report vague hypothetical security concerns.

---

## Review Performance

Check performance when the changed code creates a meaningful risk.

Examples:

* N+1 database queries
* unbounded queries
* repeated expensive computation
* unnecessary network requests
* unbounded concurrency
* unnecessary repeated rendering
* large synchronous work on hot paths
* resource leaks

Do not report micro-optimizations without meaningful impact.

---

## Review Code Hygiene

Changed code must not introduce avoidable garbage.

Check for:

* unused imports
* unused variables
* dead code
* commented-out implementations
* debug statements
* temporary mocks
* temporary hacks
* accidental TODOs
* duplicated code
* inconsistent formatting

Do not accept avoidable lint warnings introduced by the change.

---

## Review Scope

Check whether the implementation changed unrelated code.

Flag:

* unrelated refactors
* unrelated renames
* unnecessary formatting churn
* unrelated dependency upgrades
* architecture changes outside task scope

A focused change is easier to verify and safer to merge.

---

## Validation Evidence

When validation results are available, consider:

* lint
* typecheck
* tests
* build
* repository-specific checks

Do not claim validation passed unless there is evidence it was executed successfully.

If changed code introduces lint errors, type errors, or failing relevant tests,
report them as blocking findings.

New lint warnings introduced by the change are normally blocking findings.

---

## Avoid Bad Review Behavior

Do not:

* invent problems
* raise speculative findings without evidence
* request refactors merely for aesthetic preference
* demand abstractions without clear benefit
* rewrite working code into your preferred style
* complain about unrelated pre-existing issues
* expand the scope unnecessarily
* repeat the same root problem as multiple findings

Review the change, not the entire repository.

When a pre-existing issue is directly worsened by the change, it may be reported.

---

## Implementation Compliance

Compare the actual code and diff against the approved Feature Spec, Technical
Design, Implementation Plan, and acceptance criteria that apply to the route:
functional requirements, business rules, acceptance criteria, edge cases,
architecture decisions, assigned tasks, and documented constraints.

Identify missing or incorrect implementation, architecture violations,
unintended scope, and contradictions between artifacts and code. Do not invent
requirements that are not in the approved inputs.

---

## Test Review

Inspect tests for the changed behavior: expected behavior, failure paths, edge
cases, regressions, and important business rules. Check that tests validate
behavior rather than only implementation details, and identify important
missing coverage. Do not require tests for trivial or already-covered
behavior. Follow the repository's existing test framework and conventions.

---

## Severity, Verdict, and Output

This skill defines what to check. Finding severity (BLOCKER / MAJOR / MINOR /
NIT), the verdict (APPROVED / CHANGES_REQUIRED / BLOCKED), the finding format,
and the report structure come only from `code-review-report`. Every finding
needs a concrete file/line location and evidence.
