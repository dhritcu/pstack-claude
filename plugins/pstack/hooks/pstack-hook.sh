#!/bin/sh
# pstack's stand-in for upstream's custom mode (mode: true + reminder:). One script per hook event:
#   pstack-hook.sh session-start | prompt | subagent-start   (hook input JSON on stdin)
# Prints Claude Code hook JSON that adds context, or nothing. Never fails the hook:
# every path exits 0, so a broken sheet or a missing awk only loses the extra context.
# Toggles live in the model sheet: `session hook: off`, `reminder: off`, `subagent hook: off`.

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
sheet="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/pstack-models.md"
input=$(cat 2>/dev/null)

# `<key>: off` in the sheet turns that hook off (case and spacing tolerant).
off() {
  [ -r "$sheet" ] && grep -Eiq "^[[:space:]]*$1[[:space:]]*:[[:space:]]*off[[:space:]]*$" "$sheet"
}

# Emit {"hookSpecificOutput":{"hookEventName":<event>,"additionalContext":<stdin as JSON string>}}.
emit() {
  awk -v event="$1" '
    { gsub(/\\/, "\\\\"); gsub(/"/, "\\\""); gsub(/\t/, "\\t"); gsub(/\r/, ""); s = s (NR > 1 ? "\\n" : "") $0 }
    END { printf "{\"hookSpecificOutput\":{\"hookEventName\":\"%s\",\"additionalContext\":\"%s\"}}\n", event, s }'
}

sheet_block() {
  if [ -r "$sheet" ]; then
    printf 'pstack model sheet (%s). Its role lines override the skill defaults:\n' "$sheet"
    grep -Ev '^[[:space:]]*(#|$)' "$sheet"
  else
    printf 'No pstack model sheet at %s, so every role uses its skill default. /pstack:setup-pstack writes one.\n' "$sheet"
  fi
}

case "${1:-}" in
  session-start)
    off "session hook" && exit 0
    {
      cat "$root/hooks/session-start-context.md"
      printf '\npstack plugin root: %s\n' "$root"
      sheet_block
    } | sed "s|\${PSTACK_ROOT}|$root|g" | emit SessionStart
    ;;
  prompt)
    off "session hook" && exit 0
    off "reminder" && exit 0
    printf '%s\n' 'pstack: new task? A bug report, perf problem, multi-file change, design choice, or playbook match -> your first tool call is the Skill tool with pstack:poteto-mode. A casual turn, a question about this conversation, or the user opts out -> don'"'"'t.' | emit UserPromptSubmit
    ;;
  subagent-start)
    off "subagent hook" && exit 0
    agent=$(printf '%s' "$input" | sed -n 's/.*"agent_type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
    case "$agent" in
      pstack:*)
        {
          printf 'pstack plugin root: %s. Skills are at %s/skills/<name>/SKILL.md.\n' "$root" "$root"
          sheet_block
        } | emit SubagentStart
        ;;
      general-purpose)
        printf '%s\n' "pstack is installed. When this task writes, reviews, or tests code, apply the matching pstack principle: the index is the Principles section of $root/skills/poteto-mode/SKILL.md, and each principle's full rule is $root/skills/principle-<name>/SKILL.md. Read the leaf before you cite it." | emit SubagentStart
        ;;
    esac
    ;;
esac
exit 0
