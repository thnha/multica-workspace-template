#!/usr/bin/env node
// Export a Multica workspace's configuration into ./template (portable, no IDs, no secrets).
//
//   node export.mjs [--workspace-id <id>] [--out template]
//
// IDs embedded in text (instructions, prompts, context) are rewritten to placeholders
// such as {{@agent:Feature Orchestrator}}; apply.mjs resolves them in the new workspace.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, makeCli, asList, slugify, writeJson, writeText, UUID_RE } from "./lib.mjs";

const args = parseArgs(process.argv.slice(2));
const outDir = path.resolve(args.out || "template");
const cli = makeCli({ workspaceId: args["workspace-id"] });
const warnings = [];
const log = (...m) => console.error(...m);

const ws = cli(["workspace", "get", ...(args["workspace-id"] ? [args["workspace-id"]] : [])]);
log(`Exporting workspace "${ws.name}" (${ws.slug}) -> ${outDir}`);

const agents = asList(cli(["agent", "list"]));
const skills = asList(cli(["skill", "list"]));
const squads = asList(cli(["squad", "list"]));
const projects = asList(cli(["project", "list"]));
const properties = asList(cli(["property", "list"]));
const labels = asList(cli(["label", "list"]));
const autopilots = asList(cli(["autopilot", "list"]));
const runtimes = asList(cli(["runtime", "list"]));
const members = asList(cli(["workspace", "member", "list"]));

// ---- id -> placeholder map --------------------------------------------------
const ph = new Map();
ph.set(ws.id, "{{@workspace}}");
for (const a of agents) ph.set(a.id, `{{@agent:${a.name}}}`);
for (const s of skills) ph.set(s.id, `{{@skill:${s.name}}}`);
for (const s of squads) ph.set(s.id, `{{@squad:${s.name}}}`);
for (const p of projects) ph.set(p.id, `{{@project:${p.title}}}`);
for (const p of properties) ph.set(p.id, `{{@property:${p.name}}}`);
for (const l of labels) ph.set(l.id, `{{@label:${l.name}}}`);
for (const m of members) ph.set(m.user_id, `{{@member:${m.email}}}`);
const runtimeById = new Map(runtimes.map(r => [r.id, r]));
const emailByUser = new Map(members.map(m => [m.user_id, m.email]));

function portable(text, where) {
  if (!text) return text ?? "";
  return text.replace(UUID_RE, id => {
    if (ph.has(id)) return ph.get(id);
    warnings.push(`${where}: unknown id ${id} kept as-is`);
    return id;
  });
}

// ---- reset output (only generated folders) ---------------------------------
for (const d of ["agents", "skills", "squads", "autopilots"]) fs.rmSync(path.join(outDir, d), { recursive: true, force: true });

// ---- workspace ---------------------------------------------------------------
writeJson(path.join(outDir, "workspace.json"), {
  name: ws.name,
  description: portable(ws.description, "workspace.description"),
  issue_prefix: ws.issue_prefix,
  settings: ws.settings || {},
  repos: (ws.repos || []).map(r => ({ url: r.url, description: r.description || "" })),
  // user ids are global across workspaces; used to resolve {{@member:<email>}} when that person is not yet a member.
  members: Object.fromEntries(members.map(m => [m.email, m.user_id])),
});
writeText(path.join(outDir, "context.md"), portable(ws.context, "workspace.context"));

// ---- labels / properties ----------------------------------------------------
writeJson(path.join(outDir, "labels.json"), labels.map(l => ({
  name: l.name, color: l.color, description: l.description || "", resource_type: l.resource_type || "issue",
})));
writeJson(path.join(outDir, "properties.json"), properties.filter(p => !p.archived).map(p => ({
  name: p.name, type: p.type, icon: p.icon || "", description: portable(p.description, `property ${p.name}`),
  options: (p.config?.options || []).map(o => ({ name: o.name, color: o.color })),
})));

// ---- skills -----------------------------------------------------------------
for (const s of skills) {
  const full = cli(["skill", "get", s.id, "--with-content"]);
  const dir = path.join(outDir, "skills", slugify(s.name));
  writeJson(path.join(dir, "skill.json"), {
    name: full.name, description: portable(full.description, `skill ${s.name}`), config: full.config || {},
    labels: (s.labels || []).map(l => l.name ?? l),
  });
  writeText(path.join(dir, "SKILL.md"), portable(full.content, `skill ${s.name}`));
  for (const f of full.files || []) writeText(path.join(dir, "files", f.path), portable(f.content, `skill ${s.name}/${f.path}`));
}
log(`  skills: ${skills.length}`);

// ---- agents -----------------------------------------------------------------
const secretsExample = { agents: {} };
for (const a of agents.filter(a => !a.archived_at)) {
  const rt = runtimeById.get(a.runtime_id);
  const targets = a.invocation_targets || [];
  let envKeys = [];
  if (a.custom_env_key_count > 0) {
    // Only key names are kept; values never leave this process.
    try { envKeys = Object.keys(cli(["agent", "env", "get", a.id]) || {}); }
    catch (e) { warnings.push(`agent ${a.name}: could not read env keys (${e.message})`); }
  }
  const dir = path.join(outDir, "agents", slugify(a.name));
  writeJson(path.join(dir, "agent.json"), {
    name: a.name,
    description: portable(a.description, `agent ${a.name}`),
    avatar: a.avatar_url || null,
    runtime_provider: rt?.provider || null,
    runtime_name_hint: rt?.name || null,
    model: a.model || "",
    thinking_level: a.thinking_level || "",
    service_tier: a.service_tier || "",
    max_concurrent_tasks: a.max_concurrent_tasks,
    custom_args: a.custom_args || [],
    runtime_config: a.runtime_config || {},
    conversation_starters: JSON.parse(portable(JSON.stringify(a.conversation_starters || []), `agent ${a.name} starters`)),
    permission_mode: a.permission_mode,
    public_to_workspace: targets.some(t => t.target_type === "workspace"),
    public_to_members: targets.filter(t => t.target_type === "member").map(t => emailByUser.get(t.target_id) || t.target_id),
    skills: (a.skills || []).map(s => s.name),
    custom_env_keys: envKeys,
    custom_env_key_count: a.custom_env_key_count || 0,
    needs_mcp_config: !!(a.mcp_config || a.mcp_config_redacted),
  });
  writeText(path.join(dir, "instructions.md"), portable(a.instructions, `agent ${a.name}`));
  if (a.custom_env_key_count > 0 || a.mcp_config || a.mcp_config_redacted) {
    secretsExample.agents[a.name] = {};
    if (envKeys.length) secretsExample.agents[a.name].custom_env = Object.fromEntries(envKeys.map(k => [k, ""]));
    else if (a.custom_env_key_count > 0) secretsExample.agents[a.name].custom_env = Object.fromEntries(
      Array.from({ length: a.custom_env_key_count }, (_, i) => [`FILL_IN_KEY_NAME_${i + 1}`, ""]));
    if (a.mcp_config || a.mcp_config_redacted) secretsExample.agents[a.name].mcp_config = { mcpServers: {} };
  }
}
writeJson(path.join(outDir, "..", "secrets.example.json"), secretsExample);
log(`  agents: ${agents.length}`);

// ---- squads -----------------------------------------------------------------
for (const s of squads.filter(s => !s.archived_at)) {
  const full = cli(["squad", "get", s.id]);
  const mem = asList(cli(["squad", "member", "list", s.id]));
  const nameOf = id => agents.find(a => a.id === id)?.name;
  const dir = path.join(outDir, "squads", slugify(s.name));
  writeJson(path.join(dir, "squad.json"), {
    name: s.name,
    description: portable(full.description, `squad ${s.name}`),
    avatar_url: full.avatar_url || null,
    leader: nameOf(full.leader_id),
    members: mem.filter(m => m.role !== "leader").map(m => m.member_type === "agent"
      ? { type: "agent", agent: nameOf(m.member_id), role: m.role }
      : { type: "member", email: emailByUser.get(m.member_id) || m.member_id, role: m.role }),
  });
  writeText(path.join(dir, "instructions.md"), portable(full.instructions, `squad ${s.name}`));
}
log(`  squads: ${squads.length}`);

// ---- projects ---------------------------------------------------------------
const projOut = [];
for (const p of projects) {
  const res = asList(cli(["project", "resource", "list", p.id]));
  projOut.push({
    title: p.title,
    description: portable(p.description, `project ${p.title}`),
    icon: p.icon || "",
    status: p.status || "",
    lead: p.lead_id ? (agents.find(a => a.id === p.lead_id)?.name || emailByUser.get(p.lead_id) || null) : null,
    repos: res.filter(r => r.resource_type === "github_repo").map(r => r.resource_ref?.url).filter(Boolean),
  });
}
writeJson(path.join(outDir, "projects.json"), projOut);
log(`  projects: ${projects.length}`);

// ---- autopilots -------------------------------------------------------------
for (const ap of autopilots) {
  const full = cli(["autopilot", "get", ap.id]);
  const a = full.autopilot || full;
  const dir = path.join(outDir, "autopilots", slugify(a.title));
  writeJson(path.join(dir, "autopilot.json"), {
    title: a.title,
    agent: agents.find(x => x.id === a.assignee_id)?.name || null,
    mode: a.execution_mode,
    issue_title_template: a.issue_title_template || "",
    project: projects.find(p => p.id === a.project_id)?.title || null,
    subscribers: (a.subscribers || []).map(s => emailByUser.get(s.user_id || s.id || s) || s),
    status_in_source: a.status,
    triggers: (full.triggers || []).map(t => ({
      kind: t.kind, cron: t.cron_expression || "", timezone: t.timezone || "UTC", label: t.label || "", enabled: t.enabled,
    })),
  });
  writeText(path.join(dir, "prompt.md"), portable(a.description, `autopilot ${a.title}`));
}
log(`  autopilots: ${autopilots.length}`);

// ---- not exportable ---------------------------------------------------------
const mcp = asList(cli(["workspace", "mcp", "list"]));
if (mcp.length) warnings.push(`workspace MCP library has ${mcp.length} server(s); re-add them manually (contains secrets)`);
for (const a of agents) if ((a.disabled_runtime_skills || []).length)
  warnings.push(`agent ${a.name}: ${a.disabled_runtime_skills.length} disabled runtime skill(s) are machine-local and not exported`);

writeJson(path.join(outDir, "export-warnings.json"), warnings);
if (warnings.length) { log("Warnings:"); for (const w of warnings) log("  - " + w); }
log("Done.");
