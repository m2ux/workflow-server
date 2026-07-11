# Impact Analysis — Incremental Retrospective Log

> Target: `work-package` workflow · Mode: Update · 2026-07-08

## File Inventory & Classification

### Directly modified

| File | Change |
|------|--------|
| `workflow.yaml` | Add workflow-level `activity` rule (per-activity retrospective capture); declare new variable `has_retrospective_items` (boolean, default false); version bump |
| `activities/01-start-work-package.yaml` | Add `create-retrospective-log` step after `initialize-planning-folder`; version bump |
| `activities/14-complete.yaml` | Replace the `conduct-retrospective` step with `finalize-retrospective` + `raise-retrospective-issues` checkpoint + `create-retrospective-issue` step; version bump |
| `techniques/conduct-retrospective/TECHNIQUE.md` | Rework group contract → retrospective-log lifecycle (artifact `retrospective-log.md`); add `has_retrospective_items` output; keep `retrospective-honest` / `skip-if-trivial` / `history-private` rules; version bump |
| `techniques/conduct-retrospective/retrospective.md` | **Removed** — capability redistributed to the new `record` / `finalize` / `raise-issues` ops (see removals) |
| `resources/workflow-retrospective.md` | Repurpose: "section written into COMPLETE.md" → **retrospective-log methodology + single-table log template** (standalone `retrospective-log.md`). Signal taxonomy + priority scheme preserved |
| `resources/complete-wp.md` | `## Workflow Retrospective` section (L58–60) now **links** to `retrospective-log.md` instead of embedding the section (single-source-and-link) |
| `resources/README.md` | L27 — update `workflow-retrospective` resource description |
| `README.md` (root) | L27, L182 — update the complete-activity descriptions (incremental log + issue-raising) |
| `activities/README.md` | L440, L450–455 — update complete-activity prose + mermaid (finalize + raise-issues); note the cross-activity retrospective-log capture |

### Added

| File | Purpose |
|------|---------|
| `techniques/conduct-retrospective/record.md` | Create-or-append the retrospective log for the current activity/context; exception-only (no null rows). Inputs: `activity_context`, `retrospective_log?`. Output: `retrospective_log` (`retrospective-log.md`) |
| `techniques/conduct-retrospective/finalize.md` | Read the completed log, write the wrap-up, set `has_retrospective_items`. Input: `retrospective_log`. Output: `has_retrospective_items` |
| `techniques/conduct-retrospective/raise-issues.md` | Raise **one aggregate** GitHub issue against the workflow-server repo listing the logged items; record the issue link back into the log. Input: `retrospective_log`. Output: `retrospective_issue` |
| `retrospective-log.md` (runtime artifact) | Standalone incremental log in the planning folder (parallels `assumptions-log.md`); committed as a planning artifact |

### Unaffected

`techniques/conduct-retrospective/select-next.md` (unchanged); all other activities' *step lists* are unchanged — the per-activity capture is driven by a workflow-level `activity` rule, not per-activity steps (design decision D1). Every other technique, resource, and activity is untouched.

## Integrity Checks

- **Transition chains** — INTACT. No activity is added, removed, or reordered; 14-complete remains terminal. Adding steps *within* activities 01 and 14 does not alter any `transitions[]`.
- **Technique references** — `conduct-retrospective::retrospective` (referenced only at `14-complete.yaml:73`) is replaced in the same edit → no orphaned reference. `conduct-retrospective::select-next` (`14-complete.yaml:84`) unchanged. New refs (`record`, `finalize`, `raise-issues`) all resolve to added files.
- **Resource references** — `workflow-retrospective` resource is referenced by conduct-retrospective TECHNIQUE.md, complete-wp.md (L60), resources/README.md (L27); all updated in this change. Resource **id kept** (`workflow-retrospective`) to avoid ref churn (convention-over-invention). No orphaned resource refs.

## Removals flagged (require explicit approval — non-destructive-update rule)

| # | Removed / replaced | Where | Justification | Loss? |
|---|--------------------|-------|---------------|-------|
| R1 | `retrospective.md` op — the end-of-run **session-history reconstruction** protocol ("count total user messages; separate prompted from substantive…") | `techniques/conduct-retrospective/retrospective.md` | Superseded by in-the-moment capture (`record`). The **signal-analysis methodology and taxonomy are preserved** — relocated to `workflow-retrospective.md` + the `record` op | No methodology lost; capture *timing* changes |
| R2 | Inline `## Workflow Retrospective` **content** in `COMPLETE.md` | `resources/complete-wp.md` L58–60 | Retrospective content now lives in standalone `retrospective-log.md`; COMPLETE.md links to it | No lessons lost — relocated |
| R3 | The `conduct-retrospective` (retrospective op) **step** | `activities/14-complete.yaml` L71–73 | Replaced by `finalize-retrospective` + `raise-retrospective-issues` + `create-retrospective-issue` | Behavior extended, not lost |

## Downstream / out-of-scope impacts (flagged, not changed here)

- **Server test baselines** — the workflow-server test suite includes deterministic-walk / definition-lint guards over the workflow corpus. Adding steps to activities 01 & 14 and a workflow variable will likely require **regenerating server e2e snapshots/baselines** after the workflows-repo change merges. This is a server-repo follow-up, outside the workflows-repo change; flagged for the user.
- **workflow-design's own retrospective activity** — a follow-up candidate for the same incremental pattern (design decision D3: out of scope here).
