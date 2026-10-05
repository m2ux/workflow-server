---
metadata:
  version: 1.2.0
---

## Capability

Record the usage entry for a worker that has returned, and reconcile routing where the session record and that envelope disagree.

## Inputs

### activity_id

The activity the entry counts.

### worker_agent_id

The delivery identity the entry is attributed to.

### worker_result

The envelope the worker returned.

## Outputs

### followup_status

The Progress status to write after this activity, when the worker or the harness reports blocked or the path skips the activity. Unset when no follow-up mark is owed.

## Protocol

### 1. Record Usage Entry

- Record one usage entry for `{activity_id}`: `record_usage { session_index, activity: activity_id, usage, basis, agent_id: worker_agent_id }`. `usage` and `basis` are read from the harness, and the entry says what the figure counts.
  > When the harness reports no figure, omit the entry.
  > A worker does not record its own usage.

### 2. Reconcile Routing

- Where `{worker_result}` is `activity_complete` and the session record disagrees with that envelope on routing or path state, the envelope governs, and the discrepancy is logged (`distrust-then-reconcile`).

### 3. Name Follow-up Mark

- When the worker or the harness reports blocked, `{followup_status}` is the blocked moment in [Progress Status call sites](/meta/resources/planning-readme.md#progress-status-call-sites).
  > When the path skips or cancels the activity, `{followup_status}` is the path-skip / cancel moment in that resource.
  > Otherwise `{followup_status}` is unset.

## Rules

### account-every-activity

One usage entry per activity. The entry is omitted when the harness reports no figure, and is never recorded as zero.

### distrust-then-reconcile

Where the session record and a just-completed worker's `activity_complete` envelope (`variables_changed` and related fields) disagree on routing or path state, the envelope governs, and the discrepancy is logged.
