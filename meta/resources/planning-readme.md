---
name: planning-readme
description: Canonical Template and rules for the README.md entry-point of any workflow's planning folder. Progress inventory and mode exclusions come from each workflow's readme-seed profile.
---

# Planning Folder README Guide

## Index role

The `README.md` is the entry point for a workflow's planning folder (git hosting renders it when browsing). It is an **index** — a hub of links answering "what is this work, and what is its current status?" in under two minutes. Each linked artifact is the single home of its own content; the README links to it (single-source-and-link).

This resource owns the **universal Template** and the policy around it, in three parts: the [Template](#template) plus [Rules](#rules) for the sections it lays out, [Status](#status) for the whole Progress status model, and [Matching](#matching) for how writers address rows. [create-readme](../techniques/workflow-engine/create-readme.md) seeds `README.md` from the Template, then splices Progress rows (and optional append headings) from the workflow's **readme-seed** profile; [verify-readme-conforms](../techniques/workflow-engine/verify-readme-conforms.md) drift-checks against it; [sync-progress-status](../techniques/workflow-engine/sync-progress-status.md) is the only writer of Progress Status cells.

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

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Activity or [Artifact](NN-artifact.md) | 3-8 word summary | 15-30m | ⬚ |

**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A

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

Tracks workflow **activities** (primary) and their planning artifacts (siblings owned by the same activity).

- Columns: **`#`** (monotonic row index: 1, 2, 3, … — display/reading order only), then Item, Description, Estimate, Status. Five columns. The activity that owns each row is **not** a column: this is a reader-facing table, and which activity produced a row is bookkeeping the reader never needs. Writers get it from the [row-ownership map](#row-ownership-map) instead.
- **Every activity** in the workflow gets at least one Progress row, including activities that produce no new planning artifact (plain milestone row: Implementation, Assumptions review, Validation, Submit for review, etc.).
- When an activity produces artifacts, add artifact link rows for it. Pattern: optional activity milestone row plus artifact siblings, or let the first artifact row stand for the activity — apply one pattern consistently per workflow seed. Minimum bar: every activity owns at least one row.
- **Seed the optional paths too**, including rows the current mode excludes. Undecided optional-path rows start pending; rows already out of scope for this run start cancelled/N/A (e.g. review-only artifacts in an implement seed, create-only activities when `is_review_mode`) so the exclusion is visible immediately rather than indistinguishable from work still in contention. A later path skip writes the same cancelled/N/A — [Status vocabulary](#status-vocabulary) covers both.
- Estimate: expected agentic time — adjust template defaults to the work's complexity. The column holds that forecast for the life of the table; what the work cost lives in the run's usage record.
- **An agent-audience artifact gets no row.** The table is read by a person, and an artifact whose declaration names an agent as its reader is not one they open. The activity that produces it still owns a row, so the work stays visible without linking a file nobody reads.
- Distinct from the header-line `**Status:**` lifecycle field (Planning/Drafting/…), which remains text and is **not** mutated by Progress Status writers — lifecycle updates stay with [commit-and-persist](../techniques/workflow-engine/commit-and-persist.md).

#### Item cell

The Item cell is the row's label and its only link slot.

- **Human name only.** `Close-out`, not `Close-out (COMPLETE.md)`. The filename is what the link points at, so a reader never needs it as text, and a label carrying it has to be edited whenever the file is renamed.
- **Linked whenever the row's activity produced or amended a file.** That holds for artifact rows and for milestone rows alike: an activity that wrote or updated a file links the Item cell to it. A row that produced nothing stays plain text.
- **An artifact link targets the minted filename** — the owning activity's prefix, a hyphen, then the technique-declared bare filename (prefix `06` plus `test-plan.md` gives `[Test plan](06-test-plan.md)`). That is the name write-artifact creates, so a seeded link resolves on arrival rather than 404ing until someone hand-corrects it; write-artifact keeps that first prefix sticky on later updates. A cross-activity register that any activity may mint has no owning activity and so no prefix: link it bare, and map its row to the activity that most often writes it first.
- **Seeded links are provisional.** A seed pre-links every row to the file it *would* produce, so a row whose activity never ran points at a file that does not exist. [Status transition policy](#status-transition-policy) owns what a write does about that.

#### Description cell

A 3-8 word summary of what the row covers, in plain text. **No hyperlinks** — the Item cell is the row's link slot, and a second link in the same row splits a reader's attention between two targets for one item.

#### Row-ownership map

Which activity owns which Progress rows. This is the anchor Progress writers select on, and it is its own declaration in the workflow's **readme-seed profile** — a `## Row ownership` table keyed by activity `artifactPrefix` (two-digit, from the activity filename — `08` from `08-implement.yaml`), whose values are the Item labels that activity owns.

Keeping it separate from the Progress inventory is what lets the inventory rows be the rendered rows: [create-readme](../techniques/workflow-engine/create-readme.md) splices them as authored, with no column to add or remove on the way through. A seed that carried ownership as a sixth inventory column would need every consumer to strip it.

Key a run of rows under `—` when they are truly not activity-scoped.

A row absent from the map is unselectable — a writer cannot resolve which activity owns it, so its status never advances. Every inventory row therefore appears in the map.

### Links table

Holds external references — tracker issue, parent epic, PR. Artifact links belong in the Progress table.

## Status

The whole status model: what each value means, how it renders, which writes are legal, and when writers fire.

### Status vocabulary

Canonical Progress Status values — the single home for each status's meaning and icon glyph. Everything below cites this table; nothing invents a glyph or meaning outside it.

| Status | Icon | Meaning |
|--------|------|---------|
| pending | `⬚` | Not started; still in contention (including undecided optional-path rows) |
| in progress | `🟡` | Work underway on this row's deliverable |
| complete | `✅` | The row's deliverable exists |
| blocked | `❌` | Work blocked |
| cancelled / N/A | `⊘` | Dropped with nothing delivered — cancelled, excluded, or not applicable (covers both seed-time mode exclusion and a later path skip) |

Status cells are **icon only** — never words such as Pending, Complete, or N/A in the cell. Every glyph is a full-colour emoji, so the row a reader most needs to find is as visible as the rest: an outline glyph beside full-colour siblings is the hardest cell to spot on a dark background, which inverts the attention the in-progress status exists for.

**Status tracks the deliverable, not the producer.** The question a Progress row answers is whether its deliverable exists, not whether the activity expected to produce it ran. So a step that was skipped whose content landed somewhere else is **complete**, with the Item cell linked where the content actually landed; and cancelled/N/A means nothing was delivered anywhere. Cancelled-with-a-link contradicts itself — it tells a reader both that the item was dropped and that here is the thing it produced.

### Icon key

Place an icon key **underneath** the Progress table (not in the Status column) rendering [Status vocabulary](#status-vocabulary) for readers, and add it when missing:

`**Status:** ⬚ pending · 🟡 in progress · ✅ complete · ❌ blocked · ⊘ cancelled / N/A`

### Status transition policy

Which Progress Status values may overwrite which, and what each write does to the row's Item link. [sync-progress-status](../techniques/workflow-engine/sync-progress-status.md) Applies this policy; it does not redefine it.

For each candidate row (selected per [Matching](#matching)), given `{target_status}` and current status-field value:

| `{target_status}` | May write when current Status is… | Must not overwrite… |
|-------------------|-----------------------------------|---------------------|
| in progress (`🟡`) | pending (`⬚`) only | cancelled/N/A (`⊘`), complete (`✅`), blocked (`❌`), existing in progress |
| complete (`✅`) | pending, in progress, and (when overwrite-N/A allowed) cancelled/N/A | Unrelated rows outside the candidate set |
| blocked (`❌`) | Any in-scope status except cancelled/N/A (unless overwrite-N/A allowed) | cancelled/N/A by default |
| cancelled / N/A (`⊘`) | Any candidate whose deliverable does not exist anywhere | A candidate whose content landed elsewhere — that is a complete write with a repointed link |
| pending (`⬚`) | Re-open only when not cancelled/N/A (and typically not complete unless intentionally resetting) | cancelled/N/A unless overwrite-N/A allowed |

**Overwrite-N/A (`allow_overwrite_na`):** when false (default for targets pending, in progress, blocked), never write onto a cell that is currently cancelled/N/A. When true (default for targets complete and explicit cancelled/N/A writes), a complete or cancel write may replace cancelled/N/A on the candidate set — e.g. an activity that actually ran may clear a mistaken seed exclusion on its own rows.

**Preserve unrelated N/A:** rows outside the candidate set are untouched, including unrelated cancelled/N/A cells. Optional-path rows stay pending until path selection.

**Item link follows the status.** Because seeded links are provisional ([Item cell](#item-cell)), each write reconciles the link with what the status now asserts:

| Write | Item link |
|-------|-----------|
| cancelled / N/A | Stripped to plain text — the seeded file was never created. The label stays. |
| complete, deliverable at the seeded target | Left as seeded. |
| complete, deliverable landed elsewhere | Repointed at the artifact that actually holds it. |

A re-opened row that later gets its artifact written has the link restored by that complete write.

### Progress Status call sites

The moments a Progress status write comes from, and the `{target_status}` each one carries. A caller resolves its moment here and takes that row's status.

| Moment | `{target_status}` |
|--------|-------------------|
| About to dispatch an activity | in progress (`🟡`) |
| `activity_complete` (default) | complete (`✅`) |
| `activity_complete` with `{mark_progress_na}` | cancelled / N/A (`⊘`) |
| Worker or orchestrator signals blocked | blocked (`❌`) |
| Path skip / cancel / mark N/A | cancelled / N/A (`⊘`) |

An activity that cannot produce a meaningful Progress complete sets `{mark_progress_na}` — that is what routes it to the cancelled/N/A row in [Status vocabulary](#status-vocabulary), rather than inventing a user-reported hand-off to claim completion with.

## Matching

How Progress writers select rows and which cells they may change. Techniques cite this section; they do not restate column glyphs or geometry.

- **Select** rows by resolving `{artifact_prefix}` through the [row-ownership map](#row-ownership-map) to that activity's Item labels, then matching those labels against the table's **item field**. Several rows may belong to one activity; every one is a candidate.
- **Do not select** by the **row-index field** (table header currently `#`) — that field is display-only reading order, and it renumbers whenever the seed inventory changes.
- When `{item_match}` is bound, **further restrict** to rows whose **item field** contains that match.
- **Mutate the status field** on every selected row, and the item field's link as [Status transition policy](#status-transition-policy) directs. Leave the row-index, description, and estimate cells, and the item **label**, unchanged.
- Selection and mutation address **fields**, not positions: renaming or reordering columns that preserve the same fields must not require technique Protocol edits. Headers, column order, section chrome, and icon-key placement are layout, owned by [Progress table](#progress-table) and [Icon key](#icon-key).
