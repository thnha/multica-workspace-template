---
name: code-change-analysis
description: Analyze existing code before implementation to identify execution flow, established patterns, contracts, tests, risks, and the smallest safe change surface. Use before modifying unfamiliar or cross-cutting code.
---

# Code Change Analysis

## Goal

Determine what must change and what must remain untouched before
editing code.

## Procedure

### 1. Locate the behavior

Start from the task's observable behavior.

Find the relevant entry point and trace the actual execution
path.

Examples may include:

Client
→ state
→ API
→ handler
→ service
→ persistence

or the equivalent architecture used by the repository.

Verify the flow from code rather than naming assumptions.

### 2. Find existing patterns

Search for nearby or similar implementations.

Inspect relevant patterns for:

- validation
- error handling
- state management
- persistence
- transactions
- networking
- logging
- configuration
- testing

Prefer existing project patterns unless the approved design
explicitly replaces them.

### 3. Identify the change surface

Classify relevant areas as:

**MUST CHANGE**
Required to satisfy the task.

**MAY CHANGE**
Potential supporting changes; verify necessity before editing.

**MUST NOT CHANGE**
Explicitly outside task scope or required for compatibility.

**UNKNOWN**
Requires additional investigation.

Do not modify UNKNOWN areas until their role is understood.

### 4. Identify contracts

Check whether the change touches:

- public or internal APIs
- shared types
- database schemas
- persisted formats
- WebSocket messages
- events
- external integrations
- configuration contracts

Record compatibility-sensitive contracts.

### 5. Inspect tests

Find tests covering:

- current behavior
- behavior being changed
- adjacent regression-sensitive behavior

Use them to understand both intended behavior and project test
conventions.

### 6. Identify risks

Consider only relevant risks:

- shared/high fan-out code
- async execution
- transactions
- concurrency
- retries
- lifecycle behavior
- persistence
- compatibility
- security boundaries
- external dependencies

## Result

Before implementation, the Developer should know:

- existing execution flow
- established implementation pattern
- smallest expected change surface
- affected contracts
- relevant tests
- material implementation risks

Do not produce a separate artifact unless the task or workflow
requires one.