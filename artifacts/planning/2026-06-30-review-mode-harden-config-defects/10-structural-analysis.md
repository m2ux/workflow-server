---
target: work-package review-mode augmentations (#145), definition layer
analysis_date: 2026-07-01
lens: L12 structural
---

# Structural Analysis — Review-Mode Hardening (#145)

## Claim

The deepest structural property of this change set: **it closes a self-referential gap — the review workflow is being hardened, by the same technique edits, against the exact defect class it just failed to catch.** The falsifiable claim is that the five augmentations, as coupled, restore the invariant "a correct-but-harmful change reaches the Overall Rating as a blocker." If any one of the five breaks the chain (produce → classify ≥ threshold → route → render without downgrade → cap the rating), the invariant fails.

## Concealment Mechanism

The original defect hid because two boundaries silently downgraded signal: (1) the classifier had no axis on which a locally-correct change could score high, and (2) the render boundary mapped an unmatched vocabulary ("Major") to nothing. The change set attacks both: aug 4 gives the classifier the impact axes, and the render map in `review-mode.md` makes "Major→High" explicit so nothing falls through the vocabulary gap.

## Structural Invariant

The property that persists through every augmentation: **every review signal has exactly one owner and one path to the verdict.** Aug 1 is the single ingest of prior feedback; aug 3 is the single owner of the lifecycle-conservation method (aug 2 delegates to it); aug 5 consumes aug 1's tagged failures rather than re-scraping. The `2c2b9e94` dedup commit is this invariant applied reflexively — it collapsed a duplicated conservation-walk description in `review-code` into a pointer at the ledger's canonical home.

## Conservation Law — producer/clearer ledger applied to the change set itself

Applying aug 3's own method to the augmentations: the conserved resource is the **review signal (finding / triage entry / rating cap)**. Each producer must have a matching clearer (a render/route site that consumes it) on every path.

| Resource (produced) | Producer | Clearer(s) | Verdict |
|---------------------|----------|-----------|---------|
| `prior_feedback_triage` | `review-existing-feedback` (aug 1) | `review-summary` render §2; `review-test-suite` reported-failure triage (optional consume) | Matched |
| `rating_cap` | `review-existing-feedback` (aug 1) | `review-summary` §2 "Apply `{rating_cap}`" | Matched |
| `classified_findings` / `impact_axis` | `findings-classification` (aug 4) | `review-mode.md` render map (severity → rendered) | Matched |
| unmatched-producer finding | `structural-analysis` ledger (aug 3) | Bug Table → `findings-classification` → summary | Matched |
| config-swap imbalance finding | `review-code` sub-check (aug 2) | routes ≥ Minor → `findings-classification` → summary | Matched |
| reported-failure finding | `review-test-suite` triage (aug 5) | routes ≥ Minor → summary | Matched |

**No unmatched producer.** Every signal a new producer emits has a declared consumer on the render/route path. The conservation law holds for the change set.

## Meta-Law

What the ledger conceals: the ledger proves *definition-time* wiring (each output has a declared reader), but it cannot prove *runtime* ordering — that `review_pr_url`/`pr_number` are populated before `ingest-prior-feedback` runs. That ordering is asserted by step placement (after `capture-pr-reference`) and by the plan's dependency assumption, not by a schema constraint. Concrete testable consequence: if a future edit reorders `01-start-work-package.yaml` to place `ingest-prior-feedback` before PR capture, no lint or snapshot would catch it — the technique would read an unbound `{review_pr_url}`. This is a latent fragility, not a defect in this diff (current placement is correct).

## Bug Table

| # | Location | Finding | Severity | Fixable / Structural |
|---|----------|---------|----------|----------------------|
| 1 | `01-start-work-package.yaml` step order | Runtime ordering dependency (`review_pr_url` before ingest) is placement-enforced, not schema-enforced — no guard against future reorder | Informational | Structural (inherent to boolean-gated scattered path) |
| 2 | `review-code.md:45` | "now resolves" — descriptive, borderline voice | Informational | Fixable |

No fixable bug of Minor or higher severity. The change set is structurally sound.
