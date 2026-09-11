---
metadata:
  version: 1.1.0
---

## Capability

Review-mode cleanup recommendations in the strategic review document — advisory only; source unchanged.

## Inputs

### strategic_review_doc

The strategic review document holding the identified artifacts; read to enumerate them and extended with cleanup recommendations.

## Outputs

### strategic_review_doc

The same strategic review document, extended with a cleanup recommendation per identified artifact — investigation artifacts, over-engineering and orphaned infrastructure.


## Protocol

### 1. Recommend Cleanup

- For each identified artifact (investigation artifacts, over-engineering, orphaned infrastructure), record the specific cleanup action it warrants as a recommendation in the `{strategic_review_doc}`; for failing minimality checks, the action follows the "If No" column of the [Minimality Check](../../resources/strategic-review.md#minimality-check).
- The recommendations are the whole product: the source the review judges belongs to its author, so this operation writes no edit to it.
