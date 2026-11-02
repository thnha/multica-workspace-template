---
name: design-discipline
description: Design-before-code and anti-bloat rules for Developers, Architect, Planner and Code Reviewer. Read before the first edit of every implementation package and when reviewing a diff for structure.
---

# Design Discipline

Goal: every change lands in the right place with the least new code. The number
of files, layers, abstractions or patterns is not a measure of quality.

"Smallest change" (engineering-core §3) means the smallest change that keeps the
touched code well structured, not "append to the nearest file or function".

## 1. Approach Note (Developer, every route, before the first edit)

Write it into the Implementation Report section `Design` (on MEDIUM/LARGE also
into the first `[Block checkpoint]`). Scale it to the change:

- SMALL: 3–5 lines — where the change goes (file/function), what is reused,
  what is new.
- MEDIUM (no Technical Design exists): at most ~25 lines covering
  1. Responsibilities: which module owns each new behavior; dependency
     direction (who imports whom).
  2. Data flow: input validation → logic → persistence → response / UI state.
  3. Contracts touched (types, API, storage), or `none`.
  4. Reuse: existing helpers/components/services found (search evidence) and
     used.
  5. New units: each new file, exported function, type or abstraction, and the
     concrete problem it solves.
  6. Simpler alternative considered and why it was rejected (only when a real
     choice exists).
  7. Failure behavior relevant to this change.
- LARGE: follow the approved Technical Design; record only deviations.

If writing the note exposes a contract, schema, auth, or architecture decision
that the packet does not settle, stop and escalate (engineering-core §3).

## 2. Reuse before writing

Before adding any helper, hook, component, type, constant, validator, query or
client:

- search the repository for the domain noun and the operation (`rg`), and
  record what you found;
- reuse or extend the existing unit when it has the same responsibility; never
  create a near-duplicate (`formatDate2`, `UserCardNew`, a second API client);
- do not merge two concepts only because their code looks alike today.

Then climb the ladder and stop at the first rung that holds. It runs after you
understand the problem and have traced the code the change touches, never
instead of it:

1. Does it need to exist? A speculative need is skipped; say so in one line
   (YAGNI). Never skip an accepted requirement.
2. Already in this repository? Reuse it (above).
3. Does the language standard library cover it?
4. Does a native platform feature cover it? (`<input type="date">` over a picker
   library, CSS over JS, a DB constraint over app code, a React Native built-in
   API over a library.)
5. Does an already-installed dependency cover it? Never add a dependency for
   what a few lines can do (§4).
6. Only then: the minimum code that works, placed per §3.

When two options are the same size, take the one that is correct on edge cases.

Bug fix: before editing, search every caller of the function you touch. Fix the
root cause once in the shared path all callers go through, not only the path
the ticket names. If that fix changes behavior for callers outside the ticket,
list them in the Report and escalate per engineering-core §3 before widening
the change.

## 3. Placement and size

- Put business rules where the repository keeps them (service, domain module,
  hook), not in route handlers, controllers, screens or JSX, unless the
  repository has no such layer.
- Do not grow a unit that is already oversized or mixes responsibilities. Soft
  thresholds (the repository's lint rule wins when one exists): function
  > ~50 lines, React component > ~200 lines, file > ~400 lines. When your change
  would push a touched unit past them, or add a new responsibility to it,
  extract the new responsibility into a cohesive unit next to it
  (behavior-preserving, inside the write scope) and state it in the Approach
  Note. Restructuring pre-existing debt beyond that is a follow-up issue.
- When you replace a code path, delete the old one in the same package: no dead
  branches, unused exports, orphan files, or flags left on.

## 4. Abstractions, patterns, dependencies

Introduce one only when you can name the current concrete problem, its
trade-off, and why a plain function or module is not enough.

Not allowed: speculative extension points, interfaces with a single
implementation and no test-seam need, generic base classes, pass-through
wrappers or layers, grab-bag `utils` files, configuration options nobody sets.

A new library, framework, or data-access approach requires a written reason why
the existing one is inadequate plus the migration cost; otherwise escalate.

Mark a deliberate simplification with a known ceiling (global lock, O(n²) scan,
naive heuristic, in-memory state) with a code comment
`ponytail: <ceiling>, <upgrade path>` (e.g.
`// ponytail: global lock, per-account locks if throughput matters`) and list
it in the Implementation Report `Design` section under "Decisions and
rationale". Never simplify away trust-boundary validation, data-loss
error handling, security, accessibility, or tests required by
engineering-core §4.

## 5. Diff self-check (before handoff)

From `git diff --stat <base>...HEAD` and the diff:

- every new file and new exported symbol appears in the Approach Note or Report
  with its reason;
- no file outside the write scope;
- no duplicated block (about 10+ similar lines) introduced;
- added production lines are plausible for the acceptance criteria; if not,
  simplify before handoff.

## 6. Code Reviewer

Check the diff against the Approach Note or Technical Design and §2–§5. Cite the
file/line and the existing code it duplicates or the rule it breaks.

MAJOR (blocking):
- business logic placed in a layer contrary to an established repository
  pattern;
- a new near-duplicate of an existing helper, component, type or client;
- an abstraction, pattern or dependency with no stated current problem;
- an old code path left alive after its replacement;
- a touched unit pushed past the §3 thresholds by gaining a new responsibility;
- a missing Approach Note on a MEDIUM package.

MINOR: naming, small local duplication, an extraction that would only improve
readability, a skipped ladder rung (§2: hand-rolled code that the standard
library, a native platform feature, or an installed dependency already covers).

Do not demand new abstractions, and do not ask the developer to fix
pre-existing debt the change did not worsen; propose a follow-up instead.

## 7. Software Architect and Implementation Planner

- Technical Design: list responsibilities with dependency direction; give a
  simpler alternative for every material AD; reference non-goals by ID.
- Long-lived features: the first implementation package copies the approved
  design into the repository's documentation location (or
  `docs/design/<ISSUE-KEY>.md` when none exists).
- Planner: tasks state the module that owns each new behavior and any
  extraction needed to keep touched units within §3.
