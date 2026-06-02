---
metadata:
  ontology: workflow-canonical
  kind: technique
  version: 6.1.0
  order: 0
  legacy_id: 0
---

# Workflow Engine

## Capability

Operations and rules for executing a workflow's structured flow — session lifecycle (list/match/scan/create), activity dispatch (next_activity, worker spawn, finalize), transition evaluation, post-activity commit, and the checkpoint protocol (yield/present/respond/resume).

## Rules

### session-index-passes-on-each-call

EVERY authenticated tool call (anything other than `discover`, `list_workflows`, `start_session`, `health_check`) requires a `session_index` parameter — the 6-character base32 string returned by `start_session`. The index is stable across all calls within a session; there is no rotation discipline.

### validation-warnings

Check `_meta.validation` in each response. Warnings are advisory but should be addressed.

### resource-loading-via-tool

Resource refs returned in operation bodies (e.g., [activity-worker-prompt](../../resources/activity-worker-prompt.md)) are lightweight pointers. Load full content via `get_resource { session_index, resource_id }`.
