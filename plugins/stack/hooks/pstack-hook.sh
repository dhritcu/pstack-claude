#!/bin/sh
# pstack's stand-in for upstream's custom mode (mode: true + reminder:). One script per hook event:
#   pstack-hook.sh session-start | prompt | subagent-start   (hook input JSON on stdin)
# Prints Claude Code hook JSON that adds context, or nothing. Never fails the hook:
# every path exits 0, so a broken sheet or a missing awk only loses the extra context.
# Toggles live in the model sheet: `session hook: off`, `reminder: off`, `subagent hook: off`.

root="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
sheet="${CLAUDE_CONFIG_DIR:-$HOME/.claude}/pstack-models.md"
input=$(cat 2>/dev/null)
# PSTACK_HOOK_DEBUG=<file>: append each event and its input, for diagnosing a hook in a real session.
[ -n "${PSTACK_HOOK_DEBUG:-}" ] && printf '== %s\n%s\n' "${1:-}" "$input" >> "$PSTACK_HOOK_DEBUG"
todo='[pstack] before any other step, open the todolist the `auto` skill requires: the matched playbook'"'"'s steps copied in verbatim, then task-specific todos. Use TaskCreate/TaskUpdate if this session has them; otherwise write an uncommitted .audit/<task-slug>.todo.md checklist and keep it current. A step you skip stays with `skip: <reason>`.'

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
    printf 'No pstack model sheet at %s, so every role uses its skill default. /stack:setup writes one.\n' "$sheet"
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
    if printf '%s' "$input" | grep -Eq '"prompt"[[:space:]]*:[[:space:]]*"[[:space:]]*/stack:auto'; then
      printf '%s\n' "$todo" | emit UserPromptSubmit
      exit 0
    fi
    printf '%s\n' '[pstack] new task? A bug report, perf problem, multi-file change, design choice, or playbook match -> your first tool call is the Skill tool with stack:auto. A casual turn, a question about this conversation, or the user opts out -> don'"'"'t.' | emit UserPromptSubmit
    ;;
  skill-loaded)
    # The todolist is the first thing auto asks for. Upstream's editor always has a todo
    # tool; Claude Code often doesn't, so restate the rule and its fallback right as the skill loads.
    printf '%s' "$input" | grep -Eq '"skill"[[:space:]]*:[[:space:]]*"stack:auto"' || exit 0
    printf '%s\n' "$todo" | emit PostToolUse
    ;;
  agent-effort)
    # Upstream's model slugs carry the effort (`...-xhigh-fast`), so a pstack spawn could not
    # drop it. Claude Code takes effort as a separate Agent parameter; fill it for pstack agents
    # when the caller left it out. Effort comes from the sheet's `budget: <label> (<effort>)`.
    # Only tool_input is inspected: the hook input also carries the session's own effort.
    obj=$(printf '%s' "$input" | awk '
      { buf = buf $0 "\n" }
      END {
        i = index(buf, "\"tool_input\"")
        if (!i) exit
        rest = substr(buf, i)
        j = index(rest, "{")
        if (!j) exit
        depth = 0; instr = 0; esc = 0; obj = ""
        for (k = j; k <= length(rest); k++) {
          c = substr(rest, k, 1); obj = obj c
          if (instr) { if (esc) esc = 0; else if (c == "\\") esc = 1; else if (c == "\"") instr = 0; continue }
          if (c == "\"") instr = 1
          else if (c == "{") depth++
          else if (c == "}") { depth--; if (depth == 0) break }
        }
        if (depth == 0) printf "%s", obj
      }')
    [ -n "$obj" ] || exit 0
    printf '%s' "$obj" | grep -Eq '"subagent_type"[[:space:]]*:[[:space:]]*"stack:' || exit 0
    printf '%s' "$obj" | grep -Eq '"effort"[[:space:]]*:' && exit 0
    effort=xhigh
    if [ -r "$sheet" ]; then
      e=$(sed -n 's/^[[:space:]]*budget[[:space:]]*:.*(\([a-z]*\)).*/\1/p' "$sheet" | head -n 1)
      case "$e" in low|medium|high|xhigh|max) effort=$e ;; esac
    fi
    inner=${obj#\{}
    case "$inner" in *[!\ \	]*) sep=, ;; *) sep= ;; esac
    printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","updatedInput":{"effort":"%s"%s%s}}\n' "$effort" "$sep" "$inner"
    ;;
  subagent-start)
    off "subagent hook" && exit 0
    agent=$(printf '%s' "$input" | sed -n 's/.*"agent_type"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
    case "$agent" in
      stack:*)
        {
          printf 'pstack plugin root: %s. Skills are at %s/skills/<name>/SKILL.md.\n' "$root" "$root"
          sheet_block
        } | emit SubagentStart
        ;;
      general-purpose)
        printf '%s\n' "pstack is installed. When this task writes, reviews, or tests code, apply the matching pstack principle: the index is the Principles section of $root/skills/auto/SKILL.md, and each principle's full rule is $root/skills/principle-<name>/SKILL.md. Read the leaf before you cite it." | emit SubagentStart
        ;;
    esac
    ;;
esac
exit 0
