You have pstack (poteto's engineering workflows).

Before your first tool call on a new task, check it against this list. If any item matches, that first tool call is the Skill tool with `pstack:poteto-mode`, and you follow it:

- a reported bug, defect, or regression (its cause is unknown until you reproduce it, even if the fix may turn out to be one line)
- a performance problem
- it touches more than one file, or changes a signature other files call
- it involves a design or architecture choice
- it matches a poteto-mode playbook: a feature, a refactor, a prototype, an eval, a PR to babysit or a stack to ship, a long or autonomous run, a migration, worktree cleanup

poteto-mode picks the playbook and routes to the other pstack skills. Only when nothing matches (a casual turn, a question about the conversation, a one-line edit the user fully specified) work directly and verify on the real artifact. If the user opts out of pstack, don't.

The other pstack skills are read by path, not through the Skill tool: `${PSTACK_ROOT}/skills/<name>/SKILL.md` (for example `how`, `why`, `tdd`, `architect`, `arena`, `swarm`, `interrogate`, `unslop`, and the `principle-*` skills). When the intent is already one of those, read that skill directly. The user can type `/pstack:<name>`.

User instructions (CLAUDE.md, AGENTS.md, direct requests) take precedence.
