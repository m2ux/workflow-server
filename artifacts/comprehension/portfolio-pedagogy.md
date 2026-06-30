# Portfolio Lens — Pedagogy

> **Target**: Work-package review-mode path ([review-mode-path.md](review-mode-path.md)) and the underlying `work-package/` definitions.
> **Lens**: pedagogy (06) — surface the hidden assumptions and the mental model a newcomer must build to understand and safely modify this subsystem.
> **Work package**: #145
> **Date**: 2026-06-30

## What a newcomer must already believe to read this code

1. **"Review mode is a path, not a feature."** The single biggest conceptual hurdle: there is no review-mode module, class, or schema field beyond one boolean. A reader expecting a `ReviewMode` construct will not find it; they must instead grep `is_review_mode` across ten activity files and assemble the path mentally. The codebase assumes this gestalt is already held.

2. **"Skipped means gated, not removed."** `implement` still appears in the activity list and in the snapshot path; it is "skipped" only because its steps and inbound transition carry `is_review_mode != true`. A newcomer who reads the activity list top-to-bottom will wrongly think implement runs in review mode.

3. **"Document ↔ apply is a mirror, gated on the same boolean."** Every apply step has a document twin (`apply-cleanup` ↔ `document-cleanup-recommendations`, `fix-failures` ↔ `document-failures`). The reader must recognize this pairing pattern to understand why two superficially redundant steps coexist.

4. **"One technique, three call sites."** `findings-classification` runs in validate, post-impl-review, and submit-for-review. The reader must hold that a single severity edit fans out to all three — non-obvious because the call sites are in different files with different step ids (`document-failures`, `classify-and-route-findings`, `consolidate-review-findings`).

5. **"The resource owns the format, the technique only fills it in."** `review-summary` deliberately defers all structure to `resources/review-mode.md#consolidated-review-format`. A reader who tries to understand the output shape from the technique alone will find an almost-empty protocol; the knowledge lives in the resource.

## Assumptions the augmentations will stress

- **Assumption: severity is judged by impact (prose), so impact axes are "already there."** False in practice — `findings-classification` §1 *says* "judge by impact, not surface" but enumerates only security/data-loss/correctness/maintainability/style. There is no axis for *unbounded growth* or *economic* harm, which is exactly why the #145 defect rated "safe." Augmentation 4 must make the implicit explicit.
- **Assumption: the structural lens already proves conservation.** The L12 lens names a "conservation law," which reads as if producer/clearer balance is checked — but it is a dialectical reasoning device, not a concrete producer-vs-clearer ledger over all paths. The naming creates a false sense of coverage (a teaching trap).
- **Assumption: all prior feedback is considered because the workflow "reviews the PR."** Nothing reads existing PR comments before the verdict; `respond-to-pr-review` only handles the workflow's *own* PR feedback after posting. The mental model "we review the PR" silently excludes "we read what others already said about it."

## Teaching takeaways for the edit phase

- Lead any new step's intent through its **gating condition**, since gating *is* the semantics here.
- When adding `review-existing-feedback`, name its output so the rating-cap relationship to `review-summary` is legible (don't bury it behind a generic flag).
- Make augmentation 4's new axes explicit list items in the protocol — the existing "judge by impact" prose is where the assumption hid.
