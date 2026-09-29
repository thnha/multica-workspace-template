# Codebase Exploration

## Purpose

Build an evidence-based understanding of the existing system
before architecture decisions are made.

---

# When to Use

Use before designing changes to an existing repository.

Skip only when designing a genuinely new system with no existing
implementation.

---

# Procedure

## 1. Establish Repository Structure

Identify relevant:

- applications
- modules
- packages
- libraries
- services
- infrastructure
- tests
- configuration

Do not inspect the entire repository without reason.

Start from the feature's likely change surface and expand as
evidence requires.

---

## 2. Locate Entry Points

Depending on the system, inspect relevant:

- controllers
- routes
- handlers
- commands
- consumers
- WebSocket handlers
- scheduled jobs
- UI entry points

---

## 3. Follow Execution Flow

Trace behavior through the system.

Example:

Request
  ->
Controller
  ->
Service
  ->
Repository
  ->
Database

or:

Client Event
  ->
WebSocket Handler
  ->
Game Service
  ->
Domain Logic
  ->
Persistence

Do not infer this flow from naming alone.

Verify it from source code.

---

## 4. Find Similar Features

Search for existing implementations with similar:

- behavior
- data lifecycle
- API shape
- validation
- authorization
- transactions
- events
- error handling

Existing project patterns are stronger evidence than generic
architectural preference.

---

## 5. Inspect Tests

Tests often reveal intended behavior not obvious from
implementation.

Inspect relevant:

- unit tests
- integration tests
- contract tests
- E2E tests
- test fixtures

---

## 6. Inspect Configuration

When relevant inspect:

- environment configuration
- dependency configuration
- database configuration
- feature flags
- security configuration
- deployment configuration

---

## 7. Record Evidence

Record important discoveries as:

CONFIRMED:
<finding>

Evidence:
<file/module/config/test>

Impact:
<why it matters>

---

# Output

Produce a concise Current Architecture section containing:

- relevant modules
- execution flow
- existing patterns
- relevant contracts
- relevant persistence
- relevant tests
- discovered constraints

Avoid documenting unrelated repository architecture.