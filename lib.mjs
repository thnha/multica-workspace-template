// Shared helpers for export.mjs / apply.mjs. No dependencies beyond Node >= 18.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

export const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;

export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith("--")) { out._.push(a); continue; }
    const eq = a.indexOf("=");
    let key, val;
    if (eq > 0) { key = a.slice(2, eq); val = a.slice(eq + 1); }
    else {
      key = a.slice(2);
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) { val = next; i++; } else val = true;
    }
    if (key in out) out[key] = [].concat(out[key], val); else out[key] = val;
  }
  return out;
}

// Runs `multica <args> [--workspace-id ws] --output json` and returns parsed JSON.
// Arguments go through execFileSync (no shell), so multi-line text and quotes are passed verbatim.
export function makeCli({ workspaceId, dryRun = false, log = () => {} } = {}) {
  function run(args, { json = true, input, mutate = false } = {}) {
    const full = [...args];
    if (workspaceId) full.push("--workspace-id", workspaceId);
    if (json && !full.includes("--output")) full.push("--output", "json");
    if (mutate && dryRun) {
      log("[dry-run] multica " + full.map(a => (/[\s"]/.test(a) ? JSON.stringify(a.length > 60 ? a.slice(0, 57) + "..." : a) : a)).join(" "));
      return { id: "<dry-run-id>" };
    }
    let stdout;
    try {
      stdout = execFileSync("multica", full, {
        encoding: "utf8",
        input,
        stdio: [input === undefined ? "ignore" : "pipe", "pipe", "pipe"],
        maxBuffer: 256 * 1024 * 1024,
        windowsHide: true,
      });
    } catch (e) {
      const msg = (e.stderr || "").toString().trim() || e.message;
      throw new Error(`multica ${args.slice(0, 3).join(" ")} failed: ${msg}`);
    }
    if (!json) return stdout;
    const t = stdout.trim();
    return t ? JSON.parse(t) : null;
  }
  return run;
}

// List endpoints return either an array or an object wrapping one array.
export function asList(d) {
  if (Array.isArray(d)) return d;
  if (d && typeof d === "object") {
    const k = Object.keys(d).find(k => Array.isArray(d[k]));
    if (k) return d[k];
  }
  return [];
}

export function slugify(s) {
  return s.normalize("NFKD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "item";
}

export function writeJson(file, obj) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + "\n");
}

export function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback;
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, text ?? "");
}

export function readText(file, fallback = "") {
  return fs.existsSync(file) ? fs.readFileSync(file, "utf8") : fallback;
}
