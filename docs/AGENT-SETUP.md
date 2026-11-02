## Agent runbook: set up this workspace from the template

Audience: a Multica agent running **inside the target workspace** whose requester asked something like
"setup workspace theo template https://github.com/thnha/multica-workspace-template".
The requester has already created the workspace, connected a daemon, and created you as its first agent.

Write every message to the requester in Vietnamese. Keep commands, IDs and file names as they are.

### Known limits (check them, report them)

- **L1 Guard scope.** `apply.mjs` refuses real runs inside an agent task unless the target is the task's own
  workspace (`--self`, which uses `$MULTICA_WORKSPACE_ID`). The `probe` check (reads must return objects of the
  target workspace) still runs as a second guard. If either guard stops the run (exit code 3), do not work
  around it: report it.
- **L2 Token permissions are unverified.** An agent token may lack the scope to create skills, agents, squads,
  autopilots, properties or to update the workspace context. Reading agent env (`multica agent env get`) is known
  to be denied. `apply.mjs` records each denied call in `denied` of `apply-report-<workspace-id>.json`, skips
  it, continues, and exits with code 4.

### Steps

1. Check prerequisites: `node -v` (≥ 18), `git --version`, `echo $MULTICA_WORKSPACE_ID` is set,
   `multica runtime list --output json` returns at least one runtime.
2. Fetch the template into your working directory:
   `git clone https://github.com/thnha/multica-workspace-template.git tpl && cd tpl`
3. Dry run: `node apply.mjs --self --dry-run`. Summarise for the requester what would be created
   (counts of skills, agents, squads, projects, autopilots) and which existing items are reused by name.
4. Ask the requester to confirm. Do not run for real without an explicit confirmation in the chat.
5. Real run: `node apply.mjs --self` (add `--with-repos` / `--activate-autopilots` only if the requester asked).
6. Read `apply-report-<workspace-id>.json` (`todo`, `warnings`, `denied`).
7. Agents are matched by name. If your own name matches a template agent (see `template/agents/*/agent.json`),
   you were reused and your instructions and skills were not overwritten: tell the requester. Fix: the requester
   renames you in the UI to a name not in the template (for example `Setup Agent`), then re-run `--self`.
8. Re-running is safe: anything that already exists by name is reused.

### Report to the requester

Always send one report with these fields:

- `Result`: PASS (exit 0), PARTIAL (exit 4, some calls denied) or BLOCKED (exit 2/3 or another error).
- `Key points`: what was created; what was reused.
- `Not verified` / failures, mapped to L1 / L2:
  - **L1 hit (exit 3)** → propose: the requester runs `node apply.mjs --workspace-id <id>` from their own
    terminal (logged in with `multica login` as a workspace member). Give the exact command.
  - **L2 hit (exit 4)** → list the denied command types and counts from `denied`. Propose, in order:
    A. the requester re-runs `node apply.mjs --workspace-id <id>` from their own terminal; it only creates what is
       still missing; B. ask a workspace owner/admin to grant the needed permission, then re-run `--self`;
       C. create the few missing items by hand in the UI (only if the list is short).
  - **exit 2 (no runtime)** → ask the requester to connect a daemon (`multica daemon restart`, then
    `multica runtime list`) and re-run.
- `Needed from you`: the report's `todo` list (env/MCP secrets, avatars, paused autopilots, repos, invites).
- `Next`: the exact command for the next step, if any.

Never paste secret values into a comment, and never try another account's token or credentials to get past L1/L2.
