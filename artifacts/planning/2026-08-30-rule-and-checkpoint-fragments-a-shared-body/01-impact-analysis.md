# Impact Analysis — Rule and checkpoint fragments: a shared home

**Workflow:** `work-package` v4.0.0 · **Also swept:** `remediate-vuln`
**Mode:** Update
**Date:** 2026-08-30
**Change source:** [Change brief](01-change-brief.md)
**Baseline:** [`origin/workflows` @ bc52c69](https://github.com/m2ux/workflow-server/tree/bc52c6968eb3f603d77adb03474b6bde48f2aaff) — the corpus tip after [#522](https://github.com/m2ux/workflow-server/pull/522) merged.

---

## Summary

The construct question is carried to [#520](https://github.com/m2ux/workflow-server/issues/520) per the [change brief](01-change-brief.md), and neither target's own definition files change. What remediation round 1 changes is three files of shared canon, reached from the targets and holding two pre-existing defects the criteria walk found: the Artifact Writing Register is unreachable outside `meta`, and the schema construct inventory carries no row for `fragments.checkpoints`. Both are recorded in the [findings register](09-findings-register.md).

No workflow topology moves, no activity is added or removed, and no checkpoint body relocates. The variable-declaration gap this run opened against does not exist — the declarations are contributed by the borrowed activities under the activity-variable contract.

**Removals inventoried:** 0

---

## 1. Impact classification

### Directly modified

| Path | Round | Change |
|------|-------|--------|
| `meta/techniques/agent-conduct.md` | 1 | The Artifact Writing Register citation carries the `meta/` segment, so it projects qualified under any host workflow |
| `meta/techniques/verify-artifact-conforms.md` | 1 | The same citation, in the protocol step that measures artifacts against the register |
| `workflow-design/resources/schema-construct-inventory.md` | 1 | One Workflow-Level Constructs row for `fragments.checkpoints` |

Three files, `+3 / −2`. None belongs to either target: the defects live in the shared canon both targets read, which is why the [scope manifest](06-scope-manifest.md) enumerates no file under `work-package`.

### Possibly touched at draft time

None. `work-package/workflow.yaml`, the four activity files holding the seven `ref` sites, `schemas/workflow.schema.json` and `src/loaders/fragment-resolver.ts` are the migration surface of [#520](https://github.com/m2ux/workflow-server/issues/520). `remediate-vuln/workflow.yaml` and `scripts/check-fragments.ts` were candidates until the variable check was measured. All six are named so a reader knows the omission is a boundary rather than an oversight.

### Unaffected

`work-package` carries 15 activity files, 115 technique files, 37 resource files, a 223-line `workflow.yaml` and a README, and none of them is edited. `remediate-vuln`'s own files are likewise untouched. Every other workflow is unaffected: after #522 no workflow other than `work-package` declares a fragment, and none other than `work-package` references one.

The server's same-workflow link projection stands unchanged. A bare resource id is the correct projection for a technique only ever delivered under its own workflow; the defect belongs to techniques bundled into other workflows, and the citation is where that is known.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity is added, removed or reordered |
| Technique and resource references | Pass — `refs`, `resource-anchors` and `fragments` all report OK against the worktree |
| Variables, checkpoint effects, step gates | Pass — every variable the borrowed gates touch resolves |
| Schema validation | Pass — `work-package`, `remediate-vuln`, `meta` and `workflow-design` each valid; 117 activity files pass, 0 fail |
| Register citation reachability | Pass — both edited citations project to `meta/writing-register`, in the rendered link and in `resource_refs` alike |

The third verdict is the one this run opened against. `remediate-vuln` borrows the four activities carrying a checkpoint `ref`, whose gates read `is_review_mode`, `has_open_assumptions`, `assumption_review_presentation`, `open_assumptions` and `current_assumption`, and write `assumption_outcome`, `has_deferred_assumptions` and `needs_individual_interview`. Resolving the workflow returns 118 declarations covering all eight. The borrowed activities declare the five interview variables on themselves, and an included activity's `variables.writes` are contributed to every workflow whose graph includes it.

One guard is not green. `check-binding-fidelity` reports a single stale triage entry — a `read-resolution` finding at `prism-update/workflow.yaml:15` that no longer occurs. It sits outside this round's three files and outside both targets, and its remedy is an edit to `scripts/binding-fidelity-triage.json` in the server repository, which is outside this run's edit surface. It is carried as a finding rather than resolved here.

---

## 3. Removals inventory

**Round 1 applied no reduction.** Both fixes are additive: two link paths gain a `meta/` segment, and the inventory gains a row. No construct, rule, option, field or prose passage is deleted, so there is no row to compose and nothing was refused for want of a surviving home.

Deleting the two shared checkpoint bodies is #520's removal, inventoried by the run that performs it.

---

## Change constraints

**Co-change set** — empty. No file moves, so nothing has to move with it.

**Identifier-collision set** — names already taken in the target:

- Fragment names in `work-package`: `assumption-interview`, `assumption-decision`.
- Checkpoint step ids referencing them: `research-assumption-interview`, `research-assumption-decision#{current_assumption.id}`, `residual-assumption-batch`, and the sites in `05-implementation-analysis` and `08-implement`.
- Loop ids `assumption-interview` in `04-research` and `assumption-interview-loop` in `07-assumptions-review`. The loop in `04-research` already shares its id with the fragment it neighbours, so any new identifier derived from the fragment name collides there.
- Guard finding ids already in use: `malformed-ref`, `unresolved-ref`, `ref-body-conflict`, `ref-opens-step`, `unused-fragment`, `inline-duplicate-of-fragment`, `duplicate-rule`, `duplicate-checkpoint`, `undeclared-effect-variable`.

Round 1 mints no identifier, so it meets both sets vacuously.

**Environment constraint** — the library checkout at `/home/mike1/projects/dev/workflow-server/workflows` sits at `09b6067`, behind `origin/workflows` at `bc52c69` by the #522 merge. A worktree branches from the fetched `origin/workflows` tip, not from the local ref, or the run reinstates the seven rule fragments #522 deleted. This run's worktree is at `bc52c69` and satisfies it.
