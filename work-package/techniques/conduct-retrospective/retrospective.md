---
metadata:
  version: 1.3.0
---

## Capability

Close-out retrospective — session history, friction (user-message and mechanical), lean session-trace, and work-package status (implementation merge or review-mode audit).

## Inputs

### pr_number

The PR number for **this** work package's own authored PR (empty or unset when the run produced none). Never the audited third-party PR from review mode.

### planning_folder_path

Path to the planning folder where the final outcome, session-trace, and retrospective are recorded.

### is_review_mode

*(optional)* When true, the run audited an external change rather than implementing one; close-out and status update follow the review-mode path.

### trace_tokens

*(optional)* Opaque trace tokens accumulated across the run.

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-section-template) with lessons learned, written as the `## Workflow Retrospective` section of the close-out document (or the planning-folder session `README.md` when `COMPLETE.md` was not created).

#### artifact

`COMPLETE.md` (implementation) or planning-folder session `README.md` section (review mode)

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
- Write `{retrospective_document}` using that resource's section template; include only categories with content; link `{session_trace_document}` when written. Apply `skip-if-trivial` from the group base when mechanical friction is non-trivial even if user-message signals are empty.
  - **Implementation path** (`is_review_mode` unset or false): write as `## Workflow Retrospective` in `COMPLETE.md` (update in place).
  - **Review-mode path** (`is_review_mode == true`): when `create-complete-doc` was gated out and `COMPLETE.md` is absent, find-or-update a minimal `## Workflow Retrospective` section in the planning-folder session `README.md` — do not invent a stub `COMPLETE.md` or a second close-out filename solely to host the section.

### 4. Update Status

- Update the work package plan status only for **this** work package's own PR (`{pr_number}` as defined above).
  - **Implementation path:** once that PR has merged, update status; if it has not merged yet, wait for merge or address review feedback first.
  - **Review-mode path:** skip status updates keyed to an audited third-party PR. When this work package itself opened a PR (rare), treat only that PR's merge as the status trigger; otherwise record the review close-out outcome under `{planning_folder_path}` without a merge-gated status flip.
- Record the final outcome in the planning artifacts under `{planning_folder_path}`.
