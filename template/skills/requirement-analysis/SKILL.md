# Requirement Analysis

## Purpose

Transform incomplete product requests into explicit,
testable software requirements.

## Procedure

### 1. Identify the outcome

Determine:

- Who wants the feature?
- What should they be able to accomplish?
- Why is the capability needed?
- What observable behavior should change?

Do not begin from implementation.

Bad:

"Create a Redis cache."

Better:

"Repeated requests for learner profile data should avoid
unnecessary database reads while preserving current data
consistency requirements."

### 2. Identify actors

Examples:

- anonymous user
- authenticated learner
- administrator
- mobile app
- backend service
- scheduled process
- external service

### 3. Establish current behavior

When project evidence is available, inspect it.

Distinguish:

CONFIRMED:
Supported by repository, documentation, or provided context.

ASSUMED:
Reasonable but not verified.

UNKNOWN:
Cannot currently be determined.

Never describe assumed behavior as confirmed behavior.

### 4. Define desired behavior

Create functional requirements.

Each requirement must:

- represent one meaningful behavior
- use a stable identifier
- avoid implementation details unless they are actual constraints
- be testable

Example:

FR-001:
The authenticated learner can see which lessons in a unit they
have completed.

FR-002:
The authenticated learner can mark a lesson as completed.

FR-003:
Completing the same lesson again does not create a second
completion record for that learner.

### 5. Extract business rules

Business rules describe rules of the product/domain rather than
software structure.

Example:

BR-001:
A lesson counts as completed once per learner; later completions
only update the last-completed time.

BR-002:
Progress timestamps use server time.

### 6. Identify non-functional requirements

Consider when relevant:

- security
- performance
- reliability
- observability
- compatibility
- idempotency
- consistency
- scalability
- accessibility

Do not invent arbitrary targets.

If a numerical target has not been provided, identify it as an
open question rather than fabricating one.

### 7. Define non-goals

Explicitly identify nearby functionality that this feature does
not intend to change.

This protects implementation from unnecessary scope expansion.

## Completion Check

Before finishing verify:

- Every core behavior has an FR.
- Business rules are separated from FRs.
- Unknown behavior is not represented as fact.
- Non-goals are explicit.
- Requirements describe behavior rather than preferred code.