---
metadata:
  version: 1.0.0
---

## Capability

Append a per-task row to `provenance-log.md`. Creates the file with the canonical header on first call (idempotent init).

## Inputs

### task_id

Current task identifier

### task_description

One-line description of what was generated

### assistant_name

Assistant name (e.g., `claude`, `gpt`, `gemini`) — the selected assistant

#### default

`claude`

### model_id

Model identifier — the selected model

#### default

`claude-opus-4-8`

### prompt_class

One of: `code-generation` | `refactoring` | `test-writing` | `docs` | `mixed`

#### default

`code-generation`

### context_scope

One of: `repo-only` (only repository-local sources used) | `web-retrieval` (external web sources informed the work) | `mixed` (both)

#### default

`repo-only`

## Outputs

### provenance_log

The updated provenance log, with the appended task row

## Protocol

1. If the `{provenance_log}` does not exist, create it with the canonical header: `| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |` followed by the divider `|---|---|---|---|---|---|`.
2. Append one row: `| {task_id} | {assistant_name} | {model_id} | {prompt_class} | {context_scope} | {task_description} |`.
