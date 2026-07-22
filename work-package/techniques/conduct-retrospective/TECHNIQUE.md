---
metadata:
  version: 2.3.0
---

## Capability

Conduct workflow retrospective to capture lessons learned and prepare for next work package

## Inputs

### pr_number

The PR number for this work package

### planning_folder_path

Path to the planning folder where the final outcome and retrospective are recorded

### trace_tokens

*(optional)* Opaque HMAC-signed trace-token collection accumulated across the run.

## Outputs

### retrospective_document

Workflow [retrospective](../../resources/workflow-retrospective.md#output-section-template) with lessons learned, written as the `## Workflow Retrospective` section of the close-out document rather than a standalone artifact

#### retrospective_artifact

`COMPLETE.md`

### session_trace_document

Lean mechanical session-trace summary when `{trace_tokens}` resolves to non-empty events — per-activity tool counts, durations, errors, and validation-warning (`vw`) clusters. Omit or one-line skip when tokens are absent/empty.

#### artifact

`session-trace.md`

## Rules

### retrospective-honest

Retrospective should be honest about what worked and what didn't — avoid generic positive statements

### skip-if-trivial

Skip the user-message retrospective when only prompted responses occurred (no clarifications, corrections, or process questions), OR the work package was trivial (<30 min, single task) — **unless** resolved trace data shows non-trivial mechanical friction (`vw` clusters, error bursts, or redundant fetch storms). In that carve-in, write the mechanical observations and recommendations even when user-message signals are empty.

### history-private

Session history is private and is never committed to the repository.
