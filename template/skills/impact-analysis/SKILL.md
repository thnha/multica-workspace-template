# Change Impact Analysis

## Purpose

Identify what can be affected by a proposed feature before
implementation begins.

---

# Analyze

## Direct Impact

Components intentionally changed by the feature.

Examples:

- API
- service
- database
- UI
- configuration

## Indirect Impact

Components that consume or depend on changed behavior.

Examples:

- older clients
- downstream services
- analytics
- scheduled jobs
- caches
- tests

---

# Impact Dimensions

Consider when relevant:

- source modules
- API contracts
- WebSocket contracts
- database schema
- persisted data
- caches
- queues/events
- authentication
- authorization
- configuration
- deployment
- monitoring
- tests
- client versions

---

# Dependency Direction

Identify both:

WHAT THIS FEATURE DEPENDS ON

and:

WHAT DEPENDS ON THE CHANGED COMPONENTS

This prevents analysis from considering only downstream
implementation.

---

# Output

For each impact:

### IMP-001

Type:
DIRECT | INDIRECT | POTENTIAL

Area:
...

Reason:
...

Related Requirements:
...

Risk:
LOW | MEDIUM | HIGH

Required Action:
...

Do not mark speculative impact as confirmed.