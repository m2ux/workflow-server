---
metadata:
  version: 1.0.0
---

## Capability

Compose one self-contained worker prompt from a work unit (or lane) plus isolation and output-contract instructions.

## Inputs

### work_unit

Object with at least `id` and `brief`. May include `tools_hint`.

### output_contract

*(optional)* Structured-output or artifact requirements the worker must satisfy (schema summary, filename under `{planning_folder_path}`, return shape).

### isolation_mode

`context` (default) or `worktree`.

### planning_folder_path

*(optional)* Absolute planning folder for persisted outputs when `{output_contract}` requires files.

### session_index

*(optional)* When the worker inherits a workflow session, include this index in the prompt.

## Outputs

### worker_brief

Object `{ id, description, prompt }` ready for dispatch.

### worker_briefs

Singleton array `[{worker_brief}]` for same-name binding into a dispatch step.

## Protocol

1. Set `id` and `description` from `{work_unit.id}` (description may be a short label derived from the id).
2. Build `prompt` containing: the `{work_unit.brief}`; tools guidance from `tools_hint` when present; `{output_contract}` when present; isolation rules for `{isolation_mode}` — when `worktree`, instruct the worker to create/use an isolated workspace before mutating files and to return paths relative to that workspace; `{session_index}` when present; explicit instruction not to assume sibling worker context.
3. Emit `{worker_brief}` and `{worker_briefs}` as a one-element array containing that brief.
