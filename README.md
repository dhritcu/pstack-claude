# stack: pstack for Claude Code

A Claude Code port of [pstack](https://github.com/cursor/plugins/tree/main/pstack), the engineering workflows of Lauren Tan ([poteto](https://x.com/poteto)): the `auto` router with 23 playbooks, 24 principles, multi-model review panels, PR tooling, and the benny automation pack. Every upstream skill, playbook, agent, script and doc is here and works on Claude Code. The two upstream dependencies that were editor built-ins (`create-skill`, `/babysit`) ship as skills, and the three that lived in another plugin (`deslop`, `control-cli`, `control-ui`) are bundled.

Based on upstream **pstack 0.15.21** ([`upstream.json`](upstream.json)). Current release: **0.15.21-claude.3** ([CHANGELOG.md](CHANGELOG.md)). The plugin's own readme, in the author's voice, is [`plugins/stack/README.md`](plugins/stack/README.md).

## Install

Needs Claude Code 2.1.292 or newer (subagent `effort` support), plus [Bun](https://bun.sh) and the [GitHub CLI](https://cli.github.com) for the PR scripts.

```
/plugin install stack --marketplace dhritcu/pstack-claude
```

On Claude Code older than 2.1.275, add the marketplace first:

```
/plugin marketplace add dhritcu/pstack-claude
/plugin install stack@pstack-claude
```

Update later with `claude plugin marketplace update pstack-claude` and `claude plugin update stack@pstack-claude`, then restart Claude Code. If you installed it under its earlier name, run `claude plugin uninstall pstack@pstack-claude` first.

## Use

Run `/stack:setup` once to pick a reasoning budget and models. Then either type `/stack:auto` before a task, or just describe the task: the hooks route rigorous work (bug reports, multi-file changes, design choices, playbook matches) into `auto`, and leave questions and one-line edits alone.

```
/stack:auto this pr has a subtle bug where the scroll drifts every 750ms even when idle. repro first, then fix and verify.
/stack:auto i'm going to bed. land the stack even if ci flakes. i want everything merged by morning.
/stack:how do we cancel runs? do we have an n+1 when we look up every run to cancel?
/stack:interrogate review this pr.
/stack:babysit 123
/stack:help which skill should i use to review this branch?
```

Every skill is `/stack:<name>`. The full list, with when to use each, is in [`plugins/stack/README.md`](plugins/stack/README.md).

## Names

The plugin is `stack`, and the skills and agents named after the author have generic names. The project, this repository, the model sheet and the credits keep the pstack name.

| Upstream | Here |
|---|---|
| `/poteto-mode` | `/stack:auto` |
| `poteto-agent` | `stack:auto-agent` |
| `/poteto-help` | `/stack:help` |
| `/setup-pstack` | `/stack:setup` |
| `/<name>` | `/stack:<name>` |

## What changed from upstream

The engineering content is upstream's, word for word wherever the platform allows. What changed is the platform. The rules are in [docs/PORTING.md](docs/PORTING.md), every non-mechanical change with its reason in [docs/DIVERGENCES.md](docs/DIVERGENCES.md), and every file's status (ported, renamed, unchanged, added) in [INVENTORY.md](INVENTORY.md).

| Upstream (Cursor) | Here (Claude Code) |
|---|---|
| Custom mode (`/poteto-mode` + option+enter, a per-turn reminder) | Plugin hooks: SessionStart routing and model sheet, a per-prompt reminder, SubagentStart context, a todolist restatement when `auto` loads, and `effort` filled in for `stack:*` subagents from the budget. The sheet toggles the first three. |
| `Task` subagents, `generalPurpose`, `readonly: true`, cloud agents | `Agent` subagents: `general-purpose`, `stack:auto-agent` (preloads `auto`), `stack:readonly` (no edit tools), `stack:comment-sicko`; writing workers get `isolation: "worktree"` |
| Model slugs across vendors (Opus + Grok panels, effort in the slug) | Claude aliases per role (`sonnet` code, `opus` judgment, `fable` hardest, `opus` + `fable` panels) plus a separate `effort` from the budget |
| `~/.cursor/rules/pstack-models.mdc` (always-applied rule) | `${CLAUDE_CONFIG_DIR:-~/.claude}/pstack-models.md`, injected by the hooks |
| `agent-transcripts/` | `~/.claude/projects/<encoded-cwd>/*.jsonl`, found by `skills/reflect/scripts/find-transcript.mjs` |
| Built-in todo tool | `TaskCreate`/`TaskUpdate` when present, else `.audit/<task-slug>.todo.md` |
| Built-in `/verify` for UI proof | The project's `verify-<app>` skill, else the bundled `control-ui` / `control-cli` (Claude Code's `/verify` is user-only) |
| Cursor Automations (benny) | Claude Code GitHub Action or routines |
| Grok Bot webhook (make-bot-ui) | Claude Code routine API trigger |

## The model sheet

`/stack:setup` writes `~/.claude/pstack-models.md` (under `$CLAUDE_CONFIG_DIR` if set). Claude Code asks before writing into its config directory; that prompt is expected. An excerpt:

```
# pstack model configuration
budget: large (xhigh)
feature, refactoring: sonnet
judgment and prose: opus
hardest tasks: fable
interrogate reviewers: opus, fable
session hook: on
reminder: on
subagent hook: on
```

Delete a role line to fall back to its default. `session hook: off` turns off the routing context and the reminder, `reminder: off` only the per-prompt line, `subagent hook: off` the subagent context. Lines starting with `#` are comments and are not injected.

## Fixes over the earlier port

[PARITY.md](PARITY.md) maps every bug report on [michael-denyer/pstack-claude](https://github.com/michael-denyer/pstack-claude) to how this port handles it, including upstream's own `watch-pr` bug that retries forever on a PR with no CI.

## Tested in real sessions

[TESTING.md](TESTING.md) records real `claude` sessions run with this plugin and what each transcript showed: bug fix and feature runs, `/stack:how` on a production Rust repo, review panels, reflect, swarm, arena, create-skill, babysit on a live PR, and an install from this marketplace. Six defects found that way were fixed before release. The final review was run by the plugin on itself (`/stack:auto` with four read-only reviewers, [#2](https://github.com/dhritcu/pstack-claude/pull/2)).

## Repository layout

```
.claude-plugin/marketplace.json   the marketplace (name: pstack-claude)
plugins/stack/                    the plugin
  .claude-plugin/plugin.json
  skills/                         57 skills; auto/ holds the playbooks, references and PR scripts
  agents/                         auto-agent, readonly, comment-sicko
  hooks/                          hooks.json, pstack-hook.sh, session-start-context.md
  automations/benny/              dormant automation pack
  docs/guide/                     the 10-chapter guide
tools/check.mjs                   port lint
tests/                            hook tests
docs/                             PORTING.md, DIVERGENCES.md
```

## Develop

```
node tools/check.mjs                                     # port lint: Cursor-only constructs, old names, frontmatter, links
node --test tests/*.test.mjs                             # hook script, run as Claude Code runs it
(cd plugins/stack/skills/auto/scripts && bun install && bun test)
node --test plugins/stack/skills/reflect/scripts/*.test.mjs
claude plugin validate . --strict && claude plugin validate plugins/stack --strict
claude --plugin-dir plugins/stack                        # try local changes in a session
```

CI runs all of these on pushes to `main` and on pull requests. Bump `version` in `plugins/stack/.claude-plugin/plugin.json` for installs to pick up a change.

## Tracking upstream

The `upstream` branch holds untouched upstream files under upstream's names (`plugins/pstack/`, `poteto-mode`, ...). To take a new release: on `upstream`, copy the new `pstack/` over `plugins/pstack/`, update `upstream.json`, and commit; then merge into `main`. Git follows the renamed paths. Resolve conflicts with [docs/PORTING.md](docs/PORTING.md) and run the checks above: `tools/check.mjs` fails on any Cursor-only construct or old name the merge brings back.

## License

MIT. pstack is by Lauren Tan, published by Cursor. See [NOTICE.md](NOTICE.md).
