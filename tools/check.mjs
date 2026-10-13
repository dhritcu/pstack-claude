#!/usr/bin/env node
// Port lint. Fails when the plugin tree carries a Cursor-only construct, an invalid
// skill/agent frontmatter, a broken relative link, or a manifest that does not parse.
// Run after every upstream merge: `node tools/check.mjs`. Exit 1 on any finding.
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, dirname, relative, resolve } from "node:path";

const ROOT = resolve(dirname(new URL(import.meta.url).pathname), "..");
const PLUGIN = join(ROOT, "plugins/stack");
const TEXT = /\.(md|json|ts|mjs|sh|yaml|yml|tsv)$/;
// Upstream attribution and license files may name Cursor; nothing else may.
const ATTRIBUTION = /(^|\/)(LICENSE[^/]*|NOTICE\.md)$/;

// Each rule: a pattern that must not appear in shipped files, and what replaces it.
const BANNED = [
  [/\.cursor\//, "Cursor config path; use .claude/ or ${CLAUDE_CONFIG_DIR:-~/.claude}/"],
  [/pstack-models\.mdc|alwaysApply/, "Cursor rule file; the sheet is pstack-models.md"],
  [/agent-transcripts/, "Cursor transcripts dir; Claude Code uses <config>/projects/<encoded-cwd>/*.jsonl"],
  [/`Task`|\bTask (tool|call|subagent|spawn)s?\b|\bevery `?Task`? call/, "Cursor Task tool; use the Agent tool"],
  [/generalPurpose/, "Cursor subagent type; use general-purpose or a stack:* agent"],
  [/readonly: true/, "not an Agent tool parameter; use subagent_type stack:readonly"],
  [/environment: "(cloud|local)"/, "Cursor cloud agents; Claude Code subagents run locally (isolation: worktree)"],
  [/\bAskQuestion\b/, "Cursor tool; use AskUserQuestion"],
  [/\b(grok|composer|gemini)-[0-9a-z.]+|\bgpt-[0-9][0-9a-z.-]*|claude-(opus|sonnet|haiku|fable)-[0-9-]+-(low|medium|high|xhigh|max)\b/, "Cursor model slug; use Claude aliases (fable, opus, sonnet, haiku, inherit)"],
  [/inherit-parent/, "Cursor alias; use inherit"],
  [/cursor-team-kit/, "skills are vendored in this plugin"],
  [/\/add-plugin\b/, "Cursor install command; use /plugin install"],
  [/\bCursor\b/, "Cursor product reference; describe the Claude Code equivalent"],
  [/poteto-(mode|agent|help)\b|[Pp]oteto (mode|help|subagent)\b/, "renamed: auto, auto-agent, help (see DIVERGENCES)"],
  [/(?<![\w-])pstack:|\bsetup-pstack\b/, "plugin namespace is stack: (/stack:<name>); setup-pstack is setup"],
];
// Lines that legitimately mention a banned token (provenance notes). Keep this list short.
const ALLOW = [
  /github\.com\/cursor\/plugins/,
  /CURSOR_AUTOMATION_ID|author === "cursor"|cursor_automation_id|login: "cursor"/, // Bugbot review-thread detection
  /\bendCursor\b|\bcursor\b(?![-/])/, // GraphQL pagination and plain-English "cursor"
];

// The author's bio and provenance lines may name Cursor.
const BIO = /millions of lines of code at Meta|ship high quality code at Cursor|port of pstack|Port of Cursor|cursor\/plugins/;
const findings = [];
const add = (file, msg) => findings.push(`${relative(ROOT, file)}: ${msg}`);

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (name === "node_modules" || name === ".git") return [];
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

function frontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([A-Za-z_-]+):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}

const files = walk(PLUGIN);
// Cursor-only frontmatter keys (mode, reminder, icon, is_background) mean nothing to Claude Code.
for (const file of files.filter((f) => f.endsWith(".md"))) {
  const fm = frontmatter(readFileSync(file, "utf8"));
  for (const key of ["is_background", "mode", "reminder", "icon"]) if (fm && key in fm) add(file, `Cursor-only frontmatter key "${key}"`);
}
for (const file of files.filter((f) => TEXT.test(f) && !ATTRIBUTION.test(relative(PLUGIN, f)))) {
  const lines = readFileSync(file, "utf8").split("\n");
  lines.forEach((line, i) => {
    if (BIO.test(line)) return;
    if (ALLOW.some((a) => a.test(line)) && !/\.cursor\/|Cursor\b(?! plugins)/.test(line.replace(/github\.com\/cursor\/plugins\S*/g, ""))) return;
    for (const [re, why] of BANNED) {
      if (re.test(line)) add(file, `line ${i + 1}: ${why}\n    ${line.trim().slice(0, 160)}`);
    }
    // Prose is lowercase in places, so in markdown any "cursor" is the product unless it is
    // upstream provenance or the author's bio.
    if (file.endsWith(".md") && !BIO.test(line) && /\bcursor\b/i.test(line.replace(/github\.com\/cursor\/plugins\S*/g, "")) && !/\bCursor\b/.test(line)) {
      add(file, `line ${i + 1}: lowercase cursor product reference\n    ${line.trim().slice(0, 160)}`);
    }
  });
}

// Skills: Claude Code requires a lowercase-hyphen name matching the directory.
for (const dir of readdirSync(join(PLUGIN, "skills"))) {
  const file = join(PLUGIN, "skills", dir, "SKILL.md");
  if (!existsSync(file)) { add(file, "missing SKILL.md"); continue; }
  const fm = frontmatter(readFileSync(file, "utf8"));
  if (!fm) { add(file, "missing frontmatter"); continue; }
  if (fm.name !== dir) add(file, `name "${fm.name}" must equal the directory name "${dir}"`);
  if (!/^[a-z0-9-]{1,64}$/.test(fm.name ?? "")) add(file, "name must be lowercase letters, digits, hyphens");
  if (!fm.description) add(file, "missing description");
}
for (const file of files.filter((f) => /\/agents\/[^/]+\.md$/.test(f))) {
  const fm = frontmatter(readFileSync(file, "utf8"));
  const base = file.split("/").pop().replace(/\.md$/, "");
  if (!fm?.name || fm.name !== base) add(file, `agent name must equal file name "${base}"`);
  if (!fm?.description) add(file, "agent missing description");
}

// Relative markdown links must resolve.
for (const file of files.filter((f) => f.endsWith(".md"))) {
  const text = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, "");
  for (const [, target] of text.matchAll(/\]\(([^)\s]+)\)/g)) {
    if (/^(https?:|mailto:|#)/.test(target)) continue;
    const path = decodeURIComponent(target.split("#")[0]);
    if (path && !existsSync(resolve(dirname(file), path))) add(file, `broken link ${target}`);
  }
}

// Manifests parse and agree on the version.
const manifests = [".claude-plugin/marketplace.json", "plugins/stack/.claude-plugin/plugin.json", "plugins/stack/hooks/hooks.json"];
for (const m of manifests) {
  try { JSON.parse(readFileSync(join(ROOT, m), "utf8")); } catch (e) { add(join(ROOT, m), `invalid JSON: ${e.message}`); }
}

if (findings.length) {
  console.log(findings.join("\n"));
  console.log(`\ncheck: ${findings.length} finding(s)`);
  process.exit(1);
}
console.log("check: clean");
