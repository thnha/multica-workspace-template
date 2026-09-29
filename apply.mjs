#!/usr/bin/env node
// Create (or complete) a Multica workspace from ./template.
//
//   node apply.mjs --name "My WS" --slug my-ws --prefix MWS [options]
//   node apply.mjs --workspace-id <id> [options]        # resume / apply into an existing workspace
//
// Options:
//   --template <dir>            template folder (default ./template)
//   --secrets <file>            JSON like secrets.example.json with real custom_env / mcp_config values
//   --runtime <provider>=<id>   pin the runtime for a provider (repeatable), e.g. --runtime claude=<runtime-id>
//   --machine <text>            prefer runtimes whose name contains <text> (e.g. NhaTran-PC)
//   --with-repos                also add workspace repos and project repo resources
//   --activate-autopilots       leave autopilots active (default: paused)
//   --dry-run                   print what would be created; changes nothing
//
// Re-running is safe: anything that already exists by name is reused, not duplicated.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, makeCli, asList, readJson, readText, writeJson } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const T = path.resolve(args.template || "template");
const dryRun = !!args["dry-run"];
const log = (...m) => console.error(...m);
const todo = [];      // manual follow-ups printed at the end
const warnings = [];

if (!fs.existsSync(path.join(T, "workspace.json"))) { log(`Template not found: ${T}`); process.exit(1); }
if (!args["workspace-id"] && !(args.name && args.slug)) {
  log("Usage: node apply.mjs --name <name> --slug <slug> [--prefix <PREFIX>] | --workspace-id <id>  (see header for options)");
  process.exit(1);
}

if (process.env.MULTICA_TASK_ID && !dryRun) {
  log("Refusing to run inside a Multica agent task: its token is scoped to the task's workspace. Run from your own terminal.");
  process.exit(3);
}

const tWs = readJson(path.join(T, "workspace.json"));
const listDir = d => fs.existsSync(path.join(T, d)) ? fs.readdirSync(path.join(T, d)).filter(n => fs.statSync(path.join(T, d, n)).isDirectory()) : [];
const tSkills = listDir("skills").map(d => ({ dir: path.join(T, "skills", d), ...readJson(path.join(T, "skills", d, "skill.json")) }));
const tAgents = listDir("agents").map(d => ({ dir: path.join(T, "agents", d), ...readJson(path.join(T, "agents", d, "agent.json")) }));
const tSquads = listDir("squads").map(d => ({ dir: path.join(T, "squads", d), ...readJson(path.join(T, "squads", d, "squad.json")) }));
const tAutopilots = listDir("autopilots").map(d => ({ dir: path.join(T, "autopilots", d), ...readJson(path.join(T, "autopilots", d, "autopilot.json")) }));
const tProjects = readJson(path.join(T, "projects.json"), []);
const tLabels = readJson(path.join(T, "labels.json"), []);
const tProps = readJson(path.join(T, "properties.json"), []);
const secrets = args.secrets ? readJson(path.resolve(args.secrets), {}) : {};

// ---- target workspace ---------------------------------------------------------
const base = makeCli({ log });
let wsId = args["workspace-id"];
let created = false;
if (!wsId) {
  const existing = asList(base(["workspace", "list"])).find(w => w.slug === args.slug);
  if (existing) {
    log(`Workspace slug "${args.slug}" already exists; continuing into it (${existing.id}).`);
    wsId = existing.id;
  } else if (dryRun) {
    log(`[dry-run] would create workspace "${args.name}" (${args.slug}, prefix ${args.prefix || tWs.issue_prefix})`);
  } else {
    const ws = base(["workspace", "create", "--name", args.name, "--slug", args.slug,
      ...(args.prefix ? ["--issue-prefix", args.prefix] : []),
      ...(tWs.description ? ["--description", tWs.description.replace(/\\/g, "\\\\")] : [])]);
    wsId = ws.id; created = true;
    log(`Created workspace ${ws.name} (${ws.slug}) id=${ws.id}`);
  }
}
// Safety: a token scoped to another workspace (e.g. inside a Multica agent run) silently ignores
// --workspace-id and would write into the wrong workspace. Verify reads really hit the target.
if (wsId) {
  const probe = [...asList(base(["label", "list", "--workspace-id", wsId])), ...asList(base(["skill", "list", "--workspace-id", wsId]))];
  const wrong = probe.find(x => x.workspace_id && x.workspace_id !== wsId);
  let ok = !wrong;
  try { base(["workspace", "get", wsId]); } catch { ok = false; }
  if (!ok) {
    log(`Refusing to continue: this CLI session cannot act on workspace ${wsId} (its token is scoped elsewhere).`);
    log("Run apply.mjs from your own terminal, logged in with `multica login` as a member of the target workspace.");
    process.exit(3);
  }
}
const cli = makeCli({ workspaceId: wsId, dryRun, log });
const read = (a) => (wsId ? cli(a) : null);           // reads against a not-yet-created workspace return nothing
const mut = (a, opts = {}) => cli(a, { ...opts, mutate: true });

// ---- placeholder resolution -----------------------------------------------------
const ids = { agent: new Map(), skill: new Map(), squad: new Map(), project: new Map(), property: new Map(), label: new Map(), member: new Map() };
const targetMembers = asList(read(["workspace", "member", "list"]));
for (const m of targetMembers) ids.member.set(m.email, m.user_id);
// User ids are global, so a mention of someone who is not a member yet still points at the right person.
const notMembers = new Set();
for (const [email, uid] of Object.entries(tWs.members || {})) {
  if (!ids.member.has(email)) { ids.member.set(email, uid); notMembers.add(email); }
}
const toInvite = new Set();
function resolve(text) {
  const missing = [];
  const out = (text || "").replace(/\{\{@([a-z]+)(?::([^}]*))?\}\}/g, (m, kind, name) => {
    if (kind === "workspace") return wsId || m;
    if (kind === "member" && notMembers.has(name)) toInvite.add(name);
    const id = ids[kind]?.get(name);
    if (id) return id;
    missing.push(m);
    return m;
  });
  return { text: out, missing };
}
const deferred = []; // texts that referenced things not created yet: re-resolved at the end

// ---- context --------------------------------------------------------------------
const ctx = resolve(readText(path.join(T, "context.md")));
if (ctx.text.trim()) {
  mut(["workspace", "update", wsId || "<new>", "--context-stdin"], { input: ctx.text });
  if (ctx.missing.length) deferred.push({ kind: "context", raw: readText(path.join(T, "context.md")) });
  log("Context: set");
}

// ---- labels / properties --------------------------------------------------------
const haveLabels = new Map(asList(read(["label", "list"])).map(l => [l.name, l.id]));
for (const l of tLabels) {
  if (haveLabels.has(l.name)) { ids.label.set(l.name, haveLabels.get(l.name)); continue; }
  const r = mut(["label", "create", "--name", l.name, "--color", l.color, "--resource-type", l.resource_type || "issue",
    ...(l.description ? ["--description", l.description] : [])]);
  if (r) ids.label.set(l.name, r.id);
}
const haveProps = new Map(asList(read(["property", "list"])).map(p => [p.name, p.id]));
for (const p of tProps) {
  if (haveProps.has(p.name)) { ids.property.set(p.name, haveProps.get(p.name)); continue; }
  const r = mut(["property", "create", "--name", p.name, "--type", p.type,
    ...(p.icon ? ["--icon", p.icon] : []),
    ...(p.description ? ["--description", p.description] : []),
    ...p.options.flatMap(o => ["--option", o.color ? `${o.name}:${o.color}` : o.name])]);
  if (r) ids.property.set(p.name, r.id);
}
log(`Labels: ${tLabels.length}, properties: ${tProps.length}`);

// ---- skills -----------------------------------------------------------------------
const haveSkills = new Map(asList(read(["skill", "list"])).map(s => [s.name, s.id]));
let newSkills = 0;
for (const s of tSkills) {
  if (haveSkills.has(s.name)) { ids.skill.set(s.name, haveSkills.get(s.name)); continue; }
  const r = mut(["skill", "create", "--name", s.name, "--content-file", path.join(s.dir, "SKILL.md"),
    ...(s.description ? ["--description", s.description] : []),
    ...(s.config && Object.keys(s.config).length ? ["--config", JSON.stringify(s.config)] : [])]);
  const id = r?.id;
  if (id) ids.skill.set(s.name, id);
  newSkills++;
  const filesDir = path.join(s.dir, "files");
  const walk = d => fs.readdirSync(d).flatMap(n => fs.statSync(path.join(d, n)).isDirectory() ? walk(path.join(d, n)) : [path.join(d, n)]);
  if (fs.existsSync(filesDir)) for (const f of walk(filesDir)) {
    mut(["skill", "files", "upsert", id || "<new>", "--path", path.relative(filesDir, f).split(path.sep).join("/"), "--content-file", f]);
  }
  if ((s.labels || []).length) warnings.push(`skill ${s.name}: labels ${s.labels.join(", ")} not applied (add them in the UI)`);
}
log(`Skills: ${newSkills} created, ${tSkills.length - newSkills} already present`);

// ---- runtimes -------------------------------------------------------------------------
const runtimes = asList(read(["runtime", "list"]));
const pinned = new Map([].concat(args.runtime || []).map(s => s.split("=")));
function pickRuntime(agent) {
  const p = agent.runtime_provider;
  if (pinned.has(p)) return pinned.get(p);
  let c = runtimes.filter(r => r.provider === p);
  if (args.machine) { const m = c.filter(r => (r.name || "").includes(args.machine)); if (m.length) c = m; }
  const hint = c.find(r => r.name === agent.runtime_name_hint);
  return (hint || c.find(r => r.status === "online") || c[0])?.id;
}
const missingProviders = [...new Set(tAgents.filter(a => !pickRuntime(a)).map(a => a.runtime_provider))];
if (missingProviders.length && !dryRun) {
  writeJson(path.resolve(`apply-report-${wsId}.json`), { workspace_id: wsId, stopped_at: "runtimes", missing_providers: missingProviders });
  log(`\nStopped before agents: no runtime for provider(s) ${missingProviders.join(", ")} in workspace ${wsId}.`);
  log("Connect a daemon to this workspace (run `multica setup` / `multica login` on the machine, then restart the daemon),");
  log(`check with: multica runtime list --workspace-id ${wsId}`);
  log(`then re-run: node apply.mjs --workspace-id ${wsId} ${process.argv.slice(2).filter(a => !["--name", "--slug", "--prefix"].includes(a)).join(" ")}`);
  log("(or pin one explicitly with --runtime <provider>=<runtime-id>)");
  process.exit(2);
}
if (missingProviders.length) log(`[dry-run] note: no runtime yet for ${missingProviders.join(", ")} (a new workspace has none until a daemon joins)`);

// ---- agents -----------------------------------------------------------------------------
const haveAgents = new Map(asList(read(["agent", "list"])).map(a => [a.name, a.id]));
for (const a of tAgents) if (haveAgents.has(a.name)) ids.agent.set(a.name, haveAgents.get(a.name));
let newAgents = 0;
const avatars = [];
for (const a of tAgents) {
  if (haveAgents.has(a.name)) continue;
  const rawInstr = readText(path.join(a.dir, "instructions.md"));
  const instr = resolve(rawInstr);
  if (instr.text.length > 30000) warnings.push(`agent ${a.name}: instructions are ${instr.text.length} chars; Windows command lines cap near 32k`);
  const sec = secrets.agents?.[a.name] || {};
  const members = (a.public_to_members || []).map(e => ids.member.get(e)).filter(Boolean);
  const r = mut(["agent", "create", "--name", a.name, "--runtime-id", pickRuntime(a) || "<runtime>",
    "--description", a.description || "", "--instructions", instr.text,
    "--model", a.model || "",
    ...(a.thinking_level ? ["--thinking-level", a.thinking_level] : []),
    ...(a.service_tier ? ["--service-tier", a.service_tier] : []),
    "--max-concurrent-tasks", String(a.max_concurrent_tasks || 6),
    ...((a.custom_args || []).length ? ["--custom-args", JSON.stringify(a.custom_args)] : []),
    ...(a.runtime_config && Object.keys(a.runtime_config).length ? ["--runtime-config", JSON.stringify(a.runtime_config)] : []),
    ...((a.conversation_starters || []).length ? ["--conversation-starters", resolve(JSON.stringify(a.conversation_starters)).text] : []),
    "--permission-mode", a.permission_mode || "private",
    ...(a.public_to_workspace ? ["--public-to-workspace"] : []),
    ...members.flatMap(m => ["--public-to-member", m]),
    ...(sec.custom_env && !Object.keys(sec.custom_env).some(k => k.startsWith("FILL_IN")) ? ["--custom-env-stdin"] : []),
  ], { input: sec.custom_env ? JSON.stringify(sec.custom_env) : undefined });
  const id = r?.id;
  if (id) ids.agent.set(a.name, id);
  newAgents++;
  if (instr.missing.length) deferred.push({ kind: "agent", name: a.name, raw: rawInstr });
  if (sec.mcp_config && id) mut(["agent", "update", id, "--mcp-config-stdin"], { input: JSON.stringify(sec.mcp_config) });
  const skillIds = (a.skills || []).map(n => ids.skill.get(n)).filter(Boolean);
  if (skillIds.length || dryRun) mut(["agent", "skills", "set", id || "<new>", "--skill-ids", skillIds.join(",") || "<skills>"]);
  if (a.custom_env_key_count && !(sec.custom_env && !Object.keys(sec.custom_env).some(k => k.startsWith("FILL_IN"))))
    todo.push(`Agent "${a.name}": set its ${a.custom_env_key_count} custom env var(s) (Agent settings -> Environment, or --secrets)`);
  if (a.needs_mcp_config && !sec.mcp_config) todo.push(`Agent "${a.name}": set its MCP config`);
  if (a.avatar) avatars.push(`${a.name} ${a.avatar.replace(/^emoji:/, "")}`);
}
if (avatars.length) todo.push(`Agent avatars are not settable from the CLI; set them in the UI: ${avatars.join(", ")}`);
log(`Agents: ${newAgents} created, ${tAgents.length - newAgents} already present`);

// ---- squads -------------------------------------------------------------------------------
const haveSquads = new Map(asList(read(["squad", "list"])).map(s => [s.name, s.id]));
for (const s of tSquads) {
  let id = haveSquads.get(s.name);
  if (!id) {
    const r = mut(["squad", "create", "--name", s.name, "--leader", ids.agent.get(s.leader) || s.leader,
      ...(s.description ? ["--description", s.description] : [])]);
    id = r?.id;
  }
  if (id) ids.squad.set(s.name, id);
  const rawInstr = readText(path.join(s.dir, "instructions.md"));
  const instr = resolve(rawInstr);
  mut(["squad", "update", id || "<new>", "--instructions", instr.text]);
  if (instr.missing.length) deferred.push({ kind: "squad", name: s.name, raw: rawInstr });
  const present = new Set(id && !id.startsWith("<") ? asList(cli(["squad", "member", "list", id])).map(m => m.member_id) : []);
  for (const m of s.members) {
    const mid = m.type === "agent" ? ids.agent.get(m.agent) : ids.member.get(m.email);
    if (!mid) { warnings.push(`squad ${s.name}: member ${m.agent || m.email} not found`); continue; }
    if (present.has(mid)) continue;
    mut(["squad", "member", "add", id || "<new>", "--member-id", mid, "--type", m.type, "--role", m.role || "member"]);
  }
}
log(`Squads: ${tSquads.length}`);

// ---- projects ------------------------------------------------------------------------------
const haveProjects = new Map(asList(read(["project", "list"])).map(p => [p.title, p.id]));
for (const p of tProjects) {
  if (haveProjects.has(p.title)) { ids.project.set(p.title, haveProjects.get(p.title)); continue; }
  const desc = resolve(p.description);
  const r = mut(["project", "create", "--title", p.title,
    ...(desc.text ? ["--description", desc.text] : []),
    ...(p.icon ? ["--icon", p.icon] : []),
    ...(p.status ? ["--status", p.status] : []),
    ...(p.lead ? ["--lead", p.lead] : []),
    ...(args["with-repos"] ? p.repos.flatMap(u => ["--repo", u]) : [])]);
  if (r?.id) ids.project.set(p.title, r.id);
  if (desc.missing.length) deferred.push({ kind: "project", name: p.title, raw: p.description });
  if (!args["with-repos"] && p.repos.length) todo.push(`Project "${p.title}": attach repo(s) ${p.repos.join(", ")} if needed (or re-run with --with-repos)`);
}
log(`Projects: ${tProjects.length}`);

// ---- workspace repos ------------------------------------------------------------------------
if (args["with-repos"]) {
  const have = new Set(asList(read(["repo", "list"])).map(r => r.url));
  for (const r of tWs.repos || []) if (!have.has(r.url))
    mut(["repo", "add", "--url", r.url, ...(r.description ? ["--description", r.description] : [])]);
} else if ((tWs.repos || []).length) {
  todo.push(`Workspace repos not added (template has ${tWs.repos.length}); add with: multica repo add <url> --workspace-id ${wsId || "<new-id>"}`);
}

// ---- autopilots ------------------------------------------------------------------------------
const haveAutopilots = new Set(asList(read(["autopilot", "list"])).map(a => a.title));
for (const ap of tAutopilots) {
  if (haveAutopilots.has(ap.title)) continue;
  const prompt = resolve(readText(path.join(ap.dir, "prompt.md")));
  if (prompt.missing.length) warnings.push(`autopilot ${ap.title}: unresolved ${prompt.missing.join(", ")}`);
  const r = mut(["autopilot", "create", "--title", ap.title, "--agent", ids.agent.get(ap.agent) || ap.agent,
    "--mode", ap.mode, "--description", prompt.text,
    ...(ap.issue_title_template ? ["--issue-title-template", ap.issue_title_template] : []),
    ...(ap.project && ids.project.get(ap.project) ? ["--project", ids.project.get(ap.project)] : []),
    ...(ap.subscribers || []).flatMap(e => ["--subscriber", ids.member.get(e) || e])]);
  const id = r?.id || "<new>";
  // Pause before adding triggers so nothing fires on a half-configured workspace.
  if (!args["activate-autopilots"]) mut(["autopilot", "update", id, "--status", "paused"]);
  for (const t of ap.triggers || []) {
    if (t.kind !== "schedule") { todo.push(`Autopilot "${ap.title}": re-create its ${t.kind} trigger manually (secrets are not exported)`); continue; }
    mut(["autopilot", "trigger-add", id, "--kind", "schedule", "--cron", t.cron, "--timezone", t.timezone || "UTC",
      ...(t.label ? ["--label", t.label] : [])]);
  }
  if (!args["activate-autopilots"]) todo.push(`Autopilot "${ap.title}" is paused: multica autopilot update ${id} --status active --workspace-id ${wsId || "<new-id>"}`);
}
log(`Autopilots: ${tAutopilots.length}`);

// ---- second pass for forward references ------------------------------------------------------
for (const d of deferred) {
  const r = resolve(d.raw);
  if (r.missing.length) { warnings.push(`${d.kind} ${d.name || ""}: unresolved ${r.missing.join(", ")}`); continue; }
  if (d.kind === "context") mut(["workspace", "update", wsId, "--context-stdin"], { input: r.text });
  if (d.kind === "agent") mut(["agent", "update", ids.agent.get(d.name), "--instructions", r.text]);
  if (d.kind === "squad") mut(["squad", "update", ids.squad.get(d.name), "--instructions", r.text]);
  if (d.kind === "project") mut(["project", "update", ids.project.get(d.name), "--description", r.text]);
}

for (const e of toInvite) todo.push(`${e} is mentioned in texts but is not a member: multica workspace member invite ${e} --workspace-id ${wsId || "<new-id>"}`);

// ---- report --------------------------------------------------------------------------------------
todo.push("Agents' disabled runtime skills (per-machine toggles) are not part of the template; re-toggle in the UI if you used them.");
if (!dryRun) {
  const report = { workspace_id: wsId, created_workspace: created, ids: Object.fromEntries(Object.entries(ids).map(([k, m]) => [k, Object.fromEntries(m)])), todo, warnings };
  writeJson(path.resolve(`apply-report-${wsId}.json`), report);
  log(`\nReport: apply-report-${wsId}.json`);
}
if (warnings.length) { log("\nWarnings:"); for (const w of warnings) log("  - " + w); }
log("\nManual follow-ups:"); for (const t of todo) log("  - " + t);
log(`\nDone. Workspace id: ${wsId || "(dry-run)"}; switch to it with: multica workspace switch ${args.slug || wsId}`);
