---
metadata:
  version: 1.3.0
---

## Capability

Write the one document the run leaves behind: every entry the walk took, and whether the two
branches held identities of their own.

## Inputs

### cold_entry

The record Record Entry wrote.

### batch_entry

The record Carry Batch wrote.

### note_left_outputs

The container Note Left filled, one slot per branch the destination named it for.

### note_right_outputs

The container Note Right filled.

### session_index

The session this run walked, whose record the ledgers are read from.

### planning_folder_path

Absolute path of the session's planning folder, which the report is written into.

## Outputs

### report_path

Absolute path of the document this technique wrote.

## Protocol

### 1. Entry Roll

- Read the two records and the two containers whole, and lay out one row each: entry kind,
  activity, identity, instant.
  > Read a container rather than naming a slot. Which record came from which branch is carried
  > by the container that branch filled.

### 2. Identity Ledger

- State whether the two branch containers carry distinct `agent_id` values, and whether the
  identity on `{cold_entry}` and the identity on `{batch_entry}` match.
  > Two branches sharing an identity, or a continuation arriving under a fresh one, are each
  > a finding about the entry rather than about the activity that recorded it.
- Call `inspect_session { session_index, view: "identity" }` and count the identities the session
  minted against the three this graph requires: one for the cold dispatch, which the continuation
  reuses, and one per branch. State any surplus.
  > A fourth identity is a continuation that opened a replacement worker instead of continuing the
  > one it held. Both shapes reach the same activity, and only the count tells them apart.

### 3. Completion Ledger

- Call `inspect_session { session_index, view: "activities" }` and lay out, for every activity
  the graph declares, how many times it completed. State any count that is not one.
  > An activity carried and never completed, or completed under a name that never ran, is what a
  > pointer that moved on the wrong value leaves behind. Neither shows up as a failed call.

### 4. Advance Ledger

- Call `get_trace { session_index }` and count the advances it holds against the advances this
  graph requires: one per activity entered, one per branch retired, one onto `__terminal__`.
  State any surplus or shortfall.
  > A token appended twice and a token never appended both read as a successful walk. Only the
  > count separates them.

### 5. Usage Ledger

- Call `inspect_session { session_index, view: "usage" }` and lay out one row per activity: whether
  a usage entry was recorded for it, and which identity it was attributed to. State any activity
  with no entry, and any entry attributed to no identity or to an identity that did not carry it.
  > A usage call made without the identity that carried the activity records an unattributed
  > bucket, which the server accepts. Nothing refuses it and nothing else reads it back.

### 6. Delivery Ledger

- Lay out the technique ids this context was served against the ids its activity's steps bind,
  and the ids those techniques name for work inside their own Protocol. State any id that was
  applied and not served.
  > A technique that never arrived is improvised past rather than refused, so a walk that
  > succeeded is not evidence that its contract was delivered.

### 7. Written Report

- Write the roll and every ledger to
  `{planning_folder_path}/worker-entry-report.md`, following the
  [entry report](/worker-entry-conformance/resources/entry-report.md) shape, and return that path
  as `{report_path}`.

## Rules

### read-containers-whole

This technique names no slot of a fanned container. A fan's width is a run-time value, so an
authored index is a claim about a run rather than about the workflow.
