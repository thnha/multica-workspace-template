# Edge Case Analysis

## Purpose

Discover failure scenarios and boundary behavior before
implementation.

## Analysis Dimensions

Consider only dimensions relevant to the feature.

### Input

- missing
- empty
- invalid
- malformed
- minimum
- maximum
- unexpected value

### Identity

- unauthenticated
- unauthorized
- wrong owner
- expired credentials

### Timing

- repeated request
- simultaneous request
- delayed request
- timeout
- retry
- out-of-order events

### Persistence

- write failure
- partial failure
- stale data
- duplicate data
- server restart

### Distributed Systems

When applicable:

- duplicate messages
- reconnect
- network interruption
- multiple server instances
- retries
- eventual consistency

### Compatibility

- old client / new server
- new client / old server
- partially deployed systems

### Learning App

When applicable:

- progress changed offline, then synced after reconnect
- device clock manipulation (for example streaks or review due dates)
- duplicate lesson completion or exercise submissions
- lesson content edited or unpublished while a learner is mid-lesson
- older app version receiving newer content or API shapes
- account merge when both accounts have progress
- the same learner active on two devices

## Output

Create edge cases using EC identifiers.

Each important edge case should either:

- map to an acceptance criterion,
- be explicitly handled by a business rule,
- or be documented as out of scope.