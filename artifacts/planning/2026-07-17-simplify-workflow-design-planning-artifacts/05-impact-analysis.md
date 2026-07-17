# Impact Analysis — slim workflow-design planning artifacts

**Workflow:** `workflow-design` v1.24.1  
**Mode:** Update  
**Date:** 2026-07-17  
**Change source:** [03-design-specification.md](03-design-specification.md)  
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)

---

## Summary

Prose / contract slimming only — **no activities added, removed, or reordered.** Topology, technique/resource file set, variables, and checkpoint options/effects stay intact. Blast radius is persist-protocol text, planning templates, and a few checkpoint *messages* that stack peer artifacts.

**removal_count:** 12

---

## 1. Impact classification

### Directly modified

| File | Why |
|------|-----|
| `techniques/context-loading.md` | Persist contracts: short tables, only what the change needs |
| `techniques/persist-design-specification.md` | Spec shape = purpose + dimension deltas |
| `techniques/impact-analysis.md` | Decision-facing report; skip unaffected per-file essays |
| `techniques/scope-definition.md` | Lean manifest; minimal structural/drafting sections |
| `techniques/pattern-analysis.md` | Leaner comparison artifact |
| `techniques/assemble-file-approach.md` | Per-file delta only |
| `techniques/review-drafted-file.md` | Delta / attestation focus |
| `techniques/compile-report.md` | Rolled-up report; detail in satellites |
| `techniques/create-completion-doc.md` | Close-out links decisions elsewhere |
| `resources/design-context-readme.md` | Index: summary + links, not restatements |
| `resources/compliance-report.md` | Finding tables; satellites for detail |
| `resources/completion-artifact.md` | Keep close-out short; link decisions |
| `activities/01-intake-and-context.yaml` | Change-request / literacy: one primary link |
| `activities/08-quality-review.yaml` | Multi-link disposition → primary report |

### Possibly touched (draft-time)

| File | Why |
|------|-----|
| `techniques/persist-report.md` | Only if filename/body guidance needs a lean note |
| `techniques/summarize-findings.md` | Align post-update summary with lean report contract |
| `techniques/synthesize-update-specification.md` | If update synthesis still pushes encyclopedia specs |
| `resources/design-principles.md` | Only if Output Economy §11 needs a discoverability tweak |
| `workflow.yaml` | Version bump at commit; no structural/variable change planned |

### Unaffected (summary)

All other activity YAML (options/effects/topology), remaining ~25 technique leaves, other resources, and workflow README — no planned edit this pass. No obsolete files.

---

## 2. Integrity checks

| Check | Verdict |
|-------|---------|
| Transitions / `initialActivity` / reachability | **Pass** — activity graph unchanged |
| Technique / resource references | **Pass** — no file deletes or renames |
| Variables / `setVariable` / step conditions | **Pass** — no variable add/remove/type change |

Side-effects: thinner persist contracts change *generated* planning artifact shape only; gates still bind the same path variables.

---

## 3. Removals inventory

| # | Location | Removed | Preserved |
|---|----------|---------|-----------|
| 1 | `design-context-readme` Design Decisions rules | Full rationale / choice capture in README body | Short pointers + links to canonical artifacts |
| 2 | `design-context-readme` Scope Manifest rules | Complete file-list mirror in README | Link/pointer to scope manifest |
| 3 | `context-loading` Persist Format Conventions | Expansive conventions dump as the artifact contract | Short table: YAML + project conventions needed now |
| 4 | `context-loading` Persist Applicable Constructs | Full construct catalog dump | Only constructs this change needs |
| 5 | `impact-analysis` Classify Impact | Per-file essays for unaffected files | Classification summary + justified direct/indirect/removed rows |
| 6 | `scope-definition` structural/drafting persist | Pattern-comparison essay + long drafting rationale in the manifest | File table + minimal structural/drafting notes |
| 7 | `pattern-analysis` Persist | Full extract-and-compare narrative body | Lean alignment / divergence table |
| 8 | `01-intake` `change-request-confirmed` message | Stacked peer links (inventory + README) | One primary link + short subject |
| 9 | `08-quality-review` `review-disposition` message | Four stacked finding-file links in the gate | Primary compliance report (+ verified only if the gate needs it) |
| 10 | `compliance-report` / `compile-report` | Expectation that the rolled-up report embeds full principle + anti-pattern prose dumps | Severity finding tables; satellite files for detail |
| 11 | `assemble-file-approach` / `review-drafted-file` persist bodies | Constructs + patterns + decisions essay per file | Per-file delta (and removal compare on update) |
| 12 | `create-completion-doc` / `completion-artifact` | Restated design-decision / alternatives essay in COMPLETE | Link to README / assumptions; COMPLETE keeps delivery + limitations |

All 12 are intentional Output Economy reductions (spec § content-preservation).

---

## Decision ask

Confirm impact scope and that every flagged removal is intentional — or choose revise / preserve.
