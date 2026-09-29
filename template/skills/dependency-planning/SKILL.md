# Dependency Planning

## Purpose

Build a correct execution order while maximizing safe
parallelism.

---

# Dependency Types

## HARD

Task B cannot correctly begin until Task A produces its output.

Example:

database migration definition
    ->
repository implementation

## CONTRACT

Tasks depend on a shared agreed contract.

After the contract exists, consumers may run in parallel.

## ORDERING

Tasks may be technically independent but deployment or migration
requires ordering.

## VALIDATION

A validation task requires implementation tasks to complete.

---

# Procedure

For every pair of related tasks ask:

Does B actually require A?

If no, do not create a dependency.

---

# Parallel Groups

Tasks may share a parallel group when:

- their required contracts already exist
- they do not own overlapping changes
- they do not require each other's output
- concurrent work will not create incompatible assumptions

---

# Conflict Analysis

Detect likely conflicts such as:

TASK-003 modifies LessonProgressService
TASK-004 modifies LessonProgressService

Even if logically independent, simultaneous execution may cause
merge or design conflicts.

Record these explicitly.

---

# Cycle Detection

A plan must not contain circular dependencies.

Example invalid:

TASK-001 -> TASK-002
TASK-002 -> TASK-003
TASK-003 -> TASK-001

A cycle usually indicates:

- poor task decomposition
- missing shared contract
- missing foundation task

Resolve the underlying planning problem.

---

# Output

Produce:

Dependency Graph

Execution Waves

Parallel Groups

Potential Conflicts