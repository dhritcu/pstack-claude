# pstack for Claude Code

A Claude Code port of [pstack](https://github.com/cursor/plugins/tree/main/pstack), the engineering workflows of Lauren Tan ([poteto](https://x.com/poteto)): the `auto` router (upstream's `poteto-mode`) with 23 playbooks, 24 principles, multi-model review panels, PR tooling, and the benny automation pack. Every upstream skill, playbook, agent, script and doc is here and works on Claude Code. Two upstream dependencies that were editor built-ins (`create-skill`, `/babysit`) ship as skills, and three that lived in another plugin (`deslop`, `control-cli`, `control-ui`) are bundled.

Based on upstream **pstack 0.15.21** ([`upstream.json`](upstream.json)). The plugin's own readme, in the author's voice, is [`plugins/stack/README.md`](plugins/stack/README.md).

## Install

Claude Code 2.1.292 or newer (subagent `effort` support).

```
/plugin install stack --marketplace dhritcu/pstack-claude
```

On older Claude Code, add the marketplace first:

```
/plugin marketplace add dhritcu/pstack-claude
/plugin install stack@pstack-claude
```

Then run `/stack:setup` to pick a reasoning budget and models, and use `/stack:auto` (or just describe the task: pstack's hooks route rigorous work into it). The scripts (`watch-pr`, `check-plan`) need [Bun](https://bun.sh).

## What changed from upstream

The engineering content is upstream's, word for word wherever the platform allows. What changed is the platform. The full rules are in [docs/PORTING.md](docs/PORTING.md), every non-mechanical change with its reason in [docs/DIVERGENCES.md](docs/DIVERGENCES.md), and every file's status in [INVENTORY.md](INVENTORY.md).

| Upstream | Here |
|---|---|
| Custom mode (`/poteto-mode` + option+enter, a per-turn reminder) | Plugin hooks: SessionStart routing, a per-prompt reminder, SubagentStart context, and a todolist restatement when `auto` loads. The model sheet toggles the first three. |
| `Task` subagents, `generalPurpose`, `readonly: true`, cloud agents | `Agent` subagents: `general-purpose`, `stack:auto-agent`, `stack:readonly` (no edit tools), `stack:comment-sicko`; writing workers get `isolation: "worktree"` |
| Model slugs across vendors (Opus + Grok panels) | Claude aliases per role (`sonnet` code, `opus` judgment, `fable` hardest, `opus`+`fable` panels) plus `effort` from the budget |
| `~/.cursor/rules/pstack-models.mdc` (always-applied rule) | `${CLAUDE_CONFIG_DIR:-~/.claude}/pstack-models.md`, injected by the hooks |
| `agent-transcripts/` | `~/.claude/projects/<encoded-cwd>/*.jsonl`, found by `skills/reflect/scripts/find-transcript.mjs` |
| todo tool | `TaskCreate`/`TaskUpdate` when present, else `.audit/<task-slug>.todo.md` |
| Cursor Automations (benny) | Claude Code GitHub Action or routines |
| Grok Bot webhook (make-bot-ui) | Claude Code routine API trigger |

## The model sheet

`/stack:setup` writes `~/.claude/pstack-models.md` (under `$CLAUDE_CONFIG_DIR` if set):

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

Delete a role line to fall back to the default. `session hook: off` turns off all routing context, `reminder: off` only the per-prompt line, `subagent hook: off` the subagent context.

## Fixes over the earlier port

[PARITY.md](PARITY.md) maps every bug report on [michael-denyer/pstack-claude](https://github.com/michael-denyer/pstack-claude) to how this port handles it, including upstream's own `watch-pr` bug on PRs without CI.

## Tested in real sessions

[TESTING.md](TESTING.md) records real `claude` sessions run with this plugin (bug fix, feature, `/stack:how` on a production Rust repo, review panels, babysit on a live PR, and more) and what each transcript showed, plus the automated checks CI runs.

## Tracking upstream

The `upstream` branch holds untouched upstream files. To take a new release: copy the new `pstack/` over `plugins/pstack/` on `upstream` (it keeps upstream's names), update `upstream.json`, commit, merge into `main`, resolve conflicts with [docs/PORTING.md](docs/PORTING.md), and run `node tools/check.mjs` (fails on any Cursor-only construct, invalid frontmatter or broken link) plus the tests.

## License

MIT. pstack is by Lauren Tan, published by Cursor. See [NOTICE.md](NOTICE.md).
