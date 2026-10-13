---
name: setup-pstack
description: Configure which models pstack uses per role and at what reasoning budget, and which pstack hooks run. Writes the model sheet that pstack's hooks inject and that overrides the skill defaults. Use for /pstack:setup-pstack, "configure pstack models", "pstack budget", changing pstack's model choices, or turning pstack's session hook, reminder, or subagent hook on or off.
---

# Setup pstack

Write `${CLAUDE_CONFIG_DIR:-~/.claude}/pstack-models.md`, the model sheet that sets pstack's model per role. Resolve the directory from `$CLAUDE_CONFIG_DIR` when it is set, and `~/.claude` otherwise; never hardcode `~/.claude`. This skill calls the resolved path "the sheet". It is not an always-applied file: pstack's SessionStart and SubagentStart hooks read it and inject its lines into the session and into pstack's subagents.

## Steps

### 1. Detect available models

Claude Code has no API that lists the models a user can run, so there is nothing to detect. The `Agent` tool's `model` parameter accepts the aliases `fable`, `opus`, `sonnet`, and `haiku`, the value `inherit` (the role runs on the parent session's model, and the `Agent` call omits `model`), or a full model ID. Offer the aliases and `inherit`. Accept a full model ID only when the user names one; never write one they did not give you.

### 2. Load current state

The default role-to-model mapping is the sheet shape shown in step 5 below. If the sheet already exists, read it and treat its `budget` line, its role values, and its toggle lines as the current choices. Otherwise start from those defaults. A line whose role is not in step 5, such as `how critics`, is from a retired role. Drop it. A value left from another tool's model names (a slug such as one ending in `-xhigh` or `-fast`) is not an `Agent` model; mark that role as needing a choice.

### 3. Budget, map, and confirm

**(a) Ask for a budget.** Prefer AskUserQuestion over free text. Offer these four options with these exact labels, and name the current budget when the sheet records one. With no sheet, say that `large` matches the skill defaults.

- `unlimited — max reasoning`
- `large — xhigh reasoning`
- `medium — high reasoning`
- `small — medium reasoning`

**(b) Apply it.** The budget does not change any role's model. It sets the `effort` every pstack `Agent` call passes, panel entries included: `unlimited` → `max`, `large` → `xhigh`, `medium` → `high`, `small` → `medium`. Build the working table from the skill defaults, and on a re-run keep any role you changed by model, list, or `inherit`.

**(c) Show the roles and confirm.** Show every role with its model, marking any value step 2 flagged as needing a choice. Also list each line step 2 dropped. Ask whether to accept as-is or change specific roles, offering `fable`, `opus`, `sonnet`, `haiku`, and `inherit` as the options. Prefer AskUserQuestion over free text. For panel roles (arena runners, architect runners, interrogate reviewers) the value is a list, and one subagent runs per entry, `inherit` entries included, so the list length sets the count. `arena cross-judge pool` is also a list, but Arena selects one value from it that differs from the parent's model when possible. Claude Code runs Claude models only, so a panel's diversity comes from different Claude models (`opus` beside `fable`), not different vendors. `swarm workers` is the default model for every worker unless a race or comparison assigns another model per arm.

**(d) Hooks.** Ask whether to keep each of pstack's hooks on. All three default to on, and the answers are the sheet's toggle lines:

- `session hook`: at session start, resume, clear, and compact, inject the poteto-mode routing rule and the sheet's lines.
- `reminder`: on every prompt, inject the reminder to apply `/pstack:poteto-mode` to a new task that matches a playbook or needs rigor.
- `subagent hook`: when a subagent starts, give `pstack:*` agents the sheet and the plugin root, and give `general-purpose` subagents a pointer to the principles index.

With `session hook: off` the sheet no longer reaches the session through the hook, and the reminder stops too; skills that need a role line read the sheet themselves.

### 4. Validate

Every value written must be `fable`, `opus`, `sonnet`, `haiku`, `inherit`, or a full model ID the user named. Each toggle is `on` or `off`. If a value fails, stop and ask again. If an `Agent` call later rejects a model, pstack's skills fall back to the default and say so.

### 5. Write the sheet

Write the sheet with the first line `# pstack model configuration`, a `budget` line with the chosen label and its effort, one line per role using the same labels poteto-mode uses, and the three toggle lines. Overwrite the whole file so re-runs stay idempotent. Shape:

```markdown
# pstack model configuration

One line per role. Delete a line to fall back to the skill default. A value of `inherit` runs the role on the parent session's model (the Agent call omits `model`), and an `inherit` entry in a panel list still counts toward that panel's fan-out. The budget sets the `effort` of every Agent call a role makes. The three toggles default to on. `session hook` injects the poteto-mode routing rule and this sheet at session start, resume, clear, and compact. `reminder` injects the poteto-mode reminder on every prompt, and only runs while `session hook` is on. `subagent hook` gives pstack agents this sheet and general-purpose subagents a pointer to the principles. Set any of them to off to stop it.

budget: large (xhigh)
feature, refactoring: sonnet
bug-fix: sonnet
perf-issue: sonnet
hillclimb: sonnet
judgment and prose: opus
hardest tasks: fable
how explorer: sonnet
how explainer: opus
why investigators: sonnet
why synthesizer: opus
reflect tooling: sonnet
reflect judgment, divergent, synthesizer: opus
arena runners: opus, fable
arena cross-judge pool: opus, fable
swarm workers: sonnet
architect runners: opus, fable
interrogate reviewers: opus, fable
session hook: on
reminder: on
subagent hook: on
```

### 6. Confirm

Tell the user where the sheet was written and that it applies to new sessions (and to the current one after `/clear`, when the session hook is on). Re-running this skill updates it.

### 7. Offer a verification skill (optional)

Check whether the project has a way to drive the real app for proof (a `verify-*` skill, or an existing harness). If not, offer once: "want a project-local verification skill, so agents can drive the app the way a user does and prove changes work? I can generate one with /pstack:create-verification-skill." On yes, invoke [`/pstack:create-verification-skill`](../create-verification-skill/SKILL.md). On no, move on without pushing.

### 8. Offer Claude Code's task tools (optional)

pstack's playbooks track their steps with `TaskCreate`/`TaskUpdate` when the session has them, and fall back to an uncommitted `.audit/<task-slug>.todo.md` checklist otherwise. If this session has no `TaskCreate` tool, offer once to enable the task tools for the current project only, by adding `"env": {"CLAUDE_CODE_ENABLE_TODO_TOOLS": "1"}` to that project's `.claude/settings.local.json` (merge into the existing `env` object; keep every other key). Say that the tools can compete with a personal task system the user already runs, which is why the setting is per project and never written to user settings. It takes effect after a Claude Code restart. On no, move on without pushing.
