---
metadata:
  version: 1.0.0
---

## Capability

Judgement-augmentation context for the single open assumption under discussion, as an individual drill-down.

## Inputs

### current_assumption

The open assumption under discussion, carrying its statement, category and the agent's position.

## Outputs

### assumption_review_presentation

Judgement-augmentation context for one open assumption on the [Assumptions Log Template](../../resources/assumptions-review.md#assumptions-log-template) field shape, closing with a link to the assumptions log.

## Protocol

### 1. Build the Entry

- Build the entry for `{current_assumption}` on the [Assumptions Log Template](../../resources/assumptions-review.md#assumptions-log-template) field shape, differentiating its decision space on the [Trade-off Dimensions](../../resources/assumptions-review.md#trade-off-dimensions) that meaningfully separate its alternatives

### 2. Emit the Presentation

- Close with a markdown link to the assumptions log and emit `{assumption_review_presentation}`
