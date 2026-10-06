---
metadata:
  version: 1.5.0
---

## Capability

Record the usage entry for a worker that has returned, and reconcile routing where the session record and that envelope disagree.

## Inputs

### worker_agent_id

The delivery identity the entry is attributed to.

### worker_result

The envelope the worker returned.

## Outputs

### followup_status

The Progress status to write after this activity, when the worker or the harness reports blocked or the path skips the activity. Unset when no follow-up mark is owed.

## Protocol

### 1. Record Usage Entry

- Account for `{activity_id}` per `account-every-activity`, attributed to `{worker_agent_id}` — the worker this run is closing out, never the context running it.

### 2. Reconcile Routing

- The envelope governs, and the discrepancy is logged (`distrust-then-reconcile`).
  > Where `{worker_result}` is `activity_complete` and the session record disagrees with that envelope on routing or path state.

### 3. Name Follow-up Mark

- `{followup_status}` is the moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites).
  > - When the worker or the harness reports blocked, that moment is the blocked row.
  > - When the path skips or cancels the activity, that moment is the path-skip / cancel row.
  > - Otherwise `{followup_status}` is unset.

## Rules

### account-every-activity

One usage entry per activity: `record_usage { session_index, activity, usage, basis, agent_id }`, where `activity` is the activity accounted for and `agent_id` the identity that carried it. `usage` and `basis` are read from the harness, and the entry says what the figure counts. Where the graph runs one activity over a collection, `activity` names that instance. The entry is omitted when the harness reports no figure, and is never recorded as zero.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs, and the discrepancy is logged.
