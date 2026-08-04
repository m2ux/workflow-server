---
metadata:
  version: 1.3.0
---

## Capability

Per-task row in `provenance-log.md` (canonical header on first write).

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

#### artifact

`provenance-log.md`

## Protocol

1. Create the `{provenance_log}` when it does not exist, per [provenance-log](../../resources/provenance-log.md#template).
2. Append one row from `{task_id}`, `{assistant_name}`, `{model_id}`, `{prompt_class}`, `{context_scope}` and `{task_description}`, per the guide's [Rules](../../resources/provenance-log.md#rules).
