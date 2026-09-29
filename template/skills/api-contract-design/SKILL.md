# API and Contract Design

## Purpose

Design stable contracts that satisfy requirements while
preserving compatibility where required.

---

# First Step

Inspect existing project contract conventions.

Do not invent a new response envelope, error format, naming
scheme, or protocol when the project already defines one.

---

# Analyze

When relevant define:

- operation
- endpoint/message/event
- authentication
- authorization
- request
- response
- errors
- validation
- idempotency
- versioning
- compatibility

---

# Contract Definition

For each operation document:

### Contract

Operation:
...

Purpose:
...

Requirements:
FR-...

Authentication:
...

Authorization:
...

Request:
...

Response:
...

Errors:
...

Idempotency:
...

Compatibility:
...

---

# Compatibility

Determine impact on:

- existing callers
- older clients
- partially deployed systems
- external consumers

Prefer additive compatible changes when practical.

Breaking changes require explicit identification and migration
strategy.

---

# Errors

Do not define generic "error" behavior.

Identify meaningful error categories when product behavior
depends on them.

---

# Security

Do not trust client-provided ownership, identity, prices,
progress or scores, permissions, or other security-sensitive values
without server-side validation.