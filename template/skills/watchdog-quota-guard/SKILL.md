---
name: watchdog-quota-guard
description: Workflow Watchdog job 1 (failed-run guard on task.failed: quota resume, runtime fallback, transient leader retry) and job 5 (restore primary runtime after a quota fallback).
---

# watchdog-quota-guard

Workflow Watchdog only. The GENERAL rules in your instructions (silence by default, one-line outputs, comment limits, what you may never touch) apply to every step below.

JOB 1: FAILED-RUN GUARD (wakeup event `task.failed`)
1. If the issue is done or cancelled, end silently.
2. Look at the most recent failed run in `multica issue runs`; call its agent X. If X already has a queued/running run on this issue, or there is already an enabled `at` wakeup for X on this issue, end silently.
3. Quota / session / rate / usage limit (e.g. "hit your session limit", "rate limit", "quota", "usage limit"): parse the reset time T from the error (e.g. "resets 6:30am (Etc/GMT-7)"; Etc/GMT-7 means UTC+7), convert to UTC (no reset time → T = now + 1h).
   3a. Runtime fallback, only for X = QA / Test Engineer ({{@agent:QA / Test Engineer}}) or Code Reviewer ({{@agent:Code Reviewer}}), and only when T is more than 20 minutes away:
      - Read X: `multica agent get <X> --output json` and note runtime_id, model, thinking_level.
      - If X's runtime_id already equals its fallback runtime below, the fallback is exhausted: go to 3b.
      - Otherwise switch X and resume it now, in one call:
        `multica agent update <X> --runtime-id <fallback runtime> --model <fallback model> --thinking-level "" --output json`
        `multica issue wakeup create <issue> --kind at --after 1m --agent-id <X> --instruction "Quota fallback: your previous run hit a session limit; you now run on a fallback runtime. Re-read the latest comments and your progress comment or report file, then continue from where you stopped; do not redo completed steps."`
        `multica issue wakeup create <issue> --kind at --at <T + 5 min, UTC RFC3339> --agent-id {{@agent:Workflow Watchdog}} --instruction "Restore primary runtime (job 5): agent <X>, runtime_id <old runtime_id>, model <old model>, thinking_level <old thinking_level, or empty>."`
        If `agent update` fails, go to 3b. Final output: "[Watchdog] Job 1: <agent X> switched to fallback <fallback model> until <HH:MM> (UTC+7)."
      Fallback table (same machine as the primary, so the simulator and Orca stay available):
      - QA / Test Engineer → runtime 2141b7d2-44a8-49c5-b6a9-db6819e4e2aa (Codex, Trans-MBP), model gpt-5.6-sol
      - Code Reviewer → runtime 2141b7d2-44a8-49c5-b6a9-db6819e4e2aa (Codex, Trans-MBP), model gpt-5.6-luna
   3b. Otherwise (other agents, T within 20 minutes, fallback exhausted or failed): resume at T + 5 minutes. If an enabled job 5 restore wakeup exists for X, resume X 2 minutes after that restore's time instead when it is earlier. Create exactly one:
   `multica issue wakeup create <issue> --kind at --at <UTC RFC3339> --agent-id <X> --instruction "Quota has reset. Re-read the latest comments and continue from where you stopped; do not redo completed steps."`
   Then end without a comment: the `at` wakeup is the record (`multica issue wakeup list`), and any comment on a squad-assigned issue wakes the leader for nothing. Final output: "[Watchdog] Job 1: <agent X> resumes at <HH:MM> (UTC+7)."
4. Transient failure (stream/connection/network error, timeout, process exited unexpectedly, daemon/runtime restarted or offline, 5xx from the provider) of a LEADER run (X = Feature Orchestrator {{@agent:Feature Orchestrator}}): count the watchdog retry wakeups for X on this issue created in the last 3 hours (`wakeup list`, kind `at`, instruction starting "Transient run failure"). If fewer than 2, create exactly one:
   `multica issue wakeup create <issue> --kind at --after 5m --agent-id <X> --instruction "Transient run failure (<short error>). Re-read the latest comments and continue from where you stopped; do not redo completed steps."`
   and end silently. If 2 already exist, post one line mentioning the requester (issue creator): "[Watchdog] <agent X> keeps failing (<short error>) after 2 retries; please take a look." — only if no such line exists in the last 6 hours; otherwise end silently.
   A transient failure of a squad MEMBER run: end silently — the leader re-dispatches failed member runs itself, and a second retry would duplicate the work.
5. Any other failure (config, permission, invalid input, agent-reported failure): end silently; the stall check and the leader own it.

JOB 5: RESTORE PRIMARY RUNTIME (wakeup kind `at`, instruction starting "Restore primary runtime (job 5)")
1. Read agent X from the instruction: `multica agent get <X> --output json`. If its runtime_id already equals the primary runtime_id in the instruction, end silently.
2. Restore it in one call: `multica agent update <X> --runtime-id <primary runtime_id> --model <primary model> --thinking-level "<primary thinking_level, or empty>" --output json`. A run already in progress keeps the runtime it was claimed on, so restoring is safe at any time.
3. Post no comment. Final output: "[Watchdog] Job 5: <agent X> restored to <primary model>." If the update fails, final output: "[Watchdog] Job 5: restore of <agent X> failed (<short error>); please reset its runtime." and mention the requester (issue creator) in it.
