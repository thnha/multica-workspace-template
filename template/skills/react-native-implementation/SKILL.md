---
name: react-native-implementation
description: "Implement production-quality React Native features and fixes using the repository's existing architecture, components, hooks, navigation, state management, data layer, styling, naming conventions, and quality standards."
---

# React Native Implementation

## Core Principle

Write code that looks like it was written by the existing team.

Prioritize:

1. correctness
2. consistency
3. readability
4. maintainability
5. simplicity

Do not optimize for merely making the task work.

---

## Inspect Existing Patterns First

Before writing code, inspect nearby files and at least one similar implementation when available.

Identify:

* file and folder naming
* screens and components
* hooks
* navigation
* state management
* API and data access
* forms
* storage
* styling and design system
* error handling
* testing patterns

Follow existing repository conventions.

Do not invent a new pattern when an established pattern already exists.

---

## Naming

Follow naming conventions already established by the repository.

When the repository does not establish a convention, use these defaults.

### Components and Screens

Use PascalCase:

```text
ProfileScreen.tsx
UserCard.tsx
PaymentMethodItem.tsx
```

### Hooks

Use `useCamelCase`:

```text
useAuth.ts
useProfile.ts
usePaymentMethods.ts
```

### Services

Use camelCase:

```text
auth.service.ts
payment.service.ts
```

### Stores

Use camelCase:

```text
auth.store.ts
profile.store.ts
```

### Types

Use camelCase:

```text
user.types.ts
payment.types.ts
```

Do not introduce inconsistent naming styles.

Names must describe intent.

Avoid vague names such as:

```text
data
data2
temp
flag
fn
obj
item2
```

when a meaningful domain name is available.

---

## Implement Behavior

Prefer existing:

* components
* hooks
* services
* utilities
* state patterns
* navigation patterns
* types
* design tokens

Do not introduce new abstractions without implementation need.

Do not add dependencies when the task can reasonably be implemented using the existing stack.

Keep changes scoped to the assigned task.

Do not refactor unrelated code unless required for correctness.

---

## TypeScript

Maintain strong typing.

Do not use these as shortcuts:

```ts
any
@ts-ignore
@ts-nocheck
```

If an existing external API genuinely requires unsafe typing, isolate it and document why.

Do not bypass a type error merely to make the implementation compile.

Prefer existing domain types instead of recreating equivalent types.

Remove:

* unused imports
* unused variables
* dead code
* obsolete commented-out code

---

## Components

Keep components focused on a clear responsibility.

Avoid large components containing unrelated UI, business logic, networking, transformations, and state management together.

Extract logic when doing so makes the code easier to understand or reuse.

Prefer simple composition over large monolithic components.

Avoid deeply nested conditional rendering.

Prefer early returns when they improve readability.

---

## Handle React Lifecycle

Ensure:

* hooks follow React rules
* effect dependencies are intentional
* subscriptions, listeners, and timers are cleaned up
* async work handles component lifecycle safely
* derived values are not unnecessarily stored in state

Do not add `useEffect`, `useMemo`, or `useCallback` automatically.

Use them only when they have a clear purpose.

---

## Handle UI States

Cover relevant:

* loading
* error
* empty
* success
* disabled
* retry states

Do not leave the UI in an ambiguous state during asynchronous operations.

Follow existing application patterns for loading and error handling.

---

## Preserve Navigation

Check:

* route names
* route parameters
* back behavior
* screen lifecycle
* deep-link behavior

Do not change navigation contracts unless required.

Use existing navigation types when available.

Do not duplicate route definitions.

---

## Styling

Follow the styling system already used by the repository.

Reuse existing:

* colors
* spacing
* typography
* design tokens
* shared components
* layout primitives

Do not introduce another styling approach.

Avoid large inline style objects when the repository uses extracted styles.

Do not hardcode design values when an appropriate design token already exists.

UI added to an existing screen should visually follow the surrounding implementation.

---

## Error Handling

Do not silently swallow errors.

Avoid:

```ts
try {
  await save();
} catch {}
```

Follow the repository's existing error-handling strategy.

Handle user-visible failures appropriately.

Do not hide unexpected errors merely to keep the UI running.

---

## Keep Code Clean

Do not leave accidental development artifacts:

```text
console.log
debugger
temporary mocks
temporary variables
commented-out implementations
unused imports
unused code
```

Do not leave TODO comments as a substitute for completing required work.

A TODO is acceptable only when it represents intentional future work outside the current task.

---

## Self Review

After implementation, inspect every changed file.

Check for:

* inconsistent naming
* unnecessary complexity
* duplicated logic
* oversized components
* incorrect hook usage
* unnecessary effects
* weak TypeScript types
* unused imports
* dead code
* debug statements
* unrelated changes

Fix issues before declaring the implementation complete.

---

## Validate

Run the repository's available validation commands relevant to the change.

At minimum, when available:

1. ESLint
2. TypeScript typecheck
3. relevant tests

Do not declare the task complete when required validation fails.

Do not introduce new ESLint warnings.

Target:

```text
ESLint:     0 errors, 0 new warnings
TypeScript: PASS
Tests:      PASS
```

Never claim a validation step passed unless it was actually executed.

If a validation command cannot be executed, explicitly report that fact.

---

## Definition of Done

Implementation is complete only when:

* requested behavior is implemented
* existing architecture is respected
* repository naming conventions are respected
* code is readable and maintainable
* no unnecessary abstractions were introduced
* no accidental debug code remains
* no new ESLint warnings were introduced
* TypeScript validation passes when available
* relevant tests pass when available

Working code alone is not sufficient.
