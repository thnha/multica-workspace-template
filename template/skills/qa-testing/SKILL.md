---
name: qa-testing
description: Plan and execute focused, risk-based QA for an implemented feature - short risk plan, batched execution, functional and exploratory testing against acceptance criteria, fix verification and targeted regression with observable evidence.
---

# QA Testing

Goal: find meaningful defects efficiently and give evidence about product risk.
Optimize for coverage of important failure modes and reproducible findings, not
for the number of cases, commands or bugs.

## 1. Understand what should happen

Before writing or running cases:

- Read the acceptance criteria, contracts, user journeys and the change (PR
  diff summary). Reference them by ID; do not restate them.
- Identify affected users, roles, states, data, dependencies and neighboring
  features.
- Inspect existing tests for the changed area: what they actually assert and
  where coverage is weak. Do not re-run what they already prove at a higher,
  more expensive level unless the risk is integration or device behavior.
- Expected behavior comes from requirements, contracts and invariants. The
  implementation is evidence of current behavior, not the definition of correct.
- Separate confirmed requirements from assumptions. State assumptions; ask only
  when the answer changes whether an observation is a bug.

## 2. Short risk-based plan (written once, in the planning run)

Write a compact table, at most ~10 rows. Each row investigates a distinct risk,
requirement, boundary or transition; merge rows that give the same information.
No exhaustive case catalog.

| ID | Area / journey | Failure hypothesis | Impact × likelihood | Approach (level) | Expected evidence | Batch | Status |
|---|---|---|---|---|---|---|---|

Prioritize by user impact, likelihood, recent change, complexity and
uncertainty: data loss, authorization, wrong results and broken primary journeys
before cosmetic variations.

Add under the table: scope and exclusions, which rows are required for
acceptance, the batch split (see agent instructions), the time budget and the
stopping conditions.

Failure dimensions to consider (a thinking aid, not a checklist): primary
journeys; roles and ownership; input boundaries; state transitions; repetition
and concurrency (double tap, retry, parallel requests); partial failure and
recovery; persistence and consistency (survives reload / new session); navigation
and lifecycle (back, background/foreground, reopen); data interactions; device,
locale and realistic data volume. Use equivalence partitioning, boundary values,
state-transition tests and decision tables to cut redundant inputs.

## 3. Execute: smoke, planned checks, exploration

- Start each execution batch with a small smoke check that the build and the
  critical journey work.
- Use the lowest-cost level that can establish the behavior: unit, then
  integration/API, then UI/device. Use device or end-to-end only where
  integration or user interaction is the risk.
- For each case record preconditions, action, expected, actual, resulting state.
  Mark PASS, FAIL, BLOCKED or NOT_RUN. Never mark an unverified case PASS; a
  device case without device evidence is NOT_RUN or BLOCKED.
- Exploratory session: one-line charter, e.g. "Explore seek from transcript
  under rapid repeated taps to discover desynced highlight or double scroll".
  Vary order, role, state, timing and data, not only form values.
- After a defect, check nearby states and paths for the same mechanism, bounded
  to the current batch.
- Keep observed defects separate from suspicions inferred from code reading;
  label suspicions `SUSPECTED (not reproduced)`.
- Re-rank remaining rows as evidence changes; do not finish low-value rows just
  because they were listed first.
- Reuse existing fixtures and tooling; do not build a new framework. Do not turn
  every exploratory observation into a new automated test.
- After two unsuccessful attempts with the same setup or reproduction approach,
  change the hypothesis or method; no identical retry loop.

## 4. Verify fixes without restarting everything

- Re-run the original reproduction on the new head, then the relevant failure
  and boundary behavior, then adjacent paths the delta touches.
- Keep earlier results only for cases the delta cannot affect, and say so.
- Broaden regression only for a concrete dependency risk or a required gate.
- Never rewrite expected results to match a faulty implementation or weaken
  assertions to make a test pass.
- Separate environment failures and flaky checks from product defects and keep
  the evidence of unresolved uncertainty.

## 5. Regression

Select regression from actual impact: changed components, shared modules,
dependent workflows, API contracts, persisted state, auth, navigation/lifecycle,
integrations. Do not run unrelated suites without a clear dependency or risk.
Run a full suite only when a repository gate requires it or the change's reach
justifies it.

## 6. Stop and report honestly

A pass ends when its budget is spent, its selected risks are adequately
investigated, or a blocker prevents progress. A number of bugs found or cases
passed is never a stopping condition or proof of quality. Write conclusions
narrowly: "No defects observed in the tested scenarios", never "bug-free",
"fully tested" or "ready to release".

Report results with the `qa-test-report` template.
