# Testing

Two layers: automated checks that CI runs on every push to main and every PR, and real Claude Code sessions run with this plugin, where the evidence is the session transcript (which tools ran, which agents were dispatched with which `model` and `effort`, what the hooks injected) plus the artifact the session produced. No Claude behavior is mocked.

## Automated (CI)

| Check | What it proves |
|---|---|
| `node tools/check.mjs` | No Cursor-only construct (tool names, paths, model slugs, frontmatter keys, product references) in the shipped plugin; every skill and agent has valid frontmatter whose name equals its file or directory; every relative link resolves; manifests parse |
| `claude plugin validate . --strict` and `plugins/stack` | Claude Code accepts the marketplace and the plugin |
| `node --test tests/*.test.mjs` | The hook script, run as Claude Code runs it (`sh`, JSON on stdin), prints valid hook JSON for every event and toggle, including the real PreToolUse input shape |
| `bun test` in `skills/auto/scripts` | 77 tests for `watch-pr`, `orch`, `check-plan`, including the no-CI regression cases |
| `node --test` for `find-transcript` | 11 cases: `/clear`-first, skill-command-first, `!`-first, meta records, ranking, `--exclude`, `CLAUDE_CONFIG_DIR` |

## Real sessions

Claude Code 2.1.296, plugin loaded with `claude -p --plugin-dir plugins/stack`, headless, in scratch repositories (a feed-pagination library with a real tied-timestamp bug, and a clone of a production Rust service). Each row was checked in its transcript under `~/.claude/projects/`.

| Test | What happened | Verdict |
|---|---|---|
| Hooks reach the main session | SessionStart routing, plugin root and sheet, and the per-prompt reminder appear in context | pass |
| SubagentStart reaches subagents (#264) | A `general-purpose` subagent quoted the injected principles pointer; `stack:*` agents received the sheet | pass |
| Bug report, natural wording, no mention of pstack | Run 1 (upstream-style routing text): Opus fixed the bug directly and never opened `auto`, reproducing #264. Routing text sharpened. Runs 2 to 4: `stack:auto` was the first tool call every time; it read `bug-fix.md`, reproduced first, committed the failing test before the fix, and added a randomized check (15,398 mismatches before, 0 after). | pass after fix |
| Todolist | Runs 2 and 3 skipped it (no todo tool in the session). Hook restatement added; run 4 wrote `.audit/feed-missing-posts.todo.md`; the feature run wrote steps with `skip:` reasons. The list is not always kept current through the run. | partial (model compliance) |
| Feature, multi-file | Routed, read the feature playbook and principles, throughput checkpoint, delegated to `stack:auto-agent` (model `sonnet`), reviewed and probed the delegate's work, found the ticket's root-cause bug first, three ordered green commits | pass |
| Delegate effort | The feature run dispatched the delegate with no `effort` (the Agent tool tells models to set it only when asked; upstream's slugs carried it). PreToolUse hook added; Claude Code logged "modified tool input keys: [effort, ...]" and the subagent ran at the sheet's effort. | pass after fix |
| `/stack:how` on a production Rust repo (clone) | Complex path: three `stack:readonly` explorers (`sonnet`, `xhigh`) and an `opus` explainer; answer in the skill's sections with `file:line` citations; zero files changed | pass |
| `/stack:setup` | Wrote the sheet with budget `small (medium)` and a `swarm workers: haiku` override. Claude Code's config-dir protection blocks the write in a non-interactive session, so the skill now expects the permission prompt. | pass |
| Sheet takes effect | Next sessions: interrogate panel `opus` + `fable`, reflect lenses `opus`/`sonnet`, swarm workers `haiku`, all at `effort: medium` | pass |
| `/stack:no-comments` | Dispatched `stack:comment-sicko`; deleted 11 narrating comments, verified two "IMPORTANT / too risky" claims against the code (both false), removed an unused alias, replaced a comment with a named function; tests and `tsc --strict` pass | pass |
| `/stack:interrogate` | `opus` and `fable` reviewers as `stack:readonly`; both independently reproduced a page-size-0 bug the build missed | pass |
| `/stack:reflect` | Finder plus three lenses and a synthesizer. The finder picked the reflect session itself, whose prompt quoted the target's opening; the lenses caught it. Finder fixed (prefix match ranks first, `--exclude`); rerun on the same transcripts returns the right session. | pass after fix |
| `/stack:swarm` | Four read-only workers, one per file, on the sheet's `haiku`; one aggregated table | pass |
| `/stack:arena` | Two runners (`opus`, `fable`) as `general-purpose` with `isolation: "worktree"`, a `stack:readonly` cross-judge on `fable`, winner grafted and mutation-tested | pass |
| `/stack:why` | Traced the decision through commits, tests and the issue with citations; skipped the investigator fan-out for a four-file repo and said why | pass |
| Worktree cleanup | Routed to the playbook, ran `worktree-audit.sh`, removed nothing because every worktree held uncommitted files (correct) | pass |
| `watch-pr` on a live public PR with no CI | Port: one pass, `no checks`, exit 0. Upstream on the same PR: `RETRY ... no checks reported` at 60, 120, 240 s. | pass |
| `/stack:babysit` check | Read the playbook, resolved the forge, ran the bundled `watch-pr` against a live PR, reported without writing (the public PRs it hit had just been merged by their authors) | pass |
| Install from the published marketplace | `claude plugin marketplace add dhritcu/pstack-claude` + `claude plugin install stack@pstack-claude`: the session context names the plugin cache root and lists `stack:*` skills | pass |
| `/stack:babysit drive` on a live PR with real CI (installed plugin) | Read the playbook from the plugin cache, resolved the forge, ran `watch-pr` while CI ran, reported `READY` (CI green, `CLEAN`, `MERGEABLE`) on [#1](https://github.com/dhritcu/pstack-claude/pull/1), did not merge | pass |
| `/stack:create-skill` | Built a project skill with a bundled script, then tested it in six real nested `claude -p` sessions: three trigger prompts fired, three near misses did not; fixed one issue found in round 1 and reran | pass |

Not run live: benny (needs a repository secret and a workflow run), make-bot-ui (needs a routine and its token), orchestrate and the autopilots (multi-hour programs). Their mechanics (background subagents, worktrees, `watch-pr`, `/loop`) are covered by the rows above.
