# Migration and Compatibility

## Purpose

Design safe transitions between old and new system states.

---

# Compatibility Dimensions

When relevant analyze:

- database
- API
- client/server
- event/message
- configuration
- deployment
- stored data

---

# Client/Server Compatibility

Consider:

Old Client + Old Server
Old Client + New Server
New Client + New Server

When deployments can overlap, also consider:

New Client + Old Server

Document unsupported combinations explicitly.

---

# Database Migration

Prefer backward-compatible staged migration when practical.

Typical sequence:

1. Add compatible schema.
2. Deploy code capable of using old/new state.
3. Backfill if necessary.
4. Switch behavior.
5. Verify.
6. Remove legacy state in a later change.

Avoid destructive migration in the same deployment unless
explicitly justified.

---

# Rollback

Determine whether deployment can safely roll back after:

- schema migration
- partial data conversion
- new writes
- protocol changes

A deployment is not safely reversible merely because the
application binary can be rolled back.

---

# Output

Migration Required:
YES | NO

Compatibility Strategy:
...

Deployment Order:
...

Rollback Strategy:
...

Data Backfill:
...

Risks:
...