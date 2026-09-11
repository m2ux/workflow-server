---
metadata:
  version: 1.1.0
---

## Capability

Rewrite the client planning folder's session-trace and token-usage artifacts from the full client session ledger after that workflow has finished — including the terminal activity's own dispatch.

## Inputs

### client_session_index

*(optional)* Client session index when the durable history lives on a child session rather than the meta session file alone.

### trace_tokens

*(optional)* Opaque client-run trace tokens for dispatch reconciliation when present.

## Outputs

### token_usage_document

Updated sole cost home under the planning folder (`*token-usage.md`).

### session_trace_document

Updated lean mechanical trace under the planning folder (`*session-trace.md`).

## Protocol

### 1. Read the full client ledger

- Read rolled-up `activity_usage` from the **client** session after its terminal activity has exited and the orchestrator has had its chance to `record_usage` for that dispatch ([account-every-activity](./dispatch-activity.md#account-every-activity)).
- Include every activity that ran, including the terminal activity and any failed or partial dispatches that left a ledger row.
- When the ledger is empty, leave existing artifacts untouched and stop — do not fabricate figures.

### 2. Re-render token usage

- Find-or-update the existing `token-usage.md` (same prefix the client close-out minted) from the ledger, to the shape [token-usage](../../../meta/resources/token-usage.md#template) lays out and the [Rules](../../../meta/resources/token-usage.md#rules) that populate it.
- Do not mint a second prefix.

### 3. Re-render session trace

- Find-or-update the existing `session-trace.md` from the same ledger, to the shape [session-trace](../../../meta/resources/session-trace.md#template) lays out and the [Rules](../../../meta/resources/session-trace.md#rules) that populate it.
- When a successful terminal dispatch left no ledger row, record that gap in mechanical notes and in the coverage reconciliation. Wall-clock from durable `activity_dispatched`/`activity_entered` to `activity_exited` may appear as an **unpriced duration note** only when both timestamps exist — never as invented tokens.

### 4. Refresh the README cost line

- Update the planning-folder README token-use summary line to match the revised totals. When usage is absent, omit the line.

## Rules

### after-client-exit

Runs only after the client terminal activity has exited. A write inside that activity cannot see its own dispatch figure.

### authoritative-over-draft

When both an in-client-close-out draft and this revision exist, this revision is authoritative. Find-or-update in place.

### no-fabrication

No invented token or cost cells. Unledgered wall-clock is a mechanical note only.
