# Architecture Analysis

## Purpose

Determine how a feature should fit into the existing system.

---

# Inputs

- Feature Specification
- codebase exploration findings
- project architecture documentation
- constraints

---

# Procedure

## 1. Identify Responsibilities

Determine which existing component should own each required
behavior.

Avoid creating a new component when an existing component has
the correct responsibility.

---

## 2. Identify Boundaries

Determine relevant boundaries between:

- client/server
- controller/service
- domain/persistence
- service/service
- synchronous/asynchronous processing
- internal/external systems

---

## 3. Analyze Data Flow

Document relevant flow.

Example:

Client
  ->
API
  ->
Application Service
  ->
Domain Rule
  ->
Transaction
  ->
Persistence
  ->
Response

Identify trust and transaction boundaries.

---

## 4. Determine Required Changes

Classify changes:

NEW

MODIFY

REUSE

REMOVE

Avoid REMOVE unless explicitly justified.

---

## 5. Evaluate Alternatives

For material decisions with multiple realistic approaches,
compare:

- fit with existing architecture
- complexity
- correctness
- operational cost
- compatibility
- testability
- migration risk

Do not choose technology because it is newer or more fashionable.

---

## 6. Record Architecture Decisions

Use:

### AD-001 — <Decision>

Status:
PROPOSED | ACCEPTED | BLOCKED

Requirements:
FR-...

Current State:
...

Decision:
...

Rationale:
...

Alternatives:
...

Consequences:
...

Risks:
...

---

# Completion

Architecture analysis is complete when the implementation
strategy is clear enough for planning without requiring the
Planner to invent architectural decisions.