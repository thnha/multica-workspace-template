# QA Test Report

## Metadata

Issue:
Status: PASS | PASS_WITH_NOTES | FAIL | BLOCKED
QA / date:
Tested revision (repository @ SHA, PR):
Environment (platform, device/OS, services, tool versions; no credentials):
Inputs: <spec / implementation report / code review report links>
Risk plan: <link to the [QA progress] comment or plan file>
Time spent: <execution minutes across batches; setup minutes separately; label estimates>

## Summary

<2–4 sentences.>

## Test Results

| Test | Covers (FR/AC/CR) | Required? | Level | Scenario and command/steps | Expected → Actual | Result |
|---|---|---|---|---|---|---|
| TEST-001 | AC-001 | YES | unit/API/device | ... | ... → ... | PASS/FAIL/BLOCKED/NOT_RUN |

For FAIL, BLOCKED, or NOT_RUN rows only, add below: evidence tied to the tested
revision, reason, risk, and what remains to verify.

## Defects

None | For each:

### BUG-001 — <title>

- Severity: CRITICAL | MAJOR | MINOR; blocks acceptance: YES/NO — impact on user/business
- Related test / location / preconditions and test data:
- Expected (requirement/contract/invariant) / actual (concise evidence):
- Reproduction: 1. ... 2. ...
- Frequency: consistent | intermittent (n/m)
- Suspected cause (hypothesis, optional):

## Suspected Issues (not reproduced)

None | <issue — why suspected — what would confirm it>

## Coverage

| Area / journey | Tested | Partially tested | Blocked | Not tested |
|---|---|---|---|---|

- Regression validated: ...
- Regression not validated (and risk): ...
- Remaining risks and most valuable next actions: ...

## Final Assessment

Status: PASS | PASS_WITH_NOTES | FAIL | BLOCKED — reason
Missing required validation: None | ...
Unresolved defects and revision to retest: None | ...

```yaml
workflow:
  complexity: SMALL|MEDIUM|LARGE|AUDIT-FIX
  stage: QA
  status: QA_PASSED|QA_FAILED|BLOCKED
evidence:
  artifacts: []      # report, evidence zip, progress comment id
  changed_files: []  # none for QA
  commands: []
  tests: []
risks: []
assumptions: []
blocked_by: []       # required when BLOCKED
handoff:
  next_stage: <stage or NONE>
  entry_gate_satisfied: true|false   # false when BLOCKED
  reason: <short explanation>
```
