# Change Brief — Section resource grain (#358 / #359)

**Workflow:** `workflow-design` (canon primary) · corpus-wide technique/resource edit surface
**Mode:** Update
**Date:** 2026-07-31
**Change categories:** Resource · Technique · (optional scripts/ guard) · (optional src/ only if #359 delivery C after classification)
**Change request:** Close #358 citation-grain tail and #359 section stratification / framing as **two sequenced PRs**.
**Baseline:** library checkout `workflows/` (edit root `{target_path}` once worktree is provisioned)

---

## Purpose

Principle 32 and AP-134 make a citation’s grain a delivery decision. #358 registers the remaining pre-principle-32 corpus (~100 whole-resource technique citations under ~8k chars each) and requires a per-site verdict: cite sections, leave whole-resource when the technique reads most of the body, or split the resource (principle 30). #359 audits the assumption that a `##` boundary is a concern boundary: ~69 framings need classify-then-treat (delete duplicate / name operative unique / leave orientation), three cross-section dependencies need anchored links, and canon gains a clause that content a section-scoped reader depends on lives in a section. Delivery variant C is allowed only after classification arithmetic supports it, and must not mix into pure-corpus PRs unless necessary.

| Goal | Meaning |
|------|---------|
| PR 1 lands #358 | Tail citations fixed or recorded as whole-resource-economical; optional bare+anchor guard; no src/ required |
| PR 2 lands #359 | All framings classified; cross-section deps fixed; principle 30/32 + AP-134 sibling; C only if numbers support it |
| Keep blast radii separate | Citations vs structure/canon/(optional server); #358 merges without waiting on framing audit |
| Classify before delivery | Never ship C (or any delivery-first fix) before the 69-framing arithmetic |

**Out of scope:**

- Anti-patterns resource (over eager cap; excluded throughout)
- Top-20 citation pairs (separate branch)
- `review-summary` → `review-mode` and `validate-specification` → `validation-rubric` (whole-resource economical; residue is server/bundler work with #356)
- Collapsing to one PR unless a concrete site cannot be correctly cited until its resource is stratified (discover during intake/scope — **default remains two**)

---

## Delivery decision — TWO PRs (authoritative)

| PR | Issue | Surface | Must not |
|----|-------|---------|----------|
| **PR 1** | #358 | Technique citations (+ optional `scripts/` guard). Pure `workflows/` definitions. | Wait on framing audit; mix src/; touch anti-patterns body for this tail |
| **PR 2** | #359 (refs #358) | Framing classification + resource edits + canon (principle 30 or 32 clause; AP-134 sibling `framing-outside-any-section`); three anchored cross-section fixes. Variant **C** only after classification supports it — if it touches `src/`, separate commit or third PR slice | Ship delivery-first; cement duplicates; mix C into pure corpus without necessity |

**Why not one PR:** different blast radii; #359 requires classify-before-delivery independent of finishing the entire #358 tail; reviewability; #358 can land first. Merge only if a concrete site blocks correct citation until stratification.

---

## Dimensions

| Dimension | This run's shape |
|-----------|------------------|
| **purpose** | Corpus + canon fidelity to section-grain delivery and self-sufficient section reads; optional mechanical guard; optional ledger-keyed framing delivery only after numbers |
| **activity list** | Unchanged — no new/removed workflow-authoring or workflow-design activities |
| **checkpoints** | Unchanged |
| **artifacts** | Unchanged planning artifact set for this authoring run |
| **rules** | workflow-design: extend principle 30 and/or 32; add AP-134 sibling for framing outside any section. Technique rules elsewhere only as citation/link edits require |
| **techniques** *(request-driven, outside update default set)* | ~100 sites: retarget markdown links to `#section`, leave whole-resource with recorded verdict, or split resource then cite. Optional script guard for bare citation that also anchors the same resource |
| **resources** *(request-driven)* | PR1: splits only where principle 30 applies. PR2: framing delete / new `##` / leave; fix `planning-readme#progress-status-call-sites`, `architecture-summary#diagram-selection`, `pr-description` glyph key |

---

## Open judgements

| # | Judgement | Why it is open | Effect if decided either way |
|---|-----------|----------------|------------------------------|
| 1 | Any #358 site blocked on #359 stratification? | Default is independent PRs; a blocking site would force a one-PR or ordered dependency for that resource only | Isolated merge of those sites into PR2 or a thin coupling note; **default remains two PRs** |
| 2 | #359 delivery variant C after classify? | Arithmetic on duplicate vs operative vs orientation not yet measured across all ~69 | Mostly operative → C (src/ slice separate); mostly duplicate → deletions only, no delivery change |
| 3 | Optional bare+anchor mechanical guard in PR1? | Issue marks it worth adding; not required to close the tail | PR1 includes `scripts/` check vs defers to follow-up |

---

## Confirmation ask

Approve this brief: **two sequenced PRs** (#358 then #359), corpus-wide technique/resource work with `workflow-design` as canon home, classify-before-delivery on #359, and no src/ in PR1.
