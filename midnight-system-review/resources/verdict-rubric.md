---
name: verdict-rubric
description: The 1-5 merge-readiness scale computed from accepted findings only — level definitions, calibration anchors from real reviews, run status vocabulary, and the verdict-to-review-type mapping.
metadata:
  order: 4
---

# Merge-Readiness Verdict Rubric

The verdict is computed from the **accepted** findings only. Observations and dismissed candidates never move the score — they may appear in the rationale and the report, but a review with zero accepted findings is merge-ready no matter how many observations it carries. Compute mechanically from the level definitions; record which line fired.

## The Scale

| Verdict | Meaning | Definition (accepted-set profile) |
|---------|---------|-----------------------------------|
| 5/5 | Ready to merge | Zero accepted findings |
| 4/5 | Merge with follow-ups | Accepted findings exist, all low risk/impact — none threatens a production guarantee |
| 3/5 | Fix before merge, scope is contained | At least one medium-risk accepted finding, no high-risk; remediation is localized |
| 2/5 | Do not merge | One high-risk accepted finding, or medium-risk findings across multiple subsystems |
| 1/5 | Strongly do not merge | Multiple high-risk accepted findings, or accepted findings spanning consensus/accounting/compatibility classes |

## Calibration Anchors

From the PR #1849 review runs:

- Eight accepted findings including multiple high-risk (upgrade halt, cross-chain accounting loss, indexer correlation breakage) across integration/compatibility/performance → **1/5, "Strongly do not merge"**.
- Zero accepted findings; one non-blocking technical observation (stale generated metadata, recorded as a review comment) → **5/5, "Ready to merge"**, run status `warned`.

## Run Status

- `ready` — zero accepted findings, no observations worth a review comment.
- `warned` — zero accepted findings, but at least one non-blocking observation is reported.
- `issues found` — one or more accepted findings.

## Verdict to Review Type

| Verdict | review_type |
|---------|-------------|
| 5/5, 4/5 | `approve` |
| 3/5 | `comment` |
| 2/5, 1/5 | `request-changes` |

The 4/5 approve carries its follow-ups in the review body; the 3/5 comment states that fixes are expected before merge without formally blocking. This mapping is the only source of `review_type` — it is always computed here and bound explicitly at publish, never derived by the posting operation.
