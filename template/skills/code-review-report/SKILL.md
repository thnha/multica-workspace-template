---
name: code-review-report
description: Produce a Code Review Report with revision-scoped findings, validation evidence, a review verdict, and workflow handoff after reviewing an implementation.
---

# Code Review Report

Use the template below as the canonical report. Keep it concise; retain the
sections and mark unavailable evidence NOT VERIFIED or inapplicable items N/A
with a reason. Do not repeat the full specification or design.

## Length and brevity rules

- Target: under ~6,000 characters (a re-review: under ~3,000).
- Scope and revisions: at most 5 lines; reference requirements by ID.
- Validation table: checks you ran, plus one row pointing to the developer/CI
  evidence you inspected; do not copy the developer's whole table.
- On re-review, report only prior findings' status and new findings; do not
  rewrite the initial report.

## Verdict rules

- BLOCKER and MAJOR findings always block approval.
- For each MINOR, state Blocking: YES or NO. YES requires a concrete unmet
  requirement or material behavioral risk; otherwise treat it as non-blocking.
- NIT findings are optional and never block approval.
- Structural defects listed as MAJOR in `design-discipline` §6 (logic in the
  wrong layer, near-duplicate of existing code, unjustified abstraction or
  dependency, old path left alive, touched unit pushed past the size limits
  with a new responsibility, missing Approach Note on MEDIUM) are MAJOR and
  block approval. Cite the file/line and the existing code or rule.
- APPROVED requires a completed review, sufficient essential evidence, and no
  unresolved blocking findings. Non-blocking improvements may remain.
- CHANGES_REQUIRED means the review establishes at least one unresolved
  blocking finding.
- BLOCKED means missing essential code, requirements, access, or validation
  evidence prevents completing the review. If blocking defects are already
  known, retain them in the report while reporting BLOCKED.
- Missing optional artifacts or deliberately omitted workflow stages do not
  automatically block review. Explain the applicable scope and limitations.

Map the report verdict to workflow evidence:
APPROVED -> REVIEW_PASSED; CHANGES_REQUIRED -> REVIEW_FAILED;
BLOCKED -> BLOCKED. These tokens are not Multica issue statuses.

## Evidence and revision rules

- Give each finding a stable ID (CR-001, CR-002, ...), severity, blocking flag,
  location, concrete trigger/problem, impact, and recommended correction.
  Separate confirmed defects from optional improvements and unknowns.
- Record repository, PR if available, target base branch, base SHA and reviewed
  head SHA for each repository. Identify the actual diff range. If uncommitted
  changes are included, identify a durable diff/snapshot; approval of that
  snapshot does not certify a later commit.
- Approval covers only the recorded revision(s) and reviewed scope. A changed
  head or review base requires reassessment of the new diff, affected context,
  and relevant validation before carrying approval forward.
- On re-review, preserve finding IDs and record FIXED, OPEN, or NOT VERIFIED,
  with evidence from the new revision. Do not close findings from a developer's
  statement alone.
- Distinguish checks executed by the reviewer from developer/CI evidence that
  was inspected. Record command or check, revision, source/environment, result,
  and relevant evidence. Never label skipped or unavailable checks PASS.
- Review approval does not assert QA approval, overall workflow completion,
  merge authorization, or deployment readiness.

## Canonical template

```markdown
# Code Review Report

## Scope and revisions
- Issue / requirements (IDs and links):
- Repository / PR / base branch:
- Base SHA / reviewed head SHA / diff range:
- Scope and exclusions:

## Summary
- 2–4 lines: assessment against the requirements; missing behavior or scope
  deviations by ID.

## Findings
For each finding:
- ID / severity / Blocking: YES or NO:
- File and line(s) at the reviewed revision:
- Concrete trigger/problem and evidence:
- Impact / affected requirement:
- Recommended correction:

State "No findings" if none. Keep optional improvements separate.

## Validation evidence
| Check or command | Revision | Source / environment | Result | Evidence |
| --- | --- | --- | --- | --- |

List important test gaps, skipped checks, and unavailable evidence with reasons
and risks. Distinguish reviewer execution from inspected developer/CI evidence.

## Re-review
N/A for an initial review. Otherwise one line per prior finding:
`CR-xxx — FIXED | OPEN | NOT VERIFIED — evidence at <SHA>`.

## Limitations and blockers
- Essential missing inputs, unresolved questions, and risks; "None" only when
  supported by the review.

## Verdict
- Review verdict: APPROVED / CHANGES_REQUIRED / BLOCKED
- Workflow state: REVIEW_PASSED / REVIEW_FAILED / BLOCKED
- Reason, unresolved blocking finding IDs, and exact covered revision(s):

## Handoff
- Applicable structured handoff from workflow-state-protocol.
- Proposed next stage and remaining work; this proposal does not dispatch it.
```

Use handoff-policy for durable delivery: attach this report to a summary-card
comment and keep the structured handoff in the Handoff section above, not in
the comment.
For BLOCKED, list the missing prerequisite in blocked_by and set
handoff.entry_gate_satisfied to false. Only propose a next-stage entry gate as
satisfied when its applicable prerequisites are evidenced; review approval
alone is not proof of every downstream prerequisite.


