---
metadata:
  version: 6.4.0
---

## Capability

Operations and rules for executing a workflow's structured flow — session lifecycle (list/match/scan/create/start), activity dispatch ([dispatch-activity](./dispatch-activity.md)), transition evaluation, post-activity commit, and the checkpoint protocol (yield/present/respond/resume).

## Rules

### session-index-passes-on-each-call

EVERY authenticated tool call (anything other than `discover`, `list_workflows`, `start_session`, `health_check`) requires a `session_index` parameter — the 6-character base32 string returned by `start_session`. The index is stable across all calls within a session; there is no rotation discipline.

### validation-warnings

Check `_meta.validation` in each response. Warnings are advisory but should be addressed.

### dispatch-topology

Client walks use per-activity disposable workers via [dispatch-activity](./dispatch-activity.md). Do not set `context_mode: "persistent"` on worker-dispatched sessions — see [dispatch-activity](./dispatch-activity.md)::workers-need-full-delivery.

### resource-loading-via-tool

Resource refs returned in operation bodies (e.g., [activity-worker-prompt](../../resources/activity-worker-prompt.md)) are lightweight pointers. When `get_activity` includes a sibling `resources` map, reuse those bodies (or unchanged markers). Otherwise load via `get_resource { session_index, resource_id }`.

### variable-mutation-source

Variables mutate from two sources only: checkpoint option effects (`setVariable`) and worker `activity_complete` results (`variables-changed`). Never mutate state through ad-hoc reasoning.

### force-full-after-summarization

When this agent context no longer holds previously delivered content (e.g. after summarization), force full re-delivery with `get_activity { bundle: "full" }`, `get_technique { full: true }`, or `get_resource { full: true }`. Unchanged-references are valid only for content this same agent already received.
