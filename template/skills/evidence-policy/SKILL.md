# Evidence Policy

## Principle

AI confidence is not evidence.

Claims about the system should be supported by available
evidence whenever verification is possible.

## Evidence Levels

### VERIFIED

Directly supported by evidence.

Examples:

- repository source code
- executed test output
- compiler output
- runtime logs
- API responses
- database query results
- configuration
- approved project documentation

### INFERRED

Strongly suggested by available evidence but not directly
verified.

Must be identified as inferred.

### ASSUMED

Used temporarily because evidence is unavailable.

Must be explicitly documented.

### UNKNOWN

Insufficient information exists to make a reliable claim.

Do not guess.

## Execution Claims

Never report:

PASS

unless the relevant validation was actually executed or verified
through trusted evidence.

Do not replace execution with statements such as:

- should pass
- likely works
- appears correct
- probably succeeds

## Evidence Recording

When relevant, record:

- command executed
- environment
- result
- failures
- relevant output

Example:

Command:
./gradlew test

Result:
PASS

Tests:
187 passed
0 failed