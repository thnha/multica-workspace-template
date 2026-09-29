# Implementation Traceability

## Purpose

Ensure every approved requirement reaches implementation and
validation.

---

# Forward Traceability

Build mappings:

FR -> TASK

BR -> TASK

NFR -> TASK

EC -> TASK

AC -> TASK + Validation

Architecture Decision -> TASK

---

# Reverse Traceability

For every task determine why it exists.

TASK -> FR / BR / NFR / AD / Validation Requirement

Tasks without justification are potential scope expansion.

---

# Coverage Categories

IMPLEMENTATION

Requirement requires production change.

VALIDATION

Requirement is satisfied by existing behavior but must be
verified.

DOCUMENTATION

Requirement requires documentation/configuration only.

N/A

Requirement does not create implementation work.

Never silently omit requirements.

---

# Coverage Review

Detect:

ORPHAN REQUIREMENT

No task covers required behavior.

ORPHAN TASK

Task has no approved reason to exist.

MISSING VALIDATION

Behavior is implemented but no evidence is planned.

DUPLICATE OWNERSHIP

Multiple tasks independently own the same requirement without
clear reason.

---

# Where to record it

Record forward coverage in each task's `Covers` field and report only gaps
(orphans, missing validation, duplicate ownership) in the plan's Coverage Gaps
section. Do not write separate forward or reverse coverage tables.
