---
title: Using Other AI Models as Claude Code Reviewers
date: 2026-02-08
summary: Claude Code skills that shell out to Gemini CLI, Codex CLI, and OpenCode to get second opinions on code — all in read-only mode, writing to /tmp, without leaving your session.
category: AI
tags: [AI, Claude Code, Code Review]
---

# Using Other AI Models as Claude Code Reviewers

I have three Claude Code skills that shell out to other AI CLIs: [Gemini CLI](https://github.com/google-gemini/gemini-cli) (`gemini`), [Codex CLI](https://github.com/openai/codex) (`codex exec`), and [OpenCode](https://github.com/opencode-ai/opencode) (`opencode run`). Typing `/gemini review X` or `/codex review Y` inside Claude Code sends a prompt to that model, captures the output, and brings it back into my session for Claude to read.

The skills themselves are trivial — a SKILL.md file with a bash command template. Anyone can write one in a few minutes. What matters is the three patterns that make them actually useful.

## The Three Patterns

### Write to `/tmp`, Then Read

All three skills redirect output to a file in `/tmp` and then use the Read tool to pull it back into context:

```bash
# Gemini
gemini -y -m gemini-3.1-pro-preview -p "..." > /tmp/gemini-output.md 2>&1

# Codex
codex exec -o /tmp/codex-output.md --sandbox read-only "..."

# OpenCode
opencode run --agent plan "..." > /tmp/opencode-output.md 2>&1
```

Why: Claude Code's Bash tool truncates long output, and these tools are verbose. A code review from Gemini can easily be thousands of lines. Writing to a file and reading it with the Read tool avoids losing the tail end of the response.

Codex is a special case — it has a native `-o` flag for output files because piping stdout causes stdin errors. The other two use standard shell redirection.

### Default to Read-Only

Each tool has a sandbox or safety mode, and the skills default to it:

- **Codex**: `--sandbox read-only` — can read your project files but can't write anything
- **OpenCode**: `--agent plan` — the edit tool is disabled at the agent level, not just a prompt hint
- **Gemini**: inherently read-only — has no file-writing capabilities

These are less-trusted models running inside your project directory. You want them reading code and giving opinions, not making changes. The skills have write modes available (`--sandbox workspace-write` for Codex, `--agent build` for OpenCode) but you have to explicitly ask for them.

### Use It for Code Review

The main use case is getting a second opinion. You're working on something in Claude Code, you want another model to look at it, and you don't want to context-switch to a different terminal or paste code into a web UI. `/gemini review the error handling in cmd/server/main.go` runs the review and brings the output back into your Claude session, where Claude can summarize it, act on it, or compare it against its own analysis.

## How I Actually Use Them

### Parallel Code Review

I was reviewing a Go coding challenge submission — an HTTP service for financial transaction ingestion. I wanted multiple perspectives, so I ran both skills in the same session:

```
/gemini Review the code submission at /tmp/synctera_coding_challenge for a backend
coding challenge. This is a Go HTTP service. Review all source files and tests.
Focus on: bugs, Go idioms, test coverage gaps, and anything that would raise red
flags in a job interview.
```

```
/codex Review the code submission at /tmp/synctera_coding_challenge for a backend
coding challenge. This is a Go HTTP service. Review all source files and tests.
Focus on: bugs, Go idioms, test coverage gaps, and anything that would raise red
flags in a job interview.
```

Behind the scenes, Gemini ran `gemini -y -m gemini-3.1-pro-preview -p "..." > /tmp/gemini-output.md` while Codex ran `codex exec -o /tmp/codex-output.md --sandbox read-only "..."`. Claude read both outputs and compared findings. The models flagged different things — one caught a concurrency issue the other missed, one was more opinionated about idiomatic Go patterns. Having both reviews in the same context made it easy to see where they agreed and where they diverged.

### Debugging with a Fresh Perspective

My [tmux status hook](/posts/tmux-status) had inverted colors — showing green when the agent was busy and default when it was waiting for input. I'd been staring at the script and couldn't see the bug.

```
/codex Review the tmux-status.sh hook script at ~/.dotfiles/claude/hooks/tmux-status.sh -
it's supposed to turn the tmux window green when Claude is waiting for user input and
default when Claude is busy working, but it's showing green when it should be busy and
vice versa. Analyze the hook events and logic to find the bug.
```

Codex ran in `--sandbox read-only` mode, read the script, and found the logic inversion. Sometimes the value isn't a smarter model — it's a different model looking at the same code without the assumptions you've built up from debugging it for an hour.

### Dotfiles Infrastructure Review

OpenCode defaults to a local Qwen 3.5 model running on my homelab server — an RTX 3090 serving models through [llama.cpp](https://github.com/ggml-org/llama.cpp) behind a [LiteLLM](https://github.com/BerriAI/litellm) proxy. Same server that runs the Qwen3-Embedding-0.6B model powering my [session search skill](/posts/session-search). No API cost, no tokens leaving my network. I used it to review my entire dotfiles repo:

```
/opencode Review this dotfiles repository and suggest improvements. Look at the update
script, install.conf.yaml, zshrc, and overall structure. Focus on potential bugs,
performance issues for shell startup, and maintainability suggestions.
```

This ran `opencode run --agent plan "..." > /tmp/opencode-output.md 2>&1` with the plan agent (read-only, edit tool disabled). For a broad "review everything" pass where you don't need the best model — just a thorough pair of eyes — running it locally for free is a good trade-off.

## Closing

These skills take five minutes to set up. The value is having another model's perspective without leaving Claude Code, and the read-only constraint means you never have to worry about what the review model might do to your project. Write to `/tmp`, default to read-only, read the output back in — that's the whole pattern.
