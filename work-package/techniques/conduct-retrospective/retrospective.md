---
metadata:
  version: 1.6.0
---

## Capability

Close-out retrospective — session history, friction (user-message and mechanical), lean session-trace, and work-package status (implementation merge or review-mode audit).

## Inputs

### is_review_mode

*(optional)* When true, the run audited an external change rather than implementing one; close-out and status update follow the review-mode path.

### execution_trace

Completed activities, checkpoint decisions, and the event history behind them.

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-section-template) with lessons learned, written as the `## Workflow Retrospective` section of the close-out document.

### session_trace_document

Lean mechanical summary of resolved trace events (dispatch counts, tool counts, durations, errors, `vw` clusters), carrying no token or cost figure.

#### artifact

`session-trace.md`

#### audience

`human`


## Protocol

### 1. Capture History

- If metadata repository exists, capture session history from `{execution_trace}`.

### 2. Resolve Session Trace

- Resolve `{trace_tokens}` once at close-out per [resolve-trace-at-close-out](../../../meta/techniques/workflow-engine/dispatch-activity.md#resolve-trace-at-close-out); skip when empty (no fabrication).
- Write `{session_trace_document}` under `{planning_folder_path}` via find-or-update ([artifact-prefix](../manage-artifacts/TECHNIQUE.md#artifact-prefix)) following the [session-trace template](../../resources/session-trace.md#template) — mechanical execution only, no token or cost figure. This write is a **draft**: the terminal activity's own dispatch is not yet in the trace, so a later revision supersedes it.

### 3. Conduct Retrospective

- Count total user messages; separate prompted responses from substantive interactions; categorize and map to workflow sections.
- From the resolved trace (when present), derive mechanical observations using [Mechanical classes](../../resources/workflow-retrospective.md#mechanical-classes-from-the-resolved-trace) — treat repeated patterns as instruction defects with prioritized fixes naming the canonical home to change.
- Identify root causes / frequency; formulate prioritized recommendations (high / medium / low).
- Cut the set to the counts in [Item Budget](../../resources/workflow-retrospective.md#item-budget), highest priority first; route each cut item that still deserves to survive to the follow-ups register and link it.
- Write `{retrospective_document}` as the `## Workflow Retrospective` section of `COMPLETE.md` (update in place), using that resource's section template; include only categories with content; link `{session_trace_document}` when written, and `token-usage.md` when present as the sole cost home. Apply `skip-if-trivial` from the group base when mechanical friction is non-trivial even if user-message signals are empty.

### 4. Update Status

- Update the work package plan status only for **this** work package's own PR (`{pr_number}` as defined above).
  > - **Implementation path:** the status advances where that pull request has merged, and holds at its current value where it has not.
  > - **Review-mode path:** a status keyed to an audited third-party pull request does not advance. Where this work package opened one of its own (rare), only that pull request's merge advances the status; otherwise the review close-out outcome is recorded in `COMPLETE.md` with no merge-gated flip.
- Record the final outcome in the planning artifacts under `{planning_folder_path}`.
