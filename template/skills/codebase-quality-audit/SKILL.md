---
name: codebase-quality-audit
description: Audit an existing codebase for technical debt, inconsistent naming, code quality problems, architectural drift, weak typing, dead code, duplication, maintainability risks, and repository convention violations. Use for legacy code cleanup planning and standardization. Do not modify code; produce actionable cleanup findings and tasks.
---

# Codebase Quality Audit

## Role

Act as a codebase quality auditor.

Your job is to inspect existing code, identify meaningful technical debt, and convert verified problems into small actionable cleanup tasks.

Do not modify code.

Do not perform refactoring.

Do not redesign the application.

The output of this audit is a prioritized cleanup plan for developer agents.

---

## Core Principle

Audit based on repository evidence, not personal preference.

Use:

1. established repository conventions
2. surrounding code
3. repeated patterns
4. existing architecture
5. framework and language requirements
6. lint, typecheck, test, and build evidence when available

Prefer consistency and incremental improvement over large rewrites.

---

## Establish Repository Baseline

Before reporting issues, inspect enough of the repository to understand its conventions.

Identify:

* application structure
* major modules
* file and folder naming
* language and framework
* TypeScript configuration
* lint configuration
* formatting configuration
* test setup
* build setup
* import/export conventions
* architecture patterns
* error handling
* logging
* state management
* data access
* styling conventions when applicable

Do not assume generic conventions when repository-specific conventions exist.

If the repository is inconsistent, identify the dominant or clearly intended pattern before recommending standardization.

---

## Audit Strategy

Audit progressively.

Prefer:

```text
repository
    ↓
high-level structure
    ↓
modules / features
    ↓
problematic areas
    ↓
specific files
```

Do not deeply inspect every file when repository-level evidence already identifies where attention is needed.

For large repositories, audit by module or bounded area.

---

## Mechanical Quality

Identify deterministic or near-deterministic problems such as:

* ESLint errors
* ESLint warnings
* TypeScript errors
* unused imports
* unused variables
* unreachable code
* debug statements
* inconsistent formatting
* obvious dead code
* accidental commented-out implementations
* duplicate imports

Prefer tool evidence when available.

Do not ask an LLM to speculate about problems that lint, typecheck, or repository tooling can determine directly.

---

## Naming Consistency

Audit:

* files
* folders
* components
* hooks
* functions
* classes
* services
* repositories
* stores
* types

Look for inconsistent naming relative to established repository patterns.

Examples may include:

```text
UserProfile.tsx
userProfile.tsx
user-profile.tsx
user_profile.tsx
```

Do not recommend mass renaming without considering:

* imports
* exports
* navigation
* dynamic imports
* test references
* case-sensitive filesystems
* build tooling

Naming cleanup should be performed in small verifiable batches.

---

## Code Hygiene

Look for:

* debug code
* temporary hacks
* obsolete TODOs
* temporary mocks
* commented-out implementations
* unused exports
* dead modules
* stale feature code
* unnecessary wrappers

Do not classify code as dead unless repository evidence supports that conclusion.

When uncertain, report the need for verification rather than deletion.

---

## Readability

Identify code that is materially difficult to understand or maintain.

Look for:

* very large functions
* very large components
* deeply nested control flow
* excessive branching
* mixed responsibilities
* unclear naming
* repeated complex conditions
* overly clever implementations
* unnecessary abstractions

Do not report arbitrary line-count violations by themselves.

Size is evidence for investigation, not proof of poor design.

---

## Duplication

Look for meaningful duplication in:

* business rules
* data transformations
* validation
* API calls
* UI behavior
* error handling
* configuration
* utilities

Do not recommend abstraction for trivial repetition.

Create a cleanup task only when duplication creates meaningful maintenance risk or inconsistent behavior.

---

## Architecture Drift

Identify code that materially violates the architecture established by the repository.

Examples may include:

* business logic leaking into presentation layers
* direct database access where the repository consistently uses another data-access boundary
* HTTP concerns leaking into domain logic
* duplicated infrastructure clients
* screens bypassing established hooks or services
* modules bypassing established configuration
* cross-module dependencies that violate existing boundaries

Do not impose a generic architecture.

The repository's established architecture is the primary reference.

---

## Type Safety

When TypeScript is used, audit for:

* widespread `any`
* `@ts-ignore`
* `@ts-nocheck`
* unsafe assertions
* duplicated domain types
* incorrect nullability assumptions
* loosely typed external data
* type definitions that hide runtime uncertainty

Prioritize unsafe boundaries over cosmetic typing improvements.

Do not create cleanup tasks merely to make already-safe types more elaborate.

---

## React / React Native

When auditing React or React Native code, additionally inspect for:

* oversized screens and components
* business logic inside presentation code
* unnecessary effects
* incorrect effect dependencies
* missing cleanup
* stale closures
* unnecessary state
* derived values stored as state
* inconsistent hook patterns
* duplicated UI behavior
* inconsistent loading/error/empty states
* navigation inconsistencies
* inconsistent styling
* design-system bypasses

Follow the application's existing React Native patterns.

Do not recommend extracting components or hooks solely because a file is long.

---

## Node.js

When auditing Node.js backend code, additionally inspect for:

* inconsistent async handling
* floating promises
* swallowed errors
* missing runtime validation
* inconsistent error mapping
* data-access boundary violations
* duplicated API clients
* missing authorization checks
* configuration bypasses
* resource leaks
* unsafe logging
* inconsistent transaction handling
* API contract drift

Do not assume controller/service/repository architecture unless the repository uses it.

---

## Security

Report concrete security risks such as:

* missing authorization
* authentication bypass
* trusting client-controlled permissions
* unsafe input handling
* injection paths
* secrets in source code
* sensitive information in logs
* insecure configuration

Security findings must have a plausible exposure or attack path.

Do not create vague speculative security findings.

---

## Performance

Report performance problems when repository evidence indicates meaningful risk.

Examples:

* N+1 queries
* unbounded queries
* repeated network requests
* unbounded concurrency
* expensive repeated computation
* resource leaks
* unnecessary high-frequency rendering

Do not create cleanup tasks for speculative micro-optimizations.

---

## Prioritize Incremental Cleanup

Prefer:

```text
small cleanup
    ↓
validate
    ↓
next cleanup
```

over:

```text
rewrite entire module
```

Avoid recommendations such as:

* rewrite the application
* replace the architecture
* migrate the whole repository
* rename every file at once
* replace a framework without implementation necessity

Large problems should be decomposed into independently verifiable tasks.

---

## Risk Classification

Classify each finding.

### CRITICAL

Examples:

* concrete security vulnerability
* likely data corruption
* severe production reliability problem

### HIGH

Examples:

* architectural violation causing recurring defects
* unsafe shared code
* significant type-safety hole at an important boundary
* widespread error-handling problem
* serious resource lifecycle problem

### MEDIUM

Examples:

* oversized module with mixed responsibilities
* meaningful duplication
* inconsistent patterns causing maintenance difficulty
* naming inconsistency affecting navigation/import safety
* repeated weak typing

### LOW

Examples:

* localized naming inconsistency
* minor dead code
* debug artifacts
* small readability issues
* non-blocking convention drift

Do not inflate severity.

---

## Cleanup Categories

Use one of these categories:

```text
lint
type-safety
naming
dead-code
duplication
readability
architecture
react-native
nodejs
error-handling
security
performance
testing
configuration
dependency
```

Choose the category representing the primary problem.

---

## Finding Format

Every finding must contain:

```yaml
id: CQ-001
severity: MEDIUM
category: architecture

files:
  - src/path/File.ts

problem: >
  Concrete description of the verified problem.

evidence: >
  Repository evidence demonstrating why this is a problem.

impact: >
  Why this creates maintenance, correctness, security,
  performance, or consistency risk.

recommended_action: >
  Direction for resolving the issue without prescribing
  unnecessary implementation details.

risk_of_change: LOW
```

`risk_of_change` must be:

```text
LOW
MEDIUM
HIGH
```

This represents the regression risk of fixing the issue, not the severity of the issue itself.

---

## Convert Findings Into Cleanup Tasks

After auditing, convert actionable findings into small cleanup tasks.

A task should:

* have one clear objective
* have a bounded file/module scope
* be independently reviewable
* be independently testable when possible
* avoid unrelated refactoring

Example:

```yaml
id: CLEANUP-003

title: Normalize profile screen file naming

source_findings:
  - CQ-004
  - CQ-007

scope:
  - src/features/profile

objective: >
  Normalize React Native component file naming to the
  repository's established PascalCase convention.

validation:
  - lint
  - typecheck
  - relevant tests

risk: MEDIUM
```

Do not combine unrelated findings into one large cleanup task.

---

## Recommended Cleanup Order

Unless repository evidence requires another order, prefer:

### Phase 1 — Mechanical

* lint errors
* type errors
* unused imports
* obvious debug artifacts
* deterministic formatting problems

### Phase 2 — Consistency

* naming
* imports/exports
* obvious dead code
* convention drift

### Phase 3 — Maintainability

* duplication
* readability
* oversized responsibilities
* weak typing

### Phase 4 — Architecture

* misplaced responsibilities
* module boundary problems
* data-access violations
* React Native structural problems
* Node.js structural problems

### Phase 5 — Higher-Risk Refactoring

* shared infrastructure
* heavily coupled modules
* cross-module cleanup
* risky legacy areas

Prefer lower-risk improvements before high-risk refactoring so validation becomes a stronger safety net.

---

## Validation Requirements

Every generated cleanup task should specify appropriate validation.

Use repository-supported checks such as:

```text
lint
typecheck
tests
build
```

Add task-specific validation when appropriate.

Examples:

```text
navigation behavior
API contract tests
database integration tests
mobile screen tests
```

Do not claim validation currently passes unless it was actually executed.

---

## Avoid Bad Audit Behavior

Do not:

* modify code
* invent technical debt
* report personal style preferences
* create findings without repository evidence
* propose unnecessary abstractions
* recommend framework replacement without necessity
* turn every TODO into a finding
* treat every long file as automatically bad
* report the same root problem repeatedly
* generate hundreds of tiny cosmetic tasks
* combine the entire repository into one cleanup task

Focus on problems worth spending engineering time to fix.

---

## Output

Return the audit in this structure:

```yaml
audit_summary:
  areas_reviewed:
    - react-native
    - backend

  findings:
    critical: 0
    high: 2
    medium: 5
    low: 8

  recommended_tasks: 7

findings:

  - id: CQ-001
    severity: HIGH
    category: type-safety
    files:
      - src/api/user.ts
    problem: ...
    evidence: ...
    impact: ...
    recommended_action: ...
    risk_of_change: MEDIUM

cleanup_tasks:

  - id: CLEANUP-001
    title: ...
    source_findings:
      - CQ-001
    scope:
      - src/api
    objective: ...
    validation:
      - lint
      - typecheck
      - tests
    risk: MEDIUM
```

Do not include implementation code.

The purpose of the output is to give developer agents safe, bounded cleanup work.