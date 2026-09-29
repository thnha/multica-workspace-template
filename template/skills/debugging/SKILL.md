---
name: debugging
description: Diagnose reproducible implementation, test, build, runtime, or environment failures systematically before changing code. Use when validation fails or observed behavior differs from expected behavior.
---

# Debugging

## Principle

Understand the failure before changing code.

Avoid speculative edit-and-retry loops.

## Workflow

### 1. Observe

Capture the smallest useful failure evidence:

- command or action
- error
- stack trace
- failing test
- relevant logs
- expected behavior
- actual behavior

### 2. Reproduce

Find the smallest reliable reproduction.

Confirm whether the failure is deterministic.

### 3. Classify

Use one of:

**IMPLEMENTATION**
The current change introduced or exposes incorrect behavior that
must be fixed within scope.

**PRE-EXISTING**
Evidence shows the failure existed before the current change.

**ENVIRONMENT**
The failure is caused by tooling, infrastructure, credentials,
network, device, or environment configuration.

**FLAKY**
The failure is nondeterministic and evidence supports this.

**UNKNOWN**
There is not enough evidence yet.

Do not classify by guess.

### 4. Localize

Identify the smallest failing boundary.

Trace backward from the observed failure until the first
incorrect state or behavior is found.

Focus investigation on:

- relevant changed code
- inputs
- state
- contracts
- dependencies
- environment

### 5. Form a hypothesis

Create a specific, testable explanation.

Avoid vague hypotheses.

Bad:

"The database is broken."

Better:

"The second insert violates the existing unique constraint
because the new operation creates another active record for the
same owner."

### 6. Test the hypothesis

Use the least invasive method available:

- targeted test
- focused logging
- debugger
- state inspection
- controlled input
- isolated reproduction

Do not modify production behavior merely to test an unsupported
guess.

### 7. Fix the root cause

Once evidence supports the cause, make the smallest in-scope
change that fixes it.

Do not mask the symptom when the root cause can be addressed
correctly.

### 8. Verify

Rerun:

1. the original reproduction
2. relevant targeted tests
3. required regression validation

Record the results.

## Escalation

Stop and report the issue when the required fix would:

- change approved requirements
- redesign approved architecture
- break a contract unexpectedly
- expand task scope materially
- require unavailable external access or decisions

If repeated hypotheses fail, reassess the evidence instead of
continuing speculative edits.

## Result

Record when useful:

**Failure:**  
...

**Classification:**  
...

**Root Cause:**  
...

**Evidence:**  
...

**Fix:**  
...

**Verification:**  
...