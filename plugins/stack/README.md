# pstack

i'm [poteto](https://x.com/poteto). i'm not a president or ceo, but i've worked with millions of lines of code at Meta, Netflix, and Cursor. i'm also on the react core team where i help build and maintain react compiler.

there's a growing sense that ai writes too much slop code. i agree. i don't want to ship like a team of twenty slop artists. throughput without quality is not a goal i aspire to. if you want to go fast, go deep first. 

**pstack is my answer.** these are the same skills i use everyday to ship high quality code at Cursor. this turns claude code into a real engineering team. the goal is not to maximize loc, in fact it's the opposite. pstack helps you write less, but higher quality code.

**pstack gives you fearless parallelism.** when you can go deep on one agent and trust it to write good, verifiable code, you can truly parallelize with confidence. start multiple agents up with `auto` and trust that they'll apply rigorous engineering principles to their work.

**use each claude model for what it's best at.** every model has its strengths and weaknesses. many of my skills use multi-model workflows: code delegates, judgment, and review panels each run on the model that suits them, and the panels put different claude models against each other.

fork it. improve it. make it yours. PRs are welcome! 

## install

```
/plugin install stack --marketplace dhritcu/pstack-claude
```

on claude code older than 2.1.275, add the marketplace first:

```
/plugin marketplace add dhritcu/pstack-claude
/plugin install stack@pstack-claude
```

this is a claude code port of [pstack](https://github.com/cursor/plugins/tree/main/pstack). see the [repository readme](https://github.com/dhritcu/pstack-claude#readme) for what changed and why.

## get started

two steps:

1. run [`/stack:setup`](./skills/setup/SKILL.md), pick a reasoning budget, and choose which models you want.
2. use [`/stack:auto`](./skills/auto/SKILL.md) whenever you're doing anything that requires rigor.

new here? the [pstack guide](./docs/guide/README.md) walks you through a first real task, from setup and prompting through verification and overnight runs. stuck, or unsure which skill fits? ask [`/stack:help`](./skills/help/SKILL.md).

that's it. the other skills are situational; the mode skill uses them for you as needed. out of the box the mode splits work by model strength: code delegates (feature, refactoring, bug fix, perf, hillclimb) go to sonnet, prose and judgment go to opus, and the hardest changes go to fable, all at xhigh effort. the default review panel is opus / fable. [`/stack:setup`](./skills/setup/SKILL.md) changes any of it.

## usage

use [`/stack:auto`](./skills/auto/SKILL.md) at the start of a task. it reads your request, picks from a set of playbooks, and runs the other skills as the steps need them.

### just use [`/stack:auto`](./skills/auto/SKILL.md)

this skill is the main shortcut. i use it whenever i need the agent to do rigorous engineering work. it comes with twenty-three playbooks:

```
/stack:auto this pr has a subtle bug where the scroll drifts every 750ms even when idle. repro
first, then fix and verify.
```

```
/stack:auto i'm going to bed. land the stack even if ci flakes. i want everything merged by
morning.
```

<details>
<summary>the twenty-three playbooks</summary>

| playbook | for |
|---|---|
| [investigation](./skills/auto/playbooks/investigation.md) | a read-only question. how does x work, why was y built this way, are we sure. |
| [bug fix](./skills/auto/playbooks/bug-fix.md) | reproduce a defect, root-cause it, and fix with runtime evidence. |
| [perf](./skills/auto/playbooks/perf-issue.md) | trace a measured slowness and improve it against a baseline. |
| [hillclimb](./skills/auto/playbooks/hillclimb.md) | sustained, scientific improvement of one metric against a target, looping hypotheses with before/after measurement and one commit per accepted win. |
| [runtime forensics](./skills/auto/playbooks/runtime-forensics.md) | diagnose a live symptom (leak, idle-cpu spin, glitch) from instrumentation. |
| [trace forensics](./skills/auto/playbooks/trace-forensics.md) | diagnose a captured profiling artifact (cpuprofile, trace, spindump, heap snapshot). |
| [feature](./skills/auto/playbooks/feature.md) | new or changed behavior, built from a named data shape. |
| [refactoring](./skills/auto/playbooks/refactoring.md) | a behavior-preserving change to structure or shape. |
| [prototype](./skills/auto/playbooks/prototype.md) | a throwaway sketch to make a design or behavioral decision cheaply, or to settle an empirical fork by observing it. |
| [visual parity](./skills/auto/playbooks/visual-parity.md) | pixel-exact ui equivalence between two implementations. |
| [authoring a skill](./skills/auto/playbooks/authoring-a-skill.md) | writing or editing a SKILL.md. |
| [eval](./skills/auto/playbooks/eval.md) | test how a skill or prompt change affects agent behavior, blinded. |
| [babysit](./skills/auto/playbooks/babysit.md) | drive a pr or a stack to merge-ready: conflicts, review threads, ci. |
| [shipping](./skills/auto/playbooks/shipping.md) | independently verify a green stack, then land the contiguous verified run bottom-up through github by default or origin when available. |
| [autonomous run](./skills/auto/playbooks/autonomous-run.md) | drive a long task to completion without stopping. |
| [orchestrate](./skills/auto/playbooks/orchestrate.md) | a standing project handed to one coordinator chat: multi-day, many stacked prs, fleets of subagents. |
| [autopilot-full](./skills/auto/playbooks/autopilot-full.md) | run independent prs to merged with one owner per pr and a root swarm verdict on each round, from the code-ready head on. |
| [autopilot-stack](./skills/auto/playbooks/autopilot-stack.md) | build and verify one linear base-branch stack for the operator to review and land. |
| [session pickup](./skills/auto/playbooks/session-pickup.md) | resume or take over a prior agent's in-flight work. |
| [pause safely](./skills/auto/playbooks/pause-safely.md) | suspend in-flight work cleanly so it can be resumed later. |
| [multi-phase plan](./skills/auto/playbooks/multi-phase-plan.md) | work that spans phases or stacked PRs. |
| [worktree cleanup](./skills/auto/playbooks/worktree-cleanup.md) | reclaim disk by pruning merged or abandoned worktrees and stale ios simulators, safety-gated. |
| [opening a pr](./skills/auto/playbooks/opening-a-pr.md) | open a ready pr from small ordered commits with a conventional commits title and a briefing-style body. invoked at the end of every other playbook. |

</details>



when invoked it:

1. matches your task to a [playbook](./skills/auto/playbooks/) and opens a todo list whose first items are its steps, copied in verbatim.
2. routes to the other skills as the steps fire.
3. writes unslopped replies framed for the consumer and the maintainer.

the full rules and playbooks live in [`skills/auto/SKILL.md`](./skills/auto/SKILL.md).

[`/stack:auto`](./skills/auto/SKILL.md) is on across turns out of the box. pstack's hooks tell every session when to route into it, remind it on each new prompt, and give subagents the principles index. it applies itself when a playbook matches or the task needs rigor, and stays out of the way otherwise. say so to opt out for a task. to turn the hooks off, add `session hook: off`, `reminder: off`, or `subagent hook: off` to your model sheet (see [`/stack:setup`](./skills/setup/SKILL.md)).

[`/stack:auto`](./skills/auto/SKILL.md) works extremely well with claude code's `/loop` command. you can make claude code work for many hours without sacrificing rigor.

## skills

[`/stack:auto`](./skills/auto/SKILL.md) runs most of these for you when a step needs them (`how`, `why`, `architect`, `arena`, `swarm`, `interrogate`, `unslop`, `no-comments`, `technical-writing`, `tdd`, and the principles). the table below is for when you want one directly:

```
/stack:how do we cancel runs? do we have an n+1 when we look up every run to cancel?
```

```
/stack:interrogate review this pr.
```

<details>
<summary>all skills</summary>

| skill | use it when |
|---|---|
| [`/stack:auto`](./skills/auto/SKILL.md) | default entry point for any non-trivial task. |
| [`/stack:help`](./skills/help/SKILL.md) | you're new to pstack, or unsure which skill, playbook, or principle fits. finds out what you're trying to do, answers that part, and hands you a prompt to type. runs only when you type `/stack:help`. |
| [`/stack:how`](./skills/how/SKILL.md) | you want a walkthrough of how a subsystem works. |
| [`/stack:why`](./skills/why/SKILL.md) | you want to know why something was built this way. discovers available MCPs at run time and queries each evidence category in parallel (source control, issue tracker, long-form docs, real-time chat, infra observability, error tracking, analytics warehouse). |
| [`/stack:recall`](./skills/recall/SKILL.md) | you're starting or resuming work and want your recent context on a topic rebuilt from your own chat history and the shared record, handed back as a tight current-state brief. |
| [`/stack:ketchup`](./skills/ketchup/SKILL.md) | you want everything in this chat since your last message, in plain words, with an executive summary for each action item so you can make the call. |
| [`/stack:blast-radius`](./skills/blast-radius/SKILL.md) | you have a small-looking change and want to know what else it could break, with the one fact it's safe because of proven by running code, not asserted. |
| [`/stack:architect`](./skills/architect/SKILL.md) | you're about to write code that crosses a function boundary and want the caller's usage, types, and module shape settled first. |
| [`/stack:arena`](./skills/arena/SKILL.md) | you want N parallel attempts at the same thing, then to grab the best parts of each. |
| [`/stack:swarm`](./skills/swarm/SKILL.md) | you want N parallel workers across different slices or races, then one aggregated report. |
| [`/stack:interrogate`](./skills/interrogate/SKILL.md) | you have a diff and want different models to try to break it, including a strict code-quality lens. |
| [`/stack:automate-me`](./skills/automate-me/SKILL.md) | you want your own `-mode` skill, drafted from how you've actually worked. |
| [`/stack:make-bot-ui`](./skills/make-bot-ui/SKILL.md) | you want a page or dashboard whose buttons wake a claude code routine over its api trigger, including the token handoff and Tailscale. |
| [`/stack:setup`](./skills/setup/SKILL.md) | you want to pick which models pstack uses per role. asks for a budget and writes the model sheet. |
| [`/stack:reflect`](./skills/reflect/SKILL.md) | a long task landed and you want the recipe captured as a skill edit. |
| [`/stack:correct`](./skills/correct/SKILL.md) | you keep correcting agents for the same mistakes. mines history for mistake classes, fixes each at the highest level that works (architecture, then types, lint, and ci, then tests, with docs last), and keeps a table pairing each rule with what enforces it. |
| [`/stack:teach`](./skills/teach/SKILL.md) | you want to actually understand a change or subsystem, not just have it summarized. runs how + why and weaves one plain explanation, built up diagram by diagram. |
| [`/stack:tdd`](./skills/tdd/SKILL.md) | you're fixing a bug and there's a cheap local test path. write the failing test first, then the fix. |
| [`/stack:benchmark-checklist`](./skills/benchmark-checklist/SKILL.md) | you ran a benchmark or measured a speedup or regression. vets the number (limiter, tuning, errors, repeat runs, end-to-end relevance) before you report or act on it. |
| [`/stack:no-comments`](./skills/no-comments/SKILL.md) | strip comments before review; spawns Comment Sicko, fixes accepted findings, offers encodings for claimed constraints. |
| [`/stack:typescript-best-practices`](./skills/typescript-best-practices/SKILL.md) | you're reading or editing typescript. grounds the type-system-discipline principle in syntax. |
| [`/stack:figure-it-out`](./skills/figure-it-out/SKILL.md) | no bundled playbook fits. designs a rigorous, auditable playbook for the task. |
| [`/stack:show-me-your-work`](./skills/show-me-your-work/SKILL.md) | you want a reviewable decision trail. logs decisions to a tsv you can commit. |
| [`/stack:create-verification-skill`](./skills/create-verification-skill/SKILL.md) | your project has no scripted way to prove app behavior. generates a project-local verify skill with a feature map, for any language or platform. |
| [`/stack:maintain-verification-skill`](./skills/maintain-verification-skill/SKILL.md) | your verify skill's feature map has drifted from the app. source wave + one live pass, at most one PR of proven corrections. |
| [`/stack:unslop`](./skills/unslop/SKILL.md) | you're cleaning up writing. removes AI tells. |
| [`/stack:bro`](./skills/bro/SKILL.md) | you want the last message restated in plain human language, no jargon. |
| [`/stack:technical-writing`](./skills/technical-writing/SKILL.md) | layered doc standard (Diátaxis + Google developer style + STE + Global English) for docs, RFCs, readmes, PR descriptions, commit messages. |
| [`/stack:create-skill`](./skills/create-skill/SKILL.md) | you're writing or tuning a skill. claude code's skill format, then a real-session draft / test / iterate loop. |
| [`/stack:babysit`](./skills/babysit/SKILL.md) | you want one pr driven to merge-ready outside an `auto` run. |

</details>



### examples

mostly i type [`/stack:auto`](./skills/auto/SKILL.md) at the start of a task and let it route to a playbook. the other skills fire as the steps need them. a few i reach for directly.


<details>
<summary>all the examples</summary>

```
bug fix:           /stack:auto this pr has a subtle bug where the scroll drifts every 750ms even
                   when idle. repro first, then fix and verify.
perf:              /stack:auto a big list takes a second or two to load even though we virtualize.
                   run a cpu trace and tell me why.
feature:           /stack:auto build a small feature behind a feature flag. verify it really works.
prototype:         /stack:auto build two prototypes of the markdown renderer so we can compare.
                   spawn an agent for each.
multi-phase:       /stack:auto open source these skills as a plugin. nothing internal leaks, work
                   in a temp dir, show me the dependency graph first.
overnight run:     /stack:auto i'm going to bed. land the stack even if ci flakes. i want
                   everything merged by morning.
babysit:           /stack:auto check on pr 123. anything outstanding?
visual parity:     /stack:auto the row spacing is too tall when this flag is on. the second image
                   is correct. repro and fix until it matches.
figure it out:     /stack:auto i'm stepping away. migrate every caller from the synchronous store
                   to the new async one, keeping behavior identical. i want to trust it was done
                   right when i'm back.
how:               /stack:how do we cancel runs? do we have an n+1 when we look up every run to cancel?
why:               /stack:why is this feature flag not on yet?
architect:         design this instrumentation to be high signal with no false positives. /stack:architect
                   this first.
arena:             /stack:arena take my prompt to the arena verbatim. i want to compare their proposals
                   with yours.
swarm:             /stack:swarm check every package under packages/ against its check.sh. one worker per
                   package. one report.
interrogate:       /stack:interrogate review this pr.
tdd:               /stack:tdd implement
unslop:            can we unslop and tighten the new changes?
reflect:           /stack:reflect that took too long. capture what we learned so the next run doesn't
                   repeat it.
correct:           /stack:correct
show-me-your-work: /stack:show-me-your-work keep a decision trail i can review when i'm back.
automate-me:       /stack:automate-me
help:              /stack:help which skill should i use to review this branch?
```

</details>

## the `auto-agent` and Comment Sicko subagents

[`/stack:auto`](./skills/auto/SKILL.md) runs in the chat that receives it. that chat owns the playbook, the todo list, and every subagent spawn.

pstack also ships [`subagent_type: "stack:auto-agent"`](./agents/auto-agent.md) as the wrapper for delegates spawned during a run. it preloads `auto` in full, including its inline principles index, before doing any work. substituting `general-purpose` skips that read and drifts. do not spawn `auto-agent` to run the playbook itself.

[`/stack:auto`](./skills/auto/SKILL.md) and [`subagent_type: "stack:auto-agent"`](./agents/auto-agent.md) route through the same wrapper.

pstack also ships [Comment Sicko](./agents/comment-sicko.md), a comment reviewer available as `subagent_type: "stack:comment-sicko"`. usually invoke it through [`/stack:no-comments`](./skills/no-comments/SKILL.md), not directly.

## principles

twenty-four short skills, one principle each. `auto` indexes them inline and reads that index at task start. the standalone files are there so other skills can reference a principle by name, and so the index can point at the full rule for each.

<details>
<summary>all twenty-four principles</summary>

| principle | group | rule |
|---|---|---|
| [laziness-protocol](./skills/principle-laziness-protocol/SKILL.md) | core | Bias toward deletion and the smallest change that solves the problem. |
| [foundational-thinking](./skills/principle-foundational-thinking/SKILL.md) | core | Apply before writing logic: choosing core types and data structures, sequencing scaffold-vs-feature work, asking what concurrent actors share. Get the data structures right so downstream code becomes obvious. |
| [redesign-from-first-principles](./skills/principle-redesign-from-first-principles/SKILL.md) | core | Redesign as if the requirement had been a foundational assumption from day one, instead of bolting it on. |
| [attack-the-premise](./skills/principle-attack-the-premise/SKILL.md) | core | Apply when two or more fixes that share one premise have failed the same gate. Take a census of which actors hold the imbalance before the next fix, then question the premise instead of writing another fix that assumes it. |
| [subtract-before-you-add](./skills/principle-subtract-before-you-add/SKILL.md) | core | Remove dead weight, redundant validators, and stub references first, then build on the simpler base. |
| [minimize-reader-load](./skills/principle-minimize-reader-load/SKILL.md) | core | Count layers between question and answer, and hidden state in the reader's head; collapse one-caller wrappers and shrink mutable scope. |
| [outcome-oriented-execution](./skills/principle-outcome-oriented-execution/SKILL.md) | core | Apply during planned rewrites and migrations with explicit phase boundaries. Converge on the target architecture; don't preserve smooth intermediate states with throwaway compatibility code. |
| [experience-first](./skills/principle-experience-first/SKILL.md) | core | Choose user delight over implementation convenience; ship fewer polished features over more rough ones. |
| [exhaust-the-design-space](./skills/principle-exhaust-the-design-space/SKILL.md) | core | Build 2-3 competing prototypes and compare side by side before committing. |
| [build-the-lever](./skills/principle-build-the-lever/SKILL.md) | core | Apply to any non-trivial work, not just bulk work: edits, migrations, analyses, checks. Build the tool that does it or proves it (codemod, script, generator, or a skill your subagents follow) instead of working by hand. The tool is the artifact a reviewer can rerun. |
| [model-the-domain](./skills/principle-model-the-domain/SKILL.md) | architecture | Encode the domain in a structure instead of scattered conditionals. |
| [boundary-discipline](./skills/principle-boundary-discipline/SKILL.md) | architecture | Concentrate guards at system boundaries (CLI, config, network, external APIs); trust internal types and keep business logic in pure functions. |
| [type-system-discipline](./skills/principle-type-system-discipline/SKILL.md) | architecture | Make illegal states unrepresentable, brand semantic primitives, parse external data at boundaries, refuse to lie to the compiler, exhaust variants, derive from authoritative schemas. |
| [make-operations-idempotent](./skills/principle-make-operations-idempotent/SKILL.md) | architecture | Converge to the same end state regardless of partial prior runs. |
| [migrate-callers-then-delete-legacy-apis](./skills/principle-migrate-callers-then-delete-legacy-apis/SKILL.md) | architecture | Migrate callers and delete the old API in the same wave instead of preserving compatibility layers. |
| [separate-before-serializing-shared-state](./skills/principle-separate-before-serializing-shared-state/SKILL.md) | architecture | Eliminate the sharing first; serialize structurally only when one shared writer is a real invariant. |
| [prove-it-works](./skills/principle-prove-it-works/SKILL.md) | verification | Apply after completing a task, before declaring done. Verify against the real artifact (run the feature, read the actual value, inspect the diff), not a proxy, self-report, or 'it compiles.'. |
| [fix-root-causes](./skills/principle-fix-root-causes/SKILL.md) | verification | Trace each symptom to its root cause and fix it there; reproduce first, ask why until you reach it, resist nil-check guards that silence crashes. |
| [sequence-verifiable-units](./skills/principle-sequence-verifiable-units/SKILL.md) | verification | Apply to multi-step work (sweeps, migrations, runs of similar edits) and to how you stack commits and PRs. Break work into small units that each end in a verifiable state, check each before the next, and order delivery so the sequence proves itself to a reviewer. |
| [test-behavior-not-implementation](./skills/principle-test-behavior-not-implementation/SKILL.md) | verification | Apply when you write, change, or keep a test. Call the code the way its users do and assert the result they observe against a literal expected value. If the test would still pass when every imported function returns undefined, rewrite the assertion or delete the test. |
| [explain-the-number](./skills/principle-explain-the-number/SKILL.md) | verification | Apply before you trust, report, or act on a number you measured: a speedup, a regression, a throughput, a latency, or an eval result. Find what limits it, and rule out that it measured something other than the work you think. |
| [guard-the-context-window](./skills/principle-guard-the-context-window/SKILL.md) | delegation | Route bulk to subagents; keep summaries in the main thread, not raw payloads. |
| [never-block-on-the-human](./skills/principle-never-block-on-the-human/SKILL.md) | delegation | Proceed, present the result, let the human course-correct after the fact; reserve confirmation for irreversible actions. |
| [encode-lessons-in-structure](./skills/principle-encode-lessons-in-structure/SKILL.md) | meta | Encode the rule as a lint, metadata flag, runtime check, or script instead of more text. |

</details>

## bundled extras

`auto` routes to three skills that upstream ships in a separate plugin (team kit). this port bundles them, unchanged apart from platform wording:

- [`deslop`](./skills/deslop/SKILL.md) before commit.
- [`control-cli`](./skills/control-cli/SKILL.md) (CLIs and TUIs) and [`control-ui`](./skills/control-ui/SKILL.md) (browser, Electron, web) to drive the real app.

two of upstream's references are built into upstream's editor, so this port ships them as skills:

- [`/stack:create-skill`](./skills/create-skill/SKILL.md) authors, tests, and tunes a skill in claude code's format, with a real-session draft / test / iterate loop.
- [`/stack:babysit`](./skills/babysit/SKILL.md) is the standalone pr babysitter. inside `auto`, the [babysit playbook](./skills/auto/playbooks/babysit.md) supersedes it for pr-status requests.

claude code's bundled `/verify` only runs when you type it, so pstack never asks the model to call it. for a project-specific driver, run [`/stack:create-verification-skill`](./skills/create-verification-skill/SKILL.md).

## why are there no planning skills?

claude code already has a great plan mode which works great with pstack. but personally, i don't believe in planning. the best spec is code. if you do want to make a plan, [`/stack:auto`](./skills/auto/SKILL.md) covers it, but it's not a default. 

## make it yours

`auto` is my style. you may not want exactly that.

type [`/stack:automate-me`](./skills/automate-me/SKILL.md). it mines your recent transcripts, drafts a `<your-name>-mode` skill from how you've actually worked, and routes through pstack underneath. you keep pstack as the base and end up with your own routing skill alongside `auto`.

models are configurable too. type [`/stack:setup`](./skills/setup/SKILL.md). it asks for a reasoning budget and writes a small model sheet (`~/.claude/pstack-models.md`, or under `$CLAUDE_CONFIG_DIR`) mapping each role (code, judgment, the review panels) to a claude model. pstack's hooks put it in every session and subagent, and every skill falls back to sensible defaults when a line is absent, so you override only what you want.

when a default changes, a sheet written before the change still pins the old default. delete those role lines, or delete the file, then run `/stack:setup` again. a rerun keeps any role whose model differs from the default.

## automations

pstack also ships a dormant [benny automation pack](./automations/benny/). benny triages issue reports (from github issues, slack, or linear), then reproduces and fixes confirmed bugs with real ui evidence. its files are not registered as slash skills.

to set it up, point claude code at [`FOR_AGENTS.md`](./automations/benny/FOR_AGENTS.md). setup copies the pack into the target repository at `.claude/automations/benny/`, enables pstack there through `.claude/settings.json`, writes the github action workflows (or claude code routines, your choice), and keeps user configuration outside the copied pack, in `.claude/benny/`.

## license

MIT
