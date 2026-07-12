---
metadata:
  version: 1.0.0
---

## Capability

Capture session history, produce the retrospective document, and update the work package status once the PR has merged.

## Inputs

### pr_number

The PR number for this work package — its merge gates the status update and the final outcome record.

### planning_folder_path

Path to the planning folder where the final outcome and retrospective are recorded.

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-section-template) with lessons learned, written as the `## Workflow Retrospective` section of the close-out document.

#### artifact

`COMPLETE.md`

## Protocol

### 1. Capture History

- If metadata repository exists, capture session history.
  > Obtain session state through the `inspect_session` tool (e.g. `view: history` for the event trace, `view: summary` for the full picture) rather than reading `session.json` directly.

### 2. Conduct Retrospective

- Count total user messages; separate prompted responses from substantive interactions (clarifications, corrections, process questions, frustration signals, feature requests, skip requests).
- Categorize the substantive messages by signal type and map to specific workflow sections.
- Identify root causes and determine pattern frequency across categories.
- Formulate prioritized recommendations: high (repeated corrections, frustration), medium (single clarifications), low (edge cases).
- Write the `{retrospective_document}` as the `## Workflow Retrospective` section of `COMPLETE.md` (update in place — the close-out document is the single terminal artifact), using the [workflow-retrospective](../../resources/workflow-retrospective.md) section template. Include only the signal categories that have content; lessons already recorded elsewhere in the close-out document are referenced, not restated.

### 3. Update Status

- Once the PR identified by `{pr_number}` has merged, update the work package plan status.
  > If the PR has not merged yet, wait for merge or check whether review feedback needs addressing first before updating status.
- Record the final outcome in the planning artifacts under `{planning_folder_path}`.
