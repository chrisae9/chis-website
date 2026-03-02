---
title: Color-Coding Tmux Tabs for Claude Code and OpenCode
date: 2026-02-27
summary: A tmux integration that colors window tabs based on AI agent state — green when done, yellow when waiting, purple when active — using Claude Code hooks and OpenCode plugins.
category: AI
tags: [AI, Claude Code, Tmux, Shell]
---

# Color-Coding Tmux Tabs for Claude Code and OpenCode

## The Problem

I usually have 5-6 Claude Code or OpenCode sessions running in separate tmux windows at once — one doing a migration, one writing tests, one researching some API, etc. The problem is that tmux tabs all look the same. The only way to know which sessions need attention (waiting for permission, finished their task, hit an error) is to manually switch to each tab and check. With that many tabs it gets old fast.

The fix: color the tab names based on what the agent is doing. Yellow means it's waiting for input, green means it's done, purple means it's actively working. One glance at the status bar tells me everything.

## The Color Scheme

Each color maps to an agent state:

- **Purple** — actively processing (a new session started, or the agent is working after user input)
- **Yellow** — waiting for user input (permission request or question)
- **Green** — finished, ready for the next prompt
- **Blue** — compacting context (the agent is summarizing its conversation to free up context window)
- **Red** — error or retrying a failed request
- **Default** — cleared back to normal after the user submits a prompt or a tool completes

## The Shared Script

Both Claude Code and OpenCode call the same bash script — `~/.claude/hooks/tmux-status.sh`. It takes a single action argument (`set-active`, `set-waiting`, `set-finished`, `set-compacting`, `set-error`, `clear`) and sets the tmux window format accordingly.

```bash
#!/bin/bash

# Exit silently if not in tmux
if [ -z "$TMUX" ]; then
    exit 0
fi

# Read JSON from stdin (required by hooks)
HOOK_JSON=$(cat)

ACTION="${1:-}"

# Get the window ID for the pane where this hook is running
WINDOW_ID=$(tmux display-message -t "$TMUX_PANE" -p '#{window_id}')

# Define format strings for each state (both focused and unfocused)
# These use tmux format syntax with #[fg=<color>] — actual hex values
# depend on your theme. The pattern is the same for each state:
#   UNFOCUSED: '#[fg=<state-color>] #W #[fg=<dim-color>]#{b:pane_current_path} '
#   FOCUSED:   '#[bg=<bg>,fg=<state-color>] #W #[fg=<dim>]#{b:pane_current_path} ...'

# Yellow - waiting for user input
WAITING_UNFOCUSED='#[fg=#E6C87A] #W #[fg=#C9B988]#{b:pane_current_path} '
WAITING_FOCUSED='#[bg=#252a35,fg=#E6C87A] #W ...'

# Green - finished responding
FINISHED_UNFOCUSED='#[fg=#88C988] #W #[fg=#6A9A6A]#{b:pane_current_path} '
FINISHED_FOCUSED='#[bg=#252a35,fg=#88C988] #W ...'

# Blue - compacting context
COMPACT_UNFOCUSED='#[fg=#88B9C9] #W #[fg=#6A99A9]#{b:pane_current_path} '
COMPACT_FOCUSED='#[bg=#252a35,fg=#88B9C9] #W ...'

# Purple - actively processing
ACTIVE_UNFOCUSED='#[fg=#B988C9] #W #[fg=#9A6AAA]#{b:pane_current_path} '
ACTIVE_FOCUSED='#[bg=#252a35,fg=#B988C9] #W ...'

# Red - error / retrying
ERROR_UNFOCUSED='#[fg=#E06C75] #W #[fg=#C95A5A]#{b:pane_current_path} '
ERROR_FOCUSED='#[bg=#252a35,fg=#E06C75] #W ...'

case "$ACTION" in
    set-active)
        tmux set-window-option -t "$WINDOW_ID" window-status-format "$ACTIVE_UNFOCUSED"
        tmux set-window-option -t "$WINDOW_ID" window-status-current-format "$ACTIVE_FOCUSED"
        ;;
    set-waiting)
        tmux set-window-option -t "$WINDOW_ID" window-status-format "$WAITING_UNFOCUSED"
        tmux set-window-option -t "$WINDOW_ID" window-status-current-format "$WAITING_FOCUSED"
        ;;
    set-finished)
        tmux set-window-option -t "$WINDOW_ID" window-status-format "$FINISHED_UNFOCUSED"
        tmux set-window-option -t "$WINDOW_ID" window-status-current-format "$FINISHED_FOCUSED"
        ;;
    set-compacting)
        tmux set-window-option -t "$WINDOW_ID" window-status-format "$COMPACT_UNFOCUSED"
        tmux set-window-option -t "$WINDOW_ID" window-status-current-format "$COMPACT_FOCUSED"
        ;;
    set-error)
        tmux set-window-option -t "$WINDOW_ID" window-status-format "$ERROR_UNFOCUSED"
        tmux set-window-option -t "$WINDOW_ID" window-status-current-format "$ERROR_FOCUSED"
        ;;
    clear)
        # Unset per-window overrides to fall back to global config
        tmux set-window-option -t "$WINDOW_ID" -u window-status-format
        tmux set-window-option -t "$WINDOW_ID" -u window-status-current-format
        ;;
esac

exit 0
```

The focused format strings above are truncated — the actual ones include zoom indicators and path info matching my tmux theme. The pattern is what matters: each state sets a foreground color, and `clear` uses `-u` to unset the per-window overrides so the tab falls back to whatever your global tmux config defines.

A few details worth calling out:

- The script reads stdin with `cat` because hooks pipe JSON to the process, and if you don't consume it the pipe can break.
- Both `window-status-format` (unfocused tabs) and `window-status-current-format` (the active tab) get set so the color persists regardless of which window you're viewing.
- `[ -z "$TMUX" ] && exit 0` at the top means the script is a no-op when running outside tmux — no errors if you use Claude Code in a regular terminal.

## Window Identification

This is the most important detail in the script:

```bash
WINDOW_ID=$(tmux display-message -t "$TMUX_PANE" -p '#{window_id}')
```

`$TMUX_PANE` is an environment variable that tmux sets automatically to the pane ID where the process was started. When a hook fires, it runs in the context of the Claude Code / OpenCode process, which means `$TMUX_PANE` points to the pane where that specific session is running — not whatever window you happen to be looking at.

This matters because if you're looking at tab 1 while tab 3's Claude Code session finishes, the script needs to color tab 3, not tab 1. Using `$TMUX_PANE` to resolve the window ID gets this right every time.

## Claude Code: The Hooks Approach

Claude Code has a [hooks system](https://code.claude.com/docs/en/hooks) that lets you run shell commands in response to lifecycle events. The configuration lives in `settings.json`. Each hook is a shell command that receives event JSON on stdin — for this use case I only care about which event fired, not the payload:

```json
{
  "hooks": {
    "SessionStart":      [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh set-active" }] }],
    "Stop":              [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh set-finished" }] }],
    "PermissionRequest": [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh set-waiting" }] }],
    "PreCompact":        [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh set-compacting" }] }],
    "PostToolUse":       [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh clear" }] }],
    "PostToolUseFailure":[{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh clear" }] }],
    "UserPromptSubmit":  [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh clear" }] }],
    "SessionEnd":        [{ "hooks": [{ "type": "command", "command": "bash ~/.claude/hooks/tmux-status.sh clear" }] }]
  }
}
```

### The Limitation

There's a gap in the available hook events: **there's no `PermissionResponse` hook**. When Claude Code asks for permission and the tab turns yellow, the yellow stays until `PostToolUse` fires *after the tool finishes executing*. For fast tools like `Read` or `Glob` this is barely noticeable. But for a slow bash command — say, `npm install` or a long-running build — the tab stays yellow for the entire execution time even though the user already approved it.

I opened [#21959](https://github.com/anthropics/claude-code/issues/21959) requesting a `PermissionResponse` or `PostPermissionApproval` hook. Until that exists, the yellow state is slightly misleading for slow tool calls.

## OpenCode: The Plugin Approach

[OpenCode](https://github.com/opencode-ai/opencode) has a [plugin system](https://opencode.ai/docs/plugins/) that fixes this exact gap. The plugin is a TypeScript file registered in `opencode.json`:

```json
{
  "plugin": ["./plugins/tmux-status"]
}
```

The plugin itself calls the same shared bash script:

```typescript
import type { Plugin } from "@opencode-ai/plugin"

export const TmuxStatus: Plugin = async ({ $ }) => {
  const tmux = (action: string) =>
    $`echo '{}' | bash ~/.claude/hooks/tmux-status.sh ${action}`
      .quiet()
      .nothrow()

  return {
    event: async ({ event }) => {
      switch (event.type) {
        case "session.created":
          await tmux("set-active")
          break
        case "session.idle":
          await tmux("set-finished")
          break
        case "session.deleted":
          await tmux("clear")
          break
        case "permission.asked":
          await tmux("set-waiting")
          break
        case "permission.replied":
          await tmux("clear")
          break
        case "session.compacted":
          await tmux("set-active")
          break
        case "session.error":
          await tmux("set-error")
          break
        case "session.status":
          if (event.properties.status.type === "retry")
            await tmux("set-error")
          break
      }
    },

    "permission.ask": async () => {
      await tmux("set-waiting")
    },

    "chat.message": async () => {
      await tmux("clear")
    },

    "experimental.session.compacting": async () => {
      await tmux("set-compacting")
    },
  }
}
```

The plugin uses two types of hooks:

- **Event hooks** (the `event` handler) — react to lifecycle events like `session.created`, `session.idle`, `permission.asked`, etc. These are fire-and-forget notifications.
- **Middleware hooks** (`permission.ask`, `chat.message`, `experimental.session.compacting`) — these intercept specific actions and can modify behavior. Here I'm just using them to set colors at the right time, but middleware hooks can also transform or block the action.

### The Key Advantage

The `permission.replied` event fires the instant the user approves or denies a permission request. This means the yellow status clears immediately when you press `y`, not after the tool finishes running. That's the exact gap Claude Code is missing.

Here's the full event mapping between the two tools:

| State | Claude Code Hook | OpenCode Event | Action |
|-------|-----------------|----------------|--------|
| Active | `SessionStart` | `session.created` | `set-active` |
| Waiting | `PermissionRequest` | `permission.asked` | `set-waiting` |
| Approved | *(missing)* | `permission.replied` | `clear` |
| Finished | `Stop` | `session.idle` | `set-finished` |
| Compacting | `PreCompact` | `experimental.session.compacting` | `set-compacting` |
| Error | — | `session.error` / `session.status` (retry) | `set-error` |
| Clear | `PostToolUse` / `UserPromptSubmit` | `chat.message` | `clear` |

The `session.status` event with `status.type === "retry"` catches rate limits and transient API failures — the tab turns red so you know the session is stuck retrying rather than actively working.

## Closing

This is a small thing but it changed how I work with multiple sessions. Instead of cycling through tabs to check on progress, I just glance at the status bar. Green tabs are done and need a new prompt. Yellow tabs need a permission decision. Purple tabs are still working. Everything else can wait.

The shared script approach means adding support for another tool is just a matter of wiring up its lifecycle events to the same action arguments. The tmux side doesn't need to know or care what tool is running — it just sets colors.
