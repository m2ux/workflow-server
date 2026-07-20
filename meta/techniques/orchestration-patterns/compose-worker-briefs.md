---
metadata:
  version: 1.0.0
---

## Capability

Compose an ordered `{worker_briefs}` array from `{work_units}` — the same brief rules as [compose-worker-brief](./compose-worker-brief.md), applied per unit in input order.

## Inputs

### work_units

Ordered array of `{ id, brief, tools_hint? }`.

### output_contract

*(optional)* Shared structured-output or artifact requirements for every worker.

### isolation_mode

`context` (default) or `worktree`.

### planning_folder_path

*(optional)* Absolute planning folder when outputs must persist as files.

### session_index

*(optional)* Included in every brief when workers inherit a session.

## Outputs

### worker_briefs

Ordered `{ id, description, prompt }` array aligned with `{work_units}`.

## Protocol

1. For each unit in `{work_units}` order, compose one brief using the same content rules as [compose-worker-brief](./compose-worker-brief.md) (citation only — do not invoke that op).
2. Emit `{worker_briefs}` in the same order. Do not dispatch.
