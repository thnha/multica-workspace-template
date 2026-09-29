---
name: implementation-validation
description: Validate an implementation using repository-defined build, static analysis, test, integration, migration, and regression checks, and record execution evidence without treating unexecuted checks as passed.
---

# Implementation Validation

## Goal

Produce objective evidence for the validation required by the
assigned task.

## 1. Discover commands

Find existing validation commands from repository evidence such
as:

- package scripts
- build configuration
- Makefile
- CI configuration
- project documentation
- existing scripts

Do not invent project commands when they can be discovered.

## 2. Determine required checks

Use:

- task validation requirements
- Technical Design
- project standards
- implementation risk

Possible checks include:

- compile
- build
- lint
- type check
- unit tests
- integration tests
- contract tests
- concurrency tests
- migration tests
- E2E tests
- regression tests

Do not run every category automatically.

Use the checks relevant to the change and required gates.

## 3. Validate incrementally

Prefer:

targeted validation
→ affected integration boundary
→ required broader regression

This makes failures easier to diagnose.

## 4. Record execution evidence

For every executed check record:

**Check:**  
<validation>

**Command:**  
<actual command>

**Result:**  
PASS | FAIL

**Evidence:**  
<concise relevant output>

Do not include excessive logs when a concise result is enough.

## 5. Unavailable checks

When a required check cannot execute:

**Result:** NOT VERIFIED

Record:

- reason
- affected validation
- risk
- required follow-up

Examples include unavailable:

- credentials
- service
- infrastructure
- simulator/device
- environment

Never report an unavailable check as PASS.

## 6. Baseline failures

If the same failure existed before implementation, classify it
as a pre-existing failure when evidence supports that
classification.

Determine whether the new change introduces additional failure.

Do not ignore a failure merely because it appears unrelated.

## Validation Summary

Use a compact matrix when useful:

| Check | Required | Result |
|---|---|---|
| Build | YES | PASS |
| Unit | YES | PASS |
| Integration | YES | PASS |
| E2E | NO | N/A |

Allowed results:

- PASS
- FAIL
- NOT VERIFIED
- N/A
- PRE-EXISTING FAILURE

A required FAIL or NOT VERIFIED prevents verified completion
unless the workflow explicitly assigns that gate to a later
stage.