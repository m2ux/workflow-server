# Assumptions Log

> Incremental Retrospective Log (work-package) · updated 2026-07-08

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence.

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RR-1 | Requirements | Activity Boundaries | L | The log is created in activity 01 (after `initialize-planning-folder`) rather than 02 — "at the start" is truest here, and 01 is where the planning folder first exists | User interview (D4) | Confirmed |
| RR-2 | Requirements | Rule Scope | L | Per-activity updates are driven by a workflow-level `activity` rule + a single `create` step in 01, not an explicit step in every activity — "as and when required" favours a rule over ~12 near-noop steps; follows the existing "update README each activity" rule precedent | User interview (D1) | Confirmed: hybrid chosen |
| RR-3 | Requirements | Schema Construct Choice | M | The terminal `conduct-retrospective::retrospective` op (session-history reconstruction → `COMPLETE.md` section) is **retired**; retrospective content moves to standalone `retrospective-log.md`; `COMPLETE.md` links to it | User interview (intake + D5); content-reducing → flagged for approval at impact/scope | Confirmed: retire + link |
| RR-4 | Requirements | Behavioral | L | Capture is exception-only (no null rows); a friction-free run leaves the log essentially empty and the terminal issue checkpoint is dismissed | User interview (D6) | Confirmed |
| RR-5 | Requirements | Interface | L | Termination raises **one aggregate** GitHub issue against the workflow-server repo (checklist of all items), gated on `has_retrospective_items == true` | User interview (D2) | Confirmed: aggregate |
| RR-6 | Requirements | Scope | L | Change is scoped to work-package only; workflow-design's own retrospective activity is a noted follow-up, not in scope | User interview (D3) | Confirmed: work-package only |
| RR-7 | Requirements | Compatibility | L | The existing signal taxonomy (clarifications, corrections, frustration, process questions, feature/skip requests) and priority scheme are preserved and reused by the incremental record op | Reuse of `workflow-retrospective.md` resource content | Validated |

## Open Assumptions

*None — all design assumptions were resolved through the requirements elicitation.*

## Wrap-Up

7 assumptions — all confirmed/validated through user interview. Key takeaway: the change
re-homes existing retrospective methodology onto the proven assumptions-log lifecycle;
the one content-reducing element (retiring end-of-run history reconstruction, RR-3) is
carried to impact analysis for the explicit non-destructive-update approval.
