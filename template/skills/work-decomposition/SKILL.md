# Work Decomposition

## Purpose

Convert an approved Technical Design into small, coherent,
executable implementation tasks.

---

# Procedure

## 1. Extract Required Outcomes

From the Technical Design identify:

- new behavior
- changed behavior
- new data
- changed data
- new contracts
- changed contracts
- migration work
- compatibility work
- security work
- observability work
- validation work

Do not begin decomposition from filenames.

Begin from outcomes.

---

## 2. Identify Cohesive Change Units

Group work that:

- implements one meaningful behavior
- shares a transaction boundary
- must change atomically
- must be validated together

Separate work that:

- has independent dependencies
- belongs to different ownership
- can safely run in parallel
- has separate migration ordering
- has materially different risks

---

## 3. Avoid Oversized Tasks

A task is probably too large if:

- it covers unrelated behaviors
- it spans many unrelated architectural decisions
- its validation cannot be clearly defined
- multiple Developers would need to coordinate inside the task
- failure requires restarting most of the feature

Split by meaningful outcome.

---

## 4. Avoid Micro-Tasks

Do not create tasks such as:

- add field
- create getter
- create class
- add import
- update one line

unless they represent an independently meaningful migration,
contract, or operational step.

---

## 5. Check Developer Executability

Ask:

Can one Developer understand what outcome is required?

Can they identify what they may change?

Can they determine when the task is complete?

Can they validate the result?

If not, improve the task.

---

# Output

For each unit produce:

Task Candidate:
...

Outcome:
...

Reason for separation:
...

Dependencies:
...

Validation boundary:
...