---
metadata:
  version: 1.0.0
---

## Capability

Compose an ordered worker-briefs array from work units — one brief per unit under the same brief rules as the single-unit compose op.

## Inputs

### work_units

Ordered array of `{ id, brief, tools_hint? }`.

### output_contract

*(optional)* Shared structured-output or artifact requirements for every worker.

### planning_folder_path

*(optional)* Absolute planning folder when outputs must persist as files.

### session_index

*(optional)* Included in every brief when workers inherit a session.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array aligned with `{work_units}`.

## Protocol

1. For each unit in `{work_units}` order, set `id` and `description` from `{work_units}[n].id` — the description may be a short label derived from the id.
2. Build each `prompt` from that unit's `brief`; its `tools_hint` when present; `{output_contract}` when present; the isolation rules for `{isolation_mode}`, which under `worktree` instruct the worker to create or use an isolated workspace before mutating files and to return paths relative to it; `{session_index}` when present; and an explicit instruction not to assume sibling worker context.
3. Emit `{worker_briefs}` in `{work_units}` order. Do not dispatch.
