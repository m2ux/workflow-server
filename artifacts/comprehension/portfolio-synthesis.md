# Portfolio Synthesis — Review-Mode Path Comprehension

> **Target**: Work-package review-mode path. **Lenses**: pedagogy (06), rejected-paths (09). **Work package**: #145. **Date**: 2026-06-30.

Two complementary lenses applied independently to the review-mode comprehension. Pedagogy surfaced the mental model and hidden assumptions; rejected-paths surfaced the design alternatives and trade-offs. Below: where they converge (high confidence) and where each is unique (the value-add).

## Convergent findings (both lenses, high confidence)

| Finding | Pedagogy framing | Rejected-paths framing |
|---------|------------------|------------------------|
| **Review mode is a scattered path, not a localized feature** | Newcomer must assemble the path from one boolean across 10 files | The dedicated-schema alternative was rejected for engine simplicity; locality was the price |
| **The severity scale is forked in practice** | Reader assumes "one scale" but three exist | A de-facto rejection of the intended single scale crept back; aug 4 must re-converge or formalize a map |
| **"Conservation law" naming overstates coverage** | Teaching trap: the L12 name reads as if producer/clearer balance is proven | Editing the shared lens vs a local sub-check is a real trade-off; the name is not a ledger |
| **Prior-feedback ingest is genuinely absent** | Mental model "we review the PR" silently excludes "we read prior comments" | Reusing `respond-to-pr-review` is the tempting-but-wrong path; ingest-before-verdict is a distinct contract |

## Unique findings

**Pedagogy only:**
- "Skipped means gated, not removed" — `implement` appears in the path but is condition-gated; a top-to-bottom reader misreads this.
- "Document ↔ apply mirror" pattern must be recognized to understand why twin steps coexist.
- `findings-classification`'s one-technique-three-call-sites fan-out is the non-obvious propagation surface for augmentation 4.

**Rejected-paths only:**
- Per-augmentation table of tempting-but-rejectable paths (reuse `respond-to-pr-review`; standalone config technique; parallel severity output; mega reported-failure step).
- Meta-observation: the five augmentations are **one** rejected-path reinstatement (global-safety reasoning) decomposed into five edits — so their cross-file coupling is the load-bearing concern.

## Summary table

| # | Finding | Lens(es) | Convergent / Unique |
|---|---------|----------|---------------------|
| 1 | Review mode = scattered boolean-gated path | pedagogy + rejected-paths | Convergent |
| 2 | Three divergent severity scales | pedagogy + rejected-paths | Convergent |
| 3 | "Conservation law" overstates coverage | pedagogy + rejected-paths | Convergent |
| 4 | Prior-feedback ingest absent; reuse is wrong path | pedagogy + rejected-paths | Convergent |
| 5 | "Skipped = gated, not removed" | pedagogy | Unique |
| 6 | Document↔apply twin-step pattern | pedagogy | Unique |
| 7 | findings-classification 3-call-site fan-out | pedagogy | Unique |
| 8 | Per-augmentation rejected-path table | rejected-paths | Unique |
| 9 | Five augmentations = one rejected-path reinstatement | rejected-paths | Unique |

## Implication for planning

The convergent findings define the **invariants the augmentations must restore**; the unique findings define the **hazards while restoring them** (severity fan-out, gating semantics, shared-lens blast radius, render-time downgrade). The single most load-bearing planning decision is the severity-scale resolution (convergent finding #2/#3), because it sits at the junction of augmentations 4 (axes), 1 (rating cap), and 3 (ledger findings) and every one of them renders through `review-summary`.
