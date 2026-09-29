# Task Scope Design

## Purpose

Create explicit boundaries that prevent implementation agents
from changing unrelated parts of the system.

---

# Every Task Must Define

## In Scope

Behavior and technical areas the Developer may change.

## Out of Scope

Nearby work that must not be included.

## Expected Work Areas

Known modules/components/packages.

Use exact files only when verified.

---

# Scope Test

Ask:

If the Developer discovers unrelated technical debt, are they
allowed to fix it?

Default answer:

NO.

Create separate work unless required for the assigned task.

---

# Scope Expansion

If implementation cannot complete without expanding scope:

1. Developer reports discovered dependency.
2. Do not silently expand.
3. Re-evaluate plan/design.
4. Create or modify tasks when approved.

---

# Shared Components

If multiple tasks modify a shared component:

- assign explicit ownership,
- merge tasks when strongly coupled,
- or define execution ordering.

Avoid ambiguous ownership.