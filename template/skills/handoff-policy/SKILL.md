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
Exception: `[Block checkpoint]` progress notes (incremental-block-delivery)
are not result comments and do not count as your one comment. Post them only
top-level on a child issue assigned to you, never as a reply under a
delegation and never on a squad-assigned issue (use issue metadata there).
Exception: the QA / Test Engineer's single `[QA progress]` comment (created
once per dispatch, then edited in place) is not a result comment. QA runs a
long pass in batches, one run per batch; an intermediate batch run posts no
card and ends with the one line `QA batch <k>/<N> done — continuing`.

When your issue is a child whose parent is assigned to a squad, post nothing
on the parent: no notice, no link, no card, on any run. Your result card on
the child is the whole handoff. When a leader mention started you, post the
card as a reply under that comment (keep its `--parent`); that reply wakes the
leader on the child. When an assignment started you, post it top-level on the
child; the leader registered a wakeup for your run. Mention nobody. Do not set
the child to done yourself; the leader closes it after the gate check.

## Final message and no-new-work runs

The platform posts a run's final message as a comment on the run's issue when
the run posted no comment there and recorded no `squad activity` or wakeup
check-in (wakeup, assignment, and rerun runs). "End silently" therefore means:
end with ONE line, never a run summary or decision trace, for example
`No action — gate already recorded on LING-135.` or
`Gate recorded on LING-137; TASK-006 dispatched.` Everything a reader needs
belongs in your card, not in the final message.

When a trigger brings nothing new for you (duplicate callback, a requester
reply meant for the leader, work already handed off), do not write a card and
do not restate your earlier result: end with one line starting
`No new work — <reason>`.

## Summary card and attached artifacts

Humans review issues by reading comments, so a result comment is a short
summary card, not the artifact itself.

Attach every full artifact (Feature Specification, Technical Design,
Implementation Plan, Implementation Report, Code Review Report, QA Test Report,
long logs) as a Markdown file on the result comment:
`multica issue comment add <issue-id> --content-file card.md --attachment <artifact>.md`.
Name it `<artifact>-<ISSUE-KEY>-r<attempt>.md` and keep both files inside your
working directory. The file follows the role's canonical template unchanged.

The card is at most 12 lines and about 1,200 characters. The header and field
labels stay in English exactly as below; the values are written in the
requesting user's language (Vietnamese in this workspace):

```
**[<Stage>] <STATUS> — Decision needed: YES|NO**
- Result: <one line: what was delivered, at which revision>
- Key points: <2-4 bullets: key decisions, findings, or failures with IDs>
- Not verified: <checks not run, or "none">
- Needed from you: <the decision needed, only when YES>
- Next: <proposed next stage and owner>
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
