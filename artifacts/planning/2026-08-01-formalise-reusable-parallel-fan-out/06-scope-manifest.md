# Scope Manifest — Formalise reusable parallel fan-out

**Primary target:** `meta` v5.14.0 · **Co-edit:** `workflow-design`, `prism` · **Mode:** Update  
**Basis:** [01-change-brief.md](01-change-brief.md) · [01-impact-analysis.md](01-impact-analysis.md) · [06-migration-candidates.md](06-migration-candidates.md)  
**Edit surface:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/` — present on `workflow/meta-formalise-reusable-parallel-fan-out`

**11 files** created or modified (12 if dispute-analysis is pulled in-pass). Preserved instead of removed: 0 (removals are Protocol/Rules prose only, inventoried and approved).

**Bag variables (honest):** `workflow_id` / `target_workflow_id` / single-element `target_workflow_ids` remain **`meta`**. workflow-authoring **update** intake does not multi-list targets; co-edits are multi-workflow paths under the shared worktree, not a review-mode `target_workflow_ids` expansion.

---

## File manifest

Paths are under `{target_path}/` (workflow root = first path segment).

| # | Path | Kind | Action | One-line change |
|---|------|------|--------|-----------------|
| 1 | `meta/techniques/unit-fan-out.md` | technique | create | Same-context unit/process fan-out contract (ordered scatter → wait-all → ordered gather); shell/process units, not agent spawn |
| 2 | `meta/techniques/cargo-operations/run-suite.md` | technique | modify | Replace free concurrent-shell Protocol with Apply of `unit-fan-out`; keep suite envelope, cargo budgets, sequential/RAM backoff |
| 3 | `meta/techniques/cargo-operations/TECHNIQUE.md` | technique | modify | Group rule: multi-op concurrent fan-out Applies `unit-fan-out` (no free concurrent recipe) |
| 4 | `meta/techniques/scatter-gather.md` | technique | modify | Boundary: agent-instance parallel stays here; same-context unit/process fan-out cites `unit-fan-out`; cross-link §33 / AP-140 as needed |
| 5 | `meta/techniques/README.md` | readme | modify | Index `unit-fan-out` beside scatter-gather / strategy techniques |
| 6 | `meta/README.md` | readme | modify | Catalogue entry and tree line for the new strategy technique |
| 7 | `workflow-design/resources/design-principles.md` | resource | modify | Add **§33** — prefer parallelising independent work via formal fan-out/dispatch patterns (prefer / before / only after) |
| 8 | `workflow-design/resources/anti-patterns.md` | resource | modify | Add **AP-140** `prose-based-dispatch-patterns` (Technique Protocol section, after AP-139); Detect/Do not flag/Fix triad; link §33, Prefer Shared Capability, Maximize Schema Expressiveness |
| 9 | `workflow-design/resources/README.md` | readme | modify | Resource detail blurbs: §33 in design-principles; AP-140 in anti-patterns |
| 10 | `prism/techniques/behavioral-pipeline/independent-lenses.md` | technique | modify | Retarget free concurrent lens dispatch to Apply **scatter-gather** / **spawn-concurrent** (agent unit kind); slim Rules to cite contract |
| 11 | `prism/techniques/dispute-analysis.md` | technique | modify | *Optional — judgement #5.* Replace “(can be parallel)” free dual-dispatch with formal agent pattern Apply |

**Out of scope this pass:**

- `work-package/activities/11-validate.yaml` and other `run-suite` bind sites — public I/O envelope stays byte-stable (brief judgement #3)
- `harness-compat/spawn-concurrent.md` body rewrite — agent batch formal home; boundary notes only if needed from scatter-gather / unit-fan-out
- `orchestration-patterns/*` behaviour — already formal; no recipe rewrite
- Activity YAML / `workflow.yaml` topology on all targets — technique/resource-only (unless drafting proves a prism activity bind is required)
- `prism/techniques/plan-analysis.md` — plan metadata only ([inventory](06-migration-candidates.md))
- Clean workflows (cicd, substrate, prism-audit, prism-evaluate, midnight-system-review, …) — already formal
- Coordination flock/rebase and graph-metrics “fan-out” language
- Server `src/` / `schemas/`
- Deferred `check.md` diagnostics-shape follow-up in run-suite

**Binding split (fixed for drafting):**

| Call site | Unit kind | Contract |
|-----------|-----------|----------|
| `cargo-operations::run-suite` | same-context shell/process | **`unit-fan-out`** (new) |
| `behavioral-pipeline::independent-lenses` | agent / lens workers | **`scatter-gather` parallel and/or `spawn-concurrent`** (existing) — **not** unit-fan-out |
| `dispute-analysis` (if in-pass) | agent pair | same agent formal patterns |

If drafting discovers scatter-gather is the better **process** home after all, revise rows 1–4 before authoring (drop create #1; retarget run-suite Apply). Do **not** collapse prism lenses onto unit-fan-out.

**AP id note:** Catalog already has AP-139 `framing-outside-any-section`. New smell is **AP-140**, not AP-139.

---

## Structural design

```
{target_path}/
├── meta/                                    # primary — layout unchanged
│   ├── workflow.yaml                        # untouched
│   ├── activities/                          # untouched
│   ├── techniques/
│   │   ├── scatter-gather.md                # modify — boundary
│   │   ├── unit-fan-out.md                  # create — process unit contract
│   │   ├── README.md                        # modify — index
│   │   └── cargo-operations/
│   │       ├── TECHNIQUE.md                 # modify — group rule
│   │       └── run-suite.md                 # modify — Apply unit-fan-out
│   └── README.md                            # modify — catalogue / tree
├── workflow-design/                         # canon co-edit — layout unchanged
│   └── resources/
│       ├── design-principles.md             # modify — §33
│       ├── anti-patterns.md                 # modify — AP-140
│       └── README.md                        # modify — index blurbs
└── prism/                                   # free-prose co-edit — layout unchanged
    └── techniques/
        ├── dispute-analysis.md              # optional modify
        └── behavioral-pipeline/
            └── independent-lenses.md        # modify — Apply agent formal pattern
```

**Flow:** Unchanged on all three workflows — no activity add/remove/reorder; `initialActivity` and lifecycle transitions stay as-is.

| Convention | This change |
|------------|-------------|
| Strategy techniques at `meta/techniques/*.md` | `unit-fan-out.md` peers `scatter-gather.md` |
| Group ops under `techniques/<group>/` | `run-suite` stays in cargo-operations; independent-lenses stays in behavioral-pipeline |
| Apply named contracts | Free concurrent recipes become Apply of the unit-kind-correct contract |
| Canon stance + smell | §33 preference; AP-140 detect triad |
| Identifier collisions | Avoids scatter-gather, spawn-concurrent, dispatch-workers, harness concurrent, isolated-fan-out, AP-139 |
| I/O stability | run-suite inputs/outputs unchanged for validate consumers |
| Multi-workflow edit | Shared worktree; bag primary remains meta |

---

## Drafting order

1. **Canon (workflow-design)** — §33 then AP-140 then resources README, so technique drafting can cite stable anchors  
2. **Techniques (meta contract)** — Author `unit-fan-out.md` so process callers have a resolvable Apply target  
3. **Techniques (meta caller + group + boundary)** — `run-suite.md`, cargo `TECHNIQUE.md`, `scatter-gather.md`  
4. **Techniques (prism agent callers)** — `independent-lenses.md`, then optional `dispute-analysis.md`  
5. **Indexes (meta)** — `techniques/README.md`, then meta `README.md`  
