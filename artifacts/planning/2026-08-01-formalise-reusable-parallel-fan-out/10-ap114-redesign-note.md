# AP-114 redesign note — quality-review false negative

**Date:** 2026-08-01  
**Planning folder:** `2026-08-01-formalise-reusable-parallel-fan-out`  
**Branch / PR:** `workflow/meta-formalise-reusable-parallel-fan-out` · [#385](https://github.com/m2ux/workflow-server/pull/385)

## What passed incorrectly

Quality-review closed with **zero open findings** while the drafted surface still violated **AP-114** `pass-orchestration-in-technique`:

| Site | Evidence that should have Detected |
|------|-------------------------------------|
| `meta/techniques/cargo-operations/run-suite.md` | Protocol step `Apply [unit-fan-out]` |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | Group rule: Protocols Apply unit-fan-out |
| `prism/.../independent-lenses.md` | Protocol / Rules `Apply [scatter-gather]` / spawn-concurrent |
| Canon AP-140 Fix | “Apply the unit-kind-correct contract” from a technique façade |

AP-114 Detect keys on Protocol **`Apply [technique]`** / `::` work invoke. That evidence was present and was **not** recorded as a finding.

## Root cause (audit false negative)

1. **Family checkbox without per-entry Detect.** Technique Protocol family was marked “walked” as a section-level checkbox. Audit-canon Protocol step 2 requires honouring **each entry’s** Detect / exclusions / Fix. Walking the family as “covered” is not the same as applying AP-114 Detect to every changed Protocol.

2. **Detect keys were present and ignored.** `Apply unit-fan-out` on run-suite, `Apply scatter-gather` on independent-lenses, and the cargo TECHNIQUE rule were treated as success signals for “formalisation,” not as AP-114 Detect hits.

3. **AP-140 Fix was itself AP-114.** Remediation of free concurrent prose was celebrated as “callers Apply named contracts.” That Fix steers authors into Protocol Apply of fan-out techniques — the same smell AP-114 names. §18 / §26 notes that celebrated “callers Apply” reinforced the false story.

4. **§26 marked walked without structural evidence.** Stance walk claimed atomic techniques / compose at activities while technique→technique Apply remained on the edit surface.

5. **No automated guard encodes AP-114.** The smell is agent judgment only. When the agent optimizes for the narrative of the change (kill free prose) over entry-level Detect, the false negative is silent.

6. **structural-evidence-first was inverted.** `Apply [unit-fan-out]` was treated as good evidence of formalisation, not as Detect evidence for pass-orchestration-in-technique.

## Correct invariant

**Techniques do not Apply techniques for work. Activities bind parameterized techniques as steps.**

| Concern | Locus |
|---------|--------|
| Process/shell suite fan-out | Activity binds `unit-fan-out` with `work_units`, `dispatch_concurrency`, domain budgets |
| Fold unit outcomes → product | Atomic combine op (e.g. `cargo-operations::run-suite` inputs = `unit_results`) |
| Agent/lens parallel | Activity declares / binds scatter-gather (and spawn-concurrent as needed); lens technique stays atomic lens work |
| Free concurrent recipe | AP-140 — bind formal contract at **activity**; do not Protocol-Apply from a façade (see AP-114) |

## Redesign delivered on this branch

1. **`unit-fan-out`** — bindable strategy; units are invocation specs; no nested technique Apply; gather ends at `unit_results` (combine is a following activity step).
2. **`run-suite`** — pure combine over `unit_results` → `validation_results` (no Protocol Apply of unit-fan-out).
3. **`work-package/activities/11-validate.yaml`** — compose unit roster → `unit-fan-out` → `run-suite` combine (initial + revalidate loop).
4. **cargo TECHNIQUE** — multi-op concurrent suites bound via **activity steps**.
5. **`independent-lenses`** — atomic lens work; parallel is activity-owned (structural-pass already declares scatter-gather).
6. **`scatter-gather` / §33 / AP-140 / AP-114 exemplar** — activity bind locus; AP-140 Fix cross-links AP-114.

## Open until closed on surface

- **High — AP-114** on the prior design sites until the redesign is on the branch and a second Detect walk records zero Protocol `Apply [technique]` for work on the changed surface.

## Prevention checklist (quality-review)

- [ ] For every anti-pattern entry in scope, run **that entry’s Detect** on every changed technique Protocol/Rules — not family-level “walked.”
- [ ] Grep changed `*.md` for `Apply [` and `::` work invokes in Protocol; treat each hit as a candidate AP-114 finding unless Do-not-flag clearly applies.
- [ ] Do not treat “Apply of shared capability” as automatic §18 success when the Apply is technique→technique for orchestration.
- [ ] §26 / AP-114 require **activity step binds** as structural evidence when fan-out or multi-op pipelines are in scope.
