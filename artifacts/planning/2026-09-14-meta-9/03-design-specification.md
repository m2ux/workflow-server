# Design Specification — Requirements-Refinement README Seed

**Workflow:** `requirements-refinement` v1.5.0
**Mode:** Update
**Date:** 2026-09-14
**Change categories:** Resource, Technique, Activity
**Change request:** Canon review of `requirements-refinement`; add a planning-folder README Progress table via a readme-seed profile (defect 5); include other findings the review finds inside this workflow. Defects 1–4 (meta opening and dispatch) are out of scope.
**Baseline:** [structural inventory](01-structural-inventory.json)

---

## Purpose

The workflow still turns classified source documents into a staged requirements specification through intake, analysis, update, validation, and finalization. This session gives that run a Progress table its status writes can land on. Today the workflow has no readme-seed profile and intake never binds `create-readme`, so every Progress write selects against an empty ownership map.

A pass over the twenty definition files found that gap and its missing consumer. Statement-form gates, artifact-linked announcements, and the correction-cap routing from the July 2026 canon pass already hold. No further in-workflow defect on this surface is in the change set.

| Goal | Meaning |
|------|---------|
| G1 Seed profile | A `readme-seed` resource supplies classifier, Links defaults, Progress inventory, row ownership, and a mode-exclusion map |
| G2 Seed consumer | `intake-and-analyze` binds `workflow-engine::create-readme` after `intake-sources`, with `seed_profile: requirements-refinement/readme-seed` |
| G3 Indexes name the seed | `resources/README.md` and the workflow README Outputs/structure entries list the profile the way `plain-language` does |

**Out of scope:** Defects 1–4 (sticky repo bind, resolve-target host-root, unresolved `setVariable` templates, worker-spawned `dispatch-client-workflow`). Activity renumbering (the `02` gap). Migrating planning-folder writes onto `write-artifact`. Adding `verify-readme-conforms` (document-pipeline siblings seed without it). Local technique Protocol or I/O rewrites.

**Also see:** [assumptions log](03-assumptions-log.md) · [impact](05-impact-analysis.md) when written · [format conventions](01-format-conventions.md)

---

## Activity list

No activities added, removed, or reordered. Ids and the `02` gap stay as the baseline records them.

| Activity | Role in this change |
|----------|---------------------|
| `intake-and-analyze` | Gains a `create-readme` step after `intake-sources` so `spec_basename` is available for `entity_context`. Always runs (this workflow has no review mode that skips a planning README). |
| `update-specification` | Unchanged YAML. Owns Progress rows 03. |
| `validate-specification` | Unchanged YAML. Owns Progress rows 04. |
| `finalize-specification` | Unchanged YAML. Owns Progress rows 05. |
| `report-failure` | Unchanged YAML. Owns Progress rows 06, seeded cancelled/N/A; a run that reaches this activity may complete-overwrite those cells. |

---

## Checkpoints

No gate message, option set, or effect changes. The three existing gates stay statement-form with artifact links.

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| `resources/readme-seed.md` | New profile. Classifier kind label `Refinement`. Links: source documents `{source_paths}`, target specification `{target_doc_path}`. Progress inventory below. Row ownership keyed by activity `artifactPrefix` (`01`, `03`, `04`, `05`, `06`). Mode-exclusion map: one default arm, leave Status as authored. |
| `activities/01-intake-and-analyze.yaml` | Step `workflow-engine::create-readme` with `seed_profile: requirements-refinement/readme-seed` and `entity_context: "entity_title={spec_basename}; entity_type=Refinement; status=Planning"`. No `operation_type` bind (the seed has no mode split). |
| `resources/README.md` | Index row for the seed; keep the existing planning-artifact-to-guide map (it does not list `README.md`). |
| Workflow `README.md` | Outputs/structure mention the planning-folder README under this seed, matching `plain-language`. |

Progress inventory (five columns). Item links use the **bare filenames the techniques already write** into the planning folder (`intake.md`, not `01-intake.md`). This workflow does not mint via `write-artifact`.

| # | Item | Description | Estimate | Status |
|---|------|-------------|----------|--------|
| 1 | Intake and analyze | Classified sources and target | 15-30m | ⬚ |
| 2 | [Intake record](intake.md) | Sources, types, augment or create | 5-10m | ⬚ |
| 3 | [Analysis report](requirements-analysis.md) | Changes and source coverage | 20-40m | ⬚ |
| 4 | Update specification | Working specification for this pass | 20-40m | ⬚ |
| 5 | [Working specification](working-spec-0.md) | Protocol-preserving working copy | 15-30m | ⬚ |
| 6 | Validate specification | Conformance and coverage verdict | 15-30m | ⬚ |
| 7 | [Validation report](validation-report-0.md) | Issues and source-coverage result | 10-20m | ⬚ |
| 8 | Finalize specification | Stage for human promotion | 10-20m | ⬚ |
| 9 | [Final specification](final-spec.md) | Promotion-ready specification | 10-15m | ⬚ |
| 10 | [Change summary](change-summary.md) | Applied changes and validation status | 10-15m | ⬚ |
| 11 | Report failure | Uncorrectable stop | 10-20m | ⊘ |
| 12 | [Failure report](failure-report.md) | Critical issues and manual resolution | 10-15m | ⊘ |

Row ownership: `01` → rows 1–3; `03` → 4–5; `04` → 6–7; `05` → 8–10; `06` → 11–12. Working-spec and validation-report links name pass `0`; later passes are additional files under the same complete row.

---

## Rules

`requirements-refinement` `rules[]` is unchanged (new requirements stay `pending`; analysis is confirmed before apply). The change is bound by these authoring constraints:

| Rule / principle | Application |
|------------------|---------------|
| Structure a fix introduces owes a consumer | The seed is not a file sitting unused: intake binds `create-readme` in the same change |
| Planning-readme Item cell / row-ownership map | Inventory rows are the rendered rows; ownership is a separate table keyed by `artifactPrefix`; every inventory row appears in the map |
| Status vocabulary / preserve-seed-na | Report-failure rows start cancelled/N/A; complete may overwrite N/A when that activity runs |
| Convention Over Invention | Bind shape copied from `plain-language` intake (`seed_profile: <workflow>/readme-seed`, `entity_context` string); profile sections copied from that sibling's seed |
| Non-Destructive Updates | Five activities, six local techniques, seven existing resources, and both workflow rules stay; the `02` gap stays |
| Document in Positive Present | Workflow README and resource index describe the seeded planning folder as it is after this change |

---

## Confirmation ask

Approving this specification confirms G1–G3 as the mandate for drafting: one new seed profile, one `create-readme` bind, and the two index updates; writers keep their current bare filenames; defects 1–4 stay out of scope.
