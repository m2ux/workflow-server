---
metadata:
  version: 1.5.0
---

## Capability

Close-out retrospective — session history, friction (user-message and mechanical), lean session-trace, and work-package status (implementation merge or review-mode audit).

## Inputs

### is_review_mode

*(optional)* When true, the run audited an external change rather than implementing one; close-out and status update follow the review-mode path.

### trace_tokens

*(optional)* Opaque trace tokens accumulated across the run.

### execution_trace

Completed activities, checkpoint decisions, and the event history behind them.

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-section-template) with lessons learned, written as the `## Workflow Retrospective` section of the close-out document.

### session_trace_document

Lean mechanical summary of resolved trace events (dispatch counts, tool counts, durations, errors, `vw` clusters), carrying no token or cost figure.

#### artifact

`session-trace.md`

## Protocol

### 1. Capture History

- If metadata repository exists, capture session history from `{execution_trace}`.

### 2. Resolve Session Trace

- Resolve `{trace_tokens}` once at close-out per [resolve-trace-at-close-out](../../../meta/techniques/workflow-engine/dispatch-activity.md#resolve-trace-at-close-out); skip when empty (no fabrication).
- Write `{session_trace_document}` under `{planning_folder_path}` via find-or-update ([artifact-prefix](../manage-artifacts/TECHNIQUE.md#artifact-prefix)) following [session-trace](session-trace#template) — mechanical execution only, no token or cost figure. This mid-`complete` write is a **draft**; meta `end-workflow` rewrites it via [revise-session-metrics](../../../meta/techniques/workflow-engine/revise-session-metrics.md) after the client exits so the terminal activity is included.

### 3. Conduct Retrospective

- Count total user messages; separate prompted responses from substantive interactions; categorize and map to workflow sections.
- From the resolved trace (when present), derive mechanical observations using [Mechanical classes](../../resources/workflow-retrospective.md#mechanical-classes-from-the-resolved-trace) — treat repeated patterns as instruction defects with prioritized fixes naming the canonical home to change.
- Identify root causes / frequency; formulate prioritized recommendations (high / medium / low).
- Cut the set to the counts in [Item Budget](../../resources/workflow-retrospective.md#item-budget), highest priority first; route each cut item that still deserves to survive to the follow-ups register and link it.
- Write `{retrospective_document}` as the `## Workflow Retrospective` section of `COMPLETE.md` (update in place), using that resource's section template; include only categories with content; link `{session_trace_document}` when written, and `token-usage.md` when present as the sole cost home. Apply `skip-if-trivial` from the group base when mechanical friction is non-trivial even if user-message signals are empty.

### 4. Update Status

- Update the work package plan status only for **this** work package's own PR (`{pr_number}` as defined above).
  - **Implementation path:** once that PR has merged, update status; if it has not merged yet, wait for merge or address review feedback first.
  - **Review-mode path:** skip status updates keyed to an audited third-party PR. When this work package itself opened a PR (rare), treat only that PR's merge as the status trigger; otherwise record the review close-out outcome in `COMPLETE.md` without a merge-gated status flip.
- Record the final outcome in the planning artifacts under `{planning_folder_path}`.
