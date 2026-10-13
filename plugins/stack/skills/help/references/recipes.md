# Prompts worth copying

Swap in the real paths, skills, and done checks. Informal wording works.

## Understand

- `/stack:auto read <thread>. restate the underlying issue in your own words, in plain english.`
- `/stack:auto investigate why <symptom>. give me what we know, what data you used, and your best hypotheses. don't change any code yet.`
- `use /stack:how to understand <subsystem>. then use /stack:why to find out why it broke recently.`
- `/stack:recall my work on <topic> from last week, then read <issue>.`
- `/stack:teach me why you implemented it this way and not <other way>. what did you trade off?`
- `/stack:auto take over this branch. read the decision log, find what's done, and continue. don't redo finished work.`

## Build

- Bug: `/stack:auto <symptom>. repro first, then fix and verify.`
- Bug in an app: `/stack:auto repro this with /verify-<app>. if it repros on main, fix it and show me a video as proof.`
- Bug with a cheap test: `/stack:auto repro <bug> first. if there's a cheap test path, /stack:tdd it. then fix and rerun.`
- Feature: `/stack:auto add <behavior>. <current output> stays byte-identical. verify both.`
- Refactor: `/stack:auto move <code> into one module, zero behavior change. record the current output first and prove it's unchanged after.`
- Perf: `/stack:auto <operation> takes <time> on <fixture>. trace it, fix the measured cause, show me before and after.`

## Design and plan

- `/stack:auto prototype a few options for <feature>. take screenshots or videos for me to compare.`
- `/stack:auto we need <feature>. /stack:architect it first, and answer open questions with prototypes. let me review before proceeding.`
- `/stack:auto write a tutorial for how i would use <new package> first. then /stack:teach me why it beats the current one.`
- `ask /stack:arena for a second opinion on this thread and our approach.`
- `/stack:auto turn this design into a plan. small verifiable PRs, each with its own verification steps.`
- `/stack:auto plan the migration of <library> to <target>. small verifiable PRs. the result must match the original exactly, bugs included.`

## Review and ship

- `/stack:interrogate the whole branch, but skeptically. don't change anything yet. no nitpicks unless it's a real bug or regression.` Read the dismissals too.
- `/stack:swarm check every package under <dir> against its check script. one worker per package. one report.`
- `/stack:auto open the pr. small ordered commits, evidence in the description.`
- `/stack:auto babysit this pr. get it green.` For status only: `/stack:auto check on pr <number>. anything outstanding?`
- `/stack:auto land the stack.`

## Away and back

- `/stack:auto im going to bed. <goal> in a fresh worktree off <base>. done means <checks>. keep a decision log. don't ask me before committing. /loop until done. if you're truly stuck after a few hours, stop and write up why.`
- `/stack:show-me-your-work catch me up on what you did last night.` Read its Attention section first.
- `/stack:auto full autopilot on this queue. each item is independent.`
- `/stack:auto autopilot these changes but stack them, don't ship. i'll land the stack.`
- `/stack:reflect capture what we learned so the next run doesn't repeat it.` Approve only edits that change a future decision.
- `/stack:bro` restates the last reply in plain words.
