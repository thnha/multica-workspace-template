---
name: handoff-files
description: Agent-to-agent handoffs travel as attached files behind a 3-line stub comment; full comments are written only when a human must act. Applies only to issue families marked `Handoff: files`. Overrides the comment-body rules of handoff-policy and agent instructions there.
---

# handoff-files

## Scope and switch

Apply this skill only when the parent issue's `## Current status` or your task
packet contains the line `Handoff: files`. Otherwise follow `handoff-policy`
and your instructions unchanged. The Feature Orchestrator writes that line at
classification (workspace context "Handoff files"). Where this skill applies,
it overrides the summary-card, milestone-card and comment-length rules of
`handoff-policy` and of your instructions. Every other rule stays: one result
comment per run, reply threads, wake-backs, mentions that start runs, gates,
protocol tokens, artifact templates, and the final-message rule.

Why: in LING-224, 197 of 230 comments (91% of the text) were agent-to-agent
cards; the 12 cards that needed the requester were easy to miss among them.

## Who reads the comment decides its form

| Comment | Form |
|---|---|
| Needs a human action: `Decision needed: YES`, a PR the requester must merge, a reply to a requester comment, a requester notice from the Watchdog | HUMAN CARD |
| Everything else: member result cards with `Decision needed: NO`, gate cards, dispatches, repair and re-review dispatches, resume notes, parent milestone notices that need no action | STUB + FILE |

When unsure, ask: "Does the requester have to do or decide something because
of this comment?" No means STUB + FILE.

## STUB + FILE

The comment has at most 3 lines, in English, and carries the attachment:

```
**[<Stage>] <STATUS> — Decision needed: NO**
`head=<sha7> · blocking=<IDs or none> · nonblocking=<IDs or none> · next=<stage/owner>`
📎 <file name(s)>
```

- Line 1 keeps the exact card header. The Watchdog and the leader detect
  result cards by it (first line starts with `**[` and contains
  `Decision needed:`), so never change it.
- Line 2 holds the facts the next agent gates on. Add `pr=#<n>`,
  `round=<n>/<max>`, `branch=<locked branch>@<sha7>`, or (Adversarial
  Reviewer) `plausible=<n> · invgap=<n>` when they apply. Omit
  fields that do not apply; never write prose there.
- A dispatch stub keeps its mention of the member it starts and names the
  packet location (child description section or attached file) instead of
  line 2: `` `packet=<child description §Repair round 2 | file name>` ``.
- Put everything else in the attached file: the role's canonical artifact
  (report, implementation report, packet) and, at its top, a `## Handoff`
  section with the fields the summary card used to carry (Result, Key points,
  Not verified, Next). Name files `<artifact>-<ISSUE-KEY>-r<n>.md` as
  handoff-policy says. Task packets and repair packets may stay in the child
  description (they are not comments).
- Readers download the file (`multica attachment download <id> -o <dir>`)
  and read only the lines they need (`Select-String`); never ask for a repost.
- If the attachment upload fails, post the file content as one reply directly
  under the stub, as handoff-policy says. Never drop evidence.

## HUMAN CARD

Use the full summary card of handoff-policy (Vietnamese values, at most 12
lines) plus the workspace clarification format when a decision is asked.

- Mention the requester once in the card, so it reaches their inbox. This
  holds for members too: a member mention of the requester starts no agent
  run, so it is the one exception to "mention nobody". Never mention an agent
  in a HUMAN CARD.
- Post it where the requester is reading (workspace "Asking the requester"
  item 8); the other issue gets at most a one-line pointer.
- Never put a question for the requester only in a file.
- The parent's `## Current status` stays the human summary of progress; keep
  it current instead of posting progress comments.

## Parent milestones

Milestone notices that need no human action (first package dispatched, a
package merged into the integration branch) become a STUB on the parent or
only a `## Current status` update. BLOCKED, `Decision needed: YES`, and the
final PR the requester must merge are HUMAN CARDS.

## Removal

To switch this off: unbind this skill from the agents and delete the
"Handoff files" block in the workspace context. Issues that already carry
`Handoff: files` then fall back to handoff-policy; nothing else depends on it.
