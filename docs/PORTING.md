# Porting guide: Cursor pstack → Claude Code

The rules every edit follows. `tools/check.mjs` enforces the mechanical ones. Keep upstream's text, voice and rules wherever they are not Cursor-specific: change the platform, not the engineering judgment. When a rule below doesn't fit a sentence, rewrite that sentence minimally so it is true on Claude Code, and note it in `docs/DIVERGENCES.md`.

Target: Claude Code 2.1.292 or newer (Agent tool `effort` parameter).

## Tools and agents

| Cursor | Claude Code |
|---|---|
| `Task` tool, "Task call", "Task subagent" | the `Agent` tool, "`Agent` call", "subagent" |
| `subagent_type: generalPurpose` | `subagent_type: "general-purpose"` |
| `subagent_type: generalPurpose` + `readonly: true` | `subagent_type: "stack:readonly"` (plugin agent; no Edit/Write/NotebookEdit; MCP kept) |
| `subagent_type: "shell"` | the parent runs the command itself with Bash |
| `subagent_type: "explore"` | `subagent_type: "Explore"` |
| `subagent_type: "poteto-agent"` / `"comment-sicko"` | `subagent_type: "stack:auto-agent"` / `"stack:comment-sicko"` |
| "agent mode (`readonly: false`)" | (drop; subagents have tools by default) |
| `environment: "cloud"` | local subagents. Workers that write files get `isolation: "worktree"`; read-only workers need none. |
| `run_in_background: true` on Task | `run_in_background: true` on the Agent call (the parent is notified when each finishes) |
| Task `model: <slug>` | Agent `model: <alias>` plus `effort: <level>` (see Models) |
| `AskQuestion` | `AskUserQuestion` |
| todolist / todo list | `TaskCreate`/`TaskUpdate` when the session has them. Otherwise an uncommitted `.audit/<task-slug>.todo.md` checklist (one per task, so parallel sessions in one checkout never share it). Same rule: playbook steps copied verbatim first, skipped steps stay with `skip: <reason>`. |
| `is_background: true` (agent frontmatter) | `background: true` |
| Cursor custom mode (`mode: true`, `reminder:`, option+enter) | pstack's hooks: SessionStart routing + a per-prompt reminder (see Hooks). Remove `mode`, `icon`, `color`, `reminder` frontmatter. |
| Cursor plan mode | Claude Code plan mode (shift+tab) |
| Cursor `/loop` | Claude Code `/loop` (fixed interval or self-paced) |
| Cursor's built-in `create-skill` | the bundled `create-skill` skill: `../create-skill/SKILL.md` |
| Cursor's built-in `/babysit` | the bundled `babysit` skill (`/stack:babysit`); keep "the Babysit playbook" and its "do not route there" note |
| `cursor-team-kit` `deslop`, `control-cli`, `control-ui` | vendored in this plugin: `../deslop/SKILL.md`, `../control-cli/SKILL.md`, `../control-ui/SKILL.md`; slash forms `/stack:deslop` etc. |
| "Cursor restart" | "a Claude Code restart" |
| cloud-agent URL (session pickup) | a session ID (`claude --resume <id>`), a transcript path, or a pushed branch |
| Cursor dashboard / Cursor chat / Cursor Slack | say what the Claude Code user actually has (terminal session, `/schedule` routines, GitHub Action) |
| "Cursor's Bugbot" / "Bugbot" | keep "Bugbot" (it reviews GitHub PRs whatever the editor) but say "Bugbot or another review bot" where the rule is generic |

Skill names (frontmatter `name`) are lowercase-hyphen and equal the directory name: `Poteto Mode` → `auto` (renamed from `poteto-mode`, see DIVERGENCES), `Make Bot UI` → `make-bot-ui`.

`disable-model-invocation: true` stays as upstream has it on every skill except `auto` (the hooks route into it with the Skill tool). Skills reach each other by file path, as upstream does: `../<name>/SKILL.md` relative to the calling skill's directory. A user types `/stack:<name>`.

## Paths

| Cursor | Claude Code |
|---|---|
| `~/.cursor/rules/pstack-models.mdc` (always-applied rule) | `${CLAUDE_CONFIG_DIR:-~/.claude}/pstack-models.md` (the model sheet). pstack's SessionStart and SubagentStart hooks inject it, so skills read their role lines from context. A skill that needs it and doesn't see it reads the file. |
| `~/.cursor/projects/<slug>/agent-transcripts/<uuid>/<uuid>.jsonl`, "the agent-transcripts directory the system prompt names" | `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/<session-id>.jsonl`, `<encoded-cwd>` = the absolute working directory with every non-alphanumeric character replaced by `-`. Subagent transcripts: `<session-id>/subagents/agent-*.jsonl`. Finder: `node <reflect skill dir>/scripts/find-transcript.mjs "<opening prompt fragment>"`. |
| `~/.cursor/skills/<x>/` | `~/.claude/skills/<x>/` (user) |
| `.cursor/skills/<x>/` | `.claude/skills/<x>/` (project) |
| `~/.cursor/plugins/` | `~/.claude/plugins/` |
| `.cursor/settings.json` (enable pstack for a repo) | `.claude/settings.json` with `extraKnownMarketplaces` + `enabledPlugins` (`"stack@pstack-claude": true`) |
| `.cursor/worktrees/...` | any path; Claude Code's own worktrees live under `.claude/worktrees/` |
| a skill's own scripts (`scripts/watch-pr/watch-pr`) | keep upstream's skill-relative wording; the reader resolves it against the skill's base directory, which Claude Code prints when a skill loads. In a hook or a one-line command, use `${CLAUDE_PLUGIN_ROOT}/skills/<skill>/scripts/...`. |

## Models

Claude Code runs Claude models only, so upstream's cross-vendor panels (Grok + Opus) become cross-model Claude panels. Models are aliases (`fable`, `opus`, `sonnet`, `haiku`) or `inherit`; effort is a separate Agent parameter (`low`, `medium`, `high`, `xhigh`, `max`).

Defaults (the `large` budget, effort `xhigh`):

| Role | Upstream | Claude Code |
|---|---|---|
| `feature, refactoring`, `bug-fix`, `perf-issue`, `hillclimb` (code delegates) | `grok-4.7-xhigh-fast` | `sonnet` |
| `judgment and prose` | `claude-opus-5-5-xhigh` | `opus` |
| `hardest tasks` | `claude-opus-5-5-xhigh` | `fable` |
| `how explorer`, `why investigators`, `reflect tooling`, `swarm workers` | `grok-4.7-xhigh-fast` | `sonnet` |
| `how explainer`, `why synthesizer`, `reflect judgment, divergent, synthesizer` | `claude-opus-5-5-xhigh` | `opus` |
| `arena runners`, `arena cross-judge pool`, `architect runners`, `interrogate reviewers` (panels) | `claude-opus-5-5-xhigh, grok-4.7-xhigh-fast` | `opus, fable` |

Budgets set the effort of every role: `unlimited` → `max`, `large` → `xhigh` (default), `medium` → `high`, `small` → `medium`. `inherit` (was `inherit-parent`/`auto`) runs the role on the parent's model: omit `model`. Writing a role's model in a skill: "Set `model` to that line's value (default `<alias>`) and `effort` to the sheet's budget effort (default `xhigh`). Omit `model` when the value is `inherit`." If the Agent tool rejects a model, fall back to the default and say so.

A "different model family" (arena cross-judge, "a second opinion is the same prompt against a different model") means a different Claude model than the parent's (e.g. `fable` vs `opus`), since the family is one vendor here. Say so where upstream relied on vendor diversity.

## Hooks (replace Cursor's custom mode)

- `SessionStart` (startup, resume, clear, compact): injects the routing rule (when to invoke `stack:auto`) and the model sheet's lines, unless the sheet says `session hook: off`.
- `UserPromptSubmit`: injects a sharpened form of upstream's mode reminder each prompt ("new task? A bug report, perf problem, multi-file change, design choice, or playbook match -> your first tool call is the Skill tool with stack:auto. ..."), the todolist rule when the prompt starts with `/stack:auto` or `/auto`, and nothing for other slash commands or `<...>` background-task reports, unless `reminder: off` or `session hook: off`.
- `SubagentStart`: `stack:*` agents get the model sheet and the plugin root; `general-purpose` subagents get a short pointer to the principles index, unless `subagent hook: off`.
- `PostToolUse` (Skill): when `stack:auto` loads, restates the todolist rule and its `.audit/` fallback. No toggle.
- `PreToolUse` (Agent): fills `effort` from the sheet's budget on `stack:*` spawns that have none. No toggle.
- `stack:auto-agent` preloads `auto` with `skills: [auto]`.

## Verification drivers

Claude Code's bundled `/verify` runs only when the user types it; the model cannot invoke it. Driver lines name, in order: the project's `verify-<app>` skill from `/stack:create-verification-skill` (`.claude/skills/verify-<app>/`), then `control-ui` (browser, Electron, web) or `control-cli` (CLIs, TUIs), both vendored here. Never tell the model to invoke `/verify`.

## Worktrees for delegates

`Agent` with `isolation: "worktree"` branches from the default branch, not from `HEAD`, unless the project sets `"worktree": { "baseRef": "head" }`. When a delegate must build on the current branch's commits: commit first, then either use that setting or create the worktree yourself (`git worktree add -b <name> <path> HEAD`) and name the base in the brief.

## Don't

- Don't add Codex, Copilot, Pi or Windows-PowerShell surfaces. This port targets Claude Code.
- Don't add a `commands/` directory: skills already appear as `/stack:<name>`; trampolines duplicate every menu row.
- Don't rewrite engineering rules, principles or stop conditions to taste. Upstream's mechanical checks stay mechanical.
- Don't invent Claude Code features. If unsure a feature exists, say what you need and ask the parent.
