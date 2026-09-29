# Data Design

## Purpose

Design persistent data changes required by approved
requirements.

---

# First Step

Inspect existing:

- schema
- entities
- repositories
- indexes
- migrations
- ownership relationships
- transaction patterns

Do not invent storage patterns without examining current ones.

---

# Analyze

When relevant determine:

- entities
- fields
- types
- ownership
- relationships
- uniqueness
- indexes
- constraints
- lifecycle
- retention
- consistency requirements

---

# Integrity

Prefer enforcing critical invariants at the strongest practical
layer.

Examples may include:

- unique constraints
- foreign keys
- transactional checks
- optimistic locking

Application-only validation may be insufficient for concurrent
operations.

---

# Data Ownership

Identify the authoritative source for each important piece of
state.

Avoid multiple sources of truth without explicit justification.

---

# Migration

For schema changes determine:

- migration required?
- existing data affected?
- backfill required?
- deployment ordering?
- rollback implications?
- old application compatibility?

---

# Output

Document:

Current Model:
...

Proposed Model:
...

Constraints:
...

Indexes:
...

Migration:
...

Compatibility:
...

Requirements:
...