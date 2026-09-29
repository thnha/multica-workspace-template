# Requirement Traceability

## Purpose

Ensure requirements do not disappear between specification,
implementation, and testing.

## Build the Matrix

Create mappings between:

Requirement
Business Rule
Edge Case
Acceptance Criterion

Example:

| Requirement | Acceptance Criteria |
|-------------|---------------------|
| FR-001 | AC-001 |
| FR-002 | AC-002, AC-003 |
| FR-003 | AC-004 |

In the Feature Specification, express this matrix through each acceptance
criterion's `covers` list; do not add a separate traceability table.

## Validation

Check for:

ORPHAN REQUIREMENT
A functional requirement without acceptance coverage.

ORPHAN ACCEPTANCE CRITERION
Acceptance behavior that does not correspond to any declared
requirement or rule.

CONTRADICTION
Two requirements or criteria specify incompatible behavior.

DUPLICATE
Multiple requirements describe effectively the same behavior.

## Final Gate

Do not return READY if:

- critical FRs have no AC
- ACs contradict business rules
- high-impact questions remain unresolved
- core desired behavior cannot be objectively verified