# Concurrency and Reliability Analysis

## Purpose

Identify correctness problems caused by simultaneous operations,
retries, failures, and distributed execution.

---

# When to Use

Use when behavior involves:

- state mutation
- learner progress and completion records
- exercise attempts
- payments or subscriptions
- offline sync
- concurrent sessions
- retries
- messaging
- scheduled jobs
- multiple server instances

---

# Concurrency Analysis

Ask:

What happens if the same operation executes twice?

What happens if two requests execute simultaneously?

What happens if two server instances process the same action?

Can read-modify-write race?

Can state be granted twice?

---

# Idempotency

Determine whether operations must be idempotent.

Identify the idempotency boundary and persistence mechanism when
required.

Do not assume client-side duplicate prevention is sufficient.

---

# Transaction Analysis

Identify:

- transaction boundary
- atomic state changes
- isolation requirements
- rollback behavior
- external side effects

---

# Failure Analysis

Consider:

1. failure before persistence
2. failure during persistence
3. persistence succeeds but response fails
4. retry after unknown outcome
5. process crashes
6. dependency timeout
7. duplicate delivery

---

# Distributed Systems

When multiple instances are possible, do not rely on
process-local locks for global correctness unless architecture
explicitly guarantees single-instance execution.

---

# Output

For each significant scenario:

### REL-001

Scenario:
...

Failure/Race:
...

Impact:
...

Required Guarantee:
...

Proposed Strategy:
...

Validation:
...