---
metadata:
  version: 1.5.0
---

## Capability

Write the one document the run leaves behind: every entry the walk took, whether the branches
held identities of their own, and what the session record holds against what the graph requires.

## Inputs

### cold_entry

A record of one entry: its kind, the identity it was carried under, the activity, and the instant
it was made.

### batch_entry

A record of one entry, in the same shape as `{cold_entry}`.

### note_left_outputs

A container of records, one slot per branch the destination opened.

### note_right_outputs

A container of records, in the same shape as `{note_left_outputs}`.

### planning_folder_path

Absolute path of the session's planning folder, which the report is written into.

## Outputs

### entry_report

The document this run leaves behind: the entry roll, the identity comparison, and the ledgers.

#### artifact

`worker-entry-report.md`

#### audience

`human`

## Protocol

### 1. Entry Roll

- Read `{cold_entry}`, `{batch_entry}`, `{note_left_outputs}` and `{note_right_outputs}` whole, and
  lay out one row each: entry kind, activity, identity, instant.
  > Read a container rather than naming a slot. Which record came from which branch is carried
  > by the container that branch filled.

### 2. Identity Comparison

- State whether the two branch containers carry distinct `agent_id` values, and whether the
  identity on `{cold_entry}` and the identity on `{batch_entry}` match.
  > Two branches sharing an identity, or a continuation arriving under a fresh one, are each
  > a finding about the entry rather than about the activity that recorded it.

### 3. Identity Ledger

- Call `inspect_session { session_index, view: "usage" }`, reading `session_index` from the stub
  this context was opened with. Count the distinct `agentId` values across its rows against the
  three this graph requires: one for the cold dispatch, which the continuation reuses, and one per
  branch.
  > A fourth identity is a continuation that opened a replacement worker instead of continuing the
  > one it held. Both shapes reach the same activity, and only the count tells them apart.

### 4. Completion Ledger

- Call `inspect_session { session_index, view: "history" }` and count the `activity_exited` events
  per activity.
  > The `activities` view reports `completed`, which is a de-duplicated set: an activity exited
  > twice appears there once. The history keeps both events, so it is the only reading that can
  > tell a double exit from a single one.

### 5. Advance Ledger

- Call `get_trace { session_index }` and count its `next_activity` spans against the advances this
  graph requires: one per activity entered, one per branch retired, one onto `__terminal__`.
  > The trace is the server's in-memory record of this session, which holds no event from before a
  > server restart, and none at all where tracing is off. Skip the count when it holds no events,
  > rather than reading an empty trace as every advance missing.

### 6. Delivery Ledger

- Lay out the technique ids this context's activity binds as steps against the ids it was served,
  and name any that was bound and not served.
  > A technique that never arrived is improvised past rather than refused, so a walk that
  > succeeded is not evidence that its contract was delivered. This reading is this context's own:
  > what the four entry activities were served is not visible from here.

### 7. Written Report

- Write the roll, the comparison and the four ledgers as `{entry_report}` into
  `{planning_folder_path}`, following the
  [Template](/worker-entry-conformance/resources/entry-report.md#template).

## Rules

### read-containers-whole

This technique names no slot of a fanned container. A fan's width is a run-time value, so an
authored index is a claim about a run rather than about the workflow.

### read-the-record-for-what-the-record-holds

Each ledger names the view or the event its count comes from, because the readings differ in what
they can show: a de-duplicated set cannot report a repeat, a scalar cannot report a roster, and an
empty trace is not the same fact as a missing advance. A ledger read from the wrong surface
reports clean on a run that failed.
