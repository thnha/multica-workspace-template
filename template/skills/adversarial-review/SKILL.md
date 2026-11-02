---
name: adversarial-review
description: Check an implementation against its declared invariants (INV-xxx) for failure modes — concurrency, races, duplicate delivery, retries after unknown outcome, partial failure, ownership — and report only failure scenarios backed by a reproducing test or a precise, testable scenario.
---

# Adversarial Review

## Role

You are not checking whether the code looks good. You are looking for a
scenario in which an invariant does not hold. A finding is a reproducible
counterexample to a stated guarantee, not an opinion. Style, naming, and structure belong to the Code Reviewer;
ignore them.

## Inputs and independence

Required:

- the invariant list: `Invariants` in the Feature Specification (business
  statements) and, on LARGE, the Technical Design's `Invariants` table
  (mechanism, known failure modes)
- PR URL, base branch, and the exact head SHA to review
- the repository at that SHA

Form your test plan from the spec, the invariants, and the code BEFORE
reading the developer's Implementation Report. The report tells you what the
developer believes; your job is to test what the code does. Read the report
afterwards only for test commands and environment setup.

Missing invariant list → BLOCKED, owner: Feature Analyst (MEDIUM) or Software
Architect (LARGE). Do not invent your own invariants to fill the gap; you may
list suspected missing invariants as `INV-GAP` notes for the owner.

## Scope

Check only:

1. every declared INV
2. design RISK-/REL- items concerning concurrency, retry, data integrity,
   or authorization
3. state-mutating paths in the diff that no INV covers (report these as
   `INV-GAP`, not as defects)

Do not audit unrelated code. Do not expand scope because you found something
interesting outside the diff; note it as a follow-up and move on.

## Failure-scenario catalogue

For each INV, write down the mechanism that is supposed to enforce it (unique
constraint, transaction, `SELECT … FOR UPDATE`, optimistic version, idempotency
key, outbox, ownership check), then try each applicable scenario:

| Scenario | Question |
|---|---|
| Double submit | Same request twice in a row — duplicate row, double credit, double side effect? |
| Concurrent submit | N identical requests at once (`Promise.all`) — does the invariant hold? |
| Lost update | Two writers read-modify-write the same row — does one write vanish? |
| Retry after unknown outcome | Commit succeeds, response is lost, client retries — same result or duplicate? |
| Partial failure | Crash/throw between two writes, or between DB commit and external side effect — is state half-applied? |
| Duplicate / out-of-order delivery | Job, webhook, or sync message delivered twice or reordered — idempotent? monotonic? |
| Multi-instance | Correctness relies on in-memory state, process-local lock, or timer? Fails with two server processes. |
| Ownership / authz | Can user A read/mutate B's resource by changing an ID, or by racing a permission change? |
| Boundary / clock | Day boundary, timezone, streak rollover, expiry at exact instant, clock skew between client and server. |
| App lifecycle (App) | Double tap, app killed mid-write, offline queue replay, background/foreground during sync, stale local cache overwriting newer server state. |

Write each competing interleaving explicitly before testing it, e.g.:

```text
A: read attempt count = 2
B: read attempt count = 2
A: write 3
B: write 3        ← expected 4 (INV-002 violated)
```

## Proving the scenario

Every finding goes through `finding-to-regression-test`. A scenario you cannot
turn into a failing test is PLAUSIBLE at best; say exactly why it could not be
reproduced (harness missing, needs multi-process, nondeterministic) and what
evidence would settle it.

Never "prove" concurrency with mocks of the database or the lock. A mocked
repository shows the code calls what you expect; it cannot show the invariant
holds under real contention.

## Budget

- Spend effort in proportion to impact: money, learner progress, data loss,
  and authorization first.
- Stop when every INV has been checked with the applicable rows above. Report
  "checked, held" per INV with the tests you ran — that is evidence too.
- On re-review, follow Work item 4 of your instructions: the diff, direct
  callers of changed functions, the INVs the diff touches, and regressions the
  fix introduces; re-sweep an INV in full only when the packet asks. Do not
  start a fresh full hunt.
- Workflow v2 packets are bounded: check the listed INVs and `Hypotheses`
  (H1 first) within the packet's `Budget` (runs). You may add hypotheses you
  find in the diff that threaten an INV (label them H-extra); they share the
  same budget.
- When the budget ends before every listed INV and hypothesis is settled,
  stop and report `INCOMPLETE COVERAGE`: settled items with their evidence,
  unsettled items with why and the evidence still needed. Never mark it
  PASSED and never continue past the budget on your own.

## Wording

Use neutral reliability terms (failure mode, scenario, counterexample, check)
in every report, test name, and comment; avoid offensive-security vocabulary.
Protocol tokens stay unchanged.

## Output

Produce the Adversarial Review Report defined in `finding-to-regression-test`,
delivered through `handoff-policy`.
