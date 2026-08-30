# Impact Analysis — Rule and checkpoint fragments: a shared home

**Workflow:** `work-package` v4.0.0
**Mode:** Update
**Date:** 2026-08-30
**Change source:** [Change brief](01-change-brief.md)
**Baseline:** [`origin/workflows` @ bc52c69](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) — the corpus tip after [#522](https://github.com/m2ux/workflow-server/pull/522) merged.

---

## Summary

With the construct question carried to [#520](https://github.com/m2ux/workflow-server/issues/520) per the [change brief](01-change-brief.md), this is one additive corpus edit and the guard walk that makes it checkable: six variable declarations on `remediate-vuln`, and an `undeclared-effect-variable` check that reaches activities a workflow borrows by path. No workflow topology moves, no activity is added or removed, and no checkpoint body relocates. Transitions, references and variables are intact at the baseline; the single live defect the run addresses is a variable-declaration gap the existing guard cannot see.

**Removals inventoried:** 0

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `remediate-vuln/workflow.yaml` | Declares the effect and read variables the four borrowed work-package activities' gates use: `has_open_assumptions`, `needs_individual_interview`, `has_deferred_assumptions`, `assumption_review_presentation`, `open_assumptions`, `current_assumption` |
| `scripts/check-fragments.ts` | The `undeclared-effect-variable` walk reaches activities a workflow borrows by path, not only those under its own `activities/` directory. Outside `{target_path}`; a server-repo change |

### Possibly touched at draft time

| File | Why |
|------|-----|
| `workflow-authoring/techniques/workflow-definition/audit-schema-validation.md` | Names `check-fragments.ts` and the checks it runs; the line needs a look once the walk widens, though widening an existing check's reach leaves its wording accurate |

`work-package/workflow.yaml`, the four activity files holding the seven `ref` sites, `schemas/workflow.schema.json` and `src/loaders/fragment-resolver.ts` are the migration surface of [#520](https://github.com/m2ux/workflow-server/issues/520) and are untouched here. They are named so a reader knows the omission is a boundary rather than an oversight.

### Unaffected

`work-package` carries 15 activity files, 115 technique files, 37 resource files, a 223-line `workflow.yaml` and a README, and none of them is edited by this run. Every other workflow in the corpus is unaffected: after #522 no workflow other than `work-package` declares a fragment, and no workflow other than `work-package` references one.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity is added, removed or reordered, so `work-package`'s graph and `initialActivity` are untouched, and `remediate-vuln`'s graph keeps binding the same borrowed activity ids |
| Technique and resource references | Pass — `check-fragments.ts` reports `every ref resolves, every fragment is used, no inline duplicates` against the baseline corpus, and the run adds no new reference |
| Variables, checkpoint effects, step gates | Fail — `remediate-vuln` borrows `04-research`, `05-implementation-analysis`, `07-assumptions-review` and `08-implement`, whose gates write `has_deferred_assumptions` and `needs_individual_interview` and read `has_open_assumptions`, `assumption_review_presentation`, `open_assumptions` and `current_assumption`, none of which it declares. It declares `is_review_mode` and `assumption_outcome` only. The `undeclared-effect-variable` check does not reach this because it walks each workflow's own `activities/` directory and `remediate-vuln` has none |

---

## 3. Removals inventory

Nothing is removed. The change adds six variable declarations and widens a guard walk. Deleting the two shared checkpoint bodies is #520's removal, inventoried by the run that performs it.

---

## Change constraints

**Co-change set** — files that move together for the change to stay coherent:

- `remediate-vuln/workflow.yaml` and `scripts/check-fragments.ts` land together. Widening the walk without adding the declarations turns a silent gap into a red guard; adding the declarations without widening the walk leaves the next borrowing workflow to reproduce the gap.
- The two live on opposite sides of the corpus boundary: `remediate-vuln/workflow.yaml` is under `{target_path}` on the `workflows` branch, `scripts/check-fragments.ts` is in the server repo on `main`. They need two pull requests, and the corpus one is red until the server one merges.

**Identifier-collision set** — names already taken in the target:

- Fragment names in `work-package`: `assumption-interview`, `assumption-decision`.
- Checkpoint step ids referencing them: `research-assumption-interview`, `research-assumption-decision#{current_assumption.id}`, `residual-assumption-batch`, and the sites in `05-implementation-analysis` and `08-implement`.
- Loop ids `assumption-interview` in `04-research` and `assumption-interview-loop` in `07-assumptions-review`. The loop in `04-research` already shares its id with the fragment it neighbours, so any new identifier derived from the fragment name collides there.
- Guard finding ids already in use: `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`, `inline-duplicate-of-fragment`, `duplicate-rule`, `duplicate-checkpoint`, `undeclared-effect-variable`.

**Environment constraint** — the library checkout at `/home/mike1/projects/dev/workflow-server/workflows` sits at `09b6067`, behind `origin/workflows` at `bc52c69` by the #522 merge. Any worktree a later activity cuts branches from the fetched `origin/workflows` tip, not from the local ref, or the run reinstates the seven rule fragments #522 deleted.

---

## Decision ask

Confirm the impact scope. Nothing is removed, so there is no removals approval to give.
