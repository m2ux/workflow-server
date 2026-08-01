# Change Brief — Formalise reusable parallel fan-out

**Workflows:** `meta` (primary) · `workflow-design` · `prism`  
**Mode:** Update (multi-workflow edit under one worktree; bag keeps single-target update shape — see Scope)  
**Date:** 2026-08-01  
**Change categories:** Technique · Resource (canon)  
**Change request:** Bind `cargo-operations::run-suite` (and peers) to a named meta technique contract for parallel fan-out; extend workflow-design canon (anti-pattern + design principle); migrate free-prose concurrent dispatch under prism where inventory flags it.  
**Baseline / edit surface:** `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/` on `workflow/meta-formalise-reusable-parallel-fan-out` (full workflows orphan checkout — meta, workflow-design, prism, and siblings)

---

## Purpose

Meta already owns three related fan-out surfaces: strategy technique [`scatter-gather`](../../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/meta/techniques/scatter-gather.md) (sequential or parallel work-unit scatter → ordered gather → combine), harness op [`spawn-concurrent`](../../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/meta/techniques/harness-compat/spawn-concurrent.md) (parallel agent batch), and pattern ops under [`orchestration-patterns`](../../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/meta/techniques/orchestration-patterns/TECHNIQUE.md) that compose those primitives for multi-agent mid-phase work. Call sites still encode concurrent execution as free Protocol/Rules prose in places — notably [`cargo-operations::run-suite`](../../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/meta/techniques/cargo-operations/run-suite.md) (“fan out four concurrent shells…”) and prism [`behavioral-pipeline::independent-lenses`](../../../../.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/prism/techniques/behavioral-pipeline/independent-lenses.md) (“dispatch them concurrently (up to four at once)”) — rather than Applying a named formal contract.

This run:

1. **Chooses and authors** the reusable same-context **unit/process** fan-out contract for run-suite-class work (draft: new meta strategy technique `unit-fan-out`), distinct from agent scatter-gather / spawn-concurrent.
2. **Retargets** confirmed free-prose callers: `run-suite` → unit/process contract; prism independent-lenses (and any peer agent free-prose in scope) → existing agent formal patterns (`scatter-gather` / `spawn-concurrent` / orchestration-patterns as fit).
3. **Extends workflow-design canon:** design principle **§33** (prefer parallelisation of independent work via formal patterns) and anti-pattern **AP-140** `prose-based-dispatch-patterns` (next free id after AP-139 `framing-outside-any-section` — the revise note’s AP-139 was already taken).
4. **Records a full-corpus migration inventory** so “peers” is evidence-backed, not meta-only guesswork. Prior round #0 inventory under-scoped: it reported only run-suite under meta and missed prism free-prose dispatch.

| Goal | Meaning |
|------|---------|
| Named contracts (split by unit kind) | Same-context shell/process units Apply `unit-fan-out` (or chosen process contract); agent/lens units Apply scatter-gather / spawn-concurrent / orchestration-patterns — never free concurrent-shell or concurrent-Task recipes |
| Canon | §33 preference + AP-140 detect triad make formal fan-out the write-time default and free-prose re-teaching a named smell |
| Caller retarget | Confirmed candidates cite the right contract; I/O envelopes stay bindable for existing step call sites |
| Honest inventory | Every workflow directory under the edit worktree is classified candidate / clean / N/A with path citations ([06-migration-candidates.md](06-migration-candidates.md)) |
| Edit home | All definition edits under the session `{target_path}` worktree (meta + workflow-design + prism paths) |

**Out of scope:**

- Server/runtime changes under `src/` or `schemas/` (definition-only)
- Reworking clean workflows that already bind formal patterns (cicd / substrate audits, prism-evaluate / prism-audit scatter-gather declarations, meta pattern activities)
- Coordination-not-dispatch (flock / rebase sibling races, GitNexus analyze lock) and graph-metrics “fan-out” language
- `plan-analysis` parallelism metadata (classified non-candidate — plan field, not runtime dispatch recipe)
- Deferred `check.md` diagnostics-shape follow-up noted in `run-suite` (orthogonal)
- Multi-target **review** loop semantics — update mode bag stays single primary `workflow_id: meta`; co-edited workflows are explicit multi-workflow paths in the scope manifest (workflow-authoring update intake binds one named target)

---

## Dimensions

| Dimension | This run's shape |
|-----------|------------------|
| Purpose | Formalise reusable parallel fan-out (process + agent), bind free-prose callers, and lock the preference into workflow-design canon |
| Activity list | Unchanged across targets — technique/resource edits only |
| Checkpoints | Unchanged |
| Artifacts | Planning artifacts for this authoring run; no new workflow-level planning artifacts inside targets |
| Rules | Meta cargo group rule for unit fan-out; prism behavioral rule cites formal agent pattern; workflow-design AP-140 + §33 |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | **Process contract id/home for run-suite?** New strategy technique `unit-fan-out` vs extend scatter-gather for non-agent units. | run-suite fans four **shell** cargo ops in one agent context; scatter-gather parallel mode and spawn-concurrent are **agent** dispatch. | New `unit-fan-out` → clear agent vs process split (favoured draft). Scatter-gather extension → one primitive, risk of overloading isolation/combine rules meant for agents. |
| 2 | **Prism independent-lenses bind target?** `scatter-gather` parallel mode vs direct `spawn-concurrent` vs activity-level orchestration-patterns. | Four independent lens workers, agent-shaped; activity already declares `scatter-gather` on structural-pass. | scatter-gather Apply inside technique vs step-level bind only — drafting picks the form that preserves lens I/O artifacts and isolation. **Not** `unit-fan-out`. |
| 3 | **Must `run-suite` public inputs/outputs stay byte-stable for `work-package` validate?** | `11-validate.yaml` binds `cargo-operations::run-suite` and reads `validation_results.*`. | Stable envelope → validate untouched. Signature change → co-change validate (out of preferred path). |
| 4 | **Sequential fallback and RAM backoff: stay in run-suite or move into the shared unit contract?** | run-suite owns suite-specific memory backoff and sequential fallback today. | Shared owns only dispatch/gather → run-suite keeps cargo budgets (favoured). Shared owns backoff → cargo policy leaks into generic primitive. |
| 5 | **dispute-analysis “can be parallel” — this pass or follow-up?** | Free-prose optional parallel of two fresh workers; smaller than independent-lenses. | In-pass → one more prism technique in the drafting loop. Follow-up → inventory rows it as candidate deferred. |
| 6 | **Bag primary vs multi-workflow honesty in bag variables?** | workflow-authoring **update** intake sets `target_workflow_ids` to the single named target; multi-target lists are review-mode. | Keep `workflow_id` / `target_workflow_id` = `meta` and expand the scope manifest across workflows under the shared worktree (honest multi-workflow edit plan). Forcing multi-id update bag would fight intake classification. |

---

## Confirmation ask

Approve this brief’s multi-workflow purpose (meta contracts + workflow-design canon + prism free-prose migration), out-of-scope, open judgements, and the split binding (process unit contract for run-suite; agent formal patterns for prism lenses) as the design surface for drafting under the dedicated workflows worktree.
