# Architecture Summary — Review-Mode Hardening (#145)

**Change:** `work-package` workflow review-mode path, definition layer. 9 files, +188/−3.
**For:** reviewers and stakeholders who need the shape of the change without reading every diff.

## What changed, structurally

The review-mode path of the `work-package` workflow is a **scattered boolean-gated path** — review-only
behavior lives on activities that are already on the standard walk and is switched on by
`is_review_mode == true`, not a separate workflow. Every augmentation therefore attaches to an existing
activity and is gated on that flag. The change adds one new technique and extends five existing artifacts,
wired so each new signal has exactly **one producer and one path to the verdict**.

```
start-work-package                     validate
  capture-pr-reference                   assess-test-coverage
  └─ ingest-prior-feedback [review]      └─ triage-reported-failures [review]
       (review-existing-feedback)             (review-test-suite: reported-failure
       → prior_feedback_triage                 triage + multi-instance gate)
       → rating_cap
                                        post-impl-review (classify + structural)
                                          findings-classification: impact axes
                                          structural-analysis: producer/clearer ledger
                          │
                          ▼
        review-summary  ──renders──▶  resources/review-mode.md
          reads prior_feedback_triage,   (authoritative format owner)
          rating_cap; applies cap        severity render map: Major→High …
          to Overall Rating              Prior Feedback Triage section + rating-cap rule
```

## The five augmentations and where they live

| Aug | Concern | Host (activity / technique) | Signal produced |
|-----|---------|------------------------------|-----------------|
| 1 | Ingest + rebut prior PR feedback before verdict | `01-start-work-package.yaml` → `review-existing-feedback.md` (NEW) | `prior_feedback_triage`, `rating_cap` |
| 2 | Config/associated-type swap blast-radius | `review-code.md` (Bound-Review-Scope sub-check) | config-swap imbalance finding |
| 3 | Set-wide producer/clearer conservation ledger | `prism/techniques/structural-analysis.md` (shared lens) | unmatched-producer Bug-Table finding |
| 4 | Correct-but-harmful impact severity axes | `findings-classification.md` + `review-mode.md` render map | `classified_findings` + `impact_axis` |
| 5 | Reported-failure triage + multi-instance gate | `11-validate.yaml` → `review-test-suite.md` | reported-failure / coverage findings |

## Key architectural decisions

- **DD-1 — render-time severity map, not a rename.** `findings-classification` keeps its canonical
  Critical/Major/Minor/Nit/Informational scale (reused at 3 call sites); `review-mode.md` owns an explicit
  Major→High / Minor→Medium / Nit→Low render map. This closes the original downgrade boundary without
  touching the `needs_code_fixes` ≥ Minor routing semantics or the other two call sites.
- **DD-2 — extend the shared structural lens, don't fork.** The producer/clearer ledger extends the lens's
  existing Conservation Law generically (additive, no signature change), so every lens consumer benefits and
  aug 2 delegates to it rather than duplicating the walk — single owner for the lifecycle method.
- **DD-3 — aug 1 binds after PR capture.** `ingest-prior-feedback` sits after `capture-pr-reference` so
  `review_pr_url`/`pr_number` exist, and strictly before any analysis activity.
- **DD-4 — single ingest.** A thread-reported runtime error is captured once by aug 1 and *consumed* by
  aug 5 (keyed off `prior_feedback_triage`), never re-scraped — no double-count.

## Boundaries respected

- Definition-layer only: no server `src/` or `schemas/` change (mode is state-driven); typecheck clean.
- Standard-mode walks unperturbed: every new step is gated `is_review_mode == true`; standard-mode
  `stepsExecuted` snapshots unchanged.
- `definition-lint` `BASELINE_UNRESOLVED = []` and all 6 `workflow-e2e` policies reach `complete`.

## Follow-up

E2E `[review-mode]` snapshot + robot-manifest baseline regeneration (Task 8) is deferred to completion /
cross-repo coordination — the harness resolves definitions from the main-checkout working tree, so the
baseline is regenerated once the merged definitions are in place. Tracked in `11-validation.md` and the
README footer.
