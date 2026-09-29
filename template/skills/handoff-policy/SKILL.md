# Agent Handoff Policy

## Principle

Agents must transfer structured artifacts and evidence rather
than relying on conversational memory.

## Handoff Must Include

When applicable:

- source issue
- current status
- approved requirements
- relevant artifacts
- assumptions
- open questions
- decisions
- discovered risks
- validation evidence
- blockers

## Analyst → Architect

Provide:

- Feature Specification
- requirements
- business rules
- acceptance criteria
- assumptions
- constraints
- open questions

## Architect → Planner

Provide:

- Feature Specification
- Technical Design
- affected components
- technical constraints
- risks
- migration requirements

## Planner → Developer

Provide:

- assigned task
- requirements
- acceptance criteria
- expected affected areas
- dependencies
- validation requirements

## Developer → Reviewer

Provide:

- requirements
- implementation report
- changed files
- git diff
- tests added
- validation evidence
- known limitations

## Reviewer → QA

Provide:

- reviewed implementation
- accepted requirements
- acceptance criteria
- identified risk areas
- regression concerns

## QA → Merge Gate

Provide:

- acceptance results
- regression results
- failures
- skipped tests
- environment
- final QA status

## Rule

Do not rely on statements such as:

"See previous conversation."

Important state must exist in a durable artifact.


## Durable handoff location and revision

Store the handoff in the owning Multica issue's result comment, using
`multica issue comment add <issue-id> --content-file <workdir-file>` and the
existing delegation thread when applicable. Format it as the summary card
below and attach full artifacts as files. Link the parent/child issue and
source evidence comment IDs. A local filesystem path alone is not a handoff:
use repository paths with commit SHA/PR URL, or uploaded attachments.

Include task key, scope, requirement/acceptance IDs, target repository and base
branch, implementation branch/commit SHA per repository, artifact references,
validation commands/results, unresolved findings, and the proposed next stage.
For a review or QA fix, include finding IDs and the revision being rechecked.
Mark unavailable evidence NOT VERIFIED; do not invent identifiers or results.

Use the role's canonical artifact template where required. Put shared handoff
metadata in its supported section or the separate handoff file rather than
replacing the template or violating a role's output-only requirement.
Members report evidence to the leader; the leader verifies the gate and selects
the next dispatch. A member's proposed next stage is not authorization to start it.

## One result comment per run (squad members)

Every comment a member posts on a squad-assigned issue, or in reply to a
delegation, wakes the leader for a full run. Post exactly one result comment
per run: the final handoff with all evidence. Do not post progress updates,
acknowledgements, follow-ups, or addenda. If you find something after posting,
include it in your next handoff; post one extra comment only when it changes
your verdict or reveals a blocker. A question that blocks your work counts as
your one comment for the run. This rule does not apply to the squad leader.

When your issue is a child whose parent is assigned to a squad, your result
card on the child does not wake the leader: the child is not squad-assigned.
After posting the card, you MUST post exactly one short notice on the PARENT
as a reply to the leader's dispatch comment named in your task packet (a
top-level parent comment if the packet names none), on every run including
repairs, re-reviews, and re-tests:
`multica issue comment add <PARENT-KEY> --parent <dispatch-comment-id> --content "<CHILD-KEY>: <STATUS> — xem card trên <CHILD-KEY>"`.
Skipping it stalls the workflow until a human intervenes. Do not mention anyone in it; a comment on the squad-assigned
parent already wakes the leader. This notice is part of the handoff, not an
extra comment. Do not set the child to done yourself; the leader closes it
after the gate check.

## Summary card and attached artifacts

Humans review issues by reading comments, so a result comment is a short
summary card, not the artifact itself.

Attach every full artifact (Feature Specification, Technical Design,
Implementation Plan, Implementation Report, Code Review Report, QA Test Report,
long logs) as a Markdown file on the result comment:
`multica issue comment add <issue-id> --content-file card.md --attachment <artifact>.md`.
Name it `<artifact>-<ISSUE-KEY>-r<attempt>.md` and keep both files inside your
working directory. The file follows the role's canonical template unchanged.

The card is at most 12 lines and about 1,200 characters, written in the
requesting user's language (Vietnamese in this workspace):

```
**[<Stage>] <STATUS> — Cần bạn quyết: CÓ|KHÔNG**
- Kết quả: <one line: what was delivered, at which revision>
- Điểm chính: <2-4 bullets: key decisions, findings, or failures with IDs>
- Chưa xác minh: <checks not run, or "không có">
- Cần bạn: <the decision needed, only when CÓ>
- Tiếp theo: <proposed next stage and owner>
📎 <attached file name(s)>
```

Put the workflow-state-protocol YAML handoff in the artifact's own handoff or
final-status section; every canonical template has one. Never put it in the
card, and do not attach it as a separate file. Artifact IDs, requirement IDs, and commit SHAs stay
exact; do not translate them.

Readers fetch the full artifact with `multica attachment download
<attachment-id>`. When you consume an upstream artifact, download it rather
than asking for it to be reposted.

If the attachment upload fails, keep the card as your result comment and post
the full artifact as one reply directly under the card, stating that the
attachment failed. Never drop evidence to keep the card short.
