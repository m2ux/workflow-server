# Findings Register — Formalise reusable parallel fan-out

**Date:** 2026-08-01 · **Mode:** Update  
**Base ref:** `9922b20c` · **Primary target:** meta · **Co-edit surfaces walked:** workflow-design, prism (under shared worktree; bag `target_workflow_ids` = `[meta]`)  
**Edit surface:** `.worktrees/2026-08-01-formalise-reusable-parallel-fan-out/`

## Summary

| Severity | Open | Known |
|----------|-----:|------:|
| Critical | 0 | 0 |
| High     | 0 | 0 |
| Medium   | 0 | 0 |
| Low      | 0 | 0 |

## Findings

### meta (primary bag target)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No open audit findings on this target | quality-review | clean |

**Changed files (this change):**

| Path | Role |
|------|------|
| `meta/techniques/unit-fan-out.md` | create — same-context unit/process fan-out contract |
| `meta/techniques/cargo-operations/run-suite.md` | modify — Apply `unit-fan-out`; public I/O unchanged |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | modify — group rule `multi-op-concurrent-fan-out` |
| `meta/techniques/scatter-gather.md` | modify — agent vs process boundary + rule |
| `meta/techniques/README.md` | modify — index `unit-fan-out` |
| `meta/README.md` | modify — catalogue / tree |

**Consumer surface (into meta):**

| Referencer | Reference form | Target file | Changed? | Break risk |
|------------|----------------|-------------|----------|------------|
| `work-package/activities/11-validate.yaml` | `cargo-operations::run-suite` step bind; reads `validation_results.*` | `meta/techniques/cargo-operations/run-suite.md` | yes (Protocol only) | **None** — Inputs `build_scope`/`features` and Output `validation_results` (incl. nested fields) byte-stable |
| substrate / cicd / prism-* / work-package | `scatter-gather`, `orchestration-patterns::*`, `harness-compat::*`, `gitnexus-operations::*` | unchanged formal homes | scatter-gather boundary prose only | **None** — agent contract retained; process units routed to `unit-fan-out` |
| workflow-design resources | path citations to meta techniques | `unit-fan-out.md` (new), scatter-gather, spawn-concurrent | yes (canon links) | **None** — additive anchors |

**Fail count:** 0 (all definition guards PASS against worktree `--root`).

**Criteria walk notes (changed surface):**

- §5 / §18 / §33: free concurrent recipes replaced by Apply of unit-kind-correct contracts; domain envelope stays on callers.
- AP-140 Detect would have flagged pre-change run-suite / independent-lenses free recipes; post-change sites Apply/Honor contracts — Do-not-flag.
- Technique template, identifier qualification (`work_units`, `dispatch_concurrency`, `combine_hook`, `unit_results`, `combined_result`), Capability hygiene (no markdown links / bare braces in Capability) — clean.
- `unit-fan-out` declared outputs are shared-op return contracts; triaged `dead-output` harmless (same class as `spawn-concurrent` `results`).

### workflow-design (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No open audit findings on this co-edit surface | quality-review | clean |

**Changed files:** `resources/design-principles.md` (§33), `resources/anti-patterns.md` (AP-140), `resources/README.md` (blurbs).  
**Consumer surface into workflow-design:** empty for break risk (canon is cited outward).  
**Fail count:** 0.  
**Notes:** AP id **140** (AP-139 already taken). Detect/Do-not-flag/Fix triad present. §33 prefer/before/only-after stance with unit-kind table.

### prism (co-edit)

| Severity | Entry | Location | Evidence | Origin | Status |
|----------|-------|----------|----------|--------|--------|
| — | — | — | No open audit findings on this co-edit surface | quality-review | clean |

**Changed files:** `techniques/behavioral-pipeline/independent-lenses.md` (Apply scatter-gather parallel / spawn-concurrent).  
**Out this pass:** `dispute-analysis.md` (inventory follow-up; brief judgement #5).  
**Consumer surface:** prism activities already declare scatter-gather where needed; technique-local free-prose removed.  
**Fail count:** 0.

## Coverage ledger

Enumeration units walked against the primary target surface and co-edit changed files. Status values: `walked` | `not-applicable` | `blocked`.

### Design Principles (33 units)

| Unit | Status | Note |
|------|--------|------|
| §1–§4, §6–§16, §19–§25, §27–§32 | walked | Stance hold on changed files; no new violation |
| §5 Maximize Schema Expressiveness | walked | Formal contracts bound rather than free concurrency HOW |
| §17 Document in Positive Present | walked | New prose present-tense; no “no longer / previously” change-narrative |
| §18 Prefer Shared Capability | walked | `unit-fan-out` shared; callers Apply |
| §26 Atomic Techniques; Compose at Activities | walked | Strategy technique at meta root; callers remain ops |
| §33 Prefer Parallel Independent Work via Formal Fan-Out | walked | Authored; call sites honor |

### Schema Construct Inventory (7 units)

| Unit | Status | Note |
|------|--------|------|
| Universal obligation | walked | |
| Activity-Level Constructs | not-applicable | No activity YAML change |
| Workflow-Level Constructs | not-applicable | No workflow.yaml change |
| Technique-Level Constructs | walked | New/modified techniques conform |
| Condition Constructs | not-applicable | No condition edits |
| Checkpoint Effects | not-applicable | |
| Action Types | not-applicable | |

### Convention Conformance (1 unit)

| Unit | Status | Note |
|------|--------|------|
| Reference Conventions | walked | Strategy technique layout, versioning, indexes |

### Anti-pattern families (13 units)

| Unit | Status | Note |
|------|--------|------|
| Creation Rules | walked | |
| Structural Anti-Patterns | walked | |
| Interaction Anti-Patterns | walked | |
| Schema Expressiveness Anti-Patterns | walked | |
| Rule Hygiene Anti-Patterns | walked | |
| Description Hygiene Anti-Patterns | walked | Capability clean; I/O bind-contract prose |
| Coupling Anti-Patterns | walked | |
| Tool-Technique-Doc Consistency | walked | |
| Execution Anti-Patterns | walked | |
| Output Economy Anti-Patterns | walked | |
| Canon Hygiene Anti-Patterns | walked | |
| Technique Protocol Anti-Patterns | walked | AP-140 home; call sites fixed |
| Authoring Guidance (MR) | walked | |

**Blocked units:** none.

## Known

| Class | Check | Count | Verdict |
|-------|-------|------:|---------|
| binding-fidelity-triage | dead-output on `unit-fan-out` (`combined_result`, `unit_results`) | 2 | harmless — `shared-op-return-contract` |
| binding-fidelity-triage | pre-existing corpus entries (host triage file) | 78+ | harmless (unchanged debt) |

No prior findings-register rows for this planning folder. Known keys suppress decision-surface noise only; they remain readable here.

## Accepted exclusions

| Item | Rationale |
|------|-----------|
| `prism/techniques/dispute-analysis.md` free “(can be parallel)” | Inventory follow-up; brief judgement #5 out this pass |
| `work-package/activities/11-validate.yaml` | Public run-suite envelope stable — no co-change required |
| Deferred `check.md` diagnostics-shape follow-up in run-suite | Orthogonal; retained as call-site note |
| Server `src/` / `schemas/` | Definition-only change |

## Definition guards

All run with `--root` / positional path = edit worktree. **TOTAL_FAILS=0.**

| Guard | Result |
|-------|--------|
| validate-workflow-yaml (meta) | OK |
| validate-activities | OK |
| check-all-refs | OK |
| check-binding-fidelity | OK (triaged debt only) |
| check-resource-anchors | OK |
| check-variable-model | OK |
| check-fragments | OK |
| check-technique-template | OK |
| check-activity-technique-overlap | OK |
| check-audience | OK |
| check-self-provisioned-input | OK |
| check-identifier-qualification | OK |
| check-review-mode-gating | OK |
| check-stealth-isolation | OK |

## Sources

| Label | Path |
|-------|------|
| Change brief | [01-change-brief.md](01-change-brief.md) |
| Impact analysis | [01-impact-analysis.md](01-impact-analysis.md) |
| Scope manifest | [06-scope-manifest.md](06-scope-manifest.md) |
| Migration candidates | [06-migration-candidates.md](06-migration-candidates.md) |
| Quality-review register sections | [08-quality-review-register-sections.json](08-quality-review-register-sections.json) |
