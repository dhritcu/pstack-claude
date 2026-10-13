// Runs plugins/stack/hooks/pstack-hook.sh the way Claude Code does (sh, JSON on stdin,
// CLAUDE_PLUGIN_ROOT and CLAUDE_CONFIG_DIR set) and checks the JSON it prints.
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../plugins/stack");
const script = join(root, "hooks/pstack-hook.sh");

function run(event, { sheet, stdin = "{}" } = {}) {
  const config = mkdtempSync(join(tmpdir(), "pstack-hook-"));
  try {
    if (sheet !== undefined) writeFileSync(join(config, "pstack-models.md"), sheet);
    const out = execFileSync("sh", [script, event], {
      input: stdin,
      env: { PATH: process.env.PATH, HOME: config, CLAUDE_PLUGIN_ROOT: root, CLAUDE_CONFIG_DIR: config },
    }).toString();
    return { out, config };
  } finally {
    rmSync(config, { recursive: true, force: true });
  }
}
const context = (out, event) => {
  const json = JSON.parse(out);
  assert.equal(json.hookSpecificOutput.hookEventName, event);
  return json.hookSpecificOutput.additionalContext;
};

test("session start routes to auto and names the plugin root", () => {
  const ctx = context(run("session-start").out, "SessionStart");
  assert.match(ctx, /stack:auto/);
  assert.ok(ctx.includes(`${root}/skills/<name>/SKILL.md`), "PSTACK_ROOT is substituted");
  assert.match(ctx, /No pstack model sheet at .*pstack-models\.md/);
});

test("session start carries the sheet's role lines from CLAUDE_CONFIG_DIR, escaped", () => {
  const sheet = '# pstack model configuration\nbudget: small (medium)\njudgment and prose: "fable" \\ x\n';
  const ctx = context(run("session-start", { sheet }).out, "SessionStart");
  assert.match(ctx, /budget: small \(medium\)/);
  assert.ok(ctx.includes('judgment and prose: "fable" \\ x'));
  assert.doesNotMatch(ctx, /^# pstack model configuration$/m, "comment lines are dropped");
});

test("each toggle silences only its own hook", () => {
  assert.equal(run("session-start", { sheet: "session hook: off\n" }).out, "");
  assert.equal(run("prompt", { sheet: "Session Hook : OFF\n" }).out, "");
  assert.equal(run("prompt", { sheet: "reminder: off\n" }).out, "");
  assert.match(context(run("prompt", { sheet: "subagent hook: off\n" }).out, "UserPromptSubmit"), /auto/);
  assert.equal(run("subagent-start", { sheet: "subagent hook: off\n", stdin: '{"agent_type":"stack:readonly"}' }).out, "");
});

test("subagent start: pstack agents get the sheet, general-purpose gets the principles pointer, others nothing", () => {
  const pstack = context(run("subagent-start", { sheet: "swarm workers: haiku\n", stdin: '{"agent_id":"a1","agent_type":"stack:auto-agent"}' }).out, "SubagentStart");
  assert.match(pstack, /swarm workers: haiku/);
  const gp = context(run("subagent-start", { stdin: '{"agent_type": "general-purpose"}' }).out, "SubagentStart");
  assert.ok(gp.includes(`${root}/skills/auto/SKILL.md`));
  assert.equal(run("subagent-start", { stdin: '{"agent_type":"Explore"}' }).out, "");
  assert.equal(run("subagent-start", { stdin: "not json" }).out, "");
});

test("unknown event prints nothing and exits 0", () => {
  assert.equal(run("bogus").out, "");
});

test("auto loading restates the todolist rule, by Skill tool or typed command", () => {
  const viaSkill = context(run("skill-loaded", { stdin: '{"tool_name":"Skill","tool_input":{"skill":"stack:auto","args":"x"}}' }).out, "PostToolUse");
  assert.match(viaSkill, /\.audit\/<task-slug>\.todo\.md/);
  assert.equal(run("skill-loaded", { stdin: '{"tool_input":{"skill":"stack:deslop"}}' }).out, "");
  const typed = context(run("prompt", { stdin: '{"prompt":"/stack:auto fix the feed"}' }).out, "UserPromptSubmit");
  assert.match(typed, /TaskCreate/);
  const plain = context(run("prompt", { stdin: '{"prompt":"fix the feed"}' }).out, "UserPromptSubmit");
  assert.match(plain, /first tool call is the Skill tool/);
});

test("pstack agent spawns without effort get the budget's effort; others are untouched", () => {
  const input = JSON.stringify({ tool_name: "Agent", tool_input: { subagent_type: "stack:auto-agent", model: "sonnet", prompt: 'a "q" {b} \\ c\n}}', description: "d" } });
  const filled = JSON.parse(run("agent-effort", { stdin: input }).out).hookSpecificOutput.updatedInput;
  assert.deepEqual(filled, { effort: "xhigh", subagent_type: "stack:auto-agent", model: "sonnet", prompt: 'a "q" {b} \\ c\n}}', description: "d" });
  const small = JSON.parse(run("agent-effort", { sheet: "budget: small (medium)\n", stdin: input }).out);
  assert.equal(small.hookSpecificOutput.updatedInput.effort, "medium");
  assert.equal(run("agent-effort", { stdin: JSON.stringify({ tool_input: { subagent_type: "stack:readonly", effort: "low", prompt: "p" } }) }).out, "");
  assert.equal(run("agent-effort", { stdin: JSON.stringify({ tool_input: { subagent_type: "general-purpose", prompt: "p" } }) }).out, "");
});

test("effort hook ignores the session's own top-level effort field (real Claude Code input shape)", () => {
  const input = JSON.stringify({ session_id: "s", effort: { level: "medium" }, tool_name: "Agent", tool_input: { description: "d", prompt: "p", subagent_type: "stack:readonly", model: "haiku", run_in_background: false } });
  const out = JSON.parse(run("agent-effort", { stdin: input }).out).hookSpecificOutput.updatedInput;
  assert.deepEqual(out, { effort: "xhigh", description: "d", prompt: "p", subagent_type: "stack:readonly", model: "haiku", run_in_background: false });
});
