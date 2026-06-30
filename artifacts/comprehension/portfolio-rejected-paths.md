# Portfolio Lens — Rejected Paths

> **Target**: Work-package review-mode path ([review-mode-path.md](review-mode-path.md)) and the underlying `work-package/` definitions.
> **Lens**: rejected-paths (09) — surface the design alternatives that were considered and discarded, and the trade-offs that decision encodes; project the same for the upcoming augmentations.
> **Work package**: #145
> **Date**: 2026-06-30

## Rejected paths visible in the current design

1. **A dedicated review-mode schema (rejected).** The obvious alternative — a `mode: review` schema construct with a `skipActivities` list and a `defaults` block — was explicitly rejected in favor of one boolean + conditions. *Why rejected*: it would create a second control path through the engine, doubling the surface the E2E harness must cover and breaking the "one walker, six policies" model. *Trade-off accepted*: behavior is scattered across activities; locality is sacrificed for engine simplicity and test reuse.

2. **A separate severity scale per technique (rejected, then partially regressed).** The design intends one scale (`findings-classification`'s Critical/Major/Minor/Nit/Informational). But `review-code` and `resources/review-mode.md` carry their own scales — a *de facto* rejection that crept back in. This is an unintended fork, not a deliberate path; augmentation 4 must decide whether to re-converge (the originally rejected fork) or formalize a render-time mapping.

3. **Fixing findings in review mode (rejected by design).** Standard mode applies fixes; review mode documents. The "apply in review mode" path is deliberately gated out everywhere — review never mutates the reviewed code. *Trade-off*: the reviewer cannot demonstrate a fix, only recommend it.

## Rejected paths to weigh for the augmentations

| Augmentation | Tempting path likely to be rejected | Better path | Why |
|--------------|--------------------------------------|-------------|-----|
| 1 (prior feedback) | Reuse `respond-to-pr-review` for prior comments | New `review-existing-feedback` technique | `respond-to-pr-review` is post-posting, own-PR feedback with a different protocol (categorize → implement → respond). Ingest-and-rebut-before-verdict with Confirmed/Refuted/Superseded triage and a rating cap is a distinct contract. |
| 2 (config blast-radius) | A standalone new technique for config swaps | Sub-check inside `review-code` §2 (which already does gitnexus blast-radius) | `review-code` already runs `detect-changes` + `impact upstream`; the associated-type/trait-impl swap check is a specialization of that existing step, not a new pipeline stage. |
| 3 (conservation ledger) | Edit the shared `prism/structural-analysis` lens | Possibly a work-package-local `review-code` structural sub-check | Editing the shared prism lens raises blast radius to every workflow that uses it; a local sub-check is contained. But the lens "speaks conservation" already — genuine trade-off to record in planning, not auto-decide. |
| 4 (severity axes) | Add a parallel "impact severity" output alongside `needs_code_fixes` | Extend the existing single scale + reuse `needs_code_fixes` (Major+ already routes) | A parallel scheme violates the `single-severity-scale` rule the technique explicitly states; the existing ≥Minor→flag mechanism already routes Major+, so no new flag is needed. |
| 5 (reported-failure triage) | One mega-step that does triage + coverage gate | Split: multi-instance gate in `review-test-suite`, reported-failure triage as a validate step (or technique) | Different concerns (coverage shape vs runtime-error provenance); also avoids overlap with augmentation 1's prior-comment ingest. |

## The deepest rejected path (meta-observation)

The original #145 defect is itself the consequence of a rejected path the *review* took: it judged "is this line correct?" and rejected "is this line correct *and* globally safe?" The five augmentations collectively re-instate the rejected path — global-safety reasoning (blast radius, conservation, impact severity, prior-warning ingest, runtime-failure tracing) — at five distinct stages. The coherent way to read the work package is as *one* rejected-path reinstatement decomposed into five bindable edits, which is why their cross-file coupling (severity ↔ flag, cap ↔ render, ledger ↔ validate) matters more than any single edit.
