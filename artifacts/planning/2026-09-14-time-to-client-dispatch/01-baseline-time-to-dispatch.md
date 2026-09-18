# Baseline: time to client-workflow dispatch

Measured on 2026-09-14 for meta session `RZAR6A` dispatching work-package child `FQ3YWN`. Do not invent other figures; this file is the reference for later method comparison.

## Clock

| Event | Timestamp (UTC) |
| --- | --- |
| First user prompt | ~2026-09-14T07:34:00Z |
| Meta session `RZAR6A` started | 2026-09-14T07:35:05.090Z |
| Client work-package session `FQ3YWN` created | 2026-09-14T07:39:45.942Z |

## Cost at dispatch

At `dispatch-client-workflow` / `get_workflow(FQ3YWN)`:

- Meta `elapsed_ms`: **407823 ms**
- ~6.8 min from session start
- ~7.8 min from first prompt

## Path that paid that cost

`discover` → `GetDynamicTools` → `start_session` (folder collision with `HG7UCM`, then a distinct folder) → `get_workflow` (104KB bundle) → resource loads → `next_activity` `discover-session` → spawn worker → `list_workflows` + keyword match → `initialize-session` `dispatch_child` → `resolve-target` → `dispatch-client-workflow` → `get_workflow` child → `next_activity` `start-work-package`

## Binding

- Target repo: `m2ux/workflow-server`
- Host checkout: `/home/mike1/projects/dev/workflow-server`
- Planning folder: `/home/mike1/projects/dev/workflow-server/.engineering/artifacts/planning/2026-09-14-time-to-client-dispatch`
- Work-package child session: `FQ3YWN`
- Meta parent: `RZAR6A`
