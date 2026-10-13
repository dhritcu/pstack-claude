# Divergences from upstream

Every change beyond the mechanical substitutions in [PORTING.md](PORTING.md), with the reason. Grouped by area. Upstream text is on the `upstream` branch: `git diff upstream..main -- plugins/stack/<path>`.

## core

- auto/SKILL.md: frontmatter is `name: auto` with no `disable-model-invocation`, `mode`, `icon`, `color` or `reminder` — the hooks route into it with the Skill tool and carry the reminder (PORTING Hooks).
- auto/SKILL.md: "create-skill" trigger points at `playbooks/authoring-a-skill.md` and Claude Code's skill format — Cursor built-in has no Claude Code twin.
- auto/SKILL.md: "Shipping UI / IDE / CLI" names the driver order (`verify-<app>`, then `control-ui`/`control-cli`), never `/verify` — the model cannot invoke the bundled `/verify` (prior-port #71).
- auto/SKILL.md: dropped the "not Cursor's built-in babysit skill" clause — Claude Code has no built-in babysit.
- auto/SKILL.md: two trigger lines added, managed-platform deploy loads that platform's skill first, and severity decides a mid-task defect's artifact — prior-port #59 items 6 and 7.
- auto/SKILL.md: Subagents says `stack:auto-agent` preloads `auto` via `skills:` but the parent still passes this file's path — prior-port #264.
- auto/SKILL.md: Agent defaults drop "agent mode (readonly strips MCP)", name `sonnet`/`opus`/`fable` with `effort` from the sheet's budget, `inherit` replaces `inherit-parent`/`auto`, and a rejected model falls back with a note — PORTING Models.
- auto/SKILL.md: "a different model" for a second opinion now says a different Claude model — single vendor (PORTING Models).
- auto/SKILL.md: Playbooks names `TaskCreate`/`TaskUpdate` for the todolist, else an uncommitted `.audit/<task-slug>.todo.md` — prior-port #72 and #229.
- playbooks/opening-a-pr.md: Worktree adds the `isolation: "worktree"` default-branch base caveat — PORTING Worktrees for delegates; delegates otherwise silently lose the branch's commits.
- playbooks/opening-a-pr.md: Worktree adds "drain every live agent, grandchildren included, before commit/merge/deploy" — prior-port #59 item 1.
- playbooks/babysit.md, shipping.md: "`/loop` in dynamic mode" → "self-paced mode (no interval)" — Claude Code's name for the same `/loop` mode.
- playbooks/shipping.md, autopilot-full.md, autopilot-stack.md: Cursor cloud agents → background subagents with `isolation: "worktree"` — PORTING (no cloud agents; each verifier/owner needs its own checkout).
- playbooks/autopilot-full.md: dropped "`/loop` works in local and cloud roots" — no cloud root on Claude Code.
- playbooks/autopilot-full.md: pre-review checks named by "CLAUDE.md or AGENTS.md files and rules" — Claude Code reads CLAUDE.md.
- playbooks/multi-phase-plan.md: plan file default is `${CLAUDE_CONFIG_DIR:-~/.claude}/orchestrate/<project-slug>/docs/` — Claude Code has no per-agent store path in the system prompt.
- playbooks/multi-phase-plan.md: check-plan command is skill-relative `node scripts/check-plan.mjs` — upstream's `pstack/skills/...` is upstream's repo layout, not an install path.
- playbooks/multi-phase-plan.md: live lanes run in their own worktree, not a cloud VM; the video is recorded in a lane's worktree — no cloud VMs.
- playbooks/orchestrate.md: store moved to `${CLAUDE_CONFIG_DIR:-~/.claude}/orchestrate/<project-slug>/` — no store path in the system prompt; must outlive the session.
- playbooks/orchestrate.md: sub-coordinator nesting hedged ("where the runtime lets a subagent spawn one", else owns units directly) — Claude Code's nesting depth is not documented in PORTING.
- playbooks/orchestrate.md: workers are background subagents (writers in worktrees); cloud/local spawn split, "cloud default and local exception list", and cloud-only verbatim paste removed — everything runs locally.
- playbooks/orchestrate.md: "Restacks run in cloud" → serialized in the stacker's worktree; "one VM dies" → "one worktree when its agent dies"; liveness probes the background task list, not the Cursor dashboard; restart recovery reattaches by PR/branch — no cloud tier.
- playbooks/orchestrate.md: verifier "different model family" glossed as a different Claude model — single vendor.
- playbooks/session-pickup.md: transcript location is `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/<session-id>.jsonl` with `../reflect/scripts/find-transcript.mjs`; cloud-agent URL → session ID — PORTING Paths/Tools.
- playbooks/worktree-cleanup.md: "pinned chats / sidebar" → sessions the user is keeping, from the user — Claude Code has no pinned-chat sidebar.
- playbooks/worktree-cleanup.md: Cursor app-data reclaimer replaced by old transcripts under `~/.claude/projects/` (`cleanupPeriodDays`) — closest Claude Code equivalent.
- skills/auto/playbooks/multi-phase-plan.md: pstack skills are re-read from the installed plugin (<pstack root>/skills/...) instead of `git show origin/main:pstack/skills/...`; the project's control skill stays on trunk — a plugin user's repo does not vendor pstack.
- skills/auto/SKILL.md: states its own directory via ${CLAUDE_SKILL_DIR} so playbook script paths and ../<name> skill paths resolve absolutely.
- skills/auto/playbooks/autopilot-{full,stack}.md: per-tick re-read from the installed plugin root, not git show origin/main:pstack/... (same reason as multi-phase-plan).

## build

- agents/readonly.md: new plugin agent `stack:readonly` (disallowedTools Edit, Write, NotebookEdit; Bash for read-only commands only) — Cursor's `readonly: true` Task flag has no Agent-tool equivalent; MCP stays available (Cursor's readonly stripped it).
- agents/auto-agent.md: added `skills: [auto]` preload alongside the kept "read SKILL.md in full" instruction — PORTING Hooks; preload makes the read reliable.
- skills/swarm/SKILL.md: dropped `environment: "cloud"`/`"local"` and `cloud_base_branch`; writing workers get `isolation: "worktree"`, read-only workers use `stack:readonly`; non-default base handled per PORTING "Worktrees for delegates"; "cloud concurrency limit" → "number that run at once" — Claude Code subagents run locally.
- skills/arena/SKILL.md, architect/SKILL.md, interrogate/SKILL.md: Grok+Opus panels → `opus`+`fable`; vendor-prefix family fallback replaced by "fall back to `opus` (arena) / Reviewer A default (interrogate)"; added "keep at least two distinct models" — one vendor, so diversity is cross-model only.
- skills/arena/SKILL.md: candidates spawned as `general-purpose` with `isolation: "worktree"` when they write in the repo; judge is `stack:readonly` on a different Claude model — Phase A already asked for a worktree per candidate.
- skills/show-me-your-work/SKILL.md, playbooks/eval.md: Cursor agent-transcripts → `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/...jsonl` (+ `../reflect/scripts/find-transcript.mjs` finder, owned by another group); cross-model reviewer/judge is a different Claude model, reviewer runs as `stack:readonly`.
- skills/tdd/SKILL.md: step 4 and Final Response require quoting the failure content (the disagreement), not the assertion line — issue #59 item 3.
- playbooks/feature.md: step 4 adds the delegate-worktree base rule (commit first, base on HEAD via `worktree.baseRef: head` or manual `git worktree add ... HEAD`, name the base in the brief) — issue #228, PORTING "Worktrees for delegates".
- playbooks/hillclimb.md: parallel hypothesis subagents get `isolation: "worktree"` — explicit Claude Code mechanism for "each in its own worktree".
- skills/create-verification-skill/SKILL.md: `.claude/skills/verify-<app>/`; intro says playbooks drive via verify-<app> then control-ui/control-cli and that bundled `/verify` is user-only; Drive recipes point at the vendored control-ui/control-cli — issue #71, PORTING Verification drivers.
- skills/maintain-verification-skill/SKILL.md: `.claude/skills/verify-*/`; source-wave children are `stack:readonly` — issue #71.
- skills/control-ui/SKILL.md: "evidence for `verify-this`" (unvendored cursor-team-kit skill) → evidence for a project's `verify-<app>` skill or a PR's proof.
- playbooks/authoring-a-skill.md: step 1 `create-skill` → Claude Code skill format (docs link, name = dir, description) — PORTING create-skill row.
- skills/figure-it-out, swarm, arena, architect: "todolist" → TaskCreate/TaskUpdate or `.audit/<task-slug>.todo.md` — PORTING todo row.
- playbooks (bug-fix, perf-issue, visual-parity, prototype, runtime-forensics, refactoring): driver lines left as upstream's "the (matching) control skill (Non-negotiables)"; they defer to the `auto` skill's Non-negotiables, which own the PORTING driver order.

## research

- skills/principle-prove-it-works/SKILL.md: added "verify the process as well as the outcome" and "red is a colour, not a measurement" (with the convergence-probe identity-field rule) — pstack-claude #59 items 2 and 3.
- skills/recall/SKILL.md: description also fires "before telling the user that something was never recorded"; step 4 sweeps every location the project's standing rules name before reporting something as never recorded — #59 item 4.
- skills/recall/SKILL.md: transcript paragraph describes Claude Code's JSONL layout (encoded cwd, subagents dir, lines are records not only messages) — Claude Code transcripts are not one message per line.
- skills/blast-radius/SKILL.md: description and body fire pre-hoc on a brief that asserts something about existing code — #59 item 5.
- skills/how/SKILL.md: spawns are `stack:readonly` with sheet model + budget effort; upstream's "closest slug of the same family" fallback dropped — aliases have no family ladder; fallback is the default alias.
- skills/why/SKILL.md: spawns are `stack:readonly` instead of upstream's "agent mode, never readonly" — upstream avoided readonly only because Cursor's readonly strips MCP; stack:readonly keeps MCP and removes only edit tools, which is what "investigators shouldn't write" wants. Added "never strip MCP tools" in its place.
- skills/why/SKILL.md: MCP discovery reads `mcp__<server>__<tool>` names from the session tool list (deferred tools included), else `claude mcp list` — replaces Cursor's available-tools map / `mcps/` directory.
- skills/why/references/sources/slack.md: `mcp_auth` → `mcp__<server>__authenticate` tool or `/mcp` — Cursor tool name.
- skills/reflect/SKILL.md §1: transcript located with the bundled `scripts/find-transcript.mjs "<fragment>"` (optional `--cwd`) in `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/` — replaces Cursor's agent-transcripts ls/first-line scan.
- skills/reflect/SKILL.md §1–2: nothing goes beside a transcript path (no focus note); the fallback digest records what happened in turn order and states no diagnosis, verdict or cause — pstack-claude #231.
- skills/reflect/SKILL.md §2–3: reviewers and synthesizer are `stack:readonly` (keeps MCP, drops edit tools) instead of agent mode — upstream avoided readonly only because Cursor's strips MCP.
- skills/reflect/SKILL.md §5 + references/synthesizer.md: Cursor's `create-skill` routing → the `auto` skill's authoring-a-skill playbook and Claude Code's skill format; routing token `new skill via authoring-a-skill:`; description tuning runs a description-optimization loop only if the session has a skill-authoring skill that offers one — Claude Code ships no built-in equivalent.
- skills/reflect/references/*-reviewer.md: "skill used" evidence adds `Skill` tool calls and `/<name>` commands; paths `.claude/skills`, `~/.claude/skills`, `~/.claude/plugins`; Shell → Bash — Claude Code loads skills through the Skill tool.
- skills/reflect/references/synthesizer.md: drift example `gpt-4`→`gpt-4o` replaced by a function-rename example — the model-slug lint bans gpt-* names; the example's point (a rename drifts) is unchanged.
- skills/teach/SKILL.md, skills/ketchup/SKILL.md: "the image-generation tool" made conditional on the session having one (an MCP server), with a hand-drawn SVG as teach's fallback — Cursor ships image generation; Claude Code does not.
- skills/help/SKILL.md: Custom Mode / Option+Enter instructions → pstack's hooks (on by default; `session hook`/`reminder` toggles in the sheet; typing `/stack:auto` forces it); install via `/plugin marketplace add` + `/plugin install` or repo `.claude/settings.json`; public file URL → github.com/dhritcu/pstack-claude; "only setup loads from the user's words" now also names `auto` (hook-routed); deslop/control-* line dropped from "Not in pstack" (they ship here; the table fallback routes them by description); `/create-skill` → the authoring playbook; plan mode, cloud agents → worktree isolation; sheet applies after `/clear` too.
- skills/help/SKILL.md, references/recipes.md, references/prompting.md: every pstack slash command → `/stack:<name>` (`/verify-<app>` and `/loop` unchanged: project skill and built-in).
- skills/automate-me/SKILL.md: authoring via the `auto` skill's authoring-a-skill playbook + Claude Code's skill format instead of Cursor's `create-skill`; new mode skills default to `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/<handle>-mode/SKILL.md` (project `.claude/skills/` on request or when a personal category exists); added "route through pstack underneath" (invoke `stack:auto`, resolve pstack paths against its base directory) because a user-level skill can't reach the plugin by relative path; landing step split for personal vs project skills; update-mode timestamp falls back to mtime for untracked files.
- skills/automate-me/SKILL.md: AskUserQuestion shape "4-6 options, allow_multiple" → "up to 4 options, multiSelect" — Claude Code's AskUserQuestion caps options at 4 and adds "Other".
- skills/automate-me/SKILL.md: transcripts mined from `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/*.jsonl`.
- skills/why/references/synthesizer-prompt.md: template link `(url)` → a full PR URL placeholder — the port's link checker treats `url` as a broken relative path.
- skills/setup/SKILL.md: rewritten for Claude Code — sheet at `${CLAUDE_CONFIG_DIR:-~/.claude}/pstack-models.md` (injected by hooks, not always-applied); no model detection (offer fable/opus/sonnet/haiku/inherit, full ID only if the user names one); budget sets `effort` instead of rewriting slug effort tokens; new step 3(d) asks for the `session hook`/`reminder`/`subagent hook` toggles (documented that `session hook: off` also silences the reminder, matching hooks/pstack-hook.sh); sheet shape is markdown with `budget:` line and Claude defaults; step 7 kept; new optional step 8 offers `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` in one project's `.claude/settings.local.json` (#72), project scope only.
- skills/ketchup, correct, technical-writing: `/name` → `/stack:name` in descriptions/body.

## automation-docs

- automations/benny/**: pack destination `.cursor/automations/benny/` → `.claude/automations/benny/`, user config `.cursor/benny/` → `.claude/benny/` — kept outside `.claude/skills/` so the operational SKILL.md files never register as project skills, same as upstream's intent.
- automations/benny/**: Cursor Automations → two runners, GitHub Actions workflows on `anthropics/claude-code-action@v1` (default) or Claude Code routines — the two Claude Code surfaces that run headless on events/schedules; input names quoted from the action's action.yml and docs.
- automations/benny/**: Slack-only intake → `intake.type` github-issues (default) | slack | linear, with a Slack-term mapping table in triage-issue-reports and referenced from reproduce-and-fix-issues — GitHub issue labels work for every Claude Code user; the skill bodies keep upstream's Slack wording and rules unchanged, read through the table.
- automations/benny/templates/configuration.example.yaml: `slack:` section → `intake:` (`source_id`, `source_label`, `triage_identity`, `operations_channel_id`, `allow_worker_intake_writes`), new `runner:` section, models default to aliases (opus/sonnet) instead of "choose a slug" — config keys follow the intake generalization; aliases per PORTING.md Models.
- automations/benny/skills/*: `slack.triage_identity_user_id` / `slack.operations_channel_id` → `intake.triage_identity` / `intake.operations_channel_id` — follows the config rename.
- automations/benny/templates/benny-reader.agent.md (new; installed to `.claude/agents/benny-reader.md`): `tools: Read, Grep, Glob` — Claude Code subagents inherit MCP connectors and (via Bash) the run's tokens, so upstream's "if worker isolation cannot enforce it, do the work in the coordinator" would otherwise forbid all delegation; a no-Bash/no-MCP agent is the provable isolation. Skills now delegate only to it and the coordinator extracts video frames and git output for it.
- automations/benny/templates/benny-triage.workflow.yml, benny-reproduce.workflow.yml (new): workflow sources setup fills — replace Cursor's `/automate` draft + Automations editor handoff. Trigger `issues: labeled` with the intake label because the action only runs for write-access actors (its docs call `allowed_non_write_users` a significant risk); prompt passes coordinates only, never the issue title/body.
- automations/benny/skills/setup-benny/SKILL.md §1: `.cursor/settings.json` `plugins.pstack.enabled` → `.claude/settings.json` `extraKnownMarketplaces` + `enabledPlugins`; added that runners do not read it (action uses `plugin_marketplaces`/`plugins`; cloud sessions ignore repo-declared plugins per cloud-environments docs, so a routine installs pstack in its environment setup script) — verified in Claude Code docs.
- automations/benny/skills/setup-benny/SKILL.md §7: `/automate` creation flow, editor checklist, and "Creation boundary" rewritten for workflows/routines; draft → explicit approval → user adds secrets/creates routine; workflow kept uncommitted or `gh workflow disable`d until the thread-safety test passes — same gates, Claude Code mechanics.
- automations/benny/skills/setup-benny/SKILL.md §7: routine trigger limits stated (GitHub triggers cover only pull_request and release, schedule ≥ 1h, API fire text arrives as untrusted `<routine-fire-payload>`) — from code.claude.com/docs/en/routines; issue-driven routines therefore sweep on a schedule or use the API trigger.
- automations/benny/skills/*: added "sweep run" paragraph (schedule triggers process each unhandled report sequentially with its own frozen coordinates) — needed because routines and Slack/Linear-intake workflows cannot start per report.
- automations/benny/skills/triage-issue-reports/SKILL.md: when intake and tracker are the same GitHub repo, the source issue is the ticket (labels instead of a second issue) — avoids benny duplicating every report.
- automations/benny/skills/*: routine note that the GitHub proxy rejects `gh issue`/`gh pr` (use built-in GitHub tools or `gh api`) — from cloud-environments docs.
- automations/benny/skills/reproduce-and-fix-issues/SKILL.md §5: control skill examples (`verify-<app>`, `control-ui`, `control-cli`) — PORTING.md verification drivers.
- automations/benny/skills/setup-benny/SKILL.md §6: added "confirm the adapter in the runner" (GitHub runner / cloud session have no display) — repro runs remotely now, not in Cursor's cloud VM with desktop.
- automations/benny/templates/*-automation-prompt.md: header and trigger JSON rewritten for the workflow `prompt` input and routine fire payload.
- skills/make-bot-ui/SKILL.md: name `Make Bot UI` → `make-bot-ui`; Grok Bot webhook routine (`update_state`, `SendToUser secret-request`, `X-Automation-Key`, `api2.cursor.sh`) → Claude Code routine API trigger: create on the web (CLI can't add API triggers), URL `https://api.anthropic.com/v1/claude_code/routines/<id>/fire`, headers `Authorization: Bearer`, `anthropic-beta: experimental-cc-routine-2026-04-01`, `anthropic-version: 2023-06-01`, body `{"text": ...}` — quoted from routines docs.
- skills/make-bot-ui/SKILL.md: secret-request card → user writes the token to a gitignored 0600 file from their own terminal (`read -rs`), agent checks only `test -s` — Claude Code has no secret-entry UI.
- skills/make-bot-ui/SKILL.md: "drain the local log from the routine" → server resends logged entries with the next successful fire — a cloud routine cannot read the local machine's log.
- skills/make-bot-ui/SKILL.md: added API fire hourly caps (30/routine, 100/account) and that each fire starts a new billed session; added note to run `sudo tailscale ...` in the user's terminal when sudo can't run non-interactively.
- docs/guide/01-setup.md: install via `/plugin marketplace add dhritcu/pstack-claude` + `/plugin install stack@pstack-claude`; bare `/auto` noted as valid (skills docs: bare plugin skill name works unless taken), so guide prompts keep short names.
- docs/guide/01-setup.md, 02-auto.md: Custom Mode (option+enter) → pstack's SessionStart routing + per-prompt reminder hooks, on by default, toggled in the model sheet; Grok/Opus budget text → effort levels and Claude aliases; `auto`/`inherit-parent` → `inherit`; "todo list" → "task list".
- docs/guide/02-auto.md: Cursor cloud subagents / `/in-cloud` → Claude Code cloud sessions (`claude --cloud`), with the note that cloud sessions need pstack installed by setup script; worktree isolation for subagents via `isolation: "worktree"`.
- docs/guide/04-design.md, 07-overnight.md: "different model family" → "different Claude model" — PORTING.md Models.
- docs/guide/05-build-and-clean.md: `/deslop` "ships in cursor-team-kit" → vendored in pstack.
- docs/guide/06-verify-and-ship.md, 07-overnight.md: "scheduled automation" → `/schedule` routine or GitHub Actions workflow; Cursor `/loop` → Claude Code `/loop` (session must stay open).
- docs/guide/07-overnight.md: Cursor Projects → Claude Code Projects (public beta; plugins via Project settings > Plugins; "Continue as project" instead of dragging chats), plus the no-Project fallback (background subagents/worktrees or `claude --cloud`).
- docs/guide/09-make-it-yours.md: Cursor `create-skill` → Claude Code skill format; make-bot-ui blurb rewritten for routines.

## hooks and manifests

- hooks/*: Cursor custom mode (`mode: true`, `reminder:`, option+enter) becomes four hooks: SessionStart routing + model sheet, a per-prompt reminder (upstream's `reminder:` line, sharpened after real-session testing showed Opus skipping the router for a bug report), SubagentStart context, and a PostToolUse/UserPromptSubmit restatement of the todolist rule when `auto` loads (Cursor always has a todo tool; Claude Code often does not).
- .claude-plugin/plugin.json replaces .cursor-plugin/plugin.json and the Agent Plugins root plugin.json.
- skills/auto: model-invocable (upstream sets disable-model-invocation), so the hooks can route into it with the Skill tool. Every other skill keeps upstream's setting and is reached by path.

## review follow-ups

- skills/auto/scripts/watch-pr: a PR with no CI configured (GitHub confirms both that `gh pr checks` reports none and that the head commit's rollup is null) is a `ci-none` state that counts as clean for READY, instead of retrying forever. Upstream threw `ChecksUnavailable`, so such a PR could never finish (#151/#152 on the earlier port). Every unreadable or not-yet-reported state still fails closed. Verified on a real public no-CI PR: upstream retried at 60/120/240 s; the port finished in one pass.
- hooks/session-start-context.md and the per-prompt reminder: sharper than upstream's `reminder:` line (bug reports always count; the routing is the first tool call). A real headless Opus session with upstream's wording received the context and still fixed a reported bug without opening `auto`; with this wording it opened `auto` as its first call in every rerun.
- skills/create-skill (new): upstream relies on the editor's built-in `create-skill`; this port ships a Claude Code equivalent with the same three jobs upstream's references name (authoring rules, draft/test/iterate loop, description-optimization loop), tested with real `claude -p` sessions. Upstream's references point at it unchanged except for the path.
- skills/babysit (new): upstream's editor ships a built-in `/babysit`; this port ships it as a thin skill over the Babysit playbook and `watch-pr`. `auto` keeps upstream's note that the playbook supersedes it inside a run.
- skills/auto/playbooks/babysit.md: a subagent owner cannot arm `/loop` (a session command), so it runs the watcher with background Bash and reruns it.
- setup, help: `AskUserQuestion` takes at most four options; the fifth answer goes through its Other field or a numbered list.
- interrogate: a rejected panel model falls back to the default the panel doesn't already have, so the panel keeps two distinct models.
- automations/benny: `how`/`why` run in the coordinator or through `benny-reader`, never through `stack:readonly` (which keeps Bash and MCP), so the isolation rule holds. The reproduce workflow allows the repo's test and build commands.
- hooks (PreToolUse Agent): upstream's model slugs embed the effort (`...-xhigh-fast`), so a spawn could not drop it. Claude Code's Agent tool takes `effort` separately and its own description tells the model to set it only when explicitly asked; in a real feature run Opus dispatched `stack:auto-agent` with a model and no effort. The hook fills `effort` from the sheet's budget (default `xhigh`) for `stack:*` agents only, when the call has none. Verified in a real session: Claude Code logs "modified tool input keys: [effort, ...]" and the subagent runs at the budget's effort.
- setup: the sheet's explanation lines are `# ` comments (the hooks drop them), and the skill expects Claude Code's permission prompt for writing into its config directory.

## naming

- The plugin is `stack` (commands `/stack:<name>`), and upstream's personal names are generic: `poteto-mode` → `auto`, `poteto-agent` → `auto-agent`, `poteto-help` → `help`, `setup-pstack` → `setup`. Upstream's content is unchanged apart from these names; the author is credited in README, NOTICE and LICENSE. `tools/check.mjs` bans the old names so an upstream merge can't reintroduce them.
