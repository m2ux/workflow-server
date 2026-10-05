---
metadata:
  version: 1.4.0
---

## Capability

Rewrite the client planning folder's session-trace and token-usage artifacts from the full client session ledger after that workflow has finished — including the terminal activity's own dispatch.

## Inputs

### client_session_index

*(optional)* Client session index when the durable history lives on a child session rather than the meta session file alone.

### trace_tokens

*(optional)* The trace token of every advance the client run made, the terminal advance last. Empty or unset where the walk accumulated none.

## Outputs

### token_usage_document

Updated sole cost home under the planning folder (`*token-usage.md`).

### session_trace_document

Updated lean mechanical trace under the planning folder (`*session-trace.md`).

## Protocol

### 1. Read Client Ledger

- Read rolled-up `activity_usage` from the **client** session after its terminal activity has exited and usage for that dispatch has been recorded (`account-worker.account-every-activity`).
- Include every activity that ran, including the terminal activity and any failed or partial dispatches that left a ledger row.
- When the ledger is empty, leave existing artifacts untouched and stop — do not fabricate figures.

### 2. Resolve Client Trace

- Call `get_trace { session_index: client_session_index, trace_tokens }` once. Tokens stay opaque until this call, and they hold the run across a server restart. The resolve reads the whole run: each token carries its own events, and a token absent from `{trace_tokens}` is absent from the resolved trace. `inspect_session` on `{client_session_index}` supplies fetch and fidelity context for the same resolve.
  > - When `{trace_tokens}` is empty or unset, the resolved trace is empty.

### 3. Re-render Token Usage

- Find-or-update the existing `token-usage.md` (same prefix the client close-out minted) from the ledger, to the shape [token-usage](/meta/resources/token-usage.md#template) lays out and the [Rules](/meta/resources/token-usage.md#rules) that populate it.
- Reconcile the ledger's entry count against the dispatches the resolved trace counts, for the artifact's Coverage section.
  > - When no trace was resolved, the dispatch count is unknown, and the totals are a floor.
- Do not mint a second prefix.

### 4. Re-render Session Trace

- Find-or-update the existing `session-trace.md` from the resolved trace, to the shape [session-trace](/meta/resources/session-trace.md#template) lays out and the [Rules](/meta/resources/session-trace.md#rules) that populate it.
- When a successful terminal dispatch left no ledger row, record that gap in mechanical notes and in the coverage reconciliation. Wall-clock from durable `activity_dispatched`/`activity_entered` to `activity_exited` may appear as an **unpriced duration note** only when both timestamps exist — never as invented tokens.

### 5. Refresh Cost Line

- Update the planning-folder README token-use summary line to match the revised totals. When usage is absent, omit the line.

## Rules

### after-client-exit

Runs only after the client terminal activity has exited. A write inside that activity cannot see its own dispatch figure.

### authoritative-over-draft

When both an in-client-close-out draft and this revision exist, this revision is authoritative. Find-or-update in place.

### no-fabrication

No invented token or cost cells. Unledgered wall-clock is a mechanical note only.
