---
metadata:
  version: 1.0.0
---

## Capability

Append a per-task row to `provenance-log.md`. Creates the file with the canonical header on first call (idempotent init).

## Inputs

### task_id

Current task identifier

### assistant_name

Assistant name (e.g., `claude`, `gpt`, `gemini`)

### model_id

Model identifier

### prompt_class

One of: `code-generation` | `refactoring` | `test-writing` | `docs` | `mixed`

### context_scope

One of: `repo-only` (only repository-local sources used) | `web-retrieval` (external web sources informed the work) | `mixed` (both)

### task_description

One-line description of what was generated

## Output

### provenance_log

The updated provenance log, with the appended task row

## Protocol

1. If the `{provenance_log}` does not exist, create it with the canonical header: `| Task ID | Assistant | Model | Prompt Class | Context Scope | Description |` followed by the divider `|---|---|---|---|---|---|`.
2. Append one row: `| {task_id} | {assistant_name} | {model_id} | {prompt_class} | {context_scope} | {task_description} |`.
