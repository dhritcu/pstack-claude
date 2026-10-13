---
name: reflect
description: Spawn three parallel review subagents over the active transcript, surface learnings, and route each to a concrete edit on an existing skill. Use when the user says reflect.
disable-model-invocation: true
---

# Reflect

Mine the current conversation for durable learnings, then route them into skill edits.

Invoke when the user says "reflect" or "/pstack:reflect". Skip when the conversation is trivial, off-topic, or already covered by an existing skill the parent followed correctly. One-offs are not learnings.

## 1. Locate the active transcript

Before fanning out, find this conversation's transcript in this workspace's transcripts directory, `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/`, where `<encoded-cwd>` is the absolute working directory with every non-alphanumeric character replaced by `-`. Do not glob across `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/*/`. That crosses workspace boundaries and reads private chats from unrelated projects.

Run the finder bundled with this skill, resolving `scripts/` against this skill's base directory:

```bash
node <this skill's dir>/scripts/find-transcript.mjs "<fragment of the conversation's opening user prompt>"
```

It searches only the current working directory's transcripts (add `--cwd <dir>` when the session started in another directory) and prints the path of the transcript whose opening user prompt contains the fragment. Do not reimplement the scan by hand: a transcript opens with metadata records rather than the prompt, and files run to several megabytes. If it exits 1, write a digest of the session and pass that instead. The digest records what happened, in turn order: the user's prompts and corrections, the tool calls and their results, the files touched. It states no diagnosis, verdict, or cause. The digest replaces the transcript, so no reviewer can check your conclusions against the source; they judge the session, not your reading of it.

## 2. Spawn three reviewers in parallel

One message, three `Agent` calls, `subagent_type: "pstack:readonly"`. Reviewers need MCP access to look up the tickets, chat threads, and observability traces the transcript references; `pstack:readonly` keeps MCP and drops only the file-editing tools.

Each reviewer and the synthesizer name a role line in the pstack model sheet (`${CLAUDE_CONFIG_DIR:-~/.claude}/pstack-models.md`) and a default. Set `model` to that line's value, or to the default if the sheet or the line is missing, and `effort` to the sheet's budget effort (default `xhigh`). Omit `model` when the value is `inherit`. If the `Agent` tool rejects a model, use the default and say so.

| Lens | Role line | Default `model` | Prompt template |
|---|---|---|---|
| Judgment | `reflect judgment, divergent, synthesizer` | `opus` | `references/judgment-reviewer.md` |
| Tooling | `reflect tooling` | `sonnet` | `references/tooling-reviewer.md` |
| Divergent | `reflect judgment, divergent, synthesizer` | `opus` | `references/divergent-reviewer.md` |

Pass each template verbatim, substituting the transcript path or digest where marked. Add nothing beside a transcript path, not even a focus note for a long transcript: a list of where to look steers the reviewers away from what you didn't point at. Reviewers return findings in the `Agent` response body.

## 3. Synthesize

One `Agent` call, `subagent_type: "pstack:readonly"`, `model` from the `reflect judgment, divergent, synthesizer` line (default `opus`), `effort` from the budget. It spot-verifies citations through MCP, which `pstack:readonly` keeps. Pass `references/synthesizer.md` verbatim, with each reviewer's full output inlined where marked. It returns an Accepted / Rejected / Backlog list.

## 4. Structural enforcement check

Move any Accepted item that a lint rule, script, metadata flag, or runtime check would enforce more reliably to Backlog. See the **encode-lessons-in-structure** principle skill.

## 5. Apply

Present the synthesizer's full Accepted / Rejected / Backlog output and wait for explicit approval before applying any Accepted edit. The user picks the subset and may redirect routings. Skill changes affect every future agent in the org. Do not auto-apply.

File each Backlog item to your team's devex or backlog tracker without waiting. Only the Accepted list waits for approval.

Follow each approved row's Routing exactly:

- Trivial existing-skill edit (a one-line bullet, a tightened sentence, a stale fact corrected): the parent does it directly.
- Substantive existing-skill edit (a new section, a new pattern table, more than ~10 lines): follow poteto-mode's **Authoring or modifying a skill** playbook (`../poteto-mode/playbooks/authoring-a-skill.md`) and run its write / validate / test loop.
- `tune description: <skill path>` (the skill exists but didn't trigger when it should have): rewrite the `description` per Claude Code's skill format (https://code.claude.com/docs/en/skills) so it names the trigger that was missed, then validate it with the same playbook. If the session has a skill-authoring skill with a description-optimization loop, run that loop.
- `new skill via authoring-a-skill: <kebab-name>`: hand creation to the **Authoring or modifying a skill** playbook. Do not invent the shape ad hoc.

If your environment ships a SKILL.md validator, run it on every touched skill before declaring done.

## 6. Summarize for the user

Short list, no preamble:

- Edits applied: `<skill path>`. What changed, one line each.
- New skills created: `<skill path>`. One line each (rare).
- Backlog filed to the devex tracker: `<issue title>` (`<tags>`). One line each.
- Dropped: one line per rejected finding + reason from the synthesizer.
