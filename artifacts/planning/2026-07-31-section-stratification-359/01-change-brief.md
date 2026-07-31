# Change Brief — Section stratification / framing (#359)

**Workflow:** `workflow-design` (canon primary) · corpus-wide resource edit surface
**Mode:** Update
**Date:** 2026-07-31
**Change categories:** Resource · Technique (citation/link retargets only where framing moves) · (optional `src/` only if delivery C after classification)
**Change request:** Close [#359](https://github.com/m2ux/workflow-server/issues/359) as **PR2** after PR1 [#370](https://github.com/m2ux/workflow-server/pull/370) (#358 citation tail). Fresh planning folder; do not re-do #358 work.
**Baseline:** library checkout `workflows/` (edit root `{target_path}` once worktree is provisioned)
**Prior art (seed, not copy):** [2026-07-31-section-resource-grain-358-359](../2026-07-31-section-resource-grain-358-359/01-change-brief.md) rows for PR2 only

---

## Purpose

Principle 32 and AP-134 make a citation’s grain a delivery decision. That assumes a `##` boundary is a **concern** boundary so a section-scoped read is self-sufficient. Issue #359 audits that assumption: ~69 framings live outside any `##` a section fetch can return; three cross-section dependencies need anchored links; canon lacks a clause that content a section-scoped reader depends on lives in a section.

| Goal | Meaning |
|------|---------|
| Classify ~69 framings | Per resource: delete duplicate / mint `##` for operative unique / leave orientation |
| Canon + AP | Principle 30 or 32 clause; AP-134 sibling `framing-outside-any-section` |
| Cross-section triad | `planning-readme#progress-status-call-sites`; `architecture-summary#diagram-selection`; `pr-description` glyph key for `#link-row-forms` |
| Classify before C | Variant C only if arithmetic is mostly operative-and-unique; `src/` as separate commit/slice |
| Keep #358 out | No citation-tail redo; no top-20 pairs; no anti-patterns body-size work |

**Out of scope:**

- #358 citation tail (complete on PR [#370](https://github.com/m2ux/workflow-server/pull/370))
- Top-20 whole-resource citation pairs (separate branch)
- Anti-patterns eager-bundle exclusion / body size for #358 measurement
- `review-summary` → `review-mode` and `validate-specification` → `validation-rubric` residue (#356)
- Shipping C before full classify arithmetic

---

## Delivery decision — PR2 only (authoritative)

| PR | Issue | Surface | Must not |
|----|-------|---------|----------|
| **PR 2** | #359 (refs #358 / PR #370) | Framing classify + resource edits + canon (principle 30 or 32 clause; AP-134 sibling); three anchored cross-section fixes. Variant **C** only after classification supports it — if it touches `src/`, separate commit | Ship delivery-first; cement duplicates; re-do #358 tail; mix C into pure-corpus commits |

---

## Dimensions

| Dimension | This run's shape |
|-----------|------------------|
| **purpose** | Section-scoped reads are self-sufficient; framing classified; cross-section deps anchored; optional ledger-keyed framing delivery only after numbers |
| **activity list** | Unchanged — no new/removed workflow-authoring or workflow-design activities |
| **checkpoints** | Unchanged |
| **artifacts** | Standard authoring set for this update run |
| **rules** | workflow-design: extend principle 30 and/or 32; add AP-134 sibling for framing outside any section |
| **techniques** | Link/citation retargets only where a framing moves into a named section or into a technique |
| **resources** | Framing delete / new `##` / leave; fix the three named cross-section sites; optional mass path-pin after classify |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | #359 delivery variant C after classify? | Arithmetic on duplicate vs operative vs orientation not yet measured across all ~69 | Mostly operative → C (`src/` slice separate); mostly duplicate → deletions only, no delivery change |
| 2 | Principle clause on 30 vs 32 (or both)? | Issue allows either; both are section-grain homes | Prefer the principle whose existing prose already owns self-sufficient sections; extend in place |
| 3 | Path-pin order for framing edits | Full ~69 path list emerges from classify | Draft fixed rows 64–68 first; framing waves after inventory |

---

## Confirmation ask

Approve this brief: **PR2 / #359 only**, classify-before-delivery, fixed canon + three cross-section anchors, framing classify with path-pin after arithmetic, no #358 redo, no `src/` unless C is justified post-classify.
