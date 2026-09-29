# Ambiguity Detection

## Purpose

Prevent agents from silently inventing missing product decisions.

## Search For

Words such as:

- normally
- quickly
- appropriate
- automatically
- periodically
- recent
- active
- valid
- nearby
- enough
- large
- small

Determine whether their meaning is defined.

## Detect Missing Decisions

Check whether the feature requires decisions about:

- ownership
- permissions
- time zones
- reset boundaries
- retry behavior
- failure behavior
- ordering
- duplicate operations
- persistence
- limits
- default values
- compatibility

## Classification

### Low-impact ambiguity

Implementation choice does not materially change product
behavior.

Record an explicit assumption when necessary.

### High-impact ambiguity

Different interpretations would materially change product
behavior, data, security, protocol, or architecture.

Create an Open Question.

Do not silently choose.

## Output

Q-001:
<Question>

Impact:
<why this matters>

Possible interpretations:
- ...
- ...

Affected requirements:
FR-...

The Feature Specification cannot be READY while unresolved
high-impact questions remain.