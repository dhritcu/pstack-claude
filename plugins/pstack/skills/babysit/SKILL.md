---
name: babysit
description: Watch an open PR and drive it to merge-ready. Resolve review threads, fix failing CI on the PR's own branch, and report conflicts. Use for /babysit, "babysit this PR", "get PR <n> green", "keep an eye on my PR", "check on PR <n>". Stops at merge-ready; landing is the Shipping playbook.
disable-model-invocation: true
---

# Babysit

The standalone entry point for babysitting PRs (upstream's editor ships this as a built-in `/babysit`). It runs poteto-mode's **Babysit** playbook, which owns the rules. Inside a `/pstack:poteto-mode` run, that playbook supersedes this skill for PR-status requests, so a run never needs both.

1. Read `${CLAUDE_SKILL_DIR}/../poteto-mode/playbooks/babysit.md` in full and follow it. Its step 1 maps the request to a mode (`drive`, `background`, `threads-only`, `check`) and resolves the forge. Declare both before any poll.
2. Resolve the PR from `$ARGUMENTS` (a number or URL), else the current branch's open PR (`gh pr view --json number,url`). If none, ask for one.
3. The playbook's watcher is `${CLAUDE_SKILL_DIR}/../poteto-mode/scripts/watch-pr/watch-pr`. Run it with `bun`, from any directory:
   `bun ${CLAUDE_SKILL_DIR}/../poteto-mode/scripts/watch-pr/watch-pr --owner <owner> --repo <repo> --pr <n> --pretty` (add `--status-only` for `check`). A PR with no CI configured reports `no checks` and still finishes.
4. For `drive` in your own session, pace the loop with `/loop` in self-paced mode, per the playbook. As a subagent, run the watcher with Bash `run_in_background: true` and act each time it exits.
5. Triage review-bot comments (Bugbot and others) per `${CLAUDE_SKILL_DIR}/../poteto-mode/references/bugbot-triage.md`.
6. Reply per poteto-mode's **Writing the reply**: the PR link as `https://github.com/<owner>/<repo>/pull/<number>`, the verdict, what you fixed, and what needs the human.
