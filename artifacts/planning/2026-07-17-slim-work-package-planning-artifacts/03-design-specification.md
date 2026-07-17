# Design Specification — Slim work-package planning artifacts

**Workflow:** `work-package` v3.31.0
**Mode:** Update
**Date:** 2026-07-17
**Change categories:** Technique + Resource + Activity (checkpoint messages)
**Change request:** Slim work-package planning artifacts and gate messages (Output Economy / PR #254 shape); keep topology intact
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)

---

## Purpose

Keep work-package's existing outcome unchanged: guide a work package from problem framing through submitted, reviewed change. This update makes checkpoint-linked planning artifacts and the gate messages that point at them cognitively light.

| Goal | Meaning |
|------|---------|
| No redundancy | One home per fact; README/messages link, don't restate |
| Salient only | Content answers the gate in front of the reader |
| Plain language | Short sentences; minimal process jargon |
| Succinct tables | Dense rows; drop filler columns and narrative dumps |

**Baseline finding:** `work-package`'s persist techniques already carry a global Output Economy backbone (`manage-artifacts` rules: `single-source-and-link`, `canonical-home-map`, `exception-only-reporting`, `state-once-per-artifact`, `lean-header`, `omit-null-sections`) — leaner than workflow-design's pre-PR#254 baseline. The gap is narrower: a few verbose checkpoint messages/option descriptions, and no checkpoint currently renders an artifact as a clickable link (most artifact outputs — `research_document`, `analysis_document`, `plan_document`, `assumptions_log`, `strategic_review_doc`, `completion_document` — aren't declared workflow variables, so nothing exists to interpolate).

**Out of scope:** New activities; mode/transition redesign; adding new `*_path` workflow variables to wire up links for artifacts that don't already have one (bigger than a message-only change — deferred, see Rules).

---

## Activity list

**No activities added, removed, or reordered — 15 activities unchanged.** Exception-only: activities with an actual touch point below; all others are unaffected.

| Activity | Role in this update |
|----------|---------------------|
| `design-philosophy` (02) | Shorten `proceed-with-gaps` checkpoint description |
| `research` (04) | Shorten `research-converged` checkpoint message (drop restated sentence) |
| `post-impl-review` (10) | Link `{change_block_index}` in `file-index-table` message; shorten `rationale-confirmed-with-issues` description |
| `submit-for-review` (13) | Link `{provenance_log_path}` and trim the DCO certify list in `dco-sign-off-confirmation` |
| `implementation-analysis` / `plan-prepare` / `strategic-review` / `finalize-documentation` (05/06/12/14) | Audit only — persist protocols already conform; edit only if impact analysis finds drift |

---

## Checkpoints

**No checkpoints added or removed; no options, effects, or routing change.** Message/description text only:

| Gate family | Change |
|-------------|--------|
| `file-index-table` (post-impl-review) | Render `{change_block_index}` as `[change block index]({change_block_index})`; drop the parenthetical restating where corrections are recorded |
| `dco-sign-off-confirmation` (submit-for-review) | Render `{provenance_log_path}` as a link; collapse the context bullets + 6-item certify list to the load-bearing items |
| `research-converged` (research) | Keep the candidate count and question; drop the sentence restating what "converged" already means |
| `proceed-with-gaps` description (design-philosophy) | One clause instead of two |

Acceptance: each edited gate is answerable from its own message in one short read, with a working link wherever a path variable already exists.

---

## Artifacts

Content contracts live on persist techniques; audit and tighten only where they've drifted from the existing `manage-artifacts` rules.

| Artifact / surface | Target shape |
|--------------------|--------------|
| `implementation-analysis.md`, `kb-research.md`, `work-package-plan.md`, `design-philosophy.md`, `strategic-review-{n}.md`, `COMPLETE.md` | Already conform to `canonical-home-map` + `exception-only-reporting`; impact analysis confirms, edits only on drift |
| Checkpoint artifact links | Link only where a path-valued variable already exists (`change_block_index`, `provenance_log_path`); no new `*_path` variables in this change |
| This session's own planning artifacts | Same lean style as `workflow-design`'s precedent session — short specs, dense tables, no sprawl |

**Technique audit list (secondary, confirm-only):** `implementation-analysis/document`, `research/document`, `review-assumptions/collect|record`, `strategic-review/document-findings`, `plan-prepare/plan`, `design-philosophy/document`, `finalize-documentation/create-complete-doc`.

---

## Rules

| Rule / principle | Application |
|------------------|-------------|
| Output Economy | Already the backbone via `manage-artifacts` rules; this change tightens conformance, doesn't introduce it |
| `link-named-artifacts` | Applied only where a path variable already exists — resolves the finding above without adding topology |
| content-preservation | No content removed beyond restated/redundant prose; impact analysis inventories any trims |

No new workflow-level rule or `*_path` variable in this change — wiring links for the remaining artifacts is a separate, larger follow-up.

---

## Confirmation ask

Approve this specification if the touch points above (four checkpoint messages, confirm-only technique audit) match the intended scope. Needs-changes if a different checkpoint/technique set should be included, or if adding new `*_path` variables should be brought into scope now rather than deferred.
