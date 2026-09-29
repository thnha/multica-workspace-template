---
name: backend-concurrency
description: Implement and verify Node.js backend operations whose correctness depends on concurrent requests, retries, duplicate delivery, atomic state changes, multiple processes, or distributed execution.
---

# Backend Concurrency

## Identify the Invariant

First state what must remain true.

Examples:

- a lesson completion is recorded at most once per learner and lesson
- an exercise attempt is stored at most once per attempt ID
- only one active session record exists
- event is processed at most once logically

Do not begin with a locking mechanism.

Begin with the invariant.

## Identify the Race

Write the competing operations explicitly.

Example:

Request A reads not-completed
Request B reads not-completed
Request A inserts completion
Request B inserts completion

Determine where correctness can break.

## Determine Execution Scope

Establish whether concurrency may occur across:

- async operations in one request
- requests in one Node.js process
- multiple Node.js processes
- multiple containers or servers
- workers
- duplicate messages

Process-local state or mutexes cannot provide distributed
correctness when multiple processes may execute the operation.

## Use Approved Coordination

Follow the concurrency strategy from the Technical Design.

Possible mechanisms depend on the actual persistence and system
architecture and may include:

- atomic database operation
- uniqueness constraint
- transaction
- optimistic concurrency
- distributed coordination
- idempotency record

Do not replace the approved strategy with a preferred mechanism
without escalation.

## Retries

Consider:

1. operation fails before mutation
2. mutation succeeds but response is lost
3. caller retries
4. dependency times out with unknown outcome
5. duplicate message is delivered

Determine whether retry can safely repeat the operation.

## Idempotency

When idempotency is required identify:

- operation identity
- scope
- persistence
- duplicate response behavior
- retention if relevant

Do not rely only on in-memory deduplication when correctness
must survive restart or multiple instances.

## External Side Effects

Database transactions do not automatically roll back:

- HTTP calls
- messages already published
- emails
- push notifications
- external payments

Follow the approved design for side-effect consistency.

## Validation

For concurrency-sensitive behavior, prefer tests capable of
exercising real competing operations.

Verify the invariant, not merely that all requests returned.

Example:

20 concurrent completion requests
→ exactly one completion record

Record evidence of the resulting state.