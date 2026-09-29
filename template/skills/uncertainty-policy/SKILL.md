# Uncertainty Policy

## Principle

Unknown information must remain explicitly unknown.

Never invent information merely to continue a workflow.

## Classification

Information must be treated as one of:

CONFIRMED
INFERRED
ASSUMED
UNKNOWN

## Low-impact uncertainty

If the uncertainty does not materially affect:

- product behavior
- architecture
- security
- data
- public contracts

an explicit assumption may be used.

The assumption must be recorded.

## High-impact uncertainty

Do not make an autonomous assumption when uncertainty can
materially affect:

- product behavior
- business rules
- authentication
- authorization
- security
- money
- virtual economy
- persistent data
- public APIs
- protocols
- destructive operations
- compatibility

Create an open question or blocker instead.

## Conflicting Evidence

When evidence conflicts:

1. Do not arbitrarily select one source.
2. Record the conflict.
3. Identify the affected work.
4. Request clarification when the conflict is material.