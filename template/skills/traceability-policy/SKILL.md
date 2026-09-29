# Traceability Policy

## Principle

Important behavior must remain traceable throughout the
development lifecycle.

## Required Chain

Feature
  ↓
Requirement
  ↓
Technical Design
  ↓
Implementation Task
  ↓
Code Change
  ↓
Test
  ↓
Acceptance Criterion

## Requirement IDs

Use stable identifiers.

Examples:

FR-001
BR-001
NFR-001
EC-001
AC-001

## Implementation

Implementation tasks should reference the requirements they
satisfy.

Example:

TASK-004

Requirements:
FR-002
FR-003

Acceptance Criteria:
AC-003
AC-004

## Testing

Tests should identify the behavior or acceptance criterion they
verify when practical.

## Missing Coverage

A critical requirement without validation coverage prevents
completion.

## Orphan Changes

Code changes with no relationship to approved requirements,
technical necessities, or bug fixes must be investigated.


Apply the chain to stages required by the selected complexity route. Record
omitted design/planning stages as not applicable with the classification reason;
do not create otherwise unnecessary stages merely to populate the chain.
