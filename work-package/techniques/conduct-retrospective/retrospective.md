---
metadata:
  version: 1.2.0
---

## Capability

Capture session history, resolve accumulated execution traces, produce the retrospective document (user-message and mechanical friction), write a lean session-trace artifact, and update the work package status once the PR has merged.

## Inputs

### pr_number

The PR number for this work package — its merge gates the status update and the final outcome record.

### planning_folder_path

Path to the planning folder where the final outcome, session-trace, and retrospective are recorded.

### trace_tokens

*(optional)* Opaque trace tokens accumulated across the run. When non-empty, resolve once before writing mechanical retrospective content; when absent or empty, skip the session-trace path.

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-section-template) with lessons learned, written as the `## Workflow Retrospective` section of the close-out document.

#### artifact

`COMPLETE.md`

### session_trace_document

Lean mechanical summary of resolved trace events (tool counts, durations, errors, `vw` clusters), or a one-line skip when `{trace_tokens}` is empty.

#### artifact

`session-trace.md`

## Protocol

### 1. Capture History

- If metadata repository exists, capture session history.
  > Obtain session state through the `inspect_session` tool (e.g. `view: history` for the event trace, `view: summary` for the full picture) rather than reading `session.json` directly.

### 2. Resolve Session Trace

- When `{trace_tokens}` is non-empty, resolve once at close-out before writing mechanical content. Do not resolve per activity mid-run.
- When `{trace_tokens}` is absent or empty, write a one-line skip into `{session_trace_document}` (or omit the artifact) and continue — no fabrication.
- Write `{session_trace_document}` under `{planning_folder_path}` (server `artifactPrefix` on first write) following [session-trace](session-trace#template).

### 3. Conduct Retrospective

- Count total user messages; separate prompted responses from substantive interactions (clarifications, corrections, process questions, frustration signals, feature requests, skip requests).
- Categorize the substantive messages by signal type and map to specific workflow sections.
- From the resolved trace (when present), derive mechanical observations using [workflow-retrospective](../../resources/workflow-retrospective.md) classes: `[trace-warning]`, `[trace-retry]`, `[trace-redundancy]`. Treat repeated patterns as workflow/instruction defects — map each observation to a prioritized fix that names the canonical technique, resource, or activity text to change. Cover at least: `step_manifest` gaps/order/empty outputs; technique-fetch fidelity failures; illegal/paraphrased transitions / `transition_condition` mismatches; tool error clusters; redundant fetch storms.
- Identify root causes and determine pattern frequency across user-message and mechanical categories.
- Formulate prioritized recommendations: high (repeated corrections, frustration, repeated mechanical friction), medium (single clarifications, isolated `vw`), low (edge cases).
- Interview one observation or recommendation at a time per [workflow-retrospective](../../resources/workflow-retrospective.md#interview-format): present the item, confirm with the reviewer, then continue — do not batch unresolved items.
- Write the `{retrospective_document}` as the `## Workflow Retrospective` section of `COMPLETE.md` (update in place — the close-out document is the single terminal artifact), using the [workflow-retrospective](../../resources/workflow-retrospective.md) section template. Include only the signal categories that have content; lessons already recorded elsewhere in the close-out document are referenced, not restated. When mechanical friction is non-trivial, apply the `skip-if-trivial` carve-in from the group base even if user-message signals are empty.
- Link `{session_trace_document}` from the retrospective header or observations when the artifact was written.

### 4. Update Status

- Once the PR identified by `{pr_number}` has merged, update the work package plan status.
  > If the PR has not merged yet, wait for merge or check whether review feedback needs addressing first before updating status.
- Record the final outcome in the planning artifacts under `{planning_folder_path}`.
