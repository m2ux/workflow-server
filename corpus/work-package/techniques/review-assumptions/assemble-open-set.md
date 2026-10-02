---
metadata:
  version: 1.1.0
---

## Capability

Judgement-augmentation context over the whole residual open-assumption set, ordered so a stakeholder settles the highest-impact decision first.

## Inputs

### open_assumptions

The residual open assumptions to assemble, each carrying its statement, category and the agent's position. Empty when none remain open.

## Outputs

### assumption_review_presentation

Judgement-augmentation context for every open assumption, each entry on the [Assumptions Log Template](../../resources/assumptions-review.md#assumptions-log-template) field shape.

## Protocol

### 1. Build Each Entry

- Build one entry per member of `{open_assumptions}` on the [Assumptions Log Template](../../resources/assumptions-review.md#assumptions-log-template) field shape, differentiating its decision space on the [Trade-off Dimensions](../../resources/assumptions-review.md#trade-off-dimensions) that meaningfully separate its alternatives

### 2. Order the Set

- Order the entries by decision impact.

### 3. Emit the Presentation

- Emit `{assumption_review_presentation}`
