# Impact Analysis — Rule and checkpoint fragments: a shared home

**Workflow:** `work-package` v4.0.0
**Mode:** Update
**Date:** 2026-08-30
**Change source:** [Change brief](01-change-brief.md)
**Baseline:** [`origin/workflows` @ bc52c69](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) — the corpus tip after [#522](https://github.com/m2ux/workflow-server/pull/522) merged.

---

## Summary

With the construct question carried to [#520](https://github.com/m2ux/workflow-server/issues/520) per the [change brief](01-change-brief.md), no file changes. Every integrity check passes at the baseline, and the one defect this run opened against — a variable-declaration gap in `remediate-vuln` — does not exist: the declarations are contributed by the borrowed activities under the activity-variable contract. No workflow topology moves, no activity is added or removed, and no checkpoint body relocates.

**Removals inventoried:** 0

---

## 1. Impact classification

### Directly modified

None.

### Possibly touched at draft time

None. `work-package/workflow.yaml`, the four activity files holding the seven `ref` sites, `schemas/workflow.schema.json` and `src/loaders/fragment-resolver.ts` are the migration surface of [#520](https://github.com/m2ux/workflow-server/issues/520). `remediate-vuln/workflow.yaml` and `scripts/check-fragments.ts` were candidates until the variable check was measured. All six are named so a reader knows the omission is a boundary rather than an oversight.

### Unaffected

`work-package` carries 15 activity files, 115 technique files, 37 resource files, a 223-line `workflow.yaml` and a README, and none of them is edited by this run. Every other workflow in the corpus is unaffected: after #522 no workflow other than `work-package` declares a fragment, and no workflow other than `work-package` references one.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity is added, removed or reordered |
| Technique and resource references | Pass — `check-fragments.ts` reports `fragments: OK` against the baseline |
| Variables, checkpoint effects, step gates | Pass — every variable the borrowed gates touch resolves |

The third verdict is the one this run opened against. `remediate-vuln` borrows the four activities carrying a checkpoint `ref`, whose gates read `is_review_mode`, `has_open_assumptions`, `assumption_review_presentation`, `open_assumptions` and `current_assumption`, and write `assumption_outcome`, `has_deferred_assumptions` and `needs_individual_interview`. Resolving the workflow returns 118 declarations covering all eight. The borrowed activities declare the five interview variables on themselves, and an included activity's `variables.writes` are contributed to every workflow whose graph includes it.

---

## 3. Removals inventory

Nothing is removed, and nothing is added. Deleting the two shared checkpoint bodies is #520's removal, inventoried by the run that performs it.

---

## Change constraints

**Co-change set** — empty. No file moves, so nothing has to move with it.

**Identifier-collision set** — names already taken in the target:

- Fragment names in `work-package`: `assumption-interview`, `assumption-decision`.
- Checkpoint step ids referencing them: `research-assumption-interview`, `research-assumption-decision#{current_assumption.id}`, `residual-assumption-batch`, and the sites in `05-implementation-analysis` and `08-implement`.
- Loop ids `assumption-interview` in `04-research` and `assumption-interview-loop` in `07-assumptions-review`. The loop in `04-research` already shares its id with the fragment it neighbours, so any new identifier derived from the fragment name collides there.
- Guard finding ids already in use: `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`, `inline-duplicate-of-fragment`, `duplicate-rule`, `duplicate-checkpoint`, `undeclared-effect-variable`.

**Environment constraint** — the library checkout at `/home/mike1/projects/dev/workflow-server/workflows` sits at `09b6067`, behind `origin/workflows` at `bc52c69` by the #522 merge. A worktree branches from the fetched `origin/workflows` tip, not from the local ref, or the run reinstates the seven rule fragments #522 deleted. This run's worktree is at `bc52c69` and satisfies it.

---

## Decision ask

Confirm the impact scope. No file is modified and nothing is removed, so there is no removals approval to give.
