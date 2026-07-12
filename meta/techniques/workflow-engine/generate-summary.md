---
metadata:
  version: 1.0.0
---

## Capability

Compose the markdown session summary presented at workflow close.

## Inputs

### workflow_definition

Workflow definition (id, title, outcomes)

### execution_trace

Completed activities, checkpoint decisions, artifacts produced

## Outputs

### completion_summary

[Markdown string](../../resources/session-summary-template.md#session-summary-template) ready to present to the user.

## Protocol

1. Draw from `{execution_trace}` to compose the summary sections: workflow id and title, start/completion timestamps, activities completed, key checkpoint decisions, artifacts with paths, outcomes satisfied vs. unmet, follow-up items. Return the assembled markdown as `{completion_summary}`.
   > Obtain the execution trace through the `inspect_session` tool — `view: activities` for completed activities, `view: checkpoints` for checkpoint decisions, `view: history` for the event trace, or `view: summary` for all of it — rather than reading `session.json` directly.

## Rules

### present-only

The summary is presented to the user in the session — it is NOT written to the planning folder as an artifact. The session state file is the durable record of the trace, and the client workflow's own close-out document is the durable record of outcomes; a session-summary artifact would duplicate both.
