---
name: watchdog-stall-check
description: Workflow Watchdog job 2: periodic stall check on a squad issue (merge watch, idle parent, lost quota resume, stall test, resume order to the leader).
---

# watchdog-stall-check

Workflow Watchdog only. The GENERAL rules in your instructions (silence by default, one-line outputs, comment limits, what you may never touch) apply to every step below.

JOB 2: STALL CHECK (wakeup kind `every`)
1. If the issue is done or cancelled: disable this wakeup and end silently.
1a. Merge watch: if issue metadata key `merge_watch` is set (`multica issue metadata get <issue> --key merge_watch`; value "<issue-id>|<repo>#<n>"), read `multica issue pull-requests <issue-id> --output json`. If that PR's state is `merged`, wake the leader once (skip if an enabled `at` wakeup with an instruction starting "Merge watch:" already exists): `multica issue wakeup create <issue> --kind at --after 1m --agent-id {{@agent:Feature Orchestrator}} --instruction "Merge watch: PR <repo>#<n> merged. Do the closing step and delete the merge_watch key."`, then check in. If it is still open, keep going with step 1b and the stall test.
1b. Idle parent: if the issue is `in_review`, has no `merge_watch` key, and every child is done or cancelled, the workflow only waits for the requester's acceptance, and a requester comment wakes the leader anyway: disable this wakeup and end silently (LING-209 kept firing hourly for 13 more days after completion).
1c. Lost quota resume: if an `at` wakeup created by you (instruction starting "Quota has reset" or "Quota fallback") on this issue or an open child is disabled with fire_count 0, its agent has had no run there since that wakeup was created, and that agent has posted no result card after the failure, the resume was lost (LING-210 idled 5h44m this way). Recreate it with the same flags and instruction, using `--after 1m` when its time has passed, then check in.
2. It is NOT stalled (check in and end) if any of these holds:
   - issue status is not `in_progress`;
   - any run on the issue, or on any of its sub-issues (`multica issue children <id>`), is queued, or running and not HUNG by the job 4 hang test (a running run whose last message is 20+ minutes old, or that is HUNG-AFTER-CARD per job 4 step 3a, does not count as activity);
   - an enabled `at` wakeup, or an enabled condition wakeup (non-null `condition`) targeting the leader, exists on the issue or on any open sub-issue — the leader is legitimately waiting;
   - last_activity_at of the issue or of any open sub-issue is younger than this wakeup's interval (`interval_seconds` of this wakeup in `multica issue wakeup list`: 30 minutes on parents registered since 2026-10-04T08:34Z, 60 minutes on older ones) (package work runs on sub-issues; the parent sees only milestones);
   - the latest leader/member card says "Decision needed: YES" or asks the requester a question with no later requester reply (waiting on a human is not a stall).
3. Otherwise it is stalled. If the last 3 comments do not already contain a "[Watchdog]" resume note from the past 3 hours: post one comment that mentions the squad leader via its mention link [@Feature Orchestrator](mention://agent/{{@agent:Feature Orchestrator}}) with: "[Watchdog] Issue idle for <N> minutes with no active run. This is a resume order, not a duplicate trigger: you are the SINGLE OWNER FOR THE NEXT STEP. Close any delivered child, then dispatch or decide the next step in this run (<next step from the latest leader card, if known>)." The mention starts the leader run; do not also run `multica issue rerun`.
4. If such a resume note already exists and the issue is still stalled: post one line mentioning the requester (issue creator) "[Watchdog] Resumed, but the issue is still idle; please take a look." — but only if no such mention was posted in the last 6 hours; otherwise check in and end.

Compute every age in this job (last_activity_at, run and message ages) with the TIME RULE in your instructions; for runs use the step 2 snippet of `watchdog-hung-run-check`.
HUNG test used in step 2 (from `watchdog-hung-run-check`, steps 3 and 3a): a `running` run is HUNG when its last message (`multica issue run-messages <run-id> --output json`, read only the tail) is 20+ minutes old, or it has no messages and started 20+ minutes ago. It is HUNG-AFTER-CARD when it started 5+ minutes ago, its agent posted a result card on this issue after the run's started_at (a comment whose first line starts with `**[` and contains `Decision needed:`), and its last message is 5+ minutes old. Do not cancel anything in this job; cancelling belongs to job 4.

Changed 2026-10-04 (LING-224 retro #5, requester decision): idle threshold follows the wakeup interval (30 minutes on new parents).
