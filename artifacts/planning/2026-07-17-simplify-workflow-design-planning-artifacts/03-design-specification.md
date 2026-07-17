# Design Specification — slim workflow-design planning artifacts

**Workflow:** `workflow-design` v1.24.1  
**Mode:** Update  
**Date:** 2026-07-17  
**Change categories:** Technique; Resource; Activity (checkpoint-linked surfaces)  
**Change request:** Slim planning artifacts for frictionless checkpoint decisions — no redundancy, salient facts, plain language, succinct tables  
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)

---

## Purpose

Keep the existing purpose of Workflow Design: create, update, or review a workflow definition through structured activities and human checkpoints.

This update does **not** change that outcome, add stages, or alter create/update/review routing. It makes **planning artifacts that checkpoints link** cognitively light so a person can decide from salient facts only.

| Goal | Meaning |
|------|---------|
| No redundancy | One home per fact; README and other surfaces link, not restate |
| Salient only | Content answers the gate in front of the reader |
| Plain language | Short sentences; no process jargon beyond needed ids |
| Succinct tables | Dense rows; drop filler columns and narrative dumps |

**Out of scope:** New activities; mode/transition redesign; library-wide rollout beyond `workflow-design`; changing server artifact numbering.

---

## Activity list

**No activities added, removed, or reordered.** Same 9 activities and mode branches.

| Activity | Role in this update |
|----------|---------------------|
| `intake-and-context` | Tighten inventory / conventions / constructs persist guidance; keep literacy gates |
| `requirements-refinement` | Spec and assumptions stay decision surfaces, not encyclopedias |
| `pattern-analysis` | Leaner comparison artifact (create path) |
| `impact-analysis` | Decision-facing impact report (not full-file essays) |
| `scope-and-draft` | Lean scope manifest + drafting/review notes |
| `quality-review` | Fewer / clearer artifact links at gates; lean finding dumps |
| `validate-and-commit` | Unchanged flow; keep linked attestations short |
| `post-update-review` | Same lean report contract as other audits |
| `retrospective` | Close-out stays single terminal doc |

---

## Checkpoints

**No checkpoints added or removed.** Keep statements, options, and effects. Adjust only user-facing surfaces that overwhelm:

| Gate family | Change |
|-------------|--------|
| Intake literacy / change confirm | Prefer one primary link + short subject; avoid stacking peer artifacts that repeat the same facts |
| Spec / impact / scope / draft | One canonical artifact per decision; optional second link only when the gate truly needs both |
| Quality-review multi-link messages | Point at the rolled-up report (or verified findings) as primary; satellite finding files stay agent/detail homes, linked from the report — not every gate |

Acceptance: a reader can answer each blocking checkpoint from the linked artifact(s) in a short read without hunting duplicate sections.

---

## Artifacts

Content contracts live on persist techniques and templates. Edit those so writers emit lean decision surfaces.

| Artifact / surface | Target shape |
|--------------------|--------------|
| Planning README (`design-context-readme`) | Index: summary + links. Design Decisions / Scope / Findings = short pointers, not full restatements |
| `structural-inventory` | Counts + activity list + one-line update scope (as today when lean) |
| `format-conventions` / `applicable-constructs` | Short tables; only what this change needs |
| `design-specification` | Purpose + dimension deltas only (this file’s shape is the model) |
| `assumptions-log` | Log table + open items; no prose duplicate of the table |
| `impact-analysis` | Classification summary + integrity verdicts + removals inventory; skip per-file essays for unaffected files |
| `scope-manifest` | File table + minimal structural/drafting sections; no pattern essay |
| `drafting-plan` / `file-review-note` / `draft-attestation` | Per-file delta and attestation only |
| Audit / compliance reports | Finding tables with severity; detail in satellite files when needed |
| `COMPLETE.md` | Close-out per template; link decisions elsewhere |

**Technique touch list (primary):** `context-loading`, `persist-design-specification`, `impact-analysis`, `scope-definition`, `pattern-analysis`, `persist-report`, audit persist steps, `create-completion-doc` / related resources. Protocols should say *what decision facts to write*, not *dump everything surveyed*.

---

## Rules

| Rule / principle | Application |
|------------------|-------------|
| Output Economy (design-principles §11) | Explicit write-time constraint for planning artifacts and checkpoint links |
| Single source / link-named-artifacts | README and messages link; do not restate |
| Description Hygiene / anti-patterns | Plain, affirmative, no next-step narration in gates |
| content-preservation | Slimming content is intentional reduction — inventory removals in impact analysis |

No new workflow-level rule slug required unless drafting finds Output Economy insufficiently discoverable from resources alone; prefer strengthening resource + technique protocol text first.

---

## Confirmation ask

Approve this specification if the update dimension set above matches the intended change. Needs-changes if activity boundaries, checkpoint set, or artifact homes should differ before impact analysis.
