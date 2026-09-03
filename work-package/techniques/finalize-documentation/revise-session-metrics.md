---
metadata:
  version: 1.0.0
---

## Capability

Client-side pointer to the meta universal layer, which owns the post-exit rewrite of session-trace and token-usage after the client session completes, so the terminal activity is counted.

## Inputs

### trace_tokens

*(optional)* Opaque trace tokens for the client run.

## Outputs

### token_usage_document

Updated sole cost home (`token-usage.md`).

### session_trace_document

Updated lean mechanical trace (`session-trace.md`).

## Protocol

- Apply [workflow-engine::revise-session-metrics](../../../meta/techniques/workflow-engine/revise-session-metrics.md) with `{planning_folder_path}` and optional `{trace_tokens}`.
- A mid-`complete` draft from [render-token-usage](./render-token-usage.md) / [retrospective](../conduct-retrospective/retrospective.md) is not final; the meta post-exit apply is authoritative.

## Rules

### after-client-exit

Do not treat an in-`complete` write as the final metrics artifact. The ledger row for `complete` lands only after that activity exits.
