---
name: nodejs-backend
description: Implement production-quality backend behavior in an existing Node.js JavaScript or TypeScript codebase while preserving its framework, architecture, module, async, error-handling, configuration, dependency, naming, and quality conventions. Use for Node.js backend implementation tasks.
---

# Node.js Backend

## Core Principle

Write code that looks like it was written by the existing team.

Prioritize:

1. correctness
2. consistency
3. readability
4. maintainability
5. simplicity

Working code alone is not sufficient.

Do not replace repository conventions with generic Node.js preferences.

---

## Inspect the Runtime

Before implementation determine from repository evidence:

* Node.js version or supported range
* JavaScript or TypeScript
* package manager
* module system
* framework
* application structure
* build process
* linting setup
* test framework

Useful evidence may include:

* package.json
* lockfiles
* tsconfig files
* runtime configuration
* Dockerfiles
* CI configuration
* framework configuration
* ESLint configuration

Do not change runtime, package manager, framework, or module system unless required.

---

## Inspect Existing Patterns First

Before writing code, inspect nearby files and at least one similar implementation when available.

Identify:

* file and folder naming
* module structure
* routes
* controllers or handlers
* services
* repositories and data access
* middleware
* validation
* authentication and authorization
* error handling
* logging
* configuration
* tests

Follow existing repository conventions.

Do not invent a new pattern when an established pattern already exists.

---

## Understand Application Structure

Identify how the project organizes responsibilities.

Examples may include:

* routes
* controllers
* handlers
* services
* domain modules
* repositories
* middleware
* jobs
* consumers

Do not force a generic controller/service/repository structure onto a repository using another architecture.

Respect existing architectural boundaries.

Do not move responsibilities between layers unless required by the implementation.

---

## Naming

Follow naming conventions already established by the repository.

Repository conventions take precedence over generic preferences.

Keep file naming consistent with neighboring modules.

Use descriptive names that communicate domain intent.

Prefer:

```ts id="0hwtqd"
const userRepository = ...
const createPayment = ...
const subscriptionStatus = ...
const isUserEligible = ...
```

Avoid vague names when meaningful names are available:

```ts id="byqfe8"
const data = ...
const data2 = ...
const temp = ...
const obj = ...
const flag = ...
const fn = ...
```

Do not introduce a new naming style into an existing module.

---

## Follow Existing Dependency Patterns

Inspect how dependencies are:

* imported
* instantiated
* injected
* mocked
* configured

Follow the established pattern.

Avoid introducing a new dependency injection or module pattern for a local task.

Reuse existing services, clients, utilities, repositories, and infrastructure when appropriate.

---

## TypeScript

When the repository uses TypeScript, maintain strong typing.

Do not use these as shortcuts:

```ts id="f6gffz"
any
@ts-ignore
@ts-nocheck
```

Do not bypass type errors merely to make the implementation compile.

Avoid unnecessary type assertions used only to silence the compiler.

Prefer existing domain types instead of recreating equivalent types.

When data comes from an uncertain runtime source, validate or narrow it rather than pretending it already has the expected type.

Remove:

* unused imports
* unused variables
* dead code
* obsolete commented-out code

---

## Async Behavior

Identify the project's conventions for:

* async functions
* promises
* error propagation
* parallel operations
* cancellation
* timeouts
* cleanup

Ensure asynchronous work is intentionally:

* awaited
* returned
* scheduled
* or explicitly detached

Do not accidentally create fire-and-forget operations.

Do not leave floating promises.

When parallelizing work, verify that operations are independent and concurrency is bounded when necessary.

Do not introduce concurrency when ordering or transactional behavior matters.

---

## Input Validation

Treat external input as untrusted.

When relevant validate:

* request bodies
* route parameters
* query parameters
* headers
* webhook payloads
* queue messages
* external API responses

Use the project's existing validation mechanism.

Do not introduce another validation library when the repository already has one.

Do not rely solely on TypeScript types for runtime validation.

---

## Error Handling

Inspect existing error conventions before implementing.

Determine:

* where errors are created
* how they propagate
* how they are mapped to external responses
* how they are logged
* which errors are expected domain failures

Do not swallow unexpected errors.

Avoid:

```ts id="64m7dm"
try {
  await operation();
} catch {}
```

Do not expose internal implementation details through public errors unless the existing contract requires them.

Preserve useful error context.

Use existing domain errors, application errors, middleware, and response mapping when available.

---

## Configuration

Use the project's existing configuration mechanism.

Do not:

* hardcode environment-specific values
* introduce new environment variables unnecessarily
* read environment variables directly throughout the codebase when the project centralizes configuration

When adding configuration, follow existing validation and default-value conventions.

Never hardcode secrets or credentials.

---

## Dependencies

Prefer existing dependencies and platform capabilities when they adequately solve the task.

Before adding a package, verify:

1. existing project functionality cannot reasonably handle it
2. the dependency is required by the approved implementation
3. it is compatible with the project runtime
4. adding it does not unnecessarily duplicate existing tooling

Do not upgrade unrelated dependencies.

Do not add a dependency merely to avoid writing a small amount of straightforward code.

---

## Resource Lifecycle

When relevant verify correct lifecycle handling for:

* database connections
* streams
* timers
* subscriptions
* event listeners
* sockets
* child processes

Avoid:

* resource leaks
* duplicate registrations
* unclosed handles
* forgotten cleanup

---

## Logging

Follow the repository's existing logging conventions.

Use the existing logger when one is available.

Avoid introducing raw:

```ts id="0ak6m5"
console.log(...)
console.error(...)
```

when the application uses structured logging.

Never log sensitive values such as:

* passwords
* access tokens
* refresh tokens
* API secrets
* private keys
* authorization headers

Log useful operational context without unnecessarily exposing user or internal data.

---

## Keep Code Focused

Keep functions and modules focused on clear responsibilities.

Avoid functions that unnecessarily mix:

* validation
* business logic
* persistence
* external API calls
* response formatting

Extract logic when doing so improves readability, testability, or reuse.

Do not create abstractions solely to reduce line count.

Prefer straightforward code over clever code.

Avoid deeply nested control flow when a simpler structure is available.

---

## Keep Code Clean

Do not leave accidental development artifacts:

```text id="xy2i5n"
console.log
debugger
temporary mocks
temporary variables
commented-out implementations
unused imports
unused code
```

Do not leave TODO comments as a substitute for completing required work.

A TODO is acceptable only when it represents intentional future work outside the current task.

---

## Covered by Other Skills

Use these instead of repeating their rules here:

* data access, transactions, queries, schema changes → `backend-persistence`
* API contracts, trust boundaries, authentication and authorization → `backend-api-development`
* races, retries, idempotency → `backend-concurrency`
* backend tests → `backend-testing`
* self review of the diff → `self-code-review`
* validation commands and evidence → `implementation-validation`; for Node.js
  run at least the repository's lint, TypeScript typecheck, and relevant tests
  when available, with no new lint warnings
* scope, security, and completion → `engineering-core`
