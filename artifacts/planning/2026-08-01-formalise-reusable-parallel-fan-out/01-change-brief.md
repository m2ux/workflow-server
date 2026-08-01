# Change Brief — Formalise reusable parallel fan-out

**Workflow:** `meta` v5.14.0
**Mode:** Update
**Date:** 2026-08-01
**Change categories:** Technique
**Change request:** Bind `cargo-operations::run-suite` (and peers) to a named meta technique contract for parallel fan-out — evaluate `scatter-gather` / `spawn-concurrent` or a new meta technique — and retire free protocol prose for that shape under `workflows/meta/`.
**Baseline:** library checkout `workflows/meta/` (edit surface: `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/`)

---

## Purpose

Meta already owns three related fan-out surfaces: strategy technique [`scatter-gather`](../../../../workflows/meta/techniques/scatter-gather.md) (sequential or parallel work-unit scatter → ordered gather → combine), harness op [`spawn-concurrent`](../../../../workflows/meta/techniques/harness-compat/spawn-concurrent.md) (parallel agent batch), and pattern ops under [`orchestration-patterns`](../../../../workflows/meta/techniques/orchestration-patterns/TECHNIQUE.md) that compose those primitives for multi-agent mid-phase work. [`cargo-operations::run-suite`](../../../../workflows/meta/techniques/cargo-operations/run-suite.md) still encodes concurrent execution as free Protocol prose (“fan out four concurrent shells…”) rather than Applying a named meta contract.

This run decides which existing primitive (or new meta technique) is the reusable parallel fan-out contract for run-suite-class work, retargets callers so the suite (and any peer free-prose sites) Apply that contract, and keeps the support surface under `workflows/meta/`.

| Goal | Meaning |
|------|---------|
| Named contract | Parallel fan-out for run-suite peers is an Apply of a documented meta technique, not ad-hoc concurrent-shell / concurrent-Task recipe prose |
| Binding decision | Explicit choose-and-document among `scatter-gather`, `spawn-concurrent`, composition via `orchestration-patterns`, or a new meta technique when none fits |
| Caller retarget | `run-suite` (and peers found in scope) cite the chosen contract; I/O envelopes stay bindable for existing step call sites |
| Meta home | All new or extended fan-out support lives under `workflows/meta/` |

**Out of scope:**

- Server/runtime changes under `src/` or `schemas/` (definition-only unless a later judgement forces engine work — not assumed)
- Reworking non-meta domain workflows beyond retargeting their bindings if a shared op signature changes
- Fixing the deferred `check.md` diagnostics-shape follow-up noted in `run-suite` (orthogonal)

---

## Dimensions

| Dimension | This run's shape |
|-----------|------------------|
| Purpose | Formalise reusable parallel fan-out as a meta technique contract; bind run-suite-class ops to it |
| Activity list | Unchanged — meta lifecycle and borrowable pattern activities stay; no new lifecycle activity required for a technique-only binding |
| Checkpoints | Unchanged |
| Artifacts | Unchanged at meta workflow level; planning artifacts for this authoring run only |
| Rules | May add or tighten a meta/cargo rule that concurrent multi-op fan-out Applies the chosen contract (no free concurrent recipe) when the design lands |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | **Which primitive owns run-suite fan-out?** `scatter-gather` (strategy), `spawn-concurrent` (agent batch), `orchestration-patterns` composition, or a **new** meta technique (e.g. concurrent-shell / process fan-out)? | `run-suite` fans four **shell** cargo ops in one agent context; `scatter-gather` parallel mode and `spawn-concurrent` are **agent** dispatch. Binding shell concurrency to agent primitives may overfit or mis-teach isolation/combine rules. | Agent-primitive bind → extend scatter-gather or spawn path and teach shell units as work units. New technique → keeps agent vs process fan-out distinct; run-suite Applies the new op; scatter-gather stays agent-oriented. |
| 2 | **Does “peer” mean only cargo suite composition, or every free concurrent recipe under meta?** | Issue names run-suite and peers; inventory may find only run-suite, or additional free-prose sites. | Narrow peer set → smaller blast radius. Broad peer set → co-change more technique files and README indexes in one PR. |
| 3 | **Must `run-suite` public inputs/outputs stay byte-stable for `work-package` validate?** | `work-package` `11-validate.yaml` binds `cargo-operations::run-suite` and reads `validation_results.*`. A contract refactor could tempt envelope reshaping. | Stable envelope → validate activity needs no edit (or docs-only). Signature change → co-change validate bindings and any dotted-path consumers. |
| 4 | **Sequential fallback and RAM backoff: stay in run-suite or move into the shared contract?** | run-suite Protocol today owns suite-specific memory backoff (`CARGO_BUILD_JOBS` halve) and sequential fallback. Shared contract may only own “fan out N units, wait all, gather ordered.” | Shared owns only dispatch/gather → run-suite keeps cargo budgets. Shared owns backoff → cargo-specific policy leaks into a generic primitive (risk). |

---

## Confirmation ask

Approve this brief’s purpose, out-of-scope, and open judgements as the design surface for drafting the binding decision and meta definition edits under the dedicated workflows worktree.
