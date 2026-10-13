# Set up pstack

In this page you install the plugin, pick which models pstack uses, and run your first task. Setup is one command plus a short conversation.

## Install the plugin

In a Claude Code session, add the marketplace, then install the plugin:

```text
/plugin marketplace add dhritcu/pstack-claude
/plugin install stack@pstack-claude
```

Claude Code confirms the plugin is installed. Run `/reload-plugins`, or start a new session, to load it. pstack's skills appear in the `/` menu as `/stack:<name>`. The bare name, such as `/stack:auto`, works too unless another command already uses it, and this guide writes skills that way.

## Pick your models

Run:

```text
/stack:setup
```

[`/stack:setup`](../../skills/setup/SKILL.md) asks for a reasoning budget, shows you each role (code delegates, judgment, the review panels), and asks what you want. Answer the questions. It also asks which of pstack's three hooks to keep on. It writes `~/.claude/pstack-models.md` (under `$CLAUDE_CONFIG_DIR` when you set one), a small model sheet that pstack's hooks hand to the session and to pstack's subagents.

The defaults run at `xhigh` effort, the same as the `large` budget. `unlimited` lifts every role to `max`. `medium` and `small` lower the effort to `high` and `medium` and spend fewer tokens. The budget never changes a role's model, only the `effort` each subagent runs at.

You only override what you care about. A role with no line in the sheet keeps the skill's default. To restore a default, delete that role's line. A rerun of `/stack:setup` keeps any role whose model differs from the default. When a default changes, a sheet written before the change still pins the old default, so delete those role lines, or delete the file, then run `/stack:setup` again.

Roles take a Claude model alias: `fable`, `opus`, `sonnet`, or `haiku`. The code roles default to `sonnet`, judgment and prose to `opus`, the hardest tasks to `fable`, and the review panels to `opus, fable`. Claude Code runs Claude models only, so a panel's diversity comes from two different Claude models rather than two vendors. You might be wondering what happens if you want a role on the session's own model. Set it to `inherit` and pstack omits the subagent `model` field, so the subagent inherits your session's model. `inherit` is not a model alias. For a panel role the value is a list, and one subagent runs per entry, so the list length sets the panel size. Setup also configures `swarm workers`, the default model for every `/stack:swarm` worker unless a race names a model for each arm.

## Accept the verification offer, or don't

At the end of setup, `/stack:setup` looks for a way to prove app behavior in your project, either a `verify-*` skill or an existing harness. If it finds neither, it offers once to generate one with [`/stack:create-verification-skill`](../../skills/create-verification-skill/SKILL.md).

Say yes and it writes `.claude/skills/verify-<app>/`, a project-local skill that teaches agents to drive your app the way a user does. It proves the skill works once before handing it over. Say no and setup moves on. You can run `/stack:create-verification-skill` yourself any time. [Verify and ship](./06-verify-and-ship.md#create-a-project-verification-skill) covers it in depth.

If you're new to pstack, say yes. An agent that can check its own work keeps going until the check passes. An agent that can't hands every result back to you to check by hand. Of everything in this guide, the verification skill pays off the most.

After setup, start a new session, or run `/clear`. The model sheet applies to new sessions.

## Keep the cost in check

pstack spends extra tokens on subagents and review panels. That's the price of the rigor. To spend fewer:

- Rerun `/stack:setup` and pick a smaller reasoning budget or cheaper models. A strong model in the main chat with cheaper, faster models in the code roles is a good split.
- Set a role to `inherit` so it runs on the session's own model.
- Shorten a panel list. Each entry runs one subagent.
- Save `/stack:auto` for work that needs rigor. A small, obvious edit doesn't.

## Run your first task

Pick something real but small, and describe it the way you'd describe it to a colleague:

```text
/stack:auto add a --json flag to this command. text output stays byte-identical. verify both.
```

Watch the task list. Its first items are the matched playbook's steps copied in, the Feature playbook for this prompt. If `/stack:auto` skips a step, the step stays in the list with `skip: <reason>`, so you can see what it chose not to do.

From here you can type normal follow-ups. You don't need to keep `/stack:auto` on by hand. pstack's hooks are on by default: at session start they tell the agent when to route a task through `/stack:auto`, and on every prompt they add a one-line reminder to apply it to a new task that matches a playbook or needs rigor. A casual turn, or a turn where you opt out, skips it. To turn either hook off, rerun `/stack:setup`, or set `session hook: off` or `reminder: off` in the model sheet.

Next: [Route work through `/stack:auto`](./02-auto.md).
