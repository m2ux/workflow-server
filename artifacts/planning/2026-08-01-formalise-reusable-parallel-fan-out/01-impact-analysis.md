# Impact Analysis — Formalise reusable parallel fan-out

**Primary workflow:** `meta` v5.14.0  
**Co-edited workflows:** `workflow-design`, `prism`  
**Mode:** Update  
**Date:** 2026-08-01  
**Change source:** [01-change-brief.md](01-change-brief.md)  
**Baseline:** full checkout at `{target_path}` (`.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/`)  
**Corpus inventory:** [06-migration-candidates.md](06-migration-candidates.md) (every workflow directory classified)

---

## Summary

Multi-workflow technique + canon change:

| Layer | What changes |
|-------|----------------|
| **meta** | New same-context unit fan-out contract (`unit-fan-out` draft); retarget `cargo-operations::run-suite`; cargo group rule; scatter-gather boundary cross-link; indexes |
| **workflow-design** | Design principle Prefer Parallel Independent Work (prefer parallelisation via formal patterns); anti-pattern `prose-based-dispatch-patterns`; resource README index lines |
| **prism** | Retarget free-prose concurrent lens dispatch in `behavioral-pipeline/independent-lenses.md` to agent formal patterns; optional `dispute-analysis.md` (judgement #5) |

Lifecycle activities and transitions stay put on all three targets. **Prior scope-confirmed#0 was incomplete:** it treated the change as meta-only and claimed no peers beyond run-suite; full-corpus rescan finds prism free-prose dispatch candidates and requires workflow-design canon files.

**Removals inventoried:** 3 (plus optional 4th if dispute-analysis is in-pass)

---

## 1. Impact classification

### Directly modified — meta

| File | Why |
|------|-----|
| `meta/techniques/unit-fan-out.md` | **Create** — named same-context unit/process fan-out contract (ordered scatter → wait-all → gather) |
| `meta/techniques/cargo-operations/run-suite.md` | Primary #382 call site; free concurrent-shell Protocol → Apply `unit-fan-out`; keep suite envelope + cargo budgets |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | Group rule: multi-op concurrent fan-out Applies the unit contract |
| `meta/techniques/scatter-gather.md` | Boundary cross-link: agent-instance parallel stays here; same-context process units cite `unit-fan-out`; align with §33 without collapsing unit kinds |
| `meta/techniques/README.md` | Index `unit-fan-out` beside scatter-gather |
| `meta/README.md` | Catalogue / tree entry for the new strategy technique |

### Directly modified — workflow-design

| File | Why |
|------|-----|
| `workflow-design/resources/design-principles.md` | Add **§33** prefer parallelisation via formal fan-out/dispatch patterns (prefer / before / only after) |
| `workflow-design/resources/anti-patterns.md` | Add `prose-based-dispatch-patterns` under Technique Protocol Anti-Patterns (after `framing-outside-any-section`) |
| `workflow-design/resources/README.md` | Index Prefer Parallel Independent Work and `prose-based-dispatch-patterns` in resource detail blurbs |

### Directly modified — prism

| File | Why |
|------|-----|
| `prism/techniques/behavioral-pipeline/independent-lenses.md` | Protocol + Rules free concurrent lens dispatch → Apply scatter-gather / spawn-concurrent (agent unit kind — **not** unit-fan-out) |
| `prism/techniques/dispute-analysis.md` | *Optional this pass (judgement #5)* — free “can be parallel” dual-worker dispatch |

### Possibly touched at draft time

| File | Why |
|------|-----|
| `meta/techniques/orchestration-patterns/*` | Only if drafting discovers a missing cross-link; not a bind target for run-suite |
| `meta/techniques/harness-compat/TECHNIQUE.md` | Index note if spawn-concurrent boundary text needs a unit-fan-out pointer |
| `prism/techniques/behavioral-pipeline/TECHNIQUE.md` | Group rule if independent-lenses rule hoists |
| `prism/activities/01-structural-pass.yaml` | Only if technique bind path or activity `techniques[]` must name an additional strategy (prefer technique-local Apply first) |
| `work-package/activities/11-validate.yaml` | Only if run-suite I/O changes (judgement #3 prefers stability — **out of preferred path**) |
| `workflow-design/README.md` | Only if top-level principle list needs a §33 one-liner beyond resources/README |

### Unaffected (clean or N/A — see inventory)

- Meta formal homes themselves (scatter-gather, spawn-concurrent, orchestration-patterns, pattern activities) — **authors**, not free-prose debt
- cicd-pipeline-security-audit / substrate-node-security-audit — bind orchestration-patterns
- prism-evaluate / prism-audit — declare scatter-gather on fan-out activities
- work-package flock/rebase coordination; gitnexus analyze flock; complexity “fan-out” metrics language
- `prism/techniques/plan-analysis.md` — plan metadata (`parallelism_plan`), not a runtime dispatch recipe
- Server `src/` / `schemas/`

**Baseline inventory (edit worktree top-level workflow dirs):** meta, workflow-design, prism, prism-audit, prism-evaluate, prism-update, work-package, work-packages, workflow-authoring, cicd-pipeline-security-audit, substrate-node-security-audit, midnight-system-review, codebase-wiki, ponytail, remediate-vuln, requirements-refinement — full classification in [06-migration-candidates.md](06-migration-candidates.md).

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions, entry activity, reachability | Pass — no activity add/remove/reorder on any target |
| Technique and resource references | Pass if new `unit-fan-out` path is indexed, `prose-based-dispatch-patterns` / Prefer Parallel Independent Work cross-link, and every Apply resolves; Fail risk if free-prose sites remain the only recipe after claim of migration |
| Variables, checkpoint effects, step gates | Pass — no required variable/checkpoint topology change; prism structural-pass already lists scatter-gather |
| Multi-workflow bag honesty | Pass with primary `meta` + manifest multi-path plan; Fail if bag claims multi-target update contrary to intake rules |

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `meta/techniques/cargo-operations/run-suite.md` Protocol free concurrent-shell recipe | Standalone “Fan out four concurrent shells…” / wait-all instructions that re-teach concurrency without naming a meta contract | Domain suite composition: four ops, resource budgets, RAM backoff, sequential fallback, envelope fields |
| 2 | `prism/techniques/behavioral-pipeline/independent-lenses.md` Protocol §3 + Rules `independent-lenses-parallel` | Free “dispatch them concurrently (up to four at once)” recipe without Apply of scatter-gather / spawn-concurrent | Four lens identities, graph augmentation, artifact writes, independence claim as motivation (cite formal pattern for *how*) |
| 3 | `workflow-design` N/A (additive canon) | — | Prior catalogue entries and §1–§32 unchanged in substance |
| 4 | `prism/techniques/dispute-analysis.md` (if in-pass) | Free “can be parallel” dual dispatch without formal Apply | Pair selection, fresh-worker isolation, synthesis rules |

---

## Change constraints (for scope-and-draft)

**Co-change set:** unit-fan-out definition + run-suite + cargo group + meta indexes + scatter-gather boundary + design-principles Prefer Parallel Independent Work + anti-patterns `prose-based-dispatch-patterns` + resources README + independent-lenses (+ optional dispute-analysis).

**Identifier collisions:** existing ids `scatter-gather`, `spawn-concurrent`, `dispatch-workers`, `run-suite`, pattern activity `isolated-fan-out`, `framing-outside-any-section`. New technique id must not collide; new smell is `prose-based-dispatch-patterns` (cite by name). Prefer a name that states process/shell unit fan-out.

**Unit-kind split (binding decision draft):**

| Unit kind | Contract | Call sites this pass |
|-----------|----------|----------------------|
| Same-context shell/process | `unit-fan-out` (new) | `cargo-operations::run-suite` |
| Agent / lens workers | `scatter-gather` parallel and/or `spawn-concurrent` (existing) | `behavioral-pipeline::independent-lenses` (+ optional dispute-analysis) |

**workflow-authoring multi-target:** update mode intake binds a **single** target (`target_workflow_ids` one element). This run keeps `workflow_id` = `meta` and edits co-workflow paths under the shared worktree via the scope manifest — does not pretend review-mode multi-target.

---

## Decision ask

Confirm expanded impact (meta + workflow-design + prism), the three inventoried removals (free concurrent recipes / free lens concurrency → Apply of the right formal contract; canon additive), and the unit-kind split. Open judgements in the [change brief](01-change-brief.md) remain for drafting gates — this inventory does not freeze judgement #2’s exact Apply form or #5’s dispute-analysis timing beyond listing them.
