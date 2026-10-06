---
metadata:
  version: 1.3.0
---

## Capability

The live session record — its variable bag, the activities it stands on, and its execution trace — for a consumer that reasons over where the session stands and what it has done.

## Outputs

### session_state

The session's variable bag as the server holds it.

### in_flight

The activities the session stands on: one on an ordinary walk, one per branch while a fan runs. Empty before the session's first advance and after its advance onto `__terminal__`.

### execution_trace

Completed activities, checkpoint decisions, artifacts produced, and the event history behind them.

## Protocol

### 1. Inspect Session

- Read the session through the `inspect_session` tool: `view: variables` yields `{session_state}`; `view: activities` yields `{in_flight}` as its `current`; `view: activities`, `view: checkpoints` and `view: history` each yield a slice of `{execution_trace}`, and `view: summary` yields every product in one call.
## Rules

### session-file-is-not-a-source

This session's file on disk is the server's own store rather than a read surface for it: it may be sealed, and it lags a call still in flight. Take `{session_state}` and `{execution_trace}` from this technique.

### trace-is-not-the-only-witness

A worker's `activity_complete` envelope is a witness of that worker's own user interaction, beside `{session_state}` and `{execution_trace}`.
