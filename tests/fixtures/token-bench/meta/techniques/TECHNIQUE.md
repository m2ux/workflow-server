---
metadata:
  version: 1.0.0
---

## Capability

Contract shared by every operation in the meta namespace — the coordinates a run works against, and the two boundaries that bind from the first authenticated call.

## Inputs

### host_repo_path

Absolute path of the outermost git host for the workspace checkout — the outermost superproject when the component is a submodule, the checkout itself otherwise.

### component_path

Path of the component being worked on, relative to `{host_repo_path}` — `.` for a regular repository. The two together locate the component directory.

### planning_folder_path

Path to the session's planning folder, as the server returned it. Operations that read or write session artifacts take it from here; not every operation needs one.

## Rules

### session-index-passes-on-each-call

Every authenticated tool call carries the `session_index` the session opened with. The index is stable for the life of the session.

### validation-warnings

Read `_meta.validation` on each response. A warning is advisory and is addressed rather than ignored.
