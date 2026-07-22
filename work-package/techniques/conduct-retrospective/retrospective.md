---
metadata:
  version: 1.2.0
---

## Capability

Post-merge retrospective — session history, friction (user-message and mechanical), lean session-trace, and work-package status.

## Inputs

### pr_number

The PR number for this work package.

### planning_folder_path

Path to the planning folder where the final outcome, session-trace, and retrospective are recorded.

### trace_tokens

*(optional)* Opaque trace tokens accumulated across the run.

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

- If metadata repository exists, capture session history via `inspect_session` (same stance as [generate-summary](../../../meta/techniques/workflow-engine/generate-summary.md) / [verify-outcomes](../../../meta/techniques/workflow-engine/verify-outcomes.md) — not by reading `session.json`).

### 2. Resolve Session Trace

- Resolve `{trace_tokens}` once at close-out per [resolve-trace-at-close-out](../../../meta/techniques/workflow-engine/dispatch-activity.md#resolve-trace-at-close-out); skip when empty (no fabrication).
- Write `{session_trace_document}` under `{planning_folder_path}` via find-or-update ([artifact-prefix](../manage-artifacts/TECHNIQUE.md#artifact-prefix)) following [session-trace](session-trace#template).

### 3. Conduct Retrospective

- Count total user messages; separate prompted responses from substantive interactions; categorize and map to workflow sections.
- From the resolved trace (when present), derive mechanical observations using [workflow-retrospective](../../resources/workflow-retrospective.md) Mechanical classes — treat repeated patterns as instruction defects with prioritized fixes naming the canonical home to change.
- Identify root causes / frequency; formulate prioritized recommendations (high / medium / low).
- Interview one item at a time per [workflow-retrospective](../../resources/workflow-retrospective.md#interview-format).
- Write `{retrospective_document}` as `## Workflow Retrospective` in `COMPLETE.md` (update in place) using that resource's section template; include only categories with content; link `{session_trace_document}` when written. Apply `skip-if-trivial` from the group base when mechanical friction is non-trivial even if user-message signals are empty.

### 4. Update Status

- Once the PR identified by `{pr_number}` has merged, update the work package plan status.
  > If the PR has not merged yet, wait for merge or check whether review feedback needs addressing first before updating status.
- Record the final outcome in the planning artifacts under `{planning_folder_path}`.
