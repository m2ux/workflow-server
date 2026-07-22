---
name: planning-readme
description: Canonical Template and rules for the README.md entry-point of any workflow's planning folder. Progress inventory and mode exclusions come from each workflow's readme-seed profile.
---

# Planning Folder README Guide

The `README.md` is the entry point for a workflow's planning folder (git hosting renders it when browsing). It is an **index** — a hub of links answering "what is this work, and what is its current status?" in under two minutes. Each linked artifact is the single home of its own content; the README links to it (single-source-and-link).

This resource owns the **universal Template** and structure/policy. [create-readme](../techniques/workflow-engine/create-readme.md) seeds `README.md` from [Template](#template), then splices Progress rows (and optional append headings) from the workflow's **readme-seed** profile. [verify-readme-conforms](../techniques/workflow-engine/verify-readme-conforms.md) drift-checks against this Template (plus seed-declared appends). [sync-progress-status](../techniques/workflow-engine/sync-progress-status.md) mutates Progress Status cells per the policy below.

## Template

```markdown
# [Descriptive Name] — [Month Year]

> [Classifier] · Created [YYYY-MM-DD] · **Status:** [status]

> **Note:** effort estimates are agentic (AI-assisted) development time plus separate human review time.

## 🎯 Executive Summary

[2-3 sentences explaining what this delivers and why it matters]

## Problem Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## Solution Overview

*Populated by the producing step (a `stakeholder-overview` call).*

## 📊 Progress

| # | @ | Item | Description | Estimate | Status |
|---|---|------|-------------|----------|--------|
| 1 | NN | Activity or [Artifact](artifact.md) | 3-8 word summary | 15-30m | ⬚ |

**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

## 🔗 Links

| Resource | Link |
|----------|------|
| [External reference] | [link] |
```

Progress body rows are **not** authored in this Template — the bound readme-seed profile supplies the inventory at seed time. Optional H2 sections after Solution Overview (before Progress) are declared only by that seed profile when needed; prefer Progress artifact links over README body mirrors.

## Rules

### Header line

- One blockquote line: `[Classifier] · Created [date] · **Status:** [status]`. The **classifier** is the workflow's one-word kind label (e.g. work-package type `Feature`/`Bug-Fix`/`Enhancement`/`Refactor`; workflow-design mode `Create`/`Update`/`Review`).
- State the status once, in this line (state-once-per-artifact). Outcomes live in the completion document, linked from Progress (single-source-and-link).
- When the README is updated after completion, append `· Revised YYYY-MM-DD`.
- The `Note` blockquote is retained whenever the Progress table carries an Estimate column.

### Executive Summary

2-3 sentences answering: what does this deliver, why does it matter, what's the key benefit — with the concrete problem and measurable impact where known.

### Problem Overview / Solution Overview

Plain-language sections for non-technical stakeholders, each exactly two paragraphs, written by the `stakeholder-overview` technique (heading passed as `readme_section_heading`); the placeholder is replaced when the producing step executes.

- **Problem Overview** — what the system currently does and why it's problematic, then the consequences.
- **Solution Overview** — what the change does and how it works at a high level; links the plan for the task breakdown.

### Progress table

Tracks workflow **activities** (primary) and their planning artifacts (siblings under the same `@`).

- Columns: **`#`** (monotonic row index: 1, 2, 3, … — display/reading order only), **`@`** (activity `artifactPrefix`, two-digit), then Item, Description, Estimate, Status.
- **Every activity** in the workflow gets at least one Progress row, including activities that produce no new planning artifact (plain milestone row: Implementation, Assumptions review, Validation, Submit for review, etc.).
- When an activity produces artifacts, add artifact link rows under the same `@` (prefer bare filenames, e.g. `[Test plan](test-plan.md)`). Pattern: optional activity milestone row plus artifact siblings, or let the first artifact row stand for the activity — apply one pattern consistently per workflow seed. Minimum bar: every activity's `@` appears at least once.
- The **`@`** column is the activity's server `artifactPrefix` (from the activity filename — e.g. `08` from `08-implement.yaml`), including for non-artifact milestone rows. write-artifact keeps the first prefix sticky on later artifact updates. Reserve `—` in `@` only for items that are truly not activity-scoped.
- The **`#`** column is display-only; writers match and update rows by `@` (and Item), never by `#`.
- Seed optional-path activities and artifacts too. At seed, leave undecided optional-path rows as pending ([Status vocabulary](#status-vocabulary)). When the path later skips them, set cancelled/N/A — same status as seed-time mode exclusion.
- **Seed-time exclusion** — rows excluded from the seeded mode / out of review for this run use cancelled/N/A per [Status vocabulary](#status-vocabulary) (e.g. review-only artifacts in an implement seed, or create-only activities when `is_review_mode`). Visible immediately; distinct from pending (still in contention).
- Description: 3-8 word summary. Estimate: expected agentic time — adjust template defaults to the work's complexity.
- Distinct from the header-line `**Status:**` lifecycle field (Planning/Drafting/…), which remains text and is **not** mutated by Progress Status writers — lifecycle updates stay with [commit-and-persist](../techniques/workflow-engine/commit-and-persist.md).

### Matching

How Progress writers select rows and which cells they may change. Techniques cite this section; they do not restate column glyphs or geometry.

- **Select** rows by the **activity-prefix field** (table header currently `@`) equal to `{artifact_prefix}`.
- **Do not select** by the **row-index field** (table header currently `#`) — that field is display-only reading order.
- When `{item_match}` is bound, **further restrict** to rows whose **item field** contains that match.
- **Mutate only** the **status field**. Leave row-index, activity-prefix, item, description, and estimate cells unchanged.
- Table headers, column order, section chrome (including the Progress heading), and icon-key placement are layout owned by [Progress table](#progress-table) and [Icon key](#icon-key) — renaming or reordering columns that preserve the same fields must not require technique Protocol edits.

### Status vocabulary

Canonical Progress Status values — the single home for each status’s meaning and icon glyph. [Status column](#status-column), [Icon key](#icon-key), [Status transition policy](#status-transition-policy), and [Progress Status call sites](#progress-status-call-sites) cite this section; they do not invent alternate glyphs or meanings.

| Status | Icon | Meaning |
|--------|------|---------|
| pending | `⬚` | Not started; still in contention (including undecided optional-path rows) |
| in progress | `◐` | Activity entered; work underway |
| complete | `✅` | Activity finished successfully |
| blocked | `❌` | Work blocked |
| cancelled / N/A | `⊘` | Cancelled, skipped after path choice, or excluded / not applicable (including seed-time mode exclusion) |

Status cells are **icon only** — never words such as Pending, Complete, or N/A in the cell.

### Status column

Write only icons from [Status vocabulary](#status-vocabulary). Never put status words in the Status column cell.

### Icon key

Place an icon key **underneath** the Progress table (not in the Status column) that renders [Status vocabulary](#status-vocabulary) for readers:

`**Status:** ⬚ pending · ◐ in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A`

Writers ensure this key is present when missing; they do not invent alternate keys or glyphs outside the vocabulary.

### Status transition policy

Normative rules for which Progress Status values may overwrite which. Icons and meanings are those in [Status vocabulary](#status-vocabulary). [sync-progress-status](../techniques/workflow-engine/sync-progress-status.md) Applies this policy; it does not redefine it.

For each candidate row (selected per [Matching](#matching)), given `{target_status}` and current status-field value:

| `{target_status}` | May write when current Status is… | Must not overwrite… |
|-------------------|-----------------------------------|---------------------|
| in progress (`◐`) | pending (`⬚`) only | cancelled/N/A (`⊘`), complete (`✅`), blocked (`❌`), existing in progress |
| complete (`✅`) | pending, in progress, and (when overwrite-N/A allowed) cancelled/N/A | Unrelated rows outside the candidate set |
| blocked (`❌`) | Any in-scope status except cancelled/N/A (unless overwrite-N/A allowed) | cancelled/N/A by default |
| cancelled / N/A (`⊘`) | Any candidate (path skip, mode exclusion, or explicit cancel) | — |
| pending (`⬚`) | Re-open only when not cancelled/N/A (and typically not complete unless intentionally resetting) | cancelled/N/A unless overwrite-N/A allowed |

**Overwrite-N/A (`allow_overwrite_na`):** when false (default for targets pending, in progress, blocked), never write onto a cell that is currently cancelled/N/A. When true (default for targets complete and explicit cancelled/N/A writes), a complete or cancel write may replace cancelled/N/A on the candidate set — e.g. an activity that actually ran may clear a mistaken seed exclusion on its own activity-prefix field.

**Preserve unrelated N/A:** rows whose activity-prefix field is not in the candidate set are untouched, including unrelated cancelled/N/A cells.

**Seed vs path skip:** seed-time mode exclusion and post-path skip both use cancelled/N/A (see seed bullets under [Progress table](#progress-table) and [Status vocabulary](#status-vocabulary)). Optional-path undecided rows stay pending until path selection.

### Progress Status call sites

Orchestrator guidance for when to Apply [sync-progress-status](../techniques/workflow-engine/sync-progress-status.md). `{target_status}` values are icons from [Status vocabulary](#status-vocabulary). Do not add per-activity client-workflow Status writers.

| Moment | `{target_status}` | Who Applies |
|--------|-------------------|-------------|
| About to dispatch an activity | in progress (`◐`) | Orchestrator loop / [dispatch-activity](../techniques/workflow-engine/dispatch-activity.md) preamble |
| `activity_complete` (default) | complete (`✅`) | [commit-and-persist](../techniques/workflow-engine/commit-and-persist.md) |
| `activity_complete` with `{mark_progress_na}` | cancelled / N/A (`⊘`) | [commit-and-persist](../techniques/workflow-engine/commit-and-persist.md) (e.g. validate when local suite unavailable) |
| Worker/orchestrator signals blocked | blocked (`❌`) | Orchestrator when blocked is observed |
| Path skip / cancel / mark N/A | cancelled / N/A (`⊘`) | Orchestrator when path excludes or cancels the activity |

**Writer:** only [sync-progress-status](../techniques/workflow-engine/sync-progress-status.md) mutates Progress status fields — select per [Matching](#matching), apply [Status transition policy](#status-transition-policy). Activities that cannot produce a meaningful Progress complete (e.g. validate when local validation is unavailable) set `{mark_progress_na}` so commit-and-persist Applies cancelled/N/A instead of inventing user-reported suite hand-offs.

### Links table

Holds external references — tracker issue, parent epic, PR. Artifact links belong in the Progress table.
