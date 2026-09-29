# Scope and Change Policy

## Principle

Change only what is necessary to satisfy approved requirements.

## Scope

Every implementation change must be traceable to at least one:

- requirement
- accepted technical requirement
- bug cause
- required test
- approved refactoring task

## Unrelated Changes

Do not perform unrelated:

- refactoring
- cleanup
- renaming
- dependency upgrades
- architecture changes
- formatting
- optimization

Create a separate task when such work is valuable.

## Existing Behavior

Behavior outside approved scope must remain unchanged.

## Scope Expansion

If implementation reveals additional required work:

1. Stop expanding silently.
2. Document the discovered requirement.
3. Explain its impact.
4. Update the plan/spec when required.
5. Obtain the appropriate approval before continuing.

## Destructive Changes

Destructive changes require explicit justification and approval.

Examples:

- dropping data
- deleting schemas
- breaking API contracts
- removing compatibility
- destructive migrations