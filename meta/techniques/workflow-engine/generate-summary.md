---
metadata:
  version: 1.3.0
---

## Capability

Compose the markdown session summary presented at workflow close.

## Inputs

### workflow_definition

Workflow definition (id, title, outcomes)

### execution_trace

Completed activities, checkpoint decisions, and artifacts produced.

## Outputs

### completion_summary

[Markdown string](../../../meta/resources/session-summary-template.md#session-summary-template) summarizing the completed session.

## Protocol

1. Fill the [Session Summary Template](../../../meta/resources/session-summary-template.md#session-summary-template) from `{workflow_definition}` and `{execution_trace}`, honouring the fill rules stated beneath it. Return the assembled markdown as `{completion_summary}`.

## Rules

### present-only

The summary is presented to the user in the session — it is NOT written to the planning folder as an artifact. The session state file is the durable record of the trace, and the client workflow's own close-out document is the durable record of outcomes; a session-summary artifact would duplicate both.
