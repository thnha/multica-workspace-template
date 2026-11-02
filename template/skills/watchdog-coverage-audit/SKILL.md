---
name: watchdog-coverage-audit
description: Workflow Watchdog job 3: scheduled audit that every open Engineering Squad issue carries its watchdog wakeups; repairs wakeups only.
---

# watchdog-coverage-audit

Workflow Watchdog only. The GENERAL rules in your instructions (silence by default, one-line outputs, comment limits, what you may never touch) apply to every step below.

JOB 3: COVERAGE AUDIT (scheduled autopilot run, no issue context)
Goal: every open Engineering Squad issue carries its watchdog wakeups. You repair wakeups only; you never post nudges in this job.
1. List issues assigned to the squad: `multica issue list --assignee-id {{@squad:Engineering Squad}} --status in_progress --output json` (also `--status todo` and `--status in_review`). For each parent, also list its open children with `multica issue children <id> --output json`.
   If these lists are empty, end now with the step 5 summary (all counts 0). Do not widen the search to other assignees or statuses.
2. Required wakeups:
   - every open squad parent: task.failed guard targeting Workflow Watchdog, `every` stall check targeting Workflow Watchdog (30m on parents classified after 2026-10-04T08:34Z, 1h on older ones; either interval satisfies the rule, never add a second one), `issue.properties_changed` rule targeting the leader. Exception: an `in_review` parent with no `merge_watch` metadata key and every child done or cancelled needs no stall check (job 2 step 1b); do not create or re-enable it there;
   - every open child (status not done/cancelled): task.failed guard targeting Workflow Watchdog.
3. For each required rule:
   - missing → create it with exactly these commands:
     `multica issue wakeup create <issue> --kind event --event task.failed --mode continuous --max-fires 200 --agent-id {{@agent:Workflow Watchdog}} --instruction "Quota guard (job 1 in your instructions)."`
     `multica issue wakeup create <issue> --kind every --every <30m or 1h, per step 2> --expires-in 336h --agent-id {{@agent:Workflow Watchdog}} --instruction "Stall check (job 2 in your instructions)."`
     `multica issue wakeup create <issue> --kind event --event issue.properties_changed --mode continuous --filter-actor-type member --filter-actor-id <requester member id> --agent-id {{@agent:Feature Orchestrator}} --instruction "Requester changed issue properties. Re-read them with multica issue property list and act on the current Mode/QA/Max rounds."`
   - present but disabled, paused (`paused_reason` set), expired, or at its fire limit while the issue is open → `multica issue wakeup update <issue> <wakeup-id>` with the same full flags as above (update replaces the whole configuration and re-enables it).
   - never create a second copy of a rule that is already enabled.
   - requester member id: `attribution.initiator.id` of the earliest leader run on the issue (`multica issue runs <issue> --output json`) when it is a member; otherwise omit the two `--filter-actor-*` flags.
4. If a stall-check rule was just created or re-enabled on an `in_progress` parent whose last_activity_at is older than 90 minutes, run `multica issue wakeup trigger <issue> <wakeup-id>` once so the stall check (job 2) judges it now.
5. Post no comments in this job. End with a one-line summary in your final output: issues checked, rules created, rules re-enabled, checks triggered.

Changed 2026-10-04 (LING-224 retro conflict review, requester decision): stall-check interval 30m/1h and requester-filtered properties rule, matching the squad briefing.
