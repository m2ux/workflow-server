# Impact Analysis — Formalise reusable parallel fan-out

**Workflow:** `meta` v5.14.0
**Mode:** Update
**Date:** 2026-08-01
**Change source:** [01-change-brief.md](01-change-brief.md)
**Baseline:** library `workflows/meta/` (file inventory below); edit root `{target_path}` after worktree provision

---

## Summary

Technique-layer change inside `meta`: formalise parallel fan-out as a named contract and retarget `cargo-operations::run-suite` (and any free-prose peers) to Apply it. Meta lifecycle activities and transitions are untouched. Integrity of technique references depends on the chosen binding (extend existing files vs add a new technique path). No activity topology change.

**Removals inventoried:** 2

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `techniques/cargo-operations/run-suite.md` | Primary caller of free concurrent-shell Protocol; retarget to Apply named contract; may slim Protocol to domain combine + cargo budgets |
| `techniques/scatter-gather.md` and/or `techniques/harness-compat/spawn-concurrent.md` and/or **new** `techniques/…` op | Chosen home of the reusable fan-out contract (judgement #1) |
| `techniques/cargo-operations/TECHNIQUE.md` | Group rules may require suite/peer fan-out via the named contract |
| `README.md` (meta) and/or `techniques/README.md` | Index the contract and binding expectation when the surface changes |

### Possibly touched at draft time

| File | Why |
|------|-----|
| `techniques/orchestration-patterns/dispatch-workers.md` / `TECHNIQUE.md` | Only if the decision routes suite-class fan-out through orchestration-patterns rather than scatter-gather / new op |
| `techniques/harness-compat/TECHNIQUE.md` | Index / rules if spawn-concurrent gains non-agent unit kinds or cross-links |
| `work-package/activities/11-validate.yaml` | Only if `run-suite` inputs/outputs or bind path change (judgement #3 prefers stability) |
| Other consumer READMEs citing `run-suite` or free concurrent recipes | Doc links after rename or new path |

### Unaffected

Meta lifecycle activities (discover → end), pattern activities that already bind scatter-gather correctly (`isolated-fan-out`, etc.), cargo single-ops (`check`, `clippy`, `test`, `fmt-check`, …), resources, and non-meta workflows that only inherit meta ops without free concurrent prose — **~140+ technique files and all 10 activity YAMLs** remain out of the direct edit set unless a peer inventory expands scope (judgement #2).

**Baseline inventory (library `workflows/meta/`):** 1 root `workflow.yaml`; 10 activity YAMLs (5 lifecycle + 5 patterns); ~10 technique group contracts + 3 standalone strategy/capability techniques (`scatter-gather`, `variable-binding`, `agent-conduct`) + ~121 nested ops; 6 resources; README. Activity ids (prefix order): discover-session, initialize-session, resolve-target, dispatch-client-workflow, end-workflow; patterns orchestrator-workers, supervisor, plan-and-execute, isolated-fan-out, lead-researcher.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity add/remove/reorder; `initialActivity` and lifecycle transitions unchanged |
| Technique and resource references | Pass if new/extended technique paths are registered consistently (group file + indexes) and every `Apply` / activity `techniques[]` citation resolves; Fail risk only if a new op is referenced before the file exists or old free-prose sites remain the only recipe |
| Variables, checkpoint effects, step gates | Pass — no meta variable or checkpoint change required for a technique-contract binding |

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `techniques/cargo-operations/run-suite.md` Protocol §1 free concurrent-shell recipe | Standalone “fan out four concurrent shells…” instructions that re-teach concurrency without naming a meta contract | Domain suite composition: four ops, resource budgets, wait-all, envelope fields (`validation_results`, `failed_checks`, `first_failure`, `validation_passed`) |
| 2 | Any peer free concurrent fan-out prose found under `meta/techniques/` (if peer inventory is non-empty) | Duplicate concurrent dispatch recipes that duplicate scatter-gather / spawn-concurrent / new contract | Caller-specific unit lists, cargo env budgets, and combine envelopes unique to that op |

---

## Change constraints (for scope-and-draft)

**Co-change set:** chosen contract definition + `run-suite.md` + cargo group contract/rules + meta technique index/README entries that list the contract. If judgement #3 forces envelope change, add `work-package/activities/11-validate.yaml` (and any other bind sites).

**Identifier collisions:** existing ids `scatter-gather`, `spawn-concurrent`, `dispatch-workers`, `run-suite`, pattern activity `isolated-fan-out`. A new technique id must not collide with those or with harness operation kinds (`concurrent`). Prefer a name that states process/shell fan-out if agent primitives are not reused.

---

## Decision ask

Confirm impact scope and the two inventoried removals (free concurrent recipes replaced by Apply of the named contract). Prefer additive contract + thin Protocol over deleting suite semantics. Open judgements in the [change brief](01-change-brief.md) remain for scope-and-draft / design gates — this inventory does not pick the binding.
