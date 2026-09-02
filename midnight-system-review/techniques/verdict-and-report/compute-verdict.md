---
metadata:
  version: 1.0.0
---

## Capability

The 1-5 merge-readiness verdict the accepted findings mechanically determine, together with the review type that verdict carries, so publication rests on a stated pair.

## Inputs

### accepted_findings

The accepted subset of the findings register — the only input the verdict may read; observations and dismissed candidates never move it.

## Outputs

### merge_readiness_verdict

The 1-5 verdict per the rubric scale (1 = not merge-ready, 5 = merge-ready).

### review_type

The verdict-derived review action — `approve`, `request-changes`, or `comment` — per the rubric's verdict-to-review-type mapping. Always emitted, whether or not the run publishes.

### verdict_rationale

The rubric lines applied and the accepted findings that drove the verdict — the audit trail from register to score.

## Protocol

### 1. Compute Verdict

- Score `{accepted_findings}` against the [verdict scale](../../resources/verdict-rubric.md#the-scale): apply the scale's level definitions and [calibration anchors](../../resources/verdict-rubric.md#calibration-anchors) to the accepted set's risk/impact and category profile; record which rubric lines fired in `{verdict_rationale}`.
- Compute from the accepted set only. An empty accepted set scores per the rubric's clean-run anchor — observations may be noted in the rationale but never lower the score.

### 2. Derive Review Type

- Map `{merge_readiness_verdict}` to `{review_type}` using the [verdict-to-review-type](../../resources/verdict-rubric.md#verdict-to-review-type) mapping table, and emit both with `{verdict_rationale}`.
