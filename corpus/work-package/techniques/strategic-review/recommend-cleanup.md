---
metadata:
  version: 1.1.1
---

## Capability

Review-mode cleanup recommendations in the strategic review document — advisory only; source unchanged.

## Inputs

### strategic_review_doc

The strategic review document holding the identified artifacts; read to enumerate them and extended with cleanup recommendations.

## Outputs

### strategic_review_doc

The same strategic review document, extended with a cleanup recommendation per Investigation Artifact, Over-Engineering and Orphaned Infrastructure finding.


## Protocol

### 1. Recommend Cleanup

- For each Investigation Artifact, Over-Engineering and Orphaned Infrastructure finding, record the specific cleanup action it warrants as a recommendation in the `{strategic_review_doc}`; for failing minimality checks, the action follows the "If No" column of the [Minimality Check](../../resources/strategic-review.md#minimality-check).
- The recommendations are the whole product: the source the review judges belongs to its author, so this technique writes no edit to it.
