# benny

benny gives you two claude code automations for issue reports. one triages each report. the other reproduces confirmed bugs and may prepare a small draft fix. reports arrive as labeled github issues, slack messages, or linear issues. each automation runs as a github actions workflow on `anthropics/claude-code-action@v1`, or as a claude code routine.

the files in this directory are dormant setup and automation sources. they do not appear as slash skills.

## set it up

1. point claude code at [`FOR_AGENTS.md`](./FOR_AGENTS.md) and name the target repository.
2. let setup merge this whole directory into the target at `.claude/automations/benny/`. it must preserve destination-only files and review conflicts instead of overwriting local edits. setup also copies the read-only worker to `.claude/agents/benny-reader.md`.
3. let setup enable pstack in the target repository's `.claude/settings.json` for shared dependencies:

```json
{
	"extraKnownMarketplaces": {
		"pstack-claude": {
			"source": { "source": "github", "repo": "dhritcu/pstack-claude" }
		}
	},
	"enabledPlugins": {
		"stack@pstack-claude": true
	}
}
```

the workflows install pstack in the runner through the action's `plugin_marketplaces` and `plugins` inputs. a routine's cloud session ignores that file, so a routine installs pstack from its environment's setup script.

4. keep user-owned configuration outside the copied pack, for example in `.claude/benny/`. adapt [`configuration.example.yaml`](./templates/configuration.example.yaml), [`routing.example.md`](./skills/triage-issue-reports/references/routing.example.md), and [`feature-map.example.md`](./skills/reproduce-and-fix-issues/references/feature-map.example.md).
5. commit `.claude/settings.json`, `.claude/agents/benny-reader.md`, `.claude/automations/benny/`, and any secret-free configuration before enabling either automation.
6. review each drafted workflow ([triage](./templates/benny-triage.workflow.yml), [repro](./templates/benny-reproduce.workflow.yml)) or routine. add the auth secret (`ANTHROPIC_API_KEY` or `CLAUDE_CODE_OAUTH_TOKEN`) yourself. then send a harmless test report and verify every post stays in the original thread.
