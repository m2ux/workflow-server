# Impact Analysis — Git-Derived Host Repo Binding

**Workflow:** `meta` v5.11.0 (primary) · `work-package` v3.36.0 (secondary)
**Mode:** Update
**Date:** 2026-07-28
**Change source:** [change brief](01-change-brief.md)
**Baseline:** `workflows` @ branch `workflows`, commit `f84fe02b` (314 files across the two targets)

---

## Summary

An additive change with one contract rename. Nothing is added to or removed from either activity graph, so the topology is intact — every transition target resolves, both entry activities are valid, and no activity loses its incoming edge. The blast radius is concentrated in the variable layer: one new technique, four new declared facts, and a rename that moves `target_path` out of the parent-session namespace.

The variable layer in this exact seam already fails its own integrity checks before this change touches it. Two defects the change request names are confirmed and one is worse than stated: `work-package`'s `discovered_path` is declared with no default and bound by nothing, yet the `repo_root` derived from it is gated `exists`, consumed as a technique input, and re-validated in a later activity. Drafting must not assume a clean baseline here.

**Removals inventoried:** 6

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `meta/techniques/version-control/resolve-host-repo.md` | New — the git ascent, the origin-remote read, and the basename assertion |
| `meta/techniques/version-control/TECHNIQUE.md` | Gains the host-vs-component invariant as a rule beside `infrastructure-submodule-paths` |
| `meta/techniques/version-control/select-target-component.md` | Output renamed to `component_path`; consumes `mentioned_repo` and `component_hint` as component context only |
| `meta/techniques/version-control/detect-repo-type.md` | The seam's second producer of the renamed variable — sets it to `.` for a regular repo |
| `meta/techniques/workflow-engine/extract-identifying-context.md` | Emits `mentioned_repo` from PR/issue URLs |
| `meta/techniques/workflow-engine/start-session.md` | `repo` input becomes derived-first with prose demoted to fallback |
| `meta/resources/bootstrap-protocol.md` | Step 2 rewritten from a prose lookup to a derivation |
| `meta/activities/00-discover-session.yaml` | New host-resolution step and the basename-mismatch checkpoint |
| `meta/activities/02-resolve-target.yaml` | New binding-agreement validation; four `target_path` references renamed |
| `meta/workflow.yaml` | Declares `host_repo_path`, `is_monorepo_host`, `component_hint`, `component_path`; retires `target_path`; `target_repo`'s description stops citing `AGENTS.md` as its source |
| `work-package/techniques/repo-root-resolution.md` | Single-level parent test generalised to the multi-level ascent; `discovered_path` contract restated |
| `work-package/activities/01-start-work-package.yaml` | `resolve-repo-root` (line 160) gains the explicit `discovered_path` binding it has never had |
| `work-package/workflow.yaml` | `discovered_path` declaration gains a definite source and description |

### Possibly touched at draft time

| File | Why |
|------|-----|
| `meta/techniques/workflow-engine/commit-and-persist.md` | Reads `{target_path}` at three points and calls it *the submodule* — resolving open judgement 3 either repoints it at `component_path` or leaves its prose describing a variable it no longer receives |
| `meta/techniques/agent-conduct.md` | Line 98 asserts commits happen inside `target_path` *(the submodule)* — same judgement, same exposure |
| `meta/techniques/cargo-operations/preflight.md` | Inspects `target_path` for build-script signals; needs to name whichever fact it actually wants |
| `meta/techniques/workflow-engine/match-saved-session.md` | Scores `identifying_context` overlap to pick a session to resume; a new `mentioned_repo` field silently joins that scoring (open judgement 4) |
| `meta/README.md`, `meta/activities/README.md` | Six prose and diagram references to `target_path` |
| `remediate-vuln/activities/01-start.yaml` | Line 44 binds `discovered_path: target_path`. It declares its own `target_path` (a private checkout), so the rename does not break the binding outright — but whether that variable is set by line 44 or is inheriting the parent's value is exactly the ambiguity this change removes |
| `work-package/activities/06-plan-prepare.yaml` | Lines 16-20 validate `target_path` and `repo_root` and name `compute-canonical-target-path` and `resolve-repo-root` by step id in their failure messages |
| `tests/e2e/__snapshots__/corpus-sha.json`, `tests/e2e/__snapshots__/snapshot.test.ts.snap` | **Server repo, not the submodule.** The corpus SHA pins `f84fe02b` and both walk tests enumerate `meta`, so any meta activity edit re-baselines here (open judgement 5) |

### Unaffected

Of 314 files across the two targets, 13 are directly modified and 8 are exposed at draft time. The remainder are unaffected: in `meta`, 8 of 9 technique groups and 4 of 5 resources; in `work-package`, 14 of 15 activities, 15 of 16 technique groups and all 31 resources. `meta/activities/patterns/*.yaml` sit outside the lifecycle graph and are untouched.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | **Pass** — no activity is added, removed or reordered; all six `meta` transition targets and both `transitionTo` escapes resolve; `initialActivity: discover-session` is valid; every non-entry activity keeps an incoming edge. Pre-existing and untouched: `04-end-workflow.yaml` declares no `transitions:` block and terminates only via the `transitionTo` escape |
| Technique and resource references | **Pass, conditionally** — all 18 `technique:` fields in `meta` resolve today, and `00-discover-session`'s new step dangles unless `resolve-host-repo.md` lands in the same change. Pre-existing: `version-control::infrastructure-submodule-paths` (`02-resolve-target.yaml:8`, `meta/workflow.yaml:88`) is written in `group::op` technique form but is a rule anchor in `TECHNIQUE.md`, not a file — the new invariant rule must not copy that citation form |
| Variables, checkpoint effects, step gates | **Fail — pre-existing, inside the edit region.** `meta` references `matched_session` (`00-discover-session.yaml:56,64,91` — the file being edited), plus `current_activity`, `worker_yielded_checkpoint`, `worker_result` and `user_selection`, none of them declared. `meta`'s `target_path`, `is_monorepo`, `resume_intent_requested` and `component_selection_needed` are never written by a step — they land only as implicit same-name technique outputs with no `outputs:` mapping, so the rename lands correctly only if `component_path` is declared. `work-package`'s `discovered_path` (`workflow.yaml:514`) has no default and no producer anywhere in the workflow, yet `repo_root` derived from it is gated `exists` (`01:164-167`), consumed as `repo_path` (`01:173`) and re-validated (`06:19`). Separately, `naming-conventions` is bound twice with no output narrowing (`01:558` and `01:570`), so it writes `target_path` and `branch_name` twice on the non-review path |

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `meta/resources/bootstrap-protocol.md:14` | Prose as the primary binding source, and the constraint sentence *"Use only a repository the user or workspace identifies"* | The `owner/repo` shape, step numbering and position, and `AGENTS.md`/`CLAUDE.md`/user as the fallback when the workspace is not a git repo or has no origin remote |
| 2 | `meta/techniques/workflow-engine/start-session.md:22` | The sentence naming the user or workspace `AGENTS.md`/`CLAUDE.md` as what identifies `repo` | `repo`'s required-ness on every call, and the implicit acceptance when `planning_folder` already sits under `…/<owner>/<repo>/…` |
| 3 | `work-package/techniques/repo-root-resolution.md:28-31` | The single-level test — *"the parent directory has a `.gitmodules` file listing the path's basename"* — as the whole of the shape determination | The `repo_root` and `component_name` outputs, the standalone-repository case, and the statement that edits never happen under `repo_root` |
| 4 | `meta/workflow.yaml:82-85` | The declared variable `target_path` and its description *"Resolved target directory for git operations"* — a contract field other files bind against by name | The fact itself under `component_path`, including the `.` default for a regular repo |
| 5 | `meta/techniques/version-control/select-target-component.md:22-24` | The declared output `target_path` | The single-component auto-resolution, the multi-component `component_selection_needed` path, and the pre-selection behaviour |
| 6 | `meta/techniques/version-control/detect-repo-type.md:16` | The declared output `target_path` | The `is_monorepo` logic and the infrastructure-submodule exclusion that feeds it |

Every other `target_path` occurrence — `02-resolve-target.yaml` (4 sites), `meta/README.md` (4), `meta/activities/README.md` (2) — is a string-only rename carrying no content loss, so no row claims it. A seventh removal becomes live only if open judgement 3 resolves toward repointing `commit-and-persist.md` and `agent-conduct.md`, which would delete their *"the submodule"* semantics; it is not inventoried while that judgement is open.

---

## Decision ask

Confirm the impact scope and the six inventoried removals — or preserve instead. Approving accepts retiring prose as the primary binding source in two places, generalising the single-level submodule test, and dropping `target_path` as a declared name in three `meta` contracts.
