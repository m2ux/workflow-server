# Design Specification — Planning Retrospective Findings

**Workflow:** `workflow-design` v1.28.0 (primary) · `work-package` v3.33.0 (secondary)
**Mode:** Update (multi-target)
**Date:** 2026-07-21
**Change categories:** activity, technique, resource, structural-refactor
**Change request:** Fix the recurring process defects surfaced across the last 10 planning folders in `workflow-design` and `work-package`.
**Baseline:** [structural-inventory.md](structural-inventory.md#update-scope)

---

## Purpose

Ten completed planning sessions surfaced the same handful of process defects rather than ten unrelated one-off problems. This change updates both workflows so those defects stop recurring: a technique reference that a worker cannot resolve, checkpoints that get the same default answer every time with no real decision behind them, a reviewer feedback loop that lets the agent move on before fully hearing out one item, and several authoring-style habits that keep needing manual correction after the fact. Everything each workflow currently does correctly stays as-is; this session only changes the dimensions below.

| Goal | Meaning |
|------|---------|
| Fix the `write-artifact` binding defect | Every `write-artifact` invocation currently lives in technique protocol prose, unreachable via `get_technique` unless it happens to also be a bound step of the calling activity — confirmed structurally reproducible (see below). |
| Reduce checkpoint-default over-gating | Consolidate/soft-gate checkpoints whose default option is replayed near-universally, without removing genuine decision points. |
| Enforce one-item-at-a-time review loops | `post-impl-review`'s block-interview becomes structurally loop-bound with a per-item confirm, not agent-discipline-only. |
| Formalize in-task vs. out-of-scope tracking | `follow-ups.md` (in-task) and `deferred-items.md` (out-of-scope) become named templates/techniques instead of ad hoc agent invention. |
| Bake in authoring-style corrections | MR-1..MR-4 (comment/JSDoc verbosity, no dense prose after config examples, worktree-root placeholders, no parallel runbook when SETUP covers it) land in the anti-patterns canon. |

**Out of scope:**
- No changes to MCP server source (`src/`, `schemas/`) — all fixes are workflow-content-only, per repository boundary rules.
- No new activities, removed activities, or activity reordering in either workflow (see [Activity list](#activity-list)).
- Full drafting of every fix (exact YAML/technique diffs) — this artifact confirms *what* changes; `scope-and-draft` performs the edits.

**Also see:** [assumptions log](03-assumptions-log.md) · [structural inventory](structural-inventory.md)

---

## Activity list

No activities are added, removed, or reordered in either workflow. Every retrospective finding maps onto an existing activity, workflow-level rule, technique, or resource (cross-checked against both workflows' Activities tables in [structural-inventory.md](structural-inventory.md)).

| Activity (workflow) | Role in this change |
|----------------------|----------------------|
| `requirements-refinement` (workflow-design) | Its own dimension-confirmation checkpoints are a named consolidation candidate (checkpoint-default over-gating). |
| `intake-and-context` (workflow-design) | `intake-classification`'s `write-artifact` reference is the confirmed-live repro case for the binding defect; also homes the MCP resource-read fallback note. |
| `validate-and-commit` (workflow-design) | Completed-steps manifest omission fix; binding-fidelity checks partially move earlier (to `draft-attestation` in `scope-and-draft`). |
| `post-impl-review` (work-package) | Block-interview gains structural per-block loop + confirm-before-exit. |
| `implementation-analysis` (work-package) | `analysis-confirmed` gate is a removal candidate, replaced by the autonomous gap-fill pattern already used in `codebase-comprehension`. |
| `implement` (work-package) | `switch-model-pre-impl` / `switch-model-post-impl` checkpoints are a deprecation candidate. |
| `start-work-package` (work-package) | Seeds `project_type` into the session bag. |

---

## Checkpoints

| Gate family | Change |
|-------------|--------|
| `write-artifact` references (multiple activities, both workflows) | Convert protocol-embedded references to an explicitly bound step (or step-callable operation) so `get_technique` can resolve them for disposable workers — not a checkpoint per se, but the top defect blocking clean checkpoint/technique resolution generally. |
| `block-interview` (work-package `post-impl-review`) | Wrap in a `forEach` loop over the flagged-block list with a `breakCondition` tied to an explicit per-block reviewer confirm, mirroring the same activity's existing `doWhile` loop pattern. |
| `switch-model-pre-impl` / `switch-model-post-impl` (work-package `implement`) | Deprecation candidate — **open**, batched to Gate 2 (see [assumptions log](03-assumptions-log.md)). |
| `analysis-confirmed` (work-package `implementation-analysis`) | Removal candidate in favor of an autonomous gap-fill loop + auto-proceed — **open**, batched to Gate 2. |
| Dimension-confirmation checkpoints (workflow-design `requirements-refinement`, this activity) | Named consolidation candidate for the checkpoint-default over-gating theme; no change drafted in this session beyond flagging it (self-referential finding — this activity's own `design-context`/`spec-confirmed` checkpoints are examples of the pattern). |

---

## Artifacts

| Artifact / surface | Target shape |
|---------------------|--------------|
| `follow-ups.md` / `deferred-items.md` split | Formalized as a named template pair + technique + [canonical-home map](../../workflow-design/techniques/TECHNIQUE.md#canonical-home-map) entry, replacing the currently agent-invented, unregistered convention. |
| Change-block index (work-package review artifacts) | Hyperlink each Block title to `file:line`; remove the Instructions section and the file index table. |
| `validate-and-commit`'s completed-steps manifest | Include all executed steps (e.g. `verify-commit`, `announce-completion`), not a partial list. |
| `anti-patterns.md` (workflow-design resource) | Gains MR-1..MR-4 authoring-guidance entries (comment/JSDoc verbosity, no dense prose after config examples, worktree-root placeholders, no parallel runbook when SETUP covers it) — confirmed existing canonical home for this class of guidance. |

---

## Rules

| Rule / principle | Application |
|-------------------|--------------|
| `write-artifact` must be step-resolvable | Every activity whose technique protocol invokes `write-artifact` binds it as an explicit step (proven schema-valid by `work-package/activities/15-codebase-comprehension.yaml`, which already does this), rather than only linking it from protocol prose. |
| Transition-condition authoring consistency | Content-only fix (quoting, `isDefault` vs. explicit variable conditions) in the workflow-design authoring canon — no engine/schema change, per repository boundary rules. |
| MCP resource-read fallback | Codified in `intake-and-context`'s format-literacy step so a worker without `get_resource` access has a documented fallback (the same class of gap this session hit live — see [assumptions log](03-assumptions-log.md)). |
| Plain-technical-language tightening | Protocol-bullet tails that carry rationale beyond the operative clause are trimmed per the existing `plain-technical-language` principle. |
| Manual-edit detection | `post-impl-review` gains a check for reviewer edits applied outside the agent, surfacing confirmed patterns as retrospective candidates. |
| Retrospective interview format | Runs as its own dedicated session in the same one-item-at-a-time, confirm-before-continuing shape as the block-change interview. |

---

## Confirmation ask

Approving this specification means: proceed to `pattern-analysis` → `impact-analysis` → `scope-and-draft` to draft the changes above against both `workflow-design` and `work-package`, with the three open judgements in [assumptions log](03-assumptions-log.md) (`switch-model-*` deprecation, `analysis-confirmed` removal, `project_type` seeding placement) decided at Gate 2 (`approve-to-commit`).
