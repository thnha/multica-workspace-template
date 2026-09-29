# Acceptance Criteria Design

## Purpose

Convert requirements into observable tests of behavior.

## Preferred Structure

Given <precondition>
When <action>
Then <observable result>

## Rules

Each important functional requirement should map to one or more
acceptance criteria.

Acceptance criteria must be externally observable whenever
possible.

Avoid implementation assertions.

Bad:

Then LessonProgressService.save() is called.

Good:

Then the lesson shows as completed for the learner, and submitting
completion again does not create a second completion record.

## Include

For relevant functionality cover:

- successful path
- invalid input
- unauthorized access
- duplicate operation
- persistence
- failure behavior
- boundary conditions
- compatibility

## Example

AC-001

Given an authenticated learner who has not completed lesson L
When the learner submits completion for lesson L
Then lesson L is recorded as completed for that learner
And it appears as completed in the learner's progress.

AC-002

Given a learner who already completed lesson L
When another completion request for lesson L is submitted
Then no second completion record is created
And the request returns the defined already-completed result.

## Traceability

Maintain mappings:

FR-001 -> AC-001
FR-002 -> AC-001, AC-002

Every critical FR must have acceptance coverage.

If an FR cannot be tested, rewrite the FR or explain why.