# Implementation Risk Planning

## Purpose

Use known technical risks to influence task decomposition,
ordering, and validation.

---

# Risk Sources

Inspect Technical Design for:

- data migration
- concurrency
- compatibility
- security
- external dependencies
- shared components
- destructive operations
- deployment ordering
- rollback difficulty
- performance-sensitive paths

---

# Risk Influence

HIGH-risk work may require:

- smaller tasks
- stronger validation
- explicit checkpoints
- earlier implementation
- isolated migration tasks
- dedicated QA coverage

LOW-risk work should not be over-planned.

---

# Risk Mapping

For each significant risk identify:

Risk:
RISK-...

Affected Tasks:
TASK-...

Mitigation:
...

Required Validation:
...

Failure Impact:
...

---

# Unknown Risk

Do not invent precise risk severity without basis.

Explain the reason for classification.