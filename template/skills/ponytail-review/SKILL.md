---
name: ponytail-review
description: >
  Code review focused exclusively on over-engineering. Finds what to delete:
  reinvented standard library, unneeded dependencies, speculative abstractions,
  dead flexibility. One line per finding: location, what to cut, what replaces
  it. Code Reviewer runs it as an over-engineering pass on every implementation
  diff and folds the findings into the Code Review Report. Also use when asked
  "review for over-engineering", "what can we delete", "is this
  over-engineered". Complements correctness-focused review, this one only
  hunts complexity.
---

Review diffs for unnecessary complexity. One line per finding: location, what
to cut, what replaces it. The diff's best outcome is getting shorter.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for
multi-file diffs.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `reuse:` equivalent helper, util, or pattern already in this repo. Name the path.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.


## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `L18-29: reuse: slugify helper duplicates src/lib/slug.ts slugify. Delete it, import the existing one.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Scoring

End with the only metric that matters: `net: -<N> lines possible.`

If there is nothing to cut, say `Lean already.` and stop.

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
and performance are explicitly out of scope. Route them to a normal review
pass, not this one. A single smoke test or `assert`-based
self-check is the ponytail minimum, not bloat, never flag it for deletion.
Does not apply the fixes, only lists them.

## In the Code Review Report

Run this pass after the correctness review, on the same reviewed revision.
`code-review-report` stays the canonical output; this pass adds findings, it
does not replace the report or relax its rules.

- Each line becomes a normal finding (`CR-xxx`) under Findings, with the
  one-line form above as its "Concrete trigger/problem" and "Recommended
  correction".
- Severity: when the finding matches a MAJOR case in `design-discipline` §6
  (near-duplicate of existing code, abstraction or dependency with no stated
  current problem, old path left alive), it is MAJOR. Other `delete:`, `stdlib:`,
  `native:`, `reuse:`, `yagni:` findings are MINOR, Blocking: NO. `shrink:` is NIT.
- At most 3 `shrink:` NITs per report; count the rest only in the `net:` line.
- When the same root problem is already a finding from the main review pass
  (e.g. under `design-discipline` §6), merge into that one finding at the
  higher severity; never report it twice.
- Never flag tests required by engineering-core §4, the test plan, or a
  CONFIRMED finding (regression tests). In test files, flag only dead helpers
  or fixtures.
- On re-review, flag only lines changed since the last reviewed head SHA; do
  not raise new findings on code you already reviewed.
- Put `net: -<N> lines possible.` (or `Lean already.`) as the last line of
  Summary. It is not a verdict; the verdict comes only from
  `code-review-report`.
- Only flag code inside the reviewed diff. Pre-existing complexity the change
  did not worsen becomes a follow-up proposal, not a finding.
