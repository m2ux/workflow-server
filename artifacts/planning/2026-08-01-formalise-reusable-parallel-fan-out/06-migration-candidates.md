# Migration candidates — parallel / concurrent dispatch (full corpus)

**Date:** 2026-08-01  
**Edit surface scanned:** `/home/mike1/projects/dev/workflow-server/.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/`  
**Method:** ripgrep over `*.md` / `*.yaml` for fan-out, concurrent, parallel, scatter-gather, spawn-concurrent, wait-all, “up to four”, Task/dispatch recipes; then hand-classify each workflow directory.  
**Honesty note:** Scope-confirmed **#0** only inventoried meta and reported a single free-prose peer (`run-suite`). That missed **prism** free-prose concurrent dispatch. This artifact is the corrected corpus inventory.

**Classes:**

| Class | Meaning |
|-------|---------|
| **candidate** | Free Protocol/Rules (or equivalent) teaches concurrent/parallel fan-out without Applying a named formal meta contract |
| **clean** | Concurrent/parallel behaviour is already bound to scatter-gather, spawn-concurrent, and/or orchestration-patterns (or is the formal home itself) |
| **N/A** | Mentions of parallel/fan-out are coordination locks, graph metrics, domain content, plan metadata, docs-only orientation, or serial-by-policy — not a dispatch-recipe smell |

---

## Confirmed candidates (migration this pass or explicit follow-up)

| Path | Workflow | Evidence | Proposed contract | Pass |
|------|----------|----------|-------------------|------|
| `meta/techniques/cargo-operations/run-suite.md` | meta | Protocol §1: “Fan out four concurrent shells…”, wait-all, no Apply of named fan-out contract | **unit-fan-out** (same-context process/shell) | **This pass** (#382 primary) |
| `prism/techniques/behavioral-pipeline/independent-lenses.md` | prism | Capability + Protocol §3 + Rules `independent-lenses-parallel`: “dispatch them concurrently (up to four at once)” with no Apply of scatter-gather / spawn-concurrent | **scatter-gather** parallel and/or **spawn-concurrent** (agent/lens) — not unit-fan-out | **This pass** |
| `prism/techniques/dispute-analysis.md` | prism | Protocol §2: dual fresh-worker dispatch; second line “(can be parallel)” without formal Apply | scatter-gather / spawn-concurrent | **Follow-up default**; optional this pass (brief judgement #5) |

---

## Explicit non-candidates (classified with rationale)

| Path | Why not a migration candidate |
|------|-------------------------------|
| `prism/techniques/plan-analysis.md` | Emits plan fields `parallelism_plan` / cost estimates (“can run concurrently up to 4”) as **plan metadata** for multi-unit scopes. Does not teach a runtime shell/Task/wait-all dispatch recipe. Downstream execution is owned by activities that already declare scatter-gather. **Out of scope** for Apply retarget. |
| `meta/techniques/scatter-gather.md` | Formal home (clean author) |
| `meta/techniques/harness-compat/spawn-concurrent.md` (+ harness `concurrent` rules) | Formal home (clean author) |
| `meta/techniques/orchestration-patterns/**` | Formal composition layer (clean author) |
| `meta/activities/patterns/**` | Borrowable patterns already bind scatter-gather / orchestration-patterns |
| `work-package/techniques/manage-git/update-repo-submodules.md`, `artifact-commits.md` | **Coordination** (flock / rebase) for sibling WP races — not fan-out dispatch |
| `meta/techniques/gitnexus-operations/analyze.md` | **Coordination** flock for concurrent analyze — not fan-out dispatch |
| `meta/techniques/gitnexus-operations/complexity-signal.md`, `context.md`, `reversibility-signal.md` | Graph **metrics** language (“fan-out”) |
| `work-package/techniques/design-philosophy/classify.md`, `review-code.md`, etc. | Consume complexity/blast-radius signals — not dispatch recipes |
| Substrate/CI audit **resources** naming “RPC fan-out”, pool consumers, etc. | **Domain** security content |

---

## Per-workflow directory rollup

Every top-level workflow directory in the edit worktree:

| Workflow directory | Class | Notes / citations |
|--------------------|-------|-------------------|
| **meta** | **mixed** — formal homes **clean**; **candidate** `cargo-operations/run-suite.md` | Formal: `techniques/scatter-gather.md`, `harness-compat/spawn-concurrent.md`, `orchestration-patterns/*`, `activities/patterns/*`. Candidate: run-suite free concurrent shells. |
| **workflow-design** | **canon target** (not a dispatch candidate) | Will **gain** §33 + AP-140. Existing prose cites orchestration-patterns under Prefer Shared Capability / schema inventory — clean guidance, not free runtime recipes. Activities declare scatter-gather where needed. |
| **prism** | **mixed** — **candidates** independent-lenses (+ dispute-analysis); plan-analysis **N/A**; activities **clean** declarations | Activities `01-structural-pass` etc. list `scatter-gather`. Free-prose debt is technique-local. |
| **prism-audit** | **clean** | `execute-analysis` declares scatter-gather; README documents strategy bind |
| **prism-evaluate** | **clean** | `execute-analysis` / `resolution-dialogue` declare scatter-gather |
| **prism-update** | **N/A** | No free concurrent dispatch recipe found in scan |
| **cicd-pipeline-security-audit** | **clean** | `workflow.yaml` + `dispatch-scanners` bind `orchestration-patterns::dispatch-workers` / gather-results; primary-scan declares scatter-gather |
| **substrate-node-security-audit** | **clean** | `dispatch-sub-agents` binds orchestration-patterns; reconnaissance/primary-audit declare scatter-gather |
| **work-package** | **clean / N/A** | Activities declare scatter-gather for forEach aggregation; manage-git flock/rebase = coordination N/A; analyse-challenge Applies scatter-gather |
| **work-packages** | **N/A / clean** | scatter-gather on planning/implementation; prioritize-packages *identifies* parallelizable packages (plan-level, serial execute-package policy) — not free multi-agent recipe |
| **workflow-authoring** | **N/A** | No free concurrent fan-out recipe; authoring of definitions only |
| **midnight-system-review** | **clean** | evidence-probes + activity declare scatter-gather |
| **codebase-wiki** | **N/A** | No dispatch-recipe hits in scan |
| **ponytail** | **N/A** | No dispatch-recipe hits in scan |
| **remediate-vuln** | **N/A** | No dispatch-recipe hits in scan |
| **requirements-refinement** | **N/A** | No dispatch-recipe hits in scan |

---

## Missed-by-prior-scope checklist

| Prior #0 claim | Corrected |
|----------------|-----------|
| Peers under meta beyond run-suite: none | Still true **inside meta techniques** for free-prose runtime recipes |
| Scope is meta-only technique work | **False** — workflow-design canon + prism candidates required |
| Full corpus scanned | **Was not** — only meta peer search; prism independent-lenses and dispute-analysis were not in the #0 manifest |

---

## Linkage

- Purpose / judgements: [01-change-brief.md](01-change-brief.md)  
- Blast radius / removals: [01-impact-analysis.md](01-impact-analysis.md)  
- File drafting table: [06-scope-manifest.md](06-scope-manifest.md)
