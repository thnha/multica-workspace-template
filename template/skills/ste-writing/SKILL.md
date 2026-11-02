---
name: ste-writing
description: Use whenever you write English text that another agent or a developer must act on — task packets, acceptance criteria, requirements, implementation plan steps, handoffs, resume notes, wakeup instructions. Applies a subset of ASD-STE100 Simplified Technical English so that one reading gives one meaning.
---

# STE Writing (ASD-STE100 subset)

This skill applies a subset of ASD-STE100 Simplified Technical English (STE).
The goal: the reader understands the text in one reading, and only one
meaning is possible.

## 1. Scope

Apply STE to English text that a reader must act on:

- Task packets, dispatch text, resume notes, wakeup instructions.
- Functional requirements, acceptance criteria, edge cases, open questions.
- Implementation plan steps, validation steps, handoff notes.

Do not apply STE to:

- Vietnamese text for the requester.
- Code, identifiers, file paths, commands, log output, quoted error messages.
- Protocol tokens and template labels (`Decision needed: YES|NO`, `Result`,
  `[Watchdog]`, `VERIFIED`, `Given/When/Then`, requirement IDs). Keep them
  exactly as written.
- Text that you quote from the requester or the issue. Quote it unchanged.
- Reasoning sections: root cause, trade-offs, design rationale. Write them
  clearly, but complex sentences are permitted there.

Priority: role skills and output templates define structure and fields. This
skill defines only how you write the sentences inside those fields. If this
skill and a template conflict, the template wins.

## 2. Word rules

- **W1 One word, one meaning.** Use one term for one thing in the full text.
  Do not change between synonyms (for example: user / learner / customer).
- **W2 Use the approved alternatives** in section 5.
- **W3 Technical names and technical verbs are permitted** (section 6). If a
  project term is not in the list, use the term from the Feature
  Specification and define it at its first use.
- **W4 Write the full term of an abbreviation at its first use**, unless the
  abbreviation is in section 6.
- **W5 Do not use "it", "this" or "that" if the reference is not clear.**
  Write the noun again.
- **W6 Do not write telegraphic text.** Keep "the", "a" and "that" when they
  make the sentence clear.

## 3. Sentence rules

### Instructions (procedures, plan steps, task packets)

- **I1** Use the imperative: "Run the tests." Not: "The tests should be run."
- **I2** Write one action in one sentence. Write two actions in one sentence
  only if the reader must do them at the same time.
- **I3** Use a maximum of 20 words in a sentence.
- **I4** Write the condition first: "If the migration fails, stop and report
  BLOCKED."
- **I5** Give numbers to sequential steps.
- **I6** For a mandatory action, write "must" or "do not". Do not write
  "should", "may", "might", "could", "ideally" or "try to" for a requirement.
  For an optional action, write "(optional)" or "You can …".
- **I7** For a stop condition or a risk, write the instruction first, then
  the reason: "Do not run the migration on production. The migration deletes
  the old column."

### Descriptions (context, current behavior, findings)

- **D1** Use a maximum of 25 words in a sentence.
- **D2** Write one topic in one sentence.
- **D3** Use the active voice. Use the passive voice only if the actor is
  not known.
- **D4** Use only the simple present, simple past and simple future
  ("will"). Do not use progressive or perfect tenses ("is running",
  "has been changed").
- **D5** Use a maximum of 6 sentences in a paragraph. Use a list if you have
  more items.

### Be specific

- **B1** Do not use vague words: "fast", "large", "some", "several",
  "properly", "correctly", "appropriate", "as needed", "etc.". Write a number,
  a unit, a named behavior or the full list.
- **B2** Do not write "handle the error". Write the result: "Show the
  message 'Lesson not found' and return HTTP 404."

## 4. Self-check before you post

1. Each instruction is imperative, has one action, and has 20 words or fewer.
2. Each requirement uses "must" or "must not". No "should" or "may".
3. No word from the "Do not use" column in section 5.
4. No vague word without a number, a unit or a list.
5. One term for one thing in the full text.
6. Protocol tokens, template labels and IDs are unchanged.

Estimate the word count; do not count with a tool. Do not delay delivery for
style. If a sentence is clear and has 23 words, keep it.

## 5. Approved alternatives

| Do not use | Use |
|---|---|
| ensure | make sure |
| utilize, leverage | use |
| commence, initiate | start |
| terminate | stop |
| prior to | before |
| subsequent to, following | after |
| in order to | to |
| due to the fact that | because |
| in the event that, in case of | if |
| whether or not | if |
| approximately | about |
| additional | more |
| sufficient | enough |
| obtain, retrieve | get (or a technical verb: fetch, read, query) |
| modify, amend, alter | change |
| perform, carry out, conduct | do (or the specific verb) |
| facilitate | help, make … easier |
| regarding, with regard to | about |
| as well as | and |
| a number of | the exact number |
| should (for a requirement) | must |
| may (for permission) | can |
| handle, deal with | the specific result (see B2) |
| appropriate, proper, correct | the criterion that makes it correct |

## 6. Technical names and technical verbs (permitted)

**Workflow:** issue, sub-issue, package, task packet, Feature Specification,
Technical Design, Implementation Plan, functional requirement (FR),
acceptance criteria (AC), invariant (INV), write scope, round, gate, handoff,
wakeup, blocker, requester.

**Git and CI:** repository, branch, commit, head SHA, pull request (PR), diff,
merge, rebase, push, CI, check.

**Code and test:** API, endpoint, schema, migration, unit test, integration
test, fixture, mock, typecheck, lint, regression, race condition.

**Domain:** learner, lesson, lesson progress. Add a new domain term only from
an approved Feature Specification.

**Technical verbs:** run, build, deploy, commit, push, merge, rebase, revert,
dispatch, assign, mention, migrate, fetch, query, retry, validate, verify,
reproduce, refactor.

## 7. Examples

**Task packet**

- Before: "Please make sure to properly handle the case where the user may
  have already completed the lesson, and ideally add some tests for it."
- After:
  1. If the learner already completed the lesson, return the
     already-completed result.
  2. Do not create a second completion record.
  3. Add one integration test for this case.

**Acceptance criterion**

- Before: "Then the progress should be updated correctly and quickly."
- After: "Then the lesson shows as completed in the learner's progress
  within 2 seconds."

**Plan step**

- Before: "Subsequent to the schema modification, the migration is to be
  executed and verified, as well as the rollback."
- After:
  1. Change the schema.
  2. Run the migration.
  3. Run the rollback. Make sure that the schema is the same as before the
     migration.
