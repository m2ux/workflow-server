# Requirements Refinement — Incremental Retrospective Log

> work-package · updated 2026-07-08 · Mode: Update

## Purpose

Convert the work-package workflow's retrospective from a **single terminal artifact**
(reconstructed from session history in `14-complete` by `conduct-retrospective::retrospective`,
written as a `## Workflow Retrospective` section of `COMPLETE.md`) into an **incremental
retrospective log** — a standalone `retrospective-log.md` created at the start of the run and
appended to in-the-moment by each activity as process friction arises, mirroring the existing
`assumptions-log.md` lifecycle. At termination, offer the user the option to raise a GitHub
issue against the **workflow-server** repository capturing the logged process-improvement items.

The retrospective's orientation is unchanged: it is a **process** record — lessons-learned /
what-could-be-improved for the *workflow itself*, never user error. Signals of interest:
ad hoc user comments, out-of-bounds questions, clarifications, corrections, frustration,
process questions, feature/skip requests — anything that would help improve the workflow for
future runs.

## Design Dimensions (Update mode)

### Purpose
As above — flip terminal reconstruction → incremental in-the-moment capture, plus a terminal
issue-raising offer.

### Activity list (touched)
- **01 start-work-package** — NEW `create-retrospective-log` step (after `initialize-planning-folder`), creating `retrospective-log.md`.
- **02–13 (all activities)** — per-activity updates driven by a workflow-level `activity` rule (no per-activity step), appending signals via `conduct-retrospective::record` **as and when required** (exception-only — no null rows).
- **14 complete** — replace the terminal `conduct-retrospective::retrospective` (history reconstruction → COMPLETE.md section) with: a `finalize-retrospective` read/assess step that sets `has_retrospective_items`, a `raise-retrospective-issues` checkpoint (gated on items existing), and a `create-retrospective-issue` step that raises **one aggregate** GitHub issue against the workflow-server repo when the user opts in.

### Checkpoints
- **NEW** `raise-retrospective-issues` (activity 14, conditional on `has_retrospective_items == true`): offer to raise one aggregate workflow-server issue listing all logged items; options create / skip. Outward-facing (creates a GitHub issue) → genuine user decision gate.

### Artifacts
- **NEW** `retrospective-log.md` (standalone, in the planning folder; committed as a planning artifact — parallels `assumptions-log.md`). Session history stays private (unchanged `history-private` rule).
- `COMPLETE.md` — no longer embeds the retrospective section; **links** to `retrospective-log.md` (single-source-and-link).

### Rules
- **NEW** workflow-level `activity` rule: each activity, before completing, appends any process signals observed during it to `retrospective-log.md` via `conduct-retrospective::record` (exception-only).
- Preserve `retrospective-honest`, `skip-if-trivial`, `history-private`.

## Confirmed Design Decisions

| # | Decision | Choice |
|---|----------|--------|
| D1 | Per-activity update mechanism | **Hybrid** — explicit `create-retrospective-log` step in activity 01 + a workflow-level `activity` rule for per-activity updates |
| D2 | Termination issue-raising | **One aggregate issue** against the workflow-server repo (checklist of all logged items) |
| D3 | Scope | **work-package only**; workflow-design's own retrospective activity noted as a follow-up candidate |
| D4 | Creation placement | Activity 01, immediately after `initialize-planning-folder` (truest "at the start"; log exists before any downstream activity runs) |
| D5 | Terminal history reconstruction | **Retired** — in-the-moment capture supersedes end-of-run session-history scanning; the signal taxonomy is preserved and reused by the per-activity record op |
| D6 | Empty-run behavior | Exception-only capture; a friction-free run leaves an essentially empty log and the termination issue checkpoint is dismissed (`has_retrospective_items == false`) |

## Requirements confirmed

All dimensions captured and confirmed with the user via the design-decision elicitation.
`requirements_confirmed = true`.
