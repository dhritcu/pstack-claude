# Changelog

## 0.15.21-claude.1

First release. Ports pstack 0.15.21 (upstream `1dcc2ba`) to Claude Code.

- Every upstream skill, playbook, agent, script and guide chapter, ported; see [INVENTORY.md](INVENTORY.md).
- Hooks replace Cursor's custom mode: SessionStart routing, a per-prompt reminder, SubagentStart context, a todolist restatement when poteto-mode loads, and `effort` filled from the budget for pstack subagents.
- New skills for upstream's editor built-ins: `create-skill`, `babysit`. Bundled from cursor-team-kit: `deslop`, `control-cli`, `control-ui`.
- `watch-pr` finishes on PRs with no CI configured instead of retrying forever.
- `find-transcript.mjs` for Claude Code transcripts.
- Fixes for every bug report on the earlier port; see [PARITY.md](PARITY.md).
