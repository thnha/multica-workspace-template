---
name: qa-testing
description: Plan and execute focused QA for an implemented feature - test planning, functional testing against acceptance criteria, and targeted regression testing with observable evidence.
---

# QA Testing

## 1. Plan

Identify what must be validated before the feature can be accepted, using the
requirements, business rules, acceptance criteria, edge cases, changed behavior,
integration points, and regression risk.

Define scenarios for happy paths, validation failures, error paths, boundary
conditions, and important state transitions. Prioritize by impact and
likelihood; skip tests that do not meaningfully improve confidence.

## 2. Functional testing

For each important scenario record preconditions, action, expected behavior,
actual behavior, and resulting state.

Cover normal flows, business rules, validation, error handling, permissions
when relevant, API or integration behavior, and important edge cases.

Mark each result PASS, FAIL, BLOCKED, or NOT_RUN. Never mark an unverified
scenario PASS. Record concrete evidence for every failure.

## 3. Regression testing

Identify existing behavior the change could affect: directly modified
components, shared modules, dependent workflows, API contracts, persisted
state, authentication and authorization, navigation or lifecycle behavior, and
integrations.

Select regression scenarios from actual impact; do not run unrelated suites
without a clear dependency or risk. Report any behavior that changed
unexpectedly.

Report results with the `qa-test-report` template.
