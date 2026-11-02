---
name: watchdog-hung-run-check
description: Workflow Watchdog job 4: scheduled 15-minute check that cancels and resumes or escalates hung runs and posts slow-run notices.
---

# watchdog-hung-run-check

Workflow Watchdog only. The GENERAL rules in your instructions (silence by default, one-line outputs, comment limits, what you may never touch) apply to every step below.

JOB 4: HUNG-RUN CHECK (scheduled autopilot "Squad hung-run check (15m)", no issue context)
Goal: a run that is `running` but silent is not progress. Detect it, cancel it, and resume or escalate it. Applies to runs of every agent except yourself (Workflow Watchdog).
1. Candidate issues: squad-assigned parents in todo/in_progress/in_review plus their open children: `multica issue list --assignee-id {{@squad:Engineering Squad}} --status <in_progress|todo|in_review> --output json`, then `multica issue children <id> --output json` per parent.
   If these lists are empty, there is nothing to check: end now with the step 9 final output (all counts 0). Do not widen the search (other assignees, other statuses, agent task lists, CLI help).
2. For each candidate, measure its running runs with this exact snippet (one pwsh call per issue). Never compute times yourself and never use `Get-Date -Format` (TIME RULE):
   ```powershell
   $now = [datetimeoffset]::UtcNow
   foreach ($r in @(multica issue runs <id> --active --output json | ConvertFrom-Json)) { if ($r.status -ne 'running') { continue }
     $msgs = @(multica issue run-messages $r.id --output json | ConvertFrom-Json)
     $last = $msgs | ForEach-Object { [datetimeoffset]$_.created_at } | Sort-Object UtcDateTime | Select-Object -Last 1
     $runMin = [math]::Round(($now - [datetimeoffset]$r.started_at).TotalMinutes, 1)
     $ageMin = if ($last) { [math]::Round(($now - $last).TotalMinutes, 1) } else { $runMin }
     "RUN=$($r.id) AGENT=$($r.agent_id) RUN_MIN=$runMin AGE_MIN=$ageMin MSGS=$($msgs.Count)" }
   ```
   Keep runs with RUN_MIN >= 20 (>= 5 for step 3a). A RUN_MIN or AGE_MIN below -2 or above 1440 is a clock error: skip that run, never cancel it.
3. Hang test: the run is HUNG when AGE_MIN >= 20 (with no messages, AGE_MIN equals RUN_MIN). Otherwise skip it. N = AGE_MIN. For a HUNG run, read only the tail of its log for the last tool call (tool name + first 200 chars of its input):
   `multica issue run-messages <run-id> --output json | ConvertFrom-Json | Select-Object -Last 4 | ConvertTo-Json -Depth 6 -Compress | ForEach-Object { $_.Substring(0, [math]::Min(3000, $_.Length)) }`
   Re-check before cancelling: immediately before any `multica issue cancel-task` in steps 3a, 5 and 6, run the step 2 snippet again for that issue and cancel only if the run is still `running` and AGE_MIN is still at or over the threshold (20, or 5 for 3a).
3a. Hung after its card (checked before the 20-minute rule): also keep `running` runs started 5+ minutes ago. If the run's agent posted a result card on this issue after the run's started_at (a comment whose first line starts with `**[` and contains `Decision needed:`), and the run's last message is 5+ minutes old, the run is HUNG-AFTER-CARD: its work is delivered, but the leader's `task.completed` wake-back will not fire while it stays open (LING-176 lost 28 min this way on 2026-10-01). Cancel it and wake the LEADER, not the run's agent:
   `multica issue cancel-task <run-id> --issue <issue>`
   `multica issue wakeup create <issue> --kind at --after 1m --agent-id {{@agent:Feature Orchestrator}} --instruction "Card-posted run cancelled by watchdog: <agent> posted its result card at <HH:MM UTC> but run <short run id> stayed open <N> min with no output. The card is final; gate it now and do not re-dispatch <agent>."`
   Post no comment. This path does not use the retry budget of steps 4-6; skip steps 4-6 for this run.
4. Retry budget: `multica issue wakeup list <issue> --output json`; count wakeups created in the last 3 hours whose instruction starts with "Hung run cancelled by watchdog".
5. First hang (count 0): cancel and resume. No comment.
   `multica issue cancel-task <run-id> --issue <issue>`
   `multica issue wakeup create <issue> --kind at --after 1m --agent-id <agent of the run> --instruction "Hung run cancelled by watchdog: your previous run <short run id> produced no output for <N> min; last step: <tool> <command excerpt>. Previous workdir (may hold uncommitted work, salvage it instead of redoing): <work_dir of the run>. Re-read the latest comments and continue from where you stopped. Do not repeat the hanging command as-is: apply your Stuck Protocol (split it, timeouts <= 5 min) or report BLOCKED with the cause and unblock options."`
6. Second hang within 3 hours (count >= 1): cancel the run (`multica issue cancel-task`), create no wakeup, and post ONE comment on that issue, in Vietnamese, mentioning the requester (the creator of the top-level parent issue when it is a member, otherwise [@Nha PC](mention://member/{{@member:hnhatr@gmail.com}})) with this meaning: "[Watchdog] <agent> bị treo lần 2 trên <issue key>: <N> phút không có output, bước cuối: <tool> `<command excerpt>`. Đã huỷ run và không tự chạy lại. Nghi ngờ: <one-line hypothesis from the last step>. Cần bạn xem trước khi chạy lại."
7. Never cancel a run that fails the hang test, never cancel more than one run per issue per check, and never run `multica issue rerun` in this job.
8. Slow-run notice (comment only; never cancel, kill or rerun for this). For each `running` run that is NOT hung and has RUN_MIN >= 20, read the tail of its log (last ~40 messages) and decide:
   - WAITING: every tool call in the last 15 minutes only waits on or polls the same background job or process (`job_output`/`job_wait`, `Wait-Job`/`Receive-Job`/`Get-Job`, `sleep`/`Start-Sleep`, `--watch`, or re-running the same status command), or a tool result says the command is "still running".
   - LONG: RUN_MIN >= 90.
   If either holds and the issue's recent comments (`--recent 5`) have no "[Watchdog]" notice naming this run's short id for the same condition, post ONE comment on that issue, in Vietnamese, starting with "[Watchdog] [@all](mention://all/all)" (the @all mention keeps the comment from triggering the assignee), meaning: "<agent> đã chạy <N> phút trên <issue key> (run <short run id>). <WAITING: Đang chờ `<command excerpt>` <M> phút mà không có tiến triển, có thể bị treo. | LONG: Đang làm: <tool> `<command excerpt>`.> Watchdog chưa can thiệp gì." Do not mention the squad leader.
9. End with a one-line final output: runs checked, hung runs cancelled, cancelled after card, resumed, escalated, slow-run notices posted. Post no comment when nothing is hung or slow.
