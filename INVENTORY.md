# Inventory

Every upstream pstack capability and file, and how it works on Claude Code. Upstream: pstack 0.15.21 ([`upstream.json`](upstream.json)). Real-session evidence for the rows marked *tested* is in [TESTING.md](TESTING.md).

## Capabilities

| Upstream capability | Claude Code mechanism | Status |
|---|---|---|
| `poteto-mode` router: playbook match, todolist of playbook steps, routed skills, principles index | Skill `pstack:poteto-mode` (model-invocable); hooks route into it; todolist via `TaskCreate` or `.audit/<task-slug>.todo.md`, restated by a PostToolUse hook | tested |
| Custom mode (stays on each turn, `reminder:` line) | SessionStart + UserPromptSubmit hooks, toggles in the sheet | tested |
| 23 playbooks | Unchanged structure; platform lines ported | bug-fix, feature, babysit, worktree-cleanup tested |
| 24 principle skills | Unchanged except `prove-it-works` (#59) | read by path in real runs |
| `poteto-agent` delegate | `pstack:poteto-agent`, `background: true`, preloads `poteto-mode` via `skills:` | tested |
| Comment Sicko agent | `pstack:comment-sicko` | tested |
| `readonly: true` subagents | `pstack:readonly` agent (no Edit/Write/NotebookEdit) | tested (how, interrogate, reflect, swarm) |
| Per-role model + reasoning budget (`setup-pstack`, `.mdc` rule) | `pstack-models.md` sheet under `$CLAUDE_CONFIG_DIR`, injected by hooks; `model` alias + `effort` per Agent call; effort filled by a PreToolUse hook when omitted | tested |
| Multi-vendor review panels (arena, architect, interrogate) | Multi-model Claude panels (`opus` + `fable`) | interrogate, arena tested |
| Cloud agents / `environment: "cloud"` (swarm, autopilot, orchestrate) | Local background subagents; writers get `isolation: "worktree"`; long programs via `/loop`, routines or `claude --cloud` | swarm tested |
| Transcripts (`agent-transcripts/`) for reflect, recall, automate-me, session pickup, worktree audit | `~/.claude/projects/<encoded-cwd>/*.jsonl`; `find-transcript.mjs` | tested (reflect, real transcripts) |
| `watch-pr` PR watcher, `check-plan`, `orch`, `worktree-audit` | Same Bun scripts; no-CI PRs finish (#151/#152); transcript path ported | tested on live public PRs |
| `/loop` | Claude Code `/loop` (session); subagent owners run the watcher in background Bash | n/a |
| `AskQuestion` | `AskUserQuestion` (max 4 options) | setup-pstack tested |
| `/verify` driver for UIs | project `verify-<app>` skill, else bundled `control-ui` / `control-cli` (Claude's `/verify` is user-only) | text |
| `cursor-team-kit` `deslop`, `control-cli`, `control-ui` | Bundled skills | bundled |
| Editor built-in `create-skill` | `pstack:create-skill` with a real-session test loop | tested |
| Editor built-in `/babysit` | `pstack:babysit` over the Babysit playbook | tested |
| Plan mode | Claude Code plan mode | n/a |
| benny automations (Cursor Automations, Slack/Linear intake) | GitHub Action (`anthropics/claude-code-action`) or routines; GitHub Issues, Slack or Linear intake | templates only: needs a repo secret to run |
| make-bot-ui (Grok Bot webhook) | Claude Code routine API trigger | text: needs a routine and token |
| Guide (10 chapters) | Ported | text |

## Every file

Generated from `git diff upstream..main`. *ported* = platform wording or behavior changed (see [docs/DIVERGENCES.md](docs/DIVERGENCES.md)); *unchanged* = byte-identical to upstream; *added* = new in this port.


### plugin root (1 added, 2 removed (replaced), 4 unchanged, 1 ported)

| file | status |
|---|---|
| `.claude-plugin/plugin.json` | added |
| `.cursor-plugin/plugin.json` | removed (replaced) |
| `.gitignore` | unchanged |
| `LICENSE` | unchanged |
| `LICENSE-cursor-team-kit` | unchanged |
| `README.md` | ported |
| `assets/logo.png` | unchanged |
| `plugin.json` | removed (replaced) |

### agents (2 ported, 1 added)

| file | status |
|---|---|
| `agents/comment-sicko.md` | ported |
| `agents/poteto-agent.md` | ported |
| `agents/readonly.md` | added |

### automations (benny) (11 ported, 1 unchanged, 3 added)

| file | status |
|---|---|
| `automations/benny/FOR_AGENTS.md` | ported |
| `automations/benny/README.md` | ported |
| `automations/benny/skills/reproduce-and-fix-issues/SKILL.md` | ported |
| `automations/benny/skills/reproduce-and-fix-issues/references/control-adapter.md` | ported |
| `automations/benny/skills/reproduce-and-fix-issues/references/feature-map.example.md` | ported |
| `automations/benny/skills/reproduce-and-fix-issues/references/verify-existing-fix.md` | unchanged |
| `automations/benny/skills/setup-benny/SKILL.md` | ported |
| `automations/benny/skills/triage-issue-reports/SKILL.md` | ported |
| `automations/benny/skills/triage-issue-reports/references/routing.example.md` | ported |
| `automations/benny/templates/benny-reader.agent.md` | added |
| `automations/benny/templates/benny-reproduce.workflow.yml` | added |
| `automations/benny/templates/benny-triage.workflow.yml` | added |
| `automations/benny/templates/configuration.example.yaml` | ported |
| `automations/benny/templates/reproduce-automation-prompt.md` | ported |
| `automations/benny/templates/triage-automation-prompt.md` | ported |

### guide (11 ported, 6 unchanged)

| file | status |
|---|---|
| `docs/guide/01-setup.md` | ported |
| `docs/guide/02-poteto-mode.md` | ported |
| `docs/guide/03-understand.md` | ported |
| `docs/guide/04-design.md` | ported |
| `docs/guide/05-build-and-clean.md` | ported |
| `docs/guide/06-verify-and-ship.md` | ported |
| `docs/guide/07-overnight.md` | ported |
| `docs/guide/08-principles.md` | ported |
| `docs/guide/09-make-it-yours.md` | ported |
| `docs/guide/10-recipes-and-pitfalls.md` | ported |
| `docs/guide/README.md` | ported |
| `docs/guide/images/design.jpg` | unchanged |
| `docs/guide/images/overnight.jpg` | unchanged |
| `docs/guide/images/recipes.jpg` | unchanged |
| `docs/guide/images/router.jpg` | unchanged |
| `docs/guide/images/understanding.jpg` | unchanged |
| `docs/guide/images/verification.jpg` | unchanged |

### hooks (3 added)

| file | status |
|---|---|
| `hooks/hooks.json` | added |
| `hooks/pstack-hook.sh` | added |
| `hooks/session-start-context.md` | added |

### skills (32 ported, 31 unchanged, 4 added)

| file | status |
|---|---|
| `skills/architect/SKILL.md` | ported |
| `skills/architect/references/design-red-flags.md` | unchanged |
| `skills/architect/references/rationale-template.md` | unchanged |
| `skills/architect/references/runner-prompt.md` | unchanged |
| `skills/arena/SKILL.md` | ported |
| `skills/automate-me/SKILL.md` | ported |
| `skills/babysit/SKILL.md` | added |
| `skills/benchmark-checklist/SKILL.md` | unchanged |
| `skills/blast-radius/SKILL.md` | ported |
| `skills/bro/SKILL.md` | unchanged |
| `skills/control-cli/SKILL.md` | unchanged |
| `skills/control-ui/SKILL.md` | ported |
| `skills/correct/SKILL.md` | ported |
| `skills/create-skill/SKILL.md` | added |
| `skills/create-verification-skill/SKILL.md` | ported |
| `skills/create-verification-skill/references/feature-map-example/README.md` | unchanged |
| `skills/create-verification-skill/references/feature-map-example/create-note.md` | unchanged |
| `skills/create-verification-skill/references/feature-map-example/search.md` | unchanged |
| `skills/deslop/SKILL.md` | unchanged |
| `skills/figure-it-out/SKILL.md` | ported |
| `skills/how/SKILL.md` | ported |
| `skills/how/references/explainer-prompt.md` | unchanged |
| `skills/how/references/explorer-prompt.md` | unchanged |
| `skills/interrogate/SKILL.md` | ported |
| `skills/interrogate/references/code-quality-review.md` | unchanged |
| `skills/interrogate/references/lead-judgment.md` | unchanged |
| `skills/interrogate/references/reviewer-prompt.md` | unchanged |
| `skills/interrogate/references/rubric.md` | unchanged |
| `skills/ketchup/SKILL.md` | ported |
| `skills/maintain-verification-skill/SKILL.md` | ported |
| `skills/make-bot-ui/SKILL.md` | ported |
| `skills/no-comments/SKILL.md` | ported |
| `skills/poteto-help/SKILL.md` | ported |
| `skills/poteto-help/references/prompting.md` | ported |
| `skills/poteto-help/references/recipes.md` | ported |
| `skills/recall/SKILL.md` | ported |
| `skills/reflect/SKILL.md` | ported |
| `skills/reflect/references/divergent-reviewer.md` | ported |
| `skills/reflect/references/judgment-reviewer.md` | ported |
| `skills/reflect/references/synthesizer.md` | ported |
| `skills/reflect/references/tooling-reviewer.md` | ported |
| `skills/reflect/scripts/find-transcript.mjs` | added |
| `skills/reflect/scripts/find-transcript.test.mjs` | added |
| `skills/setup-pstack/SKILL.md` | ported |
| `skills/show-me-your-work/SKILL.md` | ported |
| `skills/show-me-your-work/references/decision-log-template.tsv` | unchanged |
| `skills/show-me-your-work/scripts/log.sh` | unchanged |
| `skills/swarm/SKILL.md` | ported |
| `skills/tdd/SKILL.md` | ported |
| `skills/teach/SKILL.md` | ported |
| `skills/technical-writing/SKILL.md` | ported |
| `skills/typescript-best-practices/SKILL.md` | unchanged |
| `skills/typescript-best-practices/references/patterns.md` | unchanged |
| `skills/unslop/SKILL.md` | unchanged |
| `skills/why/SKILL.md` | ported |
| `skills/why/references/epistemics.md` | unchanged |
| `skills/why/references/investigator-prompt.md` | unchanged |
| `skills/why/references/source-playbook.md` | unchanged |
| `skills/why/references/sources/code-archaeology.md` | unchanged |
| `skills/why/references/sources/databricks.md` | unchanged |
| `skills/why/references/sources/datadog.md` | unchanged |
| `skills/why/references/sources/incident-postmortem.md` | unchanged |
| `skills/why/references/sources/linear.md` | unchanged |
| `skills/why/references/sources/notion.md` | unchanged |
| `skills/why/references/sources/sentry.md` | unchanged |
| `skills/why/references/sources/slack.md` | ported |
| `skills/why/references/synthesizer-prompt.md` | ported |

### poteto-mode (1 ported, 1 unchanged)

| file | status |
|---|---|
| `skills/poteto-mode/SKILL.md` | ported |
| `skills/poteto-mode/references/bugbot-triage.md` | unchanged |

### poteto-mode playbooks (17 ported, 6 unchanged)

| file | status |
|---|---|
| `skills/poteto-mode/playbooks/authoring-a-skill.md` | ported |
| `skills/poteto-mode/playbooks/autonomous-run.md` | ported |
| `skills/poteto-mode/playbooks/autopilot-full.md` | ported |
| `skills/poteto-mode/playbooks/autopilot-stack.md` | ported |
| `skills/poteto-mode/playbooks/babysit.md` | ported |
| `skills/poteto-mode/playbooks/bug-fix.md` | ported |
| `skills/poteto-mode/playbooks/eval.md` | ported |
| `skills/poteto-mode/playbooks/feature.md` | ported |
| `skills/poteto-mode/playbooks/hillclimb.md` | ported |
| `skills/poteto-mode/playbooks/investigation.md` | unchanged |
| `skills/poteto-mode/playbooks/multi-phase-plan.md` | ported |
| `skills/poteto-mode/playbooks/opening-a-pr.md` | ported |
| `skills/poteto-mode/playbooks/orchestrate.md` | ported |
| `skills/poteto-mode/playbooks/pause-safely.md` | unchanged |
| `skills/poteto-mode/playbooks/perf-issue.md` | ported |
| `skills/poteto-mode/playbooks/prototype.md` | unchanged |
| `skills/poteto-mode/playbooks/refactoring.md` | ported |
| `skills/poteto-mode/playbooks/runtime-forensics.md` | unchanged |
| `skills/poteto-mode/playbooks/session-pickup.md` | ported |
| `skills/poteto-mode/playbooks/shipping.md` | ported |
| `skills/poteto-mode/playbooks/trace-forensics.md` | unchanged |
| `skills/poteto-mode/playbooks/visual-parity.md` | unchanged |
| `skills/poteto-mode/playbooks/worktree-cleanup.md` | ported |

### poteto-mode scripts (11 unchanged, 10 ported)

| file | status |
|---|---|
| `skills/poteto-mode/scripts/bootstrap.ts` | unchanged |
| `skills/poteto-mode/scripts/bun.lock` | ported |
| `skills/poteto-mode/scripts/check-plan.mjs` | unchanged |
| `skills/poteto-mode/scripts/check-plan.test.ts` | unchanged |
| `skills/poteto-mode/scripts/orch/orch.test.ts` | unchanged |
| `skills/poteto-mode/scripts/orch/orch.ts` | unchanged |
| `skills/poteto-mode/scripts/orch/store.ts` | unchanged |
| `skills/poteto-mode/scripts/package.json` | ported |
| `skills/poteto-mode/scripts/watch-pr/cli.test.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/cli.ts` | unchanged |
| `skills/poteto-mode/scripts/watch-pr/fakes.test-helper.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/github.test.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/github.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/policy.test.ts` | unchanged |
| `skills/poteto-mode/scripts/watch-pr/policy.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/render.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/tsconfig.json` | unchanged |
| `skills/poteto-mode/scripts/watch-pr/types.compile.ts` | unchanged |
| `skills/poteto-mode/scripts/watch-pr/types.ts` | ported |
| `skills/poteto-mode/scripts/watch-pr/watch-pr` | unchanged |
| `skills/poteto-mode/scripts/worktree-audit.sh` | ported |

### principles (23 unchanged, 1 ported)

| file | status |
|---|---|
| `skills/principle-attack-the-premise/SKILL.md` | unchanged |
| `skills/principle-boundary-discipline/SKILL.md` | unchanged |
| `skills/principle-build-the-lever/SKILL.md` | unchanged |
| `skills/principle-encode-lessons-in-structure/SKILL.md` | unchanged |
| `skills/principle-exhaust-the-design-space/SKILL.md` | unchanged |
| `skills/principle-experience-first/SKILL.md` | unchanged |
| `skills/principle-explain-the-number/SKILL.md` | unchanged |
| `skills/principle-fix-root-causes/SKILL.md` | unchanged |
| `skills/principle-foundational-thinking/SKILL.md` | unchanged |
| `skills/principle-guard-the-context-window/SKILL.md` | unchanged |
| `skills/principle-laziness-protocol/SKILL.md` | unchanged |
| `skills/principle-make-operations-idempotent/SKILL.md` | unchanged |
| `skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md` | unchanged |
| `skills/principle-minimize-reader-load/SKILL.md` | unchanged |
| `skills/principle-model-the-domain/SKILL.md` | unchanged |
| `skills/principle-never-block-on-the-human/SKILL.md` | unchanged |
| `skills/principle-outcome-oriented-execution/SKILL.md` | unchanged |
| `skills/principle-prove-it-works/SKILL.md` | ported |
| `skills/principle-redesign-from-first-principles/SKILL.md` | unchanged |
| `skills/principle-separate-before-serializing-shared-state/SKILL.md` | unchanged |
| `skills/principle-sequence-verifiable-units/SKILL.md` | unchanged |
| `skills/principle-subtract-before-you-add/SKILL.md` | unchanged |
| `skills/principle-test-behavior-not-implementation/SKILL.md` | unchanged |
| `skills/principle-type-system-discipline/SKILL.md` | unchanged |
