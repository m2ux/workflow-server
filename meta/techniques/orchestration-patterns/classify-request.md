---
metadata:
  version: 1.0.0
---

## Capability

Classify `{goal}` against a fixed `{lane_roster}` and select exactly one `{lane_id}` — the routing half of supervisor.

## Inputs

### goal

Request to classify.

### lane_roster

Array of lanes. Each entry has `id`, `description`, and optional `tools_hint` / `prompt_suffix` describing the specialist.

## Outputs

### lane_id

The selected lane's `id` from `{lane_roster}`.

### classification_rationale

Short rationale for the chosen lane (for synthesis / escalation context).

### work_unit

Single `{ id, brief, tools_hint? }` for the selected lane: `id` = `{lane_id}`; `brief` = lane instructions plus `{goal}`; `tools_hint` from the lane when present. When `{lane_id}` is `escalate`, `brief` states the escalation case.

## Protocol

1. Match `{goal}` to the best lane in `{lane_roster}` by declared scope.
2. Set `{lane_id}` to that lane's `id` and record `{classification_rationale}`.
3. If no lane fits, set `{lane_id}` to the roster entry marked default when present; otherwise set `{lane_id}` to `escalate` and state why in `{classification_rationale}`.
4. Emit `{work_unit}` for the selected (or escalate) lane so [compose-worker-brief](./compose-worker-brief.md) can bind it by name.
