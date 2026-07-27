# Impact Analysis — Pass B Binding Fidelity

**Workflow:** `work-package` v3.35.3
**Mode:** Update
**Date:** 2026-07-27
**Change source:** [design specification](03-design-specification.md)
**Baseline:** [structural inventory](01-structural-inventory.md)

> Measured on the branch worktree `/home/mike1/projects/work/workflows/2026-07-09-workflow-design-doc-voice` at tip `ab5388a5`, not the served catalog ([D-3](01-deferred-items.md)). Drift attribution is against `origin/workflows`.

---

## Summary

Content-only change across markdown prose and one YAML description — no activity, step, checkpoint, or transition is added, removed, or reordered, so workflow topology is untouched and every integrity check passes. A tree-wide sweep of the three affected symbols found **no occurrence outside the files below**, which bounds the edit exactly.

One scope delta against the specification: closing G-2 makes a fourth file stale — `workflow.yaml:341`, whose `artifact_publish_ref` description restates the fallback semantics G-2 changes. The specification's confirmation ask scopes "two technique files and one resource file"; the honest surface is **four files**. See [§ 2](#2-integrity-checks) row 4 for a second finding that constrains drafting.

**removal_count:** 3

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `work-package/techniques/review-summary.md` | Carries 6 of the 8 drifts: 4 `{ARTIFACT_PUBLISH_REF}` reads (`:55` ×2, `:62`, `:63`), the orphan `reference_path` input (`:36`–`:38`), and the `{ENG_REPO_OWNER}` / `{ENG_REPO_NAME}` reads (`:38`). G-1, G-2, G-3. |
| `work-package/techniques/publish-review-artifacts.md` | Orphan `reference_path` input (`:16`–`:18`) plus its two git reads (`:29`, `:31`) re-targeted at the engineering checkout; output description (`:24`) states the fallback. G-2. |
| `work-package/resources/review-mode.md` | The `(reference_path)` caller-symbol parenthetical at `:42`. G-4. Its URL template at `:39` is deliberately **not** touched — the slots stay resource-resident. |

### Indirectly affected (side-effect — outside the specification's stated surface)

| File | Why |
|------|-----|
| `work-package/workflow.yaml` | `:341` declares `artifact_publish_ref` as "commit SHA … or **current parent branch**" — the exact fallback G-2 re-targets at the engineering checkout. Stale under **all three** A-10 arms, so the edit is arm-independent. Pass B's own addition (absent from the baseline `workflow.yaml`), and `workflow.yaml` is already in this branch's changed set, so this corrects Pass B rather than widening the branch. One-line description edit; the variable's `name`, `type`, and `defaultValue` are untouched. |

### Unaffected (summary)

157 of the 161 files in the tree. No activity YAML changes ([A-7](03-assumptions-log.md)); the 15 activity files, 44 checkpoints, 27 transitions, 91 other technique leaves, 17 container `TECHNIQUE.md` files, and 30 other resources are all untouched. `src/` and `schemas/` are out of scope by specification.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | **Pass** — no activity added, removed, or reordered; `submit-for-review`'s 29 steps and its 3 transitions (two to `complete`, one back to `plan-prepare`) are unchanged, every `to:` resolves, and `initialActivity: start-work-package` is untouched. Nothing becomes unreachable because no incoming edge is altered. |
| Technique / resource references | **Pass** — all three bind sites in `activities/13-submit-for-review.yaml` need no edit (`generate-review-summary:22` and `publish-review-artifacts:95` are bare-string; `refresh-review-summary-links:109` deviates only on `artifact_publish_ref`), and no markdown link anywhere targets either technique file. The `#header-fields` anchor G-3 cites exists (`review-mode.md:30`, `###`), as do all 8 distinct `review-mode.md#…` anchors in use. |
| Variables / `setVariable` / step conditions | **Pass** — `repo_root` is declared (`workflow.yaml:75`) so it binds implicitly at both sites; `reference_path` is declared nowhere and is referenced by **no** `condition.variable`, `when`, or `setVariable` in any activity, so retiring it orphans nothing. No variable becomes unreferenced: `artifact_publish_ref` keeps its producer and its consumer. |
| **Binding collision (drafting constraint)** | **Caveat** — the [A-3](03-assumptions-log.md) protocol local must **not** be named `artifact_publish_ref`. That name is simultaneously a declared workflow variable (`workflow.yaml:339`) and `review-summary.md`'s own declared optional input (`:32`), so `{$artifact_publish_ref}` would declare a local over existing declared I/O — barred by AP-62's carve-out. It needs a distinct snake_case id, following the `{$eng_branch}` precedent at `techniques/update-pr/render.md:54`. |

Out of scope, newly found, deferred not fixed: the activity-13 mermaid diagram in `activities/README.md`, made stale by Pass B inserting three steps — [D-6](01-deferred-items.md); and this activity's own persist binding reading as a literal — [D-7](01-deferred-items.md).

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `techniques/review-summary.md:34` (`artifact_publish_ref` Inputs entry) | The fallback recipe sentence — "When not supplied, resolve from `{reference_path}`: `git -C {reference_path} branch --show-current`. Never hardcode `main`." | The entry keeps its statement of what the value *is*. The recipe relocates intact to Protocol § 2, never-hardcode-`main` constraint included, per AP-119 ([A-5](03-assumptions-log.md)) — a move, not a loss. |
| 2 | `techniques/review-summary.md:36`–`:38` (`reference_path` Inputs entry) | The orphan input id, and its `{ENG_REPO_OWNER}` / `{ENG_REPO_NAME}` mentions. | The input itself survives as `repo_root` ([A-1](03-assumptions-log.md)); both slot names keep their sole home in `resources/review-mode.md#header-fields`, which the rewritten entry cites instead of naming them ([A-4](03-assumptions-log.md)). Nothing is deleted without a surviving home. |
| 3 | `resources/review-mode.md:42` | The `(reference_path)` caller-symbol parenthetical. | The resolve-from-parent-remote instruction, both slot names, and the never-hardcode-`main` constraint all stay; only the caller's symbol name drops, per AP-46 ([A-6](03-assumptions-log.md)). |

Not counted as removals: the four `{ARTIFACT_PUBLISH_REF}` → local substitutions and the `{reference_path}` → `{$eng_git_dir}` re-targets are net-additive rewrites with no content dropped; `workflow.yaml:341` is a one-line restatement corrected in place.

---

## Decision ask

Confirm impact scope and the three intentional removals — or revise / preserve. Note the scope delta: this analysis finds the change surface is **four** files, not the three the specification's confirmation ask states.
