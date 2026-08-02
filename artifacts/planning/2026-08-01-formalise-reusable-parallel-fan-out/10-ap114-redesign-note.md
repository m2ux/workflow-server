# Redesign note — `pass-orchestration-in-technique` quality-review false negative

**Date:** 2026-08-01  
**Planning folder:** `2026-08-01-formalise-reusable-parallel-fan-out`  
**Branch / PR:** `workflow/meta-formalise-reusable-parallel-fan-out` · [#385](https://github.com/m2ux/workflow-server/pull/385)

## What passed incorrectly

Quality-review closed with **zero open findings** while the drafted surface still violated `pass-orchestration-in-technique`:

| Site | Evidence that should have Detected |
|------|-------------------------------------|
| `meta/techniques/cargo-operations/run-suite.md` | Protocol step `Apply [unit-fan-out]` |
| `meta/techniques/cargo-operations/TECHNIQUE.md` | Group rule: Protocols Apply unit-fan-out |
| `prism/.../independent-lenses.md` | Protocol / Rules `Apply [scatter-gather]` / spawn-concurrent |
| Canon `prose-based-dispatch-patterns` Fix | “Apply the unit-kind-correct contract” from a technique façade |

`pass-orchestration-in-technique` Detect keys on Protocol **`Apply [technique]`** / `::` work invoke. That evidence was present and was **not** recorded as a finding.

## Root cause (audit false negative)

1. **Family checkbox without per-entry Detect.** Technique Protocol family was marked “walked” as a section-level checkbox. Audit-canon Protocol step 2 requires honouring **each entry’s** Detect / exclusions / Fix. Walking the family as “covered” is not the same as applying `pass-orchestration-in-technique` Detect to every changed Protocol.

2. **Detect keys were present and ignored.** `Apply unit-fan-out` on run-suite, `Apply scatter-gather` on independent-lenses, and the cargo TECHNIQUE rule were treated as success signals for “formalisation,” not as `pass-orchestration-in-technique` Detect hits.

3. **`prose-based-dispatch-patterns` Fix was itself `pass-orchestration-in-technique`.** Remediation of free concurrent prose was celebrated as “callers Apply named contracts.” That Fix steers authors into Protocol Apply of fan-out techniques — the same smell `pass-orchestration-in-technique` names. Prefer Shared Capability / Atomic Techniques notes that celebrated “callers Apply” reinforced the false story.

4. **Atomic Techniques marked walked without structural evidence.** Stance walk claimed atomic techniques / compose at activities while technique→technique Apply remained on the edit surface.

5. **No automated guard encodes `pass-orchestration-in-technique`.** The smell is agent judgment only. When the agent optimizes for the narrative of the change (kill free prose) over entry-level Detect, the false negative is silent.

6. **structural-evidence-first was inverted.** `Apply [unit-fan-out]` was treated as good evidence of formalisation, not as Detect evidence for `pass-orchestration-in-technique`.

## Correct invariant

**Multi-op composition façades and multi-unit coordination prefer activity structure.** Activities bind parameterized techniques as steps. Peer technique cites for documentation or single-capability work remain allowed. Dispatch semantics still lift to the activity layer (`coordination-in-technique`, `prose-based-dispatch-patterns`).

| Concern | Locus |
|---------|--------|
| Process/shell suite fan-out | Activity pattern / spine (`process-unit-fan-out`) with `work_units`, `dispatch_concurrency`, domain budgets |
| Fold unit outcomes → product | Atomic combine op (e.g. `cargo-operations::run-suite` inputs = `unit_results`) |
| Agent/lens parallel | Activity declares / binds scatter-gather (and spawn-concurrent as needed); lens technique stays atomic lens work |
| Free concurrent recipe | `prose-based-dispatch-patterns` — bind formal coordination at **activity**; do not Protocol-Apply a multi-op façade (`pass-orchestration-in-technique`) |

## Redesign delivered on this branch

1. **Process-unit pattern activity** — seed → execute/wait-all/gather → `unit_results` (strategy technique `unit-fan-out` removed).
2. **`run-suite`** — pure combine over `unit_results` → `validation_results` (no Protocol Apply of fan-out).
3. **`work-package/activities/11-validate.yaml`** — mirrors process-unit spine + `run-suite` combine (initial + revalidate loop).
4. **cargo TECHNIQUE** — multi-op concurrent suites bound via **activity steps**.
5. **`independent-lenses`** — atomic lens work; parallel is activity-owned; peer capability cites restored.
6. **`scatter-gather` / Prefer Parallel Independent Work / `prose-based-dispatch-patterns` / `pass-orchestration-in-technique`** — activity bind locus; dispatch Fix cross-links the façade smell by name.

## Open until closed on surface

- **High — `pass-orchestration-in-technique`** on the prior design sites until the redesign is on the branch and a second Detect walk records zero Protocol `Apply [technique]` multi-op façades for work on the changed surface.

## Prevention checklist (quality-review)

- [ ] For every anti-pattern entry in scope, run **that entry’s Detect** on every changed technique Protocol/Rules — not family-level “walked.”
- [ ] Grep changed `*.md` for `Apply [` and `::` work invokes in Protocol; treat each multi-op façade hit as a candidate `pass-orchestration-in-technique` finding unless Do-not-flag clearly applies.
- [ ] Do not treat “Apply of shared capability” as automatic Prefer Shared Capability success when the Apply is a multi-op orchestration façade.
- [ ] Atomic Techniques / `pass-orchestration-in-technique` require **activity step binds** as structural evidence when fan-out or multi-op pipelines are in scope.
