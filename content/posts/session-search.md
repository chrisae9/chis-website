---
title: Building a Semantic Search Engine for Claude Code History
date: 2026-02-22
summary: A Python tool that indexes Claude Code sessions and provides three-level semantic search using local embeddings.
category: AI
tags: [AI, Embeddings, Search, Claude Code, Python]
---

# Building a Semantic Search Engine for Claude Code History

## The Problem

After a few months of using Claude Code daily, I had hundreds of session files sitting in `~/.claude/projects/`. Every session is a JSONL file full of messages, tool calls, file edits, and bash commands. Grep works if I remember the exact command I ran or the exact filename I edited, but it falls apart for anything conceptual — "that time I debugged the Docker networking issue" or "the session where I set up the Traefik reverse proxy."

I also started using [OpenCode](https://github.com/opencode-ai/opencode), which stores its sessions in a SQLite database at a completely different path with a different schema. Now my history was split across two tools with no unified way to search either of them.

So I built a semantic search tool that indexes everything and lets me search by meaning instead of keywords.

## Architecture Overview

The pipeline looks like this:

```
Session Sources
├── Claude Code (~/.claude/projects/*/*.jsonl)
└── OpenCode (~/.local/share/opencode/opencode.db)
        │
        ▼
    Parsing & Turn Extraction
        │
        ▼
    Two-Level Document Building
    ├── Session docs (all user messages concatenated)
    └── Turn docs (individual Q&A exchanges)
        │
        ▼
    Embedding (Qwen3-Embedding-0.6B, 1024-dim)
        │
        ▼
    Index on Disk
    ├── session_embeddings.npy + sessions.json
    ├── turn_embeddings.npy + turns.json
    └── index-state.json (staleness tracking)
```

The whole thing is a single Python file with one dependency: numpy. No vector database, no framework, just numpy arrays and JSON metadata files stored in `~/.claude/session-index/`.

## Three Search Levels

The core feature is a three-level drill-down that matches how I actually think about finding past work.

### Level 1: Session Search

"Which conversation was it?" This searches session-level embeddings — each session is represented by all its user messages concatenated together. Good for finding which project and which session touched a topic.

```bash
$ session-search.py search "Docker networking bridge configuration"

SESSION SEARCH: "Docker networking bridge configuration"
Searched 342 sessions across 28 projects (claude+opencode)
============================================================

[0.724] [claude]  session=a1b2c3d4e5f6  project=homelab  date=2026-01-15  turns=23
  slug: docker-network-debug
  preview: The containers on the backend network can't reach each other...
  files: docker-compose.yaml, nginx.conf, traefik.toml

[0.681] [opencode]  session=f7e8d9c0b1a2  project=infra-setup  date=2026-01-08  turns=12
  preview: I need to set up a bridge network that allows...
  files: docker-compose.yaml, .env

Drill deeper: search "<query>" --depth 2 --session <session_id>
```

### Level 2: Turn Search

"What was the exact exchange?" This searches individual turns — each turn is a user message paired with the assistant's response. You can scope it to a specific session from Level 1, or search globally across all turns.

```bash
$ session-search.py search "Docker networking" --depth 2 --session a1b2c3d4e5f6

TURN SEARCH: "Docker networking"
Scope: session a1b2c3d4e5f6
============================================================

[0.812] [claude]  turn=a1b2c3d4e5f6:7  (8/23)  project=homelab  date=2026-01-15
Q: The containers still can't ping each other. I verified the network exists...

A: The issue is that your containers are on the default bridge network, not your
   custom one. The default bridge doesn't support DNS resolution between containers...
   tools: Bash, Read, Edit

Deep context: show a1b2c3d4:5-9
```

### Level 3: Show

"Give me the full context." This isn't a search — it re-parses the raw session and shows the complete conversation including tool calls, file edits, bash commands, and their outputs.

```bash
$ session-search.py show a1b2c3d4:5-9

============================================================
DEEP CONTEXT: homelab / docker-network-debug
Showing turns 5-9 of 23 total
============================================================

--- Turn 5 (2026-01-15) ---
USER: Can you check what networks Docker currently has?
ASSISTANT: Let me check the current Docker networks.
  [Bash] docker network ls
  -> NETWORK ID     NAME      DRIVER    SCOPE
     a1b2c3d4e5f6   bridge    bridge    local
     f7e8d9c0b1a2   host      host      local
     ...

--- Turn 6 (2026-01-15) ---
USER: None of my containers are on the custom network...
```

The escalation strategy is: Level 1 to find the session, Level 2 to find the exact turn, Level 3 to see everything that happened around it. If semantic search fails at all levels, there's a fallback to grep-based keyword search.

## Embedding Pipeline

The tool uses [Qwen3-Embedding-0.6B](https://huggingface.co/Qwen/Qwen3-Embedding-0.6B) — a 600M parameter embedding model that produces 1024-dimensional vectors with a 32K token context window. It runs on an RTX 4060 via llama.cpp's embedding server, routed through a [LiteLLM](https://github.com/BerriAI/litellm) proxy on my homelab — the same infrastructure that serves local models for my [AI code review skills](/ai-code-review).

### Endpoint Detection

The tool probes for an available embedding server at startup:

```python
def get_embeddings_url(local=False):
    if url := os.environ.get("EMBEDDINGS_URL"):
        return url.rstrip("/")
    if local:
        candidates = ["http://localhost:11435"]
    else:
        candidates = ["http://100.64.0.4:4000", "http://localhost:11435"]
    for candidate in candidates:
        try:
            health_path = "/health/liveliness" if ":4000" in candidate else "/health"
            req = urllib.request.Request(f"{candidate}{health_path}", method="GET")
            urllib.request.urlopen(req, timeout=2)
            return candidate
        except (urllib.error.URLError, OSError):
            continue
    sys.exit(1)
```

It tries the remote LiteLLM proxy first (faster, already running), then falls back to a local llama-server instance. The health check endpoints differ between the two — LiteLLM uses `/health/liveliness`, llama.cpp uses `/health`.

### Batching and Normalization

Documents get embedded in batches of up to 50, with adaptive sizing that caps total batch character count at 100K to avoid overloading the model's context window:

```python
while i < total and len(batch) < BATCH_SIZE:
    text = prepared[i]
    if batch and batch_chars + len(text) > 100000:
        break
    batch.append(text)
    batch_chars += len(text)
    i += 1
```

Batches run concurrently via `ThreadPoolExecutor` with 2 workers. If a batch fails with a 400 or 500, it falls back to embedding texts individually, substituting zero vectors for any that still fail. After all embeddings are collected, they get L2-normalized so that cosine similarity becomes a simple dot product:

```python
arr = np.array(all_embeddings, dtype=np.float32)
norms = np.linalg.norm(arr, axis=1, keepdims=True)
norms = np.maximum(norms, 1e-10)
return arr / norms
```

Search then just needs a matrix multiply:

```python
def search_vectors(query_vec, embeddings, top_k=5, mask=None):
    scores = embeddings @ query_vec
    top_idx = np.argpartition(scores, -k)[-k:]
    top_idx = top_idx[np.argsort(scores[top_idx])[::-1]]
    return [(int(indices[i]), float(scores[i])) for i in top_idx]
```

Queries get a special instruction prefix before embedding — this is how Qwen3's asymmetric retrieval works. Documents are embedded as-is, but queries get prepended with an instruction that tells the model what kind of retrieval to do:

```python
QUERY_INSTRUCTION = "Instruct: Given a search query, retrieve relevant conversation excerpts that answer the query\nQuery: "
```

## Incremental Indexing

Rebuilding the entire index every time would be slow, so the tool tracks what's already been indexed and only processes changes.

For Claude Code, it stores the mtime and file size of each JSONL file in `index-state.json`:

```python
stat = jsonl_path.stat()
file_info = {"mtime": stat.st_mtime, "size": stat.st_size}
if not args_full and key in state and state[key] == file_info:
    unchanged_keys.add(key)
else:
    files_to_process.append(jsonl_path)
    state[key] = file_info
```

When merging, the tool keeps the existing embeddings for unchanged sessions and only embeds the new/changed ones, then merges them with `np.vstack`:

```python
def merge_arrays(kept_idx, existing, new):
    if kept_idx and existing is not None:
        kept = existing[kept_idx]
        return np.vstack([kept, new]) if new.size else kept
    return new
```

Before every search, there's an auto-staleness check. If anything has changed since the last index, it runs an incremental re-index automatically:

```python
def auto_reindex(local=False):
    if not index_is_stale():
        return
    print("Index is stale, updating...", file=sys.stderr)
    cmd_index(IndexArgs())
```

This means you never have to think about whether the index is current — it just stays up to date.

## Supporting Both Claude Code and OpenCode

This was the trickiest part. Claude Code stores sessions as JSONL files — one JSON object per line, with each line containing a message and metadata. OpenCode stores sessions in a SQLite database with a completely different schema: separate tables for sessions, messages, and parts (sub-message content blocks).

### Schema Differences

Claude Code messages look like:

```json
{"type": "human", "message": {"role": "user", "content": [{"type": "text", "text": "..."}]}, "timestamp": "2026-01-15T10:30:00Z"}
```

OpenCode has a normalized relational structure: a `session` table with project references, a `message` table with role and timing, and a `part` table where actual content lives (text blocks, tool calls with their state). Tool inputs use camelCase (`filePath`) instead of snake_case (`file_path`), and timestamps are millisecond integers instead of ISO strings.

The tool normalizes these differences during parsing. For example, OpenCode tool names are lowercased single words (`bash`, `read`, `edit`) while Claude Code uses capitalized names (`Bash`, `Read`, `Edit`):

```python
OPENCODE_TOOL_MAP = {
    "bash": "Bash", "read": "Read", "write": "Write", "edit": "Edit",
    "glob": "Glob", "grep": "Grep", "list": "LS", "fetch": "WebFetch",
}
```

And input keys get normalized inline:

```python
if isinstance(inp, dict) and "filePath" in inp:
    inp = dict(inp)
    inp["file_path"] = inp.pop("filePath")
```

### Incremental Indexing Per Source

The incremental indexing strategy differs by source. Claude Code is simple — compare file mtime and size. OpenCode is trickier because all sessions live in one SQLite file. The tool tracks both the database's overall mtime and each session's `time_updated` field:

```python
if args_full or db_mtime != oc_state.get("db_mtime"):
    for sess in all_sessions:
        if (not args_full
                and sess["id"] in oc_session_state
                and sess["time_updated"] == oc_session_state[sess["id"]]):
            unchanged_keys.add(key)
        else:
            sessions_to_process.append(sess)
```

If the DB file hasn't changed at all, skip everything. If it has, check individual sessions by their `time_updated` timestamp to avoid re-parsing sessions that weren't touched.

### Filtering Noise

Both sources produce a lot of noise that would pollute the index. The tool skips:

- Tool-only messages with no real user text (just tool results being passed back)
- Short messages under 30 characters (`MIN_USER_CHARS = 30`)
- JSON blob messages (system metadata that starts with `{` and contains `"type"`)
- Internal Claude Code event types like `file-history-snapshot`, `progress`, `queue-operation`

For mega-sessions that exceed the model's context window, session documents get split at turn boundaries into 80K character chunks. Each chunk gets its own embedding but shares the same session metadata, and results are deduplicated by session ID during search.

## Integration as a Claude Code Skill

The tool is wired into Claude Code as a custom skill. The `SKILL.md` file defines what it is and what tools it's allowed to use:

```markdown
---
name: search
description: Semantic search across Claude Code and OpenCode session history
argument-hint: <search query>
allowed-tools: Bash(python3 *), Bash(~/.dotfiles/*), Read
---
```

Invoking `/search <query>` in Claude Code triggers the skill, which runs the Python script and walks through the escalation levels. The skill instructions tell Claude to start at Level 1 and escalate through Level 2 (global) and Level 3 before giving up, and to fall back to grep-based keyword search as a last resort — semantic search can miss exact terms like proper nouns or product names that grep catches trivially.

## Closing Thoughts

This has become one of my most-used tools. Being able to search hundreds of sessions by meaning — "how did I fix that CORS issue" or "the session where I configured Tailscale" — instead of trying to remember exact filenames or commands is a huge quality-of-life improvement.

The index for ~350 sessions across both tools takes about 45 seconds to build from scratch, runs incrementally in a few seconds for day-to-day use, and the numpy arrays on disk stay under 100MB. No external services required beyond an embedding model you can run locally on basically any hardware.
