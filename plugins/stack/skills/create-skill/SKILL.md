---
name: create-skill
description: Author, test, and tune a Claude Code skill (SKILL.md). Use for /stack:create-skill, "write a skill", "turn this into a skill", editing a skill substantially, or when a skill exists but didn't trigger when it should have (description tuning). Covers frontmatter, placement, references and scripts, and a real-session draft / test / iterate loop.
disable-model-invocation: true
---

# Create skill

Write a skill the way Claude Code loads it, then prove it triggers and works in a real session before calling it done. Format reference: <https://code.claude.com/docs/en/skills>.

## 1. Pin the job

Name the one job, the user phrasings that should trigger it, two or three near-miss phrasings that must not, and what a correct run leaves behind (a file, a reply shape, a commit). If an existing skill is a real home for this, edit that skill instead.

## 2. Place it

| Scope | Path |
|---|---|
| One project, shared through git | `.claude/skills/<name>/SKILL.md` |
| You, every project | `${CLAUDE_CONFIG_DIR:-~/.claude}/skills/<name>/SKILL.md` |
| A plugin | `<plugin>/skills/<name>/SKILL.md`, invoked as `/<plugin>:<name>` |

A project skill with the same name as a bundled command replaces it (not its aliases).

## 3. Write the frontmatter

```yaml
---
name: kebab-case-name            # lowercase letters, digits, hyphens; equals the directory name
description: >-
  What it does, then when to use it, in the words a user would type.
disable-model-invocation: true   # optional: only the user (or a path reference) can start it
---
```

- `description` is one YAML scalar. Quote it, or use `>-` with indented continuation lines, when it has colons, quotes, or wraps.
- Claude decides to load a skill from `description` (plus optional `when_to_use`). Their combined text is cut at 1,536 characters in the listing, and every listed description costs context in every session. Lead with the trigger, not the backstory.
- Optional fields when the job needs them: `argument-hint`, `allowed-tools`, `model`, `effort`, `context: fork` with `agent`, `paths` (glob list that scopes when it applies), `user-invocable: false` (hide from the `/` menu). Don't add a field you can't name a reason for.
- In the body, `$ARGUMENTS` is what the user typed after the command, and `${CLAUDE_SKILL_DIR}` is the skill's own directory. Use the latter for any script or reference the skill runs or reads.

## 4. Write the body

- Imperative steps a fresh agent can follow without this conversation. Every step ends in something checkable.
- Keep `SKILL.md` to what every run needs. Move long tables, prompts, and examples to `references/<topic>.md` and link them where the step needs them. Put deterministic work in `scripts/` and call it by `${CLAUDE_SKILL_DIR}/scripts/<file>`: a script is a lever a reviewer can rerun (principle-build-the-lever).
- Apply the **unslop** skill (`../unslop/SKILL.md`) to every line. Agent-facing prose is still prose.
- Name the stop condition and the output shape.

## 5. Test in a real session (draft / test / iterate)

A skill is done when it triggers on the right prompts, stays quiet on the near misses, and a run produces the output from step 1. Test with real `claude` runs, not by rereading the text.

1. For each trigger and near-miss phrasing from step 1, run a fresh headless session in a scratch checkout:
   `claude -p "<phrasing>" --output-format json --max-budget-usd 2` (add `--plugin-dir <plugin>` for a plugin skill under development).
2. Read the session transcript at `${CLAUDE_CONFIG_DIR:-~/.claude}/projects/<encoded-cwd>/<session_id>.jsonl` (`<encoded-cwd>`: the working directory with every non-alphanumeric character replaced by `-`). Count `Skill` tool calls naming the skill, and for `disable-model-invocation` skills, `Read` calls on its `SKILL.md`.
3. For one trigger prompt, check the run's artifact against the expected output.
4. Change one thing, rerun the same prompts, compare. Keep a change only if the counts or the artifact improve. Record each round in a short table (prompt, triggered?, artifact ok?).

## 6. Tune a description that didn't trigger

When a skill exists but didn't load when it should have: collect the prompts that missed and the near misses that must stay quiet, then loop step 5 on the `description` alone. Put the missed phrasing's own words near the front, cut words that also match the near misses, and stop when every trigger fires and no near miss does, or after five rounds with a note on what still misses.

## 7. Ship

Run `claude plugin validate <plugin dir>` for a plugin skill. Commit the skill with its test table in the PR body.
