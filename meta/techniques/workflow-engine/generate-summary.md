---
metadata:
  version: 1.0.0
---

## Capability

Compose the markdown session summary presented at workflow close.

## Inputs

### workflow

Workflow definition (id, title, outcomes)

### trace

Completed activities, checkpoint decisions, artifacts produced

## Outputs

### completion_summary

[Markdown string](../../resources/session-summary-template.md#session-summary-template) ready to present to the user.

## Protocol

1. Draw from `{trace}` to compose the summary sections: workflow id and title, start/completion timestamps, activities completed, key checkpoint decisions, artifacts with paths, outcomes satisfied vs. unmet, follow-up items. Return the assembled markdown as `{completion_summary}`.
