---
metadata:
  version: 1.0.0
---

## Capability

The live session record — its variable bag and its execution trace — for a consumer that reasons over what the session has actually done.

## Outputs

### session_state

The session's variable bag as the server holds it.

### execution_trace

Completed activities, checkpoint decisions, artifacts produced, and the event history behind them.

## Protocol

1. Read the session through the `inspect_session` tool: `view: variables` yields `{session_state}`; `view: activities`, `view: checkpoints` and `view: history` each yield a slice of `{execution_trace}`, and `view: summary` yields both products in one call.

## Rules

### session-file-is-not-a-source

The session file on disk is the server's own store, not a read surface: it may be sealed, and it lags a call still in flight. Every consumer of the two products above takes them from this operation, so one contract governs what a session read returns.

### trace-is-not-the-only-witness

A worker's `activity_complete` envelope holds ground truth from its own user interaction, so where the record and a just-completed envelope disagree on a value an orchestrator decision rests on, apply [dispatch-activity](./dispatch-activity.md#distrust-then-reconcile).
